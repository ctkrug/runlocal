// Consumer, datacenter, and Apple Silicon hardware with VRAM (or unified
// memory) and memory bandwidth (GB/s), sourced from public vendor specs.
export const GPUS = [
  {
    id: "rtx-3060-12gb",
    label: "NVIDIA RTX 3060 12GB",
    vramGb: 12,
    bandwidthGBs: 360,
  },
  {
    id: "rtx-4060-ti-16gb",
    label: "NVIDIA RTX 4060 Ti 16GB",
    vramGb: 16,
    bandwidthGBs: 288,
  },
  {
    id: "rtx-4070-ti-12gb",
    label: "NVIDIA RTX 4070 Ti 12GB",
    vramGb: 12,
    bandwidthGBs: 504,
  },
  {
    id: "rtx-4080-16gb",
    label: "NVIDIA RTX 4080 16GB",
    vramGb: 16,
    bandwidthGBs: 717,
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
    id: "nvidia-l40s-48gb",
    label: "NVIDIA L40S 48GB (datacenter)",
    vramGb: 48,
    bandwidthGBs: 864,
  },
  {
    id: "nvidia-a100-80gb",
    label: "NVIDIA A100 80GB SXM (datacenter)",
    vramGb: 80,
    bandwidthGBs: 2039,
  },
  {
    id: "nvidia-h100-80gb",
    label: "NVIDIA H100 80GB SXM (datacenter)",
    vramGb: 80,
    bandwidthGBs: 3350,
  },
  {
    id: "apple-m1-pro-16gb",
    label: "Apple M1 Pro (16GB unified)",
    vramGb: 16,
    bandwidthGBs: 200,
  },
  {
    id: "apple-m2-max-32gb",
    label: "Apple M2 Max (32GB unified)",
    vramGb: 32,
    bandwidthGBs: 400,
  },
  {
    id: "apple-m4-max-64gb",
    label: "Apple M4 Max (64GB unified)",
    vramGb: 64,
    bandwidthGBs: 546,
  },
];

export function getGpuById(id) {
  return GPUS.find((gpu) => gpu.id === id);
}
