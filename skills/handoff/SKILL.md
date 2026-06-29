---
name: handoff
description: Compact the current conversation into a handoff document so a fresh agent can pick up the work. Use when the user invokes /handoff or asks for a handoff, AND proactively after completing a significant chunk of work (a finished ticket stage, a large feature, a long debugging session) so progress is never lost between sessions.
argument-hint: "What will the next session focus on? (optional)"
---

# Handoff

Write a handoff document summarising the current conversation so a fresh agent can
continue without re-deriving context.

## Where it goes

Save to **`.scratch/handoff-<short-slug>.md`** in the root of the repo currently being
worked on (the project, not the OS temp dir). Create `.scratch/` if it's missing. Pick a
short kebab-case slug from the work (e.g. `handoff-hybrid-search.md`); if a handoff for
the same work already exists, update it in place rather than spawning a duplicate.

## What to include

- **What was done** — the work completed this session, concisely.
- **Decisions made** — key choices and the one-line rationale for each.
- **Open issues** — what's unresolved, broken, or uncertain.
- **Next steps** — the exact next actions, in order.
- **Relevant paths** — files, branches, tickets, PRs the next agent needs.
- **Suggested skills** — skills the next agent should invoke to continue.

## Rules

- Don't duplicate content already in other artifacts (plans, PRDs, ADRs, issues, commits,
  diffs) — reference them by path or URL instead.
- Redact secrets and PII (API keys, passwords, tokens).
- If arguments were passed, treat them as the next session's focus and tailor the doc to it.
- After writing, tell the user the path in one line. Don't paste the whole doc back.
