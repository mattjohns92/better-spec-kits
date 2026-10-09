#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-$PWD}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FORCE="${FORCE:-0}"
INSTALL_CONSTITUTION="${INSTALL_CONSTITUTION:-0}"
[[ -d "$TARGET" ]] || { echo "Target project does not exist: $TARGET" >&2; exit 1; }
files=("speckit-design" "speckit-plan" "speckit-tasks" "speckit-implement")
for skill in "${files[@]}"; do
  src="$ROOT/skills/$skill/SKILL.md"; dst="$TARGET/.github/skills/$skill/SKILL.md"
  if [[ -e "$dst" && "$FORCE" != "1" ]]; then echo "Refusing to replace $dst. Re-run with FORCE=1." >&2; exit 1; fi
done
stamp="$(date +%Y%m%d-%H%M%S)"
for skill in "${files[@]}"; do
  src="$ROOT/skills/$skill/SKILL.md"; dst="$TARGET/.github/skills/$skill/SKILL.md"
  if [[ -e "$dst" ]]; then mkdir -p "$TARGET/.better-spec-kit-backup/$stamp/.github/skills/$skill"; cp "$dst" "$TARGET/.better-spec-kit-backup/$stamp/.github/skills/$skill/SKILL.md"; fi
  mkdir -p "$(dirname "$dst")"; cp "$src" "$dst"
done
if [[ "$INSTALL_CONSTITUTION" == "1" ]]; then
  dst="$TARGET/.specify/memory/constitution.md"
  if [[ -e "$dst" && "$FORCE" != "1" ]]; then echo "Refusing to replace $dst. Re-run with FORCE=1." >&2; exit 1; fi
  mkdir -p "$(dirname "$dst")"; cp "$ROOT/constitution/constitution.md" "$dst"
fi
echo "Better Spec Kit $(cat "$ROOT/VERSION") installed into $TARGET"
