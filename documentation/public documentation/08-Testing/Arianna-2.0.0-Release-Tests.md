# AriannA 2.0.0 — Release Tests

**Release candidate:** AriannA 2.0.0
**Test date:** 23 August 2026
**Platform observed:** macOS (`Rigel`)
**Node.js:** v22.23.2
**Primary benchmark suite:** `js-framework-benchmark` / `webdriver-ts`
**Framework variants:** `arianna-v2.0.0-keyed`, `arianna-v2.0.0-non-keyed`

---

## 1. Purpose and release-gate model

This document records the release-validation work performed for AriannA 2.0.0 before commit/tag/publication. It includes the test methodology, observed results, release gates, corrective actions, and diagnostic attempts that were intentionally rejected or superseded.

A **release gate** is a condition that must be satisfied before the release is allowed to advance. Gates are deliberately broader than performance benchmarks: a framework can be fast and still be unpublishable because of type errors, broken package metadata, missing files, CSP incompatibility, invalid benchmark behavior, or an inconsistent repository state.

The gates used for AriannA 2.0.0 were:

1. Source/type correctness.
2. Production build.
3. Benchmark synchronization/build integrity.
4. Functional benchmark plausibility.
5. CPU/DOM benchmark execution.
6. Memory behavior.
7. Repeated create/clear memory stability.
8. CSP compatibility.
9. Browser smoke compatibility.
10. Startup behavior.
11. Distribution size.
12. npm package structure.
13. Distribution-artifact presence.
14. Repository/staging cleanliness.
15. Final publication gate.

---

## 2. Source/type correctness gate — PASS

### Method

From the AriannA repository root:

```bash
npm run typecheck
```

This invokes:

```text
tsc --noEmit
```

The purpose is to compile-check the TypeScript source graph without emitting output. Any TypeScript error would block the release.

### Result

**PASS.** No TypeScript diagnostics were emitted.

### Gate interpretation

This confirms that the source accepted by the TypeScript compiler is internally type-consistent under the project's current `tsconfig.json`. It does not by itself prove browser runtime correctness, hence the separate runtime and benchmark gates below.

---

## 3. Production build gate — PASS

### Method

```bash
npm run build
```

which invokes:

```text
node scripts/build.mjs
```

The build produces the complete distribution, minified variants, gzip artifacts, declarations, benchmark synchronization, and the single-file TypeScript aggregator.

### Observed output

| Artifact | Built | Minified | Gzip built | Minified gzip |
|---|---:|---:|---:|---:|
| `arianna` | 958.4 KB | 240.6 KB | 173.1 KB | 63.5 KB |
| `arianna-runtime` | 251.4 KB | 60.9 KB | 43.1 KB | 18.5 KB |
| `arianna-components` | 2.89 MB | 925.9 KB | 307.5 KB | 158.6 KB |
| `arianna-additionals` | 438.4 KB | 233.9 KB | 105.7 KB | 72.9 KB |

Declarations:

```text
✓ tsc → types/dist/*.d.ts (224 files)
✓ dts → release/dist/arianna.d.ts     (1.6 KB)
✓ dts → release/dist/arianna.min.d.ts (1.6 KB)
```

Single-file aggregator:

```text
✓ aggregate → release/dist/AriannA.ts (6.82 MB, 224 files)
```

Final build:

```text
✓ release/dist build complete in 16711 ms
```

A subsequent build after the CHANGELOG correction also completed successfully in 18,509 ms.

### Gate interpretation

**PASS.** All expected production build stages completed without errors.

---

## 4. Benchmark synchronization gate — PASS

### Method

The production build automatically synchronized the current runtime and declarations into both official `js-framework-benchmark` implementations and compiled the benchmark `Main.ts` into `Main.js`.

### Observed output

Keyed:

```text
✓ runtime   → ../arianna-benchmarks/js-framework-benchmark/frameworks/keyed/arianna/src/arianna.min.js
✓ types     → ../arianna-benchmarks/js-framework-benchmark/frameworks/keyed/arianna/src/arianna.min.d.ts
✓ benchmark → ../arianna-benchmarks/js-framework-benchmark/frameworks/keyed/arianna/src/Main.js
              (1 compiled, 0 promoted, 0 dynamic)
```

Non-keyed:

```text
✓ runtime   → ../arianna-benchmarks/js-framework-benchmark/frameworks/non-keyed/arianna/src/arianna.min.js
✓ types     → ../arianna-benchmarks/js-framework-benchmark/frameworks/non-keyed/arianna/src/arianna.min.d.ts
✓ benchmark → ../arianna-benchmarks/js-framework-benchmark/frameworks/non-keyed/arianna/src/Main.js
              (1 compiled, 0 promoted, 0 dynamic)
```

### Gate interpretation

**PASS.** The benchmark does not run against a stale hand-copied runtime: the release build synchronizes the runtime under test into both keyed and non-keyed benchmark implementations.

---

## 5. Official CPU/DOM benchmark gate — PASS

### Methodology

AriannA was exercised with the official `js-framework-benchmark` operations. The full CPU run used the benchmark runner's normal repeated measurements and generated result JSON files for keyed and non-keyed variants.

The recorded CPU suite included:

- `01_run1k` — create 1,000 rows
- `02_replace1k` — replace 1,000 rows
- `03_update10th1k_x16` — partial update
- `04_select1k` — select a row
- `05_swap1k` — swap rows
- `06_remove-one-1k` — remove one row
- `07_create10k` — create 10,000 rows
- `08_create1k-after1k_x2` — append rows
- `09_clear1k_x8` — clear rows

The benchmark's plausibility checks validate that the operation actually produces the expected DOM state; therefore a timing number alone is not treated as success.

### Recorded medians

Values below are the recorded **total-duration medians in milliseconds** from the validated run.

| Benchmark | Keyed median | Non-keyed median |
|---|---:|---:|
| `01_run1k` | 81.5 ms | 96.3 ms |
| `02_replace1k` | 141.9 ms | 59.7 ms |
| `03_update10th1k_x16` | 75.7 ms | 71.3 ms |
| `04_select1k` | 14.5 ms | 13.7 ms |
| `05_swap1k` | 69.1 ms | 49.4 ms |
| `06_remove-one-1k` | 65.7 ms | 108.2 ms |
| `07_create10k` | 1514.4 ms | 1440.0 ms |
| `08_create1k-after1k_x2` | 105.5 ms | 94.2 ms |
| `09_clear1k_x8` | 54.0 ms | 57.1 ms |

The runner also split CPU results into total/script/paint measurements. For example, the validated `01_run1k` run reported:

**Keyed**
- total median: 81.5 ms
- script median: 10.8 ms
- paint median: 69.6 ms

**Non-keyed**
- total median: 96.3 ms
- script median: 11.8 ms
- paint median: 83.3 ms

### Gate interpretation

**PASS.** Both benchmark variants executed the standard operations and produced valid result files. These numbers describe the measured machine/session and are not claimed to be universal cross-machine performance constants.

---

## 6. Functional plausibility gate — PASS

### Methodology

`js-framework-benchmark` performs a `PlausibilityCheck` after benchmark execution. This is important because a framework could otherwise obtain an artificially low timing by failing to perform the required DOM operation.

### Observed result

Repeated benchmark and smoke runs ended with:

```text
==== Results of PlausibilityCheck:
successful run
```

This was observed for the principal CPU tests and the targeted smoke runs.

### Gate interpretation

**PASS.** The benchmark runner accepted the resulting behavior as plausible/valid rather than merely recording timings.

---

## 7. Memory gate — PASS

### Methodology

The official memory benchmarks were run for both keyed and non-keyed AriannA. The suite forces garbage collection where supported by the runner and measures memory after defined benchmark states.

The tested memory scenarios were:

- `21_ready-memory` — baseline/ready memory
- `22_run-memory` — memory after creating 1,000 rows
- `25_run-clear-memory` — memory after creating and clearing 1,000 rows for 5 cycles
- `26_run-10k-memory` — memory after creating 10,000 rows

