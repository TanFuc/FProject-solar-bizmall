#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "Plesk build failed at line $LINENO: $BASH_COMMAND" >&2' ERR
root=$(cd "$(dirname "$0")/.." && pwd)
site=${BMSOLAR_SITE_URL:?Set BMSOLAR_SITE_URL to the production HTTPS URL}
smoke_db=${BMSOLAR_SMOKE_DB:?Set BMSOLAR_SMOKE_DB to a SQLite snapshot}
[[ "$site" =~ ^https://[A-Za-z0-9.-]+$ ]]
[[ "$(uname -s)-$(uname -m)" == Linux-x86_64 ]]
[[ "$(node -p 'process.versions.node.split(".")[0]')" == 22 ]]
out="$root/dist"
work=$(mktemp -d)
backend_pid= frontend_pid=
cleanup() {
  if [[ -n "$frontend_pid" ]]; then kill "$frontend_pid" 2>/dev/null || true; wait "$frontend_pid" 2>/dev/null || true; fi
  if [[ -n "$backend_pid" ]]; then kill "$backend_pid" 2>/dev/null || true; wait "$backend_pid" 2>/dev/null || true; fi
  [[ "$work" == /tmp/* ]] && rm -rf -- "$work"
}
trap cleanup EXIT
mkdir -p "$work/frontend" "$work/package/frontend" "$work/package/backend" "$out"
for name in package.json package-lock.json next.config.js tsconfig.json next-env.d.ts postcss.config.js postcss.config.mjs tailwind.config.ts tailwind.config.js src public tests; do
  [[ ! -e "$root/frontend/$name" ]] || cp -a "$root/frontend/$name" "$work/frontend/"
done
(
  cd "$root/backend"
  go test ./...
  CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags='-s -w' -o "$work/package/backend/bmsolar-api" ./cmd/server
)
api_port=${BMSOLAR_SMOKE_API_PORT:-13001}
web_port=${BMSOLAR_SMOKE_WEB_PORT:-13000}
api="http://127.0.0.1:$api_port"
web="http://127.0.0.1:$web_port"
wait_http() {
  for ((i=0; i<65; i++)); do
    if curl -fsS --max-time 2 "$1" >/dev/null 2>&1; then return; fi
    sleep 1
  done
  cat "$2" >&2
  return 1
}
node --experimental-sqlite -e '
  const { DatabaseSync, backup } = require("node:sqlite");
  const db = new DatabaseSync(process.argv[1], { readOnly: true });
  backup(db, process.argv[2]).then(() => db.close()).catch(error => { console.error(error.message); process.exitCode = 1; });
' "$(realpath "$smoke_db")" "$work/smoke.db"
(
  cd "$work"
  export APP_ENV=production BMSOLAR_BIND_ADDRESS=127.0.0.1 PORT="$api_port"
  export DATABASE_URL="sqlite://$work/smoke.db" WEB_PUBLIC_URL="$web" APP_BASE_URL="$api"
  export JWT_ACCESS_SECRET="$(node -p 'require("node:crypto").randomBytes(32).toString("hex")')"
  export JWT_REFRESH_SECRET="$(node -p 'require("node:crypto").randomBytes(32).toString("hex")')"
  export STORAGE_PROVIDER=local LOCAL_STORAGE_PATH="$work/storage" R2_ENABLED=false RATE_LIMIT_RPS=100
  exec "$work/package/backend/bmsolar-api"
) >"$work/api.log" 2>&1 &
backend_pid=$!
wait_http "$api/health/ready" "$work/api.log"
(
  cd "$work/frontend"
  export NEXT_TELEMETRY_DISABLED=1 BMSOLAR_STANDALONE=1
  export NEXT_PUBLIC_SITE_URL="$site" NEXT_PUBLIC_API_BASE_URL=/api/v1 BMSOLAR_BACKEND_URL="$api"
  npm ci --no-audit --no-fund
  npm run typecheck
  npm test
  npm run build
)
cp -a "$work/frontend/.next/standalone/." "$work/package/frontend/"
cp -a "$work/frontend/.next/static" "$work/package/frontend/.next/static"
cp -a "$work/frontend/public" "$work/package/frontend/public"
cat >"$work/package/frontend/app.cjs" <<'START'
process.env.HOSTNAME = '127.0.0.1';
if (!process.env.BMSOLAR_BACKEND_URL) throw new Error('Set BMSOLAR_BACKEND_URL');
require('./server.js');
START
printf '%s\n' '{"name":"bmsolar","private":true,"type":"commonjs","scripts":{"start":"node app.cjs"}}' >"$work/package/frontend/package.json"
cp "$root/deploy/plesk/"{bmsolar.service,backend.env.example,README.md} "$work/package/"
(
  cd "$work/package/frontend"
  export NODE_ENV=production PORT="$web_port" BMSOLAR_BACKEND_URL="$api"
  exec node app.cjs
) >"$work/frontend.log" 2>&1 &
frontend_pid=$!
wait_http "$web/" "$work/frontend.log"
for route in / /gioi-thieu /giai-phap /san-pham /du-an /tin-tuc /lien-he /admin /robots.txt /sitemap.xml /api/v1/public/site-shell; do
  curl -fsS --max-time 20 "$web$route" >"$work/response"
  if [[ "$route" == / ]]; then grep -Fq "rel=\"canonical\" href=\"$site" "$work/response"; fi
  if [[ "$route" == /robots.txt ]]; then grep -Fq "Sitemap: $site/sitemap.xml" "$work/response"; fi
done
curl -fsS --max-time 20 "$web/en" >"$work/english"
grep -q '<html lang="en"' "$work/english"
grep -Fq "rel=\"canonical\" href=\"$site/en\"" "$work/english"
curl -fsS "$api/api/v1/public/products?pageSize=1" >"$work/product"
product_slug=$(node -p 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).data[0]?.slug || ""' "$work/product")
if [[ -n "$product_slug" ]]; then
  curl -fsS --max-time 20 "$web/san-pham/$product_slug?lang=en" >"$work/product-en"
  grep -Fq "Technical specifications" "$work/product-en"
fi
asset=$(grep -oE '/_next/static/[^"]+\.(css|js)' "$work/english" | head -n 1 || true)
[[ -n "$asset" ]]
curl -fsS --max-time 20 "$web$asset" >/dev/null
[[ -z "$(find "$work/package" -type f \( -name '.env' -o -name '*.db' -o -name '*.log' \) -print -quit)" ]]
cp "$root/deploy/plesk/frontend.env.example" "$work/package/frontend/"
cp "$root/deploy/plesk/"{backend.env.example,bmsolar.service} "$work/package/backend/"
for component in frontend backend; do
  cp "$root/deploy/plesk/README.md" "$work/package/$component/README.md"
  archive="bmsolar-$component-plesk-linux-x64.zip"
  (
    cd "$work/package/$component"
    entries=(*)
    if [[ "$component" == frontend ]]; then entries+=(.next); fi
    python3 -m zipfile -c "$work/$archive" "${entries[@]}"
    python3 -m zipfile -t "$work/$archive"
  )
done
for component in frontend backend; do
  archive="bmsolar-$component-plesk-linux-x64.zip"
  mv -f "$work/$archive" "$out/$archive"
  (cd "$out" && sha256sum "$archive" >"$archive.sha256")
  echo "$out/$archive"
done
