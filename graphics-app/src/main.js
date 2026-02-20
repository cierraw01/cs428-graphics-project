import * as THREE from 'three';
import Stats from 'stats.js';

// FPS stats.js
const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

// 1. Create a scene
const scene = new THREE.Scene();

// 2. Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// 3. Create a renderer
stats.begin() // stats.js - start measuring
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
stats.end() // stats.js - end measuring

// mount into #app
const container = document.getElementById('app') || document.body;
container.appendChild(renderer.domElement);

// 4. Add a 3D object (a cube)
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00000, wireframe: true });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// animation loop
function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
    stats.update(); // stats.js - update stats
}

// handle resize
window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
});

animate();