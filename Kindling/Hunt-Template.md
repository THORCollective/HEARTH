---
id: H000   # Replace with next available ID. H = Flames, B = Embers, M = Alchemy.
category: Flames   # One of: Flames, Embers, Alchemy
hypothesis: >-
  Brief one-sentence description of the adversary behavior you suspect.
tactics:
  - Persistence   # Canonical MITRE ATT&CK tactic name(s)
techniques:
  - T1547.001    # Optional: MITRE technique IDs in dot notation
tags:
  - persistence  # Lowercase, no `#`, underscores instead of dashes
  - registry
submitter:
  name: Your Name
  link: https://github.com/your-handle  # Optional
# Optional fields below — fill in if you have the info, otherwise omit.
# severity: medium                 # critical | high | medium | low | informational
# status: current                  # current | stale | retired (default: current)
# related_hunt_ids: [H012, B003]
# required_data_sources:
#   - Sysmon EventID 13 (RegistryEvent)
# false_positive_notes: |
#   Common admin tooling can trip this; baseline against known scheduled tasks.
# detection_queries:
#   - platform: KQL
#     description: Suspicious Run-key writes
#     query: |
#       DeviceRegistryEvents
#       | where RegistryKey contains "CurrentVersion\\Run"
---

# H000 — Short Hunt Title

## Why

- Why this hunt matters: risks, business impact, threat actor relevance.
- Potential consequences if the behavior is found.
- Connection to known campaigns or critical assets.

## Next Steps

- What data, queries, or follow-up validation is needed.

## References

- https://attack.mitre.org/techniques/T1547/001/
- Add report / blog / writeup links here.

---

### Hunt Types
- **H (Flames)**: Hypothesis-driven hunts.
- **B (Embers)**: Baselining and exploration.
- **M (Alchemy)**: Model-assisted detection.
