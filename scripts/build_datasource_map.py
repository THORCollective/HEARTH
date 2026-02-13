#!/usr/bin/env python3
"""
Build a mapping from broad data source categories to ATT&CK technique IDs.
Uses the ATT&CK STIX data to get actual data source associations per technique.
"""
import json
import urllib.request
from collections import defaultdict

# ATT&CK data sources → our broad categories
DATASOURCE_TO_CATEGORY = {
    # Endpoint Logs
    "Process": "endpoint",
    "Command": "endpoint",
    "File": "endpoint",
    "Module": "endpoint",
    "Driver": "endpoint",
    "Firmware": "endpoint",
    "Kernel": "endpoint",
    "Malware Repository": "endpoint",
    "Sensor Health": "endpoint",
    
    # Windows Event Logs
    "Windows Registry": "windows",
    "Active Directory": "identity",
    "Group": "identity",
    "User Account": "identity",
    "Logon Session": "identity",
    
    # Network Logs
    "Network Traffic": "network",
    "Network Share": "network",
    
    # Cloud Logs
    "Cloud Service": "cloud",
    "Cloud Storage": "cloud",
    "Instance": "cloud",
    "Image": "cloud",
    "Snapshot": "cloud",
    "Volume": "cloud",
    "Pod": "cloud",
    "Container": "cloud",
    "Cluster": "cloud",
    
    # Email Logs
    "Application Log": "application",
    
    # Web/Proxy Logs
    "Web Credential": "web_proxy",
    "Internet Scan": "web_proxy",
    "Domain Name": "web_proxy",
    "Certificate": "web_proxy",
    
    # Identity/Auth
    "WMI": "windows",
    
    # Catch-alls based on technique context
    "Named Pipe": "endpoint",
    "Script": "endpoint",
    "Service": "endpoint",
    "Scheduled Job": "endpoint",
}

