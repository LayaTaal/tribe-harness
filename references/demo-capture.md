# Demo capture

Captures the ephemeral "how we got here" moments during **every** ticket so you can
decide, once the work is done, whether it's worth turning into a shareable walkthrough
(`skills/demo/`). No upfront decision required — you don't have to know at the start of
a ticket whether it'll turn out to be demo-worthy.

## Always on, no flag

Both lanes, every ticket, no `--demo` flag to remember. The harness buffers as it goes;
you decide once, at the end, whether to keep it.

## Where the buffer lives (until you decide)

The draft lives in scratch (`paths.tmp` in `config.yml`), **not** `plans/`, so a routine
ticket that never becomes a demo leaves nothing behind in the project:

```
<tmp-path>/            # {project}/{ticket}, per file-organization.md
  demo-log-draft.md
  assets/              # screenshots stashed during verify, before/after images
```

## Capture mode: hybrid

**Auto-logged** at natural checkpoints (no prompting), appended to the draft:

- **Approach chosen** — the direction taken and *why* over the alternatives (from brainstorm).
- **Problem solved** — a non-obvious obstacle and how it was resolved.
- **Before / after** — the headline change, ideally with a screenshot of each state.
- **Verification screenshots** — every browser-verified check stashes a screenshot to
  the draft's `assets/` automatically (see `verify.md`) — cheap, since verification
  already loads the page; no separate decision needed to get it.

**Manual** — any time you say "capture this" (or similar), append the current moment
with a one-line note of why it matters.

## The decision

Once, right before opening the PR (see `skills/ticket/SKILL.md`), the orchestrator asks:

> "Want to keep the demo log for this one? (N moments, M screenshots buffered)"

- **Keep** — move `demo-log-draft.md` → `plans/<TICKET-ID>/demo-log.md` and
  `assets/` → `plans/<TICKET-ID>/assets/` (both gitignored, see `file-organization.md`).
  Run `/demo` on it whenever you're ready to write it up.
- **Discard** — leave the draft in scratch (it rots there like other tmp output) or
  delete it. Nothing lands in the project.

If a ticket obviously turns out demo-worthy mid-flight, you can say so early and the
orchestrator treats it the same as an early "keep" — the buffering doesn't change,
only when it gets promoted.

## Format

`demo-log.md` (and its draft) is a chronological highlight reel. Keep entries short and
presentation-ready:

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
