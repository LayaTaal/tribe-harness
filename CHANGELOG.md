# Changelog

Format based on [Keep a Changelog](https://keepachangelog.com/). Versions before 1.1.0
predate this file — see `git log` for that history.

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
