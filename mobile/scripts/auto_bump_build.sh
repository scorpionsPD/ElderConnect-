#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PUBSPEC_PATH="$MOBILE_DIR/pubspec.yaml"

if [[ ! -f "$PUBSPEC_PATH" ]]; then
  echo "pubspec.yaml not found at $PUBSPEC_PATH" >&2
  exit 1
fi

CURRENT_VERSION_LINE="$(grep -E '^version:\s' "$PUBSPEC_PATH" | head -n 1)"
if [[ -z "$CURRENT_VERSION_LINE" ]]; then
  echo "No version line found in pubspec.yaml" >&2
  exit 1
fi

if [[ ! "$CURRENT_VERSION_LINE" =~ ^version:[[:space:]]*([0-9]+\.[0-9]+\.[0-9]+)\+([0-9]+)$ ]]; then
  echo "Unsupported version format: $CURRENT_VERSION_LINE" >&2
  echo "Expected format: version: x.y.z+build" >&2
  exit 1
fi

BUILD_NAME="${BASH_REMATCH[1]}"
CURRENT_BUILD_NUMBER="${BASH_REMATCH[2]}"
NEXT_BUILD_NUMBER=$((CURRENT_BUILD_NUMBER + 1))
NEXT_VERSION="$BUILD_NAME+$NEXT_BUILD_NUMBER"

python3 - "$PUBSPEC_PATH" "$NEXT_VERSION" <<'PY'
import sys
from pathlib import Path

pubspec = Path(sys.argv[1])
next_version = sys.argv[2]
lines = pubspec.read_text().splitlines()
for index, line in enumerate(lines):
    if line.startswith('version:'):
        lines[index] = f'version: {next_version}'
        break
else:
    raise SystemExit('No version line found in pubspec.yaml')
pubspec.write_text('\n'.join(lines) + '\n')
PY

echo "Updated app version to $NEXT_VERSION"

if [[ "${1:-}" == "--build-ipa" ]]; then
  cd "$MOBILE_DIR"
  flutter build ipa --release
fi
