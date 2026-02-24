#!/bin/sh
set -e

HTDOCS="/usr/share/nginx/html/postguard"

: "${VITE_PKG_URL:=/pkg}"

echo "Substituting SPA environment variables..."
echo "  VITE_PKG_URL=${VITE_PKG_URL}"
echo "  VITE_FILEHOST_URL=${VITE_FILEHOST_URL}"

find "${HTDOCS}" -name '*.js' -type f -exec sed -i \
    -e "s|__VITE_PKG_URL_PLACEHOLDER__|${VITE_PKG_URL}|g" \
    -e "s|__VITE_FILEHOST_URL_PLACEHOLDER__|${VITE_FILEHOST_URL}|g" \
    {} +

echo "SPA environment variable substitution complete."
