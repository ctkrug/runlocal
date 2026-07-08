// Open-weight models with the shape data needed for memory math: parameter
// count, transformer layer count, and hidden size (for KV cache sizing).
// Coverage expansion is tracked in docs/BACKLOG.md.
export const MODELS = [
  {
    id: "llama-3-8b",
    label: "Llama-3-8B",
    paramsBillion: 8,
    layers: 32,
    hiddenSize: 4096,
  },
  {
    id: "llama-3-70b",
    label: "Llama-3-70B",
    paramsBillion: 70,
    layers: 80,
    hiddenSize: 8192,
  },
  {
    id: "mistral-7b",
    label: "Mistral-7B",
    paramsBillion: 7.3,
    layers: 32,
    hiddenSize: 4096,
  },
  {
    id: "phi-3-mini",
    label: "Phi-3-mini-3.8B",
    paramsBillion: 3.8,
    layers: 32,
    hiddenSize: 3072,
  },
];

export function getModelById(id) {
  return MODELS.find((model) => model.id === id);
}
