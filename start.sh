#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v bun >/dev/null 2>&1; then
  echo "[start.sh] Bun is required but not installed."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "[start.sh] Docker is required but not installed."
  exit 1
fi

if [[ ! -f ".env" ]]; then
  cp .env.example .env
  echo "[start.sh] Created .env from .env.example. Please review values, then re-run ./start.sh"
  exit 0
fi

set -a
source ./.env
set +a

echo "[start.sh] Starting Postgres and Redis..."
docker compose up -d postgres redis

echo "[start.sh] Installing dependencies..."
bun install

echo "[start.sh] Preparing database..."
bun run db:generate
bun run db:migrate
bun run db:seed

echo "[start.sh] Launching web and worker..."
cleanup() {
  echo
  echo "[start.sh] Stopping background services..."
  kill "$WEB_PID" "$WORKER_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

bun run --filter @mark8/web dev &
WEB_PID=$!

bun run --filter @mark8/worker dev &
WORKER_PID=$!

wait "$WEB_PID" "$WORKER_PID"