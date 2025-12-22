#!/usr/bin/env python3
"""
Unit tests for the hunt_parser module.

Tests cover:
- HuntData dataclass functionality
- HuntFileReader parsing and validation
- HuntExporter implementations (JSON and JavaScript)
- HuntProcessor orchestration
- Edge cases and error handling
"""

import unittest
import sys
import json
import tempfile
from pathlib import Path
from unittest.mock import Mock, patch, mock_open, MagicMock

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'scripts'))

from hunt_parser import (
    HuntData,
    HuntFileReader,
    HuntExporter,
    JSONExporter,
    JavaScriptExporter,
    HuntProcessor
)


class TestHuntData(unittest.TestCase):
    """Test HuntData dataclass functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.valid_hunt_data = {
            'id': 'F001',
            'category': 'Flames',
            'title': 'Detect PowerShell downloads',
            'tactic': 'Execution',
            'notes': 'Monitor for suspicious PowerShell activity',
            'tags': ['execution', 'powershell'],
            'submitter': {'name': 'Test User', 'link': 'https://example.com'},
            'why': 'PowerShell is commonly abused by attackers',
            'references': 'https://attack.mitre.org',
            'file_path': 'Flames/F001.md'
        }

    def test_hunt_data_creation(self):
        """Test creating a HuntData object."""
        hunt = HuntData(**self.valid_hunt_data)

        self.assertEqual(hunt.id, 'F001')
        self.assertEqual(hunt.category, 'Flames')
        self.assertEqual(hunt.title, 'Detect PowerShell downloads')
        self.assertEqual(hunt.tactic, 'Execution')
        self.assertIsInstance(hunt.tags, list)
        self.assertEqual(len(hunt.tags), 2)

    def test_hunt_data_to_dict(self):
        """Test converting HuntData to dictionary."""
        hunt = HuntData(**self.valid_hunt_data)
        hunt_dict = hunt.to_dict()

        self.assertIsInstance(hunt_dict, dict)
        self.assertEqual(hunt_dict['id'], 'F001')
        self.assertEqual(hunt_dict['category'], 'Flames')
        self.assertEqual(hunt_dict['title'], 'Detect PowerShell downloads')
        self.assertIn('submitter', hunt_dict)
        self.assertIsInstance(hunt_dict['submitter'], dict)

    @patch('hunt_parser.HuntValidator.validate_hunt_data')
    def test_hunt_data_validate(self, mock_validate):
        """Test hunt data validation."""
        mock_validate.return_value = self.valid_hunt_data

        hunt = HuntData(**self.valid_hunt_data)
        validated_hunt = hunt.validate()

        self.assertIsInstance(validated_hunt, HuntData)
        mock_validate.assert_called_once()

    def test_hunt_data_with_empty_tags(self):
        """Test HuntData with empty tags list."""
        data = self.valid_hunt_data.copy()
        data['tags'] = []

        hunt = HuntData(**data)

        self.assertEqual(hunt.tags, [])
        self.assertIsInstance(hunt.tags, list)

    def test_hunt_data_with_empty_submitter(self):
        """Test HuntData with empty submitter info."""
        data = self.valid_hunt_data.copy()
        data['submitter'] = {'name': '', 'link': ''}

        hunt = HuntData(**data)

        self.assertEqual(hunt.submitter['name'], '')
        self.assertEqual(hunt.submitter['link'], '')


class TestHuntFileReader(unittest.TestCase):
    """Test HuntFileReader parsing functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.reader = HuntFileReader()
        self.valid_hunt_content = """# F001
Detect PowerShell malicious downloads

| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |
|--------|-------------------|--------|-------|------|-----------|
| F001 | Detect PowerShell malicious downloads | Execution | Monitor PowerShell | #execution #powershell | [Test User](https://example.com) |

## Why

PowerShell is commonly abused by attackers to download payloads.

## References

- https://attack.mitre.org/techniques/T1059/001/
"""

    @patch('hunt_parser.Path.open', new_callable=mock_open, read_data="test content")
    @patch('hunt_parser.HuntValidator.validate_file_path')
    def test_read_file_success(self, mock_validate, mock_file):
        """Test successful file reading."""
        test_path = Path("/test/file.md")

        content = self.reader.read_file(test_path)

        self.assertEqual(content, "test content")
        mock_validate.assert_called_once()

    @patch('hunt_parser.Path.open', side_effect=FileNotFoundError("File not found"))
    @patch('hunt_parser.HuntValidator.validate_file_path')
    def test_read_file_not_found(self, mock_validate, mock_file):
        """Test reading non-existent file."""
        from exceptions import FileProcessingError

        test_path = Path("/test/nonexistent.md")

        with self.assertRaises(FileProcessingError):
            self.reader.read_file(test_path)

    @patch('hunt_parser.Path.open', new_callable=mock_open, read_data="   \n\n  ")
    @patch('hunt_parser.HuntValidator.validate_file_path')
    def test_read_empty_file(self, mock_validate, mock_file):
        """Test reading empty file."""
        test_path = Path("/test/empty.md")

        content = self.reader.read_file(test_path)

        self.assertEqual(content, "   \n\n  ")
        self.assertTrue(content.strip() == "")

    @patch.object(HuntFileReader, 'read_file')
    @patch('hunt_parser.HuntValidator.validate_hunt_data')
    @patch('hunt_parser.extract_submitter_info')
    @patch('hunt_parser.parse_tag_list')
    @patch('hunt_parser.extract_content_section')
    def test_parse_hunt_file_success(self, mock_extract_section, mock_parse_tags,
                                     mock_extract_submitter, mock_validate, mock_read):
        """Test successful parsing of hunt file."""
        mock_read.return_value = self.valid_hunt_content
        mock_extract_submitter.return_value = {'name': 'Test User', 'link': 'https://example.com'}
        mock_parse_tags.return_value = ['execution', 'powershell']
        mock_extract_section.side_effect = [
            'PowerShell is commonly abused by attackers to download payloads.',
            'https://attack.mitre.org/techniques/T1059/001/'
        ]
        mock_validate.return_value = {
            'id': 'F001',
            'category': 'Flames',
            'title': 'Detect PowerShell malicious downloads',
            'tactic': 'Execution',
            'notes': 'Monitor PowerShell',
            'tags': ['execution', 'powershell'],
            'submitter': {'name': 'Test User', 'link': 'https://example.com'},
            'why': 'PowerShell is commonly abused by attackers to download payloads.',
            'references': 'https://attack.mitre.org/techniques/T1059/001/',
            'file_path': 'Flames/F001.md'
        }

        test_path = Path("/test/Flames/F001.md")
        hunt_data = self.reader.parse_hunt_file(test_path, "Flames")

        self.assertIsNotNone(hunt_data)
        self.assertEqual(hunt_data.id, 'F001')
        self.assertEqual(hunt_data.category, 'Flames')
        self.assertEqual(hunt_data.title, 'Detect PowerShell malicious downloads')

    @patch.object(HuntFileReader, 'read_file')
    @patch('hunt_parser.get_config')
    def test_parse_hunt_file_excluded_file(self, mock_config, mock_read):
        """Test parsing excluded file (should return None)."""
        mock_config_obj = Mock()
        mock_config_obj.config.excluded_files = ['README.md', 'template.md']
        mock_config.return_value = mock_config_obj

        # Re-initialize reader to pick up mocked config
        reader = HuntFileReader()

        test_path = Path("/test/Flames/README.md")
        hunt_data = reader.parse_hunt_file(test_path, "Flames")

        self.assertIsNone(hunt_data)

    @patch.object(HuntFileReader, 'read_file')
    def test_parse_hunt_file_with_error(self, mock_read):
        """Test parsing file that raises an error."""
        from exceptions import MarkdownParsingError

        mock_read.side_effect = Exception("Parse error")

        test_path = Path("/test/Flames/F001.md")

        # Should raise MarkdownParsingError on unexpected error
        with self.assertRaises(MarkdownParsingError):
            self.reader.parse_hunt_file(test_path, "Flames")

    def test_extract_table_data_success(self):
        """Test extracting table data from markdown."""
        test_path = Path("/test/F001.md")

        result = self.reader._extract_table_data(self.valid_hunt_content, test_path)

        self.assertIsInstance(result, dict)
        self.assertIn('hunt_id', result)
        self.assertIn('idea', result)
        self.assertIn('tactic', result)

    def test_extract_table_data_no_table(self):
        """Test extracting table data when no table exists."""
        from exceptions import MarkdownParsingError

        content = "# No table here\nJust some content"
        test_path = Path("/test/F001.md")

        # Should raise MarkdownParsingError when no table header found
        with self.assertRaises(MarkdownParsingError):
            self.reader._extract_table_data(content, test_path)

    def test_extract_content_sections(self):
        """Test extracting Why and References sections."""
        result = self.reader._extract_content_sections(self.valid_hunt_content)

        self.assertIsInstance(result, dict)
        self.assertIn('why', result)
        self.assertIn('references', result)
        self.assertIn('PowerShell', result['why'])

    def test_extract_table_data_insufficient_cells(self):
        """Test extracting table data with insufficient cells."""
        from exceptions import MarkdownParsingError

        content = """# Hunt
| Hunt # | Idea |
|--------|------|
| F001 | Test |
"""
        test_path = Path("/test/F001.md")

        # Should raise MarkdownParsingError when insufficient cells
        with self.assertRaises(MarkdownParsingError):
            self.reader._extract_table_data(content, test_path)


