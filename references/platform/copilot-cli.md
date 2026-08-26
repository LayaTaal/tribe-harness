# Platform mapping — Copilot CLI  (STUB — not yet built/verified)

Placeholder for a future Copilot CLI adapter. The skills are authored platform-neutral
(actions, not tool names), so enabling Copilot CLI is a mapping exercise, not a rewrite.

To complete this later, fill in the Copilot CLI equivalent for each action:

| Action in the skills               | Copilot CLI mechanism            |
|------------------------------------|----------------------------------|
| Invoke a skill                     | TODO (`skill` tool / auto-discovery) |
| Fetch / update a Jira ticket       | TODO (MCP server availability)   |
| Dispatch a subagent (with a model) | TODO; simple-lane implementation must use `models.simple_develop` |
| Run subagents in parallel          | TODO                             |
| Read / write files                 | TODO                             |
| Run a command                      | TODO                             |
| Browser verification               | TODO                             |
| Model override per stage           | TODO; preserve separate planning and simple-development model settings |
| Entry points (/ticket, /estimate)  | TODO                             |

Open questions to resolve before relying on Copilot CLI:
- MCP parity for Jira (Atlassian) and browser tooling.
- Subagent dispatch + per-subagent model selection support.
- How slash-style entry points are exposed.

Until model-specific dispatch is implemented, a Copilot CLI adapter must not claim to
apply `models.simple_develop`; it should use the documented platform fallback and report
that the lower-cost model could not be selected.

Copilot **Desktop** app support is weaker than the CLI and is treated as best-effort.
