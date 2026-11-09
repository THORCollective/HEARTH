import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as z from "zod/v4";
import {
  buildActorIndex,
  buildTechniqueTactics,
  type ActorIndex,
  type ActorMentionsData,
} from "../../src/lib/actor-matching";
import {
  buildTechniqueIndex,
  type TechniqueIndex,
} from "../../src/lib/datasources";
import type { Hunt } from "../../src/types/Hunt";
import { cleanDeep } from "./sanitize";

/** Mirrors DATA_SOURCE_CATEGORIES in scripts/hunt_schema.py. */
export const DATA_SOURCE_IDS = [
  "endpoint",
  "windows",
  "network",
  "cloud",
  "identity",
  "email",
  "web_proxy",
  "application",
  "macos",
  "appliance",
] as const;

export const CATEGORIES = ["Flames", "Embers", "Alchemy"] as const;

/** Files the server reads, all from the site's public/ directory. */
export const DATA_FILES = [
  "hunts-data.json",
  "datasource-mapping.json",
  "context-graph-data.json",
  "actor-mentions.json",
  "mitre-matrix.json",
] as const;

const DataSourceId = z.enum(DATA_SOURCE_IDS);

// Validate everything the tools read. Data that doesn't match fails closed:
// the server refuses to start rather than serve something malformed.
const HuntSchema = z.object({
  id: z.string().regex(/^[HBM]\d{3,4}$/),
  category: z.enum(CATEGORIES),
  title: z.string(),
  tactic: z.string(),
  notes: z.string(),
  tags: z.array(z.string()),
  techniques: z.array(z.string()).optional(),
  severity: z.string().nullish(),
  status: z.enum(["current", "stale", "retired"]).optional(),
  related_hunt_ids: z.array(z.string()).optional(),
  required_data_sources: z.array(z.string()).optional(),
  data_source_categories: z.array(DataSourceId).optional(),
  detection_queries: z
    .array(
      z.object({
        platform: z.string(),
        description: z.string().optional(),
        query: z.string(),
      }),
    )
    .optional(),
  false_positive_notes: z.string().optional(),
  submitter: z.object({ name: z.string(), link: z.string() }),
  why: z.string(),
  references: z.string(),
  file_path: z.string(),
  created: z.string().optional(),
});

const MappingSchema = z.object({
  categories: z.array(
    z.object({
      id: DataSourceId,
      name: z.string(),
      description: z.string(),
      icon: z.string(),
      examples: z.string().optional(),
      techniques: z.array(z.string()),
    }),
  ),
  metadata: z.record(z.string(), z.unknown()),
});

// Graph, mentions and matrix carry many fields the tools don't read; only the
// ones used are validated, the rest pass through.
const GraphSchema = z.object({
  nodes: z.array(
    z
      .object({
        id: z.string(),
        type: z.string(),
        label: z.string().optional(),
        aliases: z.array(z.string()).optional(),
        description: z.string().optional(),
        technique_count: z.number().optional(),
        mitre_techniques: z.array(z.string()).optional(),
        external_references: z
          .array(z.object({ source: z.string(), url: z.string() }))
          .optional(),
        tactics: z.array(z.string()).optional(),
      })
      .loose(),
  ),
  edges: z.array(
    z
      .object({ source: z.string(), target: z.string(), type: z.string() })
      .loose(),
  ),
});

const MentionsSchema = z
  .object({ mentions: z.record(z.string(), z.array(z.string())) })
  .loose();

const MatrixSchema = z
  .object({
    tactics: z.array(
      z
        .object({ id: z.string(), shortname: z.string(), name: z.string() })
        .loose(),
    ),
    techniques: z.array(
      z
        .object({
          id: z.string(),
          tactic_shortnames: z.array(z.string()).optional(),
        })
        .loose(),
    ),
  })
  .loose();

export interface HearthData {
  hunts: Hunt[];
  byId: Map<string, Hunt>;
  index: TechniqueIndex;
  categoryNames: Record<string, string>;
  actors: ActorIndex;
  mentions: ActorMentionsData;
}

export interface RawData {
  hunts: unknown;
  mapping: unknown;
  graph?: unknown;
  mentions?: unknown;
  matrix?: unknown;
}

export function parseData(raw: RawData): HearthData {
  // Hunt text is community-written: validate, then clean it before serving.
  const hunts = cleanDeep(z.array(HuntSchema).min(1).parse(raw.hunts)) as Hunt[];
  const mapping = MappingSchema.parse(raw.mapping);
  const graph = GraphSchema.parse(raw.graph ?? { nodes: [], edges: [] });
  const mentions = MentionsSchema.parse(
    raw.mentions ?? { mentions: {} },
  ) as ActorMentionsData;
  const matrix = MatrixSchema.parse(
    raw.matrix ?? { tactics: [], techniques: [] },
  );

  const byId = new Map(hunts.map((h) => [h.id, h]));
  if (byId.size !== hunts.length)
    throw new Error("hunts-data.json has duplicate hunt ids");
  return {
    hunts,
    byId,
    index: buildTechniqueIndex(mapping),
    categoryNames: Object.fromEntries(
      mapping.categories.map((c) => [c.id, c.name]),
    ),
    actors: buildActorIndex(graph, buildTechniqueTactics(matrix)),
    mentions,
  };
}

export function loadData(dir: string): HearthData {
  const read = (name: (typeof DATA_FILES)[number]) =>
    JSON.parse(readFileSync(join(dir, name), "utf8"));
  return parseData({
    hunts: read("hunts-data.json"),
    mapping: read("datasource-mapping.json"),
    graph: read("context-graph-data.json"),
    mentions: read("actor-mentions.json"),
    matrix: read("mitre-matrix.json"),
  });
}
