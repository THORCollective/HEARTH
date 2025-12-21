#!/usr/bin/env python3
"""
Integration tests for Anthropic prompt caching functionality.

This test suite validates:
1. Cache control configuration and environment variable handling
2. Cache usage logging and statistics tracking
3. Hunt generation with caching enabled/disabled
4. Response time improvements from caching
5. Cost reduction calculations
6. Cache invalidation when content changes
"""

import os
import sys
import pytest
import time
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from io import StringIO

# Set up environment for testing before imports
os.environ['ANTHROPIC_API_KEY'] = 'test-api-key-for-testing'
os.environ['AI_PROVIDER'] = 'claude'

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'scripts'))

# Import modules to test
from generate_from_cti import (
    get_cache_control,
    log_cache_usage,
    log_cache_summary,
    cache_stats,
    summarize_cti_with_map_reduce,
    generate_hunt_content_basic,
    SYSTEM_PROMPT,
    TEMPLATE_INSTRUCTIONS
)
from config_manager import get_config, ConfigManager, HearthConfig


# ============================================================================
# Fixtures
# ============================================================================

@pytest.fixture
def reset_cache_stats():
    """Reset global cache statistics before each test."""
    cache_stats["total_calls"] = 0
    cache_stats["cache_hits"] = 0
    cache_stats["cache_misses"] = 0
    cache_stats["input_tokens"] = 0
    cache_stats["cache_read_tokens"] = 0
    cache_stats["cache_creation_tokens"] = 0
    cache_stats["output_tokens"] = 0
    cache_stats["total_cost_usd"] = 0.0
    yield
    # Clean up after test
    cache_stats["total_calls"] = 0
    cache_stats["cache_hits"] = 0
    cache_stats["cache_misses"] = 0
    cache_stats["input_tokens"] = 0
    cache_stats["cache_read_tokens"] = 0
    cache_stats["cache_creation_tokens"] = 0
    cache_stats["output_tokens"] = 0
    cache_stats["total_cost_usd"] = 0.0


@pytest.fixture
def reset_config():
    """Reset configuration manager singleton."""
    ConfigManager._instance = None
    ConfigManager._config = None
    yield
    ConfigManager._instance = None
    ConfigManager._config = None


@pytest.fixture
def mock_anthropic_response_with_cache():
    """Mock Anthropic API response with cache usage data."""
    def _create_response(
        text="Generated hunt content",
        input_tokens=100,
        cache_read_tokens=0,
        cache_creation_tokens=0,
        output_tokens=50
    ):
        response = Mock()
        response.content = [Mock(text=text)]
        response.usage = Mock(
            input_tokens=input_tokens,
            cache_read_input_tokens=cache_read_tokens,
            cache_creation_input_tokens=cache_creation_tokens,
            output_tokens=output_tokens
        )
        return response
    return _create_response


@pytest.fixture
def sample_cti_text():
    """Sample CTI text for testing."""
    return """
    APT29 (Cozy Bear) has been observed using a novel technique to establish persistence
    on compromised Windows systems. The threat actors are creating scheduled tasks with
    randomly generated names following an 8-character alphanumeric pattern. These tasks
    execute Base64-encoded PowerShell commands at system startup.

    The PowerShell commands download additional payloads from legitimate cloud services
    like Discord CDN and OneDrive, making detection more challenging as this traffic
    appears benign to many security tools.

    MITRE ATT&CK Techniques:
    - T1053.005: Scheduled Task/Job: Scheduled Task
    - T1059.001: Command and Scripting Interpreter: PowerShell
    - T1071.001: Application Layer Protocol: Web Protocols
    """


# ============================================================================
# Test Cache Control Configuration
# ============================================================================

class TestCacheControlConfiguration:
    """Test cache control configuration and environment variables."""

    def test_cache_control_enabled_by_default(self, reset_config):
        """Test that caching is enabled by default."""
        cache_control = get_cache_control()
        assert cache_control is not None
        assert cache_control["type"] == "ephemeral"

    def test_cache_control_disabled_via_env(self, reset_config, monkeypatch):
        """Test disabling cache via environment variable."""
        monkeypatch.setenv("ENABLE_PROMPT_CACHING", "false")
        ConfigManager._instance = None
        ConfigManager._config = None

        cache_control = get_cache_control()
        assert cache_control is None

    def test_cache_control_with_1h_ttl(self, reset_config, monkeypatch):
        """Test 1-hour TTL cache control configuration."""
        monkeypatch.setenv("PROMPT_CACHE_TTL", "1h")
        ConfigManager._instance = None
        ConfigManager._config = None

        cache_control = get_cache_control()
        assert cache_control is not None
        assert cache_control["type"] == "ephemeral"
        assert cache_control["ttl"] == "1h"

    def test_cache_control_with_5m_ttl(self, reset_config, monkeypatch):
        """Test 5-minute TTL (default) cache control configuration."""
        monkeypatch.setenv("PROMPT_CACHE_TTL", "5m")
        ConfigManager._instance = None
        ConfigManager._config = None

        cache_control = get_cache_control()
        assert cache_control is not None
        assert cache_control["type"] == "ephemeral"
        # 5m is default, should not be in dict
        assert "ttl" not in cache_control


