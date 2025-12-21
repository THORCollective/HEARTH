# HEARTH Test Suite

This directory contains the test infrastructure for the HEARTH project, organized into unit and integration tests with comprehensive fixtures and utilities.

## Directory Structure

```
tests/
├── conftest.py              # Pytest configuration and shared fixtures
├── fixtures/                # Test data and mock files
│   ├── sample_flame.md      # Sample FLAME hunt template
│   ├── sample_ember.md      # Sample EMBER hunt template
│   ├── sample_alchemy.md    # Sample ALCHEMY hunt template
│   ├── sample_cti_article.txt   # Comprehensive CTI report
│   ├── sample_cti_short.txt     # Brief CTI alert
│   └── mock_mitre_attack.json   # Mock MITRE ATT&CK data
├── unit/                    # Unit tests for individual components
│   ├── test_core_similarity.py
│   ├── test_duplicate_detector.py
│   ├── test_hunt_parser.py
│   ├── test_similarity_detection.py
│   ├── test_simple_similarity.py
│   └── test_runner.py
└── integration/             # Integration tests for workflows
    ├── test_database_performance.py
    ├── test_duplicate_detection.py
    ├── test_generation_integration.py
    ├── test_integration_simple.py
    ├── test_ttp_diversity_full.py
    └── test_user_feedback.py
```

## Running Tests

### Prerequisites

Ensure you have the required dependencies installed:

```bash
pip install -r requirements.txt
```

This will install pytest, pytest-cov, and all other dependencies needed for testing.

### Running All Tests

```bash
# Using pytest directly
pytest tests/

# Or using npm script
npm test
```

### Running Specific Test Suites

```bash
# Unit tests only
pytest tests/unit/
# or
npm run test:unit

# Integration tests only
pytest tests/integration/
# or
npm run test:integration

# Specific test file
pytest tests/unit/test_hunt_parser.py

# Specific test function
pytest tests/unit/test_hunt_parser.py::test_parse_flame_hunt
```

### Running with Coverage

```bash
# Generate coverage report
pytest --cov=scripts tests/

# Or using npm script
npm run test:coverage

# Generate HTML coverage report
pytest --cov=scripts --cov-report=html tests/
# Then open htmlcov/index.html in a browser
```

### Running with Verbosity

```bash
# Show all test output
pytest tests/ -v

# Show even more detail
pytest tests/ -vv

# Show print statements
pytest tests/ -s
```

## Test Fixtures

The `tests/fixtures/` directory contains sample data for testing:

- **Hunt Templates**: Sample FLAME, EMBER, and ALCHEMY hunt files with realistic content
- **CTI Content**: Sample cyber threat intelligence reports and alerts
- **MITRE ATT&CK Data**: Mock data covering 22 common techniques and tactics

These fixtures are automatically loaded via pytest fixtures defined in `conftest.py`.

## Shared Test Utilities

The `conftest.py` file provides:

- **Fixtures**: Pre-loaded test data from fixtures directory
- **Helper Functions**: Common validation and assertion utilities
- **Mock Creators**: Functions to generate test data on-the-fly
- **Temporary File Utilities**: Create and cleanup temp test files

### Available Fixtures

```python
def test_example(sample_flame_hunt, sample_cti_article):
    """
    Available fixtures:
    - sample_flame_hunt: Content of sample_flame.md
    - sample_ember_hunt: Content of sample_ember.md
    - sample_alchemy_hunt: Content of sample_alchemy.md
    - sample_cti_article: Comprehensive CTI report
    - sample_cti_short: Brief CTI alert
    - mock_mitre_data: Mock MITRE ATT&CK techniques/tactics
    - temp_test_dir: Temporary directory (auto-cleaned)
    """
    pass
```

## Writing New Tests

### Unit Tests

Unit tests should test individual functions or classes in isolation. Place them in `tests/unit/`:

```python
# tests/unit/test_my_module.py
import pytest
from scripts.my_module import my_function

def test_my_function_basic():
    """Test basic functionality of my_function."""
    result = my_function("input")
    assert result == "expected_output"

def test_my_function_edge_case():
    """Test edge case handling."""
    with pytest.raises(ValueError):
        my_function(None)
```

### Integration Tests

Integration tests should test workflows and interactions between components. Place them in `tests/integration/`:

```python
# tests/integration/test_my_workflow.py
import pytest
from scripts.module_a import function_a
from scripts.module_b import function_b

def test_complete_workflow(sample_cti_article, temp_test_dir):
    """Test full workflow from CTI to hunt generation."""
    # Test the complete flow
    intermediate = function_a(sample_cti_article)
    result = function_b(intermediate, temp_test_dir)

    assert result is not None
    assert len(result) > 0
```

### Best Practices

1. **Naming**: Use descriptive test names with `test_` prefix
2. **Documentation**: Add docstrings explaining what each test verifies
3. **Isolation**: Tests should not depend on execution order
4. **Fixtures**: Use shared fixtures from `conftest.py` when possible
5. **Assertions**: Make assertions specific and meaningful
6. **Coverage**: Aim for high coverage but focus on meaningful tests
7. **Speed**: Keep unit tests fast; integration tests can be slower

## Continuous Integration

Tests run automatically on GitHub Actions for:

- **Push events** to `main`, `develop`, and `refactor/*` branches
- **Pull requests** targeting `main` or `develop`

The CI pipeline:
1. Runs on Python 3.9, 3.10, and 3.11
2. Executes unit tests separately
3. Executes integration tests separately
4. Generates coverage reports
5. Uploads coverage to Codecov
6. Runs linting checks (flake8)

See `.github/workflows/tests.yml` for configuration details.

## Troubleshooting

### Import Errors

If you encounter import errors, ensure:
1. You're running pytest from the project root directory
2. The `scripts/` directory is in your Python path
3. All dependencies are installed via `pip install -r requirements.txt`

### Fixture Not Found

If a fixture is not found:
1. Check that `conftest.py` defines the fixture
2. Ensure the fixture file exists in `tests/fixtures/`
3. Verify the fixture name matches the parameter name

### Slow Tests

If tests are running slowly:
1. Run only unit tests during development: `pytest tests/unit/`
2. Use `-k` to run specific tests: `pytest -k test_name`
3. Consider marking slow tests with `@pytest.mark.slow` and skip them during development

## Contributing

When adding new functionality:

1. **Write tests first** (TDD approach recommended)
2. **Add unit tests** for individual functions
3. **Add integration tests** if the feature involves multiple components
4. **Update fixtures** if new test data is needed
5. **Run full test suite** before committing: `pytest tests/`
6. **Check coverage**: `pytest --cov=scripts tests/`

Target minimum 70% code coverage for new code.
