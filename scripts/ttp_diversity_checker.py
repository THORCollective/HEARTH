#!/usr/bin/env python3
"""
TTP Diversity Checker - Ensures hypothesis regeneration covers different TTPs.
"""

import re
import json
from typing import Dict, List, Set, Any, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict

from logger_config import get_logger
from config_manager import get_config

logger = get_logger()
config = get_config().config


@dataclass
class TTPs:
    """TTP classification for a hunt hypothesis."""
    tactic: str
    techniques: Set[str]
    procedures: Set[str]
    tools: Set[str]
    targets: Set[str]
    data_sources: Set[str]

    def to_dict(self) -> Dict[str, Any]:
        return {
            'tactic': self.tactic,
            'techniques': list(self.techniques),
            'procedures': list(self.procedures),
            'tools': list(self.tools),
            'targets': list(self.targets),
            'data_sources': list(self.data_sources)
        }


@dataclass
class TTProverlap:
    """TTP overlap analysis result."""
    overlap_score: float  # 0.0 = no overlap, 1.0 = complete overlap
    tactic_match: bool
    technique_overlap: float
    procedure_overlap: float
    tool_overlap: float
    target_overlap: float
    explanation: str

    def is_too_similar(self, threshold: float = 0.5) -> bool:
        """Check if TTPs are too similar based on threshold."""
        return self.overlap_score > threshold


