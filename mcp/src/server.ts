import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import {
  computeCoverage,
  computeGap,
  matchHuntsForActor,
  resolveActor,
} from "../../src/lib/actor-matching";
import { canRunHunt, huntDataSources } from "../../src/lib/datasources";
import { DEFAULT_LIMIT, MAX_LIMIT, filterHunts, searchHunts } from "../../src/lib/hunt-search";
import type { DataSourceCategoryId, Hunt } from "../../src/types/Hunt";
import { CATEGORIES, DATA_SOURCE_IDS, type HearthData } from "./data";

export const VERSION = "0.0.0";
const REPO_URL = "https://github.com/THORCollective/HEARTH/blob/main/";
const MAX_GAPS = 25;

const DataSourceList = z
  .array(z.enum(DATA_SOURCE_IDS))
  .min(1)
  .max(DATA_SOURCE_IDS.length)
  .describe(
    "Data source categories you have: endpoint (EDR/Sysmon), windows (Windows event logs), " +
      "network (firewall/flow/DNS/IDS), cloud (cloud & M365/Workspace audit), identity " +
      "(AD/IdP/auth), email, web_proxy, application (SaaS/CI/web server), macos, appliance " +
      "(network appliance & hypervisor logs)",
  );

const Limit = z.number().int().min(1).max(MAX_LIMIT).optional().describe("Max hunts returned (default 20)");

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

/** Numeric part of a hunt id, for newest-first ordering. */
function idNumber(id: string): number {
  return parseInt(id.replace(/\D/g, ""), 10) || 0;
}

