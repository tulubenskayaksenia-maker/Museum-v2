import {
  THREE,
  scene,
  camera
} from "../core/scene.js";

// =====================================================
// ОБЩИЕ МАТЕРИАЛЫ
// =====================================================

const frameMaterial = new THREE.MeshStandardMaterial({
  color: 0x111214,
  roughness: 0.72,
  metalness: 0.16
});

const emptyArtworkMaterial = new THREE.MeshStandardMaterial({
  color: 0xb8b6b0,
  roughness: 0.9,
  metalness: 0,
  side: THREE.DoubleSide
});

const wireMaterial = new THREE.MeshStandardMaterial({
  color: 0x292a2d,
  roughness: 0.65,
  metalness: 0.45
});

const floorLightMaterial = new THREE.MeshStandardMaterial({
  color: 0xd7c79f,
  emissive: 0xb89a62,
  emissiveIntensity: 0.38,
  roughness: 0.8,
  metalness: 0
});

// =====================================================
// ПРОСМОТР РАБОТЫ
// =====================================================

let viewer = null;
let activeArtwork = null;

const viewerTargetPosition = new THREE.Vector3();
const viewerCurrentPosition = new THREE.Vector3();

let viewerOpacity = 0;
let viewerTargetOpacity = 0;

// =====================================================
// СОЗДАНИЕ ПОДВЕСНОЙ РАБОТЫ
// =====================================================

export function createHangingArtwork({
  id,
  position,
  width = 2,
  height = 2.8,
  ceilingY = 10.5,
  image = null
}) {
  const artwork = new THREE.Group();

  artwork.name = id;
  artwork.userData.type = "artwork";
  artwork.userData.id = id;
  artwork.userData.width = width;
  artwork.userData.height = height;
  artwork.userData.image = image;

  // Внешняя рама
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(
      width,
      height,
      0.16
    ),
    frameMaterial
  );

  frame.castShadow = true;
  frame.receiveShadow = true;

  artwork.add(frame);

  // Пустое пространство под будущую работу
  const canvasMaterial = emptyArtworkMaterial.clone();

  const canvas = new THREE.Mesh(
    new THREE.PlaneGeometry(
      width - 0.18,
      height - 0.18
    ),
    canvasMaterial
  );

  canvas.position.z = 0.086;
  canvas.userData.isArtworkSurface = true;

  artwork.add(canvas);

  // Загружаем настоящее изображение, когда путь появится
  if (image) {
    applyArtworkTexture(canvas, image);
  }

  artwork.position.copy(position);

  // Два тонких троса
  const wireOffset = width * 0.3;
  const wireLength = Math.max(
    ceilingY - position.y - height / 2,
    0.2
  );

  const leftWire = createWire(wireLength);
  leftWire.position.set(
    -wireOffset,
    height / 2 + wireLength / 2,
    0
  );

  const rightWire = createWire(wireLength);
  rightWire.position.set(
    wireOffset,
    height / 2 + wireLength / 2,
    0
  );

  artwork.add(leftWire);
  artwork.add(rightWire);

  return artwork;
}

// =====================================================
// СОЗДАНИЕ РАБОТЫ НА ПОЛУ
// =====================================================

export function createFloorArtwork({
  id,
  position,
  width = 2.6,
  depth = 1.8,
  image = null
}) {
  const artwork = new THREE.Group();

  artwork.name = id;
  artwork.userData.type = "artwork";
  artwork.userData.id = id;
  artwork.userData.width = width;
  artwork.userData.height = depth;
  artwork.userData.image = image;

  // Низкая металлическая коробка
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(
      width,
      0.16,
      depth
    ),
    frameMaterial
  );

  base.position.y = 0.08;
  base.castShadow = true;
  base.receiveShadow = true;

  artwork.add(base);

  // Светлая поверхность
  const surfaceMaterial = floorLightMaterial.clone();

  const surface = new THREE.Mesh(
    new THREE.PlaneGeometry(
      width - 0.16,
      depth - 0.16
    ),
    surfaceMaterial
  );

  surface.rotation.x = -Math.PI / 2;
  surface.position.y = 0.166;
  surface.userData.isArtworkSurface = true;

  artwork.add(surface);

  if (image) {
    applyArtworkTexture(surface, image);
  }

  artwork.position.copy(position);

  return artwork;
}

// =====================================================
// ТОНКИЙ ТРОС
// =====================================================

function createWire(length) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.012,
      0.012,
      length,
      8
    ),
    wireMaterial
  );
}

// =====================================================
// ПОДКЛЮЧЕНИЕ НАСТОЯЩЕЙ КАРТИНКИ
// =====================================================

function applyArtworkTexture(surface, imagePath) {
  const loader = new THREE.TextureLoader();

  loader.load(
    imagePath,

    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;

      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;

      surface.material.map = texture;
      surface.material.color.set(0xffffff);
      surface.material.emissive?.set(0x000000);
      surface.material.needsUpdate = true;
    },

    undefined,

    (error) => {
      console.error(
        `Не удалось загрузить работу: ${imagePath}`,
        error
      );
    }
  );
}

// =====================================================
// ОТКРЫТИЕ РАБОТЫ
// =====================================================

export function openArtwork(artwork) {
  if (
    !artwork ||
    artwork.userData.type !== "artwork"
  ) {
    return;
  }

  closeArtworkImmediately();

  activeArtwork = artwork;
  viewer = createViewer(artwork);

  scene.add(viewer);

  positionViewerImmediately();

  viewerOpacity = 0;
  viewerTargetOpacity = 1;

  setViewerOpacity(0);
}

// =====================================================
// СОЗДАНИЕ УВЕЛИЧЕННОГО ПРОСМОТРА
// =====================================================