class TTProvExtractor:
    """Extracts TTPs from hunt hypotheses."""

    # MITRE ATT&CK Tactics
    TACTICS = {
        'initial access', 'execution', 'persistence', 'privilege escalation',
        'defense evasion', 'credential access', 'discovery', 'lateral movement',
        'collection', 'command and control', 'exfiltration', 'impact'
    }

    # Common techniques (normalized)
    TECHNIQUES = {
        'powershell': 'T1059.001',
        'cmd': 'T1059.003',
        'wmi': 'T1047',
        'registry': 'T1112',
        'scheduled task': 'T1053',
        'service': 'T1543',
        'dll injection': 'T1055',
        'process injection': 'T1055',
        'dll hijacking': 'T1574',
        'phishing': 'T1566',
        'spearphishing': 'T1566.001',
        'remote desktop': 'T1021.001',
        'smb': 'T1021.002',
        'ssh': 'T1021.004',
        'winrm': 'T1021.006',
        'mimikatz': 'T1003',
        'credential dumping': 'T1003',
        'lsass': 'T1003.001',
        'sam': 'T1003.002',
        'browser': 'T1555.003',
        'network scan': 'T1046',
        'port scan': 'T1046',
        'file discovery': 'T1083',
        'system info': 'T1082',
        'dns tunneling': 'T1071.004',
        'http': 'T1071.001',
        'https': 'T1071.001',
        'c2': 'T1071',
        'command and control': 'T1071',
        'data exfiltration': 'T1041',
        'ransomware': 'T1486',
        'encryption': 'T1486',
        'proxy': 'T1090',
        'socks': 'T1090.001',
        'tunnel': 'T1090',
        'tunneling': 'T1090',
        'chisel': 'T1090',
        'ngrok': 'T1090',
        'port forwarding': 'T1090'
    }

    # Common tools/malware
    TOOLS = {
        'powershell', 'cmd', 'wmic', 'reg', 'sc', 'net', 'netsh', 'certutil',
        'bitsadmin', 'regsvr32', 'rundll32', 'mshta', 'cscript', 'wscript',
        'mimikatz', 'cobalt strike', 'metasploit', 'empire', 'bloodhound',
        'sharphound', 'rubeus', 'kerberoast', 'invoke-mimikatz', 'crackmapexec',
        'psexec', 'winexe', 'impacket', 'nmap', 'masscan', 'burp suite',
        'sqlmap', 'hashcat', 'john', 'hydra', 'medusa', 'nikto', 'dirb',
        'chisel', 'ngrok', 'frp', 'proxychains', 'socat', 'netcat', 'nc',
        'stunnel', 'tor', 'proxifier', 'dante', 'ssh', 'plink'
    }

    # Target systems/services
    TARGETS = {
        'windows', 'linux', 'macos', 'android', 'ios', 'active directory',
        'domain controller', 'sql server', 'mysql', 'postgresql', 'oracle',
        'apache', 'nginx', 'iis', 'tomcat', 'jboss', 'sharepoint', 'exchange',
        'office 365', 'azure', 'aws', 'gcp', 'kubernetes', 'docker', 'vmware',
        'citrix', 'rdp', 'ssh', 'ftp', 'smb', 'nfs', 'dns', 'dhcp', 'vpn'
    }

    # Data sources for detection
    DATA_SOURCES = {
        'windows event logs', 'sysmon', 'process monitoring', 'file monitoring',
        'registry monitoring', 'network traffic', 'dns logs', 'proxy logs',
        'firewall logs', 'web server logs', 'database logs', 'authentication logs',
        'email logs', 'endpoint detection', 'antivirus', 'dlp', 'siem', 'soar',
        'threat intelligence', 'honeypot', 'deception', 'sandboxing'
    }

    def extract_ttps(self, hypothesis: str, tactic: str = "") -> TTPs:
        """Extract TTPs from a hunt hypothesis."""
        hypothesis_lower = hypothesis.lower()

        # Extract tactic
        detected_tactic = self._extract_tactic(hypothesis_lower, tactic)

        # Extract techniques
        techniques = self._extract_techniques(hypothesis_lower)

        # Extract procedures (specific implementation details)
        procedures = self._extract_procedures(hypothesis_lower)

        # Extract tools
        tools = self._extract_tools(hypothesis_lower)

        # Extract targets
        targets = self._extract_targets(hypothesis_lower)

        # Extract data sources
        data_sources = self._extract_data_sources(hypothesis_lower)

        return TTPs(
            tactic=detected_tactic,
            techniques=techniques,
            procedures=procedures,
            tools=tools,
            targets=targets,
            data_sources=data_sources
        )

    def _extract_tactic(self, text: str, provided_tactic: str) -> str:
        """Extract MITRE ATT&CK tactic."""
        if provided_tactic and provided_tactic.lower() in self.TACTICS:
            return provided_tactic.lower()

        for tactic in self.TACTICS:
            if tactic in text:
                return tactic

        # Infer tactic from context
        if any(word in text for word in ['download', 'execute', 'run', 'launch']):
            return 'execution'
        elif any(word in text for word in ['persist', 'startup', 'service', 'registry']):
            return 'persistence'
        elif any(word in text for word in ['evade', 'bypass', 'hide', 'obfuscate']):
            return 'defense evasion'
        elif any(word in text for word in ['credential', 'password', 'token', 'hash']):
            return 'credential access'
        elif any(word in text for word in ['scan', 'enumerate', 'discover', 'recon']):
            return 'discovery'
        elif any(word in text for word in ['lateral', 'move', 'spread', 'pivot']):
            return 'lateral movement'
        elif any(word in text for word in ['collect', 'gather', 'harvest', 'steal']):
            return 'collection'
        elif any(word in text for word in ['c2', 'command', 'control', 'beacon']):
            return 'command and control'
        elif any(word in text for word in ['exfiltrate', 'leak', 'upload', 'transmit']):
            return 'exfiltration'
        elif any(word in text for word in ['destroy', 'delete', 'encrypt', 'ransom']):
            return 'impact'

        return 'execution'  # Default

    def _extract_techniques(self, text: str) -> Set[str]:
        """Extract MITRE ATT&CK techniques."""
        techniques = set()

        for pattern, technique_id in self.TECHNIQUES.items():
            if pattern in text:
                techniques.add(technique_id)

        # Pattern-based detection
        if re.search(r'dll.*(inject|hijack)', text):
            techniques.add('T1055')  # Process Injection / DLL Hijacking

        if re.search(r'(script|macro|vba)', text):
            techniques.add('T1059')  # Command and Scripting Interpreter

        if re.search(r'(email|attachment|link)', text):
            techniques.add('T1566')  # Phishing

        return techniques

    def _extract_procedures(self, text: str) -> Set[str]:
        """Extract specific procedures/methods."""
        procedures = set()

        # Specific command patterns
        if 'invoke-webrequest' in text:
            procedures.add('invoke-webrequest download')
        if 'certutil' in text and 'download' in text:
            procedures.add('certutil download')
        if 'bitsadmin' in text:
            procedures.add('bitsadmin transfer')
        if 'regsvr32' in text:
            procedures.add('regsvr32 execution')
        if 'rundll32' in text:
            procedures.add('rundll32 execution')
        if 'mshta' in text:
            procedures.add('mshta execution')
        if 'scheduled task' in text:
            procedures.add('scheduled task persistence')
        if 'service' in text and ('create' in text or 'install' in text):
            procedures.add('service installation')
        if 'registry' in text and ('modify' in text or 'add' in text):
            procedures.add('registry modification')
        if 'dll' in text and 'inject' in text:
            procedures.add('dll injection')
        if 'process' in text and 'inject' in text:
            procedures.add('process injection')
        if 'memory' in text and 'inject' in text:
            procedures.add('memory injection')
        if 'socks' in text and 'proxy' in text:
            procedures.add('socks proxy creation')
        if 'tunnel' in text and ('bypass' in text or 'conceal' in text):
            procedures.add('network tunneling bypass')
        if 'chisel' in text:
            procedures.add('chisel tunneling tool usage')
        if 'proxy' in text and 'c2' in text:
            procedures.add('proxy-based c2 communication')
        if 'port forwarding' in text:
            procedures.add('port forwarding technique')

        return procedures

    def _extract_tools(self, text: str) -> Set[str]:
        """Extract tools mentioned in the hypothesis."""
        tools = set()

        for tool in self.TOOLS:
            if tool in text:
                tools.add(tool)

        return tools

    def _extract_targets(self, text: str) -> Set[str]:
        """Extract target systems/services."""
        targets = set()

        for target in self.TARGETS:
            if target in text:
                targets.add(target)

        return targets

    def _extract_data_sources(self, text: str) -> Set[str]:
        """Extract data sources for detection."""
        data_sources = set()

        for source in self.DATA_SOURCES:
            if source in text:
                data_sources.add(source)

        return data_sources


