/**
 * water.js — Animated water surface.
 *
 * Creates a large translucent plane at sea level with:
 *   - MeshPhysicalMaterial   → clearcoat for fresnel-like reflections
 *   - Vertex wave animation  → injected via onBeforeCompile
 *   - Subtle colour variation with depth
 *
 * CG techniques:
 *   - Real-time vertex displacement (sine wave superposition)
 *   - Fresnel reflection approximation via clearcoat
 *   - Alpha transparency compositing
 */

import * as THREE from 'three';

// ─── Configuration ──────────────────────────────────────────────────

const WATER_SIZE  = 4000;    // metres — covers the visible terrain
const WATER_LEVEL = -30;     // world-Y sea level (matches colour-stop shore line)
const SEGMENTS    = 256;     // subdivisions for wave detail

// ─── Public factory ──────────────────────────────────────────────────

/**
 * Create an animated water plane and add it to the scene.
 *
 * @param {THREE.Scene} scene
 * @returns {{ mesh, update(time) }}
 */
export function createWater(scene) {
  const geometry = new THREE.PlaneGeometry(WATER_SIZE, WATER_SIZE, SEGMENTS, SEGMENTS);
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.MeshPhysicalMaterial({
    color:        new THREE.Color(0x1a6e8e),
    transparent:  true,
    opacity:      0.72,
    roughness:    0.15,
    metalness:    0.1,
    clearcoat:    0.9,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.5,
    side:         THREE.DoubleSide,
    depthWrite:   false,   // avoid z-fighting with terrain below water
  });

  // --- Inject wave displacement into the vertex shader ---
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0.0 };

    // Store reference so we can update uTime each frame
    material.userData.shader = shader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      /* glsl */ `
        #include <common>
        uniform float uTime;

        // Simple multi-frequency wave
        float wave(vec3 p, float t) {
          float w  = sin(p.x * 0.015 + t * 0.8) * 2.5;
                w += sin(p.z * 0.020 + t * 1.1) * 1.8;
                w += sin((p.x + p.z) * 0.012 + t * 0.6) * 1.2;
                w += sin(p.x * 0.04 + p.z * 0.03 + t * 1.5) * 0.5;
          return w;
        }
      `
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      /* glsl */ `
        #include <begin_vertex>
        transformed.y += wave(transformed, uTime);
      `
    );
  };

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = WATER_LEVEL;
  mesh.receiveShadow = true;
  mesh.renderOrder = 1; // render after opaque terrain

  scene.add(mesh);

  /** Call every frame with elapsed time (seconds). */
  function update(elapsedTime) {
    if (material.userData.shader) {
      material.userData.shader.uniforms.uTime.value = elapsedTime;
    }
  }

  return { mesh, update };
}
