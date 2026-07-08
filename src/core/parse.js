// Parses a raw <input> string into a safe numeric value for the solver.
// "" / "0" / non-numeric text fall back to a sane default; an otherwise-valid
// but out-of-range value (negative, fractional token counts) is clamped
// rather than passed through into the memory math or the emitted command.
export function parseClampedNumber(rawValue, { fallback, min, round = false }) {
  const raw = Number(rawValue);
  if (!raw) return fallback;
  const clamped = Math.max(min, raw);
  return round ? Math.round(clamped) : clamped;
}
