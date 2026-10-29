# A02 — installed selected-list plugin case

29 October 2026, after033f9a7. New mechanism: separate application/tool roots,
self-contained local plugin11 toolchain, normal Vite configureServer launch and
private verifier lifecycle. This is not a retry of209/276 or performance89.

Use one isolated ordinary consumer with the original retained TodoMVC app in
`app/` (unchanged source/dependency bytes), npm-installed local plugin tarball,
Vite7.3.7 and existing Chrome153. Vite uses the installed package's declared
`/selected-list` export; the harness does not build/provision the list compilation,
source server, browser witness, context or private verifier. No producer source
imports supply those capabilities. Installed VSIX310 remains the helper.

Budget: one substantive native attempt after source checks; preparation failures
are retained and do not count as a feature pass. A concrete failure permits a
separately recorded corrective increment, never a silent unchanged retry.

Required: ordinary Vite start; actual create/changed/same-value positive chains;
untouched-row isolation; current mounted source link opens exact original source
in installed IDE; private Origin/bearer/Host refusals; unknown MAIN code invalidates
current authority; normal Vite close releases server/browser/private verifier and
extracted tools. Record tarball/VSIX hashes, original source identity, actual
results and failures. No full A02, held-out, Original/Off/On parity, official host,
new full release or public distribution claim follows from this bounded case.
