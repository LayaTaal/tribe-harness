---
name: manual-dqa
description: Invoked by the ticket orchestrator after review is satisfied, before the demo decision/PR, to run a human manual QA pass. The user tests the implementation live and writes findings to manual-dqa-N.md; the orchestrator turns unchecked findings into fix tasks dispatched via the existing developer role, then loops back to develop/verify until a round is clean. Not a standalone entry point — the ticket skill calls this; do not trigger it on its own.
---

# Manual DQA

A human QA pass — the user exercises the change live, rather than relying on
tests or a code review. Mandatory on both lanes, right before the demo
keep/discard decision and PR.

## Round loop

1. **Pause and ask.** Tell the user it's time to test live. State the expected
   file: `plans/<TICKET-ID>/manual-dqa-N.md` (N = next round number, starting
   at 1), with any screenshots under `assets/manual-dqa-N/`. They can also just
   say "clean" if nothing came up.
2. **Read the round file** (or the "clean" response). No unchecked `- [ ]` items
   → done, return control to the orchestrator to proceed to the demo decision.
3. **Otherwise, for each unchecked finding:** brief a fix task using the same
   template `references/subagents.md` defines for developer dispatch (Task /
   Acceptance / Files / Context / Verify / Model). Dispatch via the `developer`
   role on the complex lane; fix inline on the simple lane. Don't invent a new
   role — the DQA write-up is human-authored, so this is no different from
   briefing a `plan.md` task.
4. **Re-verify** (`references/verify.md`) and re-run the quality gate on
   anything fixed. Tick `- [x]` on findings as they're confirmed fixed — don't
   edit the user's original wording.
5. Loop back to step 1 for the next round (N+1) until a round comes back with
   no unchecked findings.

An unchecked finding is a spec gap like any other — it can't be silently
deferred (see `skills/ticket/SKILL.md` Hard rules). If something genuinely
isn't fixable now, surface it to the user as an explicit question, don't just
leave it unchecked and move on.

## Output format (`manual-dqa-N.md`)

```markdown
# Manual DQA — round N — <TICKET-ID>

## Findings
- [ ] issue description — screenshot: assets/manual-dqa-N/<file>.png
- [ ] ...

## Notes
Non-actionable observations, questions, or confirmations — not new fix tasks.
```

This mirrors `review.md`'s findings-first shape but tracks items as checkboxes
(like `plan.md` tasks) since they're worked through iteratively across rounds
rather than reported once.

## Assets

Each round's screenshots live in their own subfolder,
`plans/<TICKET-ID>/assets/manual-dqa-N/` — not the flat `assets/` folder
`demo-log.md` uses — so filenames can't collide across rounds. See
`references/file-organization.md`.