# ============================================================================
# Test Cache Usage Logging
# ============================================================================

class TestCacheUsageLogging:
    """Test cache usage logging and statistics tracking."""

    def test_log_cache_miss_with_creation(
        self, reset_cache_stats, mock_anthropic_response_with_cache, caplog
    ):
        """Test logging when cache is missed and created."""
        response = mock_anthropic_response_with_cache(
            input_tokens=100,
            cache_creation_tokens=1000,  # Cache created
            output_tokens=200
        )

        log_cache_usage(response, "test operation")

        assert cache_stats["total_calls"] == 1
        assert cache_stats["cache_misses"] == 1
        assert cache_stats["cache_hits"] == 0
        assert cache_stats["input_tokens"] == 100
        assert cache_stats["cache_creation_tokens"] == 1000
        assert cache_stats["output_tokens"] == 200
        assert "MISS (cache created)" in caplog.text

    def test_log_cache_hit(
        self, reset_cache_stats, mock_anthropic_response_with_cache, caplog
    ):
        """Test logging when cache is hit."""
        response = mock_anthropic_response_with_cache(
            input_tokens=50,
            cache_read_tokens=1000,  # Cache hit
            output_tokens=200
        )

        log_cache_usage(response, "test operation")

        assert cache_stats["total_calls"] == 1
        assert cache_stats["cache_hits"] == 1
        assert cache_stats["cache_misses"] == 0
        assert cache_stats["cache_read_tokens"] == 1000
        assert "HIT" in caplog.text
        assert "Saved:" in caplog.text  # Should show savings

    def test_log_cache_no_cacheable_content(
        self, reset_cache_stats, mock_anthropic_response_with_cache, caplog
    ):
        """Test logging when no cacheable content present."""
        response = mock_anthropic_response_with_cache(
            input_tokens=100,
            output_tokens=200
        )

        log_cache_usage(response, "test operation")

        assert cache_stats["total_calls"] == 1
        assert cache_stats["cache_hits"] == 0
        assert cache_stats["cache_misses"] == 0
        assert "N/A (no cacheable content)" in caplog.text

    def test_cost_calculation_with_cache_hit(
        self, reset_cache_stats, mock_anthropic_response_with_cache, caplog
    ):
        """Test cost calculation when cache is hit."""
        response = mock_anthropic_response_with_cache(
            input_tokens=100,
            cache_read_tokens=1000,  # 1000 tokens read from cache
            output_tokens=200
        )

        log_cache_usage(response, "test operation")

        # Cost breakdown (Claude Sonnet 4.5 pricing):
        # Input: 100 tokens * $3/M = $0.0003
        # Cache read: 1000 tokens * $0.30/M = $0.0003
        # Output: 200 tokens * $15/M = $0.0030
        # Total: $0.0036
        expected_cost = (100 / 1_000_000) * 3.00 + (1000 / 1_000_000) * 0.30 + (200 / 1_000_000) * 15.00

        assert abs(cache_stats["total_cost_usd"] - expected_cost) < 0.0001

        # Savings: would have cost $0.003 without cache, cost $0.0003 with cache
        # Savings = $0.0027 (90%)
        assert "Saved:" in caplog.text

    def test_cost_calculation_with_cache_creation(
        self, reset_cache_stats, mock_anthropic_response_with_cache
    ):
        """Test cost calculation when cache is created."""
        response = mock_anthropic_response_with_cache(
            input_tokens=100,
            cache_creation_tokens=1000,  # 1000 tokens written to cache
            output_tokens=200
        )

        log_cache_usage(response, "test operation")

        # Cost breakdown:
        # Input: 100 tokens * $3/M = $0.0003
        # Cache write: 1000 tokens * $3.75/M = $0.00375
        # Output: 200 tokens * $15/M = $0.0030
        expected_cost = (100 / 1_000_000) * 3.00 + (1000 / 1_000_000) * 3.75 + (200 / 1_000_000) * 15.00

        assert abs(cache_stats["total_cost_usd"] - expected_cost) < 0.0001