# Manual mappings for the 33 techniques actually in HEARTH
# Based on what data you'd actually need to hunt each one
MANUAL_TECHNIQUE_MAP = {
    "T1005":     ["endpoint"],                          # Data from Local System
    "T1036_005": ["endpoint"],                          # Match Legitimate Name/Location
    "T1047":     ["endpoint", "windows"],               # WMI
    "T1055":     ["endpoint"],                          # Process Injection
    "T1059.001": ["endpoint", "windows"],               # PowerShell
    "T1068":     ["endpoint"],                          # Exploitation for Priv Esc
    "T1070.004": ["endpoint"],                          # File Deletion
    "T1070_004": ["endpoint"],                          # File Deletion (underscore)
    "T1071.001": ["network", "web_proxy"],              # Web Protocols C2
    "T1071_001": ["network", "web_proxy"],              # Web Protocols C2 (underscore)
    "T1078":     ["identity"],                          # Valid Accounts
    "T1078_004": ["identity", "cloud"],                 # Cloud Accounts
    "T1082":     ["endpoint"],                          # System Information Discovery
    "T1110":     ["identity"],                          # Brute Force
    "T1135":     ["endpoint", "network"],               # Network Share Discovery
    "T1185":     ["endpoint", "web_proxy"],             # Browser Session Hijacking
    "T1195_002": ["endpoint", "network"],               # Supply Chain - Software
    "T1203":     ["endpoint", "email"],                 # Exploitation for Client Exec
    "T1219":     ["endpoint", "network"],               # Remote Access Software
    "T1497.003": ["endpoint"],                          # Time Based Evasion
    "T1497_003": ["endpoint"],                          # Time Based Evasion (underscore)
    "T1528":     ["identity", "cloud"],                 # Steal App Access Token
    "T1543.004": ["endpoint"],                          # Launch Daemon
    "T1543_004": ["endpoint"],                          # Launch Daemon (underscore)
    "T1550.001": ["identity", "network"],               # App Access Token
    "T1553_001": ["endpoint"],                          # Code Signing
    "T1562.004": ["endpoint", "network"],               # Disable Firewall
    "T1562_001": ["endpoint"],                          # Disable Security Tools
    "T1564":     ["endpoint"],                          # Hide Artifacts
    "T1564_006": ["endpoint", "cloud"],                 # Run Virtual Instance
    "T1566.002": ["email", "web_proxy"],                # Spearphishing Link
    "T1566_001": ["email", "web_proxy"],                # Spearphishing Attachment (underscore)
    "T1566_002": ["email", "web_proxy"],                # Spearphishing Link (underscore)
    "T1567":     ["network", "web_proxy"],              # Exfil Over Web Service
    "T1568.002": ["network"],                           # Domain Generation Algorithms
    "T1572":     ["network"],                           # Protocol Tunneling
    "T1020":     ["network"],                           # Automated Exfiltration
    "T1021":     ["endpoint", "network", "identity"],   # Remote Services
    "T1059":     ["endpoint"],                          # Command and Scripting Interpreter
    "T1070":     ["endpoint"],                          # Indicator Removal
    "T1071":     ["network", "web_proxy"],              # Application Layer Protocol
    "T1090":     ["network", "endpoint"],               # Connection Proxy
    "T1091":     ["endpoint"],                          # Replication Through Removable Media
    "T1114_003": ["email", "cloud"],                    # Email Forwarding Rule
    "T1176":     ["endpoint", "web_proxy"],             # Browser Extensions
    "T1200":     ["endpoint"],                          # Hardware Additions
    "T1497":     ["endpoint"],                          # Virtualization/Sandbox Evasion
    "T1543":     ["endpoint"],                          # Create or Modify System Process
    "T1550":     ["identity", "network"],               # Use Alternate Auth Material
    "T1559":     ["endpoint"],                          # Inter-Process Communication
    "T1562":     ["endpoint"],                          # Impair Defenses
    "T1566":     ["email", "web_proxy"],                # Phishing
    "T1568":     ["network"],                           # Dynamic Resolution
    "T1599":     ["network", "cloud"],                  # Network Boundary Bridging
    # --- Added for HEARTH tagging pass ---
    "T1041":     ["network"],                           # Exfiltration Over C2 Channel
    "T1071_004": ["network"],                           # DNS C2
    "T1030":     ["network"],                           # Data Transfer Size Limits
    "T1039":     ["endpoint", "network"],               # Data from Network Shared Drive
    "T1048":     ["network"],                           # Exfiltration Over Alternative Protocol
    "T1098":     ["identity", "windows"],               # Account Manipulation
    "T1105":     ["endpoint", "network"],               # Ingress Tool Transfer
    "T1112":     ["endpoint", "windows"],               # Modify Registry
    "T1110_003": ["identity"],                          # Password Spraying
    "T1127":     ["endpoint"],                          # Trusted Developer Utilities
    "T1136":     ["identity", "windows"],               # Create Account
    "T1136_002": ["identity"],                          # Create Account: Domain Account
    "T1140":     ["endpoint"],                          # Deobfuscate/Decode Files
    "T1195_001": ["endpoint"],                          # Supply Chain: Compromise Software Dependencies
    "T1197":     ["endpoint", "windows"],               # BITS Jobs
    "T1204":     ["endpoint"],                          # User Execution
    "T1204_002": ["endpoint"],                          # User Execution: Malicious File
    "T1211":     ["endpoint"],                          # Exploitation for Defense Evasion
    "T1218":     ["endpoint"],                          # System Binary Proxy Execution
    "T1218_005": ["endpoint"],                          # Mshta
    "T1218_011": ["endpoint"],                          # Rundll32
    "T1027":     ["endpoint", "network"],               # Obfuscated Files or Information
    "T1003_006": ["identity", "network"],               # DCSync
    "T1036":     ["endpoint"],                          # Masquerading
    "T1059_001": ["endpoint", "windows"],               # PowerShell
    "T1059_002": ["endpoint"],                          # AppleScript
    "T1059_006": ["endpoint"],                          # Python
    "T1090_001": ["network"],                           # Internal Proxy
    "T1114":     ["email", "cloud"],                    # Email Collection
    "T1546_004": ["endpoint"],                          # Unix Shell Config Modification
    "T1546_016": ["endpoint"],                          # Installer Packages
    "T1547_001": ["endpoint", "windows"],               # Registry Run Keys
    "T1560_001": ["endpoint"],                          # Archive via Utility
    "T1564_008": ["email"],                             # Email Hiding Rules
    "T1574_002": ["endpoint"],                          # DLL Side-Loading
    "T1595_001": ["network"],                           # Active Scanning: Vulnerability Scanning
    "T1560":     ["endpoint"],                          # Archive Collected Data
}

