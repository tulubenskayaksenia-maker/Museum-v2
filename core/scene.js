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
  64, // Более естественная музейная перспектива
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
  2.4,
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

// На телефонах рендерим чуть ниже максимальной чёткости:
// разницу почти не видно, а нагрузка на видеокарту
// (нагрев, подтормаживания, разряд батареи) заметно ниже.
const IS_TOUCH_DEVICE =
  window.matchMedia("(pointer: coarse)").matches;

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    IS_TOUCH_DEVICE ? 1.5 : 2
  )
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

// В вертикальном режиме (телефон) экран узкий, и при обычном
// угле обзора видно лишь узкую полоску зала. Немного отдаляем
// камеру через zoom, чтобы по бокам были видны стены, двери и кассы.
// fov при этом не трогаем — им управляет зум пальцами/колесом.
const PORTRAIT_REFERENCE_ASPECT = 0.75;
const MIN_PORTRAIT_ZOOM = 0.62;

function applyViewportAspect() {
  const aspect =
    window.innerWidth / window.innerHeight;

  camera.aspect = aspect;

  camera.zoom =
    aspect < PORTRAIT_REFERENCE_ASPECT
      ? Math.max(
          MIN_PORTRAIT_ZOOM,
          aspect / PORTRAIT_REFERENCE_ASPECT
        )
      : 1;

  camera.updateProjectionMatrix();
}

applyViewportAspect();

window.addEventListener("resize", () => {
  applyViewportAspect();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});