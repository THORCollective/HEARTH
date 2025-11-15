#!/usr/bin/env python3
"""
Caching system for HEARTH operations to improve performance.
"""

import hashlib
import json
import pickle
import time
from pathlib import Path
from typing import Any, Dict, Optional, Union, Callable
from dataclasses import dataclass
from functools import wraps

from logger_config import get_logger
from config_manager import get_config

logger = get_logger()
config = get_config().config


@dataclass
class CacheEntry:
    """Represents a cached entry with metadata."""

    data: Any
    timestamp: float
    hash_key: str
    file_path: Optional[str] = None
    file_mtime: Optional[float] = None

    def is_expired(self, ttl_seconds: int) -> bool:
        """Check if cache entry has expired."""
        return time.time() - self.timestamp > ttl_seconds

    def is_file_modified(self) -> bool:
        """Check if source file has been modified since caching."""
        if not self.file_path:
            return False

        try:
            file_path = Path(self.file_path)
            if not file_path.exists():
                return True  # File deleted, consider modified

            current_mtime = file_path.stat().st_mtime
            return current_mtime != self.file_mtime

        except Exception as error:
            logger.debug(f"Error checking file modification: {error}")
            return True  # Assume modified on error


class CacheManager:
    """Manages file-based caching for HEARTH operations."""

    def __init__(self, cache_dir: Optional[str] = None, default_ttl: int = 3600):
        self.cache_dir = Path(cache_dir or "cache")
        self.default_ttl = default_ttl
        self.memory_cache: Dict[str, CacheEntry] = {}

        # Ensure cache directory exists
        self.cache_dir.mkdir(exist_ok=True)

        logger.debug(f"Cache manager initialized with dir: {self.cache_dir}")

    def _generate_cache_key(self, *args, **kwargs) -> str:
        """Generate a cache key from arguments."""
        try: \n            # Create a string representation of all arguments\n            key_data = {\n                'args': [str(arg) for arg in args],\n                'kwargs': {k: str(v) for k, v in sorted(kwargs.items())}\n            }\n            \n            key_string = json.dumps(key_data, sort_keys=True)\n            return hashlib.md5(key_string.encode()).hexdigest()\n            \n        except Exception as error:\n            logger.warning(f\"Error generating cache key: {error}\")\n            return hashlib.md5(str(time.time()).encode()).hexdigest()\n    \n    def _get_cache_file_path(self, cache_key: str) -> Path:\n        \"\"\"Get the cache file path for a given key.\"\"\"\n        return self.cache_dir / f\"{cache_key}.cache\"\n    \n    def _load_from_disk(self, cache_key: str) -> Optional[CacheEntry]:\n        \"\"\"Load cache entry from disk.\"\"\"\n        try:\n            cache_file = self._get_cache_file_path(cache_key)\n            \n            if not cache_file.exists():\n                return None\n            \n            with open(cache_file, 'rb') as file:\n                entry = pickle.load(file)\n            \n            logger.debug(f\"Loaded cache entry from disk: {cache_key}\")\n            return entry\n            \n        except Exception as error:\n            logger.debug(f\"Error loading cache from disk: {error}\")\n            return None\n    \n    def _save_to_disk(self, cache_key: str, entry: CacheEntry) -> None:\n        \"\"\"Save cache entry to disk.\"\"\"\n        try:\n            cache_file = self._get_cache_file_path(cache_key)\n            \n            with open(cache_file, 'wb') as file:\n                pickle.dump(entry, file)\n            \n            logger.debug(f\"Saved cache entry to disk: {cache_key}\")\n            \n        except Exception as error:\n            logger.debug(f\"Error saving cache to disk: {error}\")\n    \n    def get(self, cache_key: str, ttl: Optional[int] = None) -> Optional[Any]:\n        \"\"\"Get cached data by key.\n        \n        Args:\n            cache_key: The cache key.\n            ttl: Time to live in seconds. Uses default if not specified.\n            \n        Returns:\n            Cached data or None if not found/expired.\n        \"\"\"\n        ttl = ttl or self.default_ttl\n        \n        # Check memory cache first\n        if cache_key in self.memory_cache:\n            entry = self.memory_cache[cache_key]\n        else:\n            # Try loading from disk\n            entry = self._load_from_disk(cache_key)\n            if entry:\n                self.memory_cache[cache_key] = entry\n        \n        if not entry:\n            return None\n        \n        # Check if expired\n        if entry.is_expired(ttl):\n            logger.debug(f\"Cache entry expired: {cache_key}\")\n            self.delete(cache_key)\n            return None\n        \n        # Check if source file modified\n        if entry.is_file_modified():\n            logger.debug(f\"Source file modified, invalidating cache: {cache_key}\")\n            self.delete(cache_key)\n            return None\n        \n        logger.debug(f\"Cache hit: {cache_key}\")\n        return entry.data\n    \n    def set(self, cache_key: str, data: Any, file_path: Optional[Union[str, Path]] = None) -> None:\n        \"\"\"Set cached data.\n        \n        Args:\n            cache_key: The cache key.\n            data: Data to cache.\n            file_path: Optional source file path for invalidation checking.\n        \"\"\"\n        try:\n            # Get file metadata if path provided\n            file_mtime = None\n            if file_path:\n                file_path_obj = Path(file_path)\n                if file_path_obj.exists():\n                    file_mtime = file_path_obj.stat().st_mtime\n            \n            entry = CacheEntry(\n                data=data,\n                timestamp=time.time(),\n                hash_key=cache_key,\n                file_path=str(file_path) if file_path else None,\n                file_mtime=file_mtime\n            )\n            \n            # Store in memory and disk\n            self.memory_cache[cache_key] = entry\n            self._save_to_disk(cache_key, entry)\n            \n            logger.debug(f\"Cache set: {cache_key}\")\n            \n        except Exception as error:\n            logger.warning(f\"Error setting cache: {error}\")\n    \n    def delete(self, cache_key: str) -> None:\n        \"\"\"Delete cached data.\"\"\"\n        try:\n            # Remove from memory\n            if cache_key in self.memory_cache:\n                del self.memory_cache[cache_key]\n            \n            # Remove from disk\n            cache_file = self._get_cache_file_path(cache_key)\n            if cache_file.exists():\n                cache_file.unlink()\n            \n            logger.debug(f\"Cache deleted: {cache_key}\")\n            \n        except Exception as error:\n            logger.debug(f\"Error deleting cache: {error}\")\n    \n    def clear_all(self) -> None:\n        \"\"\"Clear all cached data.\"\"\"\n        try:\n            # Clear memory cache\n            self.memory_cache.clear()\n            \n            # Clear disk cache\n            for cache_file in self.cache_dir.glob(\"*.cache\"):\n                try:\n                    cache_file.unlink()\n                except Exception as error:\n                    logger.debug(f\"Error deleting cache file {cache_file}: {error}\")\n            \n            logger.info(\"All cache cleared\")\n            \n        except Exception as error:\n            logger.warning(f\"Error clearing cache: {error}\")\n    \n    def cleanup_expired(self, ttl: Optional[int] = None) -> int:\n        \"\"\"Clean up expired cache entries.\n        \n        Args:\n            ttl: Time to live in seconds. Uses default if not specified.\n            \n        Returns:\n            Number of entries cleaned up.\n        \"\"\"\n        ttl = ttl or self.default_ttl\n        cleaned_count = 0\n        \n        try:\n            # Clean memory cache\n            expired_keys = [\n                key for key, entry in self.memory_cache.items()\n                if entry.is_expired(ttl) or entry.is_file_modified()\n            ]\n            \n            for key in expired_keys:\n                self.delete(key)\n                cleaned_count += 1\n            \n            # Clean disk cache\n            for cache_file in self.cache_dir.glob(\"*.cache\"):\n                try:\n                    entry = self._load_from_disk(cache_file.stem)\n                    if entry and (entry.is_expired(ttl) or entry.is_file_modified()):\n                        cache_file.unlink()\n                        cleaned_count += 1\n                except Exception as error:\n                    logger.debug(f\"Error checking cache file {cache_file}: {error}\")\n            \n            if cleaned_count > 0:\n                logger.info(f\"Cleaned up {cleaned_count} expired cache entries\")\n            \n            return cleaned_count\n            \n        except Exception as error:\n            logger.warning(f\"Error during cache cleanup: {error}\")\n            return 0\n    \n    def get_cache_stats(self) -> Dict[str, Any]:\n        \"\"\"Get cache statistics.\"\"\"\n        try:\n            disk_files = list(self.cache_dir.glob(\"*.cache\"))\n            total_size = sum(f.stat().st_size for f in disk_files if f.exists())\n            \n            return {\n                'memory_entries': len(self.memory_cache),\n                'disk_entries': len(disk_files),\n                'total_size_bytes': total_size,\n                'cache_dir': str(self.cache_dir)\n            }\n            \n        except Exception as error:\n            logger.warning(f\"Error getting cache stats: {error}\")\n            return {}\n\n\n# Global cache manager instance\n_cache_manager: Optional[CacheManager] = None\n\n\ndef get_cache_manager() -> CacheManager:\n    \"\"\"Get the global cache manager instance.\"\"\"\n    global _cache_manager\n    if _cache_manager is None:\n        cache_dir = Path(config.base_directory) / \"cache\"\n        _cache_manager = CacheManager(str(cache_dir))\n    return _cache_manager\n\n\ndef cached(ttl: int = 3600, key_func: Optional[Callable] = None):\n    \"\"\"Decorator for caching function results.\n    \n    Args:\n        ttl: Time to live in seconds.\n        key_func: Optional function to generate cache key from arguments.\n    \"\"\"\n    def decorator(func: Callable) -> Callable:\n        @wraps(func)\n        def wrapper(*args, **kwargs):\n            cache_manager = get_cache_manager()\n            \n            # Generate cache key\n            if key_func:\n                cache_key = key_func(*args, **kwargs)\n            else:\n                cache_key = f\"{func.__name__}_{cache_manager._generate_cache_key(*args, **kwargs)}\"\n            \n            # Try to get from cache\n            cached_result = cache_manager.get(cache_key, ttl)\n            if cached_result is not None:\n                logger.debug(f\"Cache hit for {func.__name__}\")\n                return cached_result\n            \n            # Execute function and cache result\n            logger.debug(f\"Cache miss for {func.__name__}, executing function\")\n            result = func(*args, **kwargs)\n            \n            # Determine if we have a file path for invalidation\n            file_path = None\n            if args and hasattr(args[0], '__str__') and Path(str(args[0])).exists():\n                file_path = str(args[0])\n            \n            cache_manager.set(cache_key, result, file_path)\n            return result\n        \n        return wrapper\n    return decorator
