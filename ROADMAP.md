# Roadmap

Parked ideas and larger features that need a design pass before building. Items
graduate out of here into `skills/`/`references/` once designed and shipped.

## Parallel tickets, one overseeing chat

**Want:** kick off several tickets at once and have them worked in parallel, with a
single main chat overseeing them.

**Why it's not a quick edit:** the harness today is single-ticket. Doing this well needs
real design, not a flag:

- **Isolation** — each ticket's process files already namespace under
  `plans/{ticket}` (good), but concurrent develop stages spawn their own subagents;
  need to keep their worktrees/branches/state from colliding.
- **Supervision** — how the overseeing chat multiplexes status across N flows and keeps
  the per-stage feedback (Step N …) legible when several are in flight.
- **Approval gates** — the per-ticket approval checkpoints (code, PR, Jira) must still
  hold per ticket without the user drowning in prompts; likely needs batching/queueing.
- **Failure handling** — one ticket's quality-gate failure or blocker must pause just
  that flow, not the others.

**Next step:** a `brainstorm` session on the supervision + isolation model before any
code. Likely leans on git worktrees per ticket.

## Smaller / already-planned

- `/demo` — turn a ticket's `demo-log.md` + assets into a presentation/walkthrough
  (v1 captures the moments; v2 builds the deck).
- Weekly prioritization, morning Slack/Jira triage, learning-time and EOD-review routines.
- A built + verified Copilot CLI adapter.
- Promote to the team via `promote-skill` once it's proven.
