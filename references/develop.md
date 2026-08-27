# Development & testing stance

Guidance the orchestrator reads at the develop stage. The goal is correct,
maintainable changes that fit the project you're in — not a house style imposed on
every codebase.

## Principles

- **Smallest complete change.** Implement what the ticket asks; resist scope creep.
  If you discover adjacent work, note it (and surface it) rather than silently doing it.
- **Follow the project.** Match existing patterns, naming, and structure. Read nearby
  code before writing. Reuse existing utilities instead of adding new ones.
- **Never edit generated/vendored code** (`vendor/`, `node_modules/`, build output).
- **Respect project AGENTS.md / CLAUDE.md.** Those are higher priority than this skill.
  Run whatever linting/build the project expects before calling work done.

## Testing — contextual and project-adaptive

Two rules, in tension, resolved by judgment:

1. **Test-first where it pays.** For logic, data handling, APIs, parsing, anything with
   branches or edge cases — write a failing test, then make it pass. This is where
   regressions hide and where a test is cheap insurance.
2. **Don't impose a framework the project doesn't have.** If a repo has no test setup,
   do **not** scaffold Jest/PHPUnit/etc. just to satisfy a process. Match what exists:
   - Has a test suite → add tests in its style for logic-bearing changes.
   - Has none → verify behavior directly (see `verify.md`) and say so plainly.

For theming/CSS/markup/copy changes, unit tests rarely earn their keep — build it and
**verify the real behavior** instead.

## The one non-negotiable

**Always verify real behavior before claiming done** — browser, API call, or WP-CLI as
appropriate. "It should work" is not "it works." See `verify.md`.

## Subagent execution

On the complex lane, development is split into the tasks in `plan.md` and dispatched to
subagents — see `subagents.md` for when and how. On the simple lane, the orchestrator
must dispatch exactly one `developer` subagent using `models.develop` from `config.yml`;
the main session must not edit files. If dispatch is unavailable, stop and report a
protocol-invalid run.
