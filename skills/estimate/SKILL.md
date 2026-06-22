---
name: estimate
description: Use when the user wants to estimate development time for a Jira ticket (e.g. "/estimate PROJ-123", "how long will TICKET-ID take?"). A standalone, read-only utility — assesses complexity, risks, and unknowns and produces a time estimate. Makes no code changes. The ticket orchestrator reuses this assessment to choose its lane.
---

# Estimate a ticket

Read a ticket and produce an honest development estimate. **Read-only** — never change
code or transition the ticket.

## Process

1. **Read the ticket** — summary, description, acceptance criteria, links, linked issues.
2. **Skim the relevant code** — locate the files/areas the work would touch; gauge how
   well-understood and well-patterned they are.
3. **Assess complexity** across: clarity of requirements, surface area (files/systems
   touched), unknowns/research needed, risk (data/auth/migrations/cross-cutting), and
   testing/verification effort.
4. **Surface blockers and unknowns** that would change the number if unresolved.

## Output

```markdown
# Estimate — <TICKET-ID>: <summary>

Estimate: <range, e.g. 2–4h>   Confidence: <low/med/high>
Lane: <simple (<=3h) | complex>

## Why
<the main drivers of the number>

## Assumptions
- ...

## Unknowns / risks (would change the estimate)
- ...

## What would shrink it
- <e.g. a decision from the PM, an existing helper to reuse>
```

Give a **range**, not a false-precision single number, and state the confidence. Call
out explicitly when an unknown could blow the estimate up.

## Shared with the orchestrator

The `ticket` skill reuses this complexity assessment at its lane-selection step — keep
the simple(<=3h)/complex judgment here consistent with that.
