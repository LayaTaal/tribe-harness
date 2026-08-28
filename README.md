# Tribe Harness

A personal, self-contained workflow for taking Modern Tribe Jira tickets through their
full lifecycle — **collaboratively**. It drives the work with you (understand →
brainstorm → plan → develop → verify → review → PR → testing instructions), pushes back
when something looks wrong, reviews critically, and delegates to the company conventions
worth keeping. It is *not* an autopilot.

## Design in one breath

One ambient orchestrator (`/ticket`) drives a decision tree and explicitly invokes a few
sub-skills; nothing else auto-triggers, so skills never compete. Simple tickets (<=3h)
take a light path; complex tickets get brainstorming, a written plan, subagent-driven
development, and an independent review.

Before `/ticket` fetches anything, it verifies that the Atlassian/Jira MCP
server and required Jira read tools are enabled. Missing dependencies stop the
workflow with a request to enable/configure the server; later-stage MCP
dependencies are checked when their stage is reached rather than worked around.

```
skills/
  ticket/      # /ticket — the orchestrator (only ambient workflow entry)
  estimate/    # /estimate — standalone, read-only time estimate
  session-metrics/ # /session-metrics — record and compare Claude Code usage
  brainstorm/  # invoked by ticket (complex lane)
  plan/        # invoked by ticket
  review/      # invoked by ticket (independent agent on complex lane)
  handoff/     # /handoff — writes a resume doc to the project's .scratch/
references/    # develop, verify, subagents, file-organization,
               # checkpoints, decision-tree, platform/*  (read by the orchestrator)
config.yml     # model policy + defaults
install.sh     # symlink skills into ~/.claude/skills
```

## Install

```bash
./install.sh
```

Symlinks the skills into `~/.claude/skills`. Launch your session on **Opus** (the
"think" stages and orchestration use the session model; implementation is dispatched to
Sonnet subagents — see `config.yml`).

## Usage

```
/ticket PROJ-123            # work a ticket end-to-end
/estimate PROJ-123          # just estimate it (read-only)
```

The orchestrator assesses simple vs complex and asks you to confirm before working.
Simple-lane implementation is delegated to one developer subagent using the
`models.develop` policy, so it does not reuse the planning model.

## What it keeps vs replaces

**Keeps (delegates to — do not reimplement):**
- Tribe `git-workflow` (branches/PRs), `jira-ticket-standard` (writing tickets),
  `jira-testing-instructions` (QA steps on Jira).
- Matt Pocock's `grill-me` (already symlinked in `~/.agents/skills`).
- Jira access via the Atlassian MCP.

**Replaces:**
- Matt Pocock's `handoff` — superseded by this harness's own `handoff` (writes to the
  project's `.scratch/`; invoked manually or proactively after large chunks of work).
- `ticket-autopilot` — superseded by this collaborative orchestrator.
- The Superpowers plugin — its per-ticket-relevant behavior is folded into this
  harness's skills + references.

## Non-goals

- **Not an autopilot.** No spec-to-merged-PR autonomy. The user approves before code is
  written and before any Jira write or PR — always. The quality gate
  (`references/quality-gate.md`) gives review/PR a green baseline and stops after two
  failed fix attempts; it does **not** auto-merge or remove a human checkpoint. The whole
  point of the harness is a collaborative partner, not a hands-off pipeline.

## Migration (staged, low-risk)

1. `./install.sh`, then run a few real tickets through `/ticket`.
2. Stop using `ticket-autopilot` (uninstall locally; flag team deprecation separately).
3. When confident, disable the Superpowers plugin. Be aware that drops, among others:
   `systematic-debugging`, `test-driven-development`, `verification-before-completion`,
   `executing-plans`, `subagent-driven-development`, `writing-skills`, worktree helpers.
   The per-ticket flow's needs live here (`references/develop.md`, `verify.md`,
   `subagents.md`); port anything else **as you miss it**. `grill-me` survives (separate
   symlink); `handoff` now lives in this harness.

## Portability

Skills are written in terms of *actions*, not tool names; platform specifics live in
`references/platform/`. v1 is built and verified on **Claude Code**. A `copilot-cli.md`
stub is in place so a Copilot CLI adapter is a mapping task, not a rewrite. Copilot
Desktop is best-effort.

## Roadmap

See [`ROADMAP.md`](ROADMAP.md) for parked features and ideas (parallel tickets, triage
routines, a Copilot CLI adapter, team promotion).
