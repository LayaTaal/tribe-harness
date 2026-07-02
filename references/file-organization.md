# File organization

Where the harness writes the markdown and assets it generates. Read this before
creating any file during a ticket.

## Process files — kept locally, never committed

Live alongside the code they describe, under the project repo:

```
<project>/plans/<TICKET-ID>/
  brainstorm.md     # complex lane only — approaches + chosen direction
  plan.md           # the development plan (discrete tasks)
  review.md         # code review findings
  demo-log.md       # only if the end-of-ticket demo decision was "keep" (demo-capture.md)
  assets/           # same — promoted from the scratch draft on "keep"
```

**These must not be committed.** Before writing the first file for a ticket:

1. Find the project's `.gitignore`.
2. If it does not already ignore `/plans/`, append a line:
   ```
   /plans/
   ```
3. If there is no `.gitignore`, create one with that line.

Co-located so they're easy to find while working; gitignored so teammates never
see your scratch and it never lands in a PR.

## Throwaway / temp files — outside every repo

Anything genuinely disposable (scratch output, intermediate dumps, experiment
artifacts) goes outside the project tree:

```
~/code/tribe/tmp/<project>/<TICKET-ID>/
```

Create the directory as needed (it does not exist yet). Non-tribe projects mirror
under the same `~/code/tribe/tmp` root using the project's directory name.

The demo-log **draft** also lives here (`demo-log-draft.md` + `assets/`) until the
end-of-ticket keep/discard decision — see `demo-capture.md`. On "keep" it's promoted
into `plans/<TICKET-ID>/`; on "discard" it just rots here with everything else.

## Rule of thumb

- Will I want this next to the code while I work the ticket? → `plans/` (gitignored)
- Is this pure scratch I'd delete without a second thought? → `tmp/`
