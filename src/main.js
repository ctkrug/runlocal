import { GPUS, getGpuById } from "./data/hardware.js";
import { MODELS, getModelById } from "./data/models.js";
import { QUANTS, getQuantById } from "./data/quant.js";
import { solve, BANDWIDTH_EFFICIENCY } from "./core/solver.js";
import { buildLlamaCppCommand, buildOllamaCommand } from "./core/command.js";
import { parseClampedNumber } from "./core/parse.js";

const BACKENDS = { LLAMA_CPP: "llama.cpp", OLLAMA: "ollama" };
const CUSTOM_GPU_ID = "custom";

const DEFAULT_CONTEXT_TOKENS = 4096;
const DEFAULT_SYSTEM_RAM_GB = 32;
const DEFAULT_CUSTOM_VRAM_GB = 12;
const DEFAULT_CUSTOM_BANDWIDTH_GBS = 400;
const TYPE_REVEAL_MS = 24;
const LIVE_INPUT_DEBOUNCE_MS = 200;

// Generous upper bounds — far beyond any real model/hardware today — that
// exist only to stop absurd input (e.g. a pasted 1e23) from rendering in
// scientific notation in the emitted command or warning text.
const MAX_CONTEXT_TOKENS = 10_000_000;
const MAX_RAM_GB = 1_000_000;
const MAX_CUSTOM_VRAM_GB = 1_000_000;
const MAX_CUSTOM_BANDWIDTH_GBS = 1_000_000;

function optionsHtml(items) {
  return items.map((item) => `<option value="${item.id}">${item.label}</option>`).join("");
}

function render(root) {
  root.innerHTML = `
    <section class="panel" aria-label="Hardware and model selection">
      <div class="field">
        <label for="gpu">GPU →</label>
        <select id="gpu">${optionsHtml(GPUS)}<option value="${CUSTOM_GPU_ID}">Custom hardware…</option></select>
      </div>
      <div class="field custom-fields" id="custom-fields" hidden>
        <label for="custom-vram">Custom VRAM (GB) →</label>
        <input id="custom-vram" type="number" min="1" step="1" value="${DEFAULT_CUSTOM_VRAM_GB}" />
        <label for="custom-bandwidth">Custom bandwidth (GB/s) →</label>
        <input
          id="custom-bandwidth"
          type="number"
          min="1"
          step="1"
          value="${DEFAULT_CUSTOM_BANDWIDTH_GBS}"
        />
      </div>
      <div class="field">
        <label for="ram">System RAM (GB) →</label>
        <input id="ram" type="number" min="0" step="1" value="${DEFAULT_SYSTEM_RAM_GB}" />
      </div>
      <div class="field">
        <label for="model">Model →</label>
        <select id="model">${optionsHtml(MODELS)}</select>
      </div>
      <div class="field">
        <label for="quant">Quant →</label>
        <select id="quant">${optionsHtml(Object.values(QUANTS))}</select>
      </div>
      <div class="field">
        <label for="ctx">Context (tokens) →</label>
        <input id="ctx" type="number" min="256" step="256" value="${DEFAULT_CONTEXT_TOKENS}" />
      </div>
    </section>
    <section class="panel panel--active" aria-label="Launch command and estimate">
      <div class="backend-toggle" role="radiogroup" aria-label="Command backend">
        <button
          type="button"
          class="backend-toggle__option is-active"
          id="backend-llamacpp"
          role="radio"
          aria-checked="true"
        >llama.cpp</button>
        <button
          type="button"
          class="backend-toggle__option"
          id="backend-ollama"
          role="radio"
          aria-checked="false"
        >Ollama</button>
      </div>
      <div class="command-output" id="command" role="status"></div>
      <button id="copy" type="button">Copy command</button>
      <div class="warning" id="warning" role="alert" hidden></div>
      <div class="offload-bar" id="offload-bar" aria-hidden="true"></div>
      <div class="readout" id="readout"></div>
      <p class="disclaimer">
        tok/s is a bandwidth-bound estimate, not a benchmark —
        <a href="#methodology" id="disclaimer-link">see the methodology</a>.
      </p>
      <details class="methodology" id="methodology">
        <summary>Why this estimate?</summary>
        <div id="methodology-body"></div>
      </details>
      <div class="spec-plate">RUNLOCAL⌐¬</div>
    </section>
  `;
}

