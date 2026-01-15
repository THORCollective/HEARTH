#!/usr/bin/env python3
"""
Caching system for HEARTH scripts to improve performance.
"""

import json
import time
import pickle
import hashlib
from pathlib import Path
from typing import Dict, Any, Optional, Union, Callable
from dataclasses import dataclass
from functools import wraps

from logger_config import get_logger
from config_manager import get_config

logger = get_logger()
config = get_config().config


@dataclass
class CacheEntry:
    """Cache entry with metadata."""
    data: Any
    timestamp: float
    hash_key: str
    file_path: Optional[str] = None
    file_mtime: Optional[float] = None

    def is_expired(self, ttl: int) -> bool:
        """Check if entry is expired."""
        return time.time() - self.timestamp > ttl

    def is_file_modified(self) -> bool:
        """Check if source file has been modified."""
        if not self.file_path or not self.file_mtime:
            return False

        try:
            file_path = Path(self.file_path)
            if not file_path.exists():
                return True

            current_mtime = file_path.stat().st_mtime
            return current_mtime != self.file_mtime

        except Exception:
            return True


class CacheManager:
    """Manages in-memory and disk-based caching."""

    def __init__(self, cache_dir: str = ".cache", default_ttl: int = 3600):
        self.cache_dir = Path(cache_dir)
        self.default_ttl = default_ttl
        self.memory_cache: Dict[str, CacheEntry] = {}

        # Create cache directory
        self.cache_dir.mkdir(parents=True, exist_ok=True)

        logger.debug(f"Cache manager initialized with dir: {self.cache_dir}")

    def _generate_cache_key(self, *args, **kwargs) -> str:
        """Generate a cache key from arguments."""
        try:
            # Create a string representation of all arguments
            key_data = {
                'args': [str(arg) for arg in args],
                'kwargs': {k: str(v) for k, v in sorted(kwargs.items())}
            }

            key_string = json.dumps(key_data, sort_keys=True)
            return hashlib.md5(key_string.encode()).hexdigest()

        except Exception as error:
            logger.warning(f"Error generating cache key: {error}")
            return hashlib.md5(str(time.time()).encode()).hexdigest()

    def _get_cache_file_path(self, cache_key: str) -> Path:
        """Get the cache file path for a given key."""
        return self.cache_dir / f"{cache_key}.cache"

    def _load_from_disk(self, cache_key: str) -> Optional[CacheEntry]:
        """Load cache entry from disk."""
        try:
            cache_file = self._get_cache_file_path(cache_key)

            if not cache_file.exists():
                return None

            with open(cache_file, 'rb') as file:
                entry = pickle.load(file)

            logger.debug(f"Loaded cache entry from disk: {cache_key}")
            return entry

        except Exception as error:
            logger.debug(f"Error loading cache from disk: {error}")
            return None

    def _save_to_disk(self, cache_key: str, entry: CacheEntry) -> None:
        """Save cache entry to disk."""
        try:
            cache_file = self._get_cache_file_path(cache_key)

            with open(cache_file, 'wb') as file:
                pickle.dump(entry, file)

            logger.debug(f"Saved cache entry to disk: {cache_key}")

        except Exception as error:
            logger.debug(f"Error saving cache to disk: {error}")

    def get(self, cache_key: str, ttl: Optional[int] = None) -> Optional[Any]:
        """Get cached data by key."""
        ttl = ttl or self.default_ttl

        # Check memory cache first
        if cache_key in self.memory_cache:
            entry = self.memory_cache[cache_key]
        else:
            # Try loading from disk
            entry = self._load_from_disk(cache_key)
            if entry:
                self.memory_cache[cache_key] = entry

        if not entry:
            return None

        # Check if expired
        if entry.is_expired(ttl):
            logger.debug(f"Cache entry expired: {cache_key}")
            self.delete(cache_key)
            return None

        # Check if source file modified
        if entry.is_file_modified():
            logger.debug(f"Source file modified, invalidating cache: {cache_key}")
            self.delete(cache_key)
            return None

        logger.debug(f"Cache hit: {cache_key}")
        return entry.data

    def set(self, cache_key: str, data: Any, file_path: Optional[Union[str, Path]] = None) -> None:
        """Set cached data."""
        try:
            # Get file metadata if path provided
            file_mtime = None
            if file_path:
                file_path_obj = Path(file_path)
                if file_path_obj.exists():
                    file_mtime = file_path_obj.stat().st_mtime

            entry = CacheEntry(
                data=data,
                timestamp=time.time(),
                hash_key=cache_key,
                file_path=str(file_path) if file_path else None,
                file_mtime=file_mtime
            )

            # Store in memory and disk
            self.memory_cache[cache_key] = entry
            self._save_to_disk(cache_key, entry)

            logger.debug(f"Cache set: {cache_key}")

        except Exception as error:
            logger.warning(f"Error setting cache: {error}")

    def delete(self, cache_key: str) -> None:
        """Delete cached data."""
        try:
            # Remove from memory
            if cache_key in self.memory_cache:
                del self.memory_cache[cache_key]

            # Remove from disk
            cache_file = self._get_cache_file_path(cache_key)
            if cache_file.exists():
                cache_file.unlink()

            logger.debug(f"Cache deleted: {cache_key}")

        except Exception as error:
            logger.debug(f"Error deleting cache: {error}")

    def clear_all(self) -> None:
        """Clear all cached data."""
        try:
            # Clear memory cache
            self.memory_cache.clear()

            # Clear disk cache
            for cache_file in self.cache_dir.glob("*.cache"):
                try:
                    cache_file.unlink()
                except Exception as error:
                    logger.debug(f"Error deleting cache file {cache_file}: {error}")

            logger.info("All cache cleared")

        except Exception as error:
            logger.warning(f"Error clearing cache: {error}")


# Global cache manager instance
_cache_manager: Optional[CacheManager] = None


def get_cache_manager() -> CacheManager:
    """Get the global cache manager instance."""
    global _cache_manager
    if _cache_manager is None:
        cache_dir = Path(getattr(config, 'base_directory', '.')) / "cache"
        _cache_manager = CacheManager(str(cache_dir))
    return _cache_manager


def cached(ttl: int = 3600, key_func: Optional[Callable] = None):
    """Decorator for caching function results."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache_manager = get_cache_manager()

            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                cache_key = f"{func.__name__}_{cache_manager._generate_cache_key(*args, **kwargs)}"

            # Try to get from cache
            cached_result = cache_manager.get(cache_key, ttl)
            if cached_result is not None:
                logger.debug(f"Cache hit for {func.__name__}")
                return cached_result

            # Execute function and cache result
            logger.debug(f"Cache miss for {func.__name__}, executing function")
            result = func(*args, **kwargs)

            # Determine if we have a file path for invalidation
            file_path = None
            if args and hasattr(args[0], '__str__') and Path(str(args[0])).exists():
                file_path = str(args[0])

            cache_manager.set(cache_key, result, file_path)
            return result

        return wrapper
    return decorator
