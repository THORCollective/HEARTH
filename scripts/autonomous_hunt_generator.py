#!/usr/bin/env python3
"""
Autonomous Hunt Generator - Orchestrator for daily threat hunt generation.

This script orchestrates the autonomous hunt generation process:
1. Fetches security intel using fetch_secupdates_intel.py
2. Processes each intel item through generate_from_cti.py
3. Tracks state to prevent duplicate processing
4. Creates a summary of generated hunts

Usage:
    python autonomous_hunt_generator.py [--dry-run] [--max-hunts N]
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

# Configuration
DEFAULT_STATE_FILE = Path(".hearth/autonomous-state.json")
INTEL_DROPS_DIR = Path(".hearth/intel-drops/")
PROCESSED_INTEL_DIR = Path(".hearth/processed-intel-drops/")
FLAMES_DIR = Path("Flames/")

# Environment variables for hunt generation
SUBMITTER_NAME = "hearth-autonomous-intel"
PROFILE_LINK = "https://github.com/THORCollective/HEARTH"


class AutonomousState:
    """Manages the autonomous generation state."""

    def __init__(self, state_file: Path = DEFAULT_STATE_FILE):
        self.state_file = state_file
        self.state = self._load()

    def _load(self) -> dict:
        """Load state from file."""
        if self.state_file.exists():
            try:
                with open(self.state_file) as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                print(f"Warning: Could not load state: {e}")

        return {
            "last_run": None,
            "processed_items": [],
            "stats": {
                "total_runs": 0,
                "total_hunts_generated": 0,
                "total_failures": 0,
            },
        }

    def save(self):
        """Save state to file."""
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.state_file, "w") as f:
            json.dump(self.state, f, indent=2)

    def is_processed(self, content_hash: str) -> bool:
        """Check if an item has been processed."""
        return any(
            item.get("hash") == content_hash
            for item in self.state.get("processed_items", [])
        )

    def mark_processed(
        self,
        content_hash: str,
        source: str,
        title: str,
        hunt_id: Optional[str] = None,
        success: bool = True,
        error: Optional[str] = None,
    ):
        """Mark an item as processed."""
        self.state["processed_items"].append({
            "hash": content_hash,
            "source": source,
            "title": title,
            "processed_at": datetime.now().isoformat(),
            "hunt_id": hunt_id,
            "success": success,
            "error": error,
        })

        # Update stats
        if success and hunt_id:
            self.state["stats"]["total_hunts_generated"] += 1
        elif not success:
            self.state["stats"]["total_failures"] += 1

    def start_run(self):
        """Mark the start of a new run."""
        self.state["last_run"] = datetime.now().isoformat()
        self.state["stats"]["total_runs"] += 1

    def get_stats(self) -> dict:
        """Get current statistics."""
        return self.state.get("stats", {})


def fetch_intel(dry_run: bool = False, max_items: int = 10) -> list[Path]:
    """
    Fetch security intel using the intel fetcher script.

    Returns a list of CTI file paths.
    """
    print("=" * 60)
    print("Step 1: Fetching Security Intel")
    print("=" * 60)

    # Clear existing intel-drops (fresh fetch each run)
    if INTEL_DROPS_DIR.exists():
        for f in INTEL_DROPS_DIR.glob("*.txt"):
            if not dry_run:
                f.unlink()

    # Run the intel fetcher
    cmd = [
        sys.executable,
        str(Path(__file__).parent / "fetch_secupdates_intel.py"),
        "--max-items", str(max_items),
        "--output-dir", str(INTEL_DROPS_DIR),
    ]

    if dry_run:
        cmd.append("--dry-run")

    print(f"Running: {' '.join(cmd)}")

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,  # 5 minute timeout
        )

        print(result.stdout)
        if result.stderr:
            print(f"Stderr: {result.stderr}")

        if result.returncode != 0:
            print(f"Warning: Intel fetch returned code {result.returncode}")

    except subprocess.TimeoutExpired:
        print("Error: Intel fetch timed out")
        return []
    except Exception as e:
        print(f"Error fetching intel: {e}")
        return []

    # Return list of CTI files
    if dry_run:
        return []

    cti_files = list(INTEL_DROPS_DIR.glob("*.txt"))
    cti_files = [f for f in cti_files if f.name != "fetch_summary.json"]

    print(f"\nFound {len(cti_files)} CTI files to process")
    return sorted(cti_files)


def extract_intel_metadata(cti_file: Path) -> dict:
    """Extract metadata from a CTI file."""
    metadata = {
        "title": cti_file.stem,
        "source": "unknown",
        "source_url": "",
        "content_hash": cti_file.stem.split("-")[0] if "-" in cti_file.stem else "",
    }

    try:
        content = cti_file.read_text()
        lines = content.split("\n")

        for line in lines:
            if line.startswith("# "):
                metadata["title"] = line[2:].strip()
            elif line.startswith("**Source:**"):
                metadata["source"] = line.replace("**Source:**", "").strip()
            elif line.startswith("**URL:**"):
                metadata["source_url"] = line.replace("**URL:**", "").strip()

    except Exception as e:
        print(f"Warning: Could not extract metadata from {cti_file.name}: {e}")

    return metadata


def generate_hunt_from_cti(
    cti_file: Path,
    dry_run: bool = False,
) -> tuple[bool, Optional[str], Optional[str]]:
    """
    Generate a hunt from a CTI file using generate_from_cti.py.

    Returns:
        tuple: (success, hunt_id, error_message)
    """
    print(f"\n  Processing: {cti_file.name}")

    if dry_run:
        print("    [DRY RUN] Would generate hunt")
        return True, "H-DRY-RUN", None

    # Ensure the intel-drops directory only contains this file
    # (generate_from_cti.py processes all files in the directory)
    temp_dir = INTEL_DROPS_DIR / "temp_processing"
    temp_dir.mkdir(parents=True, exist_ok=True)

    # Move other files temporarily
    other_files = [f for f in INTEL_DROPS_DIR.glob("*.txt") if f != cti_file and f.name != "fetch_summary.json"]
    for f in other_files:
        shutil.move(str(f), str(temp_dir / f.name))

    try:
        # Extract source URL for environment variable
        metadata = extract_intel_metadata(cti_file)

        # Set up environment for generate_from_cti.py
        env = os.environ.copy()
        env["CTI_SOURCE_URL"] = metadata.get("source_url", "")
        env["SUBMITTER_NAME"] = SUBMITTER_NAME
        env["PROFILE_LINK"] = PROFILE_LINK

        # Run hunt generator
        cmd = [sys.executable, str(Path(__file__).parent / "generate_from_cti.py")]

        print(f"    Running hunt generator...")
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=180,  # 3 minute timeout per hunt
            env=env,
            cwd=Path(__file__).parent.parent,  # Run from repo root
        )

        print(f"    Output: {result.stdout[-500:] if result.stdout else '(none)'}")

        if result.returncode != 0:
            error_msg = result.stderr or result.stdout or "Unknown error"
            print(f"    Error: {error_msg[-200:]}")
            return False, None, error_msg[-500:]

        # Try to extract hunt ID from output
        hunt_id = None
        if "Successfully wrote hunt to" in result.stdout:
            # Extract hunt ID from output
            import re
            match = re.search(r"Flames/(H-\d{4}-\d{3})\.md", result.stdout)
            if match:
                hunt_id = match.group(1)

        # Also check for newly created files
        if not hunt_id:
            new_hunts = list(FLAMES_DIR.glob("H-*.md"))
            if new_hunts:
                # Get the most recently modified hunt
                newest = max(new_hunts, key=lambda f: f.stat().st_mtime)
                hunt_id = newest.stem

        return True, hunt_id, None

    except subprocess.TimeoutExpired:
        return False, None, "Hunt generation timed out"
    except Exception as e:
        return False, None, str(e)
    finally:
        # Restore other files
        for f in temp_dir.glob("*.txt"):
            shutil.move(str(f), str(INTEL_DROPS_DIR / f.name))
        try:
            temp_dir.rmdir()
        except OSError:
            pass


def move_to_processed(cti_file: Path):
    """Move a processed CTI file to the processed directory."""
    PROCESSED_INTEL_DIR.mkdir(parents=True, exist_ok=True)
    dest = PROCESSED_INTEL_DIR / cti_file.name
    shutil.move(str(cti_file), str(dest))


def generate_summary(
    results: list[dict],
    state: AutonomousState,
) -> str:
    """Generate a human-readable summary of the run."""
    summary_lines = [
        "=" * 60,
        "Autonomous Hunt Generation Summary",
        f"Run Time: {datetime.now().isoformat()}",
        "=" * 60,
        "",
    ]

    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]

    summary_lines.append(f"Total Items Processed: {len(results)}")
    summary_lines.append(f"Successful Hunts: {len(successful)}")
    summary_lines.append(f"Failed: {len(failed)}")
    summary_lines.append("")

    if successful:
        summary_lines.append("Generated Hunts:")
        for r in successful:
            summary_lines.append(f"  - {r['hunt_id']}: {r['title'][:50]}...")
        summary_lines.append("")

    if failed:
        summary_lines.append("Failures:")
        for r in failed:
            summary_lines.append(f"  - {r['title'][:40]}...")
            summary_lines.append(f"    Error: {r['error'][:100] if r['error'] else 'Unknown'}")
        summary_lines.append("")

    stats = state.get_stats()
    summary_lines.append("Cumulative Statistics:")
    summary_lines.append(f"  Total Runs: {stats.get('total_runs', 0)}")
    summary_lines.append(f"  Total Hunts Generated: {stats.get('total_hunts_generated', 0)}")
    summary_lines.append(f"  Total Failures: {stats.get('total_failures', 0)}")

    return "\n".join(summary_lines)


def main():
    parser = argparse.ArgumentParser(
        description="Autonomous threat hunt generation from security intel"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run without making changes (test mode)",
    )
    parser.add_argument(
        "--max-hunts",
        type=int,
        default=5,
        help="Maximum number of hunts to generate per run (default: 5)",
    )
    parser.add_argument(
        "--state-file",
        type=Path,
        default=DEFAULT_STATE_FILE,
        help="Path to the state file",
    )
    parser.add_argument(
        "--skip-fetch",
        action="store_true",
        help="Skip intel fetch, use existing files in intel-drops",
    )

    args = parser.parse_args()

    print("=" * 60)
    print("HEARTH Autonomous Hunt Generator")
    print(f"Time: {datetime.now().isoformat()}")
    print(f"Dry Run: {args.dry_run}")
    print(f"Max Hunts: {args.max_hunts}")
    print("=" * 60)

    # Initialize state
    state = AutonomousState(args.state_file)
    if not args.dry_run:
        state.start_run()

    # Step 1: Fetch intel
    if args.skip_fetch:
        print("\nSkipping intel fetch (using existing files)")
        cti_files = list(INTEL_DROPS_DIR.glob("*.txt"))
        cti_files = [f for f in cti_files if f.name != "fetch_summary.json"]
    else:
        cti_files = fetch_intel(dry_run=args.dry_run, max_items=args.max_hunts * 2)

    if not cti_files:
        print("\nNo CTI files to process. Exiting.")
        return 0

    # Step 2: Process each CTI file
    print("\n" + "=" * 60)
    print("Step 2: Generating Hunts")
    print("=" * 60)

    results = []
    hunts_generated = 0

    for cti_file in cti_files:
        if hunts_generated >= args.max_hunts:
            print(f"\nReached max hunts limit ({args.max_hunts}). Stopping.")
            break

        metadata = extract_intel_metadata(cti_file)

        # Check if already processed
        if state.is_processed(metadata.get("content_hash", "")):
            print(f"\n  Skipping (already processed): {cti_file.name}")
            continue

        # Generate hunt
        success, hunt_id, error = generate_hunt_from_cti(cti_file, dry_run=args.dry_run)

        result = {
            "file": str(cti_file),
            "title": metadata.get("title", ""),
            "source": metadata.get("source", ""),
            "success": success,
            "hunt_id": hunt_id,
            "error": error,
        }
        results.append(result)

        # Update state
        if not args.dry_run:
            state.mark_processed(
                content_hash=metadata.get("content_hash", cti_file.stem),
                source=metadata.get("source", "unknown"),
                title=metadata.get("title", ""),
                hunt_id=hunt_id,
                success=success,
                error=error,
            )

            # Move processed file
            if success:
                move_to_processed(cti_file)
                hunts_generated += 1

    # Step 3: Save state and generate summary
    if not args.dry_run:
        state.save()

    summary = generate_summary(results, state)
    print("\n" + summary)

    # Write summary to file
    summary_file = Path(".hearth/last_run_summary.txt")
    summary_file.parent.mkdir(parents=True, exist_ok=True)
    with open(summary_file, "w") as f:
        f.write(summary)

    # Set GitHub Actions outputs if running in CI
    if "GITHUB_OUTPUT" in os.environ:
        successful = [r for r in results if r["success"]]
        with open(os.environ["GITHUB_OUTPUT"], "a") as f:
            f.write(f"hunts_generated={len(successful)}\n")
            f.write(f"total_processed={len(results)}\n")
            if successful:
                hunt_ids = ",".join([r["hunt_id"] for r in successful if r["hunt_id"]])
                f.write(f"hunt_ids={hunt_ids}\n")

    return 0 if results else 1


if __name__ == "__main__":
    sys.exit(main())
