#!/bin/sh
set -e

HTDOCS="/usr/share/nginx/html/postguard"

echo "Substituting SPA environment variables..."
echo "  VITE_FILEHOST_URL=${VITE_FILEHOST_URL}"

find "${HTDOCS}" -name '*.js' -not -name 'config.js' -type f -exec sed -i \
    -e "s|__VITE_FILEHOST_URL_PLACEHOLDER__|${VITE_FILEHOST_URL}|g" \
    {} +

echo "SPA environment variable substitution complete."
