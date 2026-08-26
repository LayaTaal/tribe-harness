# File organization

Where the harness writes the markdown and assets it generates. Read this before
creating any file during a ticket.

## Process files — kept locally, never committed

Live alongside the code they describe, under the project repo:

```
<project>/plans/<TICKET-ID>/
  brainstorm.md     # complex lane only — approaches + chosen direction
  plan.md           # the development plan (discrete tasks)
  status.md         # complex lane only — resume cursor (references/checkpoints.md)
  review.md         # code review findings
```

**These must not be committed.** Before writing the first file for a ticket, run this
(idempotent — safe to run every time, no need to reason through it):

```bash
git check-ignore -q plans/ 2>/dev/null || printf '/plans/\n' >> .gitignore
```

Co-located so they're easy to find while working; gitignored so teammates never
see your scratch and it never lands in a PR.

## Rule of thumb

- Will I want this next to the code while I work the ticket? → `plans/` (gitignored)
