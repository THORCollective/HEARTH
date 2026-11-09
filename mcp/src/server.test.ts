import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { loadData, parseData, type HearthData } from "./data";
import { createServer } from "./server";

const PUBLIC = join(__dirname, "..", "..", "public");
let data: HearthData;
let client: Client;

async function connect(d: HearthData): Promise<Client> {
  const c = new Client({ name: "test", version: "1.0" });
  const [clientEnd, serverEnd] = InMemoryTransport.createLinkedPair();
  await Promise.all([c.connect(clientEnd), createServer(d).connect(serverEnd)]);
  return c;
}

async function call(name: string, args: Record<string, unknown>) {
  const r = await client.callTool({ name, arguments: args });
  return r as {
    isError?: boolean;
    structuredContent?: any;
    content: { type: string; text: string }[];
  };
}

beforeAll(async () => {
  data = loadData(PUBLIC);
  client = await connect(data);
});

describe("data loading", () => {
  it("loads and validates the real hunt snapshot", () => {
    expect(data.hunts.length).toBeGreaterThan(500);
    expect(data.categoryNames.appliance).toBeTruthy();
  });

  it("fails closed on malformed hunts", () => {
    const mapping = { categories: [], metadata: {} };
    expect(() => parseData([{ id: "H001" }], mapping)).toThrow();
    expect(() => parseData([], mapping)).toThrow();
    expect(() => parseData("not an array", mapping)).toThrow();
  });

  it("rejects unknown data source categories", () => {
    const good = data.hunts[0];
    expect(() =>
      parseData([{ ...good, data_source_categories: ["mainframe"] }], {
        categories: [],
        metadata: {},
      }),
    ).toThrow();
  });
});

describe("tools/list", () => {
  it("exposes get_hunt and search_hunts with schemas", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual(["get_hunt", "search_hunts"]);
    for (const t of tools) {
      expect(t.description).toBeTruthy();
      expect(t.inputSchema).toBeTruthy();
      expect(t.outputSchema).toBeTruthy();
      expect(t.annotations?.readOnlyHint).toBe(true);
    }
  });
});

describe("get_hunt", () => {
  it("returns a full hunt with its data sources and source link", async () => {
    const r = await call("get_hunt", { id: "H087" });
    expect(r.isError).toBeFalsy();
    const h = r.structuredContent;
    expect(h.id).toBe("H087");
    expect(h.title).toBeTruthy();
    expect(h.data_sources).toEqual({
      categories: data.byId.get("H087")!.data_source_categories,
      origin: "declared",
    });
    expect(h.url).toBe(
      "https://github.com/THORCollective/HEARTH/blob/main/Flames/H087.md",
    );
    expect(JSON.parse(r.content[0].text).id).toBe("H087");
  });

  it("accepts lowercase ids", async () => {
    const r = await call("get_hunt", { id: "b002" });
    expect(r.structuredContent.id).toBe("B002");
  });

  it("returns a tool error, not a crash, for an unknown id", async () => {
    const r = await call("get_hunt", { id: "H9999" });
    expect(r.isError).toBe(true);
    expect(r.content[0].text).toMatch(/No hunt with id H9999/);
  });

  it("rejects ids that aren't hunt ids", async () => {
    const r = await call("get_hunt", { id: "../../etc/passwd" });
    expect(r.isError).toBe(true);
  });
});

describe("search_hunts", () => {
  it("finds hunts by technique and returns compact summaries", async () => {
    const r = await call("search_hunts", { query: "T1036.005" });
    const { total, hunts } = r.structuredContent;
    expect(total).toBeGreaterThan(0);
    expect(hunts.length).toBeLessThanOrEqual(20);
    for (const h of hunts) {
      expect(Object.keys(h).sort()).toEqual(
        [
          "category",
          "data_sources",
          "id",
          "status",
          "tactic",
          "techniques",
          "title",
          "url",
        ].sort(),
      );
    }
  });

  it("filters by data source with any-of matching", async () => {
    const r = await call("search_hunts", {
      data_sources: ["appliance"],
      limit: 100,
    });
    const expected = data.hunts.filter((h) =>
      h.data_source_categories?.includes("appliance"),
    ).length;
    expect(r.structuredContent.total).toBe(expected);
    for (const h of r.structuredContent.hunts)
      expect(h.data_sources.categories).toContain("appliance");
  });

  it("filters by category and tactic", async () => {
    const r = await call("search_hunts", {
      category: "Alchemy",
      tactic: "Command and Control",
      limit: 100,
    });
    expect(r.structuredContent.total).toBeGreaterThan(0);
    for (const h of r.structuredContent.hunts) {
      expect(h.category).toBe("Alchemy");
      expect(h.tactic).toMatch(/Command and Control/);
    }
  });

  it("caps limit at 100 and validates input", async () => {
    const r = await call("search_hunts", { limit: 500 });
    expect(r.isError).toBe(true);
    const bad = await call("search_hunts", { data_sources: ["mainframe"] });
    expect(bad.isError).toBe(true);
  });

  it("hides retired hunts by default", async () => {
    const retired = {
      ...data.hunts[0],
      id: "H9998",
      status: "retired" as const,
      title: "zzretiredzz",
    };
    const c = await connect({
      ...data,
      hunts: [...data.hunts, retired],
      byId: new Map([...data.byId, ["H9998", retired]]),
    });
    const hidden = (await c.callTool({
      name: "search_hunts",
      arguments: { query: "zzretiredzz" },
    })) as any;
    expect(hidden.structuredContent.total).toBe(0);
    const shown = (await c.callTool({
      name: "search_hunts",
      arguments: { query: "zzretiredzz", include_retired: true },
    })) as any;
    expect(shown.structuredContent.hunts[0].id).toBe("H9998");
  });
});
