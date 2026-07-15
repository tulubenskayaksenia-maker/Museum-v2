import {
  THREE,
  scene,
  camera
} from "../core/scene.js";

import {
  openSculptureViewer
} from "../ui/sculptureViewer.js";

// =====================================================
// MATERIALS
// =====================================================

const roomFloorMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x2e3035,
    roughness: 0.88,
    metalness: 0.02
  });

const roomWallMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xcacbc8,
    roughness: 0.94,
    metalness: 0
  });

const platformMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xe2e2de,
    roughness: 0.9,
    metalness: 0
  });

const pedestalMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xe9e9e5,
    roughness: 0.88,
    metalness: 0
  });

const sculptureMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x08090b,
    roughness: 0.42,
    metalness: 0.24
  });

const darkSculptureMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x030304,
    roughness: 0.62,
    metalness: 0.12
  });

// =====================================================
// STATE
// =====================================================

let sculptureRoom = null;

const sculptures = [];

const raycaster =
  new THREE.Raycaster();

const pointer =
  new THREE.Vector2();

let clickListenerInstalled = false;

// =====================================================
// MAIN
// =====================================================

export function createSculptureRoom() {
  const room =
    new THREE.Group();

  room.name =
    "Sculpture Gallery";

  room.visible = false;

  sculptureRoom = room;
  sculptures.length = 0;

  const roomWidth = 38;
  const roomDepth = 46;
  const roomHeight = 12;

  const centerZ = -12;
  const backWallZ = -35;

  createArchitecture({
    parent: room,
    roomWidth,
    roomDepth,
    roomHeight,
    centerZ,
    backWallZ
  });

  createPlatformComposition(room);
  createGalleryLights(room);
  installSculptureInteraction();

  room.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.castShadow = false;
    child.receiveShadow = true;
  });

  scene.add(room);

  return room;
}

// =====================================================
// ARCHITECTURE
// =====================================================

function createArchitecture({
  parent,
  roomWidth,
  roomDepth,
  roomHeight,
  centerZ,
  backWallZ
}) {
  const floor =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        roomWidth,
        0.16,
        roomDepth
      ),
      roomFloorMaterial
    );

  floor.position.set(
    0,
    -0.08,
    centerZ
  );

  parent.add(floor);

  const leftWall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1,
        roomHeight,
        roomDepth
      ),
      roomWallMaterial
    );

  leftWall.position.set(
    -roomWidth / 2,
    roomHeight / 2,
    centerZ
  );

  parent.add(leftWall);

  const rightWall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1,
        roomHeight,
        roomDepth
      ),
      roomWallMaterial
    );

  rightWall.position.set(
    roomWidth / 2,
    roomHeight / 2,
    centerZ
  );

  parent.add(rightWall);

  const backWall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        roomWidth,
        roomHeight,
        1
      ),
      roomWallMaterial
    );

  backWall.position.set(
    0,
    roomHeight / 2,
    backWallZ
  );

  parent.add(backWall);

  const ceiling =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        roomWidth,
        0.3,
        roomDepth
      ),
      roomWallMaterial
    );

  ceiling.position.set(
    0,
    roomHeight,
    centerZ
  );

  parent.add(ceiling);
}

// =====================================================
// PLATFORM COMPOSITION
// =====================================================

function createPlatformComposition(parent) {
  /*
    Общие белые основания создают композицию,
    похожую на референс.
  */

  createBasePlatform({
    parent,
    x: -8,
    z: -7,
    width: 15,
    depth: 7
  });

  createBasePlatform({
    parent,
    x: 8,
    z: -12,
    width: 13,
    depth: 8
  });

  createBasePlatform({
    parent,
    x: -5,
    z: -22,
    width: 17,
    depth: 7
  });

  createBasePlatform({
    parent,
    x: 8,
    z: -27,
    width: 12,
    depth: 7
  });

  /*
    Скульптуры распределены свободно:
    не строгой сеткой, а музейной композицией.
  */

  createPedestalWithSculpture({
    parent,
    id: "sculpture-01",
    x: -12,
    z: -6,
    pedestalWidth: 2.5,
    pedestalHeight: 4.5,
    sculptureScale: 1.25,
    shapeType: 1
  });

  createPedestalWithSculpture({
    parent,
    id: "sculpture-02",
    x: -5,
    z: -8,
    pedestalWidth: 2.7,
    pedestalHeight: 3.2,
    sculptureScale: 1.05,
    shapeType: 2
  });

  createPedestalWithSculpture({
    parent,
    id: "sculpture-03",
    x: 6,
    z: -10,
    pedestalWidth: 2.4,
    pedestalHeight: 4,
    sculptureScale: 1.15,
    shapeType: 3
  });

  createPedestalWithSculpture({
    parent,
    id: "sculpture-04",
    x: 11,
    z: -15,
    pedestalWidth: 3,
    pedestalHeight: 2.5,
    sculptureScale: 1.4,
    shapeType: 4
  });

  createPedestalWithSculpture({
    parent,
    id: "sculpture-05",
    x: -10,
    z: -22,
    pedestalWidth: 2.8,
    pedestalHeight: 3.8,
    sculptureScale: 1.15,
    shapeType: 5
  });

  createPedestalWithSculpture({
    parent,
    id: "sculpture-06",
    x: -1,
    z: -24,
    pedestalWidth: 3.2,
    pedestalHeight: 2.8,
    sculptureScale: 1.35,
    shapeType: 6
  });

  createPedestalWithSculpture({
    parent,
    id: "sculpture-07",
    x: 9,
    z: -28,
    pedestalWidth: 2.6,
    pedestalHeight: 5,
    sculptureScale: 1.2,
    shapeType: 7
  });
}

