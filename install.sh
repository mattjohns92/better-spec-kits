#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-$PWD}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FORCE="${FORCE:-0}"
INSTALL_CONSTITUTION="${INSTALL_CONSTITUTION:-0}"
SPECKIT_INITIALIZED=0
[[ -d "$TARGET/.specify" ]] && SPECKIT_INITIALIZED=1
[[ -d "$TARGET" ]] || { echo "Target project does not exist: $TARGET" >&2; exit 1; }
files=(".github/skills/speckit-design/SKILL.md" ".github/skills/speckit-plan/SKILL.md" ".github/skills/speckit-tasks/SKILL.md" ".github/skills/speckit-analyze/SKILL.md" ".github/skills/speckit-remediate/SKILL.md" ".github/skills/speckit-implement/SKILL.md" ".github/skills/speckit-review/SKILL.md" ".github/skills/speckit-summary/SKILL.md" ".github/skills/speckit-preview/SKILL.md" ".github/skills/speckit-scope/SKILL.md" ".github/skills/speckit-quick/SKILL.md" ".github/instructions/scope-handoffs.instructions.md")
if [[ "$INSTALL_CONSTITUTION" == "1" ]]; then files+=(".specify/memory/constitution.md"); fi
source_for_destination() {
  case "$1" in
    .github/skills/*) printf '%s/skills/%s' "$ROOT" "${1#.github/skills/}" ;;
    .github/instructions/*) printf '%s/instructions/%s' "$ROOT" "${1#.github/instructions/}" ;;
    .specify/memory/constitution.md) printf '%s/constitution/constitution.md' "$ROOT" ;;
    *) return 1 ;;
  esac
}
for dst in "${files[@]}"; do
  if [[ -e "$TARGET/$dst" && "$FORCE" != "1" ]]; then
    echo "Refusing to replace $TARGET/$dst. Set FORCE=1 to replace with backups." >&2; exit 1
  fi
done
stamp="$(date +%Y%m%d-%H%M%S)"
for dst in "${files[@]}"; do
  src="$(source_for_destination "$dst")"
  [[ -f "$src" ]] || { echo "Missing source $src" >&2; exit 1; }
done
for dst in "${files[@]}"; do
  src="$(source_for_destination "$dst")"
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
if [[ "$SPECKIT_INITIALIZED" == "1" ]]; then
  if ! command -v specify >/dev/null 2>&1; then
    echo 'Bug provisioning partial-success: specify is unavailable; install GitHub Spec Kit, then run Better Spec Kit update.' >&2
  elif ! command -v node >/dev/null 2>&1; then
    echo 'Bug provisioning partial-success: Node.js is unavailable to verify the upstream extension; Better Spec Kit remains installed.' >&2
  else
    if [[ ! -f "$ROOT/node_modules/yaml/package.json" ]]; then
      if ! command -v npm >/dev/null 2>&1; then
        echo 'Bug provisioning partial-success: npm is unavailable to load the manifest parser; Better Spec Kit remains installed.' >&2
      elif ! npm install --prefix "$ROOT" --no-save --package-lock=false --ignore-scripts --no-audit --no-fund; then
        echo 'Bug provisioning partial-success: could not prepare the manifest parser; Better Spec Kit remains installed.' >&2
      fi
    fi
    if [[ -f "$ROOT/node_modules/yaml/package.json" ]]; then
      node "$ROOT/bin/provision-bug.js" "$TARGET" || echo 'Bug provisioning partial-success: provisioner failed; Better Spec Kit remains installed.' >&2
    fi
  fi
fi
