#!/usr/bin/env bash
#
# TypeScript compiler benchmark harness for progress-path.
#
# Usage:
#   bash docs/typescript-benchmark/run-benchmark.sh <ts-version>
#
# Example:
#   bash docs/typescript-benchmark/run-benchmark.sh 5.8.2
#
# Measures three TypeScript compilation scenarios (cold typecheck, cold emit,
# warm incremental) for the given version, after a compatibility gate.
#
# The compiler under test installs into an isolated npm prefix and is invoked
# by absolute path against the project's real tsconfig. The project's own
# node_modules, package.json and package-lock.json are never touched, so all
# three versions compile a byte-identical dependency tree.
#
# The Nest CLI build pipeline is deliberately out of scope: `nest build` layers
# CLI startup, config loading and file-watching setup on top of compilation, and
# it cannot run TypeScript 7 at all (the native port removed the JS compiler API
# the CLI drives). Measuring it would compare toolchains, not compilers.

set -euo pipefail

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

if [[ $# -ne 1 ]]; then
  echo "Usage: bash docs/typescript-benchmark/run-benchmark.sh <ts-version>" >&2
  exit 1
fi

VERSION="$1"
N_RUNS=10

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

BENCH_DIR="$REPO_ROOT/docs/typescript-benchmark"
COMPILERS_DIR="$BENCH_DIR/.compilers"
RESULTS_DIR="$BENCH_DIR/results"
TMP_DIR="$BENCH_DIR/tmp-out"

mkdir -p "$COMPILERS_DIR" "$RESULTS_DIR" "$TMP_DIR"

SUMMARY_CSV="$RESULTS_DIR/summary.csv"
PEAK_RSS_CSV="$RESULTS_DIR/peak-rss.csv"
GATE_FILE="$RESULTS_DIR/gate-${VERSION}.txt"
ENV_FILE="$RESULTS_DIR/environment.txt"

if [[ ! -f "$SUMMARY_CSV" ]]; then
  echo "version,scenario,run,ms,exit" > "$SUMMARY_CSV"
fi
if [[ ! -f "$PEAK_RSS_CSV" ]]; then
  echo "version,scenario,rss_kb" > "$PEAK_RSS_CSV"
fi

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

now_ns() { date +%s%N; }

# time_cmd -- runs "$@", echoes elapsed ms to stdout. The command's exit code is
# left in LAST_EXIT so callers can tell a real compile from a fast crash: tsc uses
# 0 (clean) and 1/2 (diagnostics reported), both of which mean it did the work.
# Anything else means it bailed early and the timing is meaningless.
LAST_EXIT=0
LAST_MS=0
time_cmd() {
  local start end
  start="$(now_ns)"
  # `&& ... || ...` keeps this off `set -e`'s radar so a failing compile is
  # recorded rather than aborting the run. Results land in globals because a
  # command substitution would trap LAST_EXIT inside a subshell.
  "$@" > /dev/null 2>&1 && LAST_EXIT=0 || LAST_EXIT=$?
  end="$(now_ns)"
  LAST_MS=$(( (end - start) / 1000000 ))
}

# Scenario exit codes accumulate here; flagged in the summary if any is unexpected.
declare -A SCENARIO_BAD_EXITS=()

check_exit() {
  # check_exit <scenario> <exit_code>
  case "$2" in
    0|1|2) ;;
    *) SCENARIO_BAD_EXITS["$1"]="$(( ${SCENARIO_BAD_EXITS["$1"]:-0} + 1 ))" ;;
  esac
}

# stats "ms1 ms2 ..." -> prints "median min mean stddev"
stats() {
  python3 - "$@" <<'PY'
import sys, statistics as st
vals = [float(x) for x in sys.argv[1:]]
median = st.median(vals)
mn = min(vals)
mean = st.fmean(vals)
sd = st.pstdev(vals)
print(f"{median:.1f} {mn:.1f} {mean:.1f} {sd:.1f}")
PY
}

