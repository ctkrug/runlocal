import { describe, it, expect } from "vitest";
import { solve, estimateModelSizeBytes, estimateKvCacheBytes } from "../src/core/solver.js";
import { getGpuById } from "../src/data/hardware.js";
import { getModelById } from "../src/data/models.js";
import { getQuantById } from "../src/data/quant.js";

describe("solve", () => {
  it("fully offloads Llama-3-8B (Q4_K_M) onto an RTX 3060 12GB", () => {
    const result = solve({
      gpu: getGpuById("rtx-3060-12gb"),
      model: getModelById("llama-3-8b"),
      quant: getQuantById("q4_k_m"),
      contextTokens: 4096,
      systemRamGb: 32,
    });

    expect(result.fitsFully).toBe(true);
    expect(result.gpuLayers).toBe(result.totalLayers);
    expect(result.tokPerSec).toBeGreaterThan(0);
    expect(Number.isFinite(result.tokPerSec)).toBe(true);
  });

  it("estimates higher throughput for full offload than partial offload", () => {
    const gpu = getGpuById("rtx-3060-12gb");
    const model = getModelById("llama-3-70b");
    const quant = getQuantById("f16");

    const partial = solve({ gpu, model, quant, contextTokens: 4096, systemRamGb: 64 });
    const fasterGpu = solve({
      gpu: getGpuById("rtx-4090-24gb"),
      model: getModelById("llama-3-8b"),
      quant: getQuantById("q4_k_m"),
      contextTokens: 4096,
      systemRamGb: 64,
    });

    expect(partial.gpuLayers).toBeLessThan(partial.totalLayers);
    expect(fasterGpu.fitsFully).toBe(true);
    expect(fasterGpu.tokPerSec).toBeGreaterThan(partial.tokPerSec);
  });

  it("flags a model that cannot fit in VRAM + system RAM combined", () => {
    const result = solve({
      gpu: getGpuById("rtx-3060-12gb"),
      model: getModelById("llama-3-70b"),
      quant: getQuantById("f16"),
      contextTokens: 4096,
      systemRamGb: 4,
    });

    expect(result.fitsAtAll).toBe(false);
  });

  it("grows the KV cache estimate with context length", () => {
    const gpu = getGpuById("rtx-4090-24gb");
    const model = getModelById("llama-3-8b");
    const quant = getQuantById("q4_k_m");

    const short = solve({ gpu, model, quant, contextTokens: 2048, systemRamGb: 32 });
    const long = solve({ gpu, model, quant, contextTokens: 16384, systemRamGb: 32 });

    expect(long.kvCacheGb).toBeGreaterThan(short.kvCacheGb);
  });
});

describe("estimateModelSizeBytes / estimateKvCacheBytes — boundaries", () => {
  it("returns zero KV cache bytes for a zero-token context", () => {
    const model = getModelById("llama-3-8b");
    expect(estimateKvCacheBytes(model, 0)).toBe(0);
  });

  it("scales model size bytes linearly with bytes-per-param", () => {
    const model = getModelById("llama-3-8b");
    const q4 = estimateModelSizeBytes(model, getQuantById("q4_k_m"));
    const f16 = estimateModelSizeBytes(model, getQuantById("f16"));
    expect(f16).toBeCloseTo(q4 * (2.0 / 0.55), 5);
  });
});

describe("solve — zero-VRAM boundary", () => {
  it("offloads nothing to GPU and still estimates a finite positive CPU-only tok/s", () => {
    const result = solve({
      gpu: { id: "zero", label: "Zero VRAM", vramGb: 0, bandwidthGBs: 400 },
      model: getModelById("llama-3-8b"),
      quant: getQuantById("q4_k_m"),
      contextTokens: 4096,
      systemRamGb: 64,
    });

    expect(result.gpuLayers).toBe(0);
    expect(result.cpuLayers).toBe(result.totalLayers);
    expect(result.fitsFully).toBe(false);
    expect(Number.isFinite(result.tokPerSec)).toBe(true);
    expect(result.tokPerSec).toBeGreaterThan(0);
  });
});

describe("solve — offload plans across quant/model combinations", () => {
  const contextTokens = 4096;
  const systemRamGb = 64;

  const cases = [
    { gpuId: "rtx-4090-24gb", modelId: "llama-3-8b", quantId: "q4_k_m", expectedGpuLayers: 32 },
    { gpuId: "rtx-4090-24gb", modelId: "qwen2.5-14b", quantId: "f16", expectedGpuLayers: 31 },
    { gpuId: "rtx-3060-12gb", modelId: "mistral-7b", quantId: "q5_k_m", expectedGpuLayers: 32 },
    { gpuId: "rtx-3060-12gb", modelId: "llama-3-70b", quantId: "q4_k_m", expectedGpuLayers: 1 },
    { gpuId: "rtx-4060-ti-16gb", modelId: "phi-3-medium", quantId: "q8_0", expectedGpuLayers: 34 },
  ];

  it.each(cases)(
    "solves $modelId @ $quantId on $gpuId to $expectedGpuLayers gpu layers",
    ({ gpuId, modelId, quantId, expectedGpuLayers }) => {
      const result = solve({
        gpu: getGpuById(gpuId),
        model: getModelById(modelId),
        quant: getQuantById(quantId),
        contextTokens,
        systemRamGb,
      });

      expect(result.gpuLayers).toBe(expectedGpuLayers);
      expect(Number.isFinite(result.tokPerSec)).toBe(true);
      expect(result.tokPerSec).toBeGreaterThan(0);
    }
  );
});
