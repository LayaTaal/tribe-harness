# Verifying behavior

Before any change is called done, observe it actually working. Pick the cheapest method
that proves the behavior the ticket asked for.

## Methods

- **Browser** — for UI/frontend/theming. Load the affected page, exercise the change,
  confirm it matches the design/AC. Always stash a screenshot to the demo draft
  (`demo-capture.md`), and capture one for the testing instructions when it helps. Check
  the obvious responsive/empty/error states.
- **API request** — for endpoints, REST/GraphQL, webhooks. Send a real request, assert
  the response shape and status. Include an error/edge case, not just the happy path.
- **WP-CLI** — for WordPress data/state (options, posts, meta, migrations). Use the
  project's runner (often `lando wp ...` or `wp ...`). Verify the data actually changed
  as intended and nothing adjacent broke.
- **Tests** — if the project has a suite and the change is logic-bearing, run it (and the
  test you wrote). Green tests support but do not replace observing behavior for anything
  user-facing.

## Design fidelity (when the ticket links design files)

The design is the spec — the plan's `Accept:` checklist is only an index into it, not a
substitute. Tokens/AC alone can all be hit while the result still doesn't look like the
design (element order, chrome, per-breakpoint layout are easy to miss that way).

- Dispatch the `qa-design` role (`references/platform/claude-code.md`) with ONLY the
  design exports/Figma node IDs + the live URL — never the plan's acceptance list — same
  fresh-eyes rationale as code review. It reports every visible difference from the
  design, not a checklist pass/fail.
- Cover a breakpoint matrix (e.g. 1440 / 1280 / 1024 / 768 / 390, or the project's own
  breakpoints) across every distinct component state — rest, each dropdown/overlay open,
  mobile menu states.
- A "known gap, check later" item is not acceptable here — see `skills/ticket/SKILL.md`
  Hard rules on silent deferrals.

## Finding the environment

- Dev URL: check the project's config (e.g. `config/.vip.*.develop.yml`,
  `local-config.json`, or the project's AGENTS.md/CLAUDE.md). Ask if you can't determine it.
- Use the project's tooling (lando/docker/etc.) rather than assuming a global install.

## What "verified" means

State what you did and what you observed, concretely:

> Verified at https://dev.example.com/events — the Featured badge renders only on
> featured events, is hidden on others, and reflows correctly at mobile width.

Not:

> The badge should now display correctly.

If you could not verify (no environment, blocked), say so explicitly — do not imply
success you didn't observe.
