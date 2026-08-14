#!/bin/sh
set -eu

mkdir -p /backups

while true; do
  timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
  pg_dump --format=custom --file="/backups/eye-gym-${timestamp}.dump"
  find /backups -type f -name 'eye-gym-*.dump' -mtime "+${BACKUP_RETENTION_DAYS}" -delete
  sleep 86400
done
