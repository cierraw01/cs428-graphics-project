import { describe, it, expect } from "vitest";
import { createSeededNoise2D, fbm, ridgeFbm } from "./index.js";

describe("createSeededNoise2D", () => {
  it("returns values in [-1, 1]", () => {
    const noise = createSeededNoise2D("test-seed");
    for (let i = 0; i < 100; i++) {
      const val = noise(i * 0.1, i * 0.2);
      expect(val).toBeGreaterThanOrEqual(-1);
      expect(val).toBeLessThanOrEqual(1);
    }
  });

  it("is deterministic for the same seed", () => {
    const noise1 = createSeededNoise2D("same-seed");
    const noise2 = createSeededNoise2D("same-seed");

    const results1 = Array.from({ length: 10 }, (_, i) => noise1(i, i));
    const results2 = Array.from({ length: 10 }, (_, i) => noise2(i, i));

    expect(results1).toEqual(results2);
  });

  it("produces different output for different seeds", () => {
    const noiseA = createSeededNoise2D("seed-A");
    const noiseB = createSeededNoise2D("seed-B");

    const valA = noiseA(5, 5);
    const valB = noiseB(5, 5);

    expect(valA).not.toEqual(valB);
  });
});

describe("fbm", () => {
  it("returns normalized values roughly in [-1, 1]", () => {
    const noise = createSeededNoise2D("fbm-seed");
    for (let i = 0; i < 100; i++) {
      const val = fbm(noise, i * 0.5, i * 0.3);
      expect(val).toBeGreaterThanOrEqual(-1);
      expect(val).toBeLessThanOrEqual(1);
    }
  });

  it("is deterministic", () => {
    const n1 = createSeededNoise2D("fbm-det");
    const n2 = createSeededNoise2D("fbm-det");

    const a = fbm(n1, 10, 20, { octaves: 4, scale: 0.01 });
    const b = fbm(n2, 10, 20, { octaves: 4, scale: 0.01 });

    expect(a).toEqual(b);
  });

  it("respects the scale parameter", () => {
    const noise = createSeededNoise2D("scale-test");
    // Very different scales should produce different values at the same point
    const a = fbm(noise, 50, 50, { scale: 0.001 });
    const b = fbm(noise, 50, 50, { scale: 1.0 });
    expect(a).not.toEqual(b);
  });
});

describe("ridgeFbm", () => {
  it("returns values in [0, 1]", () => {
    const noise = createSeededNoise2D("ridge-seed");
    for (let i = 0; i < 100; i++) {
      const val = ridgeFbm(noise, i * 0.5, i * 0.3);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });
});
