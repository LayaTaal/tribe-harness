---
name: plan
description: Invoked by the ticket orchestrator to turn a chosen approach into a development plan. Not a standalone entry point — the ticket skill calls this; do not trigger it on its own.
---

# Build a development plan

Turn the chosen direction into a concrete plan a developer (or a subagent) can execute
without re-deriving decisions.

## Complex lane → `plans/<TICKET-ID>/plan.md`

Break the work into **discrete tasks**, each with testable acceptance criteria and a
parallelism marker so the develop stage can dispatch them (`references/subagents.md`):

```markdown
# Plan — <TICKET-ID>: <summary>

## Context
One paragraph: the approach (link brainstorm.md) and why.

## Tasks
### T1 — <name>   [sequential]
- Files: <paths>
- Do: <what>
- Accept: <how we know it's done — testable>

### T2 — <name>   [parallel-safe]
- Files: <paths, no overlap with other parallel tasks>
- Do: ...
- Accept: ...

## Verification
End-to-end: how to confirm the whole change works (see references/verify.md).

## Risks / rollback
Anything to watch; how to back out.
```

Mark a task `[parallel-safe]` only if it shares no files and no ordering dependency with
other parallel tasks; otherwise `[sequential]`.

For tickets with more than one independently-shippable piece, consider slicing tasks by
increment (each independently implementable and testable) rather than only by file —
mirrors how larger specs get broken into per-story phases. Skip this for single-concern
tickets; it's not worth the ceremony.

## Simple lane → brief inline plan

No file. State, in a few lines: what you'll change, where, and how you'll verify it.
Then proceed.

## Principles

- Reuse existing utilities/patterns; name the files to touch.
- Smallest complete change; no speculative scope.
- Each task independently reviewable.

Control returns to the orchestrator, which may `grill-me` the plan (complex lane) before
development.
