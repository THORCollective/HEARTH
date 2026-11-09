"""Contract of scripts.build_datasource_map: ATT&CK detection strategies ->
analytics -> data components -> HEARTH data source categories."""

import json

import pytest

from scripts import build_datasource_map as bdm
from scripts.hunt_schema import DATA_SOURCE_CATEGORIES


def _ref(ext_id):
    return [{"source_name": "mitre-attack", "external_id": ext_id}]


def _bundle(*, extra_component=None):
    components = [
        ("x-mitre-data-component--proc", "Process Creation"),
        ("x-mitre-data-component--trail", "Cloud Service Modification"),
        ("x-mitre-data-component--dns", "Passive DNS"),
    ]
    if extra_component:
        components.append(("x-mitre-data-component--new", extra_component))
    objs = [
        {"type": "x-mitre-data-component", "id": i, "name": n} for i, n in components
    ]
    objs += [
        {
            "type": "attack-pattern",
            "id": "ap--1059",
            "external_references": _ref("T1059"),
        },
        {
            "type": "attack-pattern",
            "id": "ap--1059.001",
            "external_references": _ref("T1059.001"),
        },
        {
            "type": "attack-pattern",
            "id": "ap--1059.004",
            "external_references": _ref("T1059.004"),
            "x_mitre_platforms": ["Linux", "macOS"],
        },
        {
            "type": "attack-pattern",
            "id": "ap--1578",
            "external_references": _ref("T1578"),
            "x_mitre_platforms": ["IaaS", "macOS", "ESXi"],
        },
        {
            "type": "attack-pattern",
            "id": "ap--1583",
            "external_references": _ref("T1583"),
        },
        {
            "type": "attack-pattern",
            "id": "ap--1583.001",
            "external_references": _ref("T1583.001"),
        },
        {
            "type": "attack-pattern",
            "id": "ap--old",
            "external_references": _ref("T9999"),
            "revoked": True,
        },
        # Analytics carry the log-source -> data-component links.
        {
            "type": "x-mitre-analytic",
            "id": "an--proc",
            "x_mitre_log_source_references": [
                {
                    "x_mitre_data_component_ref": "x-mitre-data-component--proc",
                    "name": "WinEventLog:Security",
                }
            ],
        },
        {
            "type": "x-mitre-analytic",
            "id": "an--trail",
            "x_mitre_log_source_references": [
                {
                    "x_mitre_data_component_ref": "x-mitre-data-component--trail",
                    "name": "AWS:CloudTrail",
                }
            ],
        },
        {
            "type": "x-mitre-analytic",
            "id": "an--dns",
            "x_mitre_log_source_references": [
                {
                    "x_mitre_data_component_ref": "x-mitre-data-component--dns",
                    "name": "Domain Name",
                }
            ],
        },
        {
            "type": "x-mitre-detection-strategy",
            "id": "det--ps",
            "x_mitre_analytic_refs": ["an--proc"],
        },
        {
            "type": "x-mitre-detection-strategy",
            "id": "det--cloud",
            "x_mitre_analytic_refs": ["an--trail", "an--proc"],
        },
        {
            "type": "x-mitre-detection-strategy",
            "id": "det--dns",
            "x_mitre_analytic_refs": ["an--dns"],
        },
        {
            "type": "x-mitre-detection-strategy",
            "id": "det--dead",
            "x_mitre_analytic_refs": ["an--trail"],
            "x_mitre_deprecated": True,
        },
        {
            "type": "relationship",
            "relationship_type": "detects",
            "source_ref": "det--ps",
            "target_ref": "ap--1059.001",
        },
        {
            "type": "relationship",
            "relationship_type": "detects",
            "source_ref": "det--cloud",
            "target_ref": "ap--1578",
        },
        {
            "type": "relationship",
            "relationship_type": "detects",
            "source_ref": "det--dns",
            "target_ref": "ap--1583.001",
        },
        {
            "type": "relationship",
            "relationship_type": "detects",
            "source_ref": "det--dead",
            "target_ref": "ap--1059.004",
        },
        {
            "type": "relationship",
            "relationship_type": "detects",
            "source_ref": "det--ps",
            "target_ref": "ap--old",
        },
    ]
    return {"objects": objs}


