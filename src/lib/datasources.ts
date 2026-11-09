import type { DataSourceCategoryId, Hunt } from "../types/Hunt";

/** Shape of public/datasource-mapping.json (built by scripts/build_datasource_map.py). */
export interface DataSourceCategory {
  id: DataSourceCategoryId;
  name: string;
  description: string;
  icon: string;
  examples?: string;
  techniques: string[];
}

export interface DatasourceMapping {
  categories: DataSourceCategory[];
  metadata: Record<string, unknown>;
}

/** Technique ID -> category IDs that could observe it (ATT&CK-derived). */
export type TechniqueIndex = Map<string, Set<DataSourceCategoryId>>;

export interface HuntDataSources {
  /** Categories whose logs are useful for this hunt; any one is enough. */
  categories: DataSourceCategoryId[];
  /** `declared`: the hunt's own frontmatter.
   *  `attack`: derived from its techniques.
   *  `none`: nothing resolved. */
  origin: "declared" | "attack" | "none";
}

const TECHNIQUE_RE = /^T\d{4}([._]\d{3})?$/;

function normaliseTechnique(id: string): string {
  return id.replace("_", ".");
}

export function buildTechniqueIndex(
  mapping: DatasourceMapping,
): TechniqueIndex {
  const index: TechniqueIndex = new Map();
  for (const cat of mapping.categories) {
    for (const raw of cat.techniques) {
      const t = normaliseTechnique(raw);
      if (!index.has(t)) index.set(t, new Set());
      index.get(t)!.add(cat.id);
    }
  }
  return index;
}

function huntTechniques(hunt: Hunt): string[] {
  const ids = hunt.techniques?.length
    ? hunt.techniques
    : hunt.tags.filter((t) => TECHNIQUE_RE.test(t));
  return ids.map(normaliseTechnique);
}

export function huntDataSources(
  hunt: Hunt,
  index: TechniqueIndex,
): HuntDataSources {
  if (hunt.data_source_categories?.length) {
    return { categories: [...hunt.data_source_categories], origin: "declared" };
  }
  const found = new Set<DataSourceCategoryId>();
  for (const t of huntTechniques(hunt)) {
    index.get(t)?.forEach((c) => found.add(c));
  }
  if (found.size === 0) return { categories: [], origin: "none" };
  return { categories: [...found].sort(), origin: "attack" };
}

/** Can a team holding `available` category IDs run this hunt? */
export function canRunHunt(
  hunt: Hunt,
  available: ReadonlySet<DataSourceCategoryId>,
  index: TechniqueIndex,
): boolean {
  return huntDataSources(hunt, index).categories.some((c) => available.has(c));
}
