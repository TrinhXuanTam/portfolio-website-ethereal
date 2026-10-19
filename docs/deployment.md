# Oracle VPS deployment

Pull requests build the production Docker image on an ARM64 runner without production secrets. Main builds publish a commit tag and deploy the returned immutable digest. Releases are serialized, use a verified SSH host key, and wait for the container HTTP health check. Failure restores the previous local image. PostgreSQL, proxy services and other apps are not restarted.

## Before merging / enabling production

- Confirm `VPS_HOST`, `VPS_USERNAME` (normally `ubuntu`) and `VPS_SSH_KEY` point to the Oracle instance. The key must permit Docker commands and writes under `/home/ubuntu/apps`. Port 22 is used.
- Create a GitHub `production` environment and configure any desired approval/branch rules. Use main for production.
- Grant this repository Actions access to its existing GHCR package (package Settings → Manage Actions access). Publishing now uses `GITHUB_TOKEN` with `packages: write`; no publishing PAT is needed. If the package is private, the VPS still needs a separate read-only GHCR login.
- Preserve the existing server `docker-compose.yml`, networks, ports and `.env`. Supply runtime secrets through Compose `environment` or `env_file`; this workflow deliberately never bakes them into the image. The deployment script checks required variable names without printing values.
- For the Next.js app, add SMTP_HOST, SMTP_PORT, SMTP_USERNAME and SMTP_PASSWORD to its server-side runtime environment before deployment. They were absent during inspection. NEXT_PUBLIC_CMS_URL must also be present at runtime.
- Public frontend CMS URLs are build arguments controlled by repository variables NEXT_PUBLIC_CMS_URL / VITE_CMS_URL. Defaults match the VPS build changes: https://cms.trinhxuantam.com. The Next.js build can require the CMS to be reachable.
- The committed public SSH key was obtained through the existing trusted `ssh oracle-vps` connection. Review/update it when the instance's host key changes.

## Operations and rollback

The active digest is saved in `.compose.release.yml` beside the server Compose file. Always include that override for manual app operations:

```sh
docker compose -f docker-compose.yml -f .compose.release.yml up -d --no-deps --wait SERVICE
```

A failed deployment automatically restores `local/SERVICE:rollback`, which points to the previous local image. For a later manual rollback, put that image in `.compose.release.yml`, then run the same command above. Replace SERVICE with this repository's Compose service name. Do not prune rollback images until the release is accepted.

Rollback covers the container image only, not database/schema changes; back up PostgreSQL before CMS releases involving migrations. Single-container replacement can cause brief downtime. Health checks test the app inside its container; verify public routing and key features after release.

## Validation

Run `bash -n scripts/deploy.sh`, actionlint on the workflow, and the pull request ARM64 build. Do not merge a failed image build. A full deployment and rollback drill is still needed before calling this production-validated.
