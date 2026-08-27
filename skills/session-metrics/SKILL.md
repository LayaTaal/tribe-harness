---
name: session-metrics
description: Aggregate token and workflow metrics from the current Claude Code session transcript into gitignored project records. Use at the end of a session when measuring harness variants such as PR4-only versus PR4+PR5, comparing runs, or tracking token usage.
argument-hint: "<variant> [ticket-id] [lane] | compare"
---

# Session metrics

Collect aggregate metrics only. Never copy prompts, ticket descriptions, tool arguments,
or transcript content into the output.

## Record a session

At the end of the ticket session, invoke:

```text
/session-metrics pr4-only PROJ-123 simple
```

For the proposed harness, use:

```text
/session-metrics pr4-pr5 PROJ-123 simple
```

The first argument is required and must identify the experiment variant. Use the same
ticket and lane in both runs. If the ticket ID or lane is unavailable, use `unknown`.

Run `scripts/collect-session-metrics.js` from the repository root. It locates the current
Claude Code transcript, aggregates usage fields, and appends one JSON record to
`.scratch/session-metrics/runs.jsonl` plus a human-readable CSV file.

## Compare variants

To summarize collected runs:

```text
/session-metrics compare
```

Run the script with `compare`. It reports run counts, median input/output/total tokens,
median billable-token proxy, median duration, and completion/retry rates grouped by variant. It
does not claim statistical significance; collect multiple comparable runs before deciding.

## Rules

- Keep records in `.scratch/session-metrics/`; never commit them.
- Use `pr4-only` for control and `pr4-pr5` for treatment.
- Keep model, ticket type, interaction style, and environment consistent across pairs.
- Treat missing usage data as an explicit error, not zero.
- The cost proxy is reported in token units unless a pricing table is supplied; do not
  present it as currency.
