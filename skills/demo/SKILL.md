---
name: demo
description: Turn one or more tickets' demo-log.md + assets into a markdown walkthrough doc worth sharing with coworkers. Use when the user invokes /demo, or asks to write up/recap/share a ticket's demo log as a presentation or walkthrough.
argument-hint: "[TICKET-ID ...] (defaults to the ticket in flight this session)"
---

# Demo

Turn captured demo-log(s) into a single markdown walkthrough doc — the story of a larger
unit of work (decisions, dead ends, before/after) that would otherwise get forgotten.
**Read-only over the ticket** — this only reads `plans/` and writes the demo doc.

## Resolving which ticket(s)

- No arguments → use the ticket already in flight this session.
- One or more `TICKET-ID` arguments → use exactly those, in the order given.

For each ticket, `plans/<TICKET-ID>/demo-log.md` must exist. If a named ticket has no
demo-log (it never ran with `--demo`), stop and tell the user — don't fabricate content
from the ticket or conversation.

## Source material — strictly the demo-log(s)

Only read `demo-log.md` and `assets/` from each ticket's `plans/<TICKET-ID>/` dir. Do
**not** pull from `brainstorm.md`, `plan.md`, `review.md`, or conversation history — if a
moment wasn't captured to the log, it doesn't appear in the demo. This keeps output
predictable: what you see is what was logged.

For multiple tickets, merge their entries into one chronological narrative (order by the
ticket order given, then by entry order within each log), crediting the ticket when it
helps the story ("in PROJ-124, this surfaced a caching bug...").

## Ask before writing

Two questions can't be inferred from the logs — ask both before drafting:

1. **Time/effort framing** — e.g. "~25hrs → ~8hrs". Optional; skip the Impact section if
   not applicable.
2. **Audience** — engineering team (technical, can use jargon/tool names freely) or a
   broader/non-technical audience (more explanation, less jargon).

## Output

Write to `plans/<first-ticket-id>/demo.md` (gitignored, same as other process files —
see `references/file-organization.md`). For multi-ticket runs, `<first-ticket-id>` is
the first ticket argument given.

Structure sections as slide-sized chunks — one idea per `##`, not sprawling paragraphs —
so a future Marp/reveal.js pass can consume this doc directly:

```markdown
# Demo: <title>

## Why
One or two sentences of context — what this work was and why it mattered.

## The story
Chronological highlights from the demo-log(s): approach chosen, problems solved,
told as a narrative, not a raw log dump.

## Before / after
Embedded images from assets/.

## What worked / what didn't
Pulled from "problem solved" entries — honest, not just a highlight reel.

## Impact
Time/effort framing, only if provided.
```

Favor signal over completeness, same as the log itself — a few vivid moments beat a
transcript. After writing, tell the user the path in one line; don't paste the whole
doc back.
