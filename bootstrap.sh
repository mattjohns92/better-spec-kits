#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-$PWD}"
REF="${BETTER_SPEC_KIT_REF:-main}"
[[ "$REF" =~ ^[a-zA-Z0-9._/-]+$ && "$REF" != *..* ]] || { echo 'Invalid Git ref' >&2; exit 1; }
TEMP="$(mktemp -d)"
trap 'rm -rf "$TEMP"' EXIT
if [[ "$REF" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then kind=tags; else kind=heads; fi
curl --fail --location --silent --show-error "https://github.com/mattjohns92/better-spec-kits/archive/refs/$kind/$REF.tar.gz" -o "$TEMP/archive.tar.gz"
mkdir "$TEMP/extracted"
tar -xzf "$TEMP/archive.tar.gz" -C "$TEMP/extracted"
installer="$(find "$TEMP/extracted" -mindepth 2 -maxdepth 2 -name install.sh -type f -print -quit)"
[[ -n "$installer" ]] || { echo 'Installer missing from downloaded archive' >&2; exit 1; }
bash "$installer" "$TARGET"
