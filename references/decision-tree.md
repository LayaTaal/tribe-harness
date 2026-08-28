# Ticket workflow decision tree

The orchestrator (`skills/ticket`) is the only place stage order lives. Simple
tickets (<=3h) take a lighter path; complex tickets get brainstorming, a written
plan, subagent-driven development, and an independent review.

```dot
digraph ticket_workflow {
  rankdir=TB; node [shape=box, fontname="Helvetica"];
  start      [shape=oval, label="/ticket PROJ-123"];
  preflight  [label="Preflight required MCP servers"];
  depcheck   [shape=diamond, label="Atlassian/Jira MCP\navailable?"];
  dep_pause  [label="Stop and ask user to\nenable/configure server"];
  fetch      [label="Fetch ticket (Jira / Atlassian MCP)"];
  understand [label="Understand request\nFlag questions / missing scope / blockers"];
  blocked    [shape=diamond, label="Blockers or\nopen questions?"];
  pause      [label="Pause: surface to user\n(optionally comment Jira / ping PM)\nResolve before continuing"];
  assess     [label="Assess lane (reuses estimate core)"];
  confirm    [shape=diamond, label="Simple (<=3h) or Complex?\n(user confirms)"];

  brainstorm [label="brainstorm sub-skill\n-> plans/ID/brainstorm.md"];
  grill1     [label="(optional) grill-me on approach"];
  plan_c     [label="plan sub-skill -> plans/ID/plan.md"];
  grill2     [label="(optional) grill-me on plan"];
  plan_s     [label="Brief inline plan (no doc)"];

  develop    [label="Develop (refs/develop.md)\ntest-first where it fits;\nmatch project's existing testing"];
  verify     [label="Verify behavior (refs/verify.md)\nbrowser / API / WP-CLI"];
  gate       [label="Quality gate (refs/quality-gate.md)\nlint / build / test must pass"];
  gatecheck  [shape=diamond, label="Green?\n(<=2 fix attempts)"];
  review_c   [label="review sub-skill\nINDEPENDENT agent -> plans/ID/review.md"];
  review_s   [label="review sub-skill\nquick self-review"];
  satisfied  [shape=diamond, label="Satisfied?"];
  pr         [label="Open PR (delegate: tribe git-workflow)"];
  testing    [label="Testing instructions\n(delegate: tribe jira-testing-instructions)"];
  done       [shape=oval, label="Done"];

  start->preflight->depcheck;
  depcheck->fetch [label="yes"];
  depcheck->dep_pause [label="no"];
  dep_pause->preflight [label="after user resolves dependency"];
  fetch->understand->blocked;
  blocked->pause [label="yes"]; pause->understand;
  blocked->assess [label="no"]; assess->confirm;
  confirm->brainstorm [label="complex"];
  brainstorm->grill1->plan_c->grill2->develop;
  confirm->plan_s [label="simple"]; plan_s->develop;
  develop->verify;
  verify->gate->gatecheck;
  gatecheck->develop [label="no (fix; pause user if it persists)"];
  gatecheck->review_c [label="complex"]; gatecheck->review_s [label="simple"];
  review_c->satisfied; review_s->satisfied;
  satisfied->develop [label="no, iterate"]; satisfied->pr [label="yes"];
  pr->testing->done;
}
```

## Lane differences at a glance

| Stage        | Simple (<=3h)                | Complex                                  |
|--------------|------------------------------|------------------------------------------|
| Brainstorm   | skipped                      | `brainstorm.md`, optional grill-me       |
| Plan         | brief inline plan            | `plan.md` with discrete tasks            |
| Develop      | dedicated Sonnet developer subagent | subagent per task, review checkpoint |
| Quality gate | lint/build/test green (≤2 fix attempts, else pause) | same |
| Review       | self-review (escalates to independent agent if risk grows) | independent review agent → `review.md` |
| PR + testing | always (delegated to tribe)  | always (delegated to tribe)              |

The initial Jira dependency is checked before fetching any ticket. Other MCP-backed
dependencies are checked at the start of the stage that needs them and block that
stage when unavailable.

Complex-lane tickets can also pause and resume across sessions at a few points (after
plan approval, between develop task-checkpoints, before review, before PR) — see
`checkpoints.md`. `/ticket <ID>` checks for a `plans/<TICKET-ID>/status.md` resume cursor
before fetching from Jira.
