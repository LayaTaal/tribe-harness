#!/usr/bin/env bash
set -euo pipefail

# Symlink the Tribe Harness skills into ~/.claude/skills (idempotent, non-destructive).
# Re-run anytime; it repoints stale links and refuses to clobber real files.

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${CLAUDE_HOME:-$HOME/.claude}"

link_dir() {
  local src_dir="$1" dst_dir="$2"
  mkdir -p "$dst_dir"
  for src in "$src_dir"/*; do
    name="$(basename "$src")"
    target="${src%/}"
    dst="$dst_dir/$name"

    if [ -L "$dst" ]; then
      if [ "$(readlink "$dst")" = "$target" ]; then
        echo "ok     $name (already linked)"
      else
        ln -sfn "$target" "$dst"
        echo "relink $name"
      fi
    elif [ -e "$dst" ]; then
      echo "SKIP   $name — a non-symlink already exists at $dst (remove it first)" >&2
    else
      ln -s "$target" "$dst"
      echo "link   $name"
    fi
  done
}

link_dir "$HARNESS_DIR/skills" "$CLAUDE_DIR/skills"
link_dir "$HARNESS_DIR/agents" "$CLAUDE_DIR/agents"

echo
echo "Done. Entry points: /ticket, /estimate, /handoff, /session-metrics."
echo "brainstorm, plan, review are invoked by the ticket orchestrator."
echo "Subagent roles: developer, reviewer, researcher, qa-design (see references/subagents.md)."
