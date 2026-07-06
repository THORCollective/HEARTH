export interface MitreTactic {
  id: string;
  shortname: string;
  name: string;
}

export interface MitreTechnique {
  id: string;
  name: string;
  parent: string | null;
  tactic_shortnames: string[];
  description: string;
  url: string;
  is_subtechnique: boolean;
  /** ATT&CK platform list (e.g. ["Windows", "macOS"]); may be empty. */
  platforms?: string[];
}

/** Retired technique ID → replacement, from the matrix's `deprecated` map. */
export interface MitreDeprecatedEntry {
  name: string;
  revoked: boolean;
  revoked_by: string | null;
}

export interface MitreMatrix {
  tactics: MitreTactic[];
  techniques: MitreTechnique[];
  deprecated?: Record<string, MitreDeprecatedEntry>;
}