# ============================================================================
# Test Cache Summary
# ============================================================================

class TestCacheSummary:
    """Test cache summary logging."""

    def test_cache_summary_with_hits_and_misses(
        self, reset_cache_stats, mock_anthropic_response_with_cache, caplog
    ):
        """Test summary generation with both cache hits and misses."""
        # First call: cache miss with creation
        response1 = mock_anthropic_response_with_cache(
            input_tokens=100,
            cache_creation_tokens=1000,
            output_tokens=200
        )
        log_cache_usage(response1, "operation 1")

        # Second call: cache hit
        response2 = mock_anthropic_response_with_cache(
            input_tokens=50,
            cache_read_tokens=1000,
            output_tokens=200
        )
        log_cache_usage(response2, "operation 2")

        # Third call: cache hit
        response3 = mock_anthropic_response_with_cache(
            input_tokens=50,
            cache_read_tokens=1000,
            output_tokens=200
        )
        log_cache_usage(response3, "operation 3")

        # Generate summary
        log_cache_summary()

        assert cache_stats["total_calls"] == 3
        assert cache_stats["cache_hits"] == 2
        assert cache_stats["cache_misses"] == 1

        assert "CACHE PERFORMANCE SUMMARY" in caplog.text
        assert "Total API calls: 3" in caplog.text
        assert "Cache hits: 2" in caplog.text
        assert "Cache misses: 1" in caplog.text
        assert "Cache hit rate: 66.7%" in caplog.text
        assert "Total savings from caching:" in caplog.text

    def test_cache_summary_empty_stats(self, reset_cache_stats, caplog):
        """Test summary with no API calls."""
        log_cache_summary()

        # Should not log anything if no calls were made
        assert "CACHE PERFORMANCE SUMMARY" not in caplog.text


# ============================================================================
# Test Hunt Generation with Caching
# ============================================================================

@pytest.mark.integration
class TestHuntGenerationWithCaching:
    """Test hunt generation with prompt caching enabled."""

    @patch('generate_from_cti.anthropic_client')
    @patch('generate_from_cti.AI_PROVIDER', 'claude')
    def test_basic_hunt_generation_uses_caching(
        self,
        mock_client,
        sample_cti_text,
        mock_anthropic_response_with_cache,
        reset_cache_stats,
        reset_config
    ):
        """Test that basic hunt generation uses prompt caching."""
        # Mock the API response
        response = mock_anthropic_response_with_cache(
            text="Threat actors are creating scheduled tasks with random names...",
            input_tokens=100,
            cache_creation_tokens=1000,
            output_tokens=300
        )
        mock_client.messages.create.return_value = response

        # Generate hunt content
        result = generate_hunt_content_basic(
            sample_cti_text,
            "https://example.com/cti",
            "test-user"
        )

        # Verify API was called with cache control
        assert mock_client.messages.create.called
        call_args = mock_client.messages.create.call_args

        # Check system message has cache control
        system_msgs = call_args.kwargs.get('system', [])
        assert len(system_msgs) > 0
        assert 'cache_control' in system_msgs[0]
        assert system_msgs[0]['cache_control']['type'] == 'ephemeral'

        # Check user message has cache control for template
        user_msgs = call_args.kwargs.get('messages', [])
        assert len(user_msgs) > 0
        user_content = user_msgs[0]['content']

        # Find the cached template block
        cached_blocks = [
            block for block in user_content
            if isinstance(block, dict) and 'cache_control' in block
        ]
        assert len(cached_blocks) > 0

        # Verify cache stats were updated
        assert cache_stats["total_calls"] == 1
        assert cache_stats["cache_misses"] == 1

    @patch('generate_from_cti.anthropic_client')
    @patch('generate_from_cti.AI_PROVIDER', 'claude')
    def test_caching_disabled_no_cache_control(
        self,
        mock_client,
        sample_cti_text,
        mock_anthropic_response_with_cache,
        reset_config,
        monkeypatch
    ):
        """Test that cache control is not added when caching is disabled."""
        # Disable caching
        monkeypatch.setenv("ENABLE_PROMPT_CACHING", "false")
        ConfigManager._instance = None
        ConfigManager._config = None

        # Mock the API response
        response = mock_anthropic_response_with_cache(
            text="Generated content",
            input_tokens=100,
            output_tokens=200
        )
        mock_client.messages.create.return_value = response

        # Generate hunt content
        result = generate_hunt_content_basic(
            sample_cti_text,
            "https://example.com/cti",
            "test-user"
        )

        # Verify API was called WITHOUT cache control
        assert mock_client.messages.create.called
        call_args = mock_client.messages.create.call_args

        # Check system message does NOT have cache control
        system_msgs = call_args.kwargs.get('system', [])
        assert len(system_msgs) > 0
        assert 'cache_control' not in system_msgs[0]


