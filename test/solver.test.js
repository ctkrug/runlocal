import { describe, it, expect } from "vitest";
import { solve } from "../src/core/solver.js";
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
