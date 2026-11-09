import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as z from "zod/v4";
import {
  buildTechniqueIndex,
  type TechniqueIndex,
} from "../../src/lib/datasources";
import type { Hunt } from "../../src/types/Hunt";

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

export interface HearthData {
  hunts: Hunt[];
  byId: Map<string, Hunt>;
  index: TechniqueIndex;
  categoryNames: Record<string, string>;
}

export function parseData(
  huntsJson: unknown,
  mappingJson: unknown,
): HearthData {
  const hunts = z.array(HuntSchema).min(1).parse(huntsJson) as Hunt[];
  const mapping = MappingSchema.parse(mappingJson);
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
  };
}

export function loadData(dir: string): HearthData {
  const read = (name: string) =>
    JSON.parse(readFileSync(join(dir, name), "utf8"));
  return parseData(read("hunts-data.json"), read("datasource-mapping.json"));
}
