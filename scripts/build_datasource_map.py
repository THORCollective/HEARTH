#!/usr/bin/env python3
"""Build public/datasource-mapping.json from MITRE ATT&CK detection strategies.

ATT&CK v18 links each technique to detection strategies, each strategy to
analytics, and each analytic to the data components (log sources) it reads.
This script follows that chain and maps every data component to HEARTH's
broad data source categories with the hand-reviewed COMPONENT_TO_CATEGORIES
table below — the only part a human maintains.

This mapping is the *fallback* for "What Can I Hunt?": ATT&CK lists every log
source that could detect a technique, which is far broader than what a single
hunt needs. A hunt's own `data_source_categories` frontmatter wins over it.

Run from the repo root:  python scripts/build_datasource_map.py
"""

from __future__ import annotations

import json
import os
import sys
from collections import defaultdict
from pathlib import Path

_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)

from scripts.hunt_schema import DATA_SOURCE_CATEGORIES

ROOT = Path(_REPO_ROOT)
SOURCE = ROOT / "data" / "enterprise-attack.json"
TARGET = ROOT / "public" / "datasource-mapping.json"


class UnmappedComponentError(ValueError):
    """COMPONENT_TO_CATEGORIES and the ATT&CK bundle disagree."""


_EP, _WIN, _NET, _CLOUD, _ID, _APP = (
    "endpoint",
    "windows",
    "network",
    "cloud",
    "identity",
    "application",
)

# Every live ATT&CK data component -> HEARTH categories. An empty list means
# "external intelligence, not telemetry you collect" (DNS registration data,
# internet scans, malware repositories): such techniques get no category.
# The build fails if ATT&CK adds or removes a component, forcing a review.
COMPONENT_TO_CATEGORIES: dict[str, list[str]] = {
    # Host process / file / module telemetry (EDR, Sysmon, auditd, unified log)
    **{
        n: [_EP]
        for n in (
            "Command Execution",
            "Process Creation",
            "Process Access",
            "Process Metadata",
            "Process Modification",
            "Process Termination",
            "File Access",
            "File Creation",
            "File Deletion",
            "File Metadata",
            "File Modification",
            "Module Load",
            "Driver Load",
            "Driver Metadata",
            "Kernel Module Load",
            "OS API Execution",
            "Drive Access",
            "Drive Creation",
            "Drive Modification",
            "Firmware Modification",
            "Host Status",
            "Named Pipe Metadata",
            "Script Execution",
            "Scheduled Job Creation",
            "Scheduled Job Metadata",
            "Scheduled Job Modification",
            "Service Creation",
            "Service Metadata",
            "Service Modification",
        )
    },
    # Windows-only artefacts: visible to EDR and in Windows event logs
    **{
        n: [_EP, _WIN]
        for n in (
            "Windows Registry Key Access",
            "Windows Registry Key Creation",
            "Windows Registry Key Deletion",
            "Windows Registry Key Modification",
            "WMI Creation",
        )
    },
    # Network sensors, firewalls, flow
    "Network Connection Creation": [_NET, _EP],  # Sysmon 3 / EDR net events too
    "Network Traffic Content": [_NET],
    "Network Traffic Flow": [_NET],
    "Network Share Access": [_NET, _WIN],  # 5140/5145
    "Firewall Disable": [_NET],
    "Firewall Enumeration": [_NET],
    "Firewall Metadata": [_NET],
    "Firewall Rule Modification": [_NET],
    # Directory services (DC event logs)
    **{
        n: [_ID, _WIN]
        for n in (
            "Active Directory Credential Request",
            "Active Directory Object Access",
            "Active Directory Object Creation",
            "Active Directory Object Deletion",
            "Active Directory Object Modification",
        )
    },
    # Authentication and account lifecycle (IdP, AD, cloud IAM)
    **{
        n: [_ID]
        for n in (
            "Logon Session Creation",
            "Logon Session Metadata",
            "User Account Authentication",
            "User Account Creation",
            "User Account Deletion",
            "User Account Metadata",
            "User Account Modification",
            "Group Enumeration",
            "Group Metadata",
            "Group Modification",
            "Web Credential Creation",
            "Web Credential Usage",
        )
    },
    # Cloud control plane, storage, compute, containers
    **{
        n: [_CLOUD]
        for n in (
            "Cloud Service Disable",
            "Cloud Service Enumeration",
            "Cloud Service Metadata",
            "Cloud Service Modification",
            "Cloud Storage Access",
            "Cloud Storage Creation",
            "Cloud Storage Deletion",
            "Cloud Storage Enumeration",
            "Cloud Storage Metadata",
            "Cloud Storage Modification",
            "Instance Creation",
            "Instance Deletion",
            "Instance Enumeration",
            "Instance Metadata",
            "Instance Modification",
            "Instance Start",
            "Instance Stop",
            "Image Creation",
            "Image Deletion",
            "Image Metadata",
            "Image Modification",
            "Snapshot Creation",
            "Snapshot Deletion",
            "Snapshot Enumeration",
            "Snapshot Metadata",
            "Snapshot Modification",
            "Volume Creation",
            "Volume Deletion",
            "Volume Enumeration",
            "Volume Metadata",
            "Volume Modification",
            "Pod Creation",
            "Pod Enumeration",
            "Pod Modification",
            "Container Creation",
            "Container Enumeration",
            "Container Start",
        )
    },
    # SaaS / M365 / app logs
    "Application Log Content": [_APP],
    # External intelligence — not collected from your environment
    **{
        n: []
        for n in (
            "Active DNS",
            "Passive DNS",
            "Domain Registration",
            "Certificate Registration",
            "Response Content",
            "Response Metadata",
            "Social Media",
            "Malware Content",
            "Malware Metadata",
        )
    },
}

