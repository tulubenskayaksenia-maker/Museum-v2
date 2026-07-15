import {
  THREE
} from "../core/scene.js";

// =====================================================
// DOM
// =====================================================

let overlay = null;
let canvas = null;
let closeButton = null;

// =====================================================
// THREE.JS VIEWER
// =====================================================

let viewerScene = null;
let viewerCamera = null;
let viewerRenderer = null;

let sculptureRoot = null;

// =====================================================
// STATE
// =====================================================

let isOpen = false;
let isDragging = false;
let viewerInitialized = false;

let previousPointerX = 0;
let previousPointerY = 0;

let rotationVelocityX = 0;
let rotationVelocityY = 0;

/*
  Камера дальше от объекта,
  поэтому скульптура не занимает весь экран.
*/

let cameraDistance = 8;

// =====================================================
// SETUP
// =====================================================

export function setupSculptureViewer() {
  if (viewerInitialized) {
    return;
  }

  viewerInitialized = true;

  createViewerHTML();
  createViewerScene();
  installViewerEvents();
  animateViewer();
}

// =====================================================
// OPEN
// =====================================================

export function openSculptureViewer({
  sculptureId,
  shapeType
}) {
  if (!viewerInitialized) {
    setupSculptureViewer();
  }

  clearCurrentSculpture();

  sculptureRoot =
    createViewerSculpture(
      shapeType ?? 1
    );

  sculptureRoot.name =
    sculptureId ??
    "Sculpture";

  viewerScene.add(
    sculptureRoot
  );

  sculptureRoot.rotation.set(
    0.12,
    0.45,
    0
  );

  /*
    Каждый раз открываем объект
    с безопасного расстояния.
  */

  cameraDistance = 8;

  viewerCamera.position.set(
    0,
    0.3,
    cameraDistance
  );

  viewerCamera.lookAt(
    0,
    0.25,
    0
  );

  rotationVelocityX = 0;
  rotationVelocityY = 0;

  isOpen = true;

  overlay.classList.add(
    "visible"
  );

  document.body.style.cursor =
    "grab";
}

// =====================================================
// CLOSE
// =====================================================

export function closeSculptureViewer() {
  if (!overlay) {
    return;
  }

  isOpen = false;
  isDragging = false;

  overlay.classList.remove(
    "visible"
  );

  document.body.style.cursor =
    "default";
}

export function isSculptureViewerOpen() {
  return isOpen;
}

// =====================================================
// HTML AND CSS
// =====================================================

function createViewerHTML() {
  overlay =
    document.createElement("div");

  overlay.id =
    "sculpture-viewer";

  overlay.innerHTML = `
    <div class="sculpture-viewer-header">
      <span class="sculpture-viewer-label">
        SCULPTURE · 360°
      </span>

      <span class="sculpture-viewer-help">
        DRAG TO ROTATE · SCROLL TO ZOOM
      </span>
    </div>

    <button
      id="sculpture-viewer-close"
      type="button"
      aria-label="Close sculpture viewer"
    >
      ×
    </button>

    <canvas id="sculpture-viewer-canvas"></canvas>
  `;

  document.body.appendChild(
    overlay
  );

  canvas =
    overlay.querySelector(
      "#sculpture-viewer-canvas"
    );

  closeButton =
    overlay.querySelector(
      "#sculpture-viewer-close"
    );

  const style =
    document.createElement("style");

  style.textContent = `
    #sculpture-viewer {
      position: fixed;
      inset: 0;
      z-index: 7000;

      overflow: hidden;

      background:
        radial-gradient(
          circle at 50% 45%,
          #2d2e31 0%,
          #121315 46%,
          #050506 100%
        );

      opacity: 0;
      visibility: hidden;
      pointer-events: none;

      transition:
        opacity 0.22s ease,
        visibility 0.22s ease;
    }

    #sculpture-viewer.visible {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    #sculpture-viewer-canvas {
      display: block;

      width: 100%;
      height: 100%;

      cursor: grab;
      touch-action: none;
    }

    #sculpture-viewer-canvas:active {
      cursor: grabbing;
    }

    .sculpture-viewer-header {
      position: absolute;
      top: 24px;
      left: 28px;
      z-index: 3;

      display: flex;
      flex-direction: column;
      gap: 8px;

      pointer-events: none;
    }

    .sculpture-viewer-label {
      color:
        rgba(255, 255, 255, 0.82);

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      font-size: 11px;
      letter-spacing: 0.28em;
    }

    .sculpture-viewer-help {
      color:
        rgba(255, 255, 255, 0.32);

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      font-size: 9px;
      letter-spacing: 0.17em;
    }

    #sculpture-viewer-close {
      position: absolute;
      top: 20px;
      right: 24px;
      z-index: 4;

      width: 44px;
      height: 44px;

      padding: 0;

      color:
        rgba(255, 255, 255, 0.82);

      background:
        rgba(0, 0, 0, 0.25);

      border:
        1px solid
        rgba(255, 255, 255, 0.18);

      border-radius: 50%;

      font-size: 29px;
      font-weight: 300;
      line-height: 1;

      cursor: pointer;
    }

    #sculpture-viewer-close:hover {
      color: #ffffff;

      background:
        rgba(255, 255, 255, 0.08);
    }
  `;

  document.head.appendChild(
    style
  );
}

// =====================================================
// CREATE VIEWER SCENE
// =====================================================

function createViewerScene() {
  viewerScene =
    new THREE.Scene();

  viewerCamera =
    new THREE.PerspectiveCamera(
      42,
      window.innerWidth /
        window.innerHeight,
      0.1,
      100
    );

  viewerCamera.position.set(
    0,
    0.3,
    cameraDistance
  );

  viewerRenderer =
    new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });

  viewerRenderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      2
    )
  );

  viewerRenderer.setSize(
    window.innerWidth,
    window.innerHeight,
    false
  );

  viewerRenderer.outputColorSpace =
    THREE.SRGBColorSpace;

  viewerRenderer.toneMapping =
    THREE.ACESFilmicToneMapping;

  viewerRenderer.toneMappingExposure =
    1.1;

  // Общий мягкий свет
  const ambient =
    new THREE.HemisphereLight(
      0xf1f1ee,
      0x202126,
      1.55
    );

  viewerScene.add(
    ambient
  );

  // Главный свет
  const keyLight =
    new THREE.DirectionalLight(
      0xffffff,
      3.2
    );

  keyLight.position.set(
    4,
    6,
    5
  );

  viewerScene.add(
    keyLight
  );

  // Контровой холодный свет
  const rimLight =
    new THREE.DirectionalLight(
      0xb7c8e5,
      2.1
    );

  rimLight.position.set(
    -5,
    3,
    -4
  );

  viewerScene.add(
    rimLight
  );

  // Свет снизу
  const lowerLight =
    new THREE.PointLight(
      0xffffff,
      0.85,
      20
    );

  lowerLight.position.set(
    0,
    -4,
    3
  );

  viewerScene.add(
    lowerLight
  );
}

// =====================================================
// CREATE SCULPTURE
// =====================================================

function createViewerSculpture(
  seed
) {
  const root =
    new THREE.Group();

  const material =
    new THREE.MeshStandardMaterial({
      color: 0x07080a,
      roughness: 0.31,
      metalness: 0.33
    });

  const mainBody =
    new THREE.Mesh(
      createDistortedGeometry(
        seed
      ),
      material
    );

  /*
    Уменьшенная форма.

    Теперь скульптура занимает примерно
    половину или чуть больше высоты окна.
  */

  mainBody.scale.set(
    0.82,
    1.02,
    0.76
  );

  root.add(
    mainBody
  );

  /*
    Для некоторых объектов добавляем
    второй бесформенный объём.
  */

  if (
    seed === 2 ||
    seed === 5 ||
    seed === 7
  ) {
    const secondBody =
      new THREE.Mesh(
        createDistortedGeometry(
          seed + 12
        ),
        material
      );

    secondBody.scale.set(
      0.4,
      0.58,
      0.36
    );

    secondBody.position.set(
      0.46,
      0.5,
      -0.12
    );

    secondBody.rotation.set(
      0.4,
      0.65,
      -0.3
    );

    root.add(
      secondBody
    );
  }

  /*
    Слегка опускаем центр объекта,
    чтобы он визуально был посередине экрана.
  */

  root.position.y = -0.15;

  return root;
}

// =====================================================
// DISTORTED GEOMETRY
// =====================================================

function createDistortedGeometry(
  seed
) {
  const geometry =
    new THREE.IcosahedronGeometry(
      1.3,
      5
    );

  const positions =
    geometry.attributes.position;

  const vertex =
    new THREE.Vector3();

  for (
    let i = 0;
    i < positions.count;
    i++
  ) {
    vertex.fromBufferAttribute(
      positions,
      i
    );

    const originalLength =
      vertex.length();

    const distortion =
      1 +
      Math.sin(
        vertex.x * 2.3 +
        seed * 0.72
      ) * 0.2 +
      Math.cos(
        vertex.y * 3.1 -
        seed * 0.38
      ) * 0.15 +
      Math.sin(
        vertex.z * 3.7 +
        seed
      ) * 0.1;

    vertex.normalize();

    vertex.multiplyScalar(
      originalLength *
      distortion
    );

    vertex.x *=
      0.82 +
      (seed % 3) * 0.12;

    vertex.y *=
      1.2 +
      (seed % 4) * 0.16;

    vertex.z *=
      0.72 +
      (seed % 5) * 0.07;

    const twist =
      vertex.y * 0.24;

    const oldX =
      vertex.x;

    vertex.x =
      oldX *
        Math.cos(twist) -
      vertex.z *
        Math.sin(twist);

    vertex.z =
      oldX *
        Math.sin(twist) +
      vertex.z *
        Math.cos(twist);

    positions.setXYZ(
      i,
      vertex.x,
      vertex.y,
      vertex.z
    );
  }

  positions.needsUpdate = true;

  geometry.computeVertexNormals();

  return geometry;
}

