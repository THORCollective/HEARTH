# Review Process

How a submission becomes a merged hunt, and what maintainers check along the way.

Contributors should start with [CONTRIBUTING.md](CONTRIBUTING.md) — this document is written for the people doing the reviewing.

## The pipeline

Every submission arrives as a GitHub issue and moves forward when a maintainer applies a label. Nothing merges on automation alone.

| Stage           | Trigger                  | What happens                                                                                      |
| :-------------- | :----------------------- | :------------------------------------------------------------------------------------------------ |
| Submission      | Issue opened             | `issue-labeler.yaml` labels by hunt type                                                          |
| Drafting        | `intel-submission` label | `issue-generate-hunts.yml` drafts a hunt from the CTI and comments on the issue                   |
| Manual drafting | `submission` label       | `process-hunt-submission.yml` drafts from the submitted form                                      |
| Re-roll         | `regenerate` label       | Re-drafts with reviewer feedback. Capped at 5 attempts                                            |
| Approval        | `approved` label         | `pr-from-approval.yml` opens a PR, assigns the hunt ID, labels it `needs-review` + `automated-pr` |
| Merge           | Maintainer merges        | Site data, database, and leaderboard rebuild automatically                                        |

The `approved` label is the decision point. Applying it is what creates the pull request, so treat it as "this hunt is worth publishing," not "this looks roughly right."

## Automated checks

These run without you. Read them, but don't re-do them by hand.

**On every pull request** — `validate-hunt-schema.yml`, deliberately unfiltered by path so it can be a required status check:

- Hunt ID collision check against `main`
- Frontmatter schema validation on every hunt file
- `pytest scripts/tests/ -v`

**Also on every PR** — `ci.yml`: Node build, type-check, vitest, and a flake8 pass over the Python scripts limited to syntax errors and undefined names.

**After a merge** — `recheck-open-prs.yml` replays the collision check across all open PRs, since a newly landed hunt can retroactively collide with a PR that was green an hour ago. If an open PR goes red without anyone touching it, this is why: the fix is `reassign_hunt_id.py`, which the approval workflow runs automatically.

**Before merge** — AI duplicate detection compares the hypothesis against the SQLite index and flags likely overlaps. It is advisory. A flagged hunt can still be right, and an unflagged one can still be a duplicate.

## What to review

Automation covers format. You are reviewing substance.

**Every hunt:**

- **Is the hypothesis testable?** It should name a behavior someone could actually go looking for in data. "Adversaries may use living-off-the-land binaries" is a topic, not a hypothesis.
- **Is it one technique?** Hunts targeting three techniques at once should be split.
- **Are the sources real and cited?** Follow the reference link. AI-drafted hunts occasionally cite a report that does not say what the hunt claims it says.
- **Do the ATT&CK mappings match the described behavior?** Technique IDs are validated for existence, not for correctness.
- **Is it a genuine duplicate?** Check what duplicate detection flagged. Overlapping is fine; restating an existing hunt is not.

**By category:**

- **🔥 Flames** — needs a falsifiable claim about adversary behavior, and enough specificity that a hunter knows where to start looking.
- **🪵 Embers** — needs a clear baselining target and a reason that baseline is worth having. "What does normal look like for X, and why does X matter?"
- **🔮 Alchemy** — needs the analytic approach stated plainly, and honesty about what it takes to run. A clustering method with no note about tuning or false positives is incomplete.

## Feedback

Prefer re-rolling over rewriting. For AI-drafted hunts, leave a comment saying what is wrong and apply `regenerate` — the drafting workflow feeds your comment back in. Five attempts are allowed; if a hunt is still wrong after two or three, the problem is usually the source CTI rather than the drafting, and the issue should be closed with an explanation.

For human-written submissions, review as you would any PR: specific, actionable comments on what would make the hunt mergeable.

Closing a submission is a normal outcome. Thin CTI, an untestable premise, or near-total overlap with an existing hunt are all fair reasons. Say which one applies.

## Timeline

HEARTH is maintained by volunteers and there is no formal SLA. Automated drafting responds within minutes; human review depends on maintainer availability. If a submission has gone quiet for more than a couple of weeks, a comment on the issue is welcome and not considered nagging.
