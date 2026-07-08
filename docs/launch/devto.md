---
title: "Runlocal: computing the exact llama.cpp launch command for your GPU"
published: false
tags: llm, javascript, localllm, webdev
---

Every guide for running an LLM locally tells you to "check if it fits in your VRAM" and then
stops. That advice is close to useless. Whether a model fits, and how fast it runs, depends on
the quantization format, the context length you want, and how many transformer layers you offload
to the GPU versus the CPU. None of that is a single number you can eyeball.

So I built [Runlocal](https://apps.charliekrug.com/runlocal/): you pick a GPU, your system RAM, a
model, and a quant level, and it hands you the exact `llama.cpp` or `Ollama` command with the
right `--n-gpu-layers` and context size, plus an honest tokens/sec estimate. It is a static
browser page with no backend. Here are the two decisions that made it work.

## The memory math is smaller than it looks

The whole tool rests on two formulas. Weight size is straightforward:

```
weightBytes = paramsBillion * 1e9 * bytesPerParam
```

`bytesPerParam` is the quant table: roughly 0.55 for Q4_K_M, 0.65 for Q5_K_M, 1.0 for Q8_0, 2.0
for F16. These are approximate (real GGUF files store some tensors at higher precision) but close
enough to decide fit and offload.

The KV cache is the part people forget, and it grows with context:

```
kvCacheBytes = 2 * layers * hiddenSize * contextTokens * 2
```

The first `2` is key plus value; the second is two bytes per fp16 element. Bump your context from
4K to 32K and the cache can eat gigabytes of the VRAM you were counting on for weights.

The offload solver is then just: reserve the KV cache and a fixed runtime overhead, divide the
remaining VRAM by the per-layer size, and floor it.

```js
const availableVramBytes = gpu.vramGb * 1e9 - kvCacheBytes - overheadBytes;
const maxLayersInVram = Math.max(0, Math.floor(availableVramBytes / layerBytes));
const gpuLayers = Math.min(model.layers, maxLayersInVram);
```

That single line is the answer to "what do I pass to `--n-gpu-layers`."

## Tokens/sec is a bandwidth problem, not a benchmark

I did not want to ship fake benchmark numbers. Local decoding is memory-bandwidth bound: every
token, the whole active weight set moves through memory once. So the estimate is bytes-moved
divided by bandwidth, split across the GPU and CPU paths:

```js
const gpuSeconds = gpuBytesPerToken / (gpu.bandwidthGBs * 1e9 * EFFICIENCY);
const cpuSeconds = cpuBytesPerToken / (CPU_RAM_BANDWIDTH_GBS * 1e9 * EFFICIENCY);
return 1 / (gpuSeconds + cpuSeconds);
```

`EFFICIENCY` is a single calibration constant, tuned so an RTX 3060 running Llama-3-8B at Q4_K_M
lands near the ~38 tok/s people actually report. The tool labels this an estimate, not a
benchmark, and there is a "why this estimate" panel that prints the exact formula and the numbers
that went into the current result. I would rather show my work than ask for blind trust in one
figure.

## What I would do differently

The KV cache formula assumes full multi-head attention. Most modern models use grouped-query
attention, which makes the real cache smaller, so Runlocal is slightly conservative on
context-heavy setups. Encoding per-model attention groups is the obvious next improvement. I would
also like to pull quant sizes from real GGUF metadata instead of a static table.

Keeping the solver as plain, DOM-free functions paid off: the memory math has 100% line and branch
coverage in Vitest, and I could adversarially test it (negative inputs, absurd context values, a
70B model on an 8GB card) without touching the UI.

Code and live demo:

- Live: https://apps.charliekrug.com/runlocal/
- Source: https://github.com/ctkrug/runlocal