### Recorded results

Values are MiB as reported by the benchmark runner.

| Memory benchmark | Keyed | Non-keyed |
|---|---:|---:|
| `21_ready-memory` | 0.7664 MiB | 0.7709 MiB |
| `22_run-memory` | 3.0805 MiB | 3.0646 MiB |
| `25_run-clear-memory` | 1.0884 MiB | 1.0938 MiB |
| `26_run-10k-memory` | 22.4444 MiB | 21.9359 MiB |

### Interpretation

The particularly important release signal is `25_run-clear-memory`: after five create/clear cycles, memory returned to approximately 1.09 MiB for both implementations rather than remaining near the 1k/10k populated-state memory levels.

The test was also repeated many times. Representative repeated `25_run-clear-memory` observations stayed tightly clustered around roughly:

- keyed: ~1.08–1.09 MiB
- non-keyed: ~1.09 MiB

One later keyed observation was ~1.057 MiB, still lower rather than indicating retained growth.

### Gate interpretation

**PASS.** No monotonic retained-memory growth was demonstrated by the official repeated create/clear test.

This is a release leak-screening gate, not a mathematical proof that no memory leak can exist in any application workload.

---

## 8. Memory-torture investigation

### Initial custom attempt — NOT USED AS RELEASE EVIDENCE

A custom `memory-torture.mjs` was initially considered to perform many create/remove/add/clear cycles. That script attempted:

```js
import ... from "puppeteer"
```

and failed with:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'puppeteer'
```

Inspection showed that the benchmark installation uses `puppeteer-core`, not `puppeteer`.

### Decision

Rather than install or alter dependencies and risk contaminating the benchmark environment, the custom torture approach was abandoned. The release evidence instead uses the benchmark repository's own installed runners and official memory scenarios.

### Why this matters

**No framework code or benchmark dependency was changed merely to make a custom test run.** This preserves the integrity of the benchmark environment.

---

## 9. CSP compatibility gate — PASS for AriannA

### Methodology

The benchmark repository's own CSP checker (`isCSPCompliant.js`) was used.

An initial invocation with `--framework` was discovered not to scope the checker as expected and caused the checker to enumerate many unrelated frameworks. Those unrelated failures are not AriannA failures.

Inspection of `src/isCSPCompliant.ts` showed that framework selection is performed from positional directory arguments matched against names such as:

```text
keyed/arianna
non-keyed/arianna
```

The corrected invocation was:

```bash
node dist/isCSPCompliant.js \
  keyed/arianna \
  non-keyed/arianna
```

### Observed result

```text
Frameworks that will be checked arianna-v2.0.0-keyed arianna-v2.0.0-non-keyed
*** headless false
checking keyed/arianna
checking non-keyed/arianna
```

No AriannA CSP failure followed.

### Gate interpretation

**PASS.** Both AriannA benchmark variants passed the checker when correctly scoped.

### Superseded diagnostic

A prior `npm run checkCSP -- --framework ...` invocation checked many frameworks and printed CSP failures for unrelated projects such as alien-signals, alpine, blazor, etc. Those messages are explicitly **not** evidence against AriannA and were superseded by the correctly scoped positional invocation.

---

## 10. Browser smoke gate — PASS

### Methodology

Targeted smoke tests used the benchmark's `webdriver-afterframe` runner. A smoke test is intentionally a correctness/compatibility check, not a statistically meaningful performance benchmark.

Typical command form:

```bash
node dist/benchmarkRunner.js \
  --runner webdriver-afterframe \
  --browser <browser> \
  --framework keyed/arianna \
  --benchmark 01_run1k \
  --count 1 \
  --smoketest
