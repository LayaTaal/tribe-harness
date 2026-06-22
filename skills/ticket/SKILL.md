---
name: ticket
description: Use when the user starts work on a Jira ticket (e.g. "/ticket PROJ-123", "let's work on PROJ-123", "pick up TICKET-ID"). The collaborative orchestrator that drives a ticket through its full lifecycle — understand, brainstorm, plan, develop, verify, review, PR, testing instructions — choosing a simple or complex path and delegating to the right skills. This is the ONLY entry point for ticket work; it invokes the brainstorm/plan/review sub-skills itself.
---

# Ticket orchestrator

You are a collaborative engineering partner, not an autopilot. Drive the ticket
**with** the user: think out loud, push back when something seems wrong, surface
questions early, and review the work critically. Never silently guess past ambiguity.

Entry: `/ticket <TICKET-ID> [--demo]`.

Read `references/decision-tree.md` for the full flow. The lane (simple vs complex)
controls how much ceremony each stage gets. Config (model policy, defaults) is in
`config.yml`. Platform-specific tool mappings are in `references/platform/claude-code.md`.

## Task progress

Track these as todos and work them in order:

- [ ] 1. Fetch the ticket from Jira
- [ ] 2. Understand the request; flag questions / missing scope / blockers
- [ ] 3. Assess the lane (simple <=3h vs complex) and confirm with the user
- [ ] 4. (complex) Brainstorm → `brainstorm.md`; (simple) skip
- [ ] 5. Plan: (complex) `plan.md` with discrete tasks; (simple) brief inline plan
- [ ] 6. Develop (per `references/develop.md`; complex → subagents per `references/subagents.md`)
- [ ] 7. Verify behavior (per `references/verify.md`)
- [ ] 8. Review: (complex) independent agent → `review.md`; (simple) quick self-review
- [ ] 9. Iterate 6–8 until satisfied
- [ ] 10. Open the PR (delegate to `git-workflow`)
- [ ] 11. Add testing instructions to Jira (delegate to `jira-testing-instructions`)

## Stage detail

**1. Fetch.** Pull summary, description, acceptance criteria, links, and any linked
tickets via the Jira tools (see platform mapping). Read it fully before reacting.

**2. Understand + blocker gate.** Restate the request in your own words. Identify
anything that blocks confident work: unclear AC, missing scope, undefined design,
external dependencies, risky/destructive/security/auth implications. If any exist,
**pause** — surface the questions to the user, and offer to comment on Jira or flag the
PM. Do not proceed on guesses. Resolve, then continue.

**3. Assess + confirm lane.** Using the estimate core (`skills/estimate`), judge whether
this is simple (<=3h: isolated, clear AC, low risk) or complex. Propose the lane with a
one-line rationale and let the user confirm or override (`config.yml` `defaults.lane`).
If `--demo` was passed, enable demo capture now; otherwise, if the ticket looks
demo-worthy, offer it. When on, follow `references/demo-capture.md` throughout.

**4. Brainstorm (complex only).** Invoke the `brainstorm` sub-skill → writes
`brainstorm.md`. Offer to stress-test the chosen approach with `grill-me`.

**5. Plan.** Invoke the `plan` sub-skill. Complex → `plan.md` with discrete, acceptance-
tagged tasks (each marked sequential or parallel-safe). Simple → a brief inline plan, no
doc. Optionally `grill-me` the plan on the complex lane.

**6. Develop.** Follow `references/develop.md` (smallest complete change, follow the
project, contextual+project-adaptive testing). Complex lane: dispatch a subagent per
task per `references/subagents.md`, sequential with a review checkpoint, using the model
from `config.yml`. Simple lane: build inline.

**7. Verify.** Follow `references/verify.md`. Observe real behavior (browser/API/WP-CLI)
before claiming anything works. Capture screenshots if demo capture is on.

**8. Review.** Complex → dispatch an **independent** review agent (fresh eyes, model per
policy) via the `review` sub-skill → `review.md`. Simple → quick self-review. Look for
bugs, regressions, dead/duplicated code, and simplifications.

**9. Iterate.** Loop 6–8 until you and the user are satisfied.

**10. PR.** Delegate to `git-workflow` for branch naming and PR format. Never invent
conventions it owns.

**11. Testing instructions.** Delegate to `jira-testing-instructions`. Then link the PR
on the ticket and transition it per the team's flow.

## Hard rules

- One ambient entry. You drive the sub-skills; they don't self-trigger.
- Pause on ambiguity or risk — never guess past it.
- Honor the project's `AGENTS.md`/`CLAUDE.md` and run its lint/build before "done".
- Files go where `references/file-organization.md` says; ensure `/plans/` is gitignored.
- Verify before claiming success; if you couldn't verify, say so.
- Delegate PRs, testing instructions, and Jira-ticket writing to the tribe skills.
