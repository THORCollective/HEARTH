# Phase 04: Test Infrastructure Organization

This phase organizes the 23 scattered test files into a proper test suite with a test runner.

## Current State
- 23 test files scattered in `scripts/` directory
- No test organization or hierarchy
- No test runner configured
- No CI/CD test execution

## Tasks

### Create Test Directory Structure
- [ ] Create `tests/` directory in project root
- [ ] Create `tests/unit/` subdirectory for unit tests
- [ ] Create `tests/integration/` subdirectory for integration tests
- [ ] Create `tests/fixtures/` subdirectory for test data
- [ ] Create `tests/conftest.py` for pytest configuration

### Organize Existing Tests
- [ ] Identify all test files in `scripts/` directory
- [ ] Categorize tests as unit vs integration tests
- [ ] Move unit tests to `tests/unit/` with proper naming (`test_*.py`)
- [ ] Move integration tests to `tests/integration/`
- [ ] Update import paths in moved test files
- [ ] Delete any obsolete or redundant test files

### Create Test Fixtures
- [ ] Create sample hunt markdown files in `tests/fixtures/`
- [ ] Create sample CTI content for testing
- [ ] Create mock MITRE ATT&CK data if needed
- [ ] Create shared test utilities in `tests/conftest.py`

### Configure Test Runner
- [ ] Add pytest to `requirements.txt` if not present
- [ ] Add pytest-cov for coverage reporting
- [ ] Create `pytest.ini` configuration file
- [ ] Configure test discovery patterns
- [ ] Set up coverage reporting

### Update Package Configuration
- [ ] Update `package.json` to add test scripts:
  - `"test": "pytest tests/"`
  - `"test:unit": "pytest tests/unit/"`
  - `"test:integration": "pytest tests/integration/"`
  - `"test:coverage": "pytest --cov=scripts tests/"`

### Create GitHub Actions Workflow
- [ ] Create `.github/workflows/tests.yml` for automated testing
- [ ] Configure workflow to run on push and pull requests
- [ ] Set up test execution with coverage reporting
- [ ] Add status badge to README if desired

### Documentation
- [ ] Create `tests/README.md` documenting test organization
- [ ] Document how to run tests locally
- [ ] Document how to add new tests
- [ ] Update main README with testing information

### Cleanup
- [ ] Commit changes with message: "refactor: organize test infrastructure with pytest"