// =====================================================
// EVENTS
// =====================================================

function installViewerEvents() {
  closeButton.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();

      closeSculptureViewer();
    }
  );

  overlay.addEventListener(
    "click",
    (event) => {
      if (
        event.target === overlay
      ) {
        closeSculptureViewer();
      }
    }
  );

  canvas.addEventListener(
    "pointerdown",
    handlePointerDown
  );

  window.addEventListener(
    "pointermove",
    handlePointerMove
  );

  window.addEventListener(
    "pointerup",
    handlePointerUp
  );

  window.addEventListener(
    "pointercancel",
    handlePointerUp
  );

  canvas.addEventListener(
    "wheel",
    handleWheel,
    {
      passive: false
    }
  );

  window.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape" &&
        isOpen
      ) {
        closeSculptureViewer();
      }
    }
  );

  window.addEventListener(
    "resize",
    handleResize
  );
}

// =====================================================
// POINTER
// =====================================================

function handlePointerDown(
  event
) {
  if (!isOpen) {
    return;
  }

  isDragging = true;

  previousPointerX =
    event.clientX;

  previousPointerY =
    event.clientY;

  rotationVelocityX = 0;
  rotationVelocityY = 0;

  canvas.setPointerCapture?.(
    event.pointerId
  );
}

function handlePointerMove(
  event
) {
  if (
    !isOpen ||
    !isDragging ||
    !sculptureRoot
  ) {
    return;
  }

  const deltaX =
    event.clientX -
    previousPointerX;

  const deltaY =
    event.clientY -
    previousPointerY;

  rotationVelocityY =
    deltaX * 0.008;

  rotationVelocityX =
    deltaY * 0.006;

  sculptureRoot.rotation.y +=
    rotationVelocityY;

  sculptureRoot.rotation.x +=
    rotationVelocityX;

  sculptureRoot.rotation.x =
    THREE.MathUtils.clamp(
      sculptureRoot.rotation.x,
      -1.15,
      1.15
    );

  previousPointerX =
    event.clientX;

  previousPointerY =
    event.clientY;
}

function handlePointerUp(
  event
) {
  isDragging = false;

  canvas?.releasePointerCapture?.(
    event?.pointerId
  );
}

// =====================================================
// ZOOM
// =====================================================

function handleWheel(
  event
) {
  if (!isOpen) {
    return;
  }

  event.preventDefault();

  cameraDistance +=
    event.deltaY * 0.006;

  /*
    Минимальная дистанция больше,
    поэтому скульптуру нельзя приблизить
    настолько, чтобы она обрезалась.
  */

  cameraDistance =
    THREE.MathUtils.clamp(
      cameraDistance,
      5.2,
      13
    );
}

// =====================================================
// RESIZE
// =====================================================

function handleResize() {
  if (
    !viewerCamera ||
    !viewerRenderer
  ) {
    return;
  }

  viewerCamera.aspect =
    window.innerWidth /
    window.innerHeight;

  viewerCamera.updateProjectionMatrix();

  viewerRenderer.setSize(
    window.innerWidth,
    window.innerHeight,
    false
  );
}

// =====================================================
// ANIMATION
// =====================================================

function animateViewer() {
  requestAnimationFrame(
    animateViewer
  );

  if (
    !isOpen ||
    !viewerRenderer
  ) {
    return;
  }

  if (
    sculptureRoot &&
    !isDragging
  ) {
    /*
      Очень медленное автоматическое вращение.
    */

    sculptureRoot.rotation.y +=
      0.002 +
      rotationVelocityY;

    sculptureRoot.rotation.x +=
      rotationVelocityX;

    rotationVelocityX *=
      0.92;

    rotationVelocityY *=
      0.92;

    sculptureRoot.rotation.x =
      THREE.MathUtils.clamp(
        sculptureRoot.rotation.x,
        -1.15,
        1.15
      );
  }

  viewerCamera.position.z =
    THREE.MathUtils.lerp(
      viewerCamera.position.z,
      cameraDistance,
      0.1
    );

  viewerCamera.lookAt(
    0,
    0.25,
    0
  );

  viewerRenderer.render(
    viewerScene,
    viewerCamera
  );
}

// =====================================================
// CLEANUP
// =====================================================

function clearCurrentSculpture() {
  if (!sculptureRoot) {
    return;
  }

  sculptureRoot.traverse(
    (child) => {
      if (!child.isMesh) {
        return;
      }

      child.geometry?.dispose();

      if (
        Array.isArray(
          child.material
        )
      ) {
        child.material.forEach(
          (material) => {
            material.dispose();
          }
        );
      } else {
        child.material?.dispose();
      }
    }
  );

  viewerScene.remove(
    sculptureRoot
  );

  sculptureRoot = null;
}