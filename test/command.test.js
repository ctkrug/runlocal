import { describe, it, expect } from "vitest";
import { buildLlamaCppCommand, buildOllamaCommand } from "../src/core/command.js";
import { getModelById } from "../src/data/models.js";
import { getQuantById } from "../src/data/quant.js";

describe("buildLlamaCppCommand", () => {
  it("includes the solved gpu-layers and context flags", () => {
    const command = buildLlamaCppCommand({
      model: getModelById("llama-3-8b"),
      quant: getQuantById("q4_k_m"),
      contextTokens: 4096,
      gpuLayers: 32,
    });

    expect(command).toContain("--n-gpu-layers 32");
    expect(command).toContain("--ctx-size 4096");
    expect(command).toContain("llama-3-8b.Q4_K_M.gguf");
  });
});

describe("buildLlamaCppCommand — zero gpu-layers boundary", () => {
  it("still emits a valid flag when fully CPU-offloaded", () => {
    const command = buildLlamaCppCommand({
      model: getModelById("llama-3-70b"),
      quant: getQuantById("f16"),
      contextTokens: 4096,
      gpuLayers: 0,
    });

    expect(command).toContain("--n-gpu-layers 0");
    expect(command.trimEnd().endsWith("\\")).toBe(false);
  });
});

describe("buildOllamaCommand", () => {
  it("preserves the solved gpu-layers and context as env vars", () => {
    const command = buildOllamaCommand({
      model: getModelById("llama-3-8b"),
      quant: getQuantById("q4_k_m"),
      contextTokens: 4096,
      gpuLayers: 32,
    });

    expect(command).toContain("OLLAMA_NUM_GPU=32");
    expect(command).toContain("OLLAMA_CONTEXT_LENGTH=4096");
    expect(command).toContain("ollama run llama-3-8b:q4_k_m");
  });
});
