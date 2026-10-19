#!/usr/bin/env bash
# Uses the existing server-side Compose file and runtime environment.
set -Eeuo pipefail
umask 077
app_dir=${1:?app directory required}
service=${2:?compose service required}
image=${3:?image digest required}
[[ "$service" =~ ^portfolio-(cms|website|website-ethereal)$ ]] || exit 2
[[ "$image" =~ ^ghcr\.io/trinhxuantam/$service@sha256:[a-f0-9]{64}$ ]] || exit 2
[[ "$app_dir" == "/home/ubuntu/apps/${service//-/_}" ]] || exit 2
cd "$app_dir"
# Also protects against another deployment launched directly on the VPS.
exec 9>.deploy.lock
flock -w 600 9
base=(docker compose -f docker-compose.yml)
release=.compose.release.yml
compose=("${base[@]}" -f "$release")

# Fail before pulling/restarting if secrets have not been moved to runtime.
"${base[@]}" config --format json | python3 -c '
import json,sys
service=sys.argv[1]
env=json.load(sys.stdin)["services"][service].get("environment",{})
required={
 "portfolio-cms": ["APP_KEYS","ADMIN_JWT_SECRET","API_TOKEN_SALT","JWT_SECRET","DATABASE_CLIENT","DATABASE_HOST","DATABASE_NAME","DATABASE_USERNAME","DATABASE_PASSWORD","SERVICE_ACCOUNT","STORAGE_BUCKET_URL"],
 "portfolio-website": ["SMTP_HOST","SMTP_PORT","SMTP_USERNAME","SMTP_PASSWORD","NEXT_PUBLIC_CMS_URL"],
 "portfolio-website-ethereal": []
}[service]
missing=[key for key in required if not env.get(key)]
if missing:
 print("Missing runtime variables: " + ", ".join(missing), file=sys.stderr)
 sys.exit(1)
' "$service"

container=$("${base[@]}" ps -q "$service")
[[ -n "$container" ]] || { echo 'Expected a running previous release for rollback.' >&2; exit 1; }
old_image=$(docker inspect --format '{{.Image}}' "$container")
rollback="local/$service:rollback"
docker image tag "$old_image" "$rollback"
# Pull must succeed before changing the running service or release override.
docker pull "$image"
write_release() {
  printf 'services:\n  %s:\n    image: %s\n' "$service" "$1" > "$release.tmp"
  mv "$release.tmp" "$release"
}
recover() {
  trap - ERR INT TERM
  echo 'Deployment failed; restoring the previous local image.' >&2
  write_release "$rollback"
  if "${compose[@]}" up -d --no-deps --pull never --wait --wait-timeout 180 "$service"; then
    echo 'Previous image restored. Database changes are not reverted.' >&2
  else
    echo 'ROLLBACK FAILED: manual intervention required.' >&2
  fi
  exit 1
}
trap recover ERR INT TERM
write_release "$image"
"${compose[@]}" up -d --no-deps --pull never --wait --wait-timeout 180 "$service"
trap - ERR INT TERM
printf 'Deployed %s\nPrevious image: %s\n' "$image" "$old_image"
# Keep both images; do not prune here. Rollback cannot undo schema/data migrations.
