#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-$PWD}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FORCE="${FORCE:-0}"
INSTALL_CONSTITUTION="${INSTALL_CONSTITUTION:-0}"
[[ -d "$TARGET" ]] || { echo "Target project does not exist: $TARGET" >&2; exit 1; }
files=(".github/skills/speckit-design/SKILL.md" ".github/skills/speckit-plan/SKILL.md" ".github/skills/speckit-tasks/SKILL.md" ".github/skills/speckit-analyze/SKILL.md" ".github/skills/speckit-implement/SKILL.md")
if [[ "$INSTALL_CONSTITUTION" == "1" ]]; then files+=(".specify/memory/constitution.md"); fi
for dst in "${files[@]}"; do
  if [[ -e "$TARGET/$dst" && "$FORCE" != "1" ]]; then
    echo "Refusing to replace $TARGET/$dst. Set FORCE=1 to replace with backups." >&2; exit 1
  fi
done
stamp="$(date +%Y%m%d-%H%M%S)"
for dst in "${files[@]}"; do
  if [[ "$dst" == ".specify/memory/constitution.md" ]]; then src="$ROOT/constitution/constitution.md"; else src="$ROOT/skills/${dst#'.github/skills/'}"; fi
  [[ -f "$src" ]] || { echo "Missing source $src" >&2; exit 1; }
done
for dst in "${files[@]}"; do
  if [[ "$dst" == ".specify/memory/constitution.md" ]]; then src="$ROOT/constitution/constitution.md"; else src="$ROOT/skills/${dst#'.github/skills/'}"; fi
  if [[ -e "$TARGET/$dst" ]]; then
    mkdir -p "$TARGET/.better-spec-kit-backup/$stamp/$(dirname "$dst")"
    cp "$TARGET/$dst" "$TARGET/.better-spec-kit-backup/$stamp/$dst"
  fi
  mkdir -p "$TARGET/$(dirname "$dst")"
  cp "$src" "$TARGET/$dst"
done
mkdir -p "$TARGET/.specify"
printf '{"name":"better-spec-kit","version":"%s","constitutionInstalled":%s}\n' "$(cat "$ROOT/VERSION")" "$([[ "$INSTALL_CONSTITUTION" == "1" ]] && echo true || echo false)" > "$TARGET/.specify/better-spec-kit.json"
echo "Better Spec Kit $(cat "$ROOT/VERSION") installed into $TARGET"