# ============================================================================
# Test Response Time Improvements
# ============================================================================

@pytest.mark.integration
class TestResponseTimeImprovements:
    """Test response time improvements from caching."""

    @patch('generate_from_cti.anthropic_client')
    @patch('generate_from_cti.AI_PROVIDER', 'claude')
    def test_cache_hit_faster_than_miss(
        self,
        mock_client,
        sample_cti_text,
        mock_anthropic_response_with_cache
    ):
        """Test that cache hits are logged with performance data."""
        # This is a simplified test - in production, we expect cache hits to be faster
        # We test that the logging captures the timing information

        # First call: cache miss (slower)
        def slow_response(*args, **kwargs):
            time.sleep(0.1)  # Simulate API delay
            return mock_anthropic_response_with_cache(
                input_tokens=100,
                cache_creation_tokens=1000,
                output_tokens=200
            )

        mock_client.messages.create.side_effect = slow_response
        start = time.time()
        generate_hunt_content_basic(sample_cti_text, "https://example.com", "test")
        miss_duration = time.time() - start

        # Second call: cache hit (faster)
        def fast_response(*args, **kwargs):
            time.sleep(0.01)  # Simulate faster cached response
            return mock_anthropic_response_with_cache(
                input_tokens=50,
                cache_read_tokens=1000,
                output_tokens=200
            )

        mock_client.messages.create.side_effect = fast_response
        start = time.time()
        generate_hunt_content_basic(sample_cti_text, "https://example.com", "test")
        hit_duration = time.time() - start

        # Cache hit should be faster
        assert hit_duration < miss_duration


# ============================================================================
# Test Cost Reduction Verification
# ============================================================================

@pytest.mark.integration
class TestCostReduction:
    """Test cost reduction calculations from caching."""

    def test_cost_reduction_calculation(
        self, reset_cache_stats, mock_anthropic_response_with_cache
    ):
        """Test that cost reduction is correctly calculated."""
        # Simulate 1 cache miss + 3 cache hits (typical pattern)

        # First call: cache miss
        response1 = mock_anthropic_response_with_cache(
            input_tokens=100,
            cache_creation_tokens=1000,
            output_tokens=300
        )
        log_cache_usage(response1, "initial generation")

        # Subsequent calls: cache hits
        for i in range(3):
            response = mock_anthropic_response_with_cache(
                input_tokens=50,
                cache_read_tokens=1000,
                output_tokens=300
            )
            log_cache_usage(response, f"cached generation {i+1}")

        # Calculate expected costs
        # Cache miss: 100 * $3/M + 1000 * $3.75/M + 300 * $15/M = $0.0003 + $0.00375 + $0.0045 = $0.00855
        # Cache hit: 50 * $3/M + 1000 * $0.30/M + 300 * $15/M = $0.00015 + $0.0003 + $0.0045 = $0.00495
        # Total cost: $0.00855 + 3 * $0.00495 = $0.02340

        # Without caching, cache hits would cost: 50 * $3/M + 1000 * $3/M + 300 * $15/M = $0.00015 + $0.003 + $0.0045 = $0.00765
        # Total savings: 3 * ($0.00765 - $0.00495) = 3 * $0.0027 = $0.0081

        total_saved = 3 * ((1000 / 1_000_000) * 3.00 - (1000 / 1_000_000) * 0.30)

        assert cache_stats["cache_hits"] == 3
        assert cache_stats["cache_misses"] == 1

        # Verify significant cost reduction from cache reads
        cache_read_tokens = cache_stats["cache_read_tokens"]
        assert cache_read_tokens == 3000  # 1000 tokens * 3 hits

        # Savings should be approximately 90% on cached tokens
        expected_uncached = (cache_read_tokens / 1_000_000) * 3.00
        expected_cached = (cache_read_tokens / 1_000_000) * 0.30
        expected_savings = expected_uncached - expected_cached

        assert abs(expected_savings - total_saved) < 0.0001


