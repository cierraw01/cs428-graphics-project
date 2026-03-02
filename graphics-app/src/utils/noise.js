/**
 * noise.js — Seeded 2D Simplex noise + fractal Brownian motion (fBm).
 *
 * Uses the `simplex-noise` library seeded via `seedrandom` so that
 * identical seeds always produce identical terrain.
 *
 * Exports:
 *   createSeededNoise2D(seed)  — returns a (x, y) → [-1, 1] noise function
 *   fbm(noiseFn, x, y, opts)  — layers multiple octaves for natural-looking terrain
 *   ridgeFbm(noiseFn, x, y, opts) — ridged variant for mountain ranges
 */

import { createNoise2D } from "simplex-noise";
import seedrandom from "seedrandom";

// ─── Core noise factory ──────────────────────────────────────────────

/**
 * Create a seeded 2D simplex-noise function.
 *
 * @param {string|number} seed  Any hashable seed value.
 * @returns {(x: number, y: number) => number}  Noise value in [-1, 1].
 */
export function createSeededNoise2D(seed) {
  // seedrandom produces a deterministic PRNG that simplex-noise
  // uses internally to shuffle its permutation table.
  const rng = seedrandom(seed);
  return createNoise2D(rng);
}

// ─── Fractal Brownian Motion (fBm) ──────────────────────────────────

/**
 * Layer multiple octaves of noise to produce natural-looking detail
 * at many scales (large hills + medium bumps + small rocks).
 *
 * @param {Function} noiseFn   A 2D noise function (x, y) → [-1, 1].
 * @param {number}   x         World-space X coordinate.
 * @param {number}   y         World-space Y (or Z) coordinate.
 * @param {Object}   [opts]    Tuning knobs:
 * @param {number}   [opts.octaves=6]      How many noise layers to stack.
 * @param {number}   [opts.lacunarity=2.0] Frequency multiplier per octave.
 * @param {number}   [opts.gain=0.5]       Amplitude multiplier per octave (persistence).
 * @param {number}   [opts.scale=1.0]      Base frequency scale (lower = broader features).
 * @returns {number} Normalized value in approximately [-1, 1].
 */
export function fbm(
  noiseFn,
  x,
  y,
  { octaves = 6, lacunarity = 2.0, gain = 0.5, scale = 1.0 } = {}
) {
  let sum = 0;       // accumulated noise value
  let amplitude = 1; // current octave amplitude
  let frequency = scale;  // current octave frequency
  let maxAmplitude = 0;   // for normalizing the result

  for (let i = 0; i < octaves; i++) {
    sum += noiseFn(x * frequency, y * frequency) * amplitude;
    maxAmplitude += amplitude;

    // Each successive octave is higher frequency, lower amplitude
    frequency *= lacunarity;
    amplitude *= gain;
  }

  // Normalize so the output stays in [-1, 1] regardless of octave count
  return sum / maxAmplitude;
}

// ─── Ridged fBm ─────────────────────────────────────────────────────

/**
 * Ridged fractal noise — takes the absolute value of each octave and
 * inverts it, producing sharp ridges useful for mountain ranges.
 *
 * @param {Function} noiseFn   A 2D noise function (x, y) → [-1, 1].
 * @param {number}   x         World-space X coordinate.
 * @param {number}   y         World-space Y (or Z) coordinate.
 * @param {Object}   [opts]    Same tuning knobs as fbm().
 * @returns {number} Value in approximately [0, 1].
 */
export function ridgeFbm(
  noiseFn,
  x,
  y,
  { octaves = 6, lacunarity = 2.0, gain = 0.5, scale = 1.0 } = {}
) {
  let sum = 0;
  let amplitude = 1;
  let frequency = scale;
  let maxAmplitude = 0;

  for (let i = 0; i < octaves; i++) {
    // abs() creates a "V" shape; (1 - abs) flips it into sharp ridges
    const n = 1.0 - Math.abs(noiseFn(x * frequency, y * frequency));
    sum += n * amplitude;
    maxAmplitude += amplitude;

    frequency *= lacunarity;
    amplitude *= gain;
  }

  return sum / maxAmplitude;
}
