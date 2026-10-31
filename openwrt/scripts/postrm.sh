#!/bin/sh
# Make LuCI notice the new menu entry / ACL. Does nothing when installing into an image root.
[ -n "${IPKG_INSTROOT}" ] && exit 0
if [ -x /etc/init.d/rpcd ]; then
	rm -f /tmp/luci-indexcache /tmp/luci-indexcache.* 2>/dev/null
	rm -rf /tmp/luci-modulecache 2>/dev/null
	/etc/init.d/rpcd reload >/dev/null 2>&1
fi
exit 0
