# Release decision — macOS installation check deferred

28 October2026. In response to the request for an existing Mac/macOS runner, the
maintainer explicitly answered: “Никакой. Потмо проверю руками. Отмени обязательность проверки”.

## Current release requirement

The macOS installation check is no longer mandatory before this release. No Mac
host/runner/account acquisition is required. The maintainer intends to check it
manually later; no date or successful result is inferred.

Record **macOS installation: not verified, deferred to maintainer; non-blocking**
in the final candidate's support/limitations table. This is an approved requirement
change, not a passing test, a platform-support claim or completion of V03.

The original09 requirement to retain Linux and macOS installation targets is
superseded only for the macOS pre-release check. Preserve earlier run criteria,
raw artifacts and all historical unverified statuses. Linux clean installation,
normal user flows, independent applications, actual model/fallback evidence and
all other V03/I03/V04 gates remain. Windows coverage is not added or presumed.
Whole21/29 remains unchanged. No publication authority is inferred.

Active contract02, decision record12, validation task09 and task-index V03 are
updated together. No code or experimental evidence changed; JSON parse and
`git diff --check` are the relevant documentation checks.
