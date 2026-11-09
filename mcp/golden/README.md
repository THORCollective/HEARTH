# Golden queries

These are real questions a threat hunter would ask, each with the hunts a good answer must include. CI runs them on every pull request, so search changes can't quietly make answers worse.

Anyone can add one. If HEARTH gave you a poor answer, a golden query is the most useful bug report you can send.

## `search.json`: questions for `search_hunts`

```json
{
  "name": "macOS persistence",
  "args": { "query": "macOS persistence" },
  "expect_ids": ["B067", "H030", "H131"],
  "source": "title matches /launch ?agent|launchd|launch ?daemon/i"
}
```

- **`name`**: a short label shown when the test fails.
- **`args`**: the `search_hunts` arguments. Write `query` exactly as an analyst would type it.
- **`expect_ids`**: the hunts that must appear. A query passes when at least 80% of them are in the top 20 results. To use a different share, set `min_recall`.
- **`source`**: how you chose `expect_ids`. Pick the hunts **without looking at the search results**, for example by matching titles, techniques or tags. A golden query copied from the search output only proves that search agrees with itself.

## `tools.json`: questions for the other tools

`hunts_for_actor` entries name the actor to resolve and the hunts that must come first. `hunts_for_datasources` entries give the expected counts. Copy an existing entry as a starting point, and include a `source` saying where the expectation came from.

## Run them

```sh
npx vitest run mcp/src/golden
```
