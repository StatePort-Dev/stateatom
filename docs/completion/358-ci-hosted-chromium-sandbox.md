# Hosted CI: sandboxed Chromium on Ubuntu — 2026-10-29

The maintainer explicitly authorized pushing the CI repair and checking GitHub
Actions. Commit `5d9ba25` was pushed to `StatePort-Dev/stateatom` main.

[Run 40920722973](https://github.com/StatePort-Dev/stateatom/actions/runs/40920722973)
passed the complete `build-and-test` job. In `packed-contracts`, cold-cache
packaging, clean handoff selection, TypeScript consumers, all nine package
compatibility cases and browser installation passed. The browser itself failed
to start before the Basic scenario: no `DevToolsActivePort` appeared.

The first run did not expose browser startup stderr. Diagnostic commit
`13937ea` added a bounded log tail for the four known synthetic host/profile
names; it does not upload profiles. Its
[run 40921409443](https://github.com/StatePort-Dev/stateatom/actions/runs/40921409443)
confirmed Chromium's fatal `No usable sandbox!` startup error followed by
signal 6. This is a hosted environment failure, not a passing native scenario.

## Scoped repair

The packed job now checks Ubuntu's AppArmor user-namespace restriction. When
that restriction is enabled, it loads a profile granting `userns` for the exact
canonical executable from the locked Playwright installation. The path is
validated to exclude policy syntax and wildcards. The profile exists only on
the disposable GitHub runner. Chromium's sandbox remains enabled; neither a
`--no-sandbox` flag nor a global sysctl relaxation is used.

This follows the exact-path approach in the
[Chromium AppArmor documentation](https://chromium.googlesource.com/chromium/src/+/main/docs/security/apparmor-userns-restrictions.md).
The workflow's native checks and result requirements remain unchanged.

Local validation: `bash -n` on the step body and AppArmor 4.0.1
`apparmor_parser --skip-kernel-load --skip-cache` on the generated profile both
passed. This validation did not install a local profile or alter local system
security settings. The hosted result must be read from the workflow run for
the pushed repair commit; syntax validation alone does not prove runtime success.
