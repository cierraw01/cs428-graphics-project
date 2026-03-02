/**
 * utils/ barrel — re-exports every utility so the rest of the app
 * can do:  import { seedRandom, fbm, ... } from './utils/index.js'
 */

// ── Seeded PRNG ─────────────────────────────────────────────────────
export { seedRandom, random } from './random.js';

// ── Noise functions ─────────────────────────────────────────────────
export { createSeededNoise2D, fbm, ridgeFbm } from './noise.js';