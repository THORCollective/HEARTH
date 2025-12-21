# Phase 04: Test Infrastructure Organization

This phase organizes the 23 scattered test files into a proper test suite with a test runner.

## Current State
- 23 test files scattered in `scripts/` directory
- No test organization or hierarchy
- No test runner configured
- No CI/CD test execution

## Tasks

### Create Test Directory Structure
- [x] Create `tests/` directory in project root (already existed)
- [x] Create `tests/unit/` subdirectory for unit tests (already existed)
- [x] Create `tests/integration/` subdirectory for integration tests
- [x] Create `tests/fixtures/` subdirectory for test data
- [x] Create `tests/conftest.py` for pytest configuration

### Organize Existing Tests
- [x] Identify all test files in `scripts/` directory (found 17 test files)
- [x] Categorize tests as unit vs integration tests (4 unit, 6 integration, 7 obsolete/duplicate)
- [x] Move unit tests to `tests/unit/` with proper naming (`test_*.py`)
- [x] Move integration tests to `tests/integration/`
- [x] Update import paths in moved test files
- [x] Delete any obsolete or redundant test files (removed 7 duplicate/obsolete tests)

### Create Test Fixtures
- [x] Create sample hunt markdown files in `tests/fixtures/` (created sample_flame.md, sample_ember.md, sample_alchemy.md with realistic hunt content)
- [x] Create sample CTI content for testing (created sample_cti_article.txt with comprehensive CTI report and sample_cti_short.txt with brief alert)
- [x] Create mock MITRE ATT&CK data if needed (created mock_mitre_attack.json with 22 techniques/tactics covering common test scenarios)
- [x] Create shared test utilities in `tests/conftest.py` (added fixtures for all sample files, helper functions for validation, and utilities for creating temp test data)

### Configure Test Runner
- [x] Add pytest to `requirements.txt` if not present
- [x] Add pytest-cov for coverage reporting
- [x] Create `pytest.ini` configuration file
- [x] Configure test discovery patterns
- [x] Set up coverage reporting

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
