#!/usr/bin/env node
/**
 * Fetch the repo's recent public GitHub activity and write public/activity.json,
 * which the home page renders in its "Recent activity" box.
 *
 * Runs at build time (see .github/workflows/static.yml) so visitors never hit
 * the GitHub API directly — the feed ships baked into the deploy. On any
 * failure it writes an empty feed (or leaves none), and the home page falls
 * back to listing the newest hunts by their git creation date.
 *
 * We surface only meaningful community signal: hunts merged, new submissions
 * (issues opened), and new stargazers. Bot pushes, branch churn, and noisy
 * "labeled" events are filtered out.
 */
const fs = require("fs");
const path = require("path");

const REPO = process.env.HEARTH_REPO || "THORCollective/HEARTH";
const OUT = path.join(__dirname, "..", "public", "activity.json");
const MAX_ITEMS = 8;

async function fetchEvents() {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "hearth-activity-feed",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/events?per_page=100`,
    { headers },
  );
  if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText}`);
  return res.json();
}

function truncate(s, n) {
  s = (s || "").trim();
  return s.length > n ? s.slice(0, n) + "…" : s;
}

/** Map a raw GitHub event to a feed item, or null to drop it. */
function mapEvent(ev) {
  const actor = ev.actor && ev.actor.login;
  if (actor && /\[bot\]$/.test(actor)) return null; // skip automation
  const when = ev.created_at;

  switch (ev.type) {
    case "PullRequestEvent": {
      const pr = ev.payload && ev.payload.pull_request;
      if (ev.payload.action !== "closed" || !pr || !pr.merged) return null;
      return { verb: "Merged", title: truncate(pr.title, 64), url: pr.html_url, when };
    }
    case "IssuesEvent": {
      const issue = ev.payload && ev.payload.issue;
      if (ev.payload.action !== "opened" || !issue) return null; // ignore labeled/closed
      // Skip submissions still showing the unfilled issue-template placeholder.
      if ((issue.title || "").includes("[Threat Actor, Malware, or Report Name]"))
        return null;
      return { verb: "Submitted", title: truncate(issue.title, 64), url: issue.html_url, when };
    }
    case "WatchEvent": {
      if (!actor) return null;
      return {
        verb: "New star",
        title: `@${actor}`,
        url: `https://github.com/${actor}`,
        when,
      };
    }
    default:
      return null;
  }
}

async function main() {
  let events = [];
  try {
    const raw = await fetchEvents();
    events = raw
      .map(mapEvent)
      .filter(Boolean)
      .slice(0, MAX_ITEMS);
  } catch (err) {
    console.error(`[activity] fetch failed, writing empty feed: ${err.message}`);
    events = [];
  }

  // generated_at intentionally omitted so identical feeds produce identical
  // files (no spurious churn); the home page derives recency from each event.
  fs.writeFileSync(OUT, JSON.stringify({ events }, null, 2) + "\n");
  console.log(`[activity] wrote ${events.length} events to ${OUT}`);
}

module.exports = { mapEvent };

if (require.main === module) main();
