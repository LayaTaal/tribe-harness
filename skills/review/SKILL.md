---
name: review
description: Invoked by the ticket orchestrator to review implemented changes. On the complex lane it runs as an independent fresh-eyes agent. Not a standalone entry point — the ticket skill calls this; do not trigger it on its own.
---

# Review the changes

Review the diff for correctness and quality before the work is called done.

## Complex lane — independent review

The orchestrator dispatches this as the `reviewer` role (`subagent_type: reviewer` — see
`references/platform/claude-code.md`; fresh context, model per `config.yml`, read-only so
it can flag but not fix) so the review isn't biased by the implementation reasoning.
Write findings to `plans/<TICKET-ID>/review.md`.

## Simple lane — quick self-review (with escalation)

A focused pass over the diff inline; no separate doc unless something notable turns up.

**Escalate to an independent subagent review** (as in the complex lane) before the
commit/PR gate if the change outgrew the simple-lane assumptions:

- it touched multiple files, or shared/core code other features depend on;
- the diff is materially larger than the estimate assumed;
- it edited tests, config, schema, or anything with regression blast radius;
- you're not confident a self-review would catch a mistake here.

Cheaper than shipping a regression — and these are exactly the cases self-review misses.

## What to look for

- **Correctness / bugs** — logic errors, off-by-one, null/empty/error cases, race
  conditions, broken assumptions against the acceptance criteria.
- **Regressions** — nearby behavior the change could break.
- **Reuse & simplification** — duplicated logic, code that an existing utility already
  does, over-engineering, dead/leftover code.
- **Fit** — matches project patterns; respects `AGENTS.md`/`CLAUDE.md`; lint/build clean.
- **Security/data** — only if relevant: input handling, auth/permissions, destructive ops.

## Output format (`review.md`)

```markdown
# Review — <TICKET-ID>

## Must fix
- [file:line] issue — why it matters — suggested fix

## Should consider
- ...

## Nits
- ...

## Verified
What was confirmed working (or "not independently verified — why").
```

Report findings honestly. Be specific (`file:line`), prefer high-confidence issues, and
don't pad with noise. Return control to the orchestrator, which decides whether to
iterate (back to develop) or proceed to PR.
