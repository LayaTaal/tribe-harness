# Platform mapping — Claude Code

The skills are written in terms of *actions*. This file maps those actions to the
concrete Claude Code mechanisms. Other platforms get their own file in this directory.

| Action in the skills                | Claude Code mechanism                                    |
|-------------------------------------|----------------------------------------------------------|
| Invoke a skill                      | `Skill` tool, or `/<name>` typed by the user             |
| Fetch / update a Jira ticket        | Atlassian MCP tools (`getJiraIssue`, `editJiraIssue`, `addCommentToJiraIssue`, `transitionJiraIssue`, `searchJiraIssuesUsingJql`) |
| Dispatch a subagent (with a model)  | `Agent` tool — set `subagent_type` and `model` (`opus`/`sonnet`/`haiku`/`fable`) |
| Run multiple subagents in parallel  | Multiple `Agent` calls in one message, or a `Workflow`   |
| Read / write files                  | `Read`, `Write`, `Edit`                                  |
| Run a command (lint/build/wp-cli)   | `Bash`                                                   |
| Browser verification + screenshots  | `playwright-cli` skill (or chrome devtools MCP)          |
| Stress-test a plan                  | Matt Pocock's `grill-me` skill                           |
| Hand off context                    | Matt Pocock's `handoff` skill                            |

## Delegations (kept tribe/Pocock skills — do not reimplement)

- Branching + PRs → `git-workflow`
- Testing instructions on Jira → `jira-testing-instructions`
- Creating/cleaning Jira tickets → `jira-ticket-standard`

## Model override

The `Agent` tool accepts a `model` parameter. The orchestrator reads `config.yml` and
passes the stage's model when dispatching. Stages mapped to `session` run inline (no
subagent) on whatever model the session was launched with — launch `/ticket` on Opus.

## Entry points

- `/ticket <TICKET-ID> [--demo]` → the orchestrator.
- `/estimate <TICKET-ID>` → the standalone estimation utility.
