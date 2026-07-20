---
name: figma-components
description: Breaks a Figma-driven frontend feature into individual components and turns them into plan.md tasks, one component at a time, instead of planning the whole feature as one unit. Use when a ticket links Figma designs and decomposes naturally into pieces (a masthead, a nav, a multi-part page section) — either standalone ("break this feature into components", "plan this from Figma piece by piece") or as the ticket orchestrator's plan stage for such tickets. Reuses qa-design for auditing existing components and developer for building new ones — see references/decision-tree.md and references/subagents.md.
---

# Figma component breakdown

Planning a whole design-heavy feature as one unit produces worse results than working
through it component by component — smaller, sharper comparisons against Figma, and a
plan.md the develop stage can execute task-by-task. This skill is that technique,
factored out of `plan/SKILL.md` for Figma-driven work specifically.

This is a standalone entry point (like `quick-fix`) — it doesn't require going through
`/ticket`'s brainstorm/estimate/lane ceremony first. It still writes into
`plans/<TICKET-ID>/`, though, so it needs a `TICKET-ID`: use one already in session
context, or ask for one before writing anything.

## Two modes, per component

A single feature can mix both — decide per component, not for the whole feature:

- **Audit mode** — the component already exists live. There's something to compare
  against Figma.
- **Build mode** — the component doesn't exist yet. Nothing live to compare; just a
  Figma spec to build from.

## Workflow

1. **Confirm inputs.** `TICKET-ID`, the local URL to test against, and the top-level
   Figma frame(s) for the feature. Ask for anything missing — don't guess.
2. **Decompose collaboratively.** Work with the user to break the feature into
   individual components — e.g. a collapsed mobile masthead decomposes into a logo, a
   search icon, and a hamburger button. Confirm the list before moving on. Tag each
   component audit or build.
3. **Per-component fact-finding, in parallel** (independent, read-only — see
   `references/subagents.md`'s parallel-dispatch case):
   - Audit-mode components: dispatch `subagent_type: qa-design` with that component's
     Figma node/export, the local URL, and the relevant breakpoints/states. It reports
     differences only — it decides nothing about how to fix them (see
     `agents/qa-design.md`). Don't ask it for fixes. Use `qa-design`'s standard
     breakpoint matrix (1440 / 1280 / 1024 / 768 / 390) unless the project defines its
     own.
   - Build-mode components: no dispatch. Just record the Figma node reference — the
     `developer` role will fetch design context itself when it implements the task,
     via the existing `Design:` briefing field.
4. **Synthesize fixes for audit-mode findings.** For each reported difference, propose
   how to fix it. Check the project's own `CLAUDE.md`/`AGENTS.md` for any
   implementation-preference conventions first (e.g. a project might prefer editing
   block-editor/CMS controls over hand-written CSS) — this is project-local knowledge,
   not something this skill hardcodes.
5. **Write `plan.md`**, one task per component, using the standard task template
   (`references/subagents.md`):
   - `Do:` — the fix list (audit mode) or "build from spec" (build mode).
   - `Accept:` — matches the Figma frame at the tested breakpoints/states, plus any
     enumerated tokens.
   - `Design:` — the component's Figma node ID/export.
   - Mark `[parallel-safe]` where components share no files.
6. **Approval gate.** This is `plan.md`'s existing approval gate — present the plan,
   optionally `grill-me` it (per `plan/SKILL.md`), and don't proceed until approved. No
   separate recommendations doc or second approval step.
7. **Hand off.** Once approved, control returns to the ticket orchestrator (or, if run
   standalone, the user proceeds to `/ticket`'s develop stage directly). `develop`,
   `verify` (which already re-dispatches `qa-design` per the design-fidelity gate in
   `references/verify.md`), and the `checkpoints.md` resume cursor all work unmodified
   from here — the only artifact this skill produces is a normal `plan.md`.

## Non-goals

- Not a new implementer or reviewer agent — `developer` and `qa-design` already cover
  both jobs.
- Not a new artifact format or resume mechanism — `plan.md`/`status.md` already do this.
- Not the place for project-specific fix preferences — those belong in the project's own
  `CLAUDE.md`/`AGENTS.md`.
