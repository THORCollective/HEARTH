import os
import re
import requests
from bs4 import BeautifulSoup
import PyPDF2
import docx
import io
from pathlib import Path
import random

def get_user_agent():
    """
    Returns a random user agent string to simulate normal browser traffic.
    """
    user_agents = [
        # Chrome on Windows
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        # Chrome on Mac
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        # Firefox on Windows
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
        # Firefox on Mac
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0',
        # Safari on Mac
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
        # Edge on Windows
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
    ]
    return random.choice(user_agents)

def get_cti_content(url):
    """
    Downloads and extracts text content from a given URL.
    Supports HTML, PDF, and DOCX formats.
    """
    try:
        headers = {
            'User-Agent': get_user_agent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        response = requests.get(url, timeout=15, headers=headers)
        response.raise_for_status()
        # Ensure proper encoding
        response.encoding = response.apparent_encoding
        content_type = response.headers.get('content-type', '')

        if 'pdf' in content_type:
            with io.BytesIO(response.content) as f:
                reader = PyPDF2.PdfReader(f)
                text = "".join(page.extract_text() for page in reader.pages)
            return text
        elif 'vnd.openxmlformats-officedocument.wordprocessingml.document' in content_type:
            with io.BytesIO(response.content) as f:
                doc = docx.Document(f)
                text = "\n".join([para.text for para in doc.paragraphs])
            return text
        else:
            # Use response.text which respects the encoding we set
            soup = BeautifulSoup(response.text, 'html.parser')

            # Remove unwanted tags
            for script_or_style in soup(["script", "style", "meta", "noscript"]):
                script_or_style.decompose()

            # Try to find main content areas (common article/content containers)
            content_selectors = [
                'article',
                '.entry-content',
                '.post-content',
                '.article-content',
                'main',
                '[role="main"]'
            ]

            content_area = None
            for selector in content_selectors:
                content_area = soup.select_one(selector)
                if content_area:
                    break

            # Use content area if found, otherwise full body
            target = content_area if content_area else soup

            # Extract text, preserving paragraphs
            paragraphs = []
            for element in target.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'li']):
                text = element.get_text(strip=True)
                if text and len(text) > 20:  # Filter out very short snippets
                    paragraphs.append(text)

            # Join paragraphs with double newlines
            text = '\n\n'.join(paragraphs)

            # Basic cleanup - only remove truly problematic characters
            # Keep most unicode, just remove control characters except newlines/tabs
            import re
            text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]', '', text)

            return text if text.strip() else " ".join(soup.stripped_strings)

    except requests.exceptions.RequestException as e:
        return f"Error fetching URL: {e}"
    except Exception as e:
        return f"Error processing content: {e}"

def save_cti_content_to_file(content, issue_number):
    """
    Saves the CTI content to a file in the .hearth/intel-drops directory.
    """
    try:
        # Create the directory if it doesn't exist
        intel_drops_dir = Path(".hearth/intel-drops")
        intel_drops_dir.mkdir(parents=True, exist_ok=True)
        
        # Save the content to a file
        filename = f"issue-{issue_number}-cti.txt"
        file_path = intel_drops_dir / filename
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Successfully saved CTI content to {file_path}")
        return str(file_path)
    except Exception as e:
        print(f"❌ Error saving CTI content to file: {e}")
        return None

def update_github_issue(issue_number, new_body):
    """
    Updates the body of a GitHub issue.
    """
    token = os.getenv('GITHUB_TOKEN')
    repo = os.getenv('GITHUB_REPOSITORY')
    if not (token and repo):
        print("Missing GITHUB_TOKEN or GITHUB_REPOSITORY env variables.")
        return

    url = f"https://api.github.com/repos/{repo}/issues/{issue_number}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    data = {"body": new_body}
    response = requests.patch(url, json=data, headers=headers)
    
    if response.status_code == 200:
        print(f"Successfully updated issue #{issue_number}.")
    else:
        print(f"Failed to update issue #{issue_number}. Status: {response.status_code}, Response: {response.text}")

def main():
    issue_body = os.getenv('ISSUE_BODY')
    issue_number = os.getenv('ISSUE_NUMBER')
    
    if not issue_body or not issue_number:
        print("Missing ISSUE_BODY or ISSUE_NUMBER env variables.")
        return

    # Find the URL in the issue body
    url_match = re.search(r'### Link to Original Source\s*\n\s*(https?://[^\s]+)', issue_body)
    if not url_match:
        print("No CTI link found in the issue body.")
        return

    cti_url = url_match.group(1).strip()
    print(f"Processing CTI link: {cti_url}")

    # Check if the content has already been processed
    if "*(This will be processed automatically by our system. Please leave this section as is.)*" not in issue_body:
        print("Content already processed. Checking if file exists...")
        
        # For regeneration cases, check if the file exists
        expected_file = Path(f".hearth/intel-drops/issue-{issue_number}-cti.txt")
        if expected_file.exists():
            print(f"CTI file already exists: {expected_file}")
            return
        else:
            print(f"CTI file not found: {expected_file}. Re-downloading content...")
            # Continue with download even though it was "processed" before

    # Download the full content
    print("Downloading CTI content from URL...")
    content = get_cti_content(cti_url)
    
    if "Error" in content:
        final_content = f"### CTI Content\n\n❌ **Failed to retrieve or process content from the URL.**\n\n**Details:**\n```\n{content}\n```\n\n*Please check the URL and try again, or paste the content manually.*"
    else:
        # Save the full content to a file
        file_path = save_cti_content_to_file(content, issue_number)
        
        if file_path:
            # Update the issue body to indicate successful download
            content_preview = content[:500] + "..." if len(content) > 500 else content
            final_content = f"### CTI Content\n\n✅ **Content successfully downloaded and saved to file.**\n\n**Content Preview:**\n```\n{content_preview}\n```\n\n**Full content length:** {len(content):,} characters\n**Saved to:** `{file_path}`\n\n*The full content has been downloaded and will be processed automatically.*"
        else:
            final_content = f"### CTI Content\n\n❌ **Failed to save content to file.**\n\n**Content Preview:**\n```\n{content[:1000]}...\n```\n\n*Please try again or contact an administrator.*"
    
    # Replace the placeholder text with the status update
    # Use re.escape to prevent special characters in final_content from being interpreted as regex
    new_issue_body = re.sub(
        r'### CTI Content\s*\n\s*\*\(This will be processed automatically by our system\. Please leave this section as is\.\)\*',
        lambda m: final_content,
        issue_body
    )

    if new_issue_body != issue_body:
        update_github_issue(issue_number, new_issue_body)

if __name__ == "__main__":
    main() 