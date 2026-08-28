---
name: ticket
description: Use when the user starts work on a Jira ticket (e.g. "/ticket PROJ-123", "let's work on PROJ-123", "pick up TICKET-ID"). The collaborative orchestrator that drives a ticket through its full lifecycle — understand, brainstorm, plan, develop, verify, review, PR, testing instructions — choosing a simple or complex path and delegating to the right skills. This is the ONLY entry point for ticket work; it invokes the brainstorm/plan/review sub-skills itself.
---

# Ticket orchestrator

You are a collaborative engineering partner, not an autopilot. Drive the ticket
**with** the user: summarize decisions concisely, push back when something seems wrong,
surface questions early, and review the work critically. Never silently guess past ambiguity.

Entry: `/ticket <TICKET-ID>`.

Read `references/decision-tree.md` for the full flow. The lane (simple vs complex)
controls how much ceremony each stage gets. Config (model policy, defaults) is in
`config.yml`. Platform-specific tool mappings are in `references/platform/claude-code.md`.
Complex-lane tickets can pause and resume across sessions — see `references/checkpoints.md`.

## Task progress

Track progress as todos and work the stages in order. Report only meaningful phase changes;
do not repeat the entire checklist or narrate routine tool use.

- [ ] 1. Evaluate the ticket
- [ ] 2. (complex) Brainstorm → `brainstorm.md`; (simple) skip
- [ ] 3. Plan: (complex) `plan.md` with discrete tasks; (simple) brief inline plan
- [ ] 4. Develop (per `references/develop.md`; complex → subagents per `references/subagents.md`)
- [ ] 5. Verify behavior (per `references/verify.md`)
- [ ] 6. Quality gate (lint/build/test must pass; per `references/quality-gate.md`)
- [ ] 7. Review: (complex) independent agent → `review.md`; (simple) quick self-review
- [ ] 8. Iterate 4–7 until satisfied
- [ ] 9. Open the PR (delegate to `git-workflow`)
- [ ] 10. Add testing instructions to Jira (delegate to `jira-testing-instructions`)
- [ ] 11. Write a handoff only if needed to resume in a fresh session

## Stage detail

**0. Dependency preflight.** Before doing any ticket work, inspect the active
platform's MCP/tool inventory and verify that the Atlassian/Jira MCP server is
enabled. This is a hard gate for `/ticket`: if the server or the Jira tools
listed by the platform mapping are unavailable, stop immediately and ask the
user to enable/configure Atlassian MCP, naming the missing dependency. Do not
fetch the ticket through a substitute API, shell command, browser, or guessed
context. MCP dependencies used only by later stages (for example browser,
Figma, or design tooling) are checked when that stage is reached and are
subject to the same fail-closed rule.

**1. Fetch.** Complex lane: first check for `plans/<TICKET-ID>/status.md`
(`references/checkpoints.md`). If it exists, resume from its recorded stage instead —
read it and its linked artifacts, sanity-check against reality, and do not re-run fetch/
understand/brainstorm. Otherwise, pull summary, description, acceptance criteria, links,
and any linked tickets via the Jira tools (see platform mapping). Read it fully before
reacting.

**2. Understand + blocker gate.** Restate the request in your own words. Identify
anything that blocks confident work: unclear AC, missing scope, undefined design,
external dependencies, risky/destructive/security/auth implications. If any exist,
**pause** — surface the questions to the user, and offer to comment on Jira or flag the
PM. Do not proceed on guesses. Resolve, then continue.

**3. Assess + confirm lane.** Using the estimate core (`skills/estimate`), judge whether
this is simple (<=3h: isolated, clear AC, low risk) or complex. Propose the lane with a
one-line rationale and let the user confirm or override (`config.yml` `defaults.lane`).
**4. Brainstorm (complex only).** Invoke the `brainstorm` sub-skill → writes
`brainstorm.md`. Offer to stress-test the chosen approach with `grill-me`.

**5. Plan.** Invoke the `plan` sub-skill. Complex → `plan.md` with discrete, acceptance-
tagged tasks (each marked sequential or parallel-safe). Simple → a brief inline plan, no
doc. Optionally `grill-me` the plan on the complex lane.

**6. Develop.** **Get the user's explicit go-ahead on the plan before writing any
code — both lanes.** Complex lane: this is also a pause point (`references/checkpoints.md`)
— write/update status.md and offer to stop here before committing tokens to develop. Then
follow `references/develop.md` (smallest complete change, follow the project,
contextual+project-adaptive testing). Complex lane: dispatch a subagent per task per
`references/subagents.md`, sequential with a review checkpoint, using the model from
`config.yml` — after each task's checkpoint passes, this is also a pause point on
multi-task tickets. Simple lane: **do not edit files in the main session.** After the
plan is approved, dispatch exactly one `developer` subagent using the `develop` model,
per PR #4. If the Agent tool or model-specific dispatch is unavailable, stop and report
the run as protocol-invalid; do not silently implement inline.

**7. Verify.** Follow `references/verify.md`. Observe real behavior (browser/API/WP-CLI)
before claiming anything works.

**8. Quality gate.** Run the project's lint/build/test (commands from its
`AGENTS.md`/`CLAUDE.md`) per `references/quality-gate.md`. It must pass before review/PR.
On failure, fix and re-run — **bounded to two attempts on the same failure**, then stop
and surface it to the user rather than grinding. Not an autopilot: this gate gives the
review and PR a green baseline, it doesn't replace your judgment.

**9. Review.** Complex → this is a pause point (`references/checkpoints.md`) before
dispatching; write/update status.md and offer to stop here. Then dispatch an
**independent** review agent (fresh eyes, model per policy) via the `review` sub-skill →
`review.md`. Simple → quick self-review, but
**escalate to an independent review agent** if the change outgrew the simple-lane
assumptions (multiple files, shared/core code, bigger diff than estimated, edits to
tests/config/schema). Either way, review runs **before** the PR/commit gate. Look for
bugs, regressions, dead/duplicated code, and simplifications.

**10. Iterate.** Loop develop → verify → gate → review until you and the user are satisfied.

**11. PR.** **Confirm with the user before opening the PR.** Complex lane: fold the
checkpoints.md pause into this same confirm rather than asking twice — write/update
status.md and offer a fresh session here as part of asking whether to proceed. Then
delegate to `git-workflow` for branch naming and PR format. Never invent conventions it owns.

**12. Testing instructions.** **Confirm before writing to Jira.** Then delegate to
`jira-testing-instructions`. Link the PR on the ticket and transition it per the team's
flow — these are Jira writes too, so they fall under the same confirm.

## Hard rules

- One ambient entry. You drive the sub-skills; they don't self-trigger.
- Pause on ambiguity or risk — never guess past it.
- **Dependency gates (never skip).** Run the platform MCP preflight before the
  initial Jira fetch and check later-stage MCP dependencies as they become
  necessary. If a required server is unavailable, stop and ask the user to
  enable it; never work around the missing integration.
- **Approval gates (never skip).** Get explicit user approval before (a) writing any code
  — after the plan, both lanes — and (b) any outward action: opening a PR, writing to or
  transitioning a Jira ticket. Surface what you're about to do and wait for the go-ahead.
- Honor the project's `AGENTS.md`/`CLAUDE.md` and run its lint/build before "done".
- Files go where `references/file-organization.md` says; ensure `/plans/` is gitignored.
- Complex lane: on resume, confirm the session model for `session`-tier stages
  (`references/checkpoints.md`) rather than assuming the fresh session got it right.
- Verify before claiming success; if you couldn't verify, say so.
- Delegate PRs, testing instructions, and Jira-ticket writing to the tribe skills.
- Simple-lane implementation must be performed by the dedicated developer subagent; a
  missing dispatch is a protocol failure, not permission to edit inline.
- If a file this skill references does not resolve, stop and tell the user before
  improvising that stage.
- Any spec item known to be unverified or deferred must be surfaced to the user as a
  question at or before the PR gate — handoff notes are not a parking lot for spec gaps.
