#!/bin/sh
set -eu

mkdir -p /backups

while true; do
  timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
  final="/backups/eye-gym-${timestamp}.dump"
  tmp="/backups/.eye-gym-${timestamp}.dump.tmp"

  if pg_dump --format=custom --file="$tmp"; then
    mv "$tmp" "$final"
    find /backups -type f -name 'eye-gym-*.dump' -mtime "+${BACKUP_RETENTION_DAYS}" -delete
    sleep 86400
  else
    rm -f "$tmp"
    sleep 30
  fi
done
