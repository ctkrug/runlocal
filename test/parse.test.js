import { describe, it, expect } from "vitest";
import { parseClampedNumber } from "../src/core/parse.js";

describe("parseClampedNumber", () => {
  it("falls back for an empty string", () => {
    expect(parseClampedNumber("", { fallback: 4096, min: 0 })).toBe(4096);
  });

  it("falls back for non-numeric text", () => {
    expect(parseClampedNumber("abc", { fallback: 4096, min: 0 })).toBe(4096);
  });

  it("falls back for zero", () => {
    expect(parseClampedNumber("0", { fallback: 32, min: 0 })).toBe(32);
  });

  it("clamps a negative value to min instead of falling back", () => {
    expect(parseClampedNumber("-500", { fallback: 4096, min: 0 })).toBe(0);
  });

  it("clamps a negative value to a positive min", () => {
    expect(parseClampedNumber("-5", { fallback: 12, min: 1 })).toBe(1);
  });

  it("passes through an in-range value unchanged", () => {
    expect(parseClampedNumber("8192", { fallback: 4096, min: 0 })).toBe(8192);
  });

  it("keeps fractional values by default", () => {
    expect(parseClampedNumber("3.99999", { fallback: 0, min: 0 })).toBeCloseTo(3.99999, 5);
  });

  it("rounds to the nearest integer when round is set", () => {
    expect(parseClampedNumber("100.7", { fallback: 4096, min: 0, round: true })).toBe(101);
  });

  it("rounds a clamped negative value when round is set", () => {
    expect(parseClampedNumber("-0.4", { fallback: 4096, min: 0, round: true })).toBe(0);
  });

  it("clamps an absurdly large value to max instead of overflowing to scientific notation", () => {
    const result = parseClampedNumber("99999999999999999999999", {
      fallback: 4096,
      min: 0,
      max: 10_000_000,
    });
    expect(result).toBe(10_000_000);
    expect(result.toString()).not.toContain("e+");
  });

  it("leaves values unbounded when max is omitted", () => {
    expect(parseClampedNumber("5000", { fallback: 0, min: 0 })).toBe(5000);
  });
});
