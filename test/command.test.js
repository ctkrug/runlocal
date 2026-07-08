import { describe, it, expect } from "vitest";
import { buildLlamaCppCommand } from "../src/core/command.js";
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
