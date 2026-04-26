# HEARTH Hunt Schema

Every hunt markdown file in `Flames/`, `Embers/`, and `Alchemy/` carries YAML frontmatter at the top of the file describing its metadata. This document is the canonical reference for what fields are available, which are required, and what each one means.

The schema is enforced on every PR by `.github/workflows/validate-hunt-schema.yml`. The authoritative definition lives in [`scripts/hunt_schema.py`](../scripts/hunt_schema.py).

## Quick Example

```markdown
---
id: H001
category: Flames
hypothesis: An adversary is brute forcing the VPN admin account.
tactics:
  - Credential Access
techniques:
  - T1110.003
tags:
  - bruteforce
  - vpn
submitter:
  name: Your Name
  link: https://github.com/your-handle
---

# H001 — Brute force VPN admin account

## Why
- Why this hunt matters.

## References
- https://attack.mitre.org/techniques/T1110/003/
```

## Field Reference

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string matching `^[HBM]\d{3,}$` | yes | Hunt ID. `H` for Flames, `B` for Embers, `M` for Alchemy. Sequential, e.g. `H001`, `B016`, `M015`. |
| `category` | enum: `Flames`, `Embers`, `Alchemy` | yes | Which PEAK framework directory this hunt lives in. Must match the directory the file is in. |
| `hypothesis` | string (>=10 chars) | yes | One-sentence description of the suspected adversary behavior. |
| `tactics` | array of strings | yes | Canonical MITRE ATT&CK tactic names (e.g. `Persistence`, `Command and Control`). At least one. |
| `tags` | array of `^[a-z0-9_]+$` | yes | Lowercase keyword tags, no `#` prefix. Underscores instead of dashes/dots. At least one. |
| `submitter` | object: `{name, link?}` | yes | Contributor attribution. `name` required; `link` optional (URL or empty string). |
| `title` | string | no | Display title. If omitted, consumers fall back to the hypothesis. |
| `techniques` | array of `^T\d{4}(\.\d{3})?$` | no | MITRE ATT&CK technique IDs in canonical dot notation, e.g. `T1110`, `T1547.001`. If included, at least one. |
| `severity` | enum: `critical, high, medium, low, informational` | no | Hunt severity / impact rating. |
| `status` | enum: `current, stale, retired` | no | Lifecycle state. Defaults to `current` when omitted. |
| `created` | ISO date (`YYYY-MM-DD`) | no | When this hunt was first authored. Quote the value in YAML so it stays a string. |
| `last_reviewed` | ISO date (`YYYY-MM-DD`) | no | When the hunt was last verified as still relevant. Quote the value in YAML so it stays a string. |
| `related_hunt_ids` | array of `^[HBM]\d{3,}$` | no | Other hunt IDs this one connects to. If included, at least one. |
| `required_data_sources` | array of strings | no | Data sources or telemetry the hunt needs. If included, at least one. |
| `false_positive_notes` | string | no | Known false-positive scenarios; how to baseline. |
| `detection_queries` | array of `{platform, query, description?}` | no | Concrete query examples (KQL, SPL, EQL, SQL, etc.). |
| `notes` | string | no | Free-form notes that don't fit elsewhere. |

`additionalProperties: false` — keys not in this list will fail validation. This catches typos like `tactic` instead of `tactics`.

## Worked Example with All Optional Fields

```markdown
---
id: H042
category: Flames
hypothesis: An adversary modifies the Run registry key for persistence on a workstation.
tactics:
  - Persistence
techniques:
  - T1547.001
tags:
  - persistence
  - registry
  - windows
submitter:
  name: Sydney Marrone
  link: https://x.com/letswastetime
title: Suspicious Run-key persistence
severity: medium
status: current
created: "2026-01-15"
last_reviewed: "2026-04-20"
related_hunt_ids:
  - H012
required_data_sources:
  - Sysmon EventID 13 (RegistryEvent)
  - Microsoft Defender for Endpoint
false_positive_notes: |
  Common admin tooling and software installers also write Run-key entries.
  Baseline against your environment's known-good entries before alerting.
detection_queries:
  - platform: KQL
    description: Suspicious Run-key writes via Defender for Endpoint
    query: |
      DeviceRegistryEvents
      | where RegistryKey contains "CurrentVersion\\Run"
      | where InitiatingProcessFileName !in ("setup.exe", "msiexec.exe")
---

# H042 — Suspicious Run-key persistence

## Why
- Run-key persistence is one of the most common and durable persistence techniques.
- Even baseline-quality detection here catches a wide swath of commodity malware.

## References
- https://attack.mitre.org/techniques/T1547/001/
```

## How to Validate Locally

Before opening a PR, you can run the same checks CI runs:

```bash
# Install deps once
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# Validate every hunt file
.venv/bin/pytest scripts/tests/ -v

# Or validate a specific file
.venv/bin/python -c "
from scripts.hunt_parser import parse_hunt_file
parse_hunt_file('Flames/H001.md', 'Flames')
print('OK')
"
```

## Migrating an Old Hunt File

If you're working on a fork that still has legacy table-format hunts, run:

```bash
.venv/bin/python scripts/migrate_to_frontmatter.py --dry-run    # preview
.venv/bin/python scripts/migrate_to_frontmatter.py              # apply
```

The script is idempotent — re-running on already-migrated files is a no-op.

## Schema Source of Truth

[`scripts/hunt_schema.py`](../scripts/hunt_schema.py) — the JSON Schema dict and `validate_hunt()` function. If a future change adds or removes fields, update that file and re-generate this document.
