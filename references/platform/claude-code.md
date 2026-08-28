# Platform mapping — Claude Code

The skills are written in terms of *actions*. This file maps those actions to the
concrete Claude Code mechanisms. Other platforms get their own file in this directory.

| Action in the skills                | Claude Code mechanism                                    |
|-------------------------------------|----------------------------------------------------------|
| Check required MCP availability     | Inspect the active tool/MCP inventory before the stage; fail closed if the named server/tools are absent |
| Invoke a skill                      | `Skill` tool, or `/<name>` typed by the user             |
| Fetch / update a Jira ticket        | Atlassian MCP tools (`getJiraIssue`, `editJiraIssue`, `addCommentToJiraIssue`, `transitionJiraIssue`, `searchJiraIssuesUsingJql`) |
| Dispatch a subagent (with a model)  | `Agent` tool — set `subagent_type` and `model` (`opus`/`sonnet`/`haiku`/`fable`) |
| Run multiple subagents in parallel  | Multiple `Agent` calls in one message, or a `Workflow`   |
| Dispatch by role                    | `Agent` tool, `subagent_type` = one of the harness's own roles (below) |
| Read / write files                  | `Read`, `Write`, `Edit`                                  |
| Run a command (lint/build/wp-cli)   | `Bash`                                                   |
| Browser verification + screenshots  | `playwright-cli` skill (or chrome devtools MCP)          |
| Stress-test a plan                  | Matt Pocock's `grill-me` skill                           |
| Hand off context                    | Matt Pocock's `handoff` skill                            |

## Dispatching by role

Tribe-harness ships its own subagent roles (`agents/`, symlinked to `~/.claude/agents` by
`install.sh`): `developer`, `reviewer`, `researcher`, `qa-design`. Dispatch with the `Agent` tool's
`subagent_type` set to the matching role name — never reference agent types from outside
this repo (e.g. project-local custom agents); they may not exist in every install.

Simple-lane implementation is fail-closed: after plan approval, dispatch exactly one
`developer` subagent with `models.develop`; the main session must not edit files. If the
Agent tool or requested model is unavailable, stop and report a protocol-invalid run.

## Delegations (kept tribe/Pocock skills — do not reimplement)

- Branching + PRs → `git-workflow`
- Testing instructions on Jira → `jira-testing-instructions`
- Creating/cleaning Jira tickets → `jira-ticket-standard`

## Model override

The `Agent` tool accepts a `model` parameter. The orchestrator reads `config.yml` and
passes the stage's model when dispatching. Stages mapped to `session` run inline (no
subagent) on whatever model the session was launched with — launch `/ticket` on Opus.
Simple-lane implementation is dispatched as one `developer` subagent with
`models.develop`, the same implementation policy used by complex-lane tasks.

## Entry points

- `/ticket <TICKET-ID>` → the orchestrator.
- `/estimate <TICKET-ID>` → the standalone estimation utility.

## MCP dependency gates

Before `/ticket` fetches a Jira ticket, verify that the Atlassian MCP server is
enabled and that the Jira read tools are available. If either check fails, stop
and ask the user to enable/configure the Atlassian MCP server; do not substitute
another API or command.

Check other MCP-backed capabilities at the start of the stage that needs them.
For example, browser or Figma MCP is required only when the verification or
design-review stage selects that capability, but an unavailable required server
still blocks that stage.
