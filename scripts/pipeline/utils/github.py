"""GitHub API helper functions."""
import os
from github import Github, GithubException, BadCredentialsException, UnknownObjectException
from github.Auth import Token
from github.Issue import Issue
from hearth.utils.logging import get_logger

logger = get_logger()


def get_github_client() -> Github:
    """
    Get authenticated GitHub client.

    Note: Caller is responsible for managing client lifecycle.
    For long-running processes, consider caching the client.

    Returns:
        Authenticated Github client

    Raises:
        ValueError: If GITHUB_TOKEN not set
    """
    token = os.getenv('GITHUB_TOKEN')
    if not token:
        raise ValueError("GITHUB_TOKEN environment variable not set")

    return Github(auth=Token(token))


def get_issue(repo_name: str, issue_number: int) -> Issue:
    """
    Get issue object.

    Args:
        repo_name: Repository in format "owner/repo"
        issue_number: Issue number

    Returns:
        GitHub Issue object

    Raises:
        UnknownObjectException: If repository or issue not found
        BadCredentialsException: If GITHUB_TOKEN is invalid
        GithubException: For other GitHub API errors
    """
    try:
        client = get_github_client()
        repo = client.get_repo(repo_name)
        issue = repo.get_issue(issue_number)

        logger.debug(f"Retrieved issue #{issue_number} from {repo_name}")
        return issue
    except UnknownObjectException as e:
        logger.error(f"Repository {repo_name} or issue #{issue_number} not found")
        raise
    except BadCredentialsException as e:
        logger.error("Invalid or expired GITHUB_TOKEN")
        raise
    except GithubException as e:
        logger.error(f"GitHub API error: {e}")
        raise


def update_issue_body(repo_name: str, issue_number: int, new_body: str) -> None:
    """
    Update issue body text.

    Args:
        repo_name: Repository in format "owner/repo"
        issue_number: Issue number
        new_body: New body content
    """
    issue = get_issue(repo_name, issue_number)
    issue.edit(body=new_body)
    logger.info(f"Updated body for issue #{issue_number}")


def post_comment(repo_name: str, issue_number: int, comment: str) -> None:
    """
    Post comment to issue.

    Args:
        repo_name: Repository in format "owner/repo"
        issue_number: Issue number
        comment: Comment text
    """
    issue = get_issue(repo_name, issue_number)
    issue.create_comment(comment)
    logger.info(f"Posted comment to issue #{issue_number}")


def add_label(repo_name: str, issue_number: int, label: str) -> None:
    """
    Add label to issue.

    Args:
        repo_name: Repository in format "owner/repo"
        issue_number: Issue number
        label: Label name
    """
    issue = get_issue(repo_name, issue_number)
    issue.add_to_labels(label)
    logger.info(f"Added label '{label}' to issue #{issue_number}")


def remove_label(repo_name: str, issue_number: int, label: str) -> None:
    """
    Remove label from issue.

    Args:
        repo_name: Repository in format "owner/repo"
        issue_number: Issue number
        label: Label name
    """
    issue = get_issue(repo_name, issue_number)
    issue.remove_from_labels(label)
    logger.info(f"Removed label '{label}' from issue #{issue_number}")