def _mini_component_map(monkeypatch, **extra):
    m = {
        "Process Creation": ["endpoint"],
        "Cloud Service Modification": ["cloud"],
        "Passive DNS": [],
        **extra,
    }
    monkeypatch.setattr(bdm, "COMPONENT_TO_CATEGORIES", m)


def test_technique_categories_follow_detection_chain(monkeypatch):
    _mini_component_map(monkeypatch)
    tc = bdm.technique_categories(_bundle())
    assert tc["T1059.001"] == {"endpoint"}
    assert {"cloud", "endpoint"} <= tc["T1578"]


def test_parent_inherits_union_of_children_and_child_inherits_parent(monkeypatch):
    _mini_component_map(monkeypatch)
    tc = bdm.technique_categories(_bundle())
    # T1059 has no direct detection: union of its detected sub-techniques.
    assert tc["T1059"] == {"endpoint"}
    # T1059.004's only detection strategy is deprecated: fall back to parent.
    assert "endpoint" in tc["T1059.004"]


def test_macos_endpoint_techniques_also_map_to_macos(monkeypatch):
    _mini_component_map(monkeypatch)
    tc = bdm.technique_categories(_bundle())
    assert tc["T1059.004"] == {"endpoint", "macos"}  # macOS platform + endpoint
    assert tc["T1059.001"] == {"endpoint"}  # no macOS platform
    assert tc["T1578"] == {"cloud", "endpoint", "macos", "appliance"}


def test_network_device_and_esxi_techniques_map_to_appliance(monkeypatch):
    _mini_component_map(monkeypatch)
    tc = bdm.technique_categories(_bundle())
    assert "appliance" in tc["T1578"]  # ESXi platform
    assert "appliance" not in tc["T1059.004"]  # Linux/macOS only


def test_external_intel_components_map_to_no_category(monkeypatch):
    _mini_component_map(monkeypatch)
    tc = bdm.technique_categories(_bundle())
    assert "T1583.001" not in tc
    assert "T1583" not in tc


def test_revoked_objects_are_ignored(monkeypatch):
    _mini_component_map(monkeypatch)
    assert "T9999" not in bdm.technique_categories(_bundle())


def test_unreviewed_attack_component_fails_loudly(monkeypatch):
    # A new ATT&CK release adding a component must force a human decision.
    _mini_component_map(monkeypatch)
    with pytest.raises(bdm.UnmappedComponentError, match="Brand New Component"):
        bdm.technique_categories(_bundle(extra_component="Brand New Component"))


def test_stale_component_map_entry_fails_loudly(monkeypatch):
    _mini_component_map(monkeypatch, **{"Removed Component": ["endpoint"]})
    with pytest.raises(bdm.UnmappedComponentError, match="Removed Component"):
        bdm.technique_categories(_bundle())


def test_build_mapping_keeps_site_shape(monkeypatch):
    _mini_component_map(monkeypatch)
    out = bdm.build_mapping(_bundle(), attack_modified="2026-07-31")
    assert [c["id"] for c in out["categories"]] == list(DATA_SOURCE_CATEGORIES)
    by_id = {c["id"]: c for c in out["categories"]}
    for c in out["categories"]:
        assert {"id", "name", "icon", "description", "examples", "techniques"} <= set(c)
    assert by_id["cloud"]["techniques"] == ["T1578"]
    assert by_id["endpoint"]["techniques"] == [
        "T1059",
        "T1059.001",
        "T1059.004",
        "T1578",
    ]
    assert by_id["email"]["techniques"] == []
    assert by_id["macos"]["techniques"] == ["T1059.004", "T1578"]
    assert by_id["appliance"]["techniques"] == ["T1578"]
    assert out["metadata"]["attack_modified"] == "2026-07-31"
    json.dumps(out)  # serialisable


@pytest.mark.skipif(
    not bdm.SOURCE.exists(),
    reason="data/enterprise-attack.json is git-ignored; download it to run",
)
def test_real_component_map_covers_bundled_attack():
    """The component table must match the local ATT&CK bundle exactly."""
    bundle = json.loads(bdm.SOURCE.read_text())
    bdm.technique_categories(bundle)  # raises on drift either way


def test_component_map_only_uses_known_categories():
    for name, cats in bdm.COMPONENT_TO_CATEGORIES.items():
        assert set(cats) <= set(DATA_SOURCE_CATEGORIES), name
