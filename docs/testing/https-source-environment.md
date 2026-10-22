# P03 HTTPS/native-permission test environment

The original Linux/Chrome153 agent-operated environment qualification is in
[completion83](../completion/83-p03-https-artifact-access.md); it alone does not prove
artifact acceptance. The subsequent bounded two-host P03 workflow and actual
checks are in [completion85](../completion/85-p03-trusted-https-workflow.md).

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

## Actual artifact and local-fallback workflow

The subsequent [P03 execution record](../completion/85-p03-trusted-https-workflow.md)
adds the finite two-host artifact workflow. Run its exact issued handoff explicitly:

```sh
node tests/integration/source-access-https-native.mjs <exact-atom-handoff.json>
```

It additionally requires local OpenSSL and Python3 SQLite, already used in the
recorded environment. The helper generates a new private CA/server key pair and
maps only named synthetic `.p03.test` hosts to its own local server through that
child Chrome's resolver arguments. Certificate Manager Import/Open adds trust
only to each disposable profile. No certificate exception, permission preapproval,
account, system trust-store change or app-target test CDP is used. Own Chrome,
server and nested display close in `finally`; ignored keys/profiles remain local
evidence and are not distribution inputs.

The native cycle covers independent app/artifact permission Deny/Allow, exact
manifest and ZIP through actual selected-listener coordinates,403, refused redirect,
HTML document, manifest boundary, unavailable server, pending Clear, actual local
ZIP recovery, target change during a prompt, long prompts and actual removal/
explicit regrant. Browser cookie-page/favicon requests are separate positive
session controls; all actual artifact fetches must omit credentials/referrers.
The case demonstrates a synthetic ordinary application/session, not a real
enterprise SSO provider, authentication integration or OS VPN experiment.

An initial app permission prompt held35s can close the private inspector channel.
The existing visible **Reopen inspector**, then explicit **Attach**, recovers a
fresh read-only view. This is a tested recovery boundary, not seamless prompt
handling or proof of the underlying idle cause. A long artifact prompt while
attached is a separate passing control. Source access never enables production
changes or invokes the selected handler. Source text stays Code-linked; execution
and property producer remain unobserved/unknown.

All screenshot files are candidates. Some immediate embedding X11 TLS/root grabs
in candidate46 are blank and provide no visual proof; exact page/title/server/SAN
checks and the closed-profile root receipt establish their own scoped results.
Readable native prompts and rendered source/recovery390/440 checks are separate.
Preserve each original failed attempt and its input hashes; final readiness or
traffic-classification corrections do not convert it into a passing run.
