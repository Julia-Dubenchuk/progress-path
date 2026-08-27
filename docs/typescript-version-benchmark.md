# TypeScript 5.8.2 → 6.0.3 → 7.0.2 on progress-path

How much faster is TypeScript 7.0.2 on this project, and how does TypeScript 6.0
compare?

## Answer

**TypeScript 7.0.2 type-checks this project 7.6× faster** — 2511 ms drops to 332 ms.
Full emit is 8.0× faster and warm rebuilds 6.7× faster, using 28% less memory.

**TypeScript 6.0.3 is not faster. It is 3–6% slower** than 5.8.2 across every
scenario. That is expected: 6.0 is the release that sheds deprecated options and
tightens defaults, not the one that rewrites the compiler. The speed story belongs
entirely to 7.0.

Two caveats decide whether you can act on this today:

- Neither 6.0.3 nor 7.0.2 could compile this project as it was configured. Reaching
  these numbers required a real migration (commit `6285ce7`).
- **`nest build` fails under 7.0.2.** The Nest CLI calls a compiler API the native
  port does not expose. The standalone `tsc` works perfectly; your actual build
  command does not.

## Environment

```
CPU:          Intel(R) Core(TM) i7-10750H CPU @ 2.60GHz
Cores:        12
RAM:          15Gi
OS:           Ubuntu 24.04.4 LTS
Kernel:       Linux 6.8.0-138-generic
Architecture: x86_64
Node:         v22.14.0
npm:          10.9.2
```

Subject: this repository at commit `6285ce7` — 173 `.ts` files, ~10,064 lines of own
source, pulling 2570 files and ~189,000 lines of type definitions into the program.

## Versions tested

| Requested | Tested    | Note                                                                                                    |
| --------- | --------- | ------------------------------------------------------------------------------------------------------- |
| 5.8.2     | 5.8.2     | The version this project pinned. JS compiler.                                                           |
| 6.0       | **6.0.3** | `typescript@6.0.0` was never published — npm only has 6.0.2 and 6.0.3. 6.0.3 is the newest in the line. |
| 7.0.2     | 7.0.2     | Current `latest`. The native (Go) compiler.                                                             |

TypeScript 7 ships differently: the `typescript` package is a 3.6 MB shim that pulls a
platform binary (`@typescript/typescript-linux-x64`, 27 MB) as a separate dependency,
and it provides only a `tsc` bin — there is no `tsserver` in the package.

## Compatibility: what actually compiles

This ran before any timing, because a compiler that fails fast looks like a compiler
that is fast.

| Check                         | 5.8.2      | 6.0.3      | 7.0.2      |
| ----------------------------- | ---------- | ---------- | ---------- |
| `tsc --noEmit`, 0 errors      | PASS       | PASS       | PASS       |
| `emitDecoratorMetadata` works | PASS (243) | PASS (243) | PASS (243) |
| `nest build`                  | PASS       | PASS       | **FAIL**   |

All three figures above are _post-migration_. Before it, 6.0.3 produced 118 errors and
7.0.2 could not run either.

### What 6.0 broke

TypeScript 6.0 derives the strict-family defaults from `strictNullChecks` instead of
`strict`, and turns deprecated options into hard errors:

