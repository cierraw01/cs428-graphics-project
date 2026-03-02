/**
 * random.js — Deterministic seeded PRNG wrapper.
 *
 * Wraps the `seedrandom` library so the rest of the app can call
 * random() and get reproducible values after seeding.
 *
 * Exports:
 *   seedRandom(seed)  — set the global PRNG seed
 *   random()           — next random float in [0, 1)
 */

import seedrandom from "seedrandom";

let rng = Math.random;


export function seedRandom(seed) {
  rng = seedrandom(seed);
}


export function random() {
  return rng();
}
