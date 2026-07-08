import { describe, it, expect } from "vitest";
import { GPUS, getGpuById } from "../src/data/hardware.js";
import { MODELS, getModelById } from "../src/data/models.js";
import { QUANTS, getQuantById } from "../src/data/quant.js";

describe("data getters — unknown id boundary", () => {
  it("returns undefined for an unknown GPU id", () => {
    expect(getGpuById("does-not-exist")).toBeUndefined();
  });

  it("returns undefined for an unknown model id", () => {
    expect(getModelById("does-not-exist")).toBeUndefined();
  });

  it("returns undefined for an unknown quant id", () => {
    expect(getQuantById("does-not-exist")).toBeUndefined();
  });
});

describe("data coverage", () => {
  it("has at least 10 GPUs with positive vramGb and bandwidthGBs", () => {
    expect(GPUS.length).toBeGreaterThanOrEqual(10);
    GPUS.forEach((gpu) => {
      expect(gpu.vramGb).toBeGreaterThan(0);
      expect(gpu.bandwidthGBs).toBeGreaterThan(0);
    });
  });

  it("has at least 8 models with positive layers and hiddenSize", () => {
    expect(MODELS.length).toBeGreaterThanOrEqual(8);
    MODELS.forEach((model) => {
      expect(model.layers).toBeGreaterThan(0);
      expect(model.hiddenSize).toBeGreaterThan(0);
    });
  });

  it("covers all four supported quant levels", () => {
    expect(Object.keys(QUANTS).sort()).toEqual(["f16", "q4_k_m", "q5_k_m", "q8_0"]);
  });

  it("has unique GPU ids — a duplicate would make one option unreachable", () => {
    const ids = GPUS.map((gpu) => gpu.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique model ids — a duplicate would make one option unreachable", () => {
    const ids = MODELS.map((model) => model.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
