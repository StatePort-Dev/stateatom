# U03.2c.3a — unimported public input-evidence packet

New working format decision under autonomous U03; not scope-interview approval.
This slice creates a strict inert attachment packet, not a complete diagnostic
report or an installed capability. Existing v1/minimal/reviewed/source parsers and
the issued25 runtime stay unchanged. Compatible report composition/lineage and
dispatcher/storage/normal review integration follow separately. No parser or
storage may accept a private capture by changing exportable:false to true.

## Source and shape

`core/handoff-input-evidence.mjs` exports async
`createHandoffInputEvidence(privateCaptureRaw, review={}, options={})`,
`parseHandoffInputEvidence(raw,{parentRaw}={})` and
`redactHandoffInputEvidence(raw,review,{expectedParentDigest,now}={})`.
Creation consumes only exact JSON of the25 private capture, <=2MiB. Strictly
validate its supported envelope, bounded projection, exact v1 raw digest, clock,
source-reference/selected-observation correspondence and typed outcome semantics.
The data is still a supplied untrusted claim; no signature or runtime authority
is inferred. Capture schema markers and content hashes are not native attestation.

Public packet: schema `stateatom.input-evidence/1`, kind
`historical-input-outcomes`, new UUID/id, canonical createdAt, safe revision,
source (exact diagnostic digest and recorded times/build/freshness), acquisition
(private reply digest, capture kind/sourceKind/digest or explicit null), projection
(curated recorded context/observations/counts/transactions only), privacy,
evidenceDigest, lineage and fixed limitations. No raw diagnostic, private capture,
snapshot, resource catalogue, plan, rule, grant, writable/undo/restore flag, source
text or body clone appears anywhere in the packet. No executable/exportable flag
claims that a private capture became a full public report. Always
`historical-untrusted`, no app authority and no independent reverification.

Keep native and response kinds, exact phase and per-resource ACK/delivery,
unknown consumption/effect, false-or-unrecorded application restoration, null
transaction time, original selected versus later editor observation, closed/
tainted/cleanup and incomplete retained-summary counts. Do not fill missing
historical locators from current resources. No capture means not-recorded, not
zero edits. Missing frame/context or changed source remains unjoined. Diagnostic
sample hash and input build:null remain separate domains. Contradictory typed
counts/phases/claims reject; a valid deliberately rehashed claim remains untrusted.

Whole public packet <=1MiB, depth16, nodes10000, string16384; reject excess and
unknown/dangerous keys, invalid IDs/times/scalars/envelopes and unsupported schema.
Do not silently truncate outcomes or raise old public format budgets.

## Privacy and immutable derivatives

Creation review has includeCategories (unique subset of inputIdentities,
inputValues,inputLocations,inputErrors; default empty) and omitFields (unique
stable projection paths to optional envelopes). Even a private capture already
containing all values does not make them opt-in for the public packet. Retain
existing known-pattern/URL filtering; no credential/query/fragment or secret
removed by that filter can be exported as an included value. Filtered identity
never supports a known visible join. Previously omitted/not-recorded fields cannot
be reconstructed by including a category. Metadata strings are fixed typed labels,
not arbitrary user data. Missing optional notices remain null, distinct from[].

For delivery locations, normalize the existing filter's origin text/redaction
suffix to canonical origin-only text with filtered state, or `[REDACTED_URL]` when
no origin survives. Never reconstruct a removed route or treat filtered text as
an exact request URL. This also removes query suffixes after a redaction marker;
the underlying25 model and its historical outputs are not rewritten.

Redaction review accepts omitCategories and omitFields only. It creates a new ID,
revision+1, evidence digest and exact-byte parentArtifactDigest plus old evidence
digest. All retained data, original source/acquisition and transaction ordering
remain identical; only optional envelope content can be omitted. Counts/statuses
are never changed to hide a failed/unconfirmed result. Omission counters/paths are
explicit and monotone; no hidden original values. The original raw bytes remain
unchanged. Supplied exact parent validates allowed changes; without a parent say
not-checked. No network or parent/source lookup. Hashes detect content mismatch,
not sender trust, actual execution, selected dependency, build/ancestry or fix.

Snapshot own inert review/options before first await; reject getters/toJSON,
unsafe keys and decorated/sparse lists. Clocks are explicit host functions run
once. Creation cannot attach this fresh capture to an arbitrary earlier report;
later report composition must bind the same exact source diagnostic bytes.

## Verification boundary

RED/GREEN actual25-shaped private capture plus real-ledger synthetic controls,
native/response/null/summary and unknown phases, default exclusions and per-field
omission, exact source/clock binding, filtering/visible joins, limits, hostile and
rehashed imports, immutable exact-byte parent/fork/stale derivatives, no getters/
async caller mutation or external effects. Full source and exact unchanged25
producer/archive/hosts. Fixtures do not become native acquisition or normal saved
U02 acceptance. Public report composition and real review/download remain open.
