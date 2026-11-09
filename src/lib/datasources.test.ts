import { describe, expect, it } from "vitest";
import type { Hunt } from "../types/Hunt";
import {
  buildTechniqueIndex,
  canRunHunt,
  huntDataSources,
  type DatasourceMapping,
} from "./datasources";

const mapping: DatasourceMapping = {
  categories: [
    {
      id: "endpoint",
      name: "Endpoint Logs",
      icon: "",
      description: "",
      techniques: ["T1059", "T1059.001", "T1578"],
    },
    {
      id: "cloud",
      name: "Cloud Logs",
      icon: "",
      description: "",
      techniques: ["T1578"],
    },
    {
      id: "email",
      name: "Email Logs",
      icon: "",
      description: "",
      techniques: [],
    },
  ],
  metadata: {},
};
const index = buildTechniqueIndex(mapping);

function hunt(partial: Partial<Hunt>): Hunt {
  return {
    id: "H001",
    category: "Flames",
    title: "t",
    tactic: "",
    notes: "",
    tags: [],
    submitter: { name: "x", link: "" },
    why: "",
    references: "",
    file_path: "Flames/H001.md",
    ...partial,
  };
}

describe("huntDataSources", () => {
  it("prefers the hunt's declared categories", () => {
    const h = hunt({
      techniques: ["T1578"],
      data_source_categories: ["email"],
    });
    expect(huntDataSources(h, index)).toEqual({
      categories: ["email"],
      origin: "declared",
    });
  });

  it("falls back to ATT&CK-derived categories from techniques", () => {
    const h = hunt({ techniques: ["T1578", "T1059.001"] });
    expect(huntDataSources(h, index)).toEqual({
      categories: ["cloud", "endpoint"],
      origin: "attack",
    });
  });

  it("reads techniques from tags when the techniques field is absent", () => {
    const h = hunt({ tags: ["powershell", "T1059.001"] });
    expect(huntDataSources(h, index).categories).toEqual(["endpoint"]);
  });

  it("normalises underscore technique IDs", () => {
    const h = hunt({ techniques: ["T1059_001"] });
    expect(huntDataSources(h, index).categories).toEqual(["endpoint"]);
  });

  it("reports none when nothing resolves", () => {
    expect(huntDataSources(hunt({ techniques: ["T9999"] }), index)).toEqual({
      categories: [],
      origin: "none",
    });
  });
});

describe("canRunHunt", () => {
  it("matches when the team holds any one declared category", () => {
    const h = hunt({ data_source_categories: ["endpoint", "cloud", "macos"] });
    expect(canRunHunt(h, new Set(["macos"]), index)).toBe(true);
    expect(canRunHunt(h, new Set(["endpoint", "cloud"]), index)).toBe(true);
    expect(canRunHunt(h, new Set(["email", "network"]), index)).toBe(false);
    expect(canRunHunt(hunt({ data_source_categories: ["appliance"] }), new Set(["appliance"]), index)).toBe(true);
  });

  it("uses only declared categories, not the ATT&CK fallback, when set", () => {
    const h = hunt({ techniques: ["T1578"], data_source_categories: ["email"] });
    expect(canRunHunt(h, new Set(["cloud"]), index)).toBe(false);
  });

  it("accepts any ATT&CK-derived category, since those are alternatives", () => {
    const h = hunt({ techniques: ["T1578"] });
    expect(canRunHunt(h, new Set(["cloud"]), index)).toBe(true);
  });

  it("never matches an empty selection or an unresolvable hunt", () => {
    expect(canRunHunt(hunt({ techniques: ["T1578"] }), new Set(), index)).toBe(
      false,
    );
    expect(
      canRunHunt(hunt({ techniques: ["T9999"] }), new Set(["endpoint"]), index),
    ).toBe(false);
  });
});
