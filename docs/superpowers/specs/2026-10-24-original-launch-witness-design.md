# A02.8 — original launch witness feasibility

Autonomous bounded continuation from6f696c7; latest instruction through Oct25
evening, main/local/scope-review-1/20of29. Executor choice, not an approved root
cause or product capability. A02.6/A02.7 cases are exhausted and immutable.

## Goal and chosen approach

Acquire original invocation arguments from the public owner-process API instead
of reconstructing argv from a mutable Linux process title. Context7 official
Playwright1.63 documents BrowserServer.process() as its spawned ChildProcess;
Node24 documents spawnfile/spawnargs/pid as launch metadata. These source contracts
justify a finite feasibility test, not runtime proof by themselves.

Executor alternatives: split a flattened title (rejected, boundaries lost);
intercept global child_process.spawn/private Playwright fields (rejected, unnecessary
host mutation/private contract); public BrowserServer.process plus independent
CDP/proc/Chrome metadata (chosen). This changes only the research launch route;
old classifiers/results stay refused and no old criterion is silently waived.

New research files browser-launch-witness.mjs and browser-launch-witness-run.mjs.
No product, SDK, otherrepo, UI design, extension/helper/IDE, certificate/trust/user
profile, dependency, account, publication or old app campaign changes. No app runs.

## Witness and independent corroboration

Read data properties from the returned actual ChildProcess once: pid, spawnfile,
spawnargs and live state. Do not invoke arbitrary getters or keep its mutable array.
Persist inert PID/executable/path digest/vector digest/flattened-vector digest/count,
filtered essential flag facts and managed profile only. No full argv, credential
option, websocket endpoint or unrelated command line is persisted. Malformed,
missing, ambiguous or getter-backed metadata stays Unsupported with errors.

BrowserServer uses an automatically created temporary profile. Freeze a rule,
not a guessed future exact name: current real os.tmpdir must be /tmp, basename
playwright_chromiumdev_profile- plus nonempty alphanumeric/underscore/hyphen suffix,
direct child of /tmp, no traversal/symlink. This is an explicit new research route,
not retrospective acceptance of A02.7's fixed-profile case. Generated profile must
be bound to actual owner ChildProcess, CDP PID and stable proc executable/start/hash.
Source-controlled headless flag required; no no-sandbox, ignore-certificate-errors,
disable-web-security or load-extension in original invocation. Profile equal-form
unique; no parsing of a process-title string as argv.

Reuse immutable A02.7 scoped collector/deadline helpers. Exact CDP PID and current
driver direct-child/start/exe/hash correspondence remain mandatory. Its proc argv
summary may remain Unknown/refused: retain it verbatim alongside the separate
original-invocation witness, never upgrade the old admission function.

One own page starts about:blank, then chrome://version/ for independent browser
metadata only. Candidate field IDs executable_path/profile_path/command_line are
executor hypotheses, not an obtained/pinned HTML reference; missing fields refuse.
Persist only bounded lengths/digests/errors. Require executable path digest equal
to registered binary path, profile path digest equal to witnessed profile/Default,
and displayed command-line digest equal to the flattened *known original vector*.
This corroborates a known vector; it never reconstructs one from displayed text.
Bind pre/post main frame/loader/target and exact metadata URL; no app/oracle/setting.
DOM strings/endpoint stay memory-only, no screenshot/visual-fidelity claim.

## Finite native protocol and boundaries

After TDD/full source gates/clean source commit: freeze ONE new case, Node24,
Chrome153/exact hashes, local module graph, prior sources/raw/checkpoints and
strict rules above. Commit case before max1 launch. BrowserServer binds only
127.0.0.1/port0, same headlesstrue/chromiumSandboxtrue/args[]; websocket secret used
only in memory with matching local Playwright client. No extension/helper/server
exposed externally. Source-generated profile managed by the owned launcher only.

Save original process facts before qualification. Collect independent proc and
metadata facts before any classification; persist partial/refusal on failure.
Deadline5000ms per CDP/metadata/cleanup, launch20000ms, no Live/product policy.
Close each returned page/context/client/server handle independently; retain a failed
handle. If owned BrowserServer.close times out/fails, its own kill() API may clean
only that launched owner instance; never kill a PID inferred from diagnostics.
Preserve primary failure and Incomplete even if fallback cleanup succeeds. Verify
exact process exit and owned temporary profile cleanup; no arbitrary profile scan.

One immutable attempt only; literal failure/partial retained, no repeat after a
source fix. Independently verify saved facts/negative controls and exact hashes.
Successful facts establish only this launch/metadata route, not app acquisition,
Atom integration, causal storage/ownership/revision/React props/selected producer
or fullA02. Unknown is preserved wherever independent corroboration is missing.

TDD: actual owned Node child with process.title rewrite preserves original spawn
metadata while proc argv differs; synthetic metadata DTO remains source-only.
Also pin getter avoidance, copy stability, privacy, malformed/duplicate flags,
foreign/temp traversal/symlink, PID/start/exe/hash mismatches, displayed digest and
document mismatches, unresolved/late operations, cleanup/fallback/primary failure,
CLI/resource-free refusal and immutable inputs. ONE final fresh read-only review,
one tested Important/Critical pass maximum/no rereview, explicit Minors/rulings.