peak_rss_kb() {
  # Runs "$@" under /usr/bin/time -v, prints Maximum resident set size (KB)
  local tmp_stderr rss
  tmp_stderr="$(mktemp)"
  /usr/bin/time -v "$@" > /dev/null 2> "$tmp_stderr" || true
  rss="$(grep "Maximum resident set size" "$tmp_stderr" | awk '{print $NF}' || true)"
  rm -f "$tmp_stderr"
  echo "${rss:-0}"
}

record_run() {
  # record_run <scenario> <run_index> <ms> <exit_code>
  echo "${VERSION},$1,$2,$3,$4" >> "$SUMMARY_CSV"
}

record_rss() {
  # record_rss <scenario> <rss_kb>
  echo "${VERSION},$1,$2" >> "$PEAK_RSS_CSV"
}

section() {
  echo ""
  echo "=== $* ==="
}

# ---------------------------------------------------------------------------
# Environment header
# ---------------------------------------------------------------------------

{
  echo "Environment"
  echo "==========="
  echo "Date:         $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "CPU:          $(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2 | sed 's/^ //')"
  echo "Cores:        $(nproc)"
  echo "RAM:          $(free -h | awk '/^Mem:/{print $2}')"
  echo "OS:           $(grep -m1 '^PRETTY_NAME=' /etc/os-release 2>/dev/null | cut -d'"' -f2 || uname -s)"
  echo "Kernel:       $(uname -s) $(uname -r)"
  echo "Architecture: $(uname -m)"
  echo "Node:         $(node -v)"
  echo "npm:          $(npm -v)"
} > "$ENV_FILE"
cat "$ENV_FILE"

# ---------------------------------------------------------------------------
# Lane A: install isolated compiler
# ---------------------------------------------------------------------------

section "Installing TypeScript ${VERSION} (Lane A, isolated prefix)"

LANE_A_PREFIX="$COMPILERS_DIR/ts-${VERSION}"
mkdir -p "$LANE_A_PREFIX"
npm install --prefix "$LANE_A_PREFIX" "typescript@${VERSION}" --no-audit --no-fund > /dev/null
TSC_A="$LANE_A_PREFIX/node_modules/.bin/tsc"

if [[ ! -x "$TSC_A" ]]; then
  echo "FATAL: could not install typescript@${VERSION} into isolated prefix" >&2
  exit 1
fi

INSTALLED_A_VERSION="$("$TSC_A" --version)"
echo "Lane A compiler: $INSTALLED_A_VERSION ($TSC_A)"

# ---------------------------------------------------------------------------
# Compatibility gate
# ---------------------------------------------------------------------------

section "Compatibility gate: ${VERSION}"

GATE_LINES=()
GATE_LINES+=("TypeScript ${VERSION} compatibility gate")
GATE_LINES+=("========================================")

# Gate 1: tsc --version
GATE1_OUTPUT="$INSTALLED_A_VERSION"
if [[ "$GATE1_OUTPUT" == *"$VERSION"* ]]; then
  GATE1_STATUS="PASS"
else
  GATE1_STATUS="FAIL"
fi
GATE_LINES+=("1. tsc --version: \"${GATE1_OUTPUT}\" => ${GATE1_STATUS} (expected to contain ${VERSION})")
echo "Gate 1 (version): ${GATE1_OUTPUT} => ${GATE1_STATUS}"

# Gate 2: full noEmit typecheck, capture exit code + error count
rm -f dist/tsconfig.tsbuildinfo dist/tsconfig.build.tsbuildinfo
GATE2_LOG="$RESULTS_DIR/gate-${VERSION}-noEmit-output.txt"
set +e
"$TSC_A" -p tsconfig.json --noEmit > "$GATE2_LOG" 2>&1
GATE2_EXIT=$?
set -e
GATE2_ERR_COUNT="$(grep -c "error TS" "$GATE2_LOG" || true)"
if [[ "$GATE2_EXIT" -eq 0 && "$GATE2_ERR_COUNT" -eq 0 ]]; then
  GATE2_STATUS="PASS"
  rm -f "$GATE2_LOG"
