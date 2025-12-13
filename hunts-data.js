// Auto-generated hunt data from markdown files
const HUNTS_DATA = [
  {
    "id": "B001",
    "category": "Embers",
    "title": "Unusual spikes in outbound network traffic over port 443 may indicate unauthorized data exfiltration.",
    "tactic": "Command and Control, Exfiltration",
    "notes": "Establishing normal traffic patterns to detect deviations",
    "tags": [
      "baseline",
      "networktraffic",
      "anomalydetection"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://x.com/letswastetime"
    },
    "why": "- Port 443 is commonly used for legitimate HTTPS traffic, making it an attractive channel for attackers to hide data exfil activities within encrypted traffic.\n- By using a well-known port like 443, adversaries can blend malicious traffic with normal traffic, reducing the likelihood of detection by traditional security controls.\n- Spikes in traffic over port 443 can signal an exfil attempt, as attackers may try to move data through encrypted channels that are less scrutinized.",
    "references": "- https://attack.mitre.org/techniques/T1071/001/\n- https://github.com/guardsight/gsvsoc_threat-hunting\n- https://www.splunk.com/en_us/blog/it/understanding-and-baselining-network-behaviour-using-machine-learning-part-i.html",
    "file_path": "Embers/B001.md"
  },
  {
    "id": "B002",
    "category": "Embers",
    "title": "AnyDesk Remote monitoring and management (RMM) tool not writing a file named \"gcapi.dll\" during installation may indicate a malicious version of AnyDesk was installed to establish persistence.",
    "tactic": "Persistence",
    "notes": "Establish a baseline of expected legitimate RMM tool behavior. Profile normal directory paths, remote connection domains, remote IP addresses and files written by RMM tools.",
    "tags": [
      "baseline",
      "persistence",
      "anomalydetection"
    ],
    "submitter": {
      "name": "John Grageda",
      "link": "https://www.linkedin.com/in/johngrageda/"
    },
    "why": "- RMM tools provide detection evasion, particularly in environments where IT departments use RMM tools for business purposes. \n- 70% increase in adversary use of RMM tools.  \n- AnyDesk normally writes a file named \"gcapi.dll\"; files with other names may be malicious.\n- AnyDesk is typically installed to C:\\ProgramData\\AnyDesk\\AnyDesk.exe by default; other locations may be malicious.\n- AnyDesk cli instalers (exe and MSI versions) run with the --install flag; adversaries typically install AnyDesk with the --silent flag.",
    "references": "- https://attack.mitre.org/techniques/T1219/\n- https://go.crowdstrike.com/rs/281-OBQ-266/images/CrowdStrike2024ThreatHuntingReport.pdf?version=0\n- https://www.nccgroup.com/us/research-blog/the-dark-side-how-threat-actors-leverage-anydesk-for-malicious-activities/",
    "file_path": "Embers/B002.md"
  },
  {
    "id": "B003",
    "category": "Embers",
    "title": "Executables or scripts set in the rdpwd StartupPrograms registry key may indicate that an adversary has achieved persistence by setting a program to execute during an RDP login session.",
    "tactic": "Persistence",
    "notes": "Establish a baseline of expected programs that are set to execute via \"HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\\Wds\\rdpwd\\StartupPrograms\" registry key.",
    "tags": [
      "baseline",
      "persistence",
      "anomalydetection"
    ],
    "submitter": {
      "name": "John Grageda",
      "link": "https://www.linkedin.com/in/johngrageda/"
    },
    "why": "- When a user logs into a computer via RDP, Windows will search for the StartupPrograms registry key in HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\\Wds\\rdpwd\\ and execute it. \n- The default value of \"HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\\Wds\\rdpwd\\StartupPrograms\" is rdpclip.\n- Any values other than rdplip will stand out and should be explored.",
    "references": "- https://attack.mitre.org/techniques/T1547/001/\n- https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1547.001/T1547.001.md#atomic-test-18---allowing-custom-application-to-execute-during-new-rdp-logon-session\n- https://www.cyberark.com/resources/threat-research-blog/persistence-techniques-that-persist",
    "file_path": "Embers/B003.md"
  },
  {
    "id": "B004",
    "category": "Embers",
    "title": "Identifying anomalous accounts may uncover adversary attempts to maintain persistence to compromised assets.",
    "tactic": "Persistence",
    "notes": "Establish a baseline of expected accounts and consider creating signals/alerts/review processes when new accounts are created.",
    "tags": [
      "baseline",
      "persistence",
      "anomalydetection",
      "sus"
    ],
    "submitter": {
      "name": "Jamie Williams",
      "link": "https://x.com/jamieantisocial"
    },
    "why": "- Adversary-created and controlled accounts may provide a persistent backdoor to compromised assets\n- Accounts may be created on various types of assets - including desktops, servers, AD/domain services ([H008](https://github.com/triw0lf/THOR/blob/main/Hunts/Hypothesis-Driven/H008.md)), cloud applications/environments, and edge devices\n- **Note:** Adversaries may also attempt to hide ([T1564.002 - Hide Artifacts: Hidden Users](https://attack.mitre.org/techniques/T1564/002/)) or otherwise conceal created accounts. Very commonly, malicious accounts will try to mimic common naming conventions, or even match those of the victim environment ([T1036 - Masquerading](https://attack.mitre.org/techniques/T1036/))",
    "references": "- [T1136 - Create Account](https://attack.mitre.org/techniques/T1136/)\n- [Windows Security Log Event ID 4720: A user account was created](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=4720)\n- [Active Directory accounts](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-default-user-accounts)",
    "file_path": "Embers/B004.md"
  },
  {
    "id": "B005",
    "category": "Embers",
    "title": "Adversaries are exploiting the native Windows process Rundll32 in order to execute malicious code and bypass application control solutions.",
    "tactic": "Execution, Defense Evasion",
    "notes": "The scope of this hunt could become too wide without defining an area of focus. For one hunt, it might be best to pursue one category of visibility such as command,k process, or module monitoring.",
    "tags": [
      "Execution",
      "DefenseEvasion",
      "LOLBIN",
      "Rundll32"
    ],
    "submitter": {
      "name": "Claire Stromboe",
      "link": "https://x.com/csthreathunting"
    },
    "why": "- A successful attack usually means legitimate DLLs or functions are abused, or malicious adversary-supplied DLLs are executed\n- Objectives may be accomplished on payload installation/execution, credential theft, or broader goals such as data theft\n- Associated with QakBot, APT28, APT29, Lazarus Group, and many more",
    "references": "- https://github.com/SigmaHQ/sigma/blob/master/rules/windows/process_creation\n- https://redcanary.com/threat-detection-report/techniques/rundll32/\n- https://lolbas-project.github.io/lolbas/Binaries/Rundll32/\n- https://attack.mitre.org/techniques/T1218/011/",
    "file_path": "Embers/B005.md"
  },
  {
    "id": "B006",
    "category": "Embers",
    "title": "Adversaries are leveraging suspicious browser extensions to collect and exfiltrate sensitive data.",
    "tactic": "Collection, Exfiltration",
    "notes": "The scope of this hunt could become too wide without defining what is considered known good browser extensions. Consider focusing your first baseline on a subsection of the business, specific browser, or by excluding allowed extensions.",
    "tags": [
      "Collection",
      "Exfiltration",
      "BrowserExtensions"
    ],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Threat actors are known to leverage unauthorized browser extensions to exfiltrate data in a way that blends in with normal browsing traffic\n- You may discover suspicious or malicious browser extensions that are performing other unwanted behaviors\n- Similar to unauthorize programs, browser extensions can introduce risk both from an acceptable use violation and malicious perspective",
    "references": "- https://cloud.google.com/blog/topics/threat-intelligence/lnk-between-browsers/\n- https://www.securityweek.com/attackers-leverage-locally-loaded-chrome-extension-data-exfiltration/\n- https://www.trendmicro.com/en_us/research/23/k/parasitesnatcher-how-malicious-chrome-extensions-target-brazil-.html\n- https://www.zscaler.com/blogs/security-research/kimsuky-deploys-translatext-target-south-korean-academia",
    "file_path": "Embers/B006.md"
  },
  {
    "id": "B007",
    "category": "Embers",
    "title": "Adversaries are automatically exfiltrating email data using email forwarding rules.",
    "tactic": "Collection, Exfiltration",
    "notes": "Email forwarding rules may be disabled in your organization, it may be beneficial to see what rules were setup regardless of success to identify potential malicious activity.",
    "tags": [
      "Collection",
      "Exfiltration",
      "Email",
      "MailForwarding"
    ],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Threat actors may abuse mail forwarding rules, which are easy to setup in most corporate mail applications, to exfiltrate or monitor a compromised mailbox\n- Any user can create mail forwarding rules without permission escalation, unless corporate settings lock down the capability",
    "references": "- https://www.microsoft.com/en-us/security/blog/2022/03/22/dev-0537-criminal-actor-targeting-organizations-for-data-exfiltration-and-destruction/\n- https://www.documentcloud.org/documents/20418317-fbi-pin-bc-cyber-criminals-exploit-email-rule-vulerability-11252020/\n- https://www.splunk.com/en_us/blog/security/hunting-m365-invaders-dissecting-email-collection-techniques.html\n- https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-341a",
    "file_path": "Embers/B007.md"
  },
  {
    "id": "B008",
    "category": "Embers",
    "title": "Threat actors added an existing or newly created (B004) user to a privileged Active Directory (AD) security group to maintain persistence or achieve other objectives in an elevated context.",
    "tactic": "Privilege Escalation",
    "notes": "Establish a baseline for additions to privileged AD security groups using Windows event logs (e.g., 4732, 4728, 4756). Suggested target security groups include (built-in) Administrators, Domain Admins, Enterprise Admins, and Schema Admins. See reference 1 (R1) for a suggested list of security groups, the prioritization of specific groups is likely to depend on the defender's environment.",
    "tags": [
      "baseline",
      "privilege_escalation",
      "anomalydetection"
    ],
    "submitter": {
      "name": "Jon Perez",
      "link": "https://bsky.app/profile/j-nohandle.bsky.social"
    },
    "why": "- Threat actors abuse privileged AD security groups to provide an account they control with an elevated context to achieve additional objectives/tactics.\n- Performing this baseline enables defenders quickly identify and investigate additions to privileged AD groups.\n- Defenders will learn more about their environment and are likely to find internal data sources that will help determine the disposition of the addition to the security group.",
    "references": "- https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/security-best-practices/appendix-b--privileged-accounts-and-groups-in-active-directory\n- https://attack.mitre.org/techniques/T1098/\n- https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/audit-security-group-management",
    "file_path": "Embers/B008.md"
  },
  {
    "id": "B009",
    "category": "Embers",
    "title": "Microsoft Playwright testing framework caches versions of various browsers for automated testing. In some version or configurations of this framework, the Firefox version is based on Firefox's Nightly.app, the developer-facing and, by Mozilla's own admission, least stable and secure version of the app. EDRs may flag this version of the app (often saved in this file hierarchy/structure: _\"~/Library/Caches/ms-playwright/firefox-<4-digit version number>/firefox/Nightly.app\"_) as vulnerable and thus a security concern. These vulnerable apps should be reviewed to determine (1) that it is indeed a legitimate file and not a spoof and (2) whether even a legitimate version of the app should be allowed. Dependencies for testing frameworks should be reviewed and allowed/disallowed as necessary.",
    "tactic": "Defense Evasion (TA0005), Trusted Developer Utilities Proxy Execution (T1127), Masquerading (T1036), Exploitation for Defense Evasion (T1211)",
    "notes": "Awareness should be raised about the flagging of Firefox Nightly.app by EDRs and the necessity for validating all dependencies associated with testing frameworks.",
    "tags": [
      "DefenseEvasion",
      "Masquerading",
      "TrustedDeveloperUtilities",
      "ProxyExecution"
    ],
    "submitter": {
      "name": "Joshua Hines",
      "link": ""
    },
    "why": "- This hunt highlights the dangers of dependencies within frameworks; as stated above, many were unaware of the apps existence as no one had manually downloaded it.\n- Exploitation of testing frameworks can lead to higher-level access of systems.\n- As the vulnerability is related to developer utilities (Microsoft Playwright testing framework), it could be an unexpected foothold into the development environment.",
    "references": "- https://attack.mitre.org/tactics/TA0005/\n- https://attack.mitre.org/techniques/T1127/\n- https://attack.mitre.org/techniques/T1036/\n- https://attack.mitre.org/techniques/T1211/\n- https://www.firefox.com/en-US/firefox/144.0a1/releasenotes/",
    "file_path": "Embers/B009.md"
  },
  {
    "id": "B010",
    "category": "Embers",
    "title": "Establish a normal behavior baseline for VPC peering across your AWS environment, so that future deviations (e.g., unauthorized peering, unusual traffic patterns) can be more easily hunted/detected. Peering may be normal in your environment, but this is an opportunity to not only understand your cloud environment on a deeper level, but to collaborate with other teams to ensure the proper controls are in place.",
    "tactic": "Lateral Movement",
    "notes": "Explore typical peering requests, initiators, unusual IPs, and connection events.",
    "tags": [
      "LateralMovement"
    ],
    "submitter": {
      "name": "Bruce Breuer",
      "link": ""
    },
    "why": "The hunt helps establish a baseline for VPC peering activity, enabling detection of lateral movement in the cloud. It also supports risk reduction through targeted arcitecture review and enhances overall visibility into cloud network operations.",
    "references": "https://www.wiz.io/academy/what-is-lateral-movement\nhttps://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html",
    "file_path": "Embers/B010.md"
  },
  {
    "id": "B011",
    "category": "Embers",
    "title": "Establish a normal utilization of Xcode and Xcode projects across workstations/servers. Xcode projects are commonly used by software developers and can be targeted by MacOS malware.",
    "tactic": "Initial Access",
    "notes": "Indicators of Xcode usage can be found in EDR telemetry and potential for detection if Xcode is not utilized/approved in the environment.",
    "tags": [
      "InitialAccess",
      "Baseline"
    ],
    "submitter": {
      "name": "Collin McClaine",
      "link": ""
    },
    "why": "- Xcode projects can be infected and the malware can propagate when Xcode projects are shared by developers.",
    "references": "https://attack.mitre.org/software/S0658/\nhttps://www.microsoft.com/en-us/security/blog/2025/09/25/xcsset-evolves-again-analyzing-the-latest-updates-to-xcssets-inventory/\nhttps://attack.mitre.org/techniques/T1195/001/\nhttps://attack.mitre.org/tactics/TA0001/",
    "file_path": "Embers/B011.md"
  },
  {
    "id": "H001",
    "category": "Flames",
    "title": "An adversary is attempting to brute force the admin account on the externally facing VPN gateway.",
    "tactic": "Credential Access",
    "notes": "Attackers want to gain initial access through elevated credentials and move laterally",
    "tags": [
      "credentialaccess",
      "bruteforce",
      "vpn"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://x.com/letswastetime"
    },
    "why": "- The admin account on an externally facing VPN gateway provides significant control over network access, making it a prime target for adversaries.\n- Successful brute force attacks on this account could lead to unauthorized access to the internal network, bypassing other security controls.\n- Brute force attempts on the VPN gateway may be part of a larger campaign targeting critical infrastructure, necessitating immediate investigation and response.",
    "references": "- https://attack.mitre.org/techniques/T1110/\n- https://medium.com/threatpunter/okta-threat-hunting-tips-62dc0013d526",
    "file_path": "Flames/H001.md"
  },
  {
    "id": "H002",
    "category": "Flames",
    "title": "Adversaries are abusing response features included in EDR and other defensive tools that enable remote access.",
    "tactic": "Command and Control",
    "notes": "Attackers are very interested in using commercial tools or similar to \"live off the land\"",
    "tags": [
      "commandandcontrol",
      "remoteaccess",
      "edr",
      "lolbin"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://x.com/letswastetime"
    },
    "why": "- Identify non-approved or malicious EDRs used by threat actors for persistence, surveillance, or launching internal attacks.\n- Fill gaps in monitoring by proactively searching for artifacts and signals that standard tools might miss, improving detection of potential threats.\n- Uncover and stop attackers from repurposing legitimate EDRs or deploying fraudulent instances for malicious purposes.",
    "references": "- https://attack.mitre.org/techniques/T1219/\n- https://x.com/jamieantisocial/status/1829617254860013981\n- https://github.com/cbecks2/edr-artifacts/tree/main",
    "file_path": "Flames/H002.md"
  },
  {
    "id": "H003",
    "category": "Flames",
    "title": "An adversary has exfiltrated data off backup servers into small (1MB) .zip files.",
    "tactic": "Exfiltration",
    "notes": "Attackers often need to get data out, 1MB chunks sneak beneath big file anomaly detection. Consider different file sizes and types based on normal in your environment.",
    "tags": [
      "exfiltration"
    ],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Adversaries often need to take data in order to extort companies for money.\n- Data transfer limits and monitoring are effective controls for stopping malware, data loss, and other nefarious activities. \n- Breaking data up into small chunks sticks below transfer limits, and using .zip files allows adversaries to blend in with normal traffic.",
    "references": "- https://attack.mitre.org/techniques/T1030/\n- https://www.cisa.gov/news-events/cybersecurity-advisories/aa22-277a\n- https://media.defense.gov/2021/Jul/01/2002753896/-1/-1/1/CSA_GRU_GLOBAL_BRUTE_FORCE_CAMPAIGN_UOO158036-21.PDF",
    "file_path": "Flames/H003.md"
  },
  {
    "id": "H004",
    "category": "Flames",
    "title": "An adversary is leveraging BITSAdmin jobs to download and execute payloads.",
    "tactic": "Persistence",
    "notes": "Attackers are interested in using living off the land binaries (LOLbin) to evade detection.",
    "tags": [
      "persistence",
      "lolbin",
      "windows"
    ],
    "submitter": {
      "name": "John Grageda",
      "link": "https://www.linkedin.com/in/johngrageda/"
    },
    "why": "- BITSAdmin is a tool preinstalled on Windows operating systems.\n- BITS tasks are self-contained in the BITS job database, without new files or registry modifications, and often permitted by host firewalls.\n- Often used by IT Administrators",
    "references": "- https://attack.mitre.org/techniques/T1197/\n- https://redcanary.com/blog/threat-detection/bitsadmin/",
    "file_path": "Flames/H004.md"
  },
  {
    "id": "H005",
    "category": "Flames",
    "title": "An adversary is establishing persistence on Linux hosts by executing commands triggered by a user's shell via .bash_profile, .bashrc, and .bash_login/logout.",
    "tactic": "Persistence",
    "notes": "Attackers are interested in using living off the land binaries and scripts (LOLBAS) to evade detection.",
    "tags": [
      "persistence",
      "lolbas",
      "linux"
    ],
    "submitter": {
      "name": "John Grageda",
      "link": "https://www.linkedin.com/in/johngrageda/"
    },
    "why": "- .bash_profile, .bashrc, .bash_login scripts execute when a user opens a cli or connects remotely. \n- .bash_logout (if it exists) scripts execute when a user exits a session or logs ourt of an interactive login shell session like SSH. \n-  Often used by IT Administrators to execute scripts at user logon",
    "references": "- https://attack.mitre.org/techniques/T1546/004/\n- https://pberba.github.io/security/2022/02/06/linux-threat-hunting-for-persistence-initialization-scripts-and-shell-configuration/",
    "file_path": "Flames/H005.md"
  },
  {
    "id": "H006",
    "category": "Flames",
    "title": "After compromising an initial asset, an adversary may attempt to pivot to access additional resources within a victim network.",
    "tactic": "Lateral Movement",
    "notes": "Adversaries often abuse legitimate remote access features (such as RDP and SSH) already enabled in the environment.",
    "tags": [
      "lateralmovement",
      "sus"
    ],
    "submitter": {
      "name": "Jamie Williams",
      "link": "https://x.com/jamieantisocial"
    },
    "why": "- Adversaries may seek access beyond the initially compromised asset (i.e., to steal additional data, deploy ransomware, etc.)\n- Legitimate remote access features may be abused by adversaries, and may also extend between network boundaries (i.e., on-prem to cloud)\n    - Commonly abused remote protocols include:\n        - Remote Desktop Protocol (RDP), destination port `3389` ([T1021.001](https://attack.mitre.org/techniques/T1021/001/))\n        - Server Message Block (SMB), destination ports `139` or `445` ([T1021.002](https://attack.mitre.org/techniques/T1021/002/))\n        - Secure Shell (SSH), destination port `22` ([T1021.004](https://attack.mitre.org/techniques/T1021/004/))\n        - Windows Management Instrumentation (WMI), destination ports `135` or `5985`/`5986` ([T1047](https://attack.mitre.org/techniques/T1047/))\n- Abuse of these features is often leveraging legitimate user credentials ([T1078 - Valid Accounts](https://attack.mitre.org/techniques/T1078/)), so tracing the activity of known-compromised accounts may also highlight potential lateral movement activity\n- Analyzing adversary enumeration commands may also shed light on potential lateral movement activity (i.e., what assets did the adversary discover during [T1018 - Remote System Discovery](https://attack.mitre.org/techniques/T1018/)?)",
    "references": "- [T1021 - Remote Services](https://attack.mitre.org/techniques/T1021/)\n- [Windows Security Log Event ID 4624: An account was successfully logged on](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=4624)",
    "file_path": "Flames/H006.md"
  },
  {
    "id": "H007",
    "category": "Flames",
    "title": "After compromising a host, adversaries may attempt to execute malicious commands to complete additional tasks.",
    "tactic": "Execution",
    "notes": "Adversaries often abuse legitimate command interpreters/applications, such as CMD, PowerShell, or bash/zsh.",
    "tags": [
      "execution",
      "sus"
    ],
    "submitter": {
      "name": "Jamie Williams",
      "link": "https://x.com/jamieantisocial"
    },
    "why": "- Adversaries often abuse accessible terminal/shell applications to execute post-compromise tasks\n- Malicious command execution may be identifiable by characteristics of the:\n  - command (e.g., `whoami` or other rare [Discovery](https://attack.mitre.org/tactics/TA0007/) activity) as well as attempts to obfuscate executed commands ([T1027.010 - Obfuscated Files or Information: Command Obfuscation](https://attack.mitre.org/techniques/T1027/010/))\n  - user/host (e.g., does`{person}` in `{department}` ever execute admin commands like this?)\n  - command -- adversaries/malware typically execute very common [Discovery](https://attack.mitre.org/tactics/TA0007/) commands that may also be rare for your environment (especially when executed in succession), such as:\n      - `whomai`\n      - `ipconfig /all`\n      - `nltest /domain_trusts`\n      - `net localgroup administrators`\n      - `net group \"Domain Computers\" /domain`\n      - `systeminfo`\n      - `route print`\n      - `net view /all`\n      - `net config workstation`",
    "references": "- [T1059 - Command and Scripting Interpreter](https://attack.mitre.org/techniques/T1059/)\n- [LOLBAS Cmd.exe](https://lolbas-project.github.io/lolbas/Binaries/Cmd/)\n- [GTFOBins bash](https://gtfobins.github.io/gtfobins/bash/)\n- [GTFOBins zsh](https://gtfobins.github.io/gtfobins/zsh/)\n- [The DFIR Report](https://thedfirreport.com/)\n- [Ransomware-Tool-Matrix](https://github.com/BushidoUK/Ransomware-Tool-Matrix)",
    "file_path": "Flames/H007.md"
  },
  {
    "id": "H008",
    "category": "Flames",
    "title": "Adversaries may create domain accounts to maintain access to systems with Active Directory.",
    "tactic": "Persistence",
    "notes": "Domain Accounts can cover user, administrator, and service accounts.",
    "tags": [
      "Persistence",
      "ActiveDirectory"
    ],
    "submitter": {
      "name": "Audra Streetman",
      "link": "https://x.com/audrastreetman"
    },
    "why": "- Domain accounts \"may be used to establish secondary credentialed access that does not require persistent remote access tools to be deployed on the system,\" according to MITRE ATT&CK.\n- Empire, PsExec, Pupy, and Net (net user /add /domain) are examples of tools, utilities and frameworks that can create a new domain user, if permissions allow.\n- This technique has been used by adversaries such as Sandworm in the 2015 and 2016 attacks targeting Ukraine's electric grid, and also in attacks attributed to the cybercriminal group Wizard Spider.",
    "references": "- https://attack.mitre.org/techniques/T1136/002/\n- https://github.com/0xAnalyst/CB-Threat-Hunting/blob/master/ATT%26CK/T1136.002%20-%20Domain%20Account%20Creation.md\n- https://www.splunk.com/en_us/blog/security/active-directory-discovery-detection-threat-research-release-september-2021.html",
    "file_path": "Flames/H008.md"
  },
  {
    "id": "H009",
    "category": "Flames",
    "title": "Attackers may exploit mshta.exe, a trusted Windows utility, to execute malicious .hta files as well as JavaScript or VBScript indirectly. Mshta.exe is designed to run Microsoft HTML Applications (HTA) files, which are stand-alone applications that operate independently of the browser but use the same frameworks and technologies as Internet Explorer. This utility's trusted status can make it a valuable tool for adversaries seeking to evade detection and execute code stealthily.",
    "tactic": "Defense Evasion",
    "notes": "Data requirements: Windows Sysmon, EDR telemetry, Proxy logs",
    "tags": [
      "DefenseEvasion",
      "SystemBinaryProxyExecutionMshta"
    ],
    "submitter": {
      "name": "Azrara",
      "link": "https://github.com/Azrara"
    },
    "why": "- Hunting for malicious mshta.exe activity provides critical early detection of potential threats by targeting a commonly exploited Windows utility that attackers use to evade security defenses.\n- This hunt improves threat visibility, enhances detection accuracy, and mitigates the risk of full-scale attacks by catching adversaries in the early stages.",
    "references": "- https://attack.mitre.org/techniques/T1218/005/\n- https://redcanary.com/threat-detection-report/techniques/mshta/",
    "file_path": "Flames/H009.md"
  },
  {
    "id": "H010",
    "category": "Flames",
    "title": "Adversaries may search for network shares on compromised systems to locate files of interest. Sensitive data can be gathered from remote systems via shared network drives (host-shared directories, network file servers, etc.) that are accessible from the current system before exfiltration.",
    "tactic": "Collection",
    "notes": "<ul><li>Data requirements: EDR telemetry, Windows event logs id 5140</li></br><li>Implementation examples in SIGMA:</li></br>Title: Suspicious Network Share Enumeration and Access</br>Id:xxxxx</br>Status: test</br>Description: Detects commands used for network share enumeration and correlates with Event ID 5140 for access to shared resources.</br>Author: Your Name</br>Date:2024/11/14</br>Tags:</br><ul><li>attack.discovery</br><li>attack.t1135</li></ul></br>logsource:</br>category: process_creation</br>product:windows</br>detection:</br>selection_cmd:</br>Image&#124;endswith:</br><ul><li>'\\cmd.exe'</br><li>'\\powershell.exe'</br>ComandLine&#124;contains&#124;all:</br><li>'net view'</br><li>'&bsol;'</br>selection_event:</br>EventID: 5140</br>condition: selection_cmd or selection_event</br>falsepositives:</br><li>Legitimate administrative tasks</br><li>Regular file-sharing activities</br>level: medium",
    "tags": [
      "collection",
      "DatafromNetworkSharedDrive"
    ],
    "submitter": {
      "name": "Azrara",
      "link": "https://github.com/Azrara"
    },
    "why": "- Hunting for adversarial activity involving network share exploration on compromised systems is crucial for detecting potential data theft early.\n- By monitoring access to shared network drives and tracking unusual usage of command shell functions, defenders can identify attempts to locate and collect sensitive data before it is exfiltrated.",
    "references": "- https://research.splunk.com/endpoint/4dc3951f-b3f8-4f46-b412-76a483f72277/\n- https://attack.mitre.org/techniques/T1039/",
    "file_path": "Flames/H010.md"
  },
  {
    "id": "H011",
    "category": "Flames",
    "title": "For sideloading a DLL into vulnerable binary, a threat actors would be dropping (creating) EXE and DLL files under user writeable directories and then executing the same newly created EXE file so that it loads the newly created and unverified (Dig sign unverified) DLL from the same directory.",
    "tactic": "Persistence, Privilege Escalation, Defense Evasion",
    "notes": "Limitations: There are no such limitations other than non-availability of required logs. Sometimes, we tend to not collect \"Module Load\" events due to their huge volume. In such case we would not be able to perform this hunt. Also, for correlation of data we need advance query language such as SQL, KQL or better enough if we can use Pandas.</br></br>Assumption: Assuming that threat actor is using standard user rights and is using a DLL that has unverifiable digital signature (DLL is signed but certificates are not verified).</br></br>Data sets required: EDR logs - \"File Creation\" and \"Module Load\" events.</br></br>Query creation steps:</br></br>1. Select .dll File Creation Events: From the \"File Creation\" logs, select all .dll file creation events. Ensure that the folder path of the newly created .dll file is not among the following: c:\\windows\\system32, c:\\windows\\syswow64, and c:\\windows\\sxs. Additionally, the verification status of the .dll file should be \"Not Verified\".</br></br>2. Select .exe File Creation Events: Next, from the \"File Creation\" logs, select all .exe file creation events. The condition for selection is that the folder path of the .exe file matches the folder path of the .dll files identified in the previous step. Furthermore, the absolute time difference between the .dll file creation event and the .exe file creation event should be less than one minute.</br></br>3. Select DLL Load Events: Finally, from the \"Module Load\" logs, select all DLL load events where the file name and path of the loaded DLL and the file name and path of the EXE loading that DLL match the names and paths of the .dll and .exe files identified in the previous steps. Additionally, the time of the module load event should be greater than the time of the DLL creation event.",
    "tags": [
      "Persistence",
      "Privilege",
      "Defense",
      "DLLSideloading"
    ],
    "submitter": {
      "name": "hu983r",
      "link": "https://github.com/Communicateme"
    },
    "why": "- What security risks or threats does this hunt address?</br>This hunt addresses the security risk of DLL sideloading, a technique where attackers exploit the Windows DLL search order to load malicious DLLs instead of legitimate ones. This can be used to execute arbitrary code, escalate privileges, or maintain persistence within a compromised system1.\n- What are the potential impacts if malicious activity is found?</br>If malicious activity is found, it could lead to data breaches, unauthorized access to sensitive information, and potential disruption of critical services. Attackers could gain control over the system, leading to further exploitation and compromise of additional assets.\n- How does this hunt connect to known threat campaigns or protect critical assets?</br>This hunt is connected to known threat campaigns such as those conducted by APT41, APT41 (also known as Winnti Group), and other advanced threat actors. By detecting DLL sideloading attempts, organizations can protect critical assets like sensitive data, intellectual property, and critical infrastructure from being compromised.\n- Why would this hunt be valuable to the community?</br>This DLL sideloading technique is particularly valuable because it is often missed by Endpoint Detection and Response (EDR) systems. This is due to the fact that DLL sideloading can masquerade as legitimate application behavior, making it difficult for EDRs to differentiate between benign and malicious activity. Attackers exploit trusted binaries to load their malicious DLLs, effectively bypassing security controls.\nBy conducting hunts specifically targeting this behavior, we can identify and mitigate threats that would otherwise go undetected by traditional EDR solutions. This proactive approach helps the community to enhance their detection capabilities, protect critical assets, and reduce the overall risk of a security breach.",
    "references": "- https://attack.mitre.org/techniques/T1574/002/\n- https://www.group-ib.com/blog/hunting-rituals-dll-side-loading/\n- https://www.cybereason.com/blog/threat-analysis-report-dll-side-loading-widely-abused",
    "file_path": "Flames/H011.md"
  },
  {
    "id": "H012",
    "category": "Flames",
    "title": "An adversary is utilizing DNS tunneling to exfiltrate data through DNS port 53.",
    "tactic": "Exfiltration",
    "notes": "Attackers are interested in finding unmonitored communication channels to evade detection.",
    "tags": [
      "DNS",
      "Tunneling",
      "Exfiltration"
    ],
    "submitter": {
      "name": "Cody Lunday",
      "link": "https://www.linkedin.com/in/codylunday/"
    },
    "why": "- DNS is commonly ignored or lightly monitored by enterprise defense strategies.\n- DNS tunneling exploits may give attackers an accessible backchannel to exfiltrate stolen information.\n- DNS provides a covert means of correspondence to bypass firewalls.",
    "references": "- https://attack.mitre.org/techniques/T1048/\n- https://www.socinvestigation.com/threat-hunting-using-dns-logs-soc-incident-response-procedure/\n- https://brightsec.com/blog/dns-tunneling/\n- https://blueteamresources.in/detect-and-investigate-dns-tunneling/",
    "file_path": "Flames/H012.md"
  },
  {
    "id": "H013",
    "category": "Flames",
    "title": "Attackers often utilize PowerShell, a powerful scripting language available on Windows systems, to execute malicious commands, download additional payloads, or manipulate system configurations. Detecting the execution of unauthorized or suspicious PowerShell scripts is crucial, as it may indicate the presence of an adversary attempting to compromise the system. Native windows Event ID 4104 is crucial to detect suspicious script executions.",
    "tactic": "Execution",
    "notes": "Below are key implementation notes to guide this process: <br></br>1. Sysmon Configuration<br></br>Event ID 1 (Process Creation): Configure Sysmon to capture detailed information about process creations, focusing on powershell.exe executions. Ensure that command-line arguments are logged to detect potentially malicious scripts or commands.<br></br>Event ID 4104 (PowerShell Script Block Logging): While Sysmon does not natively capture PowerShell script block logging, enabling this feature in PowerShell settings can provide visibility into the content of executed scripts. This requires configuring PowerShell to log detailed script blocks to the Windows Event Log.<br></br>2. Detection Logic and Filtering<br></br>Baseline Normal Activity: Establish a baseline of normal PowerShell usage within the environment to differentiate between legitimate administrative activities and potential malicious behavior.<br></br>Anomaly Detection: Develop detection rules to identify anomalies, such as unusual command-line arguments, execution times, or user contexts that deviate from the established baseline.<br></br>Filtering Noise: Apply filters to exclude known legitimate PowerShell activities to reduce false positives and focus on suspicious events.<br></br>Limitations and Assumptions<br></br>Encrypted or Obfuscated Scripts: Attackers may use obfuscation or encryption to evade detection. Regularly update detection mechanisms to recognize and alert on such techniques.",
    "tags": [
      "Powershell",
      "Sysmon",
      "Execution",
      "TA0002",
      "T1059.001"
    ],
    "submitter": {
      "name": "Siddhant Mishra",
      "link": "https://www.linkedin.com/in/siddhant-mishra-b190b630/"
    },
    "why": "- Detecting unauthorized PowerShell script execution using Sysmon significantly enhances an organization's security posture by providing detailed visibility into potentially malicious activities\n- Sysmon's comprehensive logging capabilities enable the identification of suspicious PowerShell commands, such as the use of DownloadFile methods to retrieve malicious payloads or obfuscated scripts designed to evade detection\n- By monitoring these activities, security teams can promptly detect and respond to threats, preventing unauthorized code execution, data exfiltration, or further system compromise. Implementing such monitoring is crucial for maintaining system integrity and safeguarding against sophisticated attack vectors that leverage PowerShell's extensive functionalities.",
    "references": "- https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon\n- https://techcommunity.microsoft.com/blog/microsoftsentinelblog/the-power-of-data-collection-rules-monitoring-powershell-usage/4236527\n- https://www.blumira.com/blog/sysmon-benefits",
    "file_path": "Flames/H013.md"
  },
  {
    "id": "H014",
    "category": "Flames",
    "title": "An adversary is leveraging Windows named pipes to establish covert command-and-control (C2) channels, enabling lateral movement and maintaining persistence within the network. Named pipes, a common interprocess communication (IPC) mechanism in Windows, can be abused to facilitate stealthy data exchange between compromised systems.",
    "tactic": "Command and Control",
    "notes": "<ul> <li>Named Pipes as C2 Channels: Named pipes are inter-process communication mechanisms in Windows environments. Adversaries exploit them to create covert C2 channels, enabling stealthy communication between compromised systems.</li><br><li>Detection Strategy: Monitor Sysmon Event ID 17 (Pipe Creation) for the creation of suspicious named pipes. Correlate these events with process creation logs (Event ID 1) to identify unusual parent-child process relationships, which may indicate malicious activity.</li><br><li>Reference List: Utilize a curated list of named pipes commonly associated with adversary techniques to aid in identifying potential threats.</li></br>",
    "tags": [
      "CobaltStrike",
      "NamedPipes",
      "CommandAndControl",
      "Sysmon",
      "ThreatHunting"
    ],
    "submitter": {
      "name": "Siddhant Mishra",
      "link": "https://github.com/Blackbird2Raven"
    },
    "why": "- Detecting Cobalt Strike's use of named pipes for command-and-control (C2) communication significantly enhances an organization's ability to identify and mitigate sophisticated adversary activities.\n- By monitoring Sysmon Event IDs 17 and 18, which log pipe creation and access events, security teams can pinpoint the establishment of covert C2 channels that utilize named pipes - a technique often employed by Cobalt Strike for lateral movement and persistence.\n- This proactive detection approach enables early identification of malicious activities, facilitating timely response actions to prevent unauthorized access, data exfiltration, and further compromise within the network.\n- Implementing such detection mechanisms is crucial for maintaining robust security defenses against advanced persistent threats leveraging tools like Cobalt Strike.",
    "references": "- https://medium.com/@siddhantalokmishra/my-recent-journey-in-detecting-cobalt-strike-3f66eb00189c\n- https://www.cobaltstrike.com/blog/named-pipe-pivoting",
    "file_path": "Flames/H014.md"
  },
  {
    "id": "H015",
    "category": "Flames",
    "title": "Adversaries are redirecting DNS queries to an inappropriate or false DNS server IP, effectively blocking legitimate communications and potentially compromising the security infrastructure.",
    "tactic": "Defense Evasion",
    "notes": "<ul> <li><strong>Assumptions:</strong></li><ul><li>If done with local admin right, the attack creates new registry values in the registry key HKLM\\System\\CurrentControlSet\\Services\\Dnscache\\Parameters\\DnsPolicyConfig{UUID</li><li>Value of registry key listed upper contains a domain related to a cybersecurity tool, such as .endpoint.security.microsoft.com</li><li>Add-DnsClientNrptRule Powershell function can be used to reach such purpose</ul></li><li><strong>Data Requirements:</strong><ul><li>Works only on Windows 7 and later operating systems</li><li>Requires to log registry key changes and/or any way to log command execution</ul></li><li><strong>Notes on Limitation:</strong><ul><li>Defenders must have multiple ways to log registry key changes and/or command execution to detect the attack once it was executed by attacker, as it aims to silence cybersecurity tool(s)</ul></li></ul>",
    "tags": [
      "Registry",
      "EDR",
      "DNS",
      "DefenseEvasion"
    ],
    "submitter": {
      "name": "wikijm",
      "link": "https://github.com/wikijm"
    },
    "why": "- What security risks or threats does this hunt address?\n    - Identifying attempts by an attacker to disable cybersecurity tools by disrupting the communication between security agents and their management console.\n- What are the potential impacts if malicious activity is found?\n   - Compromised Security Posture: Redirecting DNS queries can prevent security agents from communicating with their management consoles, leaving the network vulnerable to further attacks.\n   - Data Breach: Without proper monitoring, attackers could exfiltrate sensitive data undetected.\n   - Operational Disruption: Critical systems may be disrupted if they rely on the compromised DNS resolution for their operations.\n   - Compliance Violations: Failure to detect and mitigate such threats could lead to non-compliance with regulatory standards, resulting in fines or legal consequences.\n   - Reputation Damage: A successful attack could harm the organization's reputation, leading to loss of customer trust and potential financial losses.\n- How does this hunt connect to known threat campaigns or protect critical assets?\n    - Known Threat Campaigns: DNS redirection tactics have been used in various advanced persistent threat (APT) campaigns to evade detection and maintain persistence within compromised networks.\n    - Critical Asset Protection: By ensuring that security agents can communicate with their management consoles, this hunt helps protect critical assets such as sensitive data, intellectual property, and essential services.\n    - Proactive Defense: Identifying and mitigating DNS redirection attempts proactively strengthens the overall security posture, making it harder for attackers to gain a foothold.\n- Why would this hunt be valuable to the community?\n    - Shared Knowledge: Sharing detection methods and indicators of compromise (IOCs) helps other organizations improve their defenses against similar threats.\n    - Collaborative Defense: By collaborating on threat hunting, the community can collectively enhance its ability to detect and respond to emerging threats.\n    - Best Practices: Establishing best practices for detecting and mitigating DNS redirection attacks benefits the entire community, raising the baseline for cybersecurity standards.\n    - Innovation: Encourages the development of new tools and techniques to counter evolving threats, driving innovation in cybersecurity.",
    "references": "- MITRE ATT&CK References\n    - Impair Defenses: Disable or Modify Tools - https://attack.mitre.org/techniques/T1562/001/\n- Blog Posts or Articles\n    - EDR Silencers and Beyond: Exploring Methods to Block EDR Communication - Part 1 - https://cloudbrothers.info/edr-silencers-exploring-methods-block-edr-communication-part-1/",
    "file_path": "Flames/H015.md"
  },
  {
    "id": "H016",
    "category": "Flames",
    "title": "Adversaries are using compromised SonicWall VPN credentials to gain initial access to corporate networks.",
    "tactic": "Initial Access",
    "notes": "Based on ATT&CK technique T1078, using compromised credentials.",
    "tags": [
      "InitialAccess",
      "T1078",
      "SonicWall"
    ],
    "submitter": {
      "name": "hearth-auto-intel",
      "link": "https://github.com/THORCollective/HEARTH"
    },
    "why": "- Detecting the use of compromised VPN credentials is critical as it is often the first step in an attack chain, allowing adversaries to gain a foothold in the network.\n- If this technique succeeds, adversaries can gain access to the internal network, potentially bypassing perimeter defenses and giving them the ability to move laterally, escalate privileges, or perform other malicious activities.\n- This specific implementation is tied to larger campaigns by the Fog ransomware group, which has been observed using compromised VPN credentials for initial access in multiple incidents.\n- The use of compromised SonicWall VPN credentials was chosen over other techniques mentioned in the CTI due to its actionability (evident in VPN logs), impact (directly enables adversary objectives), uniqueness (distinctive of this specific threat), and detection gap (commonly missed by security tools).",
    "references": "- [MITRE ATT&CK technique T1078 - Valid Accounts](https://attack.mitre.org/techniques/T1078/)\n- [Navigating Through The Fog](https://thedfirreport.com/2025/04/28/navigating-through-the-fog/)",
    "file_path": "Flames/H016.md"
  },
  {
    "id": "H017",
    "category": "Flames",
    "title": "Adversaries are exploiting memory safety issues in the Apache mod_lua module to execute arbitrary code with elevated privileges on Apache web servers.",
    "tactic": "Privilege Escalation",
    "notes": "Based on ATT&CK technique T1068, using CVE-2021-44790",
    "tags": [
      "privilegeescalation",
      "exploit",
      "apache"
    ],
    "submitter": {
      "name": "hearth-auto-intel",
      "link": "https://github.com/THORCollective/HEARTH"
    },
    "why": "- Detecting this precise behavior is crucial as it allows adversaries to gain elevated privileges, potentially giving them full control over the compromised Apache web server.\n- If this specific technique succeeds, adversaries can execute arbitrary code with high privileges, leading to further system compromise, data theft, or disruption of services.\n- This specific implementation ties to larger campaigns as it allows adversaries to compromise web servers, which can be used as a stepping stone to infiltrate the internal network or to host malicious content.\n- This technique was chosen over others mentioned in the CTI due to its high impact (arbitrary code execution with elevated privileges) and its actionability, as exploitation attempts can be detected in web server logs.",
    "references": "- [MITRE ATT&CK technique T1068](https://attack.mitre.org/techniques/T1068/)\n- [Security Vulnerabilities Study in Software Extensions and Plugins](https://eunomia.dev/blog/2025/02/10/security-vulnerabilities-study-in-software-extensions-and-plugins/)",
    "file_path": "Flames/H017.md"
  },
  {
    "id": "H018",
    "category": "Flames",
    "title": "Threat actors are exploiting insecure serverless functions in AWS, Azure, and Google Cloud to compromise serverless tokens, leading to privilege escalation and potential data exfiltration.",
    "tactic": "Credential Access",
    "notes": "Based on ATT&CK technique T1098, using serverless functions to compromise credentials.",
    "tags": [
      "credentialaccess",
      "serverlessfunctions",
      "cloud"
    ],
    "submitter": {
      "name": "hearth-auto-intel",
      "link": "https://github.com/THORCollective/HEARTH"
    },
    "why": "- Detecting this behavior is crucial as it can lead to unauthorized access to sensitive data and systems in the cloud environment.\n- If successful, the threat actors can escalate their privileges, potentially gaining full control over the cloud environment and enabling them to exfiltrate sensitive data.\n- This technique has been observed in larger campaigns targeting cloud environments, indicating a broader threat landscape.",
    "references": "- [MITRE ATT&CK T1098 - Account Manipulation](https://attack.mitre.org/techniques/T1098/)\n- [Palo Alto Networks - Serverless Security](https://www.paloaltonetworks.com/cortex/secure-serverless)\n- [Source CTI Report](https://unit42.paloaltonetworks.com/serverless-authentication-cloud/)",
    "file_path": "Flames/H018.md"
  },
  {
    "id": "H019",
    "category": "Flames",
    "title": "Threat actors are leveraging Linux Executable and Linkage Format (ELF) files to deploy malware families on cloud infrastructure endpoints running Linux OS, with the immediate tactical goal of gaining unauthorized access and maintaining persistence.",
    "tactic": "Persistence, Initial Access",
    "notes": "Based on ATT&CK technique T1204 (User Execution), using ELF files.",
    "tags": [
      "persistence",
      "initialaccess",
      "userexecution",
      "ELF"
    ],
    "submitter": {
      "name": "hearth-auto-intel",
      "link": "https://github.com/THORCollective/HEARTH"
    },
    "why": "- Detecting the use of ELF files to deploy malware is critical as it signifies a targeted attack on Linux-based cloud infrastructure, which is widely used in enterprise environments.\n- The tactical impact of a successful attack includes unauthorized access to cloud infrastructure, potential data breaches, and the ability for the threat actor to maintain persistence within the compromised system.\n- This behavior could be linked to larger campaigns targeting cloud infrastructure, given the increasing trend of threat actors weaponizing ELF files.",
    "references": "- [MITRE ATT&CK User Execution](https://attack.mitre.org/techniques/T1204/)\n- [Unit 42 CTI Report](https://unit42.paloaltonetworks.com/)\n- [Source CTI Report](https://unit42.paloaltonetworks.com/elf-based-malware-targets-cloud/)",
    "file_path": "Flames/H019.md"
  },
  {
    "id": "H020",
    "category": "Flames",
    "title": "Threat actors are using the Windows Management Instrumentation (WMI) system to execute PowerShell commands that establish a reverse shell, allowing them to gain remote control over Windows servers in the financial sector.",
    "tactic": "Execution",
    "notes": "Based on ATT&CK technique T1047, using WMI for execution of PowerShell commands.",
    "tags": [
      "Execution",
      "T1047",
      "WMI"
    ],
    "submitter": {
      "name": "hearth-auto-intel",
      "link": "https://github.com/THORCollective/HEARTH"
    },
    "why": "- Detecting this behavior is crucial as it allows threat actors to gain control over critical systems, potentially leading to data theft, system disruption, or further lateral movement within the network.\n- If successful, the threat actors can manipulate the compromised system to their advantage, potentially leading to significant financial and reputational damage for the targeted organization.\n- This technique has been linked to larger campaigns targeting the financial sector, indicating a strategic focus on high-value targets.",
    "references": "- [MITRE ATT&CK T1047](https://attack.mitre.org/techniques/T1047/)\n- [Source CTI Report](https://www.huntress.com/blog/inside-bluenoroff-web3-intrusion-analysis)",
    "file_path": "Flames/H020.md"
  },
  {
    "id": "H021",
    "category": "Flames",
    "title": "Threat actors are using the undocumented Windows Security Center (WSC) APIs to register a fabricated antivirus product, effectively disabling Windows Defender and creating an environment conducive for subsequent malware deployment and execution.",
    "tactic": "Defense Evasion",
    "notes": "Based on ATT&CK technique T1562.001, using the undocumented Windows Security Center (WSC) APIs",
    "tags": [
      "defenseevasion",
      "t1562.001",
      "WSC"
    ],
    "submitter": {
      "name": "hearth-auto-intel",
      "link": "https://github.com/THORCollective/HEARTH"
    },
    "why": "- Detecting this behavior is crucial as it allows threat actors to disable Windows Defender, one of the primary security solutions on Windows systems, thereby significantly lowering the barrier for subsequent malware deployment and execution.\n- If successful, this technique can lead to a compromised system, data breaches, and potential lateral movement within the network.\n- This technique has been associated with the tool \"defendnot\", which represents a sophisticated approach to bypassing Windows Defender.",
    "references": "- [MITRE ATT&CK T1562.001](https://attack.mitre.org/techniques/T1562/001/)\n- [Source CTI Report](https://www.huntress.com/blog/defendnot-detecting-malicious-security-product-bypass-techniques)",
    "file_path": "Flames/H021.md"
  },
  {
    "id": "H022",
    "category": "Flames",
    "title": "Threat actors are using social engineering tactics to convince targets to set up application specific passwords (ASPs), then obtaining these 16-character passcodes to establish persistent access to the victim's Google Mail accounts.",
    "tactic": "Credential Access",
    "notes": "Based on ATT&CK technique T1110. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "credentialaccess",
      "T1110",
      "socialengineering"
    ],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Detecting this behavior is important as it allows threat actors to gain persistent access to a victim's email account, potentially leading to the compromise of sensitive information.\n- The success of this tactic can lead to further exploitation of the compromised account, including the potential for lateral movement within an organization.\n- This behavior has been linked to state-sponsored cyber threat actors, indicating a high level of sophistication and potential impact.",
    "references": "- [MITRE ATT&CK T1110 - Brute Force](https://attack.mitre.org/techniques/T1110/)\n- [Source CTI Report](https://cloud.google.com/blog/topics/threat-intelligence/creative-phishing-academics-critics-of-russia)",
    "file_path": "Flames/H022.md"
  },
  {
    "id": "H023",
    "category": "Flames",
    "title": "Threat actors are using the 'attrib +h' command to hide files and directories in the compromised Windows system to maintain stealth and evade detection.",
    "tactic": "Defense Evasion",
    "notes": "Based on ATT&CK technique T1564. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "DefenseEvasion",
      "T1564",
      "AttribCommand"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- Detecting the use of 'attrib +h' command is crucial as it is a common technique used by adversaries to hide their tracks and maintain persistence. \n- Successful evasion can lead to long-term compromise, leading to data exfiltration, lateral movement, or further attacks.\n- This behavior might be linked to larger campaigns, where the adversary uses a variety of stealth techniques for defense evasion.",
    "references": "- [MITRE ATT&CK T1564](https://attack.mitre.org/techniques/T1564/)\n- [Source CTI Report](https://www.huntress.com/blog/inside-bluenoroff-web3-intrusion-analysis)",
    "file_path": "Flames/H023.md"
  },
  {
    "id": "H024",
    "category": "Flames",
    "title": "Threat actors are using the ClickFix social engineering technique to trick users into copying and pasting malicious PowerShell commands into their system's run dialog, resulting in the execution of the GHOSTPULSE loader and subsequent deployment of the ARECHCLIENT2 info-stealer on the victim's system.",
    "tactic": "Initial Access",
    "notes": "Based on ATT&CK technique T1566.001 (Phishing: Spearphishing Link). Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "initialaccess",
      "phishing",
      "spearphishinglink"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- Detecting this behavior is crucial as it allows threat actors to gain initial access to the system, bypassing many traditional perimeter defenses.\n- If successful, the threat actors can deploy the GHOSTPULSE loader and the ARECHCLIENT2 info-stealer, leading to potential data theft and unauthorized remote control over the compromised system.\n- This technique has been linked to a larger campaign involving the deployment of various malware and info-stealers, indicating a widespread and ongoing threat.",
    "references": "- [MITRE ATT&CK: T1566.001 - Phishing: Spearphishing Link](https://attack.mitre.org/techniques/T1566/001/)\n- [Source CTI Report](https://www.elastic.co/security-labs/a-wretch-client)",
    "file_path": "Flames/H024.md"
  },
  {
    "id": "H025",
    "category": "Flames",
    "title": "Threat actors are using a Python-based remote access trojan (RAT) called \"PylangGhost\" to target Windows systems of employees with experience in cryptocurrency and blockchain technologies. The actors trick users into downloading the trojan by creating fake job interview sites and instructing users to copy, paste, and execute a command to allegedly install required video drivers.",
    "tactic": "Initial Access, Execution",
    "notes": "Based on ATT&CK technique T1204.002 and T1059.006. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "initialaccess",
      "execution",
      "userexecution",
      "commandandscriptinginterpreter"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- Detecting this behavior is crucial as it allows threat actors to gain initial access to the target system and execute commands remotely, leading to potential data theft or further system compromise.\n- The successful execution of this technique can lead to the compromise of sensitive information related to cryptocurrency and blockchain technologies, which can have significant financial implications.\n- This technique is part of a larger campaign by the threat actor group Famous Chollima, which has been very active and is known for its well-documented campaigns.",
    "references": "- [MITRE ATT&CK User Execution](https://attack.mitre.org/techniques/T1204/002/)\n- [MITRE ATT&CK Command and Scripting Interpreter](https://attack.mitre.org/techniques/T1059/006/)\n- [Source CTI Report](https://blog.talosintelligence.com/python-version-of-golangghost-rat/)",
    "file_path": "Flames/H025.md"
  },
  {
    "id": "H026",
    "category": "Flames",
    "title": "Threat actors are using Windows' built-in command-line tool, 'cipher.exe', with the '/w' option to overwrite free space on the victim's hard drive partitions, hindering forensic recovery of deleted files after deploying the CyberLock ransomware.",
    "tactic": "Defense Evasion",
    "notes": "Based on ATT&CK technique T1070.004. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "defenseevasion",
      "T1070.004",
      "cipher.exe"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- Detecting this behavior is crucial as it allows threat actors to cover their tracks and make it more difficult for incident response teams to analyze the attack.\n- If successful, this tactic can significantly impede the ability of defenders to understand the full scope of an attack, potentially leading to incomplete remediation efforts.\n- This behavior has been observed in conjunction with the deployment of the CyberLock ransomware, indicating it may be part of larger, coordinated campaigns.",
    "references": "- [MITRE ATT&CK T1070.004](https://attack.mitre.org/techniques/T1070/004/)\n- [Source CTI Report](https://blog.talosintelligence.com/fake-ai-tool-installers/)",
    "file_path": "Flames/H026.md"
  },
  {
    "id": "H027",
    "category": "Flames",
    "title": "BlueNoroff threat actors are delivering malicious AppleScript files (.scpt) via fake Zoom domains with oversized files containing >10,000 blank lines to mask malicious payload delivery for initial access into cryptocurrency organizations.",
    "tactic": "Initial Access",
    "notes": "Based on ATT&CK technique T1566.002. BlueNoroff campaign targeting Web3 organizations using deepfake meetings and fake Zoom extensions.",
    "tags": [
      "initialaccess",
      "T1566.002",
      "applescript",
      "bluenoroff"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- Detecting this behavior is crucial as AppleScript provides native system access and can bypass many security controls when delivered through social engineering.\n- If successful, this tactic allows threat actors to establish initial foothold on macOS systems in high-value cryptocurrency organizations.\n- This behavior has been observed in BlueNoroff's sophisticated social engineering campaigns using deepfake technology and impersonation of legitimate meeting platforms.",
    "references": "- [MITRE ATT&CK T1566.002](https://attack.mitre.org/techniques/T1566/002/)\n- [Source CTI Report](https://www.huntress.com/blog/inside-bluenoroff-web3-intrusion-analysis)",
    "file_path": "Flames/H027.md"
  },
  {
    "id": "H028",
    "category": "Flames",
    "title": "Sophisticated threat actors are querying display state using system_profiler before executing malicious commands to avoid detection when users are actively using their systems.",
    "tactic": "Defense Evasion",
    "notes": "Based on ATT&CK technique T1497.003. Using display state awareness to time malicious activities when users are away from their systems.",
    "tags": [
      "defenseevasion",
      "T1497.003",
      "evasion",
      "macos"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- Detecting this behavior is crucial as display state awareness indicates sophisticated operational security and intent to avoid user detection.\n- If successful, this tactic allows threat actors to execute malicious activities when users are away, reducing the likelihood of discovery.\n- This behavior demonstrates advanced understanding of user behavior patterns and sophisticated evasion techniques.",
    "references": "- [MITRE ATT&CK T1497.003](https://attack.mitre.org/techniques/T1497/003/)\n- [Source CTI Report](https://www.huntress.com/blog/inside-bluenoroff-web3-intrusion-analysis)",
    "file_path": "Flames/H028.md"
  },
  {
    "id": "H029",
    "category": "Flames",
    "title": "Advanced threat actors are leveraging debugger entitlements and task_for_pid API calls to perform process injection on macOS systems, deploying malicious payloads into legitimate processes.",
    "tactic": "Defense Evasion",
    "notes": "Based on ATT&CK technique T1055. Using debugger entitlements for process injection with task_for_pid and mach_vm APIs on macOS.",
    "tags": [
      "defenseevasion",
      "T1055",
      "processinjection",
      "macos"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- Detecting this behavior is crucial as process injection allows malicious code to execute within legitimate processes, evading many security controls.\n- If successful, this tactic enables threat actors to hide malicious activity within trusted processes and potentially inherit their privileges.\n- This behavior is rare on macOS outside of legitimate development scenarios, making it a high-value detection opportunity.",
    "references": "- [MITRE ATT&CK T1055](https://attack.mitre.org/techniques/T1055/)\n- [Source CTI Report](https://www.huntress.com/blog/inside-bluenoroff-web3-intrusion-analysis)",
    "file_path": "Flames/H029.md"
  },
  {
    "id": "H030",
    "category": "Flames",
    "title": "Threat actors are establishing persistence on macOS systems using LaunchDaemons that impersonate legitimate messaging services (like \"Telegram2\") but execute malicious binaries from non-standard locations.",
    "tactic": "Persistence",
    "notes": "Based on ATT&CK technique T1543.004. Creating LaunchDaemon persistence using legitimate service names with suspicious execution paths.",
    "tags": [
      "persistence",
      "T1543.004",
      "launchdaemon",
      "macos"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- Detecting this behavior is crucial as LaunchDaemon persistence provides automatic execution at system startup with elevated privileges.\n- If successful, this tactic ensures threat actor access survives system reboots and provides a reliable mechanism for maintaining presence.\n- This behavior demonstrates sophisticated understanding of macOS persistence mechanisms while attempting to blend in with legitimate services.",
    "references": "- [MITRE ATT&CK T1543.004](https://attack.mitre.org/techniques/T1543/004/)\n- [Source CTI Report](https://www.huntress.com/blog/inside-bluenoroff-web3-intrusion-analysis)",
    "file_path": "Flames/H030.md"
  },
  {
    "id": "H031",
    "category": "Flames",
    "title": "Threat actors are systematically enumerating and extracting sensitive data from cryptocurrency wallet browser extensions to support financial theft operations.",
    "tactic": "Collection",
    "notes": "Based on ATT&CK technique T1005. Automated collection of cryptocurrency wallet data from browser extensions including MetaMask, Phantom, Keplr, and others.",
    "tags": [
      "collection",
      "T1005",
      "cryptocurrency",
      "bluenoroff"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- Detecting this behavior is crucial as cryptocurrency wallet harvesting directly supports BlueNoroff's primary financial theft objectives.\n- If successful, this tactic can lead to significant financial losses through unauthorized access to cryptocurrency accounts and private keys.\n- This behavior indicates targeting of high-value cryptocurrency assets and may be part of larger financial crime operations.",
    "references": "- [MITRE ATT&CK T1005](https://attack.mitre.org/techniques/T1005/)\n- [Source CTI Report](https://www.huntress.com/blog/inside-bluenoroff-web3-intrusion-analysis)",
    "file_path": "Flames/H031.md"
  },
  {
    "id": "H032",
    "category": "Flames",
    "title": "Threat actors are using AppleScript to download and execute malicious payloads, bypassing network detections by using legitimate websites like Zoom as C2 infrastructure.",
    "tactic": "Defense Evasion",
    "notes": "Based on ATT&CK technique T1059.002. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "defense-evasion",
      "command-and-scripting-interpreter",
      "applescript",
      "malware"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- AppleScript can be abused to download and execute malicious code on macOS systems\n- Using trusted domains like Zoom for C2 helps evade network detection of the malicious traffic\n- Enables threat actors to gain an initial foothold and deploy further malware on the system",
    "references": "- https://attack.mitre.org/techniques/T1059/002/  \n- [Inside the BlueNoroff Web3 macOS Intrusion Analysis](https://www.huntress.com/blog/inside-bluenoroff-web3-intrusion-analysis)",
    "file_path": "Flames/H032.md"
  },
  {
    "id": "H033",
    "category": "Flames",
    "title": "Threat actors are using PowerShell's Invoke-RestMethod cmdlet to download ransomware payloads from recently registered low-reputation domains to encrypt files and demand payment.",
    "tactic": "Execution, Impact",
    "notes": "Based on ATT&CK technique T1059.001. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "execution",
      "command-and-scripting-interpreter",
      "powershell",
      "ransomware"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- The CTI report mentions ransomware like DragonForce and Medusa being deployed after gaining access via SimpleHelp RMM software\n- Detecting the specific delivery mechanism of ransomware can help disrupt attacks before encryption and impact occurs\n- PowerShell is a common tool used by threat actors to download and execute malicious payloads while blending in with legitimate admin activity\n- Recently registered, low-reputation domains are often used to host initial payloads to avoid detection by domain/IP reputation lists",
    "references": "- https://attack.mitre.org/techniques/T1059/001/\n- [Source CTI Report](https://dispatch.thorcollective.com/p/from-the-fire-q1fy25)",
    "file_path": "Flames/H033.md"
  },
  {
    "id": "H034",
    "category": "Flames",
    "title": "Threat actors are using IDE plugins like \"Remote Code Runner\" or \"REST Client\" to launch unauthorized shells, scripts, or network connections from trusted developer tools such as VS Code, PyCharm, or Eclipse to enable persistence, C2 beaconing, or lateral movement on developer endpoints.",
    "tactic": "Persistence, Lateral Movement",
    "notes": "Based on ATT&CK technique T1546.016. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "persistence",
      "lateral-movement",
      "ide-plugin",
      "event-triggered-execution"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- IDE plugins have extensive access and can execute code, spawn processes, and make network connections\n- Malicious plugins can abuse this trust to persist, move laterally, or establish C2 channels\n- Developers are high-value targets, so compromising their tooling enables access to source code and sensitive systems\n- Plugin-based attacks often blend in with legitimate dev activity and may be missed by standard detections",
    "references": "- https://attack.mitre.org/techniques/T1546/016/\n- [Your Plugins and Extensions Are (Probably) Fine. Hunt Them Anyway.](https://dispatch.thorcollective.com/p/your-plugins-and-extensions-are-probably-fine)",
    "file_path": "Flames/H034.md"
  },
  {
    "id": "H035",
    "category": "Flames",
    "title": "Adversaries are using USB devices with malicious payloads, such as Rubber Ducky, to gain initial access to air-gapped OT facilities and ICS networks.",
    "tactic": "Initial Access",
    "notes": "Based on ATT&CK technique T0847. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "initial-access",
      "hardware-additions",
      "air-gap"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- USB devices can be an effective way for adversaries to bridge air gaps and compromise isolated OT/ICS networks\n- Malicious USB payloads like Rubber Ducky can rapidly execute attacker commands on a system with no user interaction required\n- Detecting rogue USB devices is critical for preventing adversaries from establishing an initial foothold in secured environments",
    "references": "- https://attack.mitre.org/techniques/T0847\n- [Source CTI Report](https://dispatch.thorcollective.com/p/purple-teaming-the-fallout-a-red)",
    "file_path": "Flames/H035.md"
  },
  {
    "id": "H036",
    "category": "Flames",
    "title": "Threat actors are using Chisel, an open-source tunneling utility, to create SOCKS proxies on compromised hosts to bypass network security controls and conceal C2 traffic.",
    "tactic": "Defense Evasion",
    "notes": "Based on ATT&CK technique T1090.001. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "defense-evasion",
      "proxy",
      "chisel"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- Chisel proxies allow attackers to hide their true origin and bypass network controls like firewalls\n- Tunneling C2 traffic through a proxy on the victim network helps avoid detection\n- The CL-CRI-1014 cluster is using this technique to maintain stealthy access to financial institutions in Africa",
    "references": "- https://attack.mitre.org/techniques/T1090/001/\n- [Source CTI Report](https://unit42.paloaltonetworks.com/cybercriminals-attack-financial-sector-across-africa)",
    "file_path": "Flames/H036.md"
  },
  {
    "id": "H037",
    "category": "Flames",
    "title": "Threat actors are injecting malicious JavaScript code into legitimate websites that uses JSFireTruck obfuscation composed primarily of the symbols []+${} to hide its true purpose of redirecting search engine traffic to malicious URLs serving malware or other harmful content.",
    "tactic": "Defense Evasion",
    "notes": "Based on ATT&CK technique T1027. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "defense-evasion",
      "obfuscated-files-or-information",
      "javascript",
      "malvertising"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- JSFireTruck obfuscation makes malicious JavaScript code difficult to analyze and detect\n- Compromising legitimate websites as watering holes allows threat actors to target many victims\n- Redirecting search engine traffic ensures a steady stream of targets to malicious destinations \n- Malicious URLs can lead to malware downloads, phishing, malvertising, and other threats",
    "references": "- https://attack.mitre.org/techniques/T1027/\n- [JSFireTruck: Exploring Malicious JavaScript Using JSF*ck as an Obfuscation Technique](https://unit42.paloaltonetworks.com/malicious-javascript-using-jsfiretruck-as-obfuscation/)",
    "file_path": "Flames/H037.md"
  },
  {
    "id": "H038",
    "category": "Flames",
    "title": "Threat actors are using PowerShell's Compress-Archive cmdlet to compress stolen victim data into ZIP archives for exfiltration to attacker-controlled servers.",
    "tactic": "Collection",
    "notes": "Based on ATT&CK technique T1560. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "collection",
      "archive-collected-data",
      "powershell"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- Compressing data allows threat actors to package up large amounts of sensitive information into easy-to-transfer ZIP files\n- Detecting the use of PowerShell to create suspicious ZIP archives can catch attackers in the act of preparing to steal data\n- The KimJongRAT malware specifically uses PowerShell's Compress-Archive to bundle up files like browser data before sending to the C2 server",
    "references": "- https://attack.mitre.org/techniques/T1560/\n- [KimJongRAT Stealer Variant and Its PowerShell Implementation](https://unit42.paloaltonetworks.com/kimjongrat-stealer-variant-powershell/)",
    "file_path": "Flames/H038.md"
  },
  {
    "id": "H039",
    "category": "Flames",
    "title": "Threat actors are crafting TCP SYN packets with anomalous header values like 20-byte header length, zero window size, and zero initial sequence number to scan networks and exploit services while evading detection.",
    "tactic": "Reconnaissance",
    "notes": "Based on ATT&CK technique T1595.001. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "reconnaissance",
      "active-scanning",
      "network-service-scanning"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- Detecting crafted TCP SYN packets with anomalous header values can reveal network scanning and attempts to exploit services\n- Successful scanning enables adversaries to map the network, identify potential targets, and find vulnerable services to compromise  \n- Network scanning is a common precursor to many targeted intrusions and commodity malware infections",
    "references": "- https://attack.mitre.org/techniques/T1595/001/\n- [Decoding TCP SYN for Stronger Network Security](https://www.netscout.com/blog/asert/decoding-tcp-syn-stronger-network-security)",
    "file_path": "Flames/H039.md"
  },
  {
    "id": "H040",
    "category": "Flames",
    "title": "Threat actors are conducting password spray attacks against internet-exposed RDP servers by attempting to authenticate with the same password across multiple domain accounts within a 4-hour window, targeting between 2-10 accounts per minute to evade detection thresholds.",
    "tactic": "Initial Access",
    "notes": "Based on ATT&CK technique T1110.003. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "initial_access",
      "password_spraying",
      "rdp"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- Password spraying against RDP is a common initial access vector that can be difficult to detect when attackers pace their attempts\n- Successful compromise provides attackers with interactive access to internal systems\n- This technique was used by RansomHub operators to gain initial foothold before deploying ransomware\n- The 4-hour timeframe and rate of attempts shows attackers are deliberately trying to stay under common detection thresholds",
    "references": "- [Password Spraying: T1110.003](https://attack.mitre.org/techniques/T1110/003/)\n- [Source CTI Report](https://thedfirreport.com/2025/06/30/hide-your-rdp-password-spray-leads-to-ransomhub-deployment/)",
    "file_path": "Flames/H040.md"
  },
  {
    "id": "H041",
    "category": "Flames",
    "title": "Threat actors are using dd commands to write malicious shellcode directly into the memory of legitimate cat processes at specific offsets (0x4012f0 and 0x602820) to bypass Juniper veriexec protection and execute TINYSHELL backdoors on Juniper routers.",
    "tactic": "Privilege Escalation",
    "notes": "Based on ATT&CK technique T1055. Generated by hearth-auto-intel.",
    "tags": [
      "privilege-escalation",
      "tinyshell",
      "juniper"
    ],
    "submitter": {
      "name": "Jocko",
      "link": ""
    },
    "why": "",
    "references": "",
    "file_path": "Flames/H041.md"
  },
  {
    "id": "H042",
    "category": "Flames",
    "title": "Threat actors are using PowerShell's Expand-Archive cmdlet to extract malicious CAB files containing encrypted DEMODEX rootkit configurations and shellcode payloads to C:\\Windows\\debug\\ before deleting the original archive to evade detection.",
    "tactic": "Defense Evasion",
    "notes": "Based on ATT&CK technique T1140. Generated by hearth-auto-intel.",
    "tags": [
      "defense-evasion",
      "deobfuscate-files",
      "earth-estries"
    ],
    "submitter": {
      "name": "Jocko",
      "link": ""
    },
    "why": "- The DEMODEX rootkit is a sophisticated persistence mechanism used by Earth Estries APT group\n- The new infection chain bundles encrypted configurations and shellcode in CAB files that are deleted after extraction to avoid detection\n- This technique allows the attacker to deploy the rootkit while leaving minimal forensic evidence\n- Successful detection could reveal ongoing Earth Estries compromises targeting telecommunications and government entities\n- Part of larger Chinese APT espionage campaigns targeting critical infrastructure globally",
    "references": "- [MITRE ATT&CK T1140: Deobfuscate/Decode Files or Information](https://attack.mitre.org/techniques/T1140/)\n- [Source CTI Report](https://www.trendmicro.com/en_us/research/24/k/earth-estries.html)",
    "file_path": "Flames/H042.md"
  },
  {
    "id": "H043",
    "category": "Flames",
    "title": "Adversaries are modifying Windows Registry Run keys in HKCU\\Software\\CLASSES\\CLSID\\ID to store unique victim identifiers used for tracking C2 communications, deviating from standard CLSID format which requires GUIDs in curly brackets.",
    "tactic": "Defense Evasion",
    "notes": "Based on ATT&CK technique T1112. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "defense-evasion",
      "registry-modification",
      "persistence"
    ],
    "submitter": {
      "name": "Jocko",
      "link": ""
    },
    "why": "- The CLSID registry key structure is highly standardized and requires GUIDs in curly brackets - any deviation from this format is suspicious\n- This specific registry modification provides a reliable way to track FamousSparrow's SparrowDoor backdoor activity\n- The technique allows the malware to maintain consistent tracking across C2 sessions while blending in with legitimate Windows registry entries\n- This behavior is part of FamousSparrow's latest campaign targeting financial sector organizations",
    "references": "- [MITRE ATT&CK T1112: Modify Registry](https://attack.mitre.org/techniques/T1112/)\n- [Source CTI Report](https://www.welivesecurity.com/en/eset-research/you-will-always-remember-this-as-the-day-you-finally-caught-famoussparrow/)",
    "file_path": "Flames/H043.md"
  },
  {
    "id": "H044",
    "category": "Flames",
    "title": "Threat actors are using PowerShell to execute PHP from non-standard AppData locations with specific extension directives to load malicious configuration files and establish RAT persistence on target Windows systems.",
    "tactic": "Execution",
    "notes": "Based on ATT&CK technique T1059.001. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "execution",
      "powershell",
      "rat"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- PowerShell execution of PHP from non-standard locations represents a highly suspicious behavior that may indicate Interlock RAT activity\n- The specific command pattern using extension directives and config files is distinctive to this campaign\n- This technique serves as the initial execution vector for the Interlock RAT PHP variant\n- Successful detection can identify compromises early in the attack chain before lateral movement occurs\n- Part of a larger Interlock ransomware campaign using the KongTuke/FileFix delivery mechanism",
    "references": "- [MITRE ATT&CK: PowerShell](https://attack.mitre.org/techniques/T1059/001/)\n- [Source CTI Report](https://thedfirreport.com/2025/07/14/kongtuke-filefix-leads-to-new-interlock-rat-variant/)",
    "file_path": "Flames/H044.md"
  },
  {
    "id": "H045",
    "category": "Flames",
    "title": "Threat actors are using MSHTA.exe to download and execute HTA scripts from hardcoded IP addresses (e.g. http://[IP]/[PORT].hta) which contain Base64-encoded PowerShell reverse shell commands to establish persistent C2 connections.",
    "tactic": "Command and Scripting Interpreter",
    "notes": "Based on ATT&CK technique T1218.005. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "execution",
      "mshta",
      "living-off-the-land"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- MSHTA.exe is a native Windows binary that can be abused to execute malicious HTA scripts while bypassing security controls\n- The specific pattern of IP/port.hta URLs and Base64 PowerShell payloads is distinctive to this Silent Skimmer campaign\n- Successful detection could identify initial access and persistence mechanisms used by this financially-motivated threat actor\n- This technique was used by Silent Skimmer to establish backdoor access for payment card theft operations",
    "references": "- [MITRE ATT&CK: System Binary Proxy Execution: Mshta](https://attack.mitre.org/techniques/T1218/005/)\n- [Silent Skimmer Gets Loud (Again)](https://unit42.paloaltonetworks.com/silent-skimmer-latest-campaign/)",
    "file_path": "Flames/H045.md"
  },
  {
    "id": "H046",
    "category": "Flames",
    "title": "Evildoers might be using reverse ssh for Command and Control.",
    "tactic": "Command and Control",
    "notes": "Look for processes with \"ssh -R\" and use JA4SSH for TLS/JA4+ fingerprinting.",
    "tags": [],
    "submitter": {
      "name": "DarkWizardCatcher",
      "link": ""
    },
    "why": "- Aiming for hunting already executed C2 communications in network.\n- If you find something potentially evil it can indicate the host is already compromised and adversary estabilished C2.\n- We have seen adversaries using ssh for C2 communication. For example ALPHA SPIDER or Billbug.\n- We don't see much of JA4 fingerprinting telemetry ingested in SIEMs and using those for detections. Firewalls them self might already be detecting these kind of activities. Even EDR's don't flag ssh clients with -R activities.",
    "references": "https://github.com/FoxIO-LLC/ja4\nhttps://github.com/Fahrj/reverse-ssh\nhttps://attack.mitre.org/techniques/T1572/\nhttps://medium.com/foxio/ja4-network-fingerprinting-9376fe9ca637",
    "file_path": "Flames/H046.md"
  },
  {
    "id": "H047",
    "category": "Flames",
    "title": "Threat actors are using PowerShell's Invoke-WebRequest cmdlet to download encrypted payloads from Discord CDN URLs ending in .dll or .exe to evade network detection and transfer malware to compromised Windows hosts.",
    "tactic": "Command and Control",
    "notes": "Based on ATT&CK technique T1105. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "command-and-control",
      "ingress-tool-transfer",
      "powershell"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- Discord CDN is a legitimate service commonly abused by threat actors to host malware while blending in with normal traffic\n- PowerShell web requests to Discord CDN URLs downloading .dll/.exe files is highly suspicious behavior\n- This technique allows attackers to bypass traditional file transfer detection methods\n- The encrypted payloads enable malware delivery while evading network security controls\n- This behavior has been observed in recent ransomware campaigns using Bumblebee loader",
    "references": "- [MITRE ATT&CK: Ingress Tool Transfer (T1105)](https://attack.mitre.org/techniques/T1105/)\n- [Source CTI Report](https://thedfirreport.com/2025/08/05/from-bing-search-to-ransomware-bumblebee-and-adaptixc2-deliver-akira/)",
    "file_path": "Flames/H047.md"
  },
  {
    "id": "H048",
    "category": "Flames",
    "title": "The Cisco AnyConnect Secure Mobility Client updates for macOS are distributed via a download from https://disthost.umbrella.com/roaming/upgrade/mac_anyconnect/production/. The naming convention of the legitimate file is vpndownloader.app under a generated file path, perhaps like: _\"/private/tmp/vpn.<generated-suffix>/vpndownloader.app/Contents/MacOS/vpndownloader\"_. This generically named file / file path may be deemed malicious for several reasons: 1. Location - /private/tmp/ is a temporary directory on macOS, often used for short-lived files. Legitimate apps typically don’t install or run persistent binaries from there. 2. File Name - A generated suffix is often used by droppers or downloaders to avoid detection and to make each infection unique. 3. Binary Path - /Contents/MacOS/vpndownloader means it’s a compiled executable inside an .app bundle. If this were from a reputable VPN provider, it would normally live in /Applications/ or ~/Applications/, not inside /private/tmp Files showing these hallmarks (location, file name, binary path), should be reviewed for validity.",
    "tactic": "Defense Evasion (TA0005), Execution (TA0002), Masquerading (T1036), Signed Binary Proxy Execution (T1218), Ingress Tool Transfer (T1105)",
    "notes": "The legitimacy of the Cisco vpndownloader can be verified by identifying the running process and capturing command-line information.",
    "tags": [
      "DefenseEvasion",
      "Execution",
      "Masquerading",
      "ProxyExecution"
    ],
    "submitter": {
      "name": "Joshua Hines",
      "link": ""
    },
    "why": "- The identified hallmarks of location, file name, and binary path may all be indicators of malicious executables.\n- Files/binaries that carry similar hallmarks should be reviewed with scrutiny, especially if their source cannot be verified.",
    "references": "- https://attack.mitre.org/tactics/TA0005/\n- https://attack.mitre.org/tactics/TA0002/\n- https://attack.mitre.org/techniques/T1036/\n- https://attack.mitre.org/techniques/T1218/\nhttps://attack.mitre.org/techniques/T1105/",
    "file_path": "Flames/H048.md"
  },
  {
    "id": "H049",
    "category": "Flames",
    "title": "Adversaries are using mailbox rules to hide their presence within compromised email accounts by automatically deleting, redirecting, or marking messages as read.",
    "tactic": "Defense Evasion, Collection, Initial Access",
    "notes": "Apply a multi-faceted approach to detect malicious mailbox rules.",
    "tags": [
      "DefenseEvasion",
      "Phishing",
      "Collection"
    ],
    "submitter": {
      "name": "Bruce Breuer",
      "link": ""
    },
    "why": "- The hunt for malicious mailbox rules that focus on concealing adversary presence addresses both persistence and the risk of internal spearphishing.",
    "references": "- https://attack.mitre.org/techniques/T1566/ \n- https://attack.mitre.org/techniques/T1564/008/\n- https://attack.mitre.org/techniques/T1114/\n- https://learn.microsoft.com/en-us/defender-xdr/alert-grading-playbook-inbox-manipulation-rules",
    "file_path": "Flames/H049.md"
  },
  {
    "id": "H050",
    "category": "Flames",
    "title": "An adversary successfully obtained AD password hashes by abusing replication permissions through a DC Sync operation.",
    "tactic": "Credential Access",
    "notes": "DC sync attacks leave behind a variety of indicators.",
    "tags": [
      "CredentialAccess",
      "ActiveDirectory",
      "Identity",
      "Secretsdump"
    ],
    "submitter": {
      "name": "Bruce Breuer",
      "link": ""
    },
    "why": "- The hunt targets credential theft via DC sync attacks, which extract password hashes from domain controllers. Security risks include privilege escalation, lateral movement, and domain compromise. \n- This type of AD hunt delivers visibility into an attack technique that can go unnoticed due to gaps in identity security, especially in environments with limited detections/hardening.",
    "references": "- https://attack.mitre.org/techniques/T1003/006/",
    "file_path": "Flames/H050.md"
  },
  {
    "id": "H051",
    "category": "Flames",
    "title": "Threat actors are establishing persistent backdoor access by deploying Hidden Virtual Network Computing (HVNC) servers that create invisible virtual desktop sessions running outside the user's visible desktop environment, enabling attackers to perform reconnaissance, credential theft, and lateral movement activities without triggering visual alerts or appearing in standard process monitoring tools on compromised developer workstations.",
    "tactic": "Command and Control",
    "notes": "Based on ATT&CK technique T1219. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "commandandcontrol",
      "T1219",
      "hvnc",
      "remoteaccess",
      "glassworm"
    ],
    "submitter": {
      "name": "Apramey \"Apps\" S",
      "link": ""
    },
    "why": "- HVNC represents one of the most sophisticated remote access capabilities in the GlassWorm malware, providing attackers with complete invisible control over compromised systems while bypassing traditional detection mechanisms that rely on visible windows or standard process enumeration\n- This technique enables attackers to leverage existing authenticated sessions in browsers and applications to access corporate resources, internal tools, email, and source code repositories without requiring additional credential theft or authentication bypass\n- The invisible nature of HVNC sessions means attackers can conduct extensive reconnaissance, data exfiltration, and lateral movement activities for extended periods without alerting users or triggering security monitoring tools that depend on user-visible indicators\n- Detection of HVNC deployment is critical for identifying advanced persistent threats targeting developer environments, as these systems typically have elevated access to source code repositories, build systems, and production infrastructure\n- GlassWorm's use of HVNC demonstrates the evolution of supply chain attacks beyond simple credential theft toward establishing persistent, invisible command and control channels within enterprise networks",
    "references": "- [MITRE ATT&CK T1219 - Remote Access Software](https://attack.mitre.org/techniques/T1219/)\n- [Source CTI Report](https://www.koi.ai/blog/glassworm-first-self-propagating-worm-using-invisible-code-hits-openvsx-marketplace)",
    "file_path": "Flames/H051.md"
  },
  {
    "id": "H052",
    "category": "Flames",
    "title": "Adversaries are using BackConnect VNC modules injected into dllhost.exe to execute Windows shell commands that open specific Explorer interfaces such as \"shell:mycomputerfolder\" for interactive file system browsing on compromised hosts.",
    "tactic": "Command and Control",
    "notes": "Based on ATT&CK technique T1219. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "command_and_control",
      "T1219",
      "backconnect",
      "vnc",
      "dllhost"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- BackConnect VNC represents a distinctive post-exploitation capability historically associated with IcedID and now Latrodectus malware families, providing threat actors with interactive remote desktop access that bypasses traditional remote access monitoring\n- This technique enables adversaries to manually browse file systems and identify high-value data for exfiltration while maintaining persistent access, as demonstrated in this intrusion where the threat actor used BackConnect to discover and access the unattend.xml file containing domain administrator credentials\n- The specific command pattern of dllhost.exe spawning explorer.exe with shell URIs is highly anomalous and indicates hands-on-keyboard activity by sophisticated threat actors like Lunar Spider, who maintained access for nearly two months using this capability\n- Detection of this behavior provides early warning of active threat actor reconnaissance and can prevent credential theft and data exfiltration before final impact objectives are achieved",
    "references": "- https://attack.mitre.org/techniques/T1219/\n- [Source CTI Report](https://thedfirreport.com/2025/09/29/from-a-single-click-how-lunar-spider-enabled-a-near-two-month-intrusion/)",
    "file_path": "Flames/H052.md"
  },
  {
    "id": "H053",
    "category": "Flames",
    "title": "Adversaries are using AI-powered tools to autonomously scan network infrastructure and enumerate high-value databases by executing thousands of reconnaissance requests per second against target systems, significantly accelerating the discovery phase of cyber espionage operations.",
    "tactic": "Discovery",
    "notes": "Based on ATT&CK technique T1046. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "discovery",
      "networkscan",
      "AI-powered"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- This behavior represents a fundamental shift in reconnaissance operations where AI agents can perform network scanning at speeds impossible for human operators (thousands of requests, often multiple per second), making traditional rate-limiting and anomaly detection less effective\n- Successful automated network service discovery enables threat actors to rapidly identify high-value targets across dozens of organizations simultaneously, as demonstrated in this campaign where 30 global targets were assessed with minimal human intervention\n- This technique is critical to detect because it represents the initial phase of AI-orchestrated espionage campaigns attributed to Chinese state-sponsored groups, where 80-90% of the attack chain operates autonomously after this discovery phase\n- The unprecedented scale and speed of AI-driven reconnaissance fundamentally changes the threat landscape, allowing less experienced threat actors to perform sophisticated multi-target operations previously requiring entire teams of skilled hackers",
    "references": "- [MITRE ATT&CK T1046 - Network Service Discovery](https://attack.mitre.org/techniques/T1046/)\n- [Source CTI Report](https://www.anthropic.com/news/disrupting-AI-espionage)",
    "file_path": "Flames/H053.md"
  },
  {
    "id": "H054",
    "category": "Flames",
    "title": "Threat actors are using compiled AppleScript (.scpt) files with fake document extensions like .docx.scpt and .pptx.scpt, combined with custom icons stored in resource forks, to trick users into executing malicious scripts via Script Editor.app and bypass Gatekeeper quarantine restrictions on macOS systems.",
    "tactic": "Defense Evasion",
    "notes": "Based on ATT&CK technique T1553.001. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "defense_evasion",
      "T1553_001",
      "macos",
      "gatekeeper",
      "applescript"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://www.linkedin.com/in/sydneymarrone/"
    },
    "why": "- This technique directly bypasses macOS Gatekeeper protections, which is critical since Apple removed the \"right-click and open\" override in August 2024, forcing attackers to adopt new methods\n- The technique has migrated from APT groups (BlueNoroff) to commodity malware families like Odyssey Stealer and MacSync Stealer, indicating widespread adoption and increased threat surface\n- Files delivered via this method can execute quarantined scripts without triggering Gatekeeper warnings, providing a direct path to initial access and execution\n- The use of custom icons and double extensions (.docx.scpt, .pptx.scpt) makes these files highly convincing to end users, increasing successful execution rates\n- Multiple samples show zero detections on VirusTotal, indicating a significant detection gap across security vendors",
    "references": "- [MITRE ATT&CK T1553.001 - Subvert Trust Controls: Gatekeeper Bypass](https://attack.mitre.org/techniques/T1553/001/)\n- [Source CTI Report](https://pberba.github.io/security/2025/11/11/macos-infection-vector-applescript-bypass-gatekeeper/)",
    "file_path": "Flames/H054.md"
  },
  {
    "id": "H055",
    "category": "Flames",
    "title": "Threat actors are using PowerShell's Get-CimInstance cmdlet to query Win32_OperatingSystem and ConvertTo-Csv to extract MainWindowTitle properties from running processes, exfiltrating environment variables under 99 characters, desktop file inventories via Shell.Application COM object, and mounted drive information to perform comprehensive host reconnaissance within 20 minutes of Gootloader JavaScript execution.",
    "tactic": "Discovery",
    "notes": "Based on ATT&CK technique T1082. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "discovery",
      "T1082",
      "gootloader",
      "powershell",
      "systeminfo"
    ],
    "submitter": {
      "name": "_(No response)_",
      "link": ""
    },
    "why": "- This specific PowerShell reconnaissance pattern occurs within 20 minutes of initial Gootloader infection and represents the earliest detectable post-compromise activity before lateral movement begins\n- The combination of Get-CimInstance Win32_OperatingSystem queries, ConvertTo-Csv parsing for MainWindowTitle extraction, Shell.Application COM object usage for desktop enumeration, and the distinctive 99-character environment variable filter creates a highly specific behavioral signature unique to Gootloader's second-stage payload\n- Detecting this reconnaissance activity provides defenders with a critical 16+ hour window before Domain Controller compromise occurs, as observed in multiple Huntress cases where DC compromise happened 17 hours after initial infection\n- The MainWindowTitle extraction technique is particularly unusual as it reveals sensitive information like open documents and credentials visible in window titles, making it a high-fidelity detection opportunity\n- This activity directly precedes hands-on-keyboard operations by Vanilla Tempest, including Kerberoasting, lateral movement via WinRM, and ransomware deployment, making early detection essential to prevent domain-wide compromise",
    "references": "- https://attack.mitre.org/techniques/T1082/\n- https://www.huntress.com/blog/gootloader-threat-detection-woff2-obfuscation",
    "file_path": "Flames/H055.md"
  },
  {
    "id": "H056",
    "category": "Flames",
    "title": "Adversaries are invalidating active user sessions by revoking OAuth refresh tokens or session cookies through compromised administrative accounts in Microsoft Entra ID, forcing users to reauthenticate and triggering MFA prompts that attackers can then spam to gain persistent access to cloud applications.",
    "tactic": "Defense Evasion",
    "notes": "Based on ATT&CK technique T1550.001. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "defense-evasion",
      "T1550.001",
      "oauth",
      "session-hijacking"
    ],
    "submitter": {
      "name": "Azrara",
      "link": "https://www.linkedin.com/in/azrara/"
    },
    "why": "- Session invalidation via administrative token revocation is a precursor to MFA push bombing attacks, allowing adversaries to force fresh authentication flows they can intercept or fatigue-approve\n- Compromised administrative accounts with token revocation privileges enable attackers to systematically invalidate legitimate user sessions across an entire tenant, creating windows for credential replay and session hijacking\n- This technique is particularly dangerous in Business Email Compromise (BEC) campaigns where attackers need to establish persistent access to cloud email and collaboration platforms after initial credential theft\n- Detecting abnormal token revocation patterns from administrative accounts provides early warning before MFA bombing attempts begin, allowing defenders to contain the compromise at the administrative level",
    "references": "- [MITRE ATT&CK T1550.001 - Use Alternate Authentication Material: Application Access Token](https://attack.mitre.org/techniques/T1550/001/)\n- [Source CTI Report](https://medium.com/@oazrara1/stop-mfa-push-bombing-detection-engineering-threat-hunting-that-actually-works-39db912f369b)",
    "file_path": "Flames/H056.md"
  },
  {
    "id": "H057",
    "category": "Flames",
    "title": "Adversaries are executing PowerShell scripts that enumerate all accessible network shares and local drives to identify files containing authentication credentials such as passwords stored in batch files, administrative documents, spreadsheets, and configuration files for subsequent use in password spraying attacks against core banking systems.",
    "tactic": "Discovery",
    "notes": "Based on ATT&CK technique T1135. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "discovery",
      "T1135",
      "financial",
      "powershell"
    ],
    "submitter": {
      "name": "Shaimon Weslley",
      "link": "https://www.linkedin.com/in/weslley-s-1540b356/"
    },
    "why": "- Plump Spider uses automated PowerShell scripts to perform extensive scans of network shares specifically to harvest credentials, which represents a critical pivot point between initial access and privilege escalation to core banking systems\n- This technique directly enables the group's password spraying attacks against LDAP-integrated banking platforms by building contextualized wordlists from discovered credentials, dramatically increasing attack success rates\n- Detection of this behavior provides an early warning before attackers gain access to core banking systems, as it occurs in Phase 3 of the attack cycle before the high-impact fraud execution phases\n- The automated and broad nature of these scans creates distinctive patterns in file access logs and PowerShell execution telemetry that are highly detectable when proper monitoring is in place\n- Financial institutions can interrupt the attack chain at this stage before adversaries compile the credential intelligence needed to compromise critical banking infrastructure",
    "references": "- [MITRE ATT&CK T1135 - Network Share Discovery](https://attack.mitre.org/techniques/T1135/)\n- [Source CTI Report](https://medium.com/@thiago_28988/plump-spider-análise-técnica-e-estratégica-de-um-grupo-de-ameaça-avançada-contra-o-setor-6afdd0fd8b3b)",
    "file_path": "Flames/H057.md"
  },
  {
    "id": "H058",
    "category": "Flames",
    "title": "Threat actors are loading legitimate vulnerable drivers such as ThrottleStop.sys and rwdrv.sys from TechPowerUp to gain kernel-level write access, enabling the subsequent loading and execution of unsigned malicious kernel drivers like hlpdrv.sys that terminate security product processes and services.",
    "tactic": "Privilege Escalation",
    "notes": "Based on ATT&CK technique T1068. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "privilege_escalation",
      "T1068",
      "BYOVD",
      "EDR_killer",
      "ransomware"
    ],
    "submitter": {
      "name": "Duc Viet Hoang",
      "link": "https://linkedin.com/in/hvdtsof/"
    },
    "why": "- This Bring Your Own Vulnerable Driver (BYOVD) technique is a critical precursor to ransomware deployment, used by multiple ransomware groups including Akira, Medusa, Qilin, and Crytox to disable endpoint security products before encryption\n- The specific driver combination (ThrottleStop.sys/rwdrv.sys paired with hlpdrv.sys) is a distinctive indicator of Shanya-packed EDR killers, providing high-fidelity detection opportunities with low false positive rates\n- Detecting vulnerable driver loading events allows security teams to intervene before the malicious unsigned driver is loaded and security products are terminated, preventing the subsequent ransomware deployment\n- This technique represents a detection gap as many security tools focus on process-level behaviors rather than kernel driver loading sequences, making it an ideal hunting opportunity",
    "references": "- [MITRE ATT&CK T1068 - Exploitation for Privilege Escalation](https://attack.mitre.org/techniques/T1068/)\n- [Source CTI Report](https://news.sophos.com/en-us/2025/12/06/inside-shanya-a-packer-as-a-service-fueling-modern-attacks/)",
    "file_path": "Flames/H058.md"
  },
  {
    "id": "M001",
    "category": "Alchemy",
    "title": "A machine learning model can detect anomalies in user login patterns that indicate compromised accounts.",
    "tactic": "Initial Access",
    "notes": "Machine learning model trained on historical login data to identify deviations from normal behavior",
    "tags": [
      "modelassisted",
      "machinelearning",
      "anomalydetection",
      "userbehavior"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://x.com/letswastetime"
    },
    "why": "- ML identifies unusual login patterns, such as unusual times, locations, or device types, which are strong indicators of account takeover attempts.\n- By learning from recent login data, ML can adapt to detect sophisticated attacks, like credential stuffing or lateral movement, that might evade static detection rules.\n- Compare current login behaviors against personalized user baselines and find potential compromise.",
    "references": "- https://attack.mitre.org/techniques/T1078/002/\n- https://plat.ai/blog/anomaly-detection-machine-learning/\n- https://docs.splunk.com/Documentation/MLApp/5.4.2/User/IDuseraccessanoms\n- https://www.elastic.co/guide/en/machine-learning/current/ootb-ml-jobs-siem.html",
    "file_path": "Alchemy/M001.md"
  },
  {
    "id": "M002",
    "category": "Alchemy",
    "title": "Beaconing behavior can be detected in encrypted DNS traffic patterns by applying machine learning models that identify anomalous, periodic communication indicative of command and control activity.",
    "tactic": "Command and Control",
    "notes": "Encrypted DNS traffic (e.g., DoH) may be used to hide beaconing communications, making it harder to detect.",
    "tags": [
      "commandandcontrol",
      "beaconing",
      "dns",
      "machinelearning"
    ],
    "submitter": {
      "name": "Sydney Marrone",
      "link": "https://x.com/letswastetime"
    },
    "why": "- Detect hidden beaconing activities by analyzing patterns in encrypted DNS traffic that deviate from typical usage.\n- Apply machine learning models to identify anomalies in encrypted DNS traffic, such as regular, periodic connections that suggest beaconing.\n- Enhance detection capabilities for encrypted communications channels that attackers may exploit to hide their C2 activities.",
    "references": "- https://attack.mitre.org/techniques/T1071/004/\n- https://unit42.paloaltonetworks.com/profiling-detecting-malicious-dns-traffic/\n- https://suleman-qutb.medium.com/using-machine-learning-for-dns-exfiltration-tunnel-detection-418376b555fa",
    "file_path": "Alchemy/M002.md"
  },
  {
    "id": "M003",
    "category": "Alchemy",
    "title": "Machine learning models can identify anomalies with user or systems initiating outbound traffic with unusually large byte sizes that may indicate potential data exfiltration activity.",
    "tactic": "Exfiltration",
    "notes": "Unusual Byte Size: Outbound packets significantly larger than the typical size associated with normal business transactions.",
    "tags": [
      "exfiltration",
      "machinelearning"
    ],
    "submitter": {
      "name": "John Grageda",
      "link": "https://www.linkedin.com/in/johngrageda/"
    },
    "why": "- Data exfiltration is a significant threat where sensitive information is transferred outside the organization. \n- Analyzing byte sizes of outbound traffic can help detect unusual patterns that may indicate unauthorized data transfer.\n- Correlate unusual byte sizes and spikes in outbound traffic volume during non-standard business hours focusing on file extensions known for containing sensitive information.",
    "references": "- https://attack.mitre.org/techniques/T1030/\n- https://thehackernews.com/2023/06/unveiling-unseen-identifying-data.html\n- https://darktrace.com/blog/bytesize-security-examining-an-insider-exfiltrating-corporate-data-from-a-singaporean-file-server-to-google-cloud",
    "file_path": "Alchemy/M003.md"
  },
  {
    "id": "M004",
    "category": "Alchemy",
    "title": "Machine learning models can identify database query anomalies indicating potential data manipulation or exfiltration activity.",
    "tactic": "Impact",
    "notes": "If a user or system executes an unusually high number of data modification queries (e.gl, INSERT, UPDATE, DELETE) within a short timeframe, particularly in sensitive databases, it may indicate potential data manipulation or exfiltration activities.",
    "tags": [
      "impact",
      "machinelearning"
    ],
    "submitter": {
      "name": "John Grageda",
      "link": "https://www.linkedin.com/in/johngrageda/"
    },
    "why": "- Data manipulation, including unauthorized changes or deletions, can be a sign of insider threats or external attacks.\n- A significant increase in the number of database modification queries (e.g., more than 100 modifications in an hour).\n- Modifications occurring in critical or sensitive database tables that typically have restricted access.\n- Database queries being executed by users who do not usually interact with those tables or databases.\n- Execution of queries that do not align with normal business operations (e.g., mass deletions or updates).",
    "references": "- https://attack.mitre.org/techniques/T1565/001/\n- https://www.mandiant.com/sites/default/files/2021-09/rpt-apt38-2018-web_v5-1.pdf",
    "file_path": "Alchemy/M004.md"
  },
  {
    "id": "M005",
    "category": "Alchemy",
    "title": "Machine learning models can detect command-line obfuscation via Base64 encoding, which adversaries may use to evade detection.",
    "tactic": "Defense Evasion",
    "notes": "Adversaries can use Base64 encoded commands and scripts in a variety of interpreters, such as PowerShell, Windows Command Shell, and Bash.",
    "tags": [
      "DefenseEvasion",
      "Obfuscation"
    ],
    "submitter": {
      "name": "Audra Streetman",
      "link": "https://x.com/audrastreetman"
    },
    "why": "- Encoded commands and scripts are more difficult to signature and analyze. \n- Machine learning models can detect and decode Base64 commands, flag unusually long commands, and detect commands that match patterns of obfuscation. \n- A number of adversaries have used Base64 to obfuscate commands and scripts, including APT19, Wizard Spider, and Fox Kitten. It is also a feature of remote access tools such as ComRAT and DarkWatchman.",
    "references": "- https://attack.mitre.org/techniques/T1027/010/\n- https://research.splunk.com/endpoint/c4db14d9-7909-48b4-a054-aa14d89dbb19/\n- https://medium.com/@Mr.AnyThink/threat-hunting-encoded-powershell-commands-part-2-monitoring-and-detecting-powershell-commands-f003742a34d7\n- https://cloud.google.com/blog/topics/threat-intelligence/malicious-powershell-detection-via-machine-learning\n- https://github.com/Azure/Azure-Sentinel-Notebooks/blob/master/Guided%20Hunting%20-%20Base64-Encoded%20Linux%20Commands.ipynb",
    "file_path": "Alchemy/M005.md"
  },
  {
    "id": "M006",
    "category": "Alchemy",
    "title": "Dictionary-based DGAs are a rare threat that require a model-based approach. These domains are algorithmically generated based on a dictionary of source words. Like traditional Domain Generation Algorithms, machine learning models can distinguish DGA / Non-DGA domains by training on sample data to learn on lexical features separating the classes.",
    "tactic": "Command and Control",
    "notes": "<ul><li>Deploying a model-based detection against a high-volume logging source like web traffic can be costly and resource-intensive. For this task, I recommend a retroactive hunt using a deduplicated list of domains, enabling a quick and efficient M-ATH method for finding threats, or at least reducing our dataset for hunting.</br><li>This is an evolving research area. Efficacy of a model may be heavily tied to the timeliness of the data, or the inclusion of the target malware family in the underlying training set.</br><li>Sample data and pre-trained models are available for this hunt, however it is also possible to generate new data by modifying the reverse-engineered DGA algorithms [here](https://github.com/baderj/domain_generation_algorithms).</br><li>False positives may be caused by Content Delivery Networks, Ad-tracking mechanisms.",
    "tags": [
      "CommandandControl,",
      "T1568.002,",
      "DGA"
    ],
    "submitter": {
      "name": "Ryan Fetterman",
      "link": "https://github.com/fetterm4n"
    },
    "why": "- An incident discovered via this method is likely a high severity / high impact finding.",
    "references": "- https://attack.mitre.org/techniques/T1568/002/\n- https://www.splunk.com/en_us/blog/security/threat-hunting-for-dictionary-dga-with-peak.html\n- https://github.com/splunk/PEAK/tree/main/dictionary_dga_classifier",
    "file_path": "Alchemy/M006.md"
  },
  {
    "id": "M007",
    "category": "Alchemy",
    "title": "Compare text-based features of artifacts (User agent strings, Malware / Executables, Browser Extensions) by encoding them with a text-vectorizer. Vectorization creates a numerical representation of the text-based feature which can then be clustered, or directly compared via a variety of similarity measures.",
    "tactic": "Command and Control, Execution",
    "notes": "<ul><li>Data Collection and Preparation: Gather and encode data into numerical formats to support analysis (e.g., text vectorization or image hashing).</br><li>Similarity Analysis: Use similarity metrics (e.g., Levenshtein, cosine, or hash-based) to find related patterns or anomalies.</br><li>Clustering: Apply clustering (e.g., K-means) to group similar items, visualizing patterns and outliers.</br><li>Prioritization and Investigation: Flag clusters or anomalies for deeper analysis, focusing on items of interest or risk.",
    "tags": [
      "T1071.001",
      "T1203"
    ],
    "submitter": {
      "name": "Ryan Fetterman",
      "link": "https://github.com/fetterm4n"
    },
    "why": "- This is an important Model-Assisted methodology which can be applied to hunt for multiple types of threats.\n- This hunt is grounded in two examples which showcase clustering vectorized text fields, and application of similarity measures pre- and post-vectorization, like Levenshtein, hamming, and euclidean distance.",
    "references": "- https://www.splunk.com/en_us/blog/tips-and-tricks/text-vectorisation-clustering-and-similarity-analysis-with-splunk-exploring-user-agent-strings-at-scale.html\n- https://www.splunk.com/en_us/blog/security/add-to-chrome-part-4-threat-hunting-in-3-dimensions-m-ath-in-the-chrome-web-store.html\n- https://attack.mitre.org/techniques/T1203/\n- https://attack.mitre.org/techniques/T1071/001/\n- https://www.geeksforgeeks.org/vectorization-techniques-in-nlp/",
    "file_path": "Alchemy/M007.md"
  }
];
