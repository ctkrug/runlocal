// Turns a solved offload plan into a copy-paste-ready launch command for
// either supported backend.
export function buildLlamaCppCommand({ model, quant, contextTokens, gpuLayers }) {
  const modelFile = `${model.id}.${quant.label}.gguf`;
  return [
    "llama-cli",
    `-m ${modelFile}`,
    `--n-gpu-layers ${gpuLayers}`,
    `--ctx-size ${contextTokens}`,
  ].join(" \\\n  ");
}

// Ollama derives GPU layer count from OLLAMA_NUM_GPU and context from
// OLLAMA_CONTEXT_LENGTH, so the solved plan is passed as env vars ahead of
// `ollama run` rather than as command flags.
export function buildOllamaCommand({ model, quant, contextTokens, gpuLayers }) {
  const modelTag = `${model.id}:${quant.label.toLowerCase()}`;
  return [
    `OLLAMA_NUM_GPU=${gpuLayers}`,
    `OLLAMA_CONTEXT_LENGTH=${contextTokens}`,
    `ollama run ${modelTag}`,
  ].join(" \\\n  ");
}
