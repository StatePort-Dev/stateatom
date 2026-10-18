# Controlled React first-read profile

This opt-in local development profile preserves the original React P2 and P1
application sources. It builds one self-contained React 18.3.1 development bundle
with Query 5.90.3, the existing open observer and a finite reviewed source/effect
argument. It supports only the first eligible original App data-render and the
particular `/rules/quota` read. Arbitrary apps, changed source, later renders,
custom Query callbacks, foreign DevTools, unknown code or incomplete history do
not inherit the proof. The ordinary Vite inspection workflow remains separate.

Build first with `npm run build:extensions`. The controlled browser holds the original start script until the extension policy
helper has been captured in the current context and native scheduling barriers
have completed. This schedules startup only: actual generated fetch/exchange
identity remains mandatory. The first-read harnesses create new `.runtime` storage privately. Existing permissions are not changed automatically. The private channel requires owned
`.runtime` directories without group/world write permissions. If this checkout
already created `.runtime` as a shared writable directory, make it private with
`chmod 700 .runtime` before using this opt-in profile.

`npm run dev:first-read` starts the owned server and a new sandboxed browser with
only the built StateAtom extension and its single launcher-owned panel. Creating
another page/worker, replacing that panel or losing target history invalidates
the session permanently; closing a foreign producer and reloading cannot recover
its proof. Restart the command for a new controlled session. Open the VS Code helper for this checkout,
pair it in the panel, attach the inert setup tab, then follow its Open controlled
React example link. Choose Disabled and inspect
`#p2`, then Text and `#p1`. Open in IDE uses original source ranges. The panel
separately labels the Code-linked source/effect derivation and Observed occurrence
joins. No application expression, function or getter is rerun to extract values.
After a form render, Inspect again receives a new occurrence which is outside the
first-region profile. Reload obtains a new eligible first region. Every result is
a timestamped snapshot; no continuous live value or eternal readonly is claimed.
Ctrl+C closes the isolated browser and private local channel. Retained profiles
are private operational artifacts and must not be shared as diagnostics.

Short mechanism commands, each with a new output directory:

```sh
FIRST_READ_TAG=<unique> npm run verify:first-read-query
FIRST_PROFILE_TAG=<unique> npm run verify:first-read-profile
FIRST_SESSION_TAG=<unique> npm run verify:first-read-session
```

The session harness exercises a real foreign worker, sticky refusal after
termination/reload, unarmed startup timeout and held-response cleanup. These are
native mechanism checks, not product UI or full-path acceptance.

Actual product acceptance is separate:

```sh
FIRST_UI_TAG=<unique> npm run verify:first-read-ui
```

The latter opens real Chromium, the extension panel and a real VS Code Extension
Host. It checks original P2/P1, IDE navigation, new inspection, code invalidation,
controlled response trials/rollback/Restore, competing same-value producers and
reviewed export into a fresh standalone reader. It is agent-operated, not an
independent human or Store acceptance. Results live under `.runtime/first-read-*`.
No command publishes a release. Standard native browser/CDP, open Node/IDE helper,
compiler and extension delivery are explicit computing-base premises; this is
instrumented-page and Code-linked evidence, not native invocation attestation.