# Display metadata for the site. Order is the order shown in the UI.
CATEGORY_META = {
    "endpoint": (
        "Endpoint Logs",
        "💻",
        "EDR telemetry, process creation, file events, registry changes",
        "CrowdStrike, Carbon Black, Defender for Endpoint, Sysmon, osquery",
    ),
    "windows": (
        "Windows Event Logs",
        "🪟",
        "Security, System, PowerShell, WMI, Sysmon event logs",
        "Event IDs 4688, 4624, 4672, Sysmon, PowerShell Script Block",
    ),
    "network": (
        "Network Logs",
        "🌐",
        "Firewall, IDS/IPS, NetFlow, DNS, packet capture",
        "Palo Alto, Suricata, Zeek, Cisco ASA, DNS server logs",
    ),
    "cloud": (
        "Cloud Logs",
        "☁️",
        "Cloud provider audit and activity logs",
        "AWS CloudTrail, Azure Activity Log, GCP Audit Log, O365 UAL",
    ),
    "identity": (
        "Identity & Auth Logs",
        "🔐",
        "Authentication, authorization, directory services",
        "Active Directory, Okta, Azure AD, LDAP, RADIUS, MFA logs",
    ),
    "email": (
        "Email Logs",
        "📧",
        "Mail gateway, message trace, phishing detection",
        "Exchange, O365 Message Trace, Proofpoint, Mimecast",
    ),
    "web_proxy": (
        "Web & Proxy Logs",
        "🔍",
        "URL filtering, web gateway, SSL inspection",
        "Zscaler, Squid, BlueCoat, browser history, WAF",
    ),
    "application": (
        "Application Logs",
        "📱",
        "Database, web server, SaaS, custom application logs",
        "SQL audit, Apache/Nginx, Salesforce, Snowflake, app-specific",
    ),
    "macos": (
        "macOS Logs",
        "🍎",
        "Unified log, Endpoint Security framework, launchd, TCC, Keychain",
        "Apple ESF via EDR, Jamf Protect, unified log, osquery on macOS",
    ),
    "appliance": (
        "Appliance & Hypervisor Logs",
        "🗄️",
        "Network appliance and hypervisor system, admin and config logs",
        "FortiOS, Cisco, Juniper, NetScaler, Ivanti, ESXi hostd/vpxa, vCenter events",
    ),
}
assert tuple(CATEGORY_META) == DATA_SOURCE_CATEGORIES


def _live(obj: dict) -> bool:
    return not obj.get("revoked") and not obj.get("x_mitre_deprecated")


def _ext_id(obj: dict) -> str | None:
    for ref in obj.get("external_references", []):
        if ref.get("source_name") == "mitre-attack":
            return ref.get("external_id")
    return None


_APPLIANCE_PLATFORMS = {"Network Devices", "ESXi"}