| Change                                | Errors                        | Fix applied                                                                                                                                         |
| ------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseUrl` deprecated (`TS5101`)       | fatal, aborts before checking | Removed. It stops functioning entirely in 7.0, so removing beats silencing with `ignoreDeprecations`. Forced `paths` to become relative (`TS5090`). |
| `strictPropertyInitialization` now on | 114 × `TS2564`                | Definite-assignment assertions on entity and DTO properties, which TypeORM and class-transformer populate rather than constructors.                 |
| `useUnknownInCatchVariables` now on   | 3 × `TS2322`                  | `catch` bindings are `unknown`; logger calls now wrap as `{ error }`.                                                                               |

7.0.2 needed no further changes beyond the 6.0 migration.

### Why `nest build` fails on 7.0.2

```
Error  tsBinary.getParsedCommandLineOfConfigFile is not a function
```

`@nestjs/cli` loads the project's `typescript` and drives it through the JS compiler
API. The native port does not implement that surface. This is a CLI-compatibility
gap, not a code problem — `tsc -p tsconfig.build.json` produces correct output under
7.0.2 with the same 243 decorator-metadata entries.

## Results

10 runs per scenario per version, all exiting cleanly. Median milliseconds:

| Scenario         |  5.8.2 |  6.0.3 |     7.0.2 | 7.0.2 speedup |    6.0.3 vs 5.8.2 |
| ---------------- | -----: | -----: | --------: | ------------: | ----------------: |
| Cold type-check  | 2511.5 | 2665.0 | **332.0** |     **7.56×** | 0.94× (6% slower) |
| Cold full emit   | 2648.0 | 2757.5 | **331.5** |     **7.99×** | 0.96× (4% slower) |
| Warm incremental | 1699.5 | 1747.5 | **254.0** |     **6.69×** | 0.97× (3% slower) |
| `nest build`     | 4243.5 | 4426.0 |   _fails_ |             — | 0.96× (4% slower) |

Spread (min / mean / stddev, ms):

| Version | Scenario         |    min |   mean | stddev |
| ------- | ---------------- | -----: | -----: | -----: |
| 5.8.2   | cold type-check  | 2454.0 | 2527.1 |   47.2 |
| 5.8.2   | cold emit        | 2565.0 | 2674.9 |   92.5 |
| 5.8.2   | warm incremental | 1634.0 | 1719.7 |   54.0 |
| 5.8.2   | `nest build`     | 4174.0 | 4256.4 |   68.8 |
| 6.0.3   | cold type-check  | 2566.0 | 2675.6 |   80.1 |
| 6.0.3   | cold emit        | 2703.0 | 2788.3 |   66.4 |
| 6.0.3   | warm incremental | 1623.0 | 1737.2 |   74.3 |
| 6.0.3   | `nest build`     | 4298.0 | 4430.4 |   71.4 |
| 7.0.2   | cold type-check  |  318.0 |  331.0 |    7.7 |
| 7.0.2   | cold emit        |  296.0 |  326.5 |   16.1 |
| 7.0.2   | warm incremental |  243.0 |  253.1 |    5.3 |

Stddev stays under 4% of median everywhere, so the 6% gap between 5.8.2 and 6.0.3 is
outside noise, and the 7.0.2 gap is not close to arguable.

Note that 7.0.2's _warm incremental_ rebuild (254 ms) is barely faster than its _cold_
type-check (332 ms). The native compiler is fast enough that incremental state has
almost nothing left to save — worth remembering before investing in build caching.

## Where the time goes

| Phase     |      5.8.2 |      6.0.3 |       7.0.2 |
| --------- | ---------: | ---------: | ----------: |
| Parse     |     0.70 s |     0.68 s |     0.107 s |
| Bind      |     0.30 s |     0.31 s |     0.024 s |
| Check     |     0.88 s |     0.89 s |     0.113 s |
| Emit      |     0.00 s |     0.00 s |     0.007 s |
| **Total** | **2.31 s** | **2.30 s** | **0.291 s** |

The gain is broad, not concentrated: parse 6.5×, bind 12.5×, check 7.8×. This is a
different implementation of the same work, not one hot path being optimised.

`Types` and `Instantiations` counts are _not_ comparable across the major versions —
5.8.2 reports 19,739 / 42,474 where 7.0.2 reports 40,467 / 62,740. The native port
accounts for them differently. Only wall-clock and memory compare directly.

## Memory

Peak RSS, MB:

| Scenario         | 5.8.2 | 6.0.3 |     7.0.2 |
| ---------------- | ----: | ----: | --------: |
| Cold type-check  | 367.9 | 371.3 | **264.1** |
| Cold emit        | 369.0 | 378.7 | **254.4** |
| Warm incremental | 322.2 | 328.5 | **214.0** |
| `nest build`     | 463.8 | 471.2 |   _fails_ |

7.0.2 uses ~28% less memory while running ~7.6× faster.

## Output correctness

Emitted JavaScript was compared, not just timed:

- 5.8.2 vs 6.0.3: **byte-identical** across all 141 emitted `.js` files.
- 5.8.2 vs 7.0.2: 16 of 141 files differ, entirely in whitespace — 7.0.2 keeps
  `__metadata("design:paramtypes", [...])` arrays on one line where 5.8.2 wraps them.
  No semantic difference.

All three emit the same 243 `design:type` entries, so NestJS dependency injection
behaves identically.

## Threats to validity

- **Small project.** At ~10k lines of own source, most of the work is the 189k lines
  of dependency definitions. The native port's advantage generally grows with project
  size, so 7.6× probably _understates_ what a larger codebase would see.
- **`skipLibCheck: true`** means `.d.ts` files are parsed but not fully checked. With
  it off, all three would be slower and the ratio could shift.
- **Single machine, single run series.** One laptop, one OS, one Node version, no
  thermal-throttling control beyond keeping the machine otherwise idle.
- **No editor measurement.** 7.0.2's package ships no `tsserver`, so IDE
  responsiveness — arguably what you feel most — is untested here.
- **`nest build` includes CLI overhead** beyond compilation, which is why its numbers
  sit ~1.7 s above the raw `tsc` emit.
- The numbers describe the migrated codebase. They are not what you would have
  measured before the migration, because before it two of the three compilers refused
  to run.

## Recommendation

**Do not adopt 6.0.3 for speed** — it is slower. Adopt it for the migration itself:
it forces the `baseUrl` removal that 7.0 requires anyway, and its stricter defaults
surfaced a real latent bug (see below). It is the stepping stone, not the destination.

**7.0.2 is adoptable today for build and type-check** — but not by making it the only
compiler. See "Adopting 7.0.2 side by side" below.

## Adopting 7.0.2 side by side

Making 7.0.2 the project's only compiler does not work. TypeScript 7 removed the
classic compiler API — `require('typescript')` now returns just
`{ version, versionMajorMinor }` — so every tool that drives the compiler
programmatically breaks: `@nestjs/cli`, `ts-jest`, `ts-node`, `ts-node-dev` and
`typescript-eslint`. That is **14 of 26 npm scripts**. `typescript-eslint@8.68.0`
detects `major >= 7` and throws on purpose; support is tracked for TS ≥ 7.1 in
[issue 10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940).
Upgrading does not help — `@nestjs/cli@12.0.0`, the current release, still calls
`getParsedCommandLineOfConfigFile`.

The 7.0 announcement documents a side-by-side layout instead, which this project now
uses (commit `e4079be`):

```json
{
  "devDependencies": {
    "typescript": "^6.0.3",
    "@typescript/native": "npm:typescript@^7.0.2"
  }
}
```

`typescript` stays the package everything resolves through, so the existing toolchain
is untouched. `@typescript/native` supplies the native binary for the paths that
benefit. Both ship a `tsc` bin, so the scripts address the native one by path rather
than relying on which npm links:

```json
{
  "prebuild": "node -e \"require('fs').rmSync('dist',{recursive:true,force:true})\"",
  "build": "node node_modules/@typescript/native/bin/tsc -p tsconfig.build.json",
  "typecheck": "node node_modules/@typescript/native/bin/tsc -p tsconfig.json --noEmit"
}
```

`nest build` is replaced by a direct native `tsc` call — the CLI cannot drive 7.0.2,
and `nest-cli.json` configures nothing beyond `deleteOutDir`, which `prebuild` covers.
It remains available as `build:nest` on the TS 6 path.

Measured on this layout:

| Command             |                 Before |      After |      Gain |
| ------------------- | ---------------------: | ---------: | --------: |
| `npm run build`     | 4511 ms (`nest build`) | **408 ms** | **11.1×** |
| `npm run typecheck` |         2706 ms (TS 6) | **427 ms** |  **6.3×** |

Verified: the native build emits 141 files carrying the same 243 `design:type`
entries, the app boots and maps 81 routes, `nest build` still succeeds, 26 suites /
50 tests pass, type-aware lint and prettier are clean, and `npm ci` reproduces the
layout.

Revisit collapsing to a single compiler when `typescript-eslint` and `@nestjs/cli`
support the TS 7 API.

### Latent bug surfaced by the migration

`MailerService.transporter` is assigned inside `async init()`, which the constructor
calls as `void this.init()`. It is therefore **not** assigned when the constructor
returns, and any `sendMail` arriving before that promise settles hits `undefined`.
The migration used a definite-assignment assertion to preserve existing runtime
behaviour, which means the assertion is currently lying. This predates the migration
and deserves a separate fix.

### Peer dependency status

`ts-jest` (`>=4.3 <6`) and `typescript-eslint` (`>=4.8.4 <5.9.0`) both declare peer
ranges excluding 6.0.3. npm overrides them and both work — 26 suites / 50 tests pass,
eslint runs clean — but they are not yet formally compatible.

## Reproducing

```bash
bash docs/typescript-benchmark/run-benchmark.sh 5.8.2
bash docs/typescript-benchmark/run-benchmark.sh 6.0.3
bash docs/typescript-benchmark/run-benchmark.sh 7.0.2
```

Roughly 7 minutes per version. The harness:

- Installs each compiler into its own prefix under `.compilers/`, so `tsc` scenarios
  never touch project dependencies.
- Swaps `node_modules/typescript` for the `nest build` scenario by **moving
  directories**, not by running `npm install`. An `npm install --no-package-lock`
  makes npm ignore the lockfile and re-resolve the whole tree, which silently drifts
  unrelated packages between versions and destroys comparability.
- Runs a compatibility gate first and records exit codes with every timing, so a
  compiler that aborts early cannot be mistaken for a fast one. This mattered: 6.0.3
  initially "won" the cold type-check at 1471 ms purely because `TS5101` aborted it
  before type-checking began.
- Discards a warm-up run, then times 10, reporting the median.

Raw output, per-run timings and gate results are in
`docs/typescript-benchmark/results/`.
