# Backlog — Runlocal

Stories are marked `[ ]` until shipped. Every story lists concrete, checkable acceptance
criteria — no vibes. The first story of Epic 1 is the wow moment; nothing else ships before it.

## Epic 1 — Core memory solver (the wow moment)

- [x] **Hardware + model DB seeded with real specs**
  - RTX 3060 12GB and Llama-3-8B are both selectable in their respective dropdowns.
  - Selecting that pair produces a non-empty launch command and a numeric tok/s estimate greater
    than zero.
- [x] **Quant-aware memory math**
  - Switching quant level (Q4_K_M/Q5_K_M/Q8_0/F16) for the same model changes the displayed
    model size estimate.
  - Increasing context length increases the KV cache size estimate, all else held equal.
- [x] **GPU-layer offload solver**
  - For a model+VRAM combination that fits entirely, `gpuLayers` equals the model's total layer
    count.
  - For a combination that doesn't fully fit, `gpuLayers` is strictly less than the total layer
    count and greater than zero when partial offload is possible.
- [x] **Tokens/sec estimator from bandwidth + offload ratio**
  - For the same model on the same GPU, a fully-offloaded configuration estimates a higher tok/s
    than a partially-offloaded one.
  - The estimate is a finite positive number for every supported GPU/model/quant combination in
    the seeded databases.
- [x] **Design polish — blueprint console**
  - Page uses Space Grotesk (display) and JetBrains Mono (UI/mono) per `docs/DESIGN.md`.
  - The blueprint grid background, panel glow, and corner spec-plate signature detail are present
    and match the token values in `docs/DESIGN.md`.

## Epic 2 — Launch command generation

- [ ] **llama.cpp command builder**
  - Generated command includes `--n-gpu-layers`, `--ctx-size`, and a model file reference.
  - Command has no syntax errors when dry-parsed as a shell command line (no unescaped quotes,
    no unclosed line continuations).
- [ ] **Ollama command equivalent**
  - A backend toggle switches between `llama.cpp` and `Ollama` command syntax while preserving
    the same solved `gpuLayers`/context values.
- [ ] **Copy-to-clipboard with confirmation**
  - Clicking the copy button copies the exact command text (verified via `navigator.clipboard`
    write call receiving the same string shown on screen).
  - The button shows a "Copied" state for ~2 seconds before reverting.
- [ ] **Warning state for won't-fit combinations**
  - Selecting a model whose weights + KV cache exceed VRAM **and** system RAM combined shows a
    visible red warning instead of a misleadingly "valid" command.

## Epic 3 — Data coverage & responsive UX

- [ ] **Expand hardware database**
  - At least 10 GPUs spanning NVIDIA consumer, NVIDIA datacenter, and Apple Silicon unified
    memory, each with sourced `vramGb` and `bandwidthGBs`.
- [ ] **Expand model database**
  - At least 8 models spanning Llama, Mistral, Qwen, and Phi families at commonly-run sizes.
- [ ] **Custom hardware input**
  - A "custom" hardware option accepts manually entered VRAM (GB) and bandwidth (GB/s) and feeds
    the same solver path as a preset GPU.
- [ ] **Mobile-responsive layout**
  - No horizontal scroll and every control remains usable (tap targets ≥44px) at 390px, 768px,
    and 1440px viewport widths.

## Epic 4 — Quality & trust

- [ ] **Unit tests for memory math**
  - Vitest suite covers at least 5 distinct quant/model combinations with asserted expected
    `gpuLayers` values and confirms `tokPerSec` is always a finite positive number.
- [ ] **"Why this estimate" methodology panel**
  - An expandable panel shows the formula and the specific input values used to produce the
    current command and tok/s number.
- [ ] **Accuracy disclaimer**
  - The UI states, in visible text (not just a tooltip), that tok/s is a bandwidth-bound estimate
    and links to the methodology panel above.