function createBasePlatform({
  parent,
  x,
  z,
  width,
  depth
}) {
  const platform =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        0.24,
        depth
      ),
      platformMaterial
    );

  platform.position.set(
    x,
    0.12,
    z
  );

  parent.add(platform);
}

// =====================================================
// PEDESTALS
// =====================================================

function createPedestalWithSculpture({
  parent,
  id,
  x,
  z,
  pedestalWidth,
  pedestalHeight,
  sculptureScale,
  shapeType
}) {
  const installation =
    new THREE.Group();

  installation.name =
    `${id}-installation`;

  const pedestal =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        pedestalWidth,
        pedestalHeight,
        pedestalWidth
      ),
      pedestalMaterial
    );

  pedestal.position.y =
    0.24 + pedestalHeight / 2;

  installation.add(pedestal);

  const sculpture =
    createAbstractSculpture({
      id,
      shapeType
    });

  sculpture.position.y =
    0.24 +
    pedestalHeight +
    1.25 * sculptureScale;

  sculpture.scale.setScalar(
    sculptureScale
  );

  sculpture.userData.baseScale =
    sculptureScale;

  sculpture.userData.targetScale =
    sculptureScale;

  installation.add(sculpture);

  installation.position.set(
    x,
    0,
    z
  );

  parent.add(installation);

  sculptures.push(sculpture);
}

// =====================================================
// ABSTRACT SCULPTURES
// =====================================================

function createAbstractSculpture({
  id,
  shapeType
}) {
  const root =
    new THREE.Group();

  root.name = id;

  root.userData.type =
    "sculpture";

  root.userData.sculptureId =
    id;

  root.userData.shapeType =
    shapeType;

  const geometry =
    createDistortedGeometry(
      shapeType
    );

  const material =
    shapeType % 2 === 0
      ? sculptureMaterial
      : darkSculptureMaterial;

  const body =
    new THREE.Mesh(
      geometry,
      material
    );

  body.name =
    `${id}-body`;

  body.userData.type =
    "sculpture";

  body.userData.sculptureId =
    id;

  body.userData.shapeType =
    shapeType;

  body.rotation.set(
    shapeType * 0.17,
    shapeType * 0.31,
    shapeType * 0.09
  );

  root.add(body);

  /*
    Второй объём делает скульптуры
    ещё менее геометричными.
  */

  if (
    shapeType === 2 ||
    shapeType === 5 ||
    shapeType === 7
  ) {
    const secondary =
      new THREE.Mesh(
        createDistortedGeometry(
          shapeType + 10
        ),
        material
      );

    secondary.scale.set(
      0.55,
      0.8,
      0.5
    );

    secondary.position.set(
      0.5,
      0.65,
      -0.15
    );

    secondary.rotation.set(
      0.4,
      0.7,
      -0.25
    );

    secondary.userData.type =
      "sculpture";

    secondary.userData.sculptureId =
      id;

    secondary.userData.shapeType =
      shapeType;

    root.add(secondary);
  }

  return root;
}

