# V02 — current80 measurement prerequisite decision

2026-10-26, after focused nine-gate assessment205. Current80 Atom/UI archives and
all327product build inputs match. No repack needed. Publisher optimization184 has
no fresh original-workload result; old72 active/off26.6442/29.3247% misses10%.

Read-only prerequisite inventory found64root certificates/64server certificates and
1343owned-profile ServerCertificate databases under this repository's artifacts.
No retained root passed `openssl x509 -checkend 3600` today. No browser/model launched,
new key/certificate generated, trust imported or old case re-executed by this inventory.
It does not prove individual profile health and establishes no performance result.

## Concrete proposed action, before any measurement

Use the existing tests/helpers/source-access-https-fixture.mjs implementation for
ONE new disposable RSA2048/SHA256 test CA/server pair with its existing2day validity
and reserved app.p03.test/artifact test-domain SANs. New exclusive directory under
`.artifacts/v02/current80-performance/<unique-tag>/pki/`; old files remain immutable.
Use the existing importProfileRoot helper ONLY in a newly created owned Chrome test
profile, then hash/freeze its resulting single-CA database as the measurement seed.
No personal/default Chrome profile or OS/system trust store is involved. Only the
synthetic local HTTPS service is exercised; no account or credential use.

Source references: tests/helpers/source-access-https-fixture.mjs:8–13 generates the
pair; tests/helpers/source-access-native-desktop.mjs:31–41 imports through the owned
browser certificate manager. This is test trust setup, not a product certificate,
release signing, model delivery or a user's installation requirement.

After preparation: freeze a NEW current80 case, cert/seed/source/archive hashes and
prewritten reader before the ONE measurement. Keep original fixture HTML/script,
20sequential no-store HTTPS GETs×1024bytes/trusted X11 click/ISOLATED100ms polling/
twoframes, Off/Basic/Active interleaving,198rows/18warm/180measured/66active windows,
p95/median distributions and1s/10% thresholds. TLS setup stays outside measurement.
No expired-certificate bypass, HTTP substitution, oldcase rerun, trimmed workload,
changed metric lifetime or performance waiver. This measures the changed publisher,
not a claimed causal diagnosis of old overhead. Other V02 gates remain separate.

## Why a confirmation is being requested

The earlier bounded package task explicitly excluded new TLS/import work
(docs/superpowers/specs/2026-10-26-v02-publication-package-design.md:27–29).
More importantly, accepting a NEW CA changes trust even in an isolated disposable
profile. The applied executing-plans skill requires stopping for “a security-sensitive
action”. This confirmation concerns exactly the fresh isolated test CA/profile
setup above, not general certificate administration, publication or other repositories.
Until answered, no dependent generation/import/measurement will run. Reversible
source/case preparation and unrelated authorized work can continue.
