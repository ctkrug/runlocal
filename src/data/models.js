// Open-weight models with the shape data needed for memory math: parameter
// count, transformer layer count, and hidden size (for KV cache sizing).
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
    id: "mistral-nemo-12b",
    label: "Mistral-Nemo-12B",
    paramsBillion: 12.2,
    layers: 40,
    hiddenSize: 5120,
  },
  {
    id: "phi-3-mini",
    label: "Phi-3-mini-3.8B",
    paramsBillion: 3.8,
    layers: 32,
    hiddenSize: 3072,
  },
  {
    id: "phi-3-medium",
    label: "Phi-3-medium-14B",
    paramsBillion: 14,
    layers: 40,
    hiddenSize: 5120,
  },
  {
    id: "qwen2.5-7b",
    label: "Qwen2.5-7B",
    paramsBillion: 7.6,
    layers: 28,
    hiddenSize: 3584,
  },
  {
    id: "qwen2.5-14b",
    label: "Qwen2.5-14B",
    paramsBillion: 14.7,
    layers: 48,
    hiddenSize: 5120,
  },
];

export function getModelById(id) {
  return MODELS.find((model) => model.id === id);
}
