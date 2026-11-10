import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { loadData } from "./data";
import { SUBMIT_URL, createServer } from "./server";

// When HEARTH has nothing, the answer points at where to add a hunt: gaps
// become contributions, with no telemetry involved.

let client: Client;

async function call(name: string, args: Record<string, unknown>) {
  return (await client.callTool({ name, arguments: args })) as {
    isError?: boolean;
    structuredContent?: any;
    content: { type: string; text: string }[];
  };
}

beforeAll(async () => {
  client = new Client({ name: "test", version: "1.0" });
  const [clientEnd, serverEnd] = InMemoryTransport.createLinkedPair();
  const data = loadData(join(__dirname, "..", "..", "public"));
  await Promise.all([
    client.connect(clientEnd),
    createServer(data).connect(serverEnd),
  ]);
});

describe("submit link", () => {
  it("is the site's submit page", () => {
    expect(SUBMIT_URL).toBe("https://hearth.thorcollective.com/submit.html");
  });

  it("search_hunts offers it when nothing matches", async () => {
    const r = await call("search_hunts", { query: "zzznohuntmatcheszzz" });
    expect(r.structuredContent.total).toBe(0);
    expect(r.structuredContent.submit_hunt).toContain(SUBMIT_URL);
    expect(r.content[0].text).toContain(SUBMIT_URL);
  });

  it("search_hunts leaves it out when hunts match", async () => {
    const r = await call("search_hunts", { query: "kerberoasting" });
    expect(r.structuredContent.total).toBeGreaterThan(0);
    expect(r.structuredContent.submit_hunt).toBeUndefined();
  });

  it("hunts_for_datasources offers it when nothing matches", async () => {
    const r = await call("hunts_for_datasources", {
      data_sources: ["email"],
      tactic: "zzz-no-such-tactic",
    });
    expect(r.structuredContent.total).toBe(0);
    expect(r.structuredContent.submit_hunt).toContain(SUBMIT_URL);
  });

  it("hunts_for_datasources leaves it out when hunts match", async () => {
    const r = await call("hunts_for_datasources", {
      data_sources: ["endpoint"],
    });
    expect(r.structuredContent.total).toBeGreaterThan(0);
    expect(r.structuredContent.submit_hunt).toBeUndefined();
  });

  it("hunts_for_actor offers it when the actor has uncovered techniques", async () => {
    const r = await call("hunts_for_actor", { actor: "APT29" });
    expect(r.structuredContent.gaps.length).toBeGreaterThan(0);
    expect(r.structuredContent.submit_hunt).toContain(SUBMIT_URL);
    for (const g of r.structuredContent.gaps) {
      expect(g.submit_url).toBe(`${SUBMIT_URL}?technique=${encodeURIComponent(g.technique)}`);
    }
  });
});
