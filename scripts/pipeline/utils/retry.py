"""Retry logic with exponential backoff."""
import time
from typing import Callable, TypeVar, Any
from hearth.utils.logging import get_logger

logger = get_logger()

T = TypeVar('T')


def retry_with_backoff(
    func: Callable[[], T],
    max_attempts: int = 3,
    base_delay: float = 5.0
) -> T:
    """
    Retry function with exponential backoff.

    Delays follow pattern: base_delay * (3 ^ (attempt - 1))
    - Attempt 1 fails → wait base_delay (5s)
    - Attempt 2 fails → wait base_delay * 3 (15s)
    - Attempt 3 fails → wait base_delay * 9 (45s)

    Args:
        func: Function to retry (takes no args, returns T)
        max_attempts: Maximum number of attempts
        base_delay: Base delay in seconds (multiplied exponentially)

    Returns:
        Result from successful function call

    Raises:
        Exception: The last exception if all attempts fail
    """
    last_exception = None

    for attempt in range(1, max_attempts + 1):
        try:
            return func()

        except Exception as e:
            last_exception = e

            if attempt == max_attempts:
                # Final attempt failed - raise exception
                logger.error(f"All {max_attempts} attempts failed")
                raise

            # Calculate exponential delay
            delay = base_delay * (3 ** (attempt - 1))

            logger.warning(
                f"Attempt {attempt}/{max_attempts} failed: {e}. "
                f"Retrying in {delay}s..."
            )

            time.sleep(delay)

    # Should never reach here, but satisfy type checker
    raise last_exception or Exception("Retry failed")
