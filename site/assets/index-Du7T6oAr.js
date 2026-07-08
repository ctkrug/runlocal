(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const l of n)if(l.type==="childList")for(const a of l.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function o(n){const l={};return n.integrity&&(l.integrity=n.integrity),n.referrerPolicy&&(l.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?l.credentials="include":n.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function i(n){if(n.ep)return;n.ep=!0;const l=o(n);fetch(n.href,l)}})();const g=[{id:"rtx-3060-12gb",label:"NVIDIA RTX 3060 12GB",vramGb:12,bandwidthGBs:360},{id:"rtx-4060-ti-16gb",label:"NVIDIA RTX 4060 Ti 16GB",vramGb:16,bandwidthGBs:288},{id:"rtx-4070-ti-12gb",label:"NVIDIA RTX 4070 Ti 12GB",vramGb:12,bandwidthGBs:504},{id:"rtx-4080-16gb",label:"NVIDIA RTX 4080 16GB",vramGb:16,bandwidthGBs:717},{id:"rtx-3090-24gb",label:"NVIDIA RTX 3090 24GB",vramGb:24,bandwidthGBs:936},{id:"rtx-4090-24gb",label:"NVIDIA RTX 4090 24GB",vramGb:24,bandwidthGBs:1008},{id:"nvidia-l40s-48gb",label:"NVIDIA L40S 48GB (datacenter)",vramGb:48,bandwidthGBs:864},{id:"nvidia-a100-80gb",label:"NVIDIA A100 80GB SXM (datacenter)",vramGb:80,bandwidthGBs:2039},{id:"nvidia-h100-80gb",label:"NVIDIA H100 80GB SXM (datacenter)",vramGb:80,bandwidthGBs:3350},{id:"apple-m1-pro-16gb",label:"Apple M1 Pro (16GB unified)",vramGb:16,bandwidthGBs:200},{id:"apple-m2-max-32gb",label:"Apple M2 Max (32GB unified)",vramGb:32,bandwidthGBs:400},{id:"apple-m4-max-64gb",label:"Apple M4 Max (64GB unified)",vramGb:64,bandwidthGBs:546}];function q(e){return g.find(t=>t.id===e)}const A=[{id:"llama-3-8b",label:"Llama-3-8B",paramsBillion:8,layers:32,hiddenSize:4096},{id:"llama-3-70b",label:"Llama-3-70B",paramsBillion:70,layers:80,hiddenSize:8192},{id:"mistral-7b",label:"Mistral-7B",paramsBillion:7.3,layers:32,hiddenSize:4096},{id:"mistral-nemo-12b",label:"Mistral-Nemo-12B",paramsBillion:12.2,layers:40,hiddenSize:5120},{id:"phi-3-mini",label:"Phi-3-mini-3.8B",paramsBillion:3.8,layers:32,hiddenSize:3072},{id:"phi-3-medium",label:"Phi-3-medium-14B",paramsBillion:14,layers:40,hiddenSize:5120},{id:"qwen2.5-7b",label:"Qwen2.5-7B",paramsBillion:7.6,layers:28,hiddenSize:3584},{id:"qwen2.5-14b",label:"Qwen2.5-14B",paramsBillion:14.7,layers:48,hiddenSize:5120}];function I(e){return A.find(t=>t.id===e)}const S={q4_k_m:{id:"q4_k_m",label:"Q4_K_M",bytesPerParam:.55},q5_k_m:{id:"q5_k_m",label:"Q5_K_M",bytesPerParam:.65},q8_0:{id:"q8_0",label:"Q8_0",bytesPerParam:1},f16:{id:"f16",label:"F16",bytesPerParam:2}};function O(e){return S[e]}const m=1e9,R=2,D=.5,U=25,_=.46;function V(e,t){return e.paramsBillion*m*t.bytesPerParam}function F(e,t){return 2*e.layers*e.hiddenSize*t*R}function z({gpu:e,model:t,quant:o,contextTokens:i,systemRamGb:n}){const l=V(t,o),a=l/t.layers,d=F(t,i),s=D*m,r=e.vramGb*m-d-s,c=Math.max(0,Math.floor(r/a)),u=Math.min(t.layers,c),b=t.layers-u,x=u>=t.layers,w=l+d+s,P=e.vramGb*m+n*m>=w,N=X({gpu:e,layerBytes:a,gpuLayers:u,cpuLayers:b});return{modelSizeGb:l/m,kvCacheGb:d/m,totalLayers:t.layers,gpuLayers:u,cpuLayers:b,fitsFully:x,fitsAtAll:P,tokPerSec:N}}function X({gpu:e,layerBytes:t,gpuLayers:o,cpuLayers:i}){const n=t*o,l=t*i,a=n/(e.bandwidthGBs*m*_),d=l/(U*m*_),s=a+d;return s<=0?0:1/s}function H({model:e,quant:t,contextTokens:o,gpuLayers:i}){return["llama-cli",`-m ${`${e.id}.${t.label}.gguf`}`,`--n-gpu-layers ${i}`,`--ctx-size ${o}`].join(` \\
  `)}function K({model:e,quant:t,contextTokens:o,gpuLayers:i}){const n=`${e.id}:${t.label.toLowerCase()}`;return[`OLLAMA_NUM_GPU=${i}`,`OLLAMA_CONTEXT_LENGTH=${o}`,`ollama run ${n}`].join(` \\
  `)}function Q(e,{fallback:t,min:o,max:i=1/0,round:n=!1}){const l=Number(e);if(!l)return t;const a=Math.min(i,Math.max(o,l));return n?Math.round(a):a}const y={LLAMA_CPP:"llama.cpp",OLLAMA:"ollama"},f="custom",L=4096,W=32,M=12,C=400,Y=24,j=200,T=1e7,$=1e6,k=1e6,E=1e6;function B(e){return e.map(t=>`<option value="${t.id}">${t.label}</option>`).join("")}function J(e){e.innerHTML=`
    <section class="panel" aria-label="Hardware and model selection">
      <div class="field">
        <label for="gpu">GPU →</label>
        <select id="gpu">${B(g)}<option value="${f}">Custom hardware…</option></select>
      </div>
      <div class="field custom-fields" id="custom-fields" hidden>
        <label for="custom-vram">Custom VRAM (GB) →</label>
        <input
          id="custom-vram"
          type="number"
          min="1"
          max="${k}"
          step="1"
          value="${M}"
        />
        <label for="custom-bandwidth">Custom bandwidth (GB/s) →</label>
        <input
          id="custom-bandwidth"
          type="number"
          min="1"
          max="${E}"
          step="1"
          value="${C}"
        />
      </div>
      <div class="field">
        <label for="ram">System RAM (GB) →</label>
        <input
          id="ram"
          type="number"
          min="0"
          max="${$}"
          step="1"
          value="${W}"
        />
      </div>
      <div class="field">
        <label for="model">Model →</label>
        <select id="model">${B(A)}</select>
      </div>
      <div class="field">
        <label for="quant">Quant →</label>
        <select id="quant">${B(Object.values(S))}</select>
      </div>
      <div class="field">
        <label for="ctx">Context (tokens) →</label>
        <input
          id="ctx"
          type="number"
          min="256"
          max="${T}"
          step="256"
          value="${L}"
        />
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
      <div class="readout" id="readout" role="status"></div>
      <p class="disclaimer">
        tok/s is a bandwidth-bound estimate, not a benchmark —
        <a href="#methodology" id="disclaimer-link">see the methodology</a>.
      </p>
      <details class="methodology" id="methodology">
        <summary>Why this estimate?</summary>
        <div id="methodology-body"></div>
      </details>
      <div class="spec-plate" aria-hidden="true">RUNLOCAL⌐¬</div>
    </section>
  `}let G=0;function Z(){return typeof window.matchMedia=="function"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches}function ee(e,t){const o=++G;e.textContent="";const i=document.createElement("span");if(i.className="cursor",i.textContent="▌",Z()){e.textContent=t,e.appendChild(i);return}let n=0;function l(){o===G&&(e.textContent=t.slice(0,n),e.appendChild(i),n<t.length&&(n+=1,setTimeout(l,Y)))}l()}const v={backend:y.LLAMA_CPP,currentCommand:""};function h(e,t,o,i={}){return Q(e.value,{fallback:t,min:o,...i})}function te(e){const t=e.querySelector("#gpu").value;if(t!==f)return q(t);const o=h(e.querySelector("#custom-vram"),M,1,{max:k}),i=h(e.querySelector("#custom-bandwidth"),C,1,{max:E});return{id:f,label:"Custom hardware",vramGb:o,bandwidthGBs:i}}function p(e){const t=te(e),o=I(e.querySelector("#model").value),i=O(e.querySelector("#quant").value),n=h(e.querySelector("#ctx"),L,0,{round:!0,max:T}),l=h(e.querySelector("#ram"),0,0,{max:$}),a=z({gpu:t,model:o,quant:i,contextTokens:n,systemRamGb:l}),s=(v.backend===y.OLLAMA?K:H)({model:o,quant:i,contextTokens:n,gpuLayers:a.gpuLayers});v.currentCommand=s,ee(e.querySelector("#command"),s);const r=e.querySelector("#warning");a.fitsAtAll?(r.hidden=!0,r.textContent=""):(r.hidden=!1,r.textContent=`⚠ ${o.label} (${i.label}) needs more memory than ${t.label} (${t.vramGb}GB VRAM) plus your ${l}GB system RAM can provide. Pick a smaller quant, a shorter context, or more RAM before running this command.`);const c=e.querySelector("#offload-bar"),u=a.gpuLayers/a.totalLayers*100;c.innerHTML=`
    <div class="offload-bar__gpu" style="width:${u}%"></div>
    <div class="offload-bar__cpu" style="width:${100-u}%"></div>
  `;const b=e.querySelector("#readout");b.innerHTML=`
    <div class="readout__item">
      <div class="value" style="color:${a.fitsAtAll?"var(--success)":"var(--danger)"}">
        ${a.tokPerSec.toFixed(1)} tok/s
      </div>
      <div class="label">Estimated throughput</div>
    </div>
    <div class="readout__item">
      <div class="value">${a.gpuLayers}/${a.totalLayers}</div>
      <div class="label">GPU-offloaded layers</div>
    </div>
    <div class="readout__item">
      <div class="value">${a.modelSizeGb.toFixed(1)} GB</div>
      <div class="label">Model size (${i.label})</div>
    </div>
  `,e.querySelector("#methodology-body").innerHTML=`
    <dl>
      <dt>Model size</dt>
      <dd>${o.paramsBillion}B params × ${i.bytesPerParam} bytes/param =
        ${a.modelSizeGb.toFixed(2)} GB</dd>
      <dt>KV cache</dt>
      <dd>2 × ${o.layers} layers × ${o.hiddenSize} hidden × ${n} ctx × 2
        bytes = ${a.kvCacheGb.toFixed(2)} GB</dd>
      <dt>GPU-offloaded layers</dt>
      <dd>floor((${t.vramGb} GB VRAM − ${a.kvCacheGb.toFixed(2)} GB KV cache − 0.5 GB
        overhead) ÷ bytes-per-layer) = ${a.gpuLayers} of ${a.totalLayers}</dd>
      <dt>Tokens/sec</dt>
      <dd>1 ÷ (bytes moved per token ÷ (${t.bandwidthGBs} GB/s ×
        ${_} efficiency)) = ${a.tokPerSec.toFixed(1)} tok/s</dd>
    </dl>
  `}function ae(){const e=document.getElementById("console");J(e),e.querySelectorAll("select, input").forEach(a=>{a.addEventListener("change",()=>p(e))});let t=null;e.querySelectorAll("input").forEach(a=>{a.addEventListener("input",()=>{clearTimeout(t),t=setTimeout(()=>p(e),j)})});const o=e.querySelector("#gpu"),i=e.querySelector("#custom-fields");o.addEventListener("change",()=>{i.hidden=o.value!==f});const n=[{el:e.querySelector("#backend-llamacpp"),backend:y.LLAMA_CPP},{el:e.querySelector("#backend-ollama"),backend:y.OLLAMA}];function l(a,{focus:d=!1}={}){v.backend=a,n.forEach(({el:s,backend:r})=>{const c=r===a;s.classList.toggle("is-active",c),s.setAttribute("aria-checked",String(c)),d&&c&&s.focus()}),p(e)}n.forEach(({el:a,backend:d},s)=>{a.addEventListener("click",()=>l(d)),a.addEventListener("keydown",r=>{if(r.key!=="ArrowRight"&&r.key!=="ArrowLeft")return;r.preventDefault();const c=r.key==="ArrowRight"?1:-1,u=n[(s+c+n.length)%n.length];l(u.backend,{focus:!0})})}),e.querySelector("#disclaimer-link").addEventListener("click",()=>{e.querySelector("#methodology").open=!0}),e.querySelector("#copy").addEventListener("click",()=>{const a=v.currentCommand,d=e.querySelector("#copy"),s=()=>{d.classList.remove("copied","copy-failed"),d.textContent="Copy command"};if(!navigator.clipboard){d.classList.add("copy-failed"),d.textContent="Copy unsupported",setTimeout(s,2e3);return}navigator.clipboard.writeText(a).then(()=>{d.classList.add("copied"),d.textContent="Copied",setTimeout(s,2e3)}).catch(()=>{d.classList.add("copy-failed"),d.textContent="Copy failed",setTimeout(s,2e3)})}),p(e)}ae();
