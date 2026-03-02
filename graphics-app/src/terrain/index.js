/**
 * terrain/index.js — Procedural terrain generation.
 *
 * Creates a heightmap mesh by displacing a subdivided plane with
 * layered simplex noise (fBm).  Vertices are coloured by altitude
 * so you get a natural water → grass → rock → snow gradient.
 *
 * Exports:
 *   createTerrain(scene, seed)  – build the terrain mesh and add it to the scene
 *   updateTerrain(camera)       – (stub) will stream/recycle chunks later
 */

import * as THREE from 'three';
import { createSeededNoise2D, fbm } from '../utils/index.js';

// ─── Terrain configuration ──────────────────────────────────────────
// Tweak these to change the look of the world.

const TERRAIN_SIZE     = 2000;   // world-unit width & depth of the terrain patch
const TERRAIN_SEGMENTS = 512;    // vertex subdivisions (512 × 512 = 262 k verts)
const HEIGHT_SCALE     = 120;    // max peak height in world units

/** Noise parameters fed into fbm() */
const NOISE_OPTS = {
  octaves:    6,       // number of noise layers
  lacunarity: 2.0,     // frequency multiplier per octave
  gain:       0.45,    // amplitude decay per octave (persistence)
  scale:      0.002,   // base frequency — lower = broader features
};

// ─── Altitude-based colour stops ────────────────────────────────────
// Each entry: [normalised height 0-1, THREE.Color]
// Heights below 0.28 are treated as "water level".

const COLOUR_STOPS = [
  [0.00, new THREE.Color(0x1a3c5e)],  // deep water
  [0.25, new THREE.Color(0x2a6e9e)],  // shallow water
  [0.28, new THREE.Color(0xc2b280)],  // sandy shore
  [0.32, new THREE.Color(0x3a7d44)],  // grass
  [0.55, new THREE.Color(0x2d5a1e)],  // dark forest
  [0.70, new THREE.Color(0x6b6b6b)],  // rock
  [0.85, new THREE.Color(0x9e9e9e)],  // high rock
  [1.00, new THREE.Color(0xffffff)],  // snow cap
];

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Linearly interpolate a colour from the COLOUR_STOPS table
 * based on a normalised height value t ∈ [0, 1].
 */
function sampleColour(t, target = new THREE.Color()) {
  // Clamp to [0, 1]
  t = Math.max(0, Math.min(1, t));

  for (let i = 1; i < COLOUR_STOPS.length; i++) {
    const [prevH, prevCol] = COLOUR_STOPS[i - 1];
    const [currH, currCol] = COLOUR_STOPS[i];

    if (t <= currH) {
      // How far between the two stops?
      const blend = (t - prevH) / (currH - prevH);
      return target.copy(prevCol).lerp(currCol, blend);
    }
  }

  // Fallback — highest colour
  return target.copy(COLOUR_STOPS[COLOUR_STOPS.length - 1][1]);
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Build a procedural terrain mesh and add it to the scene.
 *
 * @param {THREE.Scene}  scene  The scene to add the terrain to.
 * @param {string|number} seed  Seed for deterministic generation.
 * @returns {{ mesh: THREE.Mesh }}  References for later use.
 */
export function createTerrain(scene, seed) {
  // 1. Create a seeded noise function
  const noise2D = createSeededNoise2D(seed);

  // 2. Build a subdivided plane, rotate it so Y is up
  const geometry = new THREE.PlaneGeometry(
    TERRAIN_SIZE,
    TERRAIN_SIZE,
    TERRAIN_SEGMENTS,
    TERRAIN_SEGMENTS
  );
  geometry.rotateX(-Math.PI / 2);

  // 3. Displace each vertex's Y by layered noise
  const positions = geometry.attributes.position;

  // We'll also store per-vertex colour based on height
  const colours = new Float32Array(positions.count * 3);
  const tempColour = new THREE.Color();

  // Track min/max so we can normalise heights for colouring
  let minY = Infinity;
  let maxY = -Infinity;

  // First pass — compute heights
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);

    // Sample layered noise and scale to world height
    const h = fbm(noise2D, x, z, NOISE_OPTS) * HEIGHT_SCALE;
    positions.setY(i, h);

    if (h < minY) minY = h;
    if (h > maxY) maxY = h;
  }

  // Second pass — assign colours based on normalised height
  const heightRange = maxY - minY || 1; // avoid division by zero

  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    const t = (y - minY) / heightRange; // 0 at lowest, 1 at highest

    sampleColour(t, tempColour);
    colours[i * 3]     = tempColour.r;
    colours[i * 3 + 1] = tempColour.g;
    colours[i * 3 + 2] = tempColour.b;
  }

  // Attach vertex colours to geometry
  geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));

  // Recompute normals so lighting responds to the displaced surface
  geometry.computeVertexNormals();

  // 4. Material — uses vertex colours, no texture needed
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.85,
    metalness: 0.05,
    flatShading: false, // smooth shading for natural look
  });

  // 5. Create mesh, enable shadows, add to scene
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.castShadow = false; // terrain is huge — self-shadow not needed
  scene.add(mesh);

  return { mesh };
}

/**
 * Update terrain based on camera position.
 * (Stub — will handle chunk streaming / LOD in a future PR.)
 *
 * @param {THREE.Camera} _camera
 */
export function updateTerrain(_camera) {
  // TODO: implement chunk loading/unloading around camera
}
