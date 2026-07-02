# Changelog

Format based on [Keep a Changelog](https://keepachangelog.com/). Versions before 1.1.0
predate this file — see `git log` for that history.

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
