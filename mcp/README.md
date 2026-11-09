# HEARTH MCP server

Ask your AI assistant what to hunt for. This [MCP](https://modelcontextprotocol.io) server gives Claude, Cursor, VS Code and other MCP clients read-only access to [HEARTH](https://hearth.thorcollective.com), the community library of threat hunting hypotheses.

Questions you can ask:

- "What can I hunt for Volt Typhoon with firewall and appliance logs?"
- "Find hunts for macOS persistence."
- "We only have Windows endpoint and identity logs. Which hunts can we run fully?"
- "Show me H432."

## Tools

| Tool                    | What it does                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `search_hunts`          | Ranked keyword search, with filters for category, tactic and data sources.              |
| `get_hunt`              | One hunt in full: hypothesis, why it matters, notes, queries and references.            |
| `hunts_for_actor`       | Hunts for a threat actor by name, alias or ATT&CK group ID. Includes coverage and gaps. |
| `hunts_for_datasources` | Hunts your team can run with the log sources it has, and what each one is missing.      |

Every tool is read-only. Retired hunts are hidden unless you ask for them.

## Install

You need Node.js 20 or later. Each snippet runs the published package with `npx`.

### Claude Code

```sh
claude mcp add hearth -- npx -y @thorcollective/hearth-mcp
```

### Claude Desktop

Add this to `claude_desktop_config.json` (**Settings → Developer → Edit Config**), then restart Claude Desktop:

```json
{
  "mcpServers": {
    "hearth": {
      "command": "npx",
      "args": ["-y", "@thorcollective/hearth-mcp"]
    }
  }
}
```

### Cursor

Add this to `.cursor/mcp.json` in your project, or to `~/.cursor/mcp.json` for every project:

```json
{
  "mcpServers": {
    "hearth": {
      "command": "npx",
      "args": ["-y", "@thorcollective/hearth-mcp"]
    }
  }
}
```

### VS Code

Add this to `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "hearth": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@thorcollective/hearth-mcp"]
    }
  }
}
```

### Settings

| Environment variable | Effect |
|---|---|
| `HEARTH_OFFLINE=1` | Never touch the network; serve the bundled snapshot or the last download. |
| `HEARTH_DATA_URL` | Fetch data from a mirror instead of `https://hearth.thorcollective.com/`. Must be https (http only for localhost). |
| `HEARTH_CACHE_DIR` | Where downloaded data is kept. Defaults to your platform's cache folder (`~/Library/Caches/hearth-mcp` on macOS). |

Set them in your client's config, for example `"env": { "HEARTH_OFFLINE": "1" }` next to `"args"`.

### Other clients

Any MCP client that supports stdio servers can run the same command: `npx -y @thorcollective/hearth-mcp`.

## Privacy and security

- **No telemetry.** The server sends nothing anywhere.
- **One small network check a day.** At most once every 24 hours the server asks hearth.thorcollective.com whether the hunt data has changed. It uses conditional requests, so usually nothing is downloaded. It sends only those requests and a `hearth-mcp/<version>` user agent.
- **Works offline.** If the site can't be reached, or sends data that fails validation, the server keeps using its last good copy, falling back to the snapshot bundled with each release.
- **Hunt text is treated as untrusted.** Hunts are written by the community:
  - The server makes hidden and right-to-left characters visible, and removes hidden text.
  - It caps field lengths.
  - It labels every hunt text field as untrusted, so your assistant reads it as data, not instructions.
  - New hunts are also checked for prompt-injection text in CI before they merge.
- **Review detection queries before you run them**, as you would any query from the internet.
- **Verify the package:** releases are published from GitHub Actions with [npm provenance](https://docs.npmjs.com/generating-provenance-statements). Run `npm audit signatures` after installing to check it.

## Develop

From the repository root:

```sh
npm ci && npm ci --prefix mcp
npm run build --prefix mcp      # bundle to mcp/dist and snapshot site data to mcp/data
npm test                        # unit, golden and stdio protocol tests
claude mcp add hearth-dev -- node "$PWD/mcp/dist/index.js"
```

The server reuses the site's own logic from `src/lib`, so search behaves the same way in both.

### Golden queries

`mcp/golden/` holds real analyst questions and the hunts a good answer must include. Adding one is the most useful way to improve search. See [`golden/README.md`](golden/README.md).

## Releasing

Maintainers only:

1. Bump `version` in `mcp/package.json` and `mcp/server.json`. A test fails if they differ.
2. Merge to `main`.
3. Push a tag named `mcp-v<version>`, for example `mcp-v0.1.0`.

The [publish workflow](../.github/workflows/publish-mcp.yml) then:

1. Waits for approval in the `npm-publish` environment.
2. Publishes to npm with provenance, using trusted publishing (no npm token is stored).
3. Lists the release in the [MCP Registry](https://registry.modelcontextprotocol.io) as `io.github.THORCollective/hearth`.
