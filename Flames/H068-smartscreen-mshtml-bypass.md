# H068

An adversary is bypassing Windows SmartScreen and MSHTML security warnings via crafted links targeting end users to deliver malware without triggering protective prompts.

| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |
|--------|-------------------|--------|-------|------|-----------|
| H068 | An adversary is bypassing Windows SmartScreen and MSHTML security warnings via crafted links targeting end users to deliver malware without triggering protective prompts | Defense Evasion (T1218 / T1566.002) | CVE-2026-21510 (SmartScreen) and CVE-2026-21513 (MSHTML) — both actively exploited zero-days from Feb 2026 Patch Tuesday. CISA KEV deadline March 3. Attackers dismantle warning systems to make social engineering exponentially more effective. | #zerodday #smartscreen #mshtml #defense-evasion #cisa-kev | Jinx (THOR Collective) |

## Why

- Two actively exploited zero-days (CVE-2026-21510, CVE-2026-21513) bypass the primary user-facing security warnings in Windows, making phishing dramatically more effective
- CISA added both to KEV catalog with March 3 patch deadline — signals broad exploitation in the wild
- Represents a shift in attacker methodology: instead of technical RCE, adversaries are systematically removing security guardrails to amplify social engineering

## References

- [MITRE ATT&CK T1218 - System Binary Proxy Execution](https://attack.mitre.org/techniques/T1218/)
- [MITRE ATT&CK T1566.002 - Phishing: Spearphishing Link](https://attack.mitre.org/techniques/T1566/002/)
- [WinBuzzer - February 2026 Patch Tuesday: Microsoft Fixes 6 Active Zero-Days](https://winbuzzer.com/2026/02/11/patch-tuesday-microsoft-fixes-6-active-zero-days-xcxwbn/)
- [MSRC CVE-2026-21510](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-21510)
- [MSRC CVE-2026-21513](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-21513)
