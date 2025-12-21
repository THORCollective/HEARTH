# Unified Hunt Parser Design

## Overview
This document describes the unified hunt parser design for HEARTH. The existing `hunt_parser.py` already provides a well-structured implementation that we'll use as our foundation.

## Architecture

### 1. Core Components

#### HuntData (Data Model)
```python
@dataclass
class HuntData:
    id: str
    category: str
    title: str
    tactic: str
    notes: str
    tags: List[str]
    submitter: Dict[str, str]
    why: str
    references: str
    file_path: str
```

**Responsibilities:**
- Represent parsed hunt data
- Provide validation through `validate()` method
- Convert to dictionary format via `to_dict()`

#### HuntFileReader (Parser)
```python
class HuntFileReader:
    def read_file(self, file_path: Path) -> str
    def parse_hunt_file(self, file_path: Path, category: str) -> Optional[HuntData]
```

**Responsibilities:**
- Read markdown files safely
- Parse hunt files into HuntData objects
- Extract table data and content sections
- Handle parsing errors gracefully

#### HuntExporter (Output - Abstract Base Class)
```python
class HuntExporter(ABC):
    @abstractmethod
    def export(self, hunts: List[HuntData], output_path: Path) -> None
```

**Concrete Implementations:**
- `JSONExporter`: Exports to JSON format
- `JavaScriptExporter`: Exports to JavaScript const format (used in production)

**Responsibilities:**
- Define export interface
- Provide format-specific export implementations
- Handle export errors

#### HuntProcessor (Orchestrator)
```python
class HuntProcessor:
    def process_all_hunts(self, base_directory: Optional[str] = None) -> List[HuntData]
    def export_hunts(self, hunts: List[HuntData], output_path: Optional[Path] = None) -> None
    def generate_statistics(self, hunts: List[HuntData]) -> Dict[str, Any]
    def print_statistics(self, stats: Dict[str, Any]) -> None
```

**Responsibilities:**
- Coordinate the complete parsing pipeline
- Process all hunt files in configured directories
- Export parsed data using configured exporter
- Generate and display statistics

### 2. Utility Layer (hunt_parser_utils.py)

Shared utility functions used across parsers:

- `find_hunt_files()`: Locate hunt markdown files
- `find_table_header_line()`: Find table header in content
- `extract_table_cells()`: Extract data from table rows
- `clean_markdown_formatting()`: Clean markdown syntax
- `extract_submitter_info()`: Parse submitter links
- `extract_content_section()`: Extract markdown sections
- `parse_tag_list()`: Parse hashtag lists

### 3. Supporting Infrastructure

- **Validators** (`validators.py`): Hunt data validation
- **Config Manager** (`config_manager.py`): Configuration handling
- **Logger** (`logger_config.py`): Logging infrastructure
- **Exceptions** (`exceptions.py`): Custom exception types

## Design Patterns

### 1. Adapter Pattern
Implemented through `HuntExporter` abstract base class:
- Different output formats (JSON, JavaScript) implement the same interface
- Easy to add new export formats (CSV, YAML, etc.)
- Exporters are interchangeable

### 2. Dependency Injection
`HuntProcessor` accepts optional dependencies:
```python
def __init__(self, reader: Optional[HuntFileReader] = None,
             exporter: Optional[HuntExporter] = None)
```
Benefits:
- Testability (can inject mocks)
- Flexibility (can swap implementations)

### 3. Separation of Concerns
Clear responsibilities:
- **HuntData**: Data representation
- **HuntFileReader**: Input parsing
- **HuntExporter**: Output formatting
- **HuntProcessor**: Workflow orchestration

## API Design

### Simple Usage (Production)
```python
from hunt_parser import HuntProcessor

# Use defaults
processor = HuntProcessor()
hunts = processor.process_all_hunts()
processor.export_hunts(hunts)
```

### Custom Usage (Testing/Advanced)
```python
from hunt_parser import HuntProcessor, JSONExporter, HuntFileReader

# Custom configuration
reader = HuntFileReader(validator=custom_validator)
exporter = JSONExporter()
processor = HuntProcessor(reader=reader, exporter=exporter)

hunts = processor.process_all_hunts('/custom/path')
processor.export_hunts(hunts, Path('/custom/output.json'))
```

### Single File Parsing
```python
from hunt_parser import HuntFileReader
from pathlib import Path

reader = HuntFileReader()
hunt = reader.parse_hunt_file(Path('Flames/H001.md'), 'Flames')
print(hunt.to_dict())
```

## Input Format Support

Currently supports:
- **Markdown Tables**: Primary format for hunt files
  - Table structure with Hunt #, Idea, Tactic, Notes, Tags, Submitter
  - Content sections: Why, References

Future extensibility:
- JSON input (through adapter)
- YAML input (through adapter)
- HTML tables (through adapter)

## Data Flow

```
Hunt Files (*.md)
    ↓
HuntFileReader.parse_hunt_file()
    ↓
HuntData objects
    ↓
HuntData.validate()
    ↓
HuntProcessor.process_all_hunts()
    ↓
List[HuntData]
    ↓
HuntExporter.export()
    ↓
Output Files (hunts-data.js, hunts.json)
```

## Error Handling

- **FileProcessingError**: File read/write errors
- **MarkdownParsingError**: Markdown structure errors
- **ValidationError**: Data validation failures
- **DataExportError**: Export failures

All errors are logged and handled gracefully to allow processing to continue for other files.

## Testing Strategy

- **Unit Tests**: Individual components (validators, utils, data classes)
- **Integration Tests**: Full pipeline with temporary test files
- **Test Coverage**: Existing tests in `test_runner.py`

## Migration Path

1. **Phase 1** (Current): Both parsers coexist
   - `parse_hunts.py`: Used in GitHub Actions
   - `hunt_parser.py`: Used in tests and leaderboard

2. **Phase 2**: Update dependencies
   - Modify GitHub Actions to use `hunt_parser.py`
   - Update all imports to use unified parser

3. **Phase 3**: Cleanup
   - Remove `parse_hunts.py`
   - Remove `simple_hunt_parser.py` (test-only file)
   - Keep `hunt_parser_utils.py` (shared utilities)

## Conclusion

The existing `hunt_parser.py` already provides:
- ✅ Clear API design
- ✅ Adapter pattern for export formats
- ✅ Well-defined data structures
- ✅ Proper error handling
- ✅ Comprehensive validation
- ✅ Good separation of concerns

The consolidation effort should focus on:
1. Migrating all dependencies to use this unified implementation
2. Removing redundant parser implementations
3. Ensuring comprehensive test coverage
