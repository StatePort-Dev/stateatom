# L02.36 stopped before browser; L02.37 direct current driver

The single325attempt is closed incomplete, not a quality result. Source
`af3db1a50ca39ec0d431c198834da1c453d4a6ab`, raw
`.artifacts/l02/focused-annotation/2026-10-29/native/results.json`, SHA256
`56cf1a3a0aef855b83a2e50b22aa930c6fd9eca63ba137afd5376497aa113670`;
exit1/signalnull.602cached files cloned, nested display acquired/closed; browser
never started,0availability/create/prompt calls,0/34rows. Original inputs/profile/
official build rehash unchanged. Cleanup true flags for absent browser/controller
are no claim that a browser actually existed. Case budget1/1 consumed,0remaining.

Exact cause: host `googleChromeFixture` rewrites an obsolete static
`from 'playwright'` string, which is absent in the current native driver. The
assertion refused before startup. The driver already supplies `executablePath`
and native lazy CDP; no generated text adapter is required. The preparation
validated bytes but missed this adapter compatibility. This is a test transport
error, not a model availability/quality failure or a product defect.

New bounded L02.37 is justified by this concrete correction: directly import the
current `scripts/native-browser.mjs`, pass existing absolute GoogleChrome path;
reuse only the compatible owned-endpoint control from host. No changes to provider,
projection/prompt/options/corpus/quality/timeout or collection predicates. Same
exact official91/UI2, binary and original cached profile. Fresh copied host/profile
and new exclusive one-launch marker; old325driver/case/results remain unchanged.
No tuning or repetition of any observed model answers (there were none).

New driver and preparation syntax checks PASS. Existing70source tests remain on
identical source/controller/row-validator inputs. Source preparation creates no
browser/model. Native `--case docs/testing/focused-current-driver-case.json
--case-sha <frozen SHA> --revision <clean HEAD>` is allowed once after commit.
Normal installation, product provider selection, offline and quality acceptance
remain separate; full22/29, mandatoryL02 open.

Frozen case SHA256 `474c6e74a605c4e5f0c556e37ee3e37535ad4bac848148616f83f8a2acaa6bfe`;
45source/tool/history bindings, including325raw+exit and original case. Provider,
evaluation controller and model prompts are byte-identical to325.
