#!/bin/sh
# Builds the OpenWrt LuCI package from the web files in the repo root.
#   openwrt/build.sh ipk <version> <outdir>   (opkg; OpenWrt <= 24.10)  - run as root (sudo) so files are owned by root
#   openwrt/build.sh apk <version> <outdir>   (apk-tools 3; OpenWrt >= 25.12) - needs the `apk` command (Alpine)
# The package is architecture independent (pure HTML/JS): one file serves every CPU architecture.
set -eu

MODE=${1:?mode: ipk|apk}
VER=${2:?version}
OUT=${3:?output dir}
REL=1
PKG=luci-app-monowordtest
URL=${MWT_URL:-https://github.com/Monoloshka/MonoWordTest}
MAINT=${MWT_MAINTAINER:-Monoloshka (Dmitriy Yakovenko)}
DESC="MonoWordTest - translation guessing game (LuCI: Services > MonoWordTest)"
IPKG_BUILD_URL="https://raw.githubusercontent.com/openwrt/openwrt/v24.10.0/scripts/ipkg-build"

HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(dirname "$HERE")
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$OUT"
OUT=$(cd "$OUT" && pwd)

# ---- stage the file tree exactly as it will be installed on the router ----
STAGE=$WORK/stage
mkdir -p "$STAGE"
cp -R "$HERE/files/." "$STAGE/"
WEB=$STAGE/www/luci-static/resources/monowordtest
mkdir -p "$WEB"
sh "$ROOT/tools/stage_web.sh" "$WEB" --no-xlsx
# Routers have little flash/RAM: ads are plain text links here, never images.
if [ -f "$ROOT/ads.text.js" ]; then
	cp "$ROOT/ads.text.js" "$WEB/ads.js"
elif command -v python3 >/dev/null 2>&1; then
	python3 "$ROOT/tools/build_ads.py" --text-only --out "$WEB/ads.js"
else
	echo "warning: no ads.text.js and no python3 - building without ads" >&2
	echo 'var MWT_ADS = [];' > "$WEB/ads.js"
fi
find "$STAGE" -type d -exec chmod 755 {} +
find "$STAGE" -type f -exec chmod 644 {} +
chmod 755 "$HERE/scripts/postinst.sh" "$HERE/scripts/postrm.sh"

case "$MODE" in
ipk)
	PKGDIR=$WORK/pkg
	mkdir -p "$PKGDIR/CONTROL"
	cp -R "$STAGE/." "$PKGDIR/"
	cat > "$PKGDIR/CONTROL/control" <<EOF
Package: $PKG
Version: $VER-r$REL
Depends: luci-base
Source: $URL
SourceName: $PKG
License: Unlicense
Section: luci
Maintainer: $MAINT
Architecture: all
Installed-Size: 0
Description: $DESC
EOF
	cp "$HERE/scripts/postinst.sh" "$PKGDIR/CONTROL/postinst"
	cp "$HERE/scripts/postrm.sh"   "$PKGDIR/CONTROL/postrm"
	chmod 755 "$PKGDIR/CONTROL/postinst" "$PKGDIR/CONTROL/postrm"
	chmod 644 "$PKGDIR/CONTROL/control"
	# OpenWrt's own packaging script (pinned to the 24.10.0 tag) - guarantees the exact .ipk layout
	if [ -n "${IPKG_BUILD:-}" ]; then cp "$IPKG_BUILD" "$WORK/ipkg-build"; else curl -fsSL -o "$WORK/ipkg-build" "$IPKG_BUILD_URL"; fi
	chmod +x "$WORK/ipkg-build"
	[ "$(id -u)" = 0 ] || echo "warning: not running as root - files inside the .ipk will not be owned by root" >&2
	"$WORK/ipkg-build" "$PKGDIR" "$OUT"
	;;
apk)
	command -v apk >/dev/null || { echo "apk command not found (run inside Alpine with apk-tools 3)" >&2; exit 1; }
	apk mkpkg \
		--info "name:$PKG" \
		--info "version:$VER-r$REL" \
		--info "description:$DESC" \
		--info "arch:noarch" \
		--info "license:Unlicense" \
		--info "origin:$PKG" \
		--info "url:$URL" \
		--info "maintainer:$MAINT" \
		--info "depends:luci-base" \
		--script "post-install:$HERE/scripts/postinst.sh" \
		--script "post-upgrade:$HERE/scripts/postinst.sh" \
		--script "post-deinstall:$HERE/scripts/postrm.sh" \
		--files "$STAGE" \
		--output "$OUT/$PKG-$VER-r$REL.apk"
	echo "Packaged into $OUT/$PKG-$VER-r$REL.apk"
	;;
*)
	echo "unknown mode: $MODE" >&2; exit 1 ;;
esac