function createViewer(artwork) {
  const group = new THREE.Group();

  group.name = "Artwork Viewer";

  // Затемнение позади работы
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 12),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false
    })
  );

  backdrop.position.z = -0.16;
  backdrop.renderOrder = 1000;
  backdrop.userData.viewerBackdrop = true;

  group.add(backdrop);

  const originalWidth =
    artwork.userData.width || 2;

  const originalHeight =
    artwork.userData.height || 3;

  const aspect =
    originalWidth / originalHeight;

  let viewerHeight = 4.4;
  let viewerWidth = viewerHeight * aspect;

  if (viewerWidth > 6.4) {
    viewerWidth = 6.4;
    viewerHeight = viewerWidth / aspect;
  }

  // Большая рама
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(
      viewerWidth + 0.16,
      viewerHeight + 0.16,
      0.12
    ),
    frameMaterial.clone()
  );

  frame.renderOrder = 1002;
  frame.material.transparent = true;
  frame.material.opacity = 0;

  group.add(frame);

  // Поверхность увеличенной работы
  const originalSurface = artwork.children.find(
    (child) =>
      child.userData.isArtworkSurface
  );

  const viewerMaterial =
    originalSurface?.material?.clone() ||
    emptyArtworkMaterial.clone();

  viewerMaterial.transparent = true;
  viewerMaterial.opacity = 0;
  viewerMaterial.depthTest = false;
  viewerMaterial.depthWrite = false;

  const surface = new THREE.Mesh(
    new THREE.PlaneGeometry(
      viewerWidth,
      viewerHeight
    ),
    viewerMaterial
  );

  surface.position.z = 0.066;
  surface.renderOrder = 1003;
  surface.userData.viewerSurface = true;

  group.add(surface);

  // Viewer не должен мешать raycaster
  group.traverse((child) => {
    child.raycast = () => {};
  });

  return group;
}

// =====================================================
// ЗАКРЫТИЕ
// =====================================================

export function closeArtwork() {
  if (!viewer) {
    return;
  }

  viewerTargetOpacity = 0;
}

export function closeArtworkImmediately() {
  if (viewer) {
    scene.remove(viewer);

    viewer.traverse((child) => {
      if (child.geometry) {
        child.geometry.dispose();
      }

      if (child.material) {
        child.material.dispose();
      }
    });
  }

  viewer = null;
  activeArtwork = null;

  viewerOpacity = 0;
  viewerTargetOpacity = 0;
}

export function isArtworkOpen() {
  return Boolean(viewer || activeArtwork);
}

// =====================================================
// ПОЗИЦИЯ ПЕРЕД ГЛАЗАМИ
// =====================================================

function positionViewerImmediately() {
  if (!viewer) {
    return;
  }

  viewerTargetPosition.set(0, 0, -5);
  camera.localToWorld(viewerTargetPosition);

  viewer.position.copy(viewerTargetPosition);
  viewer.quaternion.copy(camera.quaternion);

  viewerCurrentPosition.copy(viewer.position);
}

// =====================================================
// АНИМАЦИЯ ПРОСМОТРА
// =====================================================

export function updateArtworkViewer() {
  if (!viewer) {
    return;
  }

  viewerTargetPosition.set(0, 0, -5);
  camera.localToWorld(viewerTargetPosition);

  viewerCurrentPosition.lerp(
    viewerTargetPosition,
    0.18
  );

  viewer.position.copy(viewerCurrentPosition);

  viewer.quaternion.slerp(
    camera.quaternion,
    0.18
  );

  viewerOpacity +=
    (viewerTargetOpacity - viewerOpacity) *
    0.14;

  setViewerOpacity(viewerOpacity);

  if (
    viewerTargetOpacity === 0 &&
    viewerOpacity < 0.015
  ) {
    closeArtworkImmediately();
  }
}

function setViewerOpacity(opacity) {
  if (!viewer) {
    return;
  }

  viewer.traverse((child) => {
    if (!child.material) {
      return;
    }

    if (child.userData.viewerBackdrop) {
      child.material.opacity =
        opacity * 0.76;
    } else {
      child.material.opacity = opacity;
    }
  });
}
// =====================================================
// РАБОТА НА ВЕРТИКАЛЬНОЙ ПАНЕЛИ
// =====================================================

export function createWallArtwork({
  id,
  position,
  rotationY = 0,
  width = 2.2,
  height = 3,
  image = null,
  frameColor = 0x151515,
  canvasColor = 0xb8b8b4
}) {
  const artwork = new THREE.Group();

  artwork.name = id;
  artwork.userData.type = "artwork";
  artwork.userData.id = id;
  artwork.userData.width = width;
  artwork.userData.height = height;
  artwork.userData.image = image;

  const localFrameMaterial =
    new THREE.MeshStandardMaterial({
      color: frameColor,
      roughness: 0.72,
      metalness: 0.08
    });

  const localCanvasMaterial =
    new THREE.MeshStandardMaterial({
      color: canvasColor,
      roughness: 0.9,
      metalness: 0,
      side: THREE.DoubleSide
    });

  // Внешняя рама
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(
      width,
      height,
      0.16
    ),
    localFrameMaterial
  );

  frame.castShadow = true;
  frame.receiveShadow = true;

  artwork.add(frame);

  // Пустая поверхность для будущей работы
  const surface = new THREE.Mesh(
    new THREE.PlaneGeometry(
      width - 0.18,
      height - 0.18
    ),
    localCanvasMaterial
  );

  surface.position.z = 0.086;
  surface.userData.isArtworkSurface = true;

  artwork.add(surface);

  if (image) {
    applyArtworkTexture(
      surface,
      image
    );
  }

  artwork.position.copy(position);
  artwork.rotation.y = rotationY;

  return artwork;
}