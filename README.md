# Runlocal

[![CI](https://github.com/ctkrug/runlocal/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/runlocal/actions/workflows/ci.yml)

**Stop guessing whether a model fits your GPU. Get the exact launch command.**

Runlocal takes your hardware (GPU + VRAM, system RAM) and the model you want to run, and
computes the actual memory math — parameters × bytes-per-quant + KV cache overhead — to solve
for the optimal `--n-gpu-layers` offload split. It hands you a copy-paste-ready `llama.cpp` or
`Ollama` launch command, plus an honest tokens/sec estimate, instead of a vague "probably fits."

## Why

Every local-LLM guide says "check if it fits in VRAM" and stops there. It doesn't. Quantization
format changes memory footprint non-linearly, context length grows the KV cache, and partial GPU
offload is common but nobody tells you *how many layers* to offload or *what that costs you* in
speed. Runlocal answers the actual question: **what command do I run, and how fast will it be?**

## The wow moment

Pick **RTX 3060 12GB** + **Llama-3-8B**. Instantly get a ready-to-paste `llama.cpp` command with
the correct `--n-gpu-layers`, context size, and quant pick — plus a **~38 tok/s** estimate.

## How it works

1. Pick your GPU (or enter custom VRAM/bandwidth) and system RAM.
2. Pick the model and a quantization level (Q4_K_M, Q5_K_M, Q8_0, F16).
3. Runlocal solves the offload split: how many transformer layers fit in VRAM given the model's
   per-layer size and the KV cache your context length demands.
4. It emits the exact `llama.cpp` / `Ollama` command and an estimated tokens/sec derived from
   memory bandwidth and the GPU/CPU offload ratio.

## Stack

Vanilla JavaScript (ES modules), [Vite](https://vitejs.dev) for bundling, and
[Vitest](https://vitest.dev) for the memory-math test suite. No backend — it's a static site
that ships to `apps.charliekrug.com/runlocal`. No framework, no build magic: the offload solver
and command builders are plain, testable functions.

## Status

Early scope/build phase — see [`docs/VISION.md`](docs/VISION.md) for the full plan and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the story breakdown.

## License

MIT — see [LICENSE](LICENSE).