class TestJSONExporter(unittest.TestCase):
    """Test JSON export functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.exporter = JSONExporter()
        self.test_hunts = [
            HuntData(
                id='F002',
                category='Flames',
                title='Hunt 2',
                tactic='Defense Evasion',
                notes='Notes 2',
                tags=['evasion'],
                submitter={'name': 'User 2', 'link': ''},
                why='Why 2',
                references='Ref 2',
                file_path='Flames/F002.md'
            ),
            HuntData(
                id='F001',
                category='Flames',
                title='Hunt 1',
                tactic='Execution',
                notes='Notes 1',
                tags=['execution'],
                submitter={'name': 'User 1', 'link': ''},
                why='Why 1',
                references='Ref 1',
                file_path='Flames/F001.md'
            )
        ]

    def test_export_to_json(self):
        """Test exporting hunts to JSON file."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            output_path = Path(f.name)

        try:
            self.exporter.export(self.test_hunts, output_path)

            # Verify file was created and contains valid JSON
            self.assertTrue(output_path.exists())

            with open(output_path, 'r') as f:
                data = json.load(f)

            self.assertIsInstance(data, list)
            self.assertEqual(len(data), 2)
            # Should be sorted by ID
            self.assertEqual(data[0]['id'], 'F001')
            self.assertEqual(data[1]['id'], 'F002')
        finally:
            output_path.unlink()

    def test_export_empty_list(self):
        """Test exporting empty hunt list."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            output_path = Path(f.name)

        try:
            self.exporter.export([], output_path)

            with open(output_path, 'r') as f:
                data = json.load(f)

            self.assertEqual(data, [])
        finally:
            output_path.unlink()

    @patch('hunt_parser.Path.open', side_effect=PermissionError("No permission"))
    def test_export_permission_error(self, mock_open):
        """Test export with permission error."""
        from exceptions import DataExportError

        output_path = Path("/test/output.json")

        with self.assertRaises(DataExportError):
            self.exporter.export(self.test_hunts, output_path)


class TestJavaScriptExporter(unittest.TestCase):
    """Test JavaScript export functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.exporter = JavaScriptExporter()
        self.test_hunts = [
            HuntData(
                id='F001',
                category='Flames',
                title='Hunt 1',
                tactic='Execution',
                notes='Notes',
                tags=['execution'],
                submitter={'name': 'User', 'link': ''},
                why='Why',
                references='Ref',
                file_path='Flames/F001.md'
            )
        ]

    def test_export_to_javascript(self):
        """Test exporting hunts to JavaScript file."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
            output_path = Path(f.name)

        try:
            self.exporter.export(self.test_hunts, output_path)

            self.assertTrue(output_path.exists())

            with open(output_path, 'r') as f:
                content = f.read()

            self.assertIn('const HUNTS_DATA =', content)
            self.assertIn('Auto-generated', content)
            self.assertIn('F001', content)
        finally:
            output_path.unlink()

    def test_export_sorting(self):
        """Test that hunts are sorted by ID in JavaScript export."""
        hunts = [
            HuntData(
                id='F003', category='Flames', title='Hunt 3', tactic='T', notes='N',
                tags=[], submitter={}, why='W', references='R', file_path='F003.md'
            ),
            HuntData(
                id='F001', category='Flames', title='Hunt 1', tactic='T', notes='N',
                tags=[], submitter={}, why='W', references='R', file_path='F001.md'
            ),
            HuntData(
                id='F002', category='Flames', title='Hunt 2', tactic='T', notes='N',
                tags=[], submitter={}, why='W', references='R', file_path='F002.md'
            )
        ]

        with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
            output_path = Path(f.name)

        try:
            self.exporter.export(hunts, output_path)

            with open(output_path, 'r') as f:
                content = f.read()

            # Check order by finding positions
            pos_f001 = content.find('"id": "F001"')
            pos_f002 = content.find('"id": "F002"')
            pos_f003 = content.find('"id": "F003"')

            self.assertLess(pos_f001, pos_f002)
            self.assertLess(pos_f002, pos_f003)
        finally:
            output_path.unlink()


class TestHuntProcessor(unittest.TestCase):
    """Test HuntProcessor orchestration."""

    def setUp(self):
        """Set up test fixtures."""
        self.processor = HuntProcessor()

    @patch('hunt_parser.find_hunt_files')
    @patch.object(HuntFileReader, 'parse_hunt_file')
    @patch('hunt_parser.get_config')
    def test_process_all_hunts_success(self, mock_config, mock_parse, mock_find):
        """Test processing all hunt files successfully."""
        mock_config_obj = Mock()
        mock_config_obj.config.hunt_directories = ['Flames', 'Embers', 'Alchemy']
        mock_config.return_value = mock_config_obj

        # Mock hunt files
        test_files = [
            Path('/test/Flames/F001.md'),
            Path('/test/Embers/B001.md')
        ]
        mock_find.return_value = test_files

        # Mock parsed hunts
        mock_parse.side_effect = [
            HuntData(
                id='F001', category='Flames', title='Hunt 1', tactic='Execution',
                notes='N', tags=[], submitter={}, why='W', references='R', file_path='Flames/F001.md'
            ),
            HuntData(
                id='B001', category='Embers', title='Hunt 2', tactic='Collection',
                notes='N', tags=[], submitter={}, why='W', references='R', file_path='Embers/B001.md'
            )
        ]

        hunts = self.processor.process_all_hunts()

        self.assertEqual(len(hunts), 2)
        self.assertEqual(hunts[0].id, 'F001')
        self.assertEqual(hunts[1].id, 'B001')

    @patch('hunt_parser.find_hunt_files')
    @patch.object(HuntFileReader, 'parse_hunt_file')
    @patch('hunt_parser.get_config')
    def test_process_all_hunts_with_errors(self, mock_config, mock_parse, mock_find):
        """Test processing hunts when some fail to parse."""
        from exceptions import MarkdownParsingError

        mock_config_obj = Mock()
        mock_config_obj.config.hunt_directories = ['Flames']
        mock_config.return_value = mock_config_obj

        test_files = [
            Path('/test/Flames/F001.md'),
            Path('/test/Flames/F002.md')
        ]
        mock_find.return_value = test_files

        # First succeeds, second raises MarkdownParsingError
        mock_parse.side_effect = [
            HuntData(
                id='F001', category='Flames', title='Hunt 1', tactic='T',
                notes='N', tags=[], submitter={}, why='W', references='R', file_path='F001.md'
            ),
            MarkdownParsingError('/test/Flames/F002.md', 'table_header', 'No table header found')
        ]

        hunts = self.processor.process_all_hunts()

        # Should only include successful parse and continue processing
        self.assertEqual(len(hunts), 1)
        self.assertEqual(hunts[0].id, 'F001')

    @patch('hunt_parser.find_hunt_files')
    @patch('hunt_parser.get_config')
    def test_process_all_hunts_unknown_category(self, mock_config, mock_find):
        """Test processing hunts with unknown category."""
        mock_config_obj = Mock()
        mock_config_obj.config.hunt_directories = ['Flames', 'Embers']
        mock_config.return_value = mock_config_obj

        test_files = [
            Path('/test/Unknown/U001.md')
        ]
        mock_find.return_value = test_files

        hunts = self.processor.process_all_hunts()

        # Should skip unknown category
        self.assertEqual(len(hunts), 0)

    def test_export_hunts(self):
        """Test exporting hunts using configured exporter."""
        test_hunts = [
            HuntData(
                id='F001', category='Flames', title='Hunt', tactic='T',
                notes='N', tags=[], submitter={}, why='W', references='R', file_path='F001.md'
            )
        ]

        with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
            output_path = Path(f.name)

        try:
            self.processor.export_hunts(test_hunts, output_path)

            self.assertTrue(output_path.exists())
        finally:
            output_path.unlink()

    @patch('hunt_parser.get_config')
    def test_export_hunts_default_path(self, mock_config):
        """Test exporting hunts with default output path from config."""
        mock_config_obj = Mock()
        mock_config_obj.config.base_directory = '/test'
        mock_config_obj.config.hunts_data_filename = 'hunts-data.js'
        mock_config.return_value = mock_config_obj

        test_hunts = [
            HuntData(
                id='F001', category='Flames', title='Hunt', tactic='T',
                notes='N', tags=[], submitter={}, why='W', references='R', file_path='F001.md'
            )
        ]

        with patch.object(self.processor.exporter, 'export') as mock_export:
            self.processor.export_hunts(test_hunts)

            # Should call export with config-derived path
            mock_export.assert_called_once()

    def test_generate_statistics(self):
        """Test generating hunt statistics."""
        test_hunts = [
            HuntData(
                id='F001', category='Flames', title='Hunt 1', tactic='Execution',
                notes='N', tags=['execution', 'powershell'], submitter={}, why='W', references='R', file_path='F001.md'
            ),
            HuntData(
                id='F002', category='Flames', title='Hunt 2', tactic='Defense Evasion',
                notes='N', tags=['evasion'], submitter={}, why='W', references='R', file_path='F002.md'
            ),
            HuntData(
                id='B001', category='Embers', title='Hunt 3', tactic='Collection',
                notes='N', tags=['collection'], submitter={}, why='W', references='R', file_path='B001.md'
            )
        ]

        stats = self.processor.generate_statistics(test_hunts)

        self.assertEqual(stats['total_hunts'], 3)
        self.assertEqual(stats['category_counts']['Flames'], 2)
        self.assertEqual(stats['category_counts']['Embers'], 1)
        self.assertIn('Execution', stats['unique_tactics'])
        self.assertIn('execution', stats['unique_tags'])
        self.assertEqual(stats['tactics_count'], 3)
        self.assertEqual(stats['tags_count'], 3)

    def test_generate_statistics_empty_list(self):
        """Test generating statistics for empty hunt list."""
        stats = self.processor.generate_statistics([])

        self.assertEqual(stats['total_hunts'], 0)
        self.assertEqual(stats['category_counts'], {})
        self.assertEqual(stats['unique_tactics'], [])
        self.assertEqual(stats['unique_tags'], [])

    def test_generate_statistics_multiple_tactics(self):
        """Test statistics with comma-separated tactics."""
        test_hunts = [
            HuntData(
                id='F001', category='Flames', title='Hunt', tactic='Execution, Defense Evasion',
                notes='N', tags=[], submitter={}, why='W', references='R', file_path='F001.md'
            )
        ]

        stats = self.processor.generate_statistics(test_hunts)

        self.assertIn('Execution', stats['unique_tactics'])
        self.assertIn('Defense Evasion', stats['unique_tactics'])
        self.assertEqual(stats['tactics_count'], 2)

    @patch('builtins.print')
    def test_print_statistics(self, mock_print):
        """Test printing statistics to console."""
        stats = {
            'total_hunts': 5,
            'category_counts': {'Flames': 3, 'Embers': 2},
            'unique_tactics': ['Execution', 'Collection'],
            'unique_tags': ['execution', 'powershell'],
            'tactics_count': 2,
            'tags_count': 2
        }

        self.processor.print_statistics(stats)

        # Verify print was called
        self.assertTrue(mock_print.called)
        # Check that key information was printed
        calls = [str(call) for call in mock_print.call_args_list]
        output = ''.join(calls)
        self.assertIn('5', output)  # Total hunts


class TestHuntProcessorIntegration(unittest.TestCase):
    """Integration tests for HuntProcessor with different exporters."""

    def test_processor_with_json_exporter(self):
        """Test processor with JSON exporter."""
        processor = HuntProcessor(exporter=JSONExporter())

        self.assertIsInstance(processor.exporter, JSONExporter)

    def test_processor_with_javascript_exporter(self):
        """Test processor with JavaScript exporter (default)."""
        processor = HuntProcessor()

        self.assertIsInstance(processor.exporter, JavaScriptExporter)

    def test_processor_with_custom_reader(self):
        """Test processor with custom reader."""
        custom_reader = HuntFileReader()
        processor = HuntProcessor(reader=custom_reader)

        self.assertEqual(processor.reader, custom_reader)


def run_tests():
    """Run all tests."""
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules[__name__])
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return result.wasSuccessful()


if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
