# H071

An adversary is leveraging the ClickFix social engineering tactic via compromised WordPress sites targeting visitors to trick them into executing malicious commands.

| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |
|--------|-------------------|--------|-------|------|-----------|
| H071 | An adversary is leveraging the ClickFix social engineering tactic via compromised WordPress sites targeting visitors to trick them into executing malicious commands | Execution (T1204.002) | IClickFix framework identified by Sekoia — widespread WordPress campaign using fake browser/CAPTCHA prompts that instruct users to paste and run PowerShell commands. Uses TDS for targeting. | #clickfix #wordpress #social-engineering #execution #powershell | Jinx (THOR Collective) |

## Why

- ClickFix is a rapidly growing social engineering tactic where fake error/CAPTCHA prompts trick users into pasting attacker-supplied commands into Run dialogs or terminals
- The IClickFix framework industrializes this via a Traffic Distribution System targeting WordPress sites at scale — WordPress powers ~40% of the web
- Bypasses traditional email-based phishing defenses entirely; the malware delivery happens through legitimate-looking websites the user already trusts

## References

- [MITRE ATT&CK T1204.002 - User Execution: Malicious File](https://attack.mitre.org/techniques/T1204/002/)
- [Sekoia - Meet IClickFix: WordPress-targeting framework using ClickFix](https://blog.sekoia.io/meet-iclickfix-a-widespread-wordpress-targeting-framework-using-the-clickfix-tactic/)
- [Malware Patrol - Early February 2026 Threat Reports](https://www.malwarepatrol.net/early-february-2026-cyber-threat-reports/)
