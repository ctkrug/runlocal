# Design — Runlocal

## Aesthetic direction

**Blueprint/technical.** Runlocal is an engineering instrument, not a marketing page — it should
feel like a schematic console for reasoning about GPU memory, not a SaaS landing page. Dark
navy-charcoal canvas, cyan schematic linework, amber for warnings, monospace for every number
that matters. The page reads like an annotated hardware diagram that happens to be interactive.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b0f14` | page background |
| `--surface-1` | `#121820` | panel background |
| `--surface-2` | `#182130` | raised/hover panel background |
| `--text` | `#e8eef5` | primary text |
| `--text-muted` | `#7c8ba0` | labels, captions, spec annotations |
| `--accent` | `#57d9ff` | schematic cyan — active states, focus, grid lines, primary CTA |
| `--accent-support` | `#ff9d5c` | amber — warnings, "won't fit" states, secondary emphasis |
| `--success` | `#4ade8a` | fits comfortably / copied confirmation |
| `--danger` | `#ff6b6b` | exceeds available memory |
| Display font | **Space Grotesk** (Google Fonts) | wordmark, headings; fallback `system-ui, sans-serif` |
| UI/mono font | **JetBrains Mono** (Google Fonts) | labels, numbers, the launch command; fallback `ui-monospace, "SF Mono", monospace` |
| Spacing unit | `8px` scale (`4/8/16/24/32/48`) | all layout spacing |
| Corner radius | `4px` | panels and controls — technical, not soft |
| Shadow/glow | `0 0 24px rgba(87, 217, 255, 0.15)` on active/focused panels; flat `1px solid` borders elsewhere | depth without going glassy |
| Motion | UI transitions `150ms ease-out`; command typing reveal `24ms` per character | deliberate, instrument-like, never bouncy |

## Layout intent

The hero is **the console**: a two-panel schematic layout.

- **Desktop (1440×900):** left panel (~35% width) holds the hardware + model selectors, styled
  as an annotated spec form with labeled callouts (`GPU →`, `VRAM →`, `MODEL →`, `QUANT →`,
  `CTX →`). Right panel (~65% width, the hero) holds the generated launch command (typed out
  monospace with a blinking cursor), a segmented GPU/CPU layer-offload bar with tick marks, and
  a tok/s readout styled as an instrument dial. Together the console fills ≥70vh.
- **Phone (390×844):** single column — selectors stack first, the command/offload/tok-s output
  panel follows full-width immediately below, so the payoff is one scroll away, not buried.

## Signature detail

A corner **spec plate**: a small fixed nameplate (bottom-right of the console, engineering-label
style) reading `RUNLOCAL` in Space Grotesk with a monogram chip-outline glyph, plus thin
crosshair brackets (`⌐ ... ¬`-style corner marks drawn in CSS) decorating the console panel
corners — the recurring "this is a schematic" cue. The background carries a faint blueprint grid
(`repeating-linear-gradient`, 24px cells, low-opacity cyan) instead of a flat solid fill.

## Not a game/toy

Runlocal is a calculator/instrument, not a game — no juice/SFX plan needed. Feedback is limited
to: the command typing-reveal animation, a segmented offload bar that fills on recompute, and a
"Copied" success flash on the clipboard button (uses `--success`, 150ms ease-out fade).