```

The runner confirmed:

```text
WRITE_RESULTS: false
numIterations...: 1
```

so smoke runs did not overwrite the normal benchmark result set.

### `01_run1k` smoke observations

The browser smoke sequence exercised Chrome, Firefox, Safari and Microsoft Edge through the benchmark runner. Recorded successful/plausible runs included:

| Browser | `01_run1k` measured afterframe duration | Runner duration | Status |
|---|---:|---:|---|
| Chrome | 82.60 ms | 2871.15 ms | PASS |
| Firefox | 58.16 ms | 16803.09 ms | PASS |
| Safari | runner completed | 1079.07 ms | smoke execution observed |
| Microsoft Edge | 123.50 ms | 2963.14 ms | PASS |

An additional successful browser run recorded 71.45 ms / 17902.69 ms in the same browser-validation sequence.

The runner repeatedly reported:

```text
==== Results of PlausibilityCheck:
successful run
```

for the completed afterframe smoke cases.

### Additional update/select browser smoke

`03_update10th1k_x16` and `04_select1k` were also exercised across the browser sequence.

Recorded pairs of afterframe measurements:

| Browser sequence entry | Update | Select | Status |
|---|---:|---:|---|
| Chrome | 22.24 ms | 2.815 ms | PASS |
| Firefox | 8.96 ms | 2.42 ms | PASS |
| Safari | 24.02 ms | 3.22 ms | PASS |
| Microsoft Edge | 22.615 ms | 3.285 ms | PASS |

Each corresponding runner invocation completed with `successful run`.

### Gate interpretation

**PASS as a compatibility smoke gate.** These one-iteration figures must not be presented as browser performance rankings. Their purpose was to establish that AriannA's benchmark operations execute successfully through the available browser runners.

---

## 11. Startup/Lighthouse gate — PASS

### Methodology

The benchmark repository contains a dedicated Lighthouse startup runner (`forkedBenchmarkRunnerLighthouse.ts`). Inspection confirmed that startup is a separate `STARTUP_MAIN` path and uses Lighthouse rather than the normal CPU runner.

The startup subbenchmarks are:

- `31_startup-ci` — consistently interactive
- `32_startup-bt` — script bootup time
- `33_startup-mainthreadcost` — main-thread work cost
- `34_startup-interactive` — interactive

The Lighthouse runner launches Chrome headlessly, disables cache/background features, and runs the performance category against each AriannA benchmark URL.

### Recorded results

**Keyed**

| Metric | Result |
|---|---:|
| consistently interactive | 2254.3868 ms |
| script bootup time | 11.8680 ms |
| main-thread work cost | 714.7720 ms |
| interactive | 2254.3868 ms |

**Non-keyed**

| Metric | Result |
|---|---:|
| consistently interactive | 2104.5816 ms |
| script bootup time | 13.1280 ms |
| main-thread work cost | 209.6360 ms |
| interactive | 2104.5816 ms |

### Gate interpretation

**PASS.** The dedicated Lighthouse startup path executed and returned all four startup metrics for both AriannA variants.

These are Lighthouse measurements from this environment, not promises about startup latency on arbitrary devices/networks.

---

## 12. Distribution-size gate — PASS

### Methodology

The official `40_sizes` benchmark was run as a smoke test for both keyed and non-keyed implementations:

```bash
node dist/benchmarkRunner.js \
  --framework keyed/arianna non-keyed/arianna \
  --benchmark 40_sizes \
  --count 1 \
  --smoketest
```

The size runner loaded each benchmark application and computed transferred/uncompressed benchmark-app size.

### Results

**Keyed**

```text
sizeInfo { size_uncompressed: 67303, size_compressed: 19732 }
```

- uncompressed: **67,303 bytes**
- compressed: **19,732 bytes**

**Non-keyed**

```text
sizeInfo { size_uncompressed: 67267, size_compressed: 19679 }
```

- uncompressed: **67,267 bytes**
- compressed: **19,679 bytes**

Runner:

```text
==> Duration for benchmark 40_sizes: 6899.88 ms

