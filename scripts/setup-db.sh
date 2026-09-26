#!/usr/bin/env bash
# Sets up the UrbanResQ MySQL database locally (non-Docker path).
# Usage: ./scripts/setup-db.sh [mysql_user] [mysql_password]
set -e

USER="${1:-root}"
PASS="${2:-}"
DB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../database" && pwd)"

MYSQL_ARGS=(-u "$USER")
if [ -n "$PASS" ]; then
  MYSQL_ARGS+=(-p"$PASS")
fi

echo "==> Creating schema"
mysql "${MYSQL_ARGS[@]}" < "$DB_DIR/schema.sql"

echo "==> Loading functions"
mysql "${MYSQL_ARGS[@]}" urbanresq < "$DB_DIR/functions.sql"

echo "==> Loading procedures"
mysql "${MYSQL_ARGS[@]}" urbanresq < "$DB_DIR/procedures.sql"

echo "==> Loading triggers"
mysql "${MYSQL_ARGS[@]}" urbanresq < "$DB_DIR/triggers.sql"

echo "==> Loading views"
mysql "${MYSQL_ARGS[@]}" urbanresq < "$DB_DIR/views.sql"

echo "==> Loading seed data"
mysql "${MYSQL_ARGS[@]}" urbanresq < "$DB_DIR/seed.sql"

echo "==> Seeding demo users (bcrypt-hashed passwords via Node)"
(cd "$(dirname "${BASH_SOURCE[0]}")/../backend" && npm run db:seed:users)

echo "==> Done. Demo password for all accounts: UrbanResQ@2026"
