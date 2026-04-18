/**
 * terrain/index.js — Procedural terrain with infinite chunk streaming.
 *
 * Combines seeded noise heightmap generation with a chunk-based streaming
 * system that loads/unloads terrain patches as the camera moves.
 *
 * Each chunk is a subdivided plane displaced by fBm noise and coloured
 * by altitude (water → sand → grass → forest → rock → snow).
 *
 * Exports:
 *   createTerrain(scene, seed)  – initialise the terrain system
 *   updateTerrain(camera)       – stream chunks around the camera each frame
 */

import * as THREE from "three";
import { createSeededNoise2D, fbm } from "../utils/index.js";

// ─── Terrain configuration ──────────────────────────────────────────

const CHUNK_SIZE     = 200;    // world-unit width & depth of each chunk
const CHUNK_SEGMENTS = 128;    // subdivisions per chunk (128×128 = 16k verts)
const VIEW_RADIUS    = 3;      // how many chunks to keep loaded in each direction
const HEIGHT_SCALE   = 120;    // max peak height in world units

/** Noise parameters fed into fbm() */
const NOISE_OPTS = {
  octaves:    6,
  lacunarity: 2.0,
  gain:       0.45,
  scale:      0.002,   // base frequency — lower = broader features
};

// ─── Altitude-based colour stops ────────────────────────────────────

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

// ─── Module state ───────────────────────────────────────────────────

let sceneRef  = null;   // reference to the THREE.Scene
let noise2D   = null;   // seeded noise function
const chunks  = new Map();  // key → THREE.Mesh
let lastCX    = null;   // last camera chunk-X (skip work if unchanged)
let lastCZ    = null;   // last camera chunk-Z

// ─── Helpers ────────────────────────────────────────────────────────

/** Map a world coordinate to a chunk index. */
const worldToChunk = (v) => Math.floor(v / CHUNK_SIZE);

/** Unique string key for a chunk coordinate pair. */
const chunkKey = (cx, cz) => `${cx},${cz}`;

/**
 * Interpolate a colour from the COLOUR_STOPS table
 * based on a normalised height t ∈ [0, 1].
 */
function sampleColour(t, target = new THREE.Color()) {
  t = Math.max(0, Math.min(1, t));

  for (let i = 1; i < COLOUR_STOPS.length; i++) {
    const [prevH, prevCol] = COLOUR_STOPS[i - 1];
    const [currH, currCol] = COLOUR_STOPS[i];

    if (t <= currH) {
      const blend = (t - prevH) / (currH - prevH);
      return target.copy(prevCol).lerp(currCol, blend);
    }
  }
  return target.copy(COLOUR_STOPS[COLOUR_STOPS.length - 1][1]);
}

// ─── Chunk lifecycle ────────────────────────────────────────────────

/**
 * Build a single terrain chunk at chunk-grid position (cx, cz),
 * displace its vertices with noise, colour by altitude, and add to scene.
 */
