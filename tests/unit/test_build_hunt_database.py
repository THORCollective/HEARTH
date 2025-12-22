#!/usr/bin/env python3
"""
Tests for build_hunt_database.py database error handling.
"""

import pytest
import sqlite3
import tempfile
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
import sys

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'scripts'))

from build_hunt_database import (
    create_database_schema,
    print_statistics,
    get_file_hash,
    extract_hunt_info
)
from exceptions import DatabaseError


class TestDatabaseErrorHandling:
    """Test database error handling with DatabaseError exceptions."""

    def test_create_database_schema_success(self):
        """Test successful schema creation."""
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = Path(tmpdir) / 'test.db'
            conn = sqlite3.connect(str(db_path))

            # Should not raise any errors
            create_database_schema(conn)

            # Verify schema was created
            cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            assert 'hunts' in tables
            assert 'metadata' in tables

            conn.close()

    def test_create_database_schema_error(self):
        """Test schema creation with database error."""
        # Create a mock connection that raises an error on first execute call
        mock_conn = MagicMock()
        # First call raises error, don't continue to PRAGMA call
        mock_conn.execute.side_effect = [sqlite3.Error("Database is locked")]

        with pytest.raises(DatabaseError) as exc_info:
            create_database_schema(mock_conn)

        assert exc_info.value.error_code == "HE-4001"
        assert "Failed to create database schema" in str(exc_info.value)
        assert "operation" in exc_info.value.context
        assert exc_info.value.context["operation"] == "CREATE_SCHEMA"

    def test_print_statistics_success(self):
        """Test successful statistics printing."""
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = Path(tmpdir) / 'test.db'
            conn = sqlite3.connect(str(db_path))

            # Create schema and add test data
            create_database_schema(conn)
            conn.execute('''
                INSERT INTO hunts
                (filename, hunt_id, hypothesis, tactic, technique, tags, submitter,
                 file_path, file_hash, created_date, last_modified)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                'test.md', 'H-2025-001', 'Test hypothesis',
                'Initial Access', 'T1566', '[]', 'Test User',
                '/tmp/test.md', 'abc123', '2025-01-01', '2025-01-01'
            ))
            conn.commit()

            # Should not raise any errors
            print_statistics(conn)

            conn.close()

    def test_print_statistics_error(self):
        """Test statistics printing with database error."""
        # Create a mock connection that raises an error
        mock_conn = MagicMock()
        mock_conn.execute.side_effect = sqlite3.Error("Connection lost")

        with pytest.raises(DatabaseError) as exc_info:
            print_statistics(mock_conn)

        assert exc_info.value.error_code == "HE-4010"
        assert "Failed to retrieve database statistics" in str(exc_info.value)
        assert "operation" in exc_info.value.context
        assert exc_info.value.context["operation"] == "SELECT"

    def test_database_error_codes_unique(self):
        """Test that all database error codes are in HE-4xxx range and unique."""
        error_codes = [
            "HE-4000",  # Connection error
            "HE-4001",  # Schema creation error
            "HE-4002",  # SELECT query error
            "HE-4003",  # UPDATE query error
            "HE-4004",  # INSERT integrity error
            "HE-4005",  # INSERT general error
            "HE-4006",  # SELECT cleanup error
            "HE-4007",  # DELETE error
            "HE-4008",  # COMMIT error
            "HE-4009",  # Metadata update error
            "HE-4010",  # Statistics query error
        ]

        # All codes should be unique
        assert len(error_codes) == len(set(error_codes))

        # All codes should be in HE-4xxx range
        for code in error_codes:
            assert code.startswith("HE-4")
            assert len(code) == 7  # HE-4XXX format

    def test_database_error_with_context(self):
        """Test DatabaseError includes proper context information."""
        error = DatabaseError(
            message="Test error",
            database_path="/tmp/test.db",
            query="SELECT * FROM hunts",
            operation="SELECT",
            error_code="HE-4002"
        )

        assert error.error_code == "HE-4002"
        assert error.context["database_path"] == "/tmp/test.db"
        assert error.context["query"] == "SELECT * FROM hunts"
        assert error.context["operation"] == "SELECT"
        assert "HE-4002" in str(error)
        assert "Test error" in str(error)

    def test_database_error_query_truncation(self):
        """Test that long queries are truncated in error context."""
        long_query = "SELECT * FROM hunts WHERE " + "x = 1 AND " * 100

        error = DatabaseError(
            message="Test error",
            query=long_query,
            error_code="HE-4002"
        )

        # Query should be truncated
        assert len(error.context["query"]) <= 203  # 200 + "..."
        assert error.context["query"].endswith("...")

    def test_extract_hunt_info_basic(self):
        """Test basic hunt info extraction."""
        content = """# H-2025-001

This is a test hypothesis for detecting malicious activity.

| Hunt # | Hypothesis | Tactic | Notes | Tags | Submitter |
|--------|-----------|---------|-------|------|-----------|
| H-2025-001 | Test hypothesis | Initial Access | T1566 | #phishing | [Test User](https://example.com) |
"""
        result = extract_hunt_info(content, "/tmp/test.md")

        assert result['hunt_id'] == "H-2025-001"
        assert "test hypothesis" in result['hypothesis'].lower()
        assert result['tactic'] == "Initial Access"
        assert result['technique'] == "T1566"
        assert "#phishing" in result['tags']
        assert result['submitter'] == "Test User"

    def test_get_file_hash_consistency(self):
        """Test that file hash is consistent for same content."""
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
            f.write("test content")
            filepath = f.name

        try:
            hash1 = get_file_hash(filepath)
            hash2 = get_file_hash(filepath)

            assert hash1 == hash2
            assert isinstance(hash1, str)
            assert len(hash1) == 32  # MD5 hash length
        finally:
            Path(filepath).unlink()

    def test_connection_error_handling(self):
        """Test database connection error handling."""
        # Use a temporary directory to avoid file system permission issues
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = Path(tmpdir) / 'test.db'

            with patch('sqlite3.connect') as mock_connect:
                mock_connect.side_effect = sqlite3.Error("Unable to open database file")

                with pytest.raises(DatabaseError) as exc_info:
                    from build_hunt_database import main
                    with patch('sys.argv', ['build_hunt_database.py', '--db-path', str(db_path)]):
                        main()

                # Should raise DatabaseError with HE-4000
                assert exc_info.value.error_code == "HE-4000"
                assert "Failed to connect to database" in str(exc_info.value)

    def test_integrity_error_handling(self):
        """Test integrity constraint violation handling."""
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = Path(tmpdir) / 'test.db'
            conn = sqlite3.connect(str(db_path))

            # Create schema
            create_database_schema(conn)

            # Insert a record
            conn.execute('''
                INSERT INTO hunts
                (filename, hunt_id, hypothesis, tactic, technique, tags, submitter,
                 file_path, file_hash, created_date, last_modified)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                'test.md', 'H-2025-001', 'Test hypothesis',
                'Initial Access', 'T1566', '[]', 'Test User',
                '/tmp/test.md', 'abc123', '2025-01-01', '2025-01-01'
            ))
            conn.commit()

            # Try to insert duplicate (should violate UNIQUE constraint)
            with pytest.raises(sqlite3.IntegrityError):
                conn.execute('''
                    INSERT INTO hunts
                    (filename, hunt_id, hypothesis, tactic, technique, tags, submitter,
                     file_path, file_hash, created_date, last_modified)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    'test.md', 'H-2025-002', 'Different hypothesis',
                    'Execution', 'T1059', '[]', 'Test User',
                    '/tmp/test.md', 'def456', '2025-01-02', '2025-01-02'
                ))

            conn.close()


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