/** "actor:G0016" -> "G0016" */
function groupId(actorId: string): string {
  return actorId.replace(/^actor:/, "");
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

  server.registerTool(
    "hunts_for_actor",
    {
      title: "HEARTH hunts for a threat actor",
      description:
        "Find HEARTH hunts relevant to a threat actor (name, alias or ATT&CK group id such as " +
        "APT29, Cozy Bear or G0016). A hunt matches when it shares ATT&CK techniques with the " +
        "actor or names the actor in its text. Also returns how much of the actor's known " +
        "technique profile HEARTH covers and the biggest uncovered techniques.",
      inputSchema: z.object({
        actor: z.string().min(2).max(100).describe("Actor name, alias or ATT&CK group id"),
        data_sources: DataSourceList.optional().describe(
          "Only hunts runnable with ANY of these data source categories",
        ),
        include_retired: z.boolean().optional(),
        limit: Limit,
      }),
      outputSchema: z.object({
        actor: z.object({
          id: z.string(),
          name: z.string(),
          aliases: z.array(z.string()),
          url: z.string().optional(),
        }),
        other_matches: z
          .array(z.object({ id: z.string(), name: z.string() }))
          .describe("Other actors the name could refer to; call again with one of these ids"),
        coverage: z.object({
          actor_techniques: z.number().int(),
          techniques_covered: z.number().int(),
          coverage_percent: z.number().int(),
          gap_techniques: z.number().int(),
        }),
        total_hunts: z.number().int(),
        hunts: z.array(
          HuntSummary.extend({
            reasons: z.array(z.enum(["technique", "mention"])),
            shared_techniques: z.array(z.string()),
          }),
        ),
        gaps: z
          .array(z.object({ technique: z.string(), tactic: z.string() }))
          .describe(`Actor techniques no HEARTH hunt covers (first ${MAX_GAPS})`),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => {
      const [best, ...rest] = resolveActor(args.actor, data.actors, 6);
      if (!best) {
        return {
          content: [{ type: "text", text: `No threat actor matches "${args.actor}".` }],
          isError: true,
        };
      }
      const actor = best.actor;
      const visible = data.hunts.filter((h) => args.include_retired || h.status !== "retired");
      // Coverage describes all of HEARTH; the data source filter only narrows the hunt list.
      const allMatches = matchHuntsForActor(actor.id, visible, data.mentions, data.actors);
      const coverage = computeCoverage(actor.id, allMatches, data.actors);
      const sources = args.data_sources ? new Set<DataSourceCategoryId>(args.data_sources) : null;
      // Hunts that name the actor first (written about this actor), then by
      // shared techniques. The site's Actors page orders these differently.
      const matches = (
        sources ? allMatches.filter((m) => canRunHunt(m.hunt, sources, data.index)) : allMatches
      )
        .slice()
        .sort(
          (a, b) =>
            Number(b.reasons.includes("MENTION")) - Number(a.reasons.includes("MENTION")) ||
            b.sharedTechniques.length - a.sharedTechniques.length,
        );
      const url = actor.external_references?.find((r) => r.source === "mitre-attack")?.url;
      return result({
        actor: { id: groupId(actor.id), name: actor.label, aliases: actor.aliases, url },
        other_matches: rest.map((r) => ({ id: groupId(r.actor.id), name: r.actor.label })),
        coverage: {
          actor_techniques: coverage.actorTechniqueCount,
          techniques_covered: coverage.techniquesCovered,
          coverage_percent: coverage.coveragePercent,
          gap_techniques: coverage.gapTechniqueCount,
        },
        total_hunts: matches.length,
        hunts: matches.slice(0, args.limit ?? DEFAULT_LIMIT).map((m) => ({
          ...summary(m.hunt, data),
          reasons: m.reasons.map((r) => (r === "TECH" ? ("technique" as const) : ("mention" as const))),
          shared_techniques: m.sharedTechniques,
        })),
        gaps: computeGap(actor.id, allMatches, data.actors)
          .slice(0, MAX_GAPS)
          .map((g) => ({ technique: g.id, tactic: g.tactic })),
      });
    },
  );

  server.registerTool(
    "hunts_for_datasources",
    {
      title: "HEARTH hunts runnable with your data sources",
      description:
        "Find HEARTH hunts a team can run with the data sources it has. A hunt is included when " +
        "you hold ANY of its data source categories; hunts you hold ALL categories for are ranked " +
        "first, and each result lists the categories you're missing.",
      inputSchema: z.object({
        data_sources: DataSourceList,
        category: z.enum(CATEGORIES).optional(),
        tactic: z.string().max(60).optional().describe('ATT&CK tactic name, e.g. "Persistence"'),
        include_retired: z.boolean().optional(),
        limit: Limit,
      }),
      outputSchema: z.object({
        total: z.number().int(),
        full_matches: z.number().int().describe("Hunts whose every data source you have"),
        by_category: z.record(z.string(), z.number().int()).describe("Total split by Flames/Embers/Alchemy"),
        hunts: z.array(
          HuntSummary.extend({
            have_all_sources: z.boolean(),
            missing_sources: z.array(z.enum(DATA_SOURCE_IDS)),
          }),
        ),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => {
      const have = new Set<DataSourceCategoryId>(args.data_sources);
      // Newest first, then the stable sort below puts fewer missing sources first.
      const hunts = filterHunts(
        data.hunts,
        {
          category: args.category,
          tactic: args.tactic,
          dataSources: args.data_sources,
          includeRetired: args.include_retired,
        },
        data.index,
      ).sort((a, b) => idNumber(b.id) - idNumber(a.id));
      const rows = hunts.map((h) => {
        const s = summary(h, data);
        const missing = s.data_sources.categories.filter((c) => !have.has(c));
        return { ...s, have_all_sources: missing.length === 0, missing_sources: missing };
      });
      rows.sort((a, b) => a.missing_sources.length - b.missing_sources.length);
      const byCategory: Record<string, number> = {};
      for (const r of rows) byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
      return result({
        total: rows.length,
        full_matches: rows.filter((r) => r.have_all_sources).length,
        by_category: byCategory,
        hunts: rows.slice(0, args.limit ?? DEFAULT_LIMIT),
      });
    },
  );

  return server;
}
