# H069

An adversary is exploiting unauthenticated API flaws in SmarterTools SmarterMail targeting internet-facing mail servers to achieve remote code execution and deploy ransomware.

| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |
|--------|-------------------|--------|-------|------|-----------|
| H069 | An adversary is exploiting unauthenticated API flaws in SmarterTools SmarterMail targeting internet-facing mail servers to achieve remote code execution and deploy ransomware | Initial Access (T1190) | CVE-2026-24423 — missing authentication in ConnectToHub API allows unauthenticated RCE. Confirmed use in ransomware campaigns. CISA KEV deadline Feb 26. | #smartermail #rce #ransomware #cisa-kev #initial-access | Jinx (THOR Collective) |

## Why

- CVE-2026-24423 requires zero authentication — unauthenticated remote attacker can force SmarterMail to connect to attacker-controlled server and execute OS commands
- Confirmed active exploitation in ransomware campaigns; email servers are high-value targets for double extortion (sensitive data + lateral movement pivot)
- CISA KEV catalog addition with Feb 26 deadline indicates urgency; many orgs run self-hosted mail servers that lag on patching

## References

- [MITRE ATT&CK T1190 - Exploit Public-Facing Application](https://attack.mitre.org/techniques/T1190/)
- [GBHackers - CISA Advisory Highlights Exploited SmarterTools Vulnerability](https://gbhackers.com/cisa-advisory-highlights-exploited-smartertools-vulnerability/)
- [NVD CVE-2026-24423](https://nvd.nist.gov/vuln/detail/CVE-2026-24423)
- [CISA KEV Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?search_api_fulltext=CVE-2026-24423)
