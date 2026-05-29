#!/usr/bin/env bash
set -euo pipefail

# One-shot prod curriculum seeding into the configured DB.
#
# Purpose:
# - Render free tier often OOM/crashes when seeding the full Grade 6 curriculum on startup.
# - This script runs the same seeding logic from your machine (more RAM) against Aiven MySQL.
#
# Required env vars:
# - SPRING_DATASOURCE_URL
# - SPRING_DATASOURCE_USERNAME
# - SPRING_DATASOURCE_PASSWORD
# - REDIS_URL (can be any valid URL; seeder doesn't require Redis but prod profile validates it)
#
# Optional:
# - APPLICATION_SECURITY_ADMIN_PASSWORD (defaults random)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/BackEnd"

if [[ -z "${SPRING_DATASOURCE_URL:-}" || -z "${SPRING_DATASOURCE_USERNAME:-}" || -z "${SPRING_DATASOURCE_PASSWORD:-}" ]]; then
  echo "Missing SPRING_DATASOURCE_* env vars." >&2
  exit 1
fi
if [[ -z "${REDIS_URL:-}" ]]; then
  echo "Missing REDIS_URL env var (prod profile validates it)." >&2
  exit 1
fi

export SPRING_PROFILES_ACTIVE=prod
export APPLICATION_PROD_SEED_CURRICULUM_ENABLED=true

./mvnw -q -DskipTests spring-boot:run

