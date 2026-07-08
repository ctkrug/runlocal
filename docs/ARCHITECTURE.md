# Architecture — Runlocal

A static, zero-backend Vite app. No framework — plain ES modules and direct DOM manipulation.

## Data flow

```
src/data/{hardware,models,quant}.js   — static lookup tables (GPUs, models, quant formats)
              │
              ▼
src/core/solver.js   solve({gpu, model, quant, contextTokens, systemRamGb})
              │        → { modelSizeGb, kvCacheGb, gpuLayers, cpuLayers,
              │            fitsFully, fitsAtAll, tokPerSec, ... }
              ▼
src/core/command.js  buildLlamaCppCommand(...) / buildOllamaCommand(...)
              │        → launch command string
              ▼
src/main.js   reads form inputs (via core/parse.js) → solve() → build*Command()
              → renders command, offload bar, readout, warning, methodology panel
```

`src/core/*` has no DOM dependency — it's plain, unit-tested functions. `src/main.js` is the
only module that touches `document`/`navigator`.

## Key files

- `src/core/solver.js` — the memory math. `estimateModelSizeBytes` (params × bytes/param),
  `estimateKvCacheBytes` (`2 × layers × hiddenSize × contextTokens × 2 bytes`), and `solve()`
  (how many layers fit in VRAM after KV cache + runtime overhead, then GPU/CPU bandwidth-bound
  tok/s). `BANDWIDTH_EFFICIENCY` is the single calibration constant, exported for the UI's
  methodology panel.
- `src/core/command.js` — turns a solved plan into a `llama.cpp` (`--n-gpu-layers`/`--ctx-size`
  flags) or `Ollama` (`OLLAMA_NUM_GPU`/`OLLAMA_CONTEXT_LENGTH` env vars) command string.
- `src/core/parse.js` — `parseClampedNumber(rawValue, {fallback, min, max, round})`: the pure
  logic behind every numeric `<input>` read (context tokens, system RAM, custom VRAM/bandwidth).
  Falls back to a default on empty/non-numeric/zero input, clamps otherwise-valid values into
  `[min, max]`, and optionally rounds — so a negative or scientific-notation-scale value never
  reaches the solver or gets embedded verbatim in the emitted command.
- `src/data/hardware.js` — 12 GPUs (NVIDIA consumer, NVIDIA datacenter, Apple Silicon unified
  memory) with `vramGb`/`bandwidthGBs`. A "custom hardware" option is synthesized at runtime in
  `main.js` (`resolveGpu`), not stored here.
- `src/data/models.js` — 8 models across Llama/Mistral/Qwen/Phi with `paramsBillion`/`layers`/
  `hiddenSize` (the shape data the KV-cache and offload math need).
- `src/data/quant.js` — `bytesPerParam` per GGUF quant level (Q4_K_M/Q5_K_M/Q8_0/F16).
- `src/main.js` — form state, backend toggle (llama.cpp/Ollama), the typed-command reveal
  animation (skipped under `prefers-reduced-motion`), offload bar, won't-fit warning, clipboard
  copy, and the "why this estimate" methodology panel. Recomputes on `change` (blur/select) and
  on a 200ms-debounced `input` so the plan updates while typing, not just after leaving a field.
- `src/style.css` — blueprint/technical design tokens and component styles; see
  `docs/DESIGN.md` for the design rationale.

## Run / test

```sh
npm install
npm run dev      # dev server
npm test         # vitest — src/core/* unit tests
npm run lint     # eslint
npm run build    # → dist/, static output, base-path-relative for apps.charliekrug.com/runlocal
```

`vite.config.js` sets `base: "./"` so the production build works when served from a subpath.

## Testing approach

`test/solver.test.js`, `test/command.test.js`, `test/parse.test.js`, and `test/data.test.js`
cover `src/core/*` and `src/data/*` directly — no DOM, no mocking — at 100% line/branch coverage
(`npm run test:coverage`). `src/main.js` (DOM wiring) is not unit-tested; it's thin glue over the
tested core functions and is exercised manually (Playwright, headless) per the design
self-review in `docs/DESIGN.md`.
