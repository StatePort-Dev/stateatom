# P03 HTTPS/native-permission test environment

This is Linux/Chrome153 agent-operated environment qualification, not complete
corporate-artifact acceptance. The recorded results and boundaries are in
[completion83](../completion/83-p03-https-artifact-access.md).

## Native optional-origin prompt

Use an exact immutable Atom handoff, not a rebuilt historical tarball:

```sh
node tests/integration/source-access-environment.mjs <exact-atom-handoff.json>
```

The finite driver requires the already-installed Chrome-for-Testing153, Xephyr,
xdotool and ffmpeg. It opens one nested1100×900 X display, two disposable Chrome
profiles in sequence, and the public `https://example.com` page. It operates the
existing Allow site button and the actual browser-owned Deny/Allow dialog; it
never preapproves or replaces the permission API. Recorded native button geometry
is scoped to this Chrome major/window setup and must be requalified after change.
One second lets the native dialog finish appearing before input; these timings
are not V02 measurements. Both hosts must refuse denial, attach read-only after
grant, leave another artifact origin ungranted and invalidate attach on actual
`permissions.remove`. No page account or mutation grant is used.

The explicit `headless:false, display` native-browser option disconnects the
shared desktop D-Bus and disables GTK portal use for that child only. Native file
choosers then stay within the nested display. Default existing headless callers
are unchanged. The driver closes its own browsers/display; no working windows or
shared browser profile is controlled.

## Trusted local HTTPS fixture

```sh
node tests/helpers/source-access-tls-fixture.mjs
```

This creates a unique private `.artifacts/p03/tls-probe/<timestamp>` directory,
root/server keys and a two-day localhost certificate, then serves a small HTTPS
page. It prints URLs, root path and public SHA-256 fingerprint; it installs no
certificate. Keys remain local ignored artifacts. Stop this one fixture process
when done.

On a disposable headed Chrome profile/display only:

1. Open the printed localhost URL before adding trust. Assert an actual privacy
   error and no application HTTP request at the server.
2. Open `chrome://certificate-manager/localcerts/usercerts`. Under **Trusted
   Certificates**, choose **Import**, select that run's root.pem and use the
   visible **Open** button. If using the native GTK chooser on a nested display,
   explicitly focus its own XID before entering the absolute filename.
3. Verify the displayed root name/fingerprint. Reload localhost normally; assert
   the actual fixture page and server request. Do not click through an interstitial
   or use any ignore-certificate/SPKI/security override.
4. Open the printed127.0.0.2 URL, absent from SAN. Assert the privacy error and
   no application request for that host even though the root is trusted.
5. Close the disposable browser. Read its own `Default/ServerCertificate` database
   read-only to verify a single root with the expected DER SHA-256; preserve the
   profile as local evidence. Do not edit the shared NSS/user/system trust store.

The primary [Chromium database implementation](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/components/server_certificate_database/server_certificate_database_service.cc)
binds this certificate database to the supplied profile path. The actual recorded
profile receipt and browser results, rather than this source reference alone,
establish this test setup. Native permission support plus a trusted test page
still does not prove artifact acquisition, SSO/error handling or local fallback.
