# Runlocal

**▶ Live demo — [apps.charliekrug.com/runlocal](https://apps.charliekrug.com/runlocal/)**

[![CI](https://github.com/ctkrug/runlocal/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/runlocal/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

The exact launch command for your GPU, RAM, and model. Stop guessing whether a model fits.

Runlocal takes your hardware (GPU + VRAM, system RAM) and the model you want to run, computes the
real memory math (parameters times bytes-per-quant, plus the KV cache your context length needs),
and solves for the optimal `--n-gpu-layers` offload split. It hands you a copy-paste `llama.cpp`
or `Ollama` command and an honest tokens/sec estimate, instead of a vague "probably fits."

## Who it's for

People running open-weight models locally via `llama.cpp` or `Ollama`, on a specific GPU (an
RTX 3060, a used 3090, an M2 Max) who know which model they want but not whether it fits or how
many layers to offload. Runlocal answers both, plus how fast it will decode.

## The wow moment

Pick **RTX 3060 12GB** + **Llama-3-8B**. Instantly get a ready-to-paste command with the correct
`--n-gpu-layers`, context size, and quant pick, plus a **~38 tok/s** estimate:

```sh
llama-cli \
  -m llama-3-8b.Q4_K_M.gguf \
  --n-gpu-layers 32 \
  --ctx-size 4096
```

Toggle to Ollama and the same solved plan becomes:

```sh
OLLAMA_NUM_GPU=32 \
  OLLAMA_CONTEXT_LENGTH=4096 \
  ollama run llama-3-8b:q4_k_m
```

## How it works

1. Pick your GPU (12 presets across NVIDIA consumer, NVIDIA datacenter, and Apple Silicon, or
   enter custom VRAM/bandwidth) and your system RAM.
2. Pick the model (8 options across Llama, Mistral, Qwen, and Phi) and a quantization level
   (Q4_K_M, Q5_K_M, Q8_0, F16).
3. Runlocal solves the offload split: how many transformer layers fit in VRAM given the model's
   per-layer size and the KV cache your context length demands.
4. It emits the exact `llama.cpp` or `Ollama` command and an estimated tokens/sec derived from
   memory bandwidth and the GPU/CPU offload ratio. A won't-fit combination shows a warning
   instead of a misleadingly valid command, and the "why this estimate" panel shows the exact
   formula and numbers behind it.

## Why it exists

Every local-LLM guide says "check if it fits in VRAM" and stops there. Quantization format changes
the footprint non-linearly, context length grows the KV cache, and partial GPU offload is common
but nobody tells you how many layers to offload or what it costs you in speed. Runlocal answers the
actual question: what command do I run, and how fast will it be?

## Stack

Vanilla JavaScript (ES modules), [Vite](https://vitejs.dev) for bundling, and
[Vitest](https://vitest.dev) for the memory-math test suite. No backend, no framework: it is a
static site, and the offload solver and command builders are plain, unit-tested functions
(100% line/branch coverage on `src/core` and `src/data`).

## Local development

```sh
npm install
npm run dev            # start the dev server
npm test               # run the vitest suite
npm run test:coverage  # suite with coverage
npm run lint           # eslint
npm run build          # production build to dist/
```

## Documentation

- [`docs/VISION.md`](docs/VISION.md): the problem, the audience, and the design decisions.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): the module map and data flow.
- [`docs/DESIGN.md`](docs/DESIGN.md): the blueprint/technical visual direction and tokens.
- [`docs/BACKLOG.md`](docs/BACKLOG.md): the shipped story breakdown.

## License

MIT. See [LICENSE](LICENSE).

---

More of Charlie's projects → [apps.charliekrug.com](https://apps.charliekrug.com)
