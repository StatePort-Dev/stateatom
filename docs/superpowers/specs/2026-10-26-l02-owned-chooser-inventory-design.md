# L02.17 owned chooser inventory

L02.16 clicked the normal button but timed out before finding a Chrome-owned dialog.
No complete window inventory exists. Portal/keyring log activation is not root cause.
This bounded diagnostic collects the missing facts with one new launch and one click;
it does not retry model acquisition or the exhausted old case.

Collect only windows in authenticated owned nested X11 (max32), their titles (bounded),
PID/process identity where exposed and current focus. Missing PID/title/focus is explicit
Unknown; never infer ownership from title. Read /proc environment only for known owned
processes and retain DISPLAY/DBUS_SESSION_BUS_ADDRESS/XAUTHORITY keys only. Never emit
full environments. Private D-Bus owner PID query is allowed only after daemon UID,
executable and launcher ancestry match; inspect fixed portal/keyring names without
activating services. A service PID is a fact, not permission to input or kill it.

Three snapshot phases: before button, after2seconds, after6seconds; actual elapsed
values retained, no hard scheduling guarantee. Screenshot exact private1100x1000
screen only. If ownership/scope fails, stop/refuse; missing individual metadata is
Unknown with error. One native-run marker. No folder or credential input, install,
LanguageModel availability/create/prompt, evaluator, download request, new trust or
personal desktop. Driver absence of model calls does not prove browser background
activity absence. Reuse mutable owned cache with exclusive lease; no pinned model claim.

Current82/327 product bytes and historical evidence remain unchanged. New code is
research harness only. Source controls/native inventory/model usefulness/full L02
are distinct. Complete diagnostic does not require a chooser to exist and does not
establish successful installation. Independent cleanup for known browser/launcher/
desktop and lease, with exact process start/exe/UID guards. Unknown other descendants
remain unknown. A subsequent actionable fix needs the actual saved inventory.

References: GLib docs/reference/gio/gdbus.rst (Context7 /gnome/glib): --address,
--dest,--object-path,--method, GVariant results; installed gdbus call --help.
No --interactive,--session,--system or methods that activate/mutate services.

Primary D-Bus specification checked: https://dbus.freedesktop.org/doc/dbus-specification.html#bus-messages-get-connection-unix-process-id . The method returns the PID of an existing connection; service activation uses separate methods. Installed xdotool manpage documents --maxdepth1 for top-level windows on the bare nested X server.