CATEGORIES = [
    {
        "id": "endpoint",
        "name": "Endpoint Logs",
        "icon": "💻",
        "description": "EDR telemetry, process creation, file events, registry changes",
        "examples": "CrowdStrike, Carbon Black, Defender for Endpoint, Sysmon, osquery"
    },
    {
        "id": "windows",
        "name": "Windows Event Logs",
        "icon": "🪟",
        "description": "Security, System, PowerShell, WMI, Sysmon event logs",
        "examples": "Event IDs 4688, 4624, 4672, Sysmon, PowerShell Script Block"
    },
    {
        "id": "network",
        "name": "Network Logs",
        "icon": "🌐",
        "description": "Firewall, IDS/IPS, NetFlow, DNS, packet capture",
        "examples": "Palo Alto, Suricata, Zeek, Cisco ASA, DNS server logs"
    },
    {
        "id": "cloud",
        "name": "Cloud Logs",
        "icon": "☁️",
        "description": "Cloud provider audit and activity logs",
        "examples": "AWS CloudTrail, Azure Activity Log, GCP Audit Log, O365 UAL"
    },
    {
        "id": "identity",
        "name": "Identity & Auth Logs",
        "icon": "🔐",
        "description": "Authentication, authorization, directory services",
        "examples": "Active Directory, Okta, Azure AD, LDAP, RADIUS, MFA logs"
    },
    {
        "id": "email",
        "name": "Email Logs",
        "icon": "📧",
        "description": "Mail gateway, message trace, phishing detection",
        "examples": "Exchange, O365 Message Trace, Proofpoint, Mimecast"
    },
    {
        "id": "web_proxy",
        "name": "Web & Proxy Logs",
        "icon": "🔍",
        "description": "URL filtering, web gateway, SSL inspection",
        "examples": "Zscaler, Squid, BlueCoat, browser history, WAF"
    },
    {
        "id": "application",
        "name": "Application Logs",
        "icon": "📱",
        "description": "Database, web server, SaaS, custom application logs",
        "examples": "SQL audit, Apache/Nginx, Salesforce, Snowflake, app-specific"
    }
]


def build_mapping():
    """Build the final mapping using manual technique maps."""
    # Build category → techniques lookup
    cat_techniques = defaultdict(set)
    
    for tech_id, categories in MANUAL_TECHNIQUE_MAP.items():
        for cat in categories:
            cat_techniques[cat].add(tech_id)
    
    # Build output
    output_categories = []
    for cat in CATEGORIES:
        techniques = sorted(cat_techniques.get(cat["id"], set()))
        output_categories.append({
            "id": cat["id"],
            "name": cat["name"],
            "icon": cat["icon"],
            "description": cat["description"],
            "examples": cat["examples"],
            "techniques": techniques
        })
    
    output = {
        "categories": output_categories,
        "metadata": {
            "version": "1.0",
            "technique_count": len(MANUAL_TECHNIQUE_MAP),
            "note": "Manual mapping of HEARTH technique tags to broad data source categories"
        }
    }
    
    return output


def main():
    mapping = build_mapping()
    
    from pathlib import Path
    out_path = Path(__file__).parent.parent / "public" / "datasource-mapping.json"
    with open(out_path, 'w') as f:
        json.dump(mapping, f, indent=2)
    
    print(f"Generated mapping at {out_path}")
    for cat in mapping["categories"]:
        print(f"  {cat['icon']} {cat['name']}: {len(cat['techniques'])} techniques")
    
    # Verify coverage against HEARTH hunts
    hunts_path = Path(__file__).parent.parent / "public" / "hunts-data.json"
    with open(hunts_path) as f:
        hunts = json.load(f)
    
    all_mapped = set()
    for cat in mapping["categories"]:
        all_mapped.update(cat["techniques"])
    
    unmapped = set()
    for h in hunts:
        for tag in h.get("tags", []):
            if tag.startswith("T") and any(c.isdigit() for c in tag):
                if tag not in all_mapped and not tag.startswith("TA"):
                    unmapped.add(tag)
    
    if unmapped:
        print(f"\n⚠️  Unmapped techniques in HEARTH: {sorted(unmapped)}")
    else:
        print(f"\n✅ All HEARTH technique tags are mapped!")


if __name__ == "__main__":
    main()