function createDistortedGeometry(
  seed
) {
  const geometry =
    new THREE.IcosahedronGeometry(
      1.35,
      4
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
        vertex.x * 2.2 +
        seed * 0.7
      ) * 0.18 +
      Math.cos(
        vertex.y * 2.8 -
        seed * 0.45
      ) * 0.13 +
      Math.sin(
        vertex.z * 3.4 +
        seed
      ) * 0.1;

    vertex.normalize();

    vertex.multiplyScalar(
      originalLength *
      distortion
    );

    vertex.x *=
      0.78 +
      (seed % 3) * 0.12;

    vertex.y *=
      1.15 +
      (seed % 4) * 0.17;

    vertex.z *=
      0.72 +
      (seed % 5) * 0.08;

    /*
      Лёгкое скручивание формы.
    */

    const twist =
      vertex.y * 0.22;

    const originalX =
      vertex.x;

    vertex.x =
      originalX *
        Math.cos(twist) -
      vertex.z *
        Math.sin(twist);

    vertex.z =
      originalX *
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
// PROXIMITY EFFECT
// =====================================================

export function updateSculptureRoom() {
  if (
    !sculptureRoom ||
    !sculptureRoom.visible
  ) {
    return;
  }

  const cameraPosition =
    new THREE.Vector3();

  camera.getWorldPosition(
    cameraPosition
  );

  sculptures.forEach(
    (sculpture) => {
      const worldPosition =
        new THREE.Vector3();

      sculpture.getWorldPosition(
        worldPosition
      );

      const distance =
        cameraPosition.distanceTo(
          worldPosition
        );

      const baseScale =
        sculpture.userData.baseScale;

      /*
        С 6 метров скульптура начинает
        постепенно увеличиваться.

        Максимум — примерно на 32%.
      */

      const proximity =
        THREE.MathUtils.clamp(
          1 - distance / 6,
          0,
          1
        );

      const enlargedScale =
        baseScale *
        (
          1 +
          proximity * 0.32
        );

      sculpture.userData.targetScale =
        enlargedScale;

      const currentScale =
        sculpture.scale.x;

      const smoothScale =
        THREE.MathUtils.lerp(
          currentScale,
          enlargedScale,
          0.08
        );

      sculpture.scale.setScalar(
        smoothScale
      );

      /*
        Очень медленное вращение вблизи,
        чтобы форма ощущалась живой.
      */

      if (distance < 5) {
        sculpture.rotation.y +=
          0.0015;
      }
    }
  );
}

// =====================================================
// CLICK INTERACTION
// =====================================================

function installSculptureInteraction() {
  if (clickListenerInstalled) {
    return;
  }

  clickListenerInstalled = true;

  window.addEventListener(
    "click",
    handleSculptureClick,
    true
  );
}

function handleSculptureClick(
  event
) {
  if (
    !sculptureRoom ||
    !sculptureRoom.visible
  ) {
    return;
  }

  if (
    event.target.closest?.(
      "#sculpture-viewer"
    )
  ) {
    return;
  }

  pointer.x =
    (
      event.clientX /
      window.innerWidth
    ) * 2 - 1;

  pointer.y =
    -(
      event.clientY /
      window.innerHeight
    ) * 2 + 1;

  raycaster.setFromCamera(
    pointer,
    camera
  );

  const hits =
    raycaster.intersectObjects(
      sculptureRoom.children,
      true
    );

  for (const hit of hits) {
    let object =
      hit.object;

    while (
      object &&
      object !== sculptureRoom
    ) {
      if (
        object.userData.type ===
        "sculpture"
      ) {
        event.preventDefault();

        event.stopImmediatePropagation();

        openSculptureViewer({
          sculptureId:
            object.userData.sculptureId,

          shapeType:
            object.userData.shapeType
        });

        return;
      }

      object =
        object.parent;
    }
  }
}

// =====================================================
// LIGHTING
// =====================================================

function createGalleryLights(parent) {
  const ambient =
    new THREE.HemisphereLight(
      0xf3f3ef,
      0x3a3b40,
      1.05
    );

  parent.add(ambient);

  const centralLight =
    new THREE.DirectionalLight(
      0xffffff,
      1.35
    );

  centralLight.position.set(
    5,
    12,
    8
  );

  parent.add(centralLight);

  createSpotlight({
    parent,
    x: -11,
    z: -4,
    targetX: -10,
    targetZ: -8
  });

  createSpotlight({
    parent,
    x: 0,
    z: -8,
    targetX: 0,
    targetZ: -17
  });

  createSpotlight({
    parent,
    x: 10,
    z: -13,
    targetX: 8,
    targetZ: -20
  });

  createSpotlight({
    parent,
    x: -5,
    z: -23,
    targetX: -3,
    targetZ: -27
  });
}

function createSpotlight({
  parent,
  x,
  z,
  targetX,
  targetZ
}) {
  const light =
    new THREE.SpotLight(
      0xffffff,
      2.1,
      30,
      Math.PI / 8,
      0.62,
      1.4
    );

  light.position.set(
    x,
    10.5,
    z
  );

  light.target.position.set(
    targetX,
    2,
    targetZ
  );

  light.castShadow = false;

  parent.add(light);
  parent.add(light.target);
}