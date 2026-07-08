// Consumer/prosumer GPUs with VRAM and memory bandwidth (GB/s), sourced from
// public vendor specs. Expanding this list is tracked in docs/BACKLOG.md.
export const GPUS = [
  {
    id: "rtx-3060-12gb",
    label: "NVIDIA RTX 3060 12GB",
    vramGb: 12,
    bandwidthGBs: 360,
  },
  {
    id: "rtx-3090-24gb",
    label: "NVIDIA RTX 3090 24GB",
    vramGb: 24,
    bandwidthGBs: 936,
  },
  {
    id: "rtx-4090-24gb",
    label: "NVIDIA RTX 4090 24GB",
    vramGb: 24,
    bandwidthGBs: 1008,
  },
  {
    id: "apple-m2-max-32gb",
    label: "Apple M2 Max (32GB unified)",
    vramGb: 32,
    bandwidthGBs: 400,
  },
];

export function getGpuById(id) {
  return GPUS.find((gpu) => gpu.id === id);
}