let typeRevealToken = 0;

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function typeCommand(el, text) {
  const token = ++typeRevealToken;
  el.textContent = "";
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.textContent = "▌";

  if (prefersReducedMotion()) {
    el.textContent = text;
    el.appendChild(cursor);
    return;
  }

  let i = 0;
  function step() {
    if (token !== typeRevealToken) return;
    el.textContent = text.slice(0, i);
    el.appendChild(cursor);
    if (i < text.length) {
      i += 1;
      setTimeout(step, TYPE_REVEAL_MS);
    }
  }
  step();
}

const state = { backend: BACKENDS.LLAMA_CPP, currentCommand: "" };

function readNumber(el, fallback, min, opts = {}) {
  return parseClampedNumber(el.value, { fallback, min, ...opts });
}

function resolveGpu(root) {
  const gpuId = root.querySelector("#gpu").value;
  if (gpuId !== CUSTOM_GPU_ID) return getGpuById(gpuId);

  const vramGb = readNumber(root.querySelector("#custom-vram"), DEFAULT_CUSTOM_VRAM_GB, 1, {
    max: MAX_CUSTOM_VRAM_GB,
  });
  const bandwidthGBs = readNumber(
    root.querySelector("#custom-bandwidth"),
    DEFAULT_CUSTOM_BANDWIDTH_GBS,
    1,
    { max: MAX_CUSTOM_BANDWIDTH_GBS }
  );
  return { id: CUSTOM_GPU_ID, label: "Custom hardware", vramGb, bandwidthGBs };
}

function update(root) {
  const gpu = resolveGpu(root);
  const model = getModelById(root.querySelector("#model").value);
  const quant = getQuantById(root.querySelector("#quant").value);
  const contextTokens = readNumber(root.querySelector("#ctx"), DEFAULT_CONTEXT_TOKENS, 0, {
    round: true,
    max: MAX_CONTEXT_TOKENS,
  });
  const systemRamGb = readNumber(root.querySelector("#ram"), 0, 0, { max: MAX_RAM_GB });

  const result = solve({ gpu, model, quant, contextTokens, systemRamGb });
  const buildCommand =
    state.backend === BACKENDS.OLLAMA ? buildOllamaCommand : buildLlamaCppCommand;
  const command = buildCommand({
    model,
    quant,
    contextTokens,
    gpuLayers: result.gpuLayers,
  });

  state.currentCommand = command;
  typeCommand(root.querySelector("#command"), command);

  const warning = root.querySelector("#warning");
  if (result.fitsAtAll) {
    warning.hidden = true;
    warning.textContent = "";
  } else {
    warning.hidden = false;
    warning.textContent =
      `⚠ ${model.label} (${quant.label}) needs more memory than ${gpu.label} VRAM ` +
      `plus your ${systemRamGb}GB system RAM can provide. Pick a smaller quant, a ` +
      "shorter context, or more RAM before running this command.";
  }

  const bar = root.querySelector("#offload-bar");
  const gpuPct = (result.gpuLayers / result.totalLayers) * 100;
  bar.innerHTML = `
    <div class="offload-bar__gpu" style="width:${gpuPct}%"></div>
    <div class="offload-bar__cpu" style="width:${100 - gpuPct}%"></div>
  `;

  const readout = root.querySelector("#readout");
  readout.innerHTML = `
    <div class="readout__item">
      <div class="value" style="color:${result.fitsAtAll ? "var(--success)" : "var(--danger)"}">
        ${result.tokPerSec.toFixed(1)} tok/s
      </div>
      <div class="label">Estimated throughput</div>
    </div>
    <div class="readout__item">
      <div class="value">${result.gpuLayers}/${result.totalLayers}</div>
      <div class="label">GPU-offloaded layers</div>
    </div>
    <div class="readout__item">
      <div class="value">${result.modelSizeGb.toFixed(1)} GB</div>
      <div class="label">Model size (${quant.label})</div>
    </div>
  `;

  root.querySelector("#methodology-body").innerHTML = `
    <dl>
      <dt>Model size</dt>
      <dd>${model.paramsBillion}B params × ${quant.bytesPerParam} bytes/param =
        ${result.modelSizeGb.toFixed(2)} GB</dd>
      <dt>KV cache</dt>
      <dd>2 × ${model.layers} layers × ${model.hiddenSize} hidden × ${contextTokens} ctx × 2
        bytes = ${result.kvCacheGb.toFixed(2)} GB</dd>
      <dt>GPU-offloaded layers</dt>
      <dd>floor((${gpu.vramGb} GB VRAM − ${result.kvCacheGb.toFixed(2)} GB KV cache − 0.5 GB
        overhead) ÷ bytes-per-layer) = ${result.gpuLayers} of ${result.totalLayers}</dd>
      <dt>Tokens/sec</dt>
      <dd>1 ÷ (bytes moved per token ÷ (${gpu.bandwidthGBs} GB/s ×
        ${BANDWIDTH_EFFICIENCY} efficiency)) = ${result.tokPerSec.toFixed(1)} tok/s</dd>
    </dl>
  `;
}

