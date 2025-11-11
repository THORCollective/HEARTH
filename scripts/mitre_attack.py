#!/usr/bin/env python3
"""
MITRE ATT&CK Data Manager

Provides validated technique lookups, tactic mapping, and TTP enrichment
using official MITRE ATT&CK Enterprise framework data.

This replaces keyword-based tactic inference with authoritative data.
"""

import json
from pathlib import Path
from typing import Dict, List, Optional, Set
import re

class MITREAttack:
    """
    Manages MITRE ATT&CK Enterprise framework data.

    Provides:
    - Technique validation and lookup
    - Tactic to technique mapping
    - Data source information
    - Related technique suggestions
    """

    def __init__(self, data_path: str = "data/enterprise-attack.json"):
        """
        Initialize MITRE ATT&CK data manager.

        Args:
            data_path: Path to enterprise-attack.json file
        """
        self.data_path = Path(data_path)
        self.techniques: Dict[str, Dict] = {}
        self.tactics: Dict[str, Dict] = {}
        self.tactic_to_techniques: Dict[str, List[str]] = {}
        self.data_sources: Dict[str, List[str]] = {}

        self._load_data()

    def _load_data(self):
        """Load and parse MITRE ATT&CK data."""
        if not self.data_path.exists():
            raise FileNotFoundError(
                f"MITRE ATT&CK data not found at {self.data_path}. "
                "Run: curl -o data/enterprise-attack.json "
                "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json"
            )

        with open(self.data_path, 'r') as f:
            data = json.load(f)

        # Process all objects
        for obj in data.get('objects', []):
            obj_type = obj.get('type')

            if obj_type == 'attack-pattern':
                self._process_technique(obj)
            elif obj_type == 'x-mitre-tactic':
                self._process_tactic(obj)

    def _process_technique(self, obj: Dict):
        """Process a technique object."""
        # Get technique ID
        external_refs = obj.get('external_references', [])
        technique_id = None

        for ref in external_refs:
            if ref.get('source_name') == 'mitre-attack':
                technique_id = ref.get('external_id')
                break

        if not technique_id:
            return

        # Skip revoked or deprecated techniques
        if obj.get('revoked') or obj.get('x_mitre_deprecated'):
            return

        # Extract tactic information
        tactics = []
        kill_chain_phases = obj.get('kill_chain_phases', [])
        for phase in kill_chain_phases:
            if phase.get('kill_chain_name') == 'mitre-attack':
                tactic_name = phase.get('phase_name', '').replace('-', ' ').title()
                tactics.append(tactic_name)

        # Extract data sources
        data_sources = []
        for data_source in obj.get('x_mitre_data_sources', []):
            data_sources.append(data_source)

        # Store technique data
        self.techniques[technique_id] = {
            'id': technique_id,
            'name': obj.get('name', ''),
            'description': obj.get('description', ''),
            'tactics': tactics,
            'data_sources': data_sources,
            'platforms': obj.get('x_mitre_platforms', []),
            'is_subtechnique': '.' in technique_id,
            'parent': technique_id.split('.')[0] if '.' in technique_id else None
        }

        # Build tactic to techniques mapping
        for tactic in tactics:
            if tactic not in self.tactic_to_techniques:
                self.tactic_to_techniques[tactic] = []
            self.tactic_to_techniques[tactic].append(technique_id)

    def _process_tactic(self, obj: Dict):
        """Process a tactic object."""
        # Get tactic shortname
        tactic_id = obj.get('x_mitre_shortname', '')
        tactic_name = tactic_id.replace('-', ' ').title()

        self.tactics[tactic_name] = {
            'name': tactic_name,
            'shortname': tactic_id,
            'description': obj.get('description', '')
        }

    def validate_technique(self, technique_id: str) -> Optional[Dict]:
        """
        Validate and retrieve technique information.

        Args:
            technique_id: MITRE technique ID (e.g., "T1071.001")

        Returns:
            Dictionary with technique details if valid, None otherwise
        """
        # Normalize technique ID
        technique_id = technique_id.upper().strip()

        # Validate format
        if not re.match(r'^T\d{4}(\.\d{3})?$', technique_id):
            return None

        return self.techniques.get(technique_id)

    def get_technique_tactic(self, technique_id: str) -> Optional[str]:
        """
        Get the primary tactic for a technique.

        Args:
            technique_id: MITRE technique ID

        Returns:
            Primary tactic name, or None if technique not found
        """
        technique = self.validate_technique(technique_id)
        if not technique:
            return None

        tactics = technique.get('tactics', [])
        return tactics[0] if tactics else None

    def get_all_tactics(self, technique_id: str) -> List[str]:
        """
        Get all tactics associated with a technique.

        Args:
            technique_id: MITRE technique ID

        Returns:
            List of tactic names
        """
        technique = self.validate_technique(technique_id)
        if not technique:
            return []

        return technique.get('tactics', [])

    def search_techniques_by_name(self, query: str) -> List[Dict]:
        """
        Search for techniques by name.

        Args:
            query: Search query

        Returns:
            List of matching techniques
        """
        query_lower = query.lower()
        results = []

        for tech_id, tech_data in self.techniques.items():
            name_lower = tech_data['name'].lower()
            if query_lower in name_lower:
                results.append(tech_data)

        return sorted(results, key=lambda x: x['name'])

    def get_techniques_by_tactic(self, tactic: str) -> List[str]:
        """
        Get all technique IDs for a given tactic.

        Args:
            tactic: Tactic name (e.g., "Command and Control")

        Returns:
            List of technique IDs
        """
        return self.tactic_to_techniques.get(tactic, [])

    def suggest_alternative_techniques(
        self,
        technique_id: str,
        exclude_tactics: Optional[List[str]] = None,
        limit: int = 5
    ) -> List[Dict]:
        """
        Suggest alternative techniques from different tactics.

        Args:
            technique_id: Current technique ID
            exclude_tactics: Tactics to exclude from suggestions
            limit: Maximum number of suggestions

        Returns:
            List of alternative technique dictionaries
        """
        current_tech = self.validate_technique(technique_id)
        if not current_tech:
            return []

        exclude_tactics = exclude_tactics or []
        current_tactics = set(current_tech['tactics'])

        # Get parent technique if this is a subtechnique
        parent_id = current_tech.get('parent')

        alternatives = []

        # Look for sibling subtechniques first
        if parent_id:
            for tech_id, tech_data in self.techniques.items():
                if tech_data.get('parent') == parent_id and tech_id != technique_id:
                    # Check if tactics are different
                    tech_tactics = set(tech_data['tactics'])
                    if not tech_tactics.intersection(exclude_tactics):
                        alternatives.append(tech_data)

        # If we need more, add techniques with similar names
        if len(alternatives) < limit:
            name_words = set(current_tech['name'].lower().split())

            for tech_id, tech_data in self.techniques.items():
                if tech_id == technique_id or tech_id in [a['id'] for a in alternatives]:
                    continue

                tech_tactics = set(tech_data['tactics'])
                if tech_tactics.intersection(exclude_tactics):
                    continue

                tech_words = set(tech_data['name'].lower().split())
                overlap = len(name_words.intersection(tech_words))

                if overlap > 0:
                    alternatives.append({
                        **tech_data,
                        '_similarity': overlap
                    })

        # Sort by similarity and limit
        alternatives.sort(key=lambda x: x.get('_similarity', 0), reverse=True)
        return alternatives[:limit]

    def get_data_sources(self, technique_id: str) -> List[str]:
        """
        Get data sources for a technique.

        Args:
            technique_id: MITRE technique ID

        Returns:
            List of data source names
        """
        technique = self.validate_technique(technique_id)
        if not technique:
            return []

        return technique.get('data_sources', [])

    def infer_technique_from_description(self, description: str, tactic: Optional[str] = None) -> List[Dict]:
        """
        Infer possible techniques from a text description.

        Args:
            description: Text description of adversary behavior
            tactic: Optional tactic filter

        Returns:
            List of matching techniques, sorted by relevance
        """
        description_lower = description.lower()
        matches = []

        # Extract potential technique keywords
        keywords = set(re.findall(r'\b\w{4,}\b', description_lower))

        for tech_id, tech_data in self.techniques.items():
            # Skip if tactic doesn't match
            if tactic and tactic not in tech_data['tactics']:
                continue

            # Calculate relevance score
            name_words = set(tech_data['name'].lower().split())
            desc_words = set(re.findall(r'\b\w{4,}\b', tech_data['description'].lower()))

            name_overlap = len(keywords.intersection(name_words))
            desc_overlap = len(keywords.intersection(desc_words))

            score = (name_overlap * 3) + desc_overlap

            if score > 0:
                matches.append({
                    **tech_data,
                    '_relevance_score': score
                })

        # Sort by relevance
        matches.sort(key=lambda x: x['_relevance_score'], reverse=True)
        return matches[:10]


# Global instance for easy access
_mitre_instance = None

def get_mitre_attack() -> MITREAttack:
    """Get singleton MITRE ATT&CK instance."""
    global _mitre_instance
    if _mitre_instance is None:
        _mitre_instance = MITREAttack()
    return _mitre_instance


# Convenience functions
def validate_technique(technique_id: str) -> Optional[Dict]:
    """Validate a technique ID."""
    return get_mitre_attack().validate_technique(technique_id)


def get_technique_tactic(technique_id: str) -> Optional[str]:
    """Get primary tactic for a technique."""
    return get_mitre_attack().get_technique_tactic(technique_id)


def search_techniques(query: str) -> List[Dict]:
    """Search techniques by name."""
    return get_mitre_attack().search_techniques_by_name(query)


if __name__ == '__main__':
    # Test the MITRE ATT&CK manager
    print("🔍 MITRE ATT&CK Data Manager Test\n")

    mitre = MITREAttack()

    # Test 1: Validate technique
    print("1️⃣  Testing technique validation...")
    tech = mitre.validate_technique("T1071.001")
    if tech:
        print(f"   ✅ T1071.001: {tech['name']}")
        print(f"      Tactics: {', '.join(tech['tactics'])}")
        print(f"      Data Sources: {len(tech['data_sources'])}")
    else:
        print("   ❌ Validation failed")

    # Test 2: Search techniques
    print("\n2️⃣  Searching for 'PowerShell' techniques...")
    results = mitre.search_techniques_by_name("PowerShell")
    print(f"   Found {len(results)} matches:")
    for result in results[:3]:
        print(f"   - {result['id']}: {result['name']}")

    # Test 3: Get techniques by tactic
    print("\n3️⃣  Getting Command and Control techniques...")
    c2_techniques = mitre.get_techniques_by_tactic("Command And Control")
    print(f"   Found {len(c2_techniques)} techniques")

    # Test 4: Statistics
    print("\n📊 Statistics:")
    print(f"   Total techniques: {len(mitre.techniques)}")
    print(f"   Total tactics: {len(mitre.tactics)}")
    print(f"   Tactics: {', '.join(sorted(mitre.tactics.keys()))}")
