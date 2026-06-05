#!/usr/bin/env bash
# Backup diario de la BD reuso (VPS). Cron ejemplo en docs/DEPLOY-WORKFLOW.md
set -euo pipefail

ROOT="${REUSO_ROOT:-/var/www/reuso}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/reuso}"
KEEP_DAYS="${KEEP_DAYS:-14}"

cd "$ROOT"
mkdir -p "$BACKUP_DIR"

stamp="$(date +%Y%m%d_%H%M%S)"
out="$BACKUP_DIR/reuso_${stamp}.sql.gz"

docker compose exec -T postgres pg_dump -U postgres reuso | gzip > "$out"
find "$BACKUP_DIR" -name 'reuso_*.sql.gz' -mtime +"$KEEP_DAYS" -delete

echo "backup ok: $out"
