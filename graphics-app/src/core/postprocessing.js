/**
 * postprocessing.js — Post-processing pipeline.
 *
 * CG techniques:
 *   - HDR bloom (UnrealBloomPass) for cinematic glow on bright areas
 *   - Vignette shader for subtle edge darkening
 *   - OutputPass for correct tone-mapped output
 *
 * The bloom is intentionally subtle — it catches bright sky pixels
 * and sun reflections without washing out the terrain.
 */

import * as THREE from 'three';
import { EffectComposer }   from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass }       from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass }  from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass }       from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass }       from 'three/examples/jsm/postprocessing/OutputPass.js';

// ─── Vignette shader ────────────────────────────────────────────────

const VignetteShader = {
  name: 'VignetteShader',
  uniforms: {
    tDiffuse:  { value: null },
    offset:    { value: 1.0 },
    darkness:  { value: 1.2 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - 0.5) * 2.0;
      float vigDist = 1.0 - dot(uv, uv) * 0.35;
      vigDist = clamp(vigDist, 0.0, 1.0);
      vigDist = pow(vigDist, darkness);
      texel.rgb *= mix(1.0 - offset * 0.3, 1.0, vigDist);
      gl_FragColor = texel;
    }
  `,
};

// ─── Public factory ──────────────────────────────────────────────────

/**
 * Create a post-processing pipeline.
 *
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene}         scene
 * @param {THREE.Camera}        camera
 * @returns {{ composer, resize, setBloomStrength, setBloomThreshold }}
 */
export function createPostProcessing(renderer, scene, camera) {
  const size = renderer.getSize(new THREE.Vector2());

  const composer = new EffectComposer(renderer);

  // 1. Normal scene render
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // 2. HDR Bloom
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(size.x, size.y),
    0.35,   // strength — subtle
    0.6,    // radius
    0.85    // threshold — only bright pixels bloom
  );
  composer.addPass(bloomPass);

  // 3. Vignette
  const vignettePass = new ShaderPass(VignetteShader);
  vignettePass.uniforms.offset.value   = 1.0;
  vignettePass.uniforms.darkness.value = 1.3;
  composer.addPass(vignettePass);

  // 4. Output pass (tone mapping + colour space)
  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  // --- Resize handler ---
  function resize(width, height) {
    composer.setSize(width, height);
    bloomPass.resolution.set(width, height);
  }

  return {
    composer,
    resize,
    setBloomStrength:  (v) => { bloomPass.strength  = v; },
    setBloomThreshold: (v) => { bloomPass.threshold = v; },
    getBloomStrength:  ()  => bloomPass.strength,
    getBloomThreshold: ()  => bloomPass.threshold,
  };
}
