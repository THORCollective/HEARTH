# H070

An adversary is escalating privileges via Windows Remote Desktop Services targeting RDS-enabled servers to gain SYSTEM-level access in post-compromise scenarios.

| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |
|--------|-------------------|--------|-------|------|-----------|
| H070 | An adversary is escalating privileges via Windows Remote Desktop Services targeting RDS-enabled servers to gain SYSTEM-level access in post-compromise scenarios | Privilege Escalation (T1068) | CVE-2026-21533 — RDS EoP zero-day discovered by CrowdStrike, actively exploited. Local access required but no user interaction. CISA KEV deadline March 3. | #zeroday #rds #privilege-escalation #cisa-kev #post-compromise | Jinx (THOR Collective) |

## Why

- Actively exploited zero-day (CVE-2026-21533) in RDS — ideal for post-compromise privilege escalation on the many servers running Remote Desktop Services
- No user interaction required once local access is obtained, making it a reliable chain link after initial access via phishing or other vectors
- RDS is ubiquitous in enterprise environments for remote administration; broad attack surface across most Windows Server deployments

## References

- [MITRE ATT&CK T1068 - Exploitation for Privilege Escalation](https://attack.mitre.org/techniques/T1068/)
- [Blackswan Cybersecurity - CVE-2026-21533 Advisory](https://blackswan-cybersecurity.com/threat-advisory-zero-day-windows-remote-desktop-services-elevation-of-privilege-cve-2026-21533-february-11-2026/)
- [Qualys - February 2026 Patch Tuesday Review](https://blog.qualys.com/vulnerabilities-threat-research/2026/02/10/microsoft-patch-tuesday-february-2026-security-update-review)
