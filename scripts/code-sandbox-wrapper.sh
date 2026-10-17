#!/usr/bin/env bash
# Official runner adds disabled security flags. Keep the runner, remove those flags.
args=()
for arg in "$@"; do
 case "$arg" in --no-sandbox|--disable-gpu-sandbox|--disable-workspace-trust) ;; *) args+=("$arg");; esac
done
exec /usr/share/code/code "${args[@]}"
