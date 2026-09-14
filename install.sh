#!/usr/bin/env bash
set -euo pipefail

# Symlink the Tribe Harness skills into ~/.copilot/skills (idempotent, non-destructive).
# Re-run anytime; it repoints harness links and removes stale harness links.

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COPILOT_DIR="${COPILOT_HOME:-$HOME/.copilot}"

normalize_remote() {
  local remote="$1"

  remote="${remote%.git}"
  case "$remote" in
    git@github.com:*) remote="${remote#git@github.com:}" ;;
    http://github.com/*) remote="${remote#http://github.com/}" ;;
    https://github.com/*) remote="${remote#https://github.com/}" ;;
    ssh://git@github.com/*) remote="${remote#ssh://git@github.com/}" ;;
  esac

  printf '%s\n' "$remote"
}

repository_id() {
  local repo_root="$1" remote common_dir

  remote="$(git -C "$repo_root" remote get-url origin 2>/dev/null || true)"
  if [ -n "$remote" ]; then
    normalize_remote "$remote"
    return
  fi

  common_dir="$(git -C "$repo_root" rev-parse --git-common-dir 2>/dev/null || true)"
  if [ -n "$common_dir" ]; then
    if [[ "$common_dir" != /* ]]; then
      common_dir="$repo_root/$common_dir"
    fi
    (cd -P "$common_dir" && pwd)
  fi
}

HARNESS_ROOT="$(git -C "$HARNESS_DIR" rev-parse --show-toplevel 2>/dev/null || printf '%s' "$HARNESS_DIR")"
HARNESS_REPOSITORY_ID="$(repository_id "$HARNESS_ROOT")"

resolve_link_target() {
  local dst="$1" target base_dir

  target="$(readlink "$dst")"
  if [[ "$target" == /* ]]; then
    printf '%s\n' "$target"
    return
  fi

  base_dir="$(cd -P "$(dirname "$dst")" && pwd)"
  printf '%s/%s\n' "$base_dir" "$target"
}

is_harness_link() {
  local dst="$1" target target_root target_repository_id

  target="$(resolve_link_target "$dst")"
  target_root="$(git -C "$(dirname "$target")" rev-parse --show-toplevel 2>/dev/null || true)"
  [ -n "$target_root" ] || return 1

  target_repository_id="$(repository_id "$target_root")"
  [ -n "$HARNESS_REPOSITORY_ID" ] &&
    [ "$target_repository_id" = "$HARNESS_REPOSITORY_ID" ]
}

remove_stale_links() {
  local src_dir="$1" dst_dir="$2"
  local dst name

  for dst in "$dst_dir"/*; do
    [ -L "$dst" ] || continue

    name="$(basename "$dst")"
    [ -e "$src_dir/$name" ] && continue

    if is_harness_link "$dst"; then
      rm "$dst"
      echo "remove $name (stale harness link)"
    fi
  done
}

link_dir() {
  local src_dir="$1" dst_dir="$2"
  local src name target dst

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

  remove_stale_links "$src_dir" "$dst_dir"
}

echo "=== Copilot CLI (~/.copilot) ==="
link_dir "$HARNESS_DIR/skills" "$COPILOT_DIR/skills"
link_dir "$HARNESS_DIR/agents" "$COPILOT_DIR/agents"

echo
echo "Done. Entry points: /ticket, /estimate, /handoff, /session-metrics."
echo "brainstorm, plan, review are invoked by the ticket orchestrator."
echo "Subagent roles: developer, reviewer, researcher, qa-design (see references/subagents.md)."
