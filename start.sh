#!/usr/bin/env bash
# Entry point for the docs site. Run ./start.sh for the dev server, or pass a
# task. Installs dependencies on a fresh clone so the first command works.
set -euo pipefail
cd "$(dirname "$0")"

REQUIRED_NODE_MAJOR=22

usage() {
  cat <<'TXT'
Usage: ./start.sh [task]

  dev       Development server on http://localhost:3000  (default)
  check     Typecheck, lint, and check formatting
  format    Rewrite files to the project's formatting
  build     Static export into out/
  preview   Serve the export through the Worker runtime
  deploy    Build, then deploy to docs.tryyewo.dev
TXT
}

require_node() {
  if ! command -v node >/dev/null; then
    echo "node is not installed. Install Node ${REQUIRED_NODE_MAJOR} or newer." >&2
    exit 1
  fi
  local major
  major="$(node --version | sed 's/^v\([0-9]*\).*/\1/')"
  if [ "$major" -lt "$REQUIRED_NODE_MAJOR" ]; then
    echo "Node $major is too old. Fumadocs needs ${REQUIRED_NODE_MAJOR} or newer." >&2
    exit 1
  fi
}

install_if_missing() {
  if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm ci
  fi
}

require_node
install_if_missing

case "${1:-dev}" in
  dev)     npm run dev ;;
  check)   npm run typecheck && npm run lint && npm run format:check ;;
  format)  npm run format ;;
  build)   npm run build ;;
  preview) npm run preview ;;
  deploy)  npm run deploy ;;
  -h | --help | help) usage ;;
  *)
    echo "Unknown task: $1" >&2
    echo >&2
    usage >&2
    exit 1
    ;;
esac
