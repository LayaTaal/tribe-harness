---
name: session-metrics
description: Aggregate token and workflow metrics from the current Claude Code session transcript into gitignored project records. Use at the end of a session when measuring harness variants such as PR4-only versus PR4+PR5, comparing runs, or tracking token usage.
argument-hint: "<variant> [ticket-id] [lane] [valid|invalid] | compare"
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
If the workflow violated its required dispatch protocol, append `invalid`; invalid
records are excluded from experiment conclusions.

Run `scripts/collect-session-metrics.js` from the repository root. It locates the current
Claude Code transcript, aggregates usage fields, calculates model-priced cost, and appends
one JSON record to `.scratch/session-metrics/runs.jsonl` plus a CSV file.

Before the first run, copy `pricing.json.example` to
`.scratch/session-metrics/pricing.json` and update the rates to match your provider and
account. Rates are USD per million tokens. The collector prices each transcript message
by its recorded model, including separate input, output, cache-read, and cache-write rates.
For each model, cost is `(input × input_rate + output × output_rate + cache_read ×
cache_read_rate + cache_write × cache_write_rate) / 1,000,000`. Each record stores a
short hash of the pricing file so later comparisons reveal rate changes.

## Compare variants

To summarize collected runs:

```text
/session-metrics compare
```

Run the script with `compare`. It reports run counts, median input/output/total tokens,
median billable-token proxy, median USD cost, median duration, and completion/retry rates grouped by variant. It
does not claim statistical significance; collect multiple comparable, protocol-valid runs
before deciding.

## Rules

- Keep records in `.scratch/session-metrics/`; never commit them.
- Use `pr4-only` for control and `pr4-pr5` for treatment.
- Keep model, ticket type, interaction style, and environment consistent across pairs.
- Treat missing usage data as an explicit error, not zero.
- Do not use unpriced records for cost comparisons; the script fails clearly when a
  model has no matching pricing entry.
