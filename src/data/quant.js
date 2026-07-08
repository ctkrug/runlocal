// Approximate bytes-per-parameter for common llama.cpp GGUF quantizations.
// These are ballpark figures (real values vary slightly by tensor); good
// enough to drive fit/offload decisions. Refined in docs/BACKLOG.md.
export const QUANTS = {
  "q4_k_m": { id: "q4_k_m", label: "Q4_K_M", bytesPerParam: 0.55 },
  "q5_k_m": { id: "q5_k_m", label: "Q5_K_M", bytesPerParam: 0.65 },
  "q8_0": { id: "q8_0", label: "Q8_0", bytesPerParam: 1.0 },
  "f16": { id: "f16", label: "F16", bytesPerParam: 2.0 },
};

export function getQuantById(id) {
  return QUANTS[id];
}
