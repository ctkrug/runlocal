// Memory math + offload solver: how many transformer layers fit in VRAM,
// and how fast decoding will run given the GPU/CPU offload split.

const BYTES_PER_GB = 1e9;
const KV_CACHE_BYTES_PER_ELEMENT = 2; // fp16 key + value cache
const RUNTIME_OVERHEAD_GB = 0.5; // context buffers, CUDA graph, etc.
const CPU_RAM_BANDWIDTH_GBS = 25; // typical dual-channel DDR4/DDR5 bandwidth

// Fraction of theoretical memory bandwidth real decode throughput achieves.
// Calibrated so RTX 3060 12GB + Llama-3-8B (Q4_K_M) lands near ~38 tok/s,
// a commonly reported real-world figure. Refined in docs/BACKLOG.md.
// Exported so the UI's "why this estimate" panel can display it verbatim.
export const BANDWIDTH_EFFICIENCY = 0.46;

export function estimateModelSizeBytes(model, quant) {
  return model.paramsBillion * BYTES_PER_GB * quant.bytesPerParam;
}

export function estimateKvCacheBytes(model, contextTokens) {
  return (
    2 *
    model.layers *
    model.hiddenSize *
    contextTokens *
    KV_CACHE_BYTES_PER_ELEMENT
  );
}

export function solve({ gpu, model, quant, contextTokens, systemRamGb }) {
  const modelBytes = estimateModelSizeBytes(model, quant);
  const layerBytes = modelBytes / model.layers;
  const kvCacheBytes = estimateKvCacheBytes(model, contextTokens);
  const overheadBytes = RUNTIME_OVERHEAD_GB * BYTES_PER_GB;

  const availableVramBytes = gpu.vramGb * BYTES_PER_GB - kvCacheBytes - overheadBytes;
  const maxLayersInVram = Math.max(0, Math.floor(availableVramBytes / layerBytes));
  const gpuLayers = Math.min(model.layers, maxLayersInVram);
  const cpuLayers = model.layers - gpuLayers;
  const fitsFully = gpuLayers >= model.layers;

  const totalNeededBytes = modelBytes + kvCacheBytes + overheadBytes;
  const fitsAtAll =
    gpu.vramGb * BYTES_PER_GB + systemRamGb * BYTES_PER_GB >= totalNeededBytes;

  const tokPerSec = estimateTokensPerSecond({ gpu, layerBytes, gpuLayers, cpuLayers });

  return {
    modelSizeGb: modelBytes / BYTES_PER_GB,
    kvCacheGb: kvCacheBytes / BYTES_PER_GB,
    totalLayers: model.layers,
    gpuLayers,
    cpuLayers,
    fitsFully,
    fitsAtAll,
    tokPerSec,
  };
}

export function estimateTokensPerSecond({ gpu, layerBytes, gpuLayers, cpuLayers }) {
  const gpuBytesPerToken = layerBytes * gpuLayers;
  const cpuBytesPerToken = layerBytes * cpuLayers;

  const gpuSeconds =
    gpuBytesPerToken / (gpu.bandwidthGBs * BYTES_PER_GB * BANDWIDTH_EFFICIENCY);
  const cpuSeconds =
    cpuBytesPerToken / (CPU_RAM_BANDWIDTH_GBS * BYTES_PER_GB * BANDWIDTH_EFFICIENCY);

  const secondsPerToken = gpuSeconds + cpuSeconds;
  if (secondsPerToken <= 0) return 0;
  return 1 / secondsPerToken;
}