function init() {
  const root = document.getElementById("console");
  render(root);

  root.querySelectorAll("select, input").forEach((el) => {
    el.addEventListener("change", () => update(root));
  });

  let liveUpdateTimer = null;
  root.querySelectorAll("input").forEach((el) => {
    el.addEventListener("input", () => {
      clearTimeout(liveUpdateTimer);
      liveUpdateTimer = setTimeout(() => update(root), LIVE_INPUT_DEBOUNCE_MS);
    });
  });

  const gpuSelect = root.querySelector("#gpu");
  const customFields = root.querySelector("#custom-fields");
  gpuSelect.addEventListener("change", () => {
    customFields.hidden = gpuSelect.value !== CUSTOM_GPU_ID;
  });

  const backendButtons = [
    { el: root.querySelector("#backend-llamacpp"), backend: BACKENDS.LLAMA_CPP },
    { el: root.querySelector("#backend-ollama"), backend: BACKENDS.OLLAMA },
  ];
  backendButtons.forEach(({ el, backend }) => {
    el.addEventListener("click", () => {
      state.backend = backend;
      backendButtons.forEach(({ el: other, backend: otherBackend }) => {
        other.classList.toggle("is-active", otherBackend === backend);
        other.setAttribute("aria-checked", String(otherBackend === backend));
      });
      update(root);
    });
  });

  root.querySelector("#disclaimer-link").addEventListener("click", () => {
    root.querySelector("#methodology").open = true;
  });

  root.querySelector("#copy").addEventListener("click", () => {
    const text = state.currentCommand;
    const button = root.querySelector("#copy");
    const resetButton = () => {
      button.classList.remove("copied", "copy-failed");
      button.textContent = "Copy command";
    };

    if (!navigator.clipboard) {
      button.classList.add("copy-failed");
      button.textContent = "Copy unsupported";
      setTimeout(resetButton, 2000);
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        button.classList.add("copied");
        button.textContent = "Copied";
        setTimeout(resetButton, 2000);
      })
      .catch(() => {
        button.classList.add("copy-failed");
        button.textContent = "Copy failed";
        setTimeout(resetButton, 2000);
      });
  });

  update(root);
}

init();
