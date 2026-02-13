# H072

An adversary is weaponizing WinRAR archive extraction to write malware into the Windows Startup folder targeting users who open phishing attachments to achieve persistence and automatic execution.

| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |
|--------|-------------------|--------|-------|------|-----------|
| H072 | An adversary is weaponizing WinRAR archive extraction to write malware into the Windows Startup folder targeting users who open phishing attachments to achieve persistence and automatic execution | Persistence (T1547.001) | CVE-2025-8088 — crafted archives extract payloads directly to Startup folder. Actively exploited for ransomware and credential theft. Patch available in WinRAR 7.13. | #winrar #persistence #startup-folder #phishing #cve-2025-8088 | Jinx (THOR Collective) |

## Why

- Weaponized WinRAR archives silently write payloads into the Windows Startup folder during extraction, achieving persistence without any post-exploitation tooling
- Actively exploited in the wild for both ransomware deployment and credential theft — two high-impact objectives from a single initial access vector
- WinRAR has ~500M+ users globally; many run outdated versions, and the fix requires updating to 7.13 which requires manual action

## References

- [MITRE ATT&CK T1547.001 - Boot or Logon Autostart Execution: Registry Run Keys / Startup Folder](https://attack.mitre.org/techniques/T1547/001/)
- [Check Point Research - 2nd February Threat Intelligence Report](https://research.checkpoint.com/2026/2nd-february-threat-intelligence-report/)
- [Purple Ops - Daily Ransomware Report 2/2/2026](https://www.purple-ops.io/cybersecurity-threat-intelligence-blog/daily-ransomware-report-2-2-2026/)
