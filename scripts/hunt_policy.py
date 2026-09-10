"""Submission-format policy.

Hunts are submitted as ID-less drafts in ``Incoming/`` and get their ID at
merge (see scripts/assign_hunt_ids.py), so that two PRs can never name the same
file and collide.

Phase 1 accepts the older ``Flames/HNNN.md`` form too, warning rather than
failing, because the outside tooling that produces those PRs lives in another
repository and cannot be updated from here. Flip this to ``True`` once that
tooling emits drafts; nothing else needs to change.
"""

from __future__ import annotations

REQUIRE_DRAFT_SUBMISSIONS = False