else
  GATE2_STATUS="FAIL"
fi
GATE2_SUFFIX=""
if [[ "$GATE2_STATUS" == "FAIL" ]]; then
  GATE2_SUFFIX=" (see gate-${VERSION}-noEmit-output.txt)"
fi
GATE_LINES+=("2. tsc -p tsconfig.json --noEmit: exit=${GATE2_EXIT} errors=${GATE2_ERR_COUNT} => ${GATE2_STATUS}${GATE2_SUFFIX}")
echo "Gate 2 (noEmit): exit=${GATE2_EXIT} errors=${GATE2_ERR_COUNT} => ${GATE2_STATUS}"

# Gate 3: decorator metadata actually emitted
rm -rf "$TMP_DIR/gate-decorator-${VERSION}"
set +e
"$TSC_A" -p tsconfig.build.json --outDir "$TMP_DIR/gate-decorator-${VERSION}" --incremental false > "$RESULTS_DIR/gate-${VERSION}-decorator-build.txt" 2>&1
GATE3_BUILD_EXIT=$?
set -e
if [[ "$GATE3_BUILD_EXIT" -eq 0 ]]; then
  # TS does not call Reflect.metadata("design:type", ...) directly at each
  # decorated declaration — it emits a shared `__metadata` helper once per
  # file (which itself calls Reflect.metadata internally) and then invokes
  # that helper as __metadata("design:type", Function) / __metadata("design:paramtypes", ...)
  # per decorated member. Match on the "design:type" key emission itself,
  # which is what actually has to be present for NestJS reflection-based DI
  # to work, regardless of the exact helper-call wrapper syntax used.
  GATE3_MATCH_COUNT="$(grep -rho '"design:type"' "$TMP_DIR/gate-decorator-${VERSION}" 2>/dev/null | wc -l | tr -d ' ' || true)"
  GATE3_MATCH_COUNT="${GATE3_MATCH_COUNT:-0}"
  rm -f "$RESULTS_DIR/gate-${VERSION}-decorator-build.txt"
else
  GATE3_MATCH_COUNT=0
fi
if [[ "$GATE3_MATCH_COUNT" -gt 0 ]]; then
  GATE3_STATUS="PASS"
  GATE3_FOUND="yes"
else
  GATE3_STATUS="FAIL"
  GATE3_FOUND="no"
fi
GATE_LINES+=("3. emitDecoratorMetadata (\"design:type\" key emitted in output, via __metadata/Reflect.metadata helper): found=${GATE3_FOUND} matches=${GATE3_MATCH_COUNT} => ${GATE3_STATUS}")
echo "Gate 3 (decorator metadata): found=${GATE3_FOUND} matches=${GATE3_MATCH_COUNT} => ${GATE3_STATUS}"
rm -rf "$TMP_DIR/gate-decorator-${VERSION}"

printf '%s\n' "${GATE_LINES[@]}" > "$GATE_FILE"
cat "$GATE_FILE"

# ---------------------------------------------------------------------------
# Scenario 1: cold-typecheck (headline)
# ---------------------------------------------------------------------------

section "Scenario 1: cold-typecheck"

SC1_TIMES=()
# discarded warm-up
rm -f dist/tsconfig.tsbuildinfo dist/tsconfig.build.tsbuildinfo
time_cmd "$TSC_A" -p tsconfig.json --noEmit --incremental false

for i in $(seq 1 "$N_RUNS"); do
  rm -f dist/tsconfig.tsbuildinfo dist/tsconfig.build.tsbuildinfo
  time_cmd "$TSC_A" -p tsconfig.json --noEmit --incremental false
  ms="$LAST_MS"
  SC1_TIMES+=("$ms")
  record_run "cold-typecheck" "$i" "$ms" "$LAST_EXIT"
  check_exit "cold-typecheck" "$LAST_EXIT"
  echo "  run $i: ${ms} ms"
