import { GPUS, getGpuById } from "./data/hardware.js";
import { MODELS, getModelById } from "./data/models.js";
import { QUANTS, getQuantById } from "./data/quant.js";
import { solve } from "./core/solver.js";
import { buildLlamaCppCommand, buildOllamaCommand } from "./core/command.js";

const BACKENDS = { LLAMA_CPP: "llama.cpp", OLLAMA: "ollama" };

const DEFAULT_CONTEXT_TOKENS = 4096;
const DEFAULT_SYSTEM_RAM_GB = 32;
const TYPE_REVEAL_MS = 24;

function optionsHtml(items) {
  return items.map((item) => `<option value="${item.id}">${item.label}</option>`).join("");
}

function render(root) {
  root.innerHTML = `
    <section class="panel" aria-label="Hardware and model selection">
      <div class="field">
        <label for="gpu">GPU →</label>
        <select id="gpu">${optionsHtml(GPUS)}</select>
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
      <div class="spec-plate">RUNLOCAL⌐¬</div>
    </section>
  `;
}

function typeCommand(el, text) {
  el.textContent = "";
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.textContent = "▌";

  let i = 0;
  function step() {
    el.textContent = text.slice(0, i);
    el.appendChild(cursor);
    if (i < text.length) {
      i += 1;
      setTimeout(step, TYPE_REVEAL_MS);
    }
  }
  step();
}

const state = { backend: BACKENDS.LLAMA_CPP };

function update(root) {
  const gpu = getGpuById(root.querySelector("#gpu").value);
  const model = getModelById(root.querySelector("#model").value);
  const quant = getQuantById(root.querySelector("#quant").value);
  const contextTokens = Number(root.querySelector("#ctx").value) || DEFAULT_CONTEXT_TOKENS;
  const systemRamGb = Number(root.querySelector("#ram").value) || 0;

  const result = solve({ gpu, model, quant, contextTokens, systemRamGb });
  const buildCommand =
    state.backend === BACKENDS.OLLAMA ? buildOllamaCommand : buildLlamaCppCommand;
  const command = buildCommand({
    model,
    quant,
    contextTokens,
    gpuLayers: result.gpuLayers,
  });

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
}

function init() {
  const root = document.getElementById("console");
  render(root);

  root.querySelectorAll("select, input").forEach((el) => {
    el.addEventListener("change", () => update(root));
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

  root.querySelector("#copy").addEventListener("click", () => {
    const text = root.querySelector("#command").textContent.replace(/▌$/, "");
    const button = root.querySelector("#copy");
    navigator.clipboard?.writeText(text).then(() => {
      button.classList.add("copied");
      button.textContent = "Copied";
      setTimeout(() => {
        button.classList.remove("copied");
        button.textContent = "Copy command";
      }, 2000);
    });
  });

  update(root);
}

init();
