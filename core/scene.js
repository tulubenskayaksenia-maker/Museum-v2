import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export { THREE };

// =====================================================
// SCENE
// =====================================================

export const scene = new THREE.Scene();

scene.background = new THREE.Color(0x000000);

// =====================================================
// CAMERA
// =====================================================

export const camera = new THREE.PerspectiveCamera(
  70, // Было 64
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

/*
  Камера находится примерно
  на уровне глаз взрослого человека.
*/

camera.position.set(
  0,
  2.75,
  18
);

// =====================================================
// RENDERER
// =====================================================

export const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

// =====================================================
// SHADOWS
// =====================================================

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// =====================================================
// COLOR MANAGEMENT
// =====================================================

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.15;

// =====================================================
// APPEND
// =====================================================

document.body.appendChild(renderer.domElement);

// =====================================================
// RESIZE
// =====================================================

window.addEventListener("resize", () => {
  camera.aspect =
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});