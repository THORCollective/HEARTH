# Incoming

Drafts waiting for a hunt ID.

A hunt submitted here has **no `id:` field** and a descriptive filename. When
your pull request merges, `scripts/assign_hunt_ids.py` allocates the next free
ID for the category, writes it into the frontmatter, and moves the file into
`Flames/`, `Embers/`, or `Alchemy/`. A bot comment on your PR tells you which
ID you got.

## Why the ID is assigned at merge

If a PR names its own ID, that ID is chosen against whatever `main` looked like
at the time. Two PRs opened the same week both pick `H294`, and whichever
merges second hits a filename conflict and has to be renumbered by hand — which
is exactly what happened to PRs #404 and #405.

Because no PR here names a final ID, two submissions can never claim the same
one. Your ID reflects the order your PR merged.

## Submitting a draft

Add one markdown file named after your hunt — `artifactory-admin-token.md`, not
`H294.md`. It needs full hunt frontmatter **except `id`**:

```markdown
---
category: Flames
title: Artifactory admin token minting without a prior session
hypothesis: >-
  An adversary exploiting CVE-2026-82329 mints administrator-scoped tokens
  with no prior authenticated session from the requesting source.
tactics:
  - Initial Access
tags:
  - artifactory
  - supplychain
submitter:
  name: Your Name
  link: https://example.com/you
---

# Artifactory admin token minting without a prior session

## Why

- Why this is worth hunting.

## References

- https://example.com/report
```

`title` is optional, but worth setting: assignment rewrites the body heading to
`# <your-id>`, so a name that lives only in an H1 is lost. In frontmatter it
survives and is what the hunt is listed under.

Pick a filename distinctive enough that two open PRs won't collide on it — if
they do, the second gets an ordinary git conflict. Adding a `-YYYY-MM` suffix
helps.

## Checks

Your PR runs `parse_draft_file` over everything here, so a missing or unknown
`category`, absent frontmatter, or an `HNNN.md`-style filename fails before
merge rather than after.
