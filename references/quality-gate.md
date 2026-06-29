# Quality gate

A blocking pass/fail check between Verify and Review: the project's own lint, build, and
tests must be green before the change goes to review or PR. This formalizes what was
already soft guidance ("run lint before done") into a defined gate with bounded retry —
so failures get caught and fixed here, not discovered at push or by a reviewer.

## What runs

Use the **project's** commands, found in its `AGENTS.md`/`CLAUDE.md` (never invent them):

- **Lint / format** — e.g. `npm run lint`, `lando composer phpcs`.
- **Static analysis** — e.g. `phpstan`, `tsc --noEmit`, if the project has it.
- **Tests** — the project's suite, if it has one and the change is logic-bearing
  (matches the stance in `develop.md` — don't scaffold a suite that doesn't exist).
- **Build** — if the change touches anything compiled/bundled.

Run only what the project actually has. A repo with no test suite gates on lint/build
plus the behavior verification from `verify.md` — say so plainly.

## The loop (bounded, then escalate)

1. Run the gate.
2. **Green** → proceed to Review.
3. **Red** → fix the cause and re-run. Bound this to **two attempts on the same
   failure**. If it still fails, **stop and surface it to the user** with the actual
   error output — do not keep grinding or paper over it.

The two-attempt bound is the discipline: a quick fix-and-retry is fine; an agent looping
on the same error is a signal something needs a human, not another guess.

## Not an autopilot

This gate exists to hand Review and PR a clean baseline — it does **not** auto-merge,
auto-PR, or replace the human checkpoints. The harness stays collaborative: the user
still approves before code is written and before any Jira write or PR (see the README's
non-goals). The gate just makes "is it green?" an explicit, honest step instead of an
assumption.