==== Results of PlausibilityCheck:
successful run
```

### Gate interpretation

**PASS.** Both variants were measurable by the official size runner and passed plausibility.

This benchmark-app size is distinct from the complete npm tarball size documented below.

---

## 13. CHANGELOG/metadata gate — PASS after correction

### Initial state

The production build initially reported:

```text
⚠ CHANGELOG.md not found in any candidate path
```

Repository inspection found the changelog at:

```text
documentation/private documentation/CHANGELOG.md
```

while `scripts/build.mjs` expected candidates including root `CHANGELOG.md`.

### Correction

The changelog was copied to the repository root and the build was rerun.

### Result

```text
✓ meta → release/dist/package.json  (generated for dist)
✓ meta → release/dist/README.md     (from README.md)
✓ meta → release/dist/LICENSE       (from LICENSE)
✓ meta → release/dist/CHANGELOG.md  (from CHANGELOG.md)
```

### Gate interpretation

**PASS after correction.** The release distribution now contains the expected release metadata.

---

## 14. npm package-structure gate — INITIAL FAIL, THEN PASS

### Initial dry run

From `release/dist`:

```bash
npm pack --dry-run
```

initially produced only:

```text
CHANGELOG.md
LICENSE
README.md
package.json
```

with:

```text
package size: 10.7 kB
unpacked size: 27.4 kB
total files: 4
```

### Root cause

`release/dist/package.json` was merely a copy of the source package metadata. It still pointed to source-tree paths such as:

```json
"main": "./core/index.ts",
"module": "./core/index.ts",
"types": "./types/arianna.d.ts"
```

and its `files` whitelist referenced directories such as `core/`, `components/`, `additionals/`, `types/`, etc., which are not the structure of `release/dist`.

Therefore npm correctly excluded the generated distribution bundles.

### Correction

`copyMetaFiles()` in `scripts/build.mjs` was changed so the build generates a distribution-specific `package.json` whose entry points reference the actual generated bundles, including:

- `./arianna.js`
- `./arianna.d.ts`
- `./arianna-runtime.js`
- `./arianna-components.js`
- `./arianna-additionals.js`

README, LICENSE and CHANGELOG continue to be copied as metadata.

### Final dry-run result

`npm pack --dry-run` then reported **27 files**:

- `AriannA.ts`
- `CHANGELOG.md`
- `LICENSE`
- `README.md`
- all four unminified JS bundles
- all four minified JS bundles
- gzip outputs
- source maps
- declarations
- generated `package.json`

Tarball details:

```text
name:          arianna
version:       2.0.0
filename:      arianna-2.0.0.tgz
package size:  3.3 MB
unpacked size: 16.3 MB
total files:   27
shasum:        2f5969143e699b0d2bfaf4958c9fb4100289800e
integrity:     sha512-7gEigLQnWNYiq[...]aHPhYUwIkV7HA==
```

### Gate interpretation

**PASS after correction.** This was a genuine release blocker and was fixed before publication.

---

## 15. Distribution-artifact presence gate — PASS

### Methodology

A filesystem integrity test checked that critical release artifacts both exist and have non-zero size.

### Results

```text
PASS release/dist/arianna.js             981429
PASS release/dist/arianna-runtime.js     257427
PASS release/dist/arianna-components.js  3025630
PASS release/dist/arianna-additionals.js 448951
PASS release/dist/arianna.d.ts           1628
PASS release/dist/package.json           1677
```

### Gate interpretation

**PASS.** The critical package entry artifacts physically exist and are non-empty.

---

## 16. Node import diagnostic — EXPECTED ENVIRONMENT MISMATCH, NOT A RELEASE FAILURE

### Attempt

A direct Node ESM import of the browser bundle was attempted:

```js
await import("./release/dist/arianna.js");
```

### Result

Node reported:

```text
ReferenceError: window is not defined
```

at code accessing:

```js
Object.prototype.hasOwnProperty.call(window, "Observer")
```

### Interpretation

This is not used as a failed release gate because the tested artifact is a browser UI framework bundle and expects browser globals during module initialization. A bare Node process does not provide `window`.

Browser execution was validated separately through `js-framework-benchmark`, WebDriver/afterframe and Lighthouse.

The useful conclusion from this diagnostic is that **plain Node importability is not currently a supported test contract for the browser bundle**. It should not be confused with npm package integrity.

---

## 17. Repository hygiene gate — PASS for staged release changes

### Rust/WASM classification

The previously untracked `rust/` directory was inspected:

```text
rust/arianna-wasm/Cargo.lock
rust/arianna-wasm/Cargo.toml
rust/arianna-wasm/src/lib.rs
rust/arianna-wasm/target/...
```

The crate source files are intentional project files. `target/` is generated Rust build output.

`git check-ignore` confirmed the existing ignore rule:

```text
.gitignore:85:**/target/ rust/arianna-wasm/target/CACHEDIR.TAG
```

so generated Rust target artifacts are excluded.

### Final staged state

```text
A  CHANGELOG.md
A  rust/arianna-wasm/Cargo.lock
A  rust/arianna-wasm/Cargo.toml
A  rust/arianna-wasm/src/lib.rs
M  scripts/build.mjs
```

### Diff validation

```bash
git diff --cached --stat
git diff --cached --check
```

reported:

```text
CHANGELOG.md                 | 306 +...
rust/arianna-wasm/Cargo.lock |   7 +++
rust/arianna-wasm/Cargo.toml |  14 +++++
rust/arianna-wasm/src/lib.rs |   5 ++
scripts/build.mjs            |  81 +...
5 files changed, 410 insertions(+), 3 deletions(-)
```

`git diff --cached --check` produced **no output**, meaning no whitespace-error diagnostics were found in the staged diff.

`git status` showed the five intended staged changes.

### Gate interpretation

**PASS for the release staging state observed before commit.**

---

## 18. System-load preparation

Before rerunning performance-sensitive tests, system load was inspected with `top`.

A Google Chrome process was observed consuming approximately 100% CPU and was terminated. Afterward:

```text
CPU usage: 3.90% user, 6.15% sys, 89.94% idle
PhysMem: 32G used, 32G unused
swapins: 0
swapouts: 0
```

This does not make the machine a laboratory-controlled benchmark host, but it removed an obvious competing 100%-CPU browser process before clean reruns.

---

## 19. Smoke-test semantics

The `--smoketest` runs used during browser and targeted checks are intentionally distinct from full performance measurements.

Observed smoke configuration included:

```text
NUM_ITERATIONS_FOR_BENCHMARK_MEM: 1
NUM_ITERATIONS_FOR_BENCHMARK_STARTUP: 1
NUM_ITERATIONS_FOR_BENCHMARK_SIZE: 1
WRITE_RESULTS: false
EXIT_ON_ERROR: true
```

For targeted commands, `--count 1` set the execution count to one.

Therefore:

- smoke results are valid evidence of execution/correctness/plausibility;
- they are **not** used as statistically robust browser performance comparisons;
- normal benchmark JSON results remain separate from smoke execution because `WRITE_RESULTS` is false.

---

## 20. Release gate summary

| Gate | Status | Evidence / meaning |
|---|---|---|
| TypeScript typecheck | **PASS** | `tsc --noEmit`, no errors |
| Production build | **PASS** | all bundles/minification/gzip/declarations generated |
| Benchmark synchronization | **PASS** | current runtime/types/Main.js synchronized to keyed + non-keyed |
| CPU/DOM benchmark execution | **PASS** | full standard operations produced result data |
| Plausibility | **PASS** | benchmark reported `successful run` |
| Memory baseline/1k/10k | **PASS** | official memory benchmarks completed |
| Repeated create/clear memory | **PASS** | ~1.09 MiB after five cycles; repeated stable runs |
| Custom memory torture | **NOT USED** | rejected after missing `puppeteer`; no dependency contamination |
| CSP | **PASS** | correctly scoped checker processed keyed + non-keyed without AriannA failure |
| Browser smoke | **PASS** | Chrome/Firefox/Safari/Edge sequence exercised; successful targeted runs |
| Update/select browser smoke | **PASS** | targeted operations completed across browser sequence |
| Lighthouse startup | **PASS** | four startup metrics returned for keyed + non-keyed |
| Official size benchmark | **PASS** | ~19.7 KB compressed benchmark app for both variants |
| CHANGELOG metadata | **PASS after fix** | root CHANGELOG included in dist |
| npm package dry run | **PASS after fix** | 27 files, 3.3 MB tarball |
| npm package entry structure | **PASS after fix** | generated dist-specific package metadata |
| Critical artifact existence | **PASS** | six critical files present/non-empty |
| Bare Node browser-bundle import | **N/A** | expected `window` mismatch; browser bundle is not bare-Node contract |
| Rust build-output hygiene | **PASS** | `**/target/` ignored |
| Staged diff whitespace | **PASS** | `git diff --cached --check` empty |
| Staged release state | **PASS** | five intentional changes staged |
| Commit/tag/push/npm publish | **PENDING** | intentionally not executed yet |

---

## 21. Corrective actions discovered by testing

The release process caught real issues rather than merely confirming an already-perfect build:

1. **Missing root CHANGELOG**
   - Build warned that `CHANGELOG.md` could not be found.
   - Root release changelog was established.
   - Rebuild confirmed inclusion.

2. **Broken npm distribution metadata**
   - Initial tarball contained only 4 files / 10.7 kB.
   - Cause: source-oriented `package.json` copied unchanged into `release/dist`.
   - `scripts/build.mjs` was corrected to generate dist-oriented metadata.
   - Final tarball contains 27 files / 3.3 MB.

3. **Incorrect CSP invocation**
   - `--framework` invocation did not scope the CSP tool as assumed.
   - Source inspection identified positional `keyed/arianna` / `non-keyed/arianna` matching.
   - Corrected run scoped the test to AriannA.

4. **Custom memory-torture dependency mismatch**
   - Custom script expected `puppeteer`, while benchmark uses `puppeteer-core`.
   - Rather than mutate dependencies, custom script was abandoned.
   - Official benchmark memory runners were retained as release evidence.

5. **Bare Node import was an invalid browser-runtime test**
   - `window is not defined` demonstrated an environment mismatch.
   - Browser execution gates, not bare Node import, are authoritative for the browser bundle.

These corrections are part of the value of the release gates: each prevented an invalid conclusion or an incomplete package from reaching publication.

---

## 22. Final release assessment

At the point represented by this document, **AriannA 2.0.0 satisfies the technical pre-commit release gates that were executed**:

- source typechecks;
- production build completes;
- benchmark runtime is synchronized from the build;
- keyed and non-keyed benchmark implementations execute valid DOM operations;
- CPU, memory, size and startup tests complete;
- repeated create/clear memory measurements remain stable;
- CSP checking succeeds when correctly scoped;
- targeted browser smoke tests succeed;
- the npm distribution now contains the actual generated artifacts;
- critical distribution files exist and are non-empty;
- release metadata is included;
- generated Rust `target/` output is ignored;
- the staged release diff passes Git whitespace checking.

### Remaining publication actions

The following actions were intentionally still pending when this report was prepared:

1. commit the staged release changes;
2. create the local `v2.0.0` tag;
3. optionally rebuild/pack from the immutable committed/tagged state;
4. verify the final tarball/checksum from that immutable state;
5. push commit/tag;
6. publish the npm package.

No claim is made in this report that those publication actions have already occurred.

---

## 23. Release conclusion

**Pre-publication technical status: PASS / RELEASE CANDIDATE READY FOR FINAL COMMIT-TAG VERIFICATION.**

The strongest evidence is not any single timing result. It is the combination of:

- correct compilation,
- reproducible production build,
- benchmark plausibility,
- keyed and non-keyed coverage,
- CPU/DOM exercise,
- memory stability screening,
- CSP validation,
- multi-browser smoke execution,
- Lighthouse startup execution,
- size measurement,
- npm tarball inspection,
- artifact integrity checks,
- and clean staged-source validation.

The release process also detected and corrected a genuine npm packaging blocker before publication, which is precisely what the release-gate process is intended to do.