function createChunk(cx, cz) {
  // World-space origin of this chunk
  const originX = cx * CHUNK_SIZE;
  const originZ = cz * CHUNK_SIZE;

  // Subdivided plane, rotated so Y is up
  const geometry = new THREE.PlaneGeometry(
    CHUNK_SIZE, CHUNK_SIZE,
    CHUNK_SEGMENTS, CHUNK_SEGMENTS
  );
  geometry.rotateX(-Math.PI / 2);

  const positions = geometry.attributes.position;
  const colours   = new Float32Array(positions.count * 3);
  const tempCol   = new THREE.Color(); 

  // --- First pass: displace vertices with noise ---

for (let i = 0; i < positions.count; i++) {
  // local vertex position -> world position for noise sampling
  const wx = positions.getX(i) + originX + CHUNK_SIZE / 2;
  const wz = positions.getZ(i) + originZ + CHUNK_SIZE / 2;

  // base terrain noise
  // this keeps the smaller hills and terrain details
  const baseHeight = fbm(noise2D, wx, wz, NOISE_OPTS);

  // macro noise for bigger world variation
  // this helps the terrain feel less repetitive over long travel
  const macro = fbm(noise2D, wx * 0.0003, wz * 0.0003, {
    octaves: 2,
    lacunarity: 2.0,
    gain: 0.5,
    scale: 1,
  });

  // combine detail noise and large-scale variation
  // baseHeight gives normal terrain detail
  // macro pushes some areas flatter and some areas more dramatic
  const h = (baseHeight + macro * 0.8) * HEIGHT_SCALE;

  // apply the final height to this vertex
  positions.setY(i, h);
}


// use a more stable height-to-color mapping so neighboring chunks match better
// this avoids each chunk using its own private min/max for colors
const MIN_TERRAIN_HEIGHT = -HEIGHT_SCALE * 1.2;
const MAX_TERRAIN_HEIGHT = HEIGHT_SCALE * 1.8;
const globalRange = MAX_TERRAIN_HEIGHT - MIN_TERRAIN_HEIGHT;

for (let i = 0; i < positions.count; i++) {
  // normalize height using shared terrain bounds instead of per-chunk bounds
  let t = (positions.getY(i) - MIN_TERRAIN_HEIGHT) / globalRange;

  // clamp so it always stays between 0 and 1
  t = Math.max(0, Math.min(1, t));

  sampleColour(t, tempCol);
  colours[i * 3] = tempCol.r;
  colours[i * 3 + 1] = tempCol.g;
  colours[i * 3 + 2] = tempCol.b;
}

  geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
  geometry.computeVertexNormals();

  // Material — uses vertex colours, no texture needed
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.85,
    metalness: 0.05,
    flatShading: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;

  // Position the chunk in the world
  mesh.position.set(
    originX + CHUNK_SIZE / 2,
    0,
    originZ + CHUNK_SIZE / 2
  );

  sceneRef.add(mesh);
  chunks.set(chunkKey(cx, cz), mesh);
}

/**
 * Remove a chunk and dispose its GPU resources.
 */
function removeChunk(k) {
  const mesh = chunks.get(k);
  if (!mesh) return;

  sceneRef.remove(mesh);
  mesh.geometry.dispose();
  mesh.material.dispose();
  chunks.delete(k);
}
function clearAllChunks() {
  for (const k of chunks.keys()) {
    removeChunk(k);
  }

  // reset cached camera chunk so terrain can rebuild correctly
  lastCX = null;
  lastCZ = null;
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Initialise the terrain system.  Call once after the scene is created.
 *
 * @param {THREE.Scene}   scene  The scene to add chunks to.
 * @param {string|number} seed   Seed for deterministic generation.
 */
export function createTerrain(scene, seed) {
  sceneRef = scene;
  noise2D  = createSeededNoise2D(seed);
  clearAllChunks(); 
}

/**
 * Stream terrain chunks around the camera.  Call every frame.
 * Loads new chunks that come into view, unloads ones that leave.
 *
 * @param {THREE.Camera} camera
 */
export function updateTerrain(camera) {
  if (!sceneRef || !noise2D) return;

  const cx = worldToChunk(camera.position.x);
  const cz = worldToChunk(camera.position.z);

  // Skip if the camera hasn't moved to a new chunk
  if (cx === lastCX && cz === lastCZ) return;
  lastCX = cx;
  lastCZ = cz;

  // Determine which chunks should be loaded
  const needed = new Set();

  for (let dz = -VIEW_RADIUS; dz <= VIEW_RADIUS; dz++) {
    for (let dx = -VIEW_RADIUS; dx <= VIEW_RADIUS; dx++) {
      const nx = cx + dx;
      const nz = cz + dz;
      const k  = chunkKey(nx, nz);

      needed.add(k);

      // Create chunk if it doesn't exist yet
      if (!chunks.has(k)) {
        createChunk(nx, nz);
      }
    }
  }

  // Remove chunks that are no longer in view
  for (const k of chunks.keys()) {
    if (!needed.has(k)) {
      removeChunk(k);
    }
  }
}