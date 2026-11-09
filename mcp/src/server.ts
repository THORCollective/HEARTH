import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { huntDataSources } from "../../src/lib/datasources";
import { MAX_LIMIT, searchHunts } from "../../src/lib/hunt-search";
import type { Hunt } from "../../src/types/Hunt";
import { CATEGORIES, DATA_SOURCE_IDS, type HearthData } from "./data";

export const VERSION = "0.0.0";
const REPO_URL = "https://github.com/THORCollective/HEARTH/blob/main/";

const DataSources = z.object({
  categories: z.array(z.enum(DATA_SOURCE_IDS)),
  origin: z
    .enum(["declared", "attack", "none"])
    .describe(
      "declared: the hunt's own labels; attack: derived from its ATT&CK techniques",
    ),
});

const HuntSummary = z.object({
  id: z.string(),
  category: z.enum(CATEGORIES),
  title: z.string(),
  tactic: z.string(),
  techniques: z.array(z.string()),
  data_sources: DataSources,
  status: z.string(),
  url: z.string(),
});

const HuntDetail = HuntSummary.extend({
  why: z.string(),
  notes: z.string(),
  references: z.string(),
  tags: z.array(z.string()),
  severity: z.string().optional(),
  required_data_sources: z.array(z.string()).optional(),
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
  related_hunt_ids: z.array(z.string()).optional(),
  submitter: z.string(),
  created: z.string().optional(),
});

function summary(h: Hunt, d: HearthData): z.infer<typeof HuntSummary> {
  return {
    id: h.id,
    category: h.category,
    title: h.title,
    tactic: h.tactic,
    techniques: h.techniques ?? [],
    data_sources: huntDataSources(h, d.index),
    status: h.status ?? "current",
    url: REPO_URL + h.file_path,
  };
}

function detail(h: Hunt, d: HearthData): z.infer<typeof HuntDetail> {
  return {
    ...summary(h, d),
    why: h.why,
    notes: h.notes,
    references: h.references,
    tags: h.tags,
    severity: h.severity ?? undefined,
    required_data_sources: h.required_data_sources,
    detection_queries: h.detection_queries,
    false_positive_notes: h.false_positive_notes,
    related_hunt_ids: h.related_hunt_ids,
    submitter: h.submitter.name,
    created: h.created,
  };
}

function result<T extends Record<string, unknown>>(output: T) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(output) }],
    structuredContent: output,
  };
}

export function createServer(data: HearthData): McpServer {
  const server = new McpServer({ name: "hearth", version: VERSION });

  server.registerTool(
    "get_hunt",
    {
      title: "Get HEARTH hunt",
      description:
        "Get one HEARTH threat hunting hypothesis by id (e.g. H087, B002, M024): hypothesis, " +
        "why it matters, ATT&CK techniques, data sources needed, notes and references.",
      inputSchema: z.object({
        id: z
          .string()
          .regex(/^[HhBbMm]\d{3,4}$/, "Hunt ids look like H087, B002 or M024")
          .describe(
            "Hunt id: H (Flames), B (Embers) or M (Alchemy) followed by digits",
          ),
      }),
      outputSchema: HuntDetail,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ id }) => {
      const hunt = data.byId.get(id.toUpperCase());
      if (!hunt) {
        return {
          content: [
            { type: "text", text: `No hunt with id ${id.toUpperCase()}.` },
          ],
          isError: true,
        };
      }
      return result(detail(hunt, data));
    },
  );

  server.registerTool(
    "search_hunts",
    {
      title: "Search HEARTH hunts",
      description:
        "Search HEARTH threat hunting hypotheses by keyword, ATT&CK technique, tactic, category " +
        "or the data sources you have. Every query word must match. Returns compact summaries; " +
        "use get_hunt for full details.",
      inputSchema: z.object({
        query: z
          .string()
          .max(200)
          .optional()
          .describe(
            'Keywords or technique ids, e.g. "kerberoasting" or "T1543"',
          ),
        category: z
          .enum(CATEGORIES)
          .optional()
          .describe(
            "Flames: hypothesis-driven, Embers: baselining, Alchemy: model-assisted",
          ),
        tactic: z
          .string()
          .max(60)
          .optional()
          .describe('ATT&CK tactic name, e.g. "Persistence"'),
        data_sources: z
          .array(z.enum(DATA_SOURCE_IDS))
          .max(DATA_SOURCE_IDS.length)
          .optional()
          .describe(
            "Only hunts runnable with ANY of these data source categories",
          ),
        include_retired: z
          .boolean()
          .optional()
          .describe("Include retired hunts (hidden by default)"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(MAX_LIMIT)
          .optional()
          .describe("Max results (default 20)"),
      }),
      outputSchema: z.object({
        total: z.number().int(),
        hunts: z.array(HuntSummary),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => {
      const { total, hunts } = searchHunts(
        data.hunts,
        {
          query: args.query,
          category: args.category,
          tactic: args.tactic,
          dataSources: args.data_sources,
          includeRetired: args.include_retired,
          limit: args.limit,
        },
        data.index,
      );
      return result({ total, hunts: hunts.map((h) => summary(h, data)) });
    },
  );

  return server;
}
