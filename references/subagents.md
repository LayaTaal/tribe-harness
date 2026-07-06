# Splitting work across subagents

How the develop stage turns a plan into subagent work. This is the same lever that
applies the model policy (`config.yml`): each dispatched subagent runs on the model
named for its stage (develop → sonnet by default).

## When to split

- **Complex lane only.** Simple tickets are done inline — subagent overhead isn't worth it.
- Split when `plan.md` has distinct tasks with clear, independent acceptance criteria.
- Don't split work that shares tight state or must be reasoned about as one unit.

## Sequential with review checkpoints (default)

For each task in `plan.md`, in order:

1. **Brief the subagent** with: scope (just this task), acceptance criteria, the files
   it should touch, relevant patterns to follow, and the model from the policy. Dispatch
   as the `developer` role (`subagent_type: developer` — see `references/platform/claude-code.md`).
2. Let it implement the single task.
3. **Checkpoint:** review its result before moving on — does it meet the acceptance
   criteria? Any drift, regression, or shortcut? Integrate or send back.
4. Proceed to the next task.

This catches drift early and keeps you in the loop — the collaborative ethos of the harness.

## Parallel (for independent tasks)

Tasks `plan.md` explicitly marks **independent** (no shared files, no ordering
dependency) may be dispatched at once, then reviewed as they return. Faster wall-clock,
more to reconcile. Use when the speedup is real and the tasks genuinely don't interact.

## Briefing template

```
Task: <one task from plan.md>
Acceptance: <how we'll know it's done — testable>
Files: <paths it should work in>
Context: <patterns/utilities to reuse; what NOT to touch>
Design: <Figma node ID/export for the component being built — omit if no linked design>
Verify: <how to confirm behavior — see verify.md>
Model: <from config.yml model policy>
```

For FE tasks with a linked design, add "matches the design frame" as an acceptance item
alongside any enumerated tokens — tokens alone reproduce a real failure mode: a task can
hit every named color/spacing value and still not look like the design.

A subagent returns its result to the orchestrator; the orchestrator owns the checkpoint
and integration. Never let a subagent open the PR or transition Jira — those are
orchestrator-level, delegated to the tribe skills.
