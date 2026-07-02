#!/usr/bin/env bash
set -euo pipefail

# Symlink the Tribe Harness skills into ~/.claude/skills (idempotent, non-destructive).
# Re-run anytime; it repoints stale links and refuses to clobber real files.

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SRC="$HARNESS_DIR/skills"
SKILLS_DST="${CLAUDE_HOME:-$HOME/.claude}/skills"

mkdir -p "$SKILLS_DST"

for src in "$SKILLS_SRC"/*/; do
  name="$(basename "$src")"
  target="${src%/}"
  dst="$SKILLS_DST/$name"

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

echo
echo "Done. Entry points: /ticket, /estimate, /handoff, /demo."
echo "brainstorm, plan, review are invoked by the ticket orchestrator."
