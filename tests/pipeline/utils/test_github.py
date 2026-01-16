"""Tests for GitHub API helpers."""
import pytest
from unittest.mock import Mock, patch, MagicMock
from scripts.pipeline.utils.github import (
    get_github_client,
    get_issue,
    update_issue_body,
    post_comment,
    add_label,
    remove_label
)


@patch('scripts.pipeline.utils.github.Github')
def test_get_github_client(mock_github_class):
    """Get authenticated GitHub client."""
    mock_client = Mock()
    mock_github_class.return_value = mock_client

    with patch.dict('os.environ', {'GITHUB_TOKEN': 'fake-token'}):
        client = get_github_client()

    assert client == mock_client
    mock_github_class.assert_called_once_with('fake-token')


@patch('scripts.pipeline.utils.github.Github')
def test_get_issue(mock_github_class):
    """Get issue object from repo."""
    mock_client = Mock()
    mock_repo = Mock()
    mock_issue = Mock()

    mock_client.get_repo.return_value = mock_repo
    mock_repo.get_issue.return_value = mock_issue
    mock_github_class.return_value = mock_client

    with patch.dict('os.environ', {'GITHUB_TOKEN': 'fake-token'}):
        issue = get_issue('owner/repo', 123)

    assert issue == mock_issue
    mock_client.get_repo.assert_called_once_with('owner/repo')
    mock_repo.get_issue.assert_called_once_with(123)


@patch('scripts.pipeline.utils.github.get_issue')
def test_update_issue_body(mock_get_issue):
    """Update issue body text."""
    mock_issue = Mock()
    mock_get_issue.return_value = mock_issue

    update_issue_body('owner/repo', 123, 'New body content')

    mock_get_issue.assert_called_once_with('owner/repo', 123)
    mock_issue.edit.assert_called_once_with(body='New body content')


@patch('scripts.pipeline.utils.github.get_issue')
def test_post_comment(mock_get_issue):
    """Post comment to issue."""
    mock_issue = Mock()
    mock_get_issue.return_value = mock_issue

    post_comment('owner/repo', 123, 'Test comment')

    mock_get_issue.assert_called_once_with('owner/repo', 123)
    mock_issue.create_comment.assert_called_once_with('Test comment')


@patch('scripts.pipeline.utils.github.get_issue')
def test_add_label(mock_get_issue):
    """Add label to issue."""
    mock_issue = Mock()
    mock_get_issue.return_value = mock_issue

    add_label('owner/repo', 123, 'bug')

    mock_get_issue.assert_called_once_with('owner/repo', 123)
    mock_issue.add_to_labels.assert_called_once_with('bug')


@patch('scripts.pipeline.utils.github.get_issue')
def test_remove_label(mock_get_issue):
    """Remove label from issue."""
    mock_issue = Mock()
    mock_get_issue.return_value = mock_issue

    remove_label('owner/repo', 123, 'bug')

    mock_get_issue.assert_called_once_with('owner/repo', 123)
    mock_issue.remove_from_labels.assert_called_once_with('bug')
