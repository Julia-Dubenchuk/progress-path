#!/usr/bin/env bash
#
# Per-branch cost benchmark for progress-path.
#
# Usage:
#   bash docs/typescript-benchmark/run-per-branch.sh
#
# Companion to run-benchmark.sh, answering the opposite question.
#
#   run-benchmark.sh  holds the tree constant and swaps only the compiler, so the
#                     result isolates TypeScript itself.
#   this script       checks out each branch, installs from that branch's own
#                     lockfile, and measures the tsc that install produces -- so
#                     the result is what that branch actually costs today, with
#                     its own source, tsconfig and dependency tree.
#
# Because source, config and dependencies all vary between branches, these numbers
# are NOT a compiler comparison. Read them alongside run-benchmark.sh's, not
# instead of them.
#
# Leaves the checkout on migration/typescript-7.0.2. Requires a clean working tree.

set -uo pipefail

REPO="$(git rev-parse --show-toplevel)"
cd "$REPO"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "FATAL: working tree is dirty -- this script checks out other branches" >&2
  exit 1
fi

BRANCHES=(typescript-versions-metrics migration/typescript-6.0.3 migration/typescript-7.0.2)
FINAL_BRANCH=migration/typescript-7.0.2
N_RUNS=10

RESULTS_DIR="$REPO/docs/typescript-benchmark/results"
TMP_DIR="$REPO/docs/typescript-benchmark/tmp-out/per-branch"
OUT="$RESULTS_DIR/per-branch.csv"
META="$RESULTS_DIR/per-branch-meta.txt"
mkdir -p "$RESULTS_DIR" "$TMP_DIR"

echo "branch,ts_version,scenario,run,ms" > "$OUT"
: > "$META"

now_ns() { date +%s%N; }
time_ms() { local s e; s="$(now_ns)"; "$@" >/dev/null 2>&1; e="$(now_ns)"; echo $(( (e - s) / 1000000 )); }
median() { printf '%s\n' "$@" | sort -n | awk '{a[NR]=$1} END{print (NR%2)?a[(NR+1)/2]:(a[NR/2]+a[NR/2+1])/2}'; }

for BR in "${BRANCHES[@]}"; do
  echo "=== $BR ==="
  git checkout -q "$BR" || exit 1
  rm -rf dist node_modules "$TMP_DIR"
  mkdir -p "$TMP_DIR"

  # Some branches predate the ts-jest bump and cannot resolve their own peer
  # ranges; record which ones need the escape hatch rather than hiding it.
  if npm ci --no-audit --no-fund > /dev/null 2>&1; then
    LPD="no"
  elif npm ci --legacy-peer-deps --no-audit --no-fund > /dev/null 2>&1; then
    LPD="yes (plain npm ci fails with ERESOLVE)"
  else
    echo "FATAL: npm ci failed on $BR" >&2
    exit 1
  fi

  TSC="$REPO/node_modules/.bin/tsc"
  TSV="$("$TSC" --version 2>/dev/null | awk '{print $NF}')"
  echo "  tsc $TSV   legacy-peer-deps needed: $LPD"

  "$TSC" -p tsconfig.json --noEmit --incremental false --extendedDiagnostics \
    > "$RESULTS_DIR/per-branch-diag-${BR//\//_}.txt" 2>&1
  RSS="$(/usr/bin/time -v "$TSC" -p tsconfig.json --noEmit --incremental false 2>&1 >/dev/null \
        | awk '/Maximum resident set size/{print $NF}')"

  for SC in cold-typecheck cold-emit; do
    if [[ "$SC" == cold-typecheck ]]; then
      ARGS=(-p tsconfig.json --noEmit --incremental false)
    else
      ARGS=(-p tsconfig.build.json --outDir "$TMP_DIR/emit" --incremental false)
    fi
    rm -rf "$TMP_DIR/emit"
    time_ms "$TSC" "${ARGS[@]}" > /dev/null   # discarded warm-up
    TIMES=()
    for i in $(seq 1 "$N_RUNS"); do
      rm -rf "$TMP_DIR/emit"
      ms="$(time_ms "$TSC" "${ARGS[@]}")"
      TIMES+=("$ms")
      echo "$BR,$TSV,$SC,$i,$ms" >> "$OUT"
    done
    echo "  $SC median=$(median "${TIMES[@]}") ms"
  done

  echo "$BR|$TSV|$RSS|$LPD" >> "$META"
  echo "  peak RSS (cold-typecheck): $RSS KB"
done

git checkout -q "$FINAL_BRANCH"
rm -rf node_modules && npm ci --no-audit --no-fund > /dev/null 2>&1
echo "Restored to $(git rev-parse --abbrev-ref HEAD); results in $OUT"
