# Checkpoints, pausing, and resume (complex lane only)

Long complex-lane tickets can outgrow a single session — several subagent dispatches
during develop, or just enough elapsed time that starting fresh is cheaper than carrying
a bloated transcript forward. This defines the resume cursor and where it's safe to stop.

Simple lane skips all of this — it's short enough to run start-to-finish inline.

## The cursor: `plans/<TICKET-ID>/status.md`

A thin pointer, not a second copy of the plan. `plan.md` stays the single source of truth
for tasks; status.md just says where things stand:

```markdown
# Status — <TICKET-ID>
stage: develop (task T3 of 5)   # or e.g. "manual-dqa (round 2)"
lane: complex
branch: <branch name>
session model expected: opus   # config.yml's `session`-tier stages (orchestrate/understand/estimate)
artifacts: brainstorm.md, plan.md
handoff: <path, if a handoff doc exists for this ticket — else omit>
must-surface: <deviations/discovered work not yet raised to the user — empty when clear>
updated: <timestamp>
```

- **Task progress lives on `plan.md` itself** — tick `- [ ]` → `- [x]` on each task line as
  it passes the develop-stage checkpoint (`references/subagents.md`). Don't mirror the
  checklist into status.md; two copies of one list is how staleness happens.
- **`must-surface` is a queue, not a parking lot.** Anything appended here must be raised
  to the user at the next natural gate — it does not relax the hard rule in
  `skills/ticket/SKILL.md` that deviations/spec gaps can't be silently deferred.
- **Relationship to `handoff`:** different jobs, both kept. `handoff` is a one-time
  narrative compaction for a human/agent to read; status.md is a structured cursor updated
  at every gate so the next `/ticket` invocation can machine-parse "where am I, what's
  next" without re-deriving it. If a handoff doc exists, status.md just links it.

## Where it's safe to offer a pause

Not after every stage — only where a fresh session materially pays off:

1. **After the plan is approved**, before committing tokens to develop.
2. **Between develop task-checkpoints**, on multi-task tickets (after a subagent's task
   passes the checkpoint review, before dispatching the next).
3. **Before review.**
4. **Between manual DQA rounds** (`skills/manual-dqa/SKILL.md`) — after the user reports
   findings, before dispatching fixes, and again once a round comes back clean, before
   the demo decision.
5. **Before PR/testing instructions** — right after the demo keep/discard decision
   (`skills/ticket/SKILL.md` step 10). This piggybacks on the approval gate that already
   exists there ("confirm before opening the PR") — one prompt, not two, since both are
   asking "ready to take an outward action?"

Skip pausing between adjacent fast stages (verify → quality gate) — no payoff, just
friction.

At each offered pause: write/update status.md, then ask something like:

> "Continue now, or stop here? Safe to resume with `/ticket <ID>` in a fresh session —
> launch it on **opus** (this ticket's session-tier stages expect that)."

## Resuming

On `/ticket <ID>`, **check for `plans/<TICKET-ID>/status.md` before fetching from Jira.**
If it exists:

- Read it plus the artifacts it links. **Do not re-run fetch/understand/brainstorm "just
  to be sure"** — re-deriving decisions burns exactly the tokens this feature exists to
  save. Jump straight to the recorded stage.
- **Treat it as a hint to verify, not a fact to trust.** Sanity-check against reality
  before continuing: does the branch match? Do `plan.md`'s checked-off tasks' files
  actually exist in the expected shape? This is the same "verify before claiming" habit
  the harness already applies everywhere, now applied to its own resume path — it's also
  what protects against a crash that left status.md stale (an update that never landed
  just means the task is correctly still un-ticked).
- **Confirm the session model.** Subagent-dispatch stages (`brainstorm`/`plan`/`develop`/
  `review`/`verify`) are read fresh from `config.yml` on every dispatch, so resuming
  restores them automatically. But `session`-tier stages run at whatever model the
  session was *launched* with — that can't be restored by re-reading config. State the
  expected session model from status.md and ask the user to confirm the new session was
  launched on it, rather than silently assuming so.

## Failure modes this is deliberately not solving

- **Concurrency** — single-user, one active session per ticket. A timestamp is enough; no
  locking.
- **Orchestrator forgetting to write the update mid-dispatch** — bound the write to the
  checkpoint step that already exists (`subagents.md`), not a separate "remember to do
  this" instruction. If it never lands, resume just sees the task as not-done, which is
  correct.
