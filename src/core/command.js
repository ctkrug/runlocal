// Turns a solved offload plan into a copy-paste-ready llama.cpp command.
// Ollama and other backends are tracked in docs/BACKLOG.md.
export function buildLlamaCppCommand({ model, quant, contextTokens, gpuLayers }) {
  const modelFile = `${model.id}.${quant.label}.gguf`;
  return [
    "llama-cli",
    `-m ${modelFile}`,
    `--n-gpu-layers ${gpuLayers}`,
    `--ctx-size ${contextTokens}`,
  ].join(" \\\n  ");
}