done

read -r SC1_MEDIAN SC1_MIN SC1_MEAN SC1_STDDEV <<< "$(stats "${SC1_TIMES[@]}")"
echo "cold-typecheck: median=${SC1_MEDIAN}ms min=${SC1_MIN}ms mean=${SC1_MEAN}ms stddev=${SC1_STDDEV}ms"

# raw output capture (one representative run)
rm -f dist/tsconfig.tsbuildinfo dist/tsconfig.build.tsbuildinfo
"$TSC_A" -p tsconfig.json --noEmit --incremental false > "$RESULTS_DIR/raw-${VERSION}-cold-typecheck.txt" 2>&1 || true

# peak RSS
rm -f dist/tsconfig.tsbuildinfo dist/tsconfig.build.tsbuildinfo
SC1_RSS="$(peak_rss_kb "$TSC_A" -p tsconfig.json --noEmit --incremental false)"
record_rss "cold-typecheck" "$SC1_RSS"
echo "cold-typecheck peak RSS: ${SC1_RSS} KB"
rm -f dist/tsconfig.tsbuildinfo dist/tsconfig.build.tsbuildinfo

# extendedDiagnostics extra run
"$TSC_A" -p tsconfig.json --noEmit --incremental false --extendedDiagnostics > "$RESULTS_DIR/raw-${VERSION}-extended-diagnostics.txt" 2>&1 || true
rm -f dist/tsconfig.tsbuildinfo dist/tsconfig.build.tsbuildinfo
echo "extendedDiagnostics saved to raw-${VERSION}-extended-diagnostics.txt"

# ---------------------------------------------------------------------------
# Scenario 2: cold-emit
# ---------------------------------------------------------------------------

section "Scenario 2: cold-emit"

EMIT_OUT="$TMP_DIR/emit-${VERSION}"
SC2_TIMES=()

rm -rf "$EMIT_OUT"
time_cmd "$TSC_A" -p tsconfig.build.json --outDir "$EMIT_OUT" --incremental false

for i in $(seq 1 "$N_RUNS"); do
  rm -rf "$EMIT_OUT"
  time_cmd "$TSC_A" -p tsconfig.build.json --outDir "$EMIT_OUT" --incremental false
  ms="$LAST_MS"
  SC2_TIMES+=("$ms")
  record_run "cold-emit" "$i" "$ms" "$LAST_EXIT"
  check_exit "cold-emit" "$LAST_EXIT"
  echo "  run $i: ${ms} ms"
done

read -r SC2_MEDIAN SC2_MIN SC2_MEAN SC2_STDDEV <<< "$(stats "${SC2_TIMES[@]}")"
echo "cold-emit: median=${SC2_MEDIAN}ms min=${SC2_MIN}ms mean=${SC2_MEAN}ms stddev=${SC2_STDDEV}ms"

rm -rf "$EMIT_OUT"
"$TSC_A" -p tsconfig.build.json --outDir "$EMIT_OUT" --incremental false > "$RESULTS_DIR/raw-${VERSION}-cold-emit.txt" 2>&1 || true

rm -rf "$EMIT_OUT"
SC2_RSS="$(peak_rss_kb "$TSC_A" -p tsconfig.build.json --outDir "$EMIT_OUT" --incremental false)"
record_rss "cold-emit" "$SC2_RSS"
echo "cold-emit peak RSS: ${SC2_RSS} KB"
rm -rf "$EMIT_OUT"

# ---------------------------------------------------------------------------
# Scenario 3: warm-incremental (prime once, time the SECOND run)
# ---------------------------------------------------------------------------

section "Scenario 3: warm-incremental"

