/**
 * main.js — App entry point.
 *
 * Sets up the scene, terrain, environment, water, post-processing,
 * and UI overlay. Wires the seed-regeneration event so that typing
 * a new seed and clicking "Generate" rebuilds the entire terrain.
 */

import { seedRandom } from './utils/index.js';
import * as THREE from 'three';
import Stats from 'stats.js';
import {
  createRenderer,
  createCamera,
  createEnvironment,
  createPostProcessing,
  createWater,
} from './core/index.js';
import { createTerrain, updateTerrain } from './terrain/index.js';
import createUI from './ui/index.js';

// ─── Stats (FPS counter) ────────────────────────────────────────────

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// ─── Scene ──────────────────────────────────────────────────────────

const scene = new THREE.Scene();
let currentSeed = 'demo-seed';
seedRandom(currentSeed);

// ─── Renderer ───────────────────────────────────────────────────────

const container = document.getElementById('app') || document.body;
const renderer = createRenderer(container);

// ─── Camera ─────────────────────────────────────────────────────────

const { camera, controls, update: updateCamera } = createCamera(renderer.domElement);

// ─── Environment (sky, fog, dynamic lights) ─────────────────────────

const env = createEnvironment(scene);

// ─── Post-processing (bloom + vignette) ─────────────────────────────

const pp = createPostProcessing(renderer, scene, camera);

// ─── Water ──────────────────────────────────────────────────────────

const water = createWater(scene);

// ─── Procedural Terrain ─────────────────────────────────────────────

createTerrain(scene, currentSeed);

// ─── UI overlay ─────────────────────────────────────────────────────

const ui = createUI(env, scene, { postprocessing: pp, stats });

// ─── Seed regeneration event ────────────────────────────────────────

window.addEventListener('ui:regenerateSeed', (e) => {
  const newSeed = e.detail.seed;
  currentSeed = newSeed;
  seedRandom(newSeed);
  createTerrain(scene, newSeed);
  // Force terrain rebuild around current camera position
  updateTerrain(camera);
});

// ─── Clock ──────────────────────────────────────────────────────────

const clock = new THREE.Clock();

// ─── Animate ────────────────────────────────────────────────────────

function animate() {
  requestAnimationFrame(animate);
  stats.begin();

  const delta   = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  updateCamera(delta);
  updateTerrain(camera);
  water.update(elapsed);

  // Use the post-processing composer instead of raw renderer.render()
  pp.composer.render();

  stats.end();
}

// ─── Resize ─────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  pp.resize(w, h);
});

animate();
