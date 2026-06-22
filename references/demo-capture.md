# Demo capture

Captures the ephemeral "how we got here" moments during a ticket so you can later build
a demo/walkthrough for engineers, the team, or a client. **v1 captures only** — turning
the log into a presentation is a future `/demo` utility.

## When it's on

Opt-in per ticket:
- `/ticket PROJ-123 --demo`, or
- the orchestrator offers it when a ticket looks demo-worthy (notable feature, tricky
  problem, client-visible change) and you accept.

Off by default — routine tickets don't get a demo log.

## Where it goes

```
<project>/plans/<TICKET-ID>/
  demo-log.md
  assets/            # screenshots, before/after images
```

Both are gitignored with the rest of `plans/` (see `file-organization.md`).

## Capture mode: hybrid

**Auto-logged** at natural checkpoints (no prompting):

- **Approach chosen** — the direction taken and *why* over the alternatives (from brainstorm).
- **Problem solved** — a non-obvious obstacle and how it was resolved.
- **Before / after** — the headline change, ideally with a screenshot of each state.
- **Verification screenshots** — images captured during the verify stage land in `assets/`.

**Manual** — any time you say "capture this" (or similar), append the current moment
with a one-line note of why it matters.

## Format

`demo-log.md` is a chronological highlight reel. Keep entries short and presentation-ready:

```markdown
# Demo log — PROJ-123: Add Featured badge to event cards

## Approach chosen
Went with a per-event `is_featured` flag over a separate taxonomy — simpler for editors,
no migration. (Alternatives weighed in brainstorm.md.)

## Problem solved
Cached event queries didn't reflect the flag. Fixed by busting the card fragment cache
on event save.

## Before / after
- Before: assets/before-event-card.png
- After:  assets/after-featured-badge.png

## Verified
assets/featured-badge-events-page.png — badge shows only on featured events, mobile OK.
```

Favor signal over completeness — a few vivid moments beat a transcript.
