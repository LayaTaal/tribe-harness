---
name: brainstorm
description: Invoked by the ticket orchestrator on the complex lane to explore solution approaches before planning. Not a standalone entry point — the ticket skill calls this; do not trigger it on its own.
---

# Brainstorm a solution (complex lane)

Explore the solution space for a ticket before committing to a plan. Tailored and
lightweight — a focused exploration, not a research project.

## Process

0. **Fan out research, if the ticket spans multiple unfamiliar subsystems.** When you'd
   need to look in more than one place you don't already understand (e.g. a design file,
   an existing subsystem's architecture, a precedent elsewhere in the codebase), dispatch
   one `researcher` subagent per independent investigation domain, in parallel (one
   message, multiple calls) — each scoped to a single question. Fold their findings into
   the constraints below. Skip this if you already know the area and there's nothing to
   look up.
1. **Frame the problem.** State what success looks like, the constraints (existing
   patterns, performance, editors/users, timeline), and any non-goals.
1a. **If the ticket links a design (Figma or similar), produce a complete visual
   inventory of the target component** — layout, element order, colors/background/chrome,
   per-breakpoint differences — not only deltas from legacy/current code. Delta-framing
   silently converts "not mentioned" into "already correct." Explicitly list anything
   "assumed already correct in the codebase" so the user can veto the assumption.
2. **Generate 2–3 distinct approaches.** Genuinely different directions, not variations
   of one. For each: how it works, what it touches, pros, cons, risks, rough effort.
3. **Recommend one**, with the reasoning for choosing it over the others. Lead with the
   recommendation.
4. **Discuss with the user.** Push back if they lean toward an approach with real
   downsides. Adjust based on their context.

## Output

Write `plans/<TICKET-ID>/brainstorm.md` (gitignored — see
`references/file-organization.md`):

```markdown
# Brainstorm — <TICKET-ID>: <summary>

## Problem & constraints
...

## Visual inventory  (design tickets only)
Layout / element order / colors, background, chrome / per-breakpoint differences.
Assumed already correct in the codebase: <list, so the user can veto>

## Approaches
### A. <name>  — RECOMMENDED
How / touches / pros / cons / risk / effort

### B. <name>
...

## Decision
Chose A because ... (over B/C because ...)
```

If demo capture is on, the chosen approach + rationale becomes an "Approach chosen"
entry in `demo-log.md` (see `references/demo-capture.md`).

After this, control returns to the orchestrator, which may offer `grill-me` on the
approach, then moves to the `plan` stage.