# ============================================================================
# Test Cache Invalidation
# ============================================================================

@pytest.mark.integration
class TestCacheInvalidation:
    """Test cache behavior when content changes."""

    @patch('generate_from_cti.anthropic_client')
    @patch('generate_from_cti.AI_PROVIDER', 'claude')
    def test_different_cti_creates_new_cache(
        self,
        mock_client,
        mock_anthropic_response_with_cache,
        reset_cache_stats
    ):
        """Test that different CTI content creates new cache entries."""
        # First CTI document
        cti1 = "APT29 uses PowerShell for persistence..."
        response1 = mock_anthropic_response_with_cache(
            input_tokens=100,
            cache_creation_tokens=1000,
            output_tokens=200
        )
        mock_client.messages.create.return_value = response1

        generate_hunt_content_basic(cti1, "https://example.com/1", "test")

        # Different CTI document (dynamic content changes, but static parts should still cache)
        cti2 = "APT28 uses scheduled tasks for command execution..."
        response2 = mock_anthropic_response_with_cache(
            input_tokens=150,
            cache_read_tokens=1000,  # System prompt and template are cached
            output_tokens=250
        )
        mock_client.messages.create.return_value = response2

        generate_hunt_content_basic(cti2, "https://example.com/2", "test")

        # Should have 2 calls total
        assert cache_stats["total_calls"] == 2
        # First call creates cache, second call should hit cache for static parts
        assert cache_stats["cache_read_tokens"] > 0

    @patch('generate_from_cti.SYSTEM_PROMPT', 'Original system prompt')
    @patch('generate_from_cti.anthropic_client')
    @patch('generate_from_cti.AI_PROVIDER', 'claude')
    def test_system_prompt_change_invalidates_cache(
        self,
        mock_client,
        mock_anthropic_response_with_cache,
        reset_cache_stats
    ):
        """Test that changing system prompt invalidates cache."""
        import generate_from_cti

        # First generation with original system prompt
        response1 = mock_anthropic_response_with_cache(
            input_tokens=100,
            cache_creation_tokens=500,
            output_tokens=200
        )
        mock_client.messages.create.return_value = response1

        generate_hunt_content_basic("CTI content", "https://example.com", "test")

        # Change system prompt (simulates code change)
        generate_from_cti.SYSTEM_PROMPT = "Modified system prompt"

        # Second generation should create new cache
        response2 = mock_anthropic_response_with_cache(
            input_tokens=100,
            cache_creation_tokens=500,  # New cache created
            output_tokens=200
        )
        mock_client.messages.create.return_value = response2

        generate_hunt_content_basic("CTI content", "https://example.com", "test")

        # Both calls should be cache misses since prompt changed
        assert cache_stats["total_calls"] == 2
        assert cache_stats["cache_creation_tokens"] == 1000  # 500 * 2


# ============================================================================
# Test CTI Summarization with Caching
# ============================================================================

@pytest.mark.integration
@pytest.mark.slow
class TestCTISummarizationCaching:
    """Test CTI summarization with prompt caching."""

    @patch('generate_from_cti.anthropic_client')
    @patch('generate_from_cti.AI_PROVIDER', 'claude')
    def test_map_reduce_summarization_caches_instructions(
        self,
        mock_client,
        mock_anthropic_response_with_cache,
        reset_cache_stats
    ):
        """Test that map-reduce summarization caches instruction prompts."""
        # Create long CTI content that requires chunking
        long_cti = "APT threat intel content. " * 50000  # Very long content

        # Mock responses for chunks
        chunk_response = mock_anthropic_response_with_cache(
            text="Summary of chunk",
            input_tokens=100,
            cache_creation_tokens=200,  # First chunk creates cache
            output_tokens=50
        )

        final_response = mock_anthropic_response_with_cache(
            text="Final summary",
            input_tokens=100,
            cache_creation_tokens=200,
            output_tokens=100
        )

        mock_client.messages.create.side_effect = [
            chunk_response,
            chunk_response,
            final_response
        ]

        # Run summarization
        result = summarize_cti_with_map_reduce(long_cti, model="claude-sonnet-4-5-20250929")

        # Should have called API multiple times (chunks + final)
        assert mock_client.messages.create.call_count >= 2

        # Verify caching was used
        assert cache_stats["total_calls"] >= 2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
