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
install.sh     # symlink skills into ~/.copilot/skills
```

## Install

### Claude Code / Claude Desktop (Code tab) — plugin

```
/plugin marketplace add LayaTaal/tribe-harness
/plugin install tribe-harness@tribe-harness
```

Or from a local checkout (also the way to develop it):

```bash
claude plugin marketplace add /path/to/tribe-harness
claude plugin install tribe-harness@tribe-harness
# or, for a single session without installing:
claude --plugin-dir /path/to/tribe-harness
```

Run `/reload-plugins` (or restart) afterwards. Skills are namespaced
(`/tribe-harness:ticket`); the bare `/ticket` works while no other skill shares the name.
The Claude Desktop chat and Cowork tabs don't load Claude Code plugins.

### Copilot CLI — symlinks

```bash
./install.sh
```

Symlinks the skills and agents into `~/.copilot/skills` and `~/.copilot/agents`.
Set `COPILOT_HOME` to override the destination. Re-running the installer repoints
existing Tribe Harness links and removes stale links from this repository while
preserving regular files and unrelated symlinks. It does not modify Claude or
plugin-managed directories. Restart Copilot after installing so the session
reloads the skill inventory.

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
`references/platform/`. The installer targets Copilot CLI skill and agent discovery.
The full Copilot CLI workflow adapter remains a mapping task; see
`references/platform/copilot-cli.md`. Copilot Desktop is best-effort.

## Roadmap

See [`ROADMAP.md`](ROADMAP.md) for parked features and ideas (parallel tickets, triage
routines, a Copilot CLI adapter, team promotion).