def technique_categories(bundle: dict) -> dict[str, set[str]]:
    """Return technique ID -> categories for every live, mappable technique.

    Resolution: a technique's own detection strategies; else its parent's
    (sub-technique); else the union of its sub-techniques' (parent).
    Techniques that resolve to nothing are omitted. An endpoint technique
    that ATT&CK lists for the macOS platform also maps to macos; a technique
    for the Network Devices or ESXi platform also maps to appliance.
    """
    objs = bundle.get("objects", [])
    by_id = {o["id"]: o for o in objs if "id" in o}

    live_components = {
        o["name"]
        for o in objs
        if o.get("type") == "x-mitre-data-component" and _live(o)
    }
    unreviewed = live_components - COMPONENT_TO_CATEGORIES.keys()
    stale = COMPONENT_TO_CATEGORIES.keys() - live_components
    if unreviewed or stale:
        raise UnmappedComponentError(
            "COMPONENT_TO_CATEGORIES is out of sync with ATT&CK. "
            f"Add: {sorted(unreviewed)}; remove: {sorted(stale)}"
        )

    direct: dict[str, set[str]] = defaultdict(set)
    for rel in objs:
        if rel.get("relationship_type") != "detects" or not _live(rel):
            continue
        strategy = by_id.get(rel.get("source_ref"))
        technique = by_id.get(rel.get("target_ref"))
        if not strategy or not technique or not (_live(strategy) and _live(technique)):
            continue
        tid = _ext_id(technique)
        if not tid:
            continue
        for analytic_ref in strategy.get("x_mitre_analytic_refs", []):
            analytic = by_id.get(analytic_ref)
            if not analytic or not _live(analytic):
                continue
            for src in analytic.get("x_mitre_log_source_references", []):
                component = by_id.get(src.get("x_mitre_data_component_ref"))
                if component and _live(component):
                    direct[tid].update(COMPONENT_TO_CATEGORIES[component["name"]])

    platforms: dict[str, set[str]] = {
        tid: set(o.get("x_mitre_platforms", []))
        for o in objs
        if o.get("type") == "attack-pattern" and _live(o) and (tid := _ext_id(o))
    }
    all_techniques = platforms.keys()
    # Parents first, so a sub-technique can fall back to its resolved parent.
    resolved: dict[str, set[str]] = {}
    for tid in sorted(all_techniques, key=lambda t: "." in t):
        cats = set(direct.get(tid, ()))
        if not cats and "." not in tid:
            for other, other_cats in direct.items():
                if other.startswith(tid + "."):
                    cats |= other_cats
        if not cats and "." in tid:
            cats = set(resolved.get(tid.split(".")[0], ()))
        resolved[tid] = cats
    for tid, cats in resolved.items():
        if _EP in cats and "macOS" in platforms[tid]:
            cats.add("macos")
        if cats and platforms[tid] & _APPLIANCE_PLATFORMS:
            cats.add("appliance")
    return {tid: cats for tid, cats in resolved.items() if cats}


def build_mapping(bundle: dict, attack_modified: str) -> dict:
    tech_cats = technique_categories(bundle)
    per_cat: dict[str, list[str]] = {c: [] for c in DATA_SOURCE_CATEGORIES}
    for tid in sorted(tech_cats):
        for cat in tech_cats[tid]:
            per_cat[cat].append(tid)

    categories = []
    for cid, (name, icon, description, examples) in CATEGORY_META.items():
        categories.append(
            {
                "id": cid,
                "name": name,
                "icon": icon,
                "description": description,
                "examples": examples,
                "techniques": per_cat[cid],
            }
        )
    return {
        "categories": categories,
        "metadata": {
            "version": "2.0",
            "source": "MITRE ATT&CK detection strategies -> analytics -> data components",
            "attack_modified": attack_modified,
            "technique_count": len(tech_cats),
            "note": (
                "Fallback only: lists every category that could detect a "
                "technique. A hunt's data_source_categories frontmatter takes "
                "precedence."
            ),
        },
    }


def _attack_modified(bundle: dict) -> str:
    for o in bundle.get("objects", []):
        if o.get("type") == "x-mitre-matrix":
            return o.get("modified", "")[:10]
    return ""


def main() -> int:
    if not SOURCE.exists():
        print(f"ERROR: {SOURCE} not found.", file=sys.stderr)
        return 1
    bundle = json.loads(SOURCE.read_text())
    try:
        mapping = build_mapping(bundle, _attack_modified(bundle))
    except UnmappedComponentError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1

    TARGET.write_text(json.dumps(mapping, indent=2, ensure_ascii=False) + "\n")
    print(
        f"Wrote {TARGET.relative_to(ROOT)} "
        f"({mapping['metadata']['technique_count']} techniques)"
    )
    for cat in mapping["categories"]:
        print(f"  {cat['icon']} {cat['name']}: {len(cat['techniques'])} techniques")
    return 0


if __name__ == "__main__":
    sys.exit(main())
