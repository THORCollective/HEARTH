"""Tests for retry logic with exponential backoff."""
import pytest
import time
from unittest.mock import Mock
from scripts.pipeline.utils.retry import retry_with_backoff


def test_retry_succeeds_on_first_attempt():
    """When function succeeds immediately, return result."""
    func = Mock(return_value="success")

    result = retry_with_backoff(func, max_attempts=3, base_delay=0.01)

    assert result == "success"
    assert func.call_count == 1


def test_retry_succeeds_on_second_attempt():
    """When function fails then succeeds, retry and return result."""
    func = Mock(side_effect=[Exception("fail"), "success"])

    result = retry_with_backoff(func, max_attempts=3, base_delay=0.01)

    assert result == "success"
    assert func.call_count == 2


def test_retry_raises_after_max_attempts():
    """When all attempts fail, raise the last exception."""
    func = Mock(side_effect=Exception("always fail"))

    with pytest.raises(Exception, match="always fail"):
        retry_with_backoff(func, max_attempts=3, base_delay=0.01)

    assert func.call_count == 3


def test_retry_uses_exponential_backoff():
    """Verify delays increase exponentially (base_delay * 3^attempt)."""
    attempts = []

    def failing_func():
        attempts.append(time.time())
        raise Exception("fail")

    try:
        retry_with_backoff(failing_func, max_attempts=3, base_delay=0.1)
    except Exception:
        pass

    # Should have 3 attempts
    assert len(attempts) == 3

    # Calculate delays (time between attempts)
    if len(attempts) >= 3:
        delay1 = attempts[1] - attempts[0]
        delay2 = attempts[2] - attempts[1]

        # First delay ~0.1s (base_delay * 3^0)
        assert 0.08 < delay1 < 0.15

        # Second delay ~0.3s (base_delay * 3^1)
        assert 0.25 < delay2 < 0.40
