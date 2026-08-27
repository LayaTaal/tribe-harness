# Changelog

Format based on [Keep a Changelog](https://keepachangelog.com/). Versions before 1.1.0
predate this file — see `git log` for that history.

## [1.4.0] - 2026-08-26

### Changed
- Planning stages now use Sonnet and mechanical verification uses Haiku; Opus remains for
  orchestration and independent review.
- Simple-lane implementation follows PR #4's dedicated Sonnet developer dispatch.
- Removed unused demo capture, `/demo`, and their scratch-file workflow.
- Reduced repeated progress narration and removed redundant per-skill copies of `config.yml`.
- Added `/session-metrics` to record aggregate Claude Code usage for `pr4-only` and
  `pr4-pr5` comparisons under `.scratch/session-metrics/`.
- Added model pricing configuration and USD cost calculations to session metrics; invalid
  protocol runs are excluded from comparisons.
- Made simple-lane developer dispatch fail-closed across the workflow references.

## [1.3.0] - 2026-07-15

### Added
- `references/checkpoints.md` — complex-lane tickets can now pause and resume across
  sessions. A thin `plans/<TICKET-ID>/status.md` cursor (stage, lane, branch, expected
  session model, a must-surface queue) lets a fresh `/ticket <ID>` invocation resume
  without re-fetching or re-deriving prior stages. Task progress stays on `plan.md`
  itself (checkboxes) rather than a second mirrored list, to avoid staleness.
- Pause points wired into `skills/ticket/SKILL.md`: after plan approval, between develop
  task-checkpoints (`references/subagents.md`), before review, and before PR (folded into
  the existing pre-PR approval confirm rather than a second prompt).

### Changed
- `references/file-organization.md` — the gitignore-for-`/plans/` step is now a single
  idempotent Bash one-liner (`git check-ignore -q plans/ ...`) instead of a multi-step reasoning
  instruction.
- `references/decision-tree.md`, `README.md` — reference the new checkpoint/resume flow.

### Considered and declined
- Repomix / Code2Prompt for research-token reduction — both front-load a repo blob into
  context, which is the opposite of the goal; the `Explore` agent and this environment's
  context-mode-style indexing already cover it.
- A dedicated `scripts/` directory for mechanical research tasks — the only genuinely
  judgment-free candidate (the gitignore check) is now a one-liner; everything else
  surveyed needs project-specific interpretation, so scripting it would just move the
  reasoning, not remove it.

## [1.2.0] - 2026-07-02

### Added
- `agents/` — tribe-harness's own subagent roles (`developer`, `reviewer`, `researcher`),
  symlinked into `~/.claude/agents` by `install.sh` alongside the existing skills. Keeps
  subagent dispatch on roles the harness owns instead of external agent types that may
  not exist in every install.
- `skills/brainstorm/SKILL.md` — optional research fan-out step: dispatch one
  `researcher` subagent per independent investigation domain when a ticket spans
  multiple unfamiliar subsystems, before framing the problem.
- `skills/plan/SKILL.md` — option to slice tasks by independently-shippable increment,
  not just file overlap, for tickets with more than one shippable piece.

### Changed
- `references/subagents.md` — the develop stage now dispatches the `developer` role
  explicitly instead of a bare `Agent` call.
- `skills/review/SKILL.md` — independent review now dispatches the `reviewer` role
  (read-only — flags issues, never fixes them) instead of a bare `Agent` call.
- `references/platform/claude-code.md` — documents dispatching by role.
- `install.sh` — refactored into a reusable symlink helper so it can link both
  `skills/` and `agents/`.

## [1.1.0] - 2026-07-02

### Added
- `/demo` skill — turns one or more tickets' demo logs into a shareable markdown
  walkthrough doc, with a generation-time prompt for audience and time/effort framing.
- `CHANGELOG.md`.

### Changed
- Demo capture is now always-on and buffered instead of opt-in via `/ticket --demo`.
  Every ticket buffers checkpoints and verify screenshots to a scratch draft
  (`tmp/<project>/<TICKET-ID>/`); a single keep/discard decision before the PR promotes
  the draft into `plans/<TICKET-ID>/demo-log.md` (or discards it). See
  `references/demo-capture.md`.
- `references/verify.md` — browser verification always stashes a screenshot to the demo
  draft, rather than only when demo capture was explicitly on.
- `skills/ticket/SKILL.md` — dropped the `--demo` flag from the entry point; added a
  "demo decision" step before opening the PR.

### Removed
- `defaults.demo` from `config.yml` (no longer a flag to default).
