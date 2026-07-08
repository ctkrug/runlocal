# Vision — Runlocal

## The problem

Running an LLM locally means answering a question nobody gives you a straight answer to: *will
this model actually fit, and if so, how do I launch it?* Guides say "check your VRAM" and stop.
They don't account for quantization format changing the footprint non-linearly, KV cache growing
with context length, or partial GPU offload — which is normal, not a failure state, but nobody
tells you how many layers to offload or what speed that costs you. The result is trial-and-error:
launch, OOM, guess a lower `--n-gpu-layers`, relaunch, repeat.

## Who it's for

Hobbyists and developers running open-weight models on their own hardware via `llama.cpp` or
`Ollama` — people who know their GPU model and roughly which model they want, but don't want to
hand-derive parameter-count-times-quant-bytes arithmetic before every launch.

## The core idea

Encode the actual memory math — `params × bytes-per-quant` for weights, plus
`2 × layers × hidden_size × context_tokens × bytes` for KV cache — into a solver that answers one
question: how many transformer layers fit in the given VRAM after the KV cache and runtime
overhead are reserved? That layer count drives two outputs: a ready-to-paste launch command with
the right `--n-gpu-layers` and context flags, and a tokens/sec estimate derived from memory
bandwidth and the resulting GPU/CPU offload split.

## Key design decisions

- **Command-first, not just a number.** A "fits: yes/no" verdict is a dead end. Runlocal always
  emits the actual command to run, because that's the action the user actually needs to take.
- **Honest, not authoritative, tok/s.** The estimate is bandwidth-bound arithmetic calibrated
  against known real-world figures (see `src/core/solver.js` for the efficiency constant), not a
  measured benchmark. It's presented as an estimate, and the methodology is meant to be visible
  (see the "why this estimate" backlog story) rather than a black-box number.
- **Static, zero-backend.** All data (hardware specs, model shapes, quant tables) ships as plain
  JS modules bundled into a static site. No server, no API calls, no user data collected —
  it runs entirely in the browser and deploys as flat files.
- **Solver logic is plain, tested functions.** `src/core/solver.js` and `src/core/command.js`
  have no DOM dependency, so the memory math is unit-testable independent of the UI.
- **Blueprint/technical design direction.** The tool is an instrument, not a marketing page — see
  `docs/DESIGN.md` for the full rationale.

## What "v1 done" looks like

- Hardware and model databases cover the common consumer GPU tiers and the popular open-weight
  model families (Llama, Mistral, Qwen, Phi) at their common sizes.
- The solver correctly computes offload splits and KV cache sizing across all four supported
  quant levels (Q4_K_M, Q5_K_M, Q8_0, F16), with a tested "won't fit even fully offloaded to
  system RAM" warning state.
- Both `llama.cpp` and `Ollama` launch commands are generated from the same solved plan.
- The console is fully responsive (390px–1440px+), matches `docs/DESIGN.md`, and every control has
  themed hover/focus/active states.
- A visible "why this estimate" panel explains the formula behind the current numbers, so the
  tool earns trust instead of asking for blind faith in a single output number.
- CI runs lint, unit tests, and a production build on every push.
