#!/bin/sh
# Copy the files that make up the web app into <dest>.   sh tools/stage_web.sh <dest> [--no-xlsx]
# --no-xlsx leaves out the spreadsheet library (vendor/), used for the router package.
set -eu
DEST=${1:?destination dir}
ROOT=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$DEST/sounds"
for f in index.html ads.js about.js sounds.js dictionary.js; do
	cp "$ROOT/$f" "$DEST/$f"
done
cp "$ROOT"/sounds/*.mp3 "$DEST/sounds/" 2>/dev/null || true
if [ "${2:-}" != "--no-xlsx" ]; then
	mkdir -p "$DEST/vendor"
	cp "$ROOT"/vendor/* "$DEST/vendor/"
fi