class TTProvDiversityChecker:
    """Checks TTP diversity between hunt hypotheses."""

    def __init__(self):
        self.extractor = TTProvExtractor()
        self.generation_history: List[TTPs] = []

    def check_ttp_diversity(self, new_hypothesis: str, tactic: str = "") -> TTProverlap:
        """Check if new hypothesis has diverse TTPs compared to previous attempts."""
        new_ttps = self.extractor.extract_ttps(new_hypothesis, tactic)

        if not self.generation_history:
            # First hypothesis - automatically diverse, add to history
            self.generation_history.append(new_ttps)
            return TTProverlap(
                overlap_score=0.0,
                tactic_match=False,
                technique_overlap=0.0,
                procedure_overlap=0.0,
                tool_overlap=0.0,
                target_overlap=0.0,
                explanation="First hypothesis - no previous attempts to compare"
            )

        # Calculate maximum overlap with any previous attempt
        max_overlap = None
        max_overlap_score = 0.0

        for prev_ttps in self.generation_history:
            overlap = self._calculate_ttp_overlap(new_ttps, prev_ttps)
            if overlap.overlap_score > max_overlap_score:
                max_overlap_score = overlap.overlap_score
                max_overlap = overlap

        # Only add to history if TTPs are diverse enough (not too similar)
        if max_overlap is None or not max_overlap.is_too_similar(threshold=0.5):
            self.generation_history.append(new_ttps)
            logger.info(f"Added diverse TTPs to history. Total attempts: {len(self.generation_history)}")
        elif max_overlap and max_overlap.is_too_similar(threshold=0.5):
            logger.warning(f"Rejected similar TTPs. Overlap: {max_overlap.overlap_score:.1%}")

        return max_overlap or TTProverlap(
            overlap_score=0.0,
            tactic_match=False,
            technique_overlap=0.0,
            procedure_overlap=0.0,
            tool_overlap=0.0,
            target_overlap=0.0,
            explanation="No previous attempts found"
        )

    def _calculate_ttp_overlap(self, ttp1: TTPs, ttp2: TTPs) -> TTProverlap:
        """Calculate overlap between two TTP sets."""

        # Tactic match
        tactic_match = ttp1.tactic == ttp2.tactic

        # Technique overlap
        technique_overlap = self._set_overlap(ttp1.techniques, ttp2.techniques)

        # Procedure overlap
        procedure_overlap = self._set_overlap(ttp1.procedures, ttp2.procedures)

        # Tool overlap
        tool_overlap = self._set_overlap(ttp1.tools, ttp2.tools)

        # Target overlap
        target_overlap = self._set_overlap(ttp1.targets, ttp2.targets)

        # Calculate overall overlap score (weighted)
        weights = {
            'tactic': 0.3,      # High weight - different tactics = very different
            'technique': 0.25,  # High weight - different techniques = different TTPs
            'procedure': 0.2,   # Medium weight - specific implementation
            'tool': 0.15,      # Medium-low weight - tools can be similar
            'target': 0.1      # Low weight - targets can overlap
        }

        overall_score = (
            (1.0 if tactic_match else 0.0) * weights['tactic'] +
            technique_overlap * weights['technique'] +
            procedure_overlap * weights['procedure'] +
            tool_overlap * weights['tool'] +
            target_overlap * weights['target']
        )

        # Generate explanation
        explanation = self._generate_overlap_explanation(
            tactic_match, technique_overlap, procedure_overlap, tool_overlap, target_overlap
        )

        return TTProverlap(
            overlap_score=overall_score,
            tactic_match=tactic_match,
            technique_overlap=technique_overlap,
            procedure_overlap=procedure_overlap,
            tool_overlap=tool_overlap,
            target_overlap=target_overlap,
            explanation=explanation
        )

    def _set_overlap(self, set1: Set[str], set2: Set[str]) -> float:
        """Calculate Jaccard similarity between two sets."""
        if not set1 and not set2:
            return 0.0
        if not set1 or not set2:
            return 0.0

        intersection = set1.intersection(set2)
        union = set1.union(set2)

        return len(intersection) / len(union)

    def _generate_overlap_explanation(self, tactic_match: bool, technique_overlap: float,
                                    procedure_overlap: float, tool_overlap: float,
                                    target_overlap: float) -> str:
        """Generate human-readable explanation of TTP overlap."""
        explanations = []

        if tactic_match:
            explanations.append("Same MITRE ATT&CK tactic")

        if technique_overlap > 0.5:
            explanations.append(f"High technique overlap ({technique_overlap:.1%})")
        elif technique_overlap > 0.2:
            explanations.append(f"Some technique overlap ({technique_overlap:.1%})")

        if procedure_overlap > 0.5:
            explanations.append(f"Similar procedures ({procedure_overlap:.1%})")

        if tool_overlap > 0.5:
            explanations.append(f"Similar tools ({tool_overlap:.1%})")

        if target_overlap > 0.5:
            explanations.append(f"Similar targets ({target_overlap:.1%})")

        if not explanations:
            return "TTPs appear diverse with minimal overlap"

        return "; ".join(explanations)

    def get_diversity_suggestions(self, current_ttps: TTPs) -> List[str]:
        """Get suggestions for more diverse TTPs."""
        suggestions = []

        # Suggest different tactics
        used_tactics = {ttps.tactic for ttps in self.generation_history}
        available_tactics = TTProvExtractor.TACTICS - used_tactics

        if available_tactics:
            suggestions.append(f"Try different tactics: {', '.join(list(available_tactics)[:3])}")

        # Suggest different techniques
        used_techniques = set()
        for ttps in self.generation_history:
            used_techniques.update(ttps.techniques)

        if len(used_techniques) < 10:  # If we haven't used many techniques
            suggestions.append("Focus on different MITRE ATT&CK techniques")

        # Suggest different targets
        used_targets = set()
        for ttps in self.generation_history:
            used_targets.update(ttps.targets)

        available_targets = TTProvExtractor.TARGETS - used_targets
        if available_targets:
            suggestions.append(f"Target different systems: {', '.join(list(available_targets)[:3])}")

        return suggestions

    def clear_history(self):
        """Clear generation history."""
        self.generation_history.clear()

    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about TTP diversity."""
        if not self.generation_history:
            return {"total_attempts": 0}

        all_tactics = {ttps.tactic for ttps in self.generation_history}
        all_techniques = set()
        all_tools = set()

        for ttps in self.generation_history:
            all_techniques.update(ttps.techniques)
            all_tools.update(ttps.tools)

        return {
            "total_attempts": len(self.generation_history),
            "unique_tactics": len(all_tactics),
            "unique_techniques": len(all_techniques),
            "unique_tools": len(all_tools),
            "tactics_used": list(all_tactics),
            "techniques_used": list(all_techniques)
        }


# Global instance
_ttp_checker: Optional[TTProvDiversityChecker] = None


def get_ttp_diversity_checker() -> TTProvDiversityChecker:
    """Get global TTP diversity checker instance."""
    global _ttp_checker
    if _ttp_checker is None:
        _ttp_checker = TTProvDiversityChecker()
    return _ttp_checker


if __name__ == "__main__":
    # Test the TTP diversity checker
    checker = TTProvDiversityChecker()

    # Test different hypotheses
    hypotheses = [
        "Adversaries use PowerShell Invoke-WebRequest to download malicious payloads",
        "Threat actors leverage CertUtil for downloading encrypted files",
        "Attackers use scheduled tasks for persistence on Windows systems",
        "Malicious actors perform network scanning using Nmap for discovery"
    ]

    print("Testing TTP Diversity Checker")
    print("=" * 50)

    for i, hypothesis in enumerate(hypotheses, 1):
        print(f"\nHypothesis {i}: {hypothesis}")
        overlap = checker.check_ttp_diversity(hypothesis)
        print(f"Overlap Score: {overlap.overlap_score:.2%}")
        print(f"Too Similar: {overlap.is_too_similar()}")
        print(f"Explanation: {overlap.explanation}")

        if overlap.is_too_similar():
            suggestions = checker.get_diversity_suggestions(
                checker.extractor.extract_ttps(hypothesis)
            )
            print(f"Suggestions: {'; '.join(suggestions)}")

    print(f"\nFinal Stats: {checker.get_stats()}")