BUILDINFO="$TMP_DIR/scenario3-${VERSION}.tsbuildinfo"
SC3_TIMES=()

run_warm_cycle() {
  # Primes the buildinfo, then times the second (warm) run. Leaves the warm
  # run's timing in LAST_MS and its exit code in LAST_EXIT.
  rm -f "$BUILDINFO"
  "$TSC_A" -p tsconfig.json --noEmit --incremental --tsBuildInfoFile "$BUILDINFO" > /dev/null 2>&1 || true
  time_cmd "$TSC_A" -p tsconfig.json --noEmit --incremental --tsBuildInfoFile "$BUILDINFO"
}

# discarded warm-up cycle
run_warm_cycle

for i in $(seq 1 "$N_RUNS"); do
  run_warm_cycle
  ms="$LAST_MS"
  SC3_TIMES+=("$ms")
  record_run "warm-incremental" "$i" "$ms" "$LAST_EXIT"
  check_exit "warm-incremental" "$LAST_EXIT"
  echo "  run $i: ${ms} ms"
done

read -r SC3_MEDIAN SC3_MIN SC3_MEAN SC3_STDDEV <<< "$(stats "${SC3_TIMES[@]}")"
echo "warm-incremental: median=${SC3_MEDIAN}ms min=${SC3_MIN}ms mean=${SC3_MEAN}ms stddev=${SC3_STDDEV}ms"

# raw output + peak RSS for the warm (second) run
rm -f "$BUILDINFO"
"$TSC_A" -p tsconfig.json --noEmit --incremental --tsBuildInfoFile "$BUILDINFO" > /dev/null 2>&1 || true
"$TSC_A" -p tsconfig.json --noEmit --incremental --tsBuildInfoFile "$BUILDINFO" > "$RESULTS_DIR/raw-${VERSION}-warm-incremental.txt" 2>&1 || true

rm -f "$BUILDINFO"
"$TSC_A" -p tsconfig.json --noEmit --incremental --tsBuildInfoFile "$BUILDINFO" > /dev/null 2>&1 || true
SC3_RSS="$(peak_rss_kb "$TSC_A" -p tsconfig.json --noEmit --incremental --tsBuildInfoFile "$BUILDINFO")"
record_rss "warm-incremental" "$SC3_RSS"
echo "warm-incremental peak RSS (warm run): ${SC3_RSS} KB"
rm -f "$BUILDINFO"

# ---------------------------------------------------------------------------
# Final report
# ---------------------------------------------------------------------------

section "Summary: TypeScript ${VERSION}"

printf "%-20s %10s %10s %10s %10s %14s\n" "scenario" "median_ms" "min_ms" "mean_ms" "stddev_ms" "peak_rss_kb"
printf "%-20s %10s %10s %10s %10s %14s\n" "cold-typecheck" "$SC1_MEDIAN" "$SC1_MIN" "$SC1_MEAN" "$SC1_STDDEV" "$SC1_RSS"
printf "%-20s %10s %10s %10s %10s %14s\n" "cold-emit" "$SC2_MEDIAN" "$SC2_MIN" "$SC2_MEAN" "$SC2_STDDEV" "$SC2_RSS"
printf "%-20s %10s %10s %10s %10s %14s\n" "warm-incremental" "$SC3_MEDIAN" "$SC3_MIN" "$SC3_MEAN" "$SC3_STDDEV" "$SC3_RSS"

if [[ ${#SCENARIO_BAD_EXITS[@]} -gt 0 ]]; then
  echo ""
  echo "WARNING: unexpected compiler exit codes — these timings are NOT trustworthy:"
  for scen in "${!SCENARIO_BAD_EXITS[@]}"; do
    echo "  ${scen}: ${SCENARIO_BAD_EXITS[$scen]}/${N_RUNS} runs exited outside tsc's normal 0/1/2"
  done
fi

echo ""
echo "Done. Results in $RESULTS_DIR"
