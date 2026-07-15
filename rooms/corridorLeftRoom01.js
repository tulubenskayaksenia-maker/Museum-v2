import {
  THREE,
  scene
} from "../core/scene.js";

import {
  floorMaterial,
  wallMaterial
} from "../core/materials.js";

import {
  createWallArtwork
} from "../objects/artwork.js";

export function createCorridorLeftRoom01() {
  const room =
    new THREE.Group();

  room.name =
    "Corridor Left Room 01";

  room.visible = false;

  // ==========================================
  // ROOM SIZE
  // ==========================================

  const roomWidth = 38;
  const roomDepth = 46;
  const roomHeight = 12;

  const centerZ = -12;
  const backWallZ = -35;

  // ==========================================
  // MATERIALS
  // ==========================================

  const panelMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xd4d5d2,
      roughness: 0.92,
      metalness: 0
    });

  const panelSideMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xbfc0bd,
      roughness: 0.95,
      metalness: 0
    });

  // ==========================================
  // FLOOR
  // ==========================================

  const floor =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        roomWidth,
        0.14,
        roomDepth
      ),
      floorMaterial
    );

  floor.position.set(
    0,
    -0.07,
    centerZ
  );

  floor.receiveShadow = true;

  room.add(floor);

  // ==========================================
  // OUTER WALLS
  // ==========================================

  const leftWall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.2,
        roomHeight,
        roomDepth
      ),
      wallMaterial
    );

  leftWall.position.set(
    -roomWidth / 2,
    roomHeight / 2,
    centerZ
  );

  room.add(leftWall);

  const rightWall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.2,
        roomHeight,
        roomDepth
      ),
      wallMaterial
    );

  rightWall.position.set(
    roomWidth / 2,
    roomHeight / 2,
    centerZ
  );

  room.add(rightWall);

  const backWall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        roomWidth,
        roomHeight,
        1.2
      ),
      wallMaterial
    );

  backWall.position.set(
    0,
    roomHeight / 2,
    backWallZ
  );

  room.add(backWall);

  // ==========================================
  // PANEL CREATOR
  // ==========================================

  function createPanel({
    id,
    x,
    z,
    width = 4.8,
    height = 9.6,
    depth = 0.5,
    rotationY = 0,
    artworkWidth = 2.8,
    artworkHeight = 4,
    artworkY = 5
  }) {
    const panel =
      new THREE.Group();

    panel.name = id;

    const block =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          width,
          height,
          depth
        ),
        [
          panelSideMaterial,
          panelSideMaterial,
          panelMaterial,
          panelMaterial,
          panelMaterial,
          panelMaterial
        ]
      );

    block.position.y =
      height / 2;

    block.castShadow = true;
    block.receiveShadow = true;

    panel.add(block);

    const artwork =
      createWallArtwork({
        id: `${id}-artwork`,

        position:
          new THREE.Vector3(
            0,
            artworkY,
            depth / 2 + 0.09
          ),

        width: artworkWidth,
        height: artworkHeight
      });

    panel.add(artwork);

    panel.position.set(
      x,
      0,
      z
    );

    panel.rotation.y =
      rotationY;

    room.add(panel);

    return panel;
  }

  // ==========================================
  // FIVE EVENLY SPACED PANELS
  // ==========================================

  // Передняя левая
  createPanel({
    id: "room01-panel-01",

    x: -8.5,
    z: -6,

    width: 5,
    artworkWidth: 2.8,
    artworkHeight: 4
  });

  // Передняя правая
  createPanel({
    id: "room01-panel-02",

    x: 8.5,
    z: -6,

    width: 5,
    artworkWidth: 3.2,
    artworkHeight: 4.4
  });

  // Центральная большая
  createPanel({
    id: "room01-panel-main",

    x: 0,
    z: -17,

    width: 7,
    artworkWidth: 5,
    artworkHeight: 6,
    artworkY: 5.2
  });

  // Дальняя левая
  createPanel({
    id: "room01-panel-04",

    x: -8.5,
    z: -28,

    width: 5,
    artworkWidth: 3.1,
    artworkHeight: 4.5
  });

  // Дальняя правая
  createPanel({
    id: "room01-panel-05",

    x: 8.5,
    z: -28,

    width: 5,
    artworkWidth: 2.7,
    artworkHeight: 3.8
  });

  // ==========================================
  // BACK WALL ARTWORK
  // ==========================================

  const backArtwork =
    createWallArtwork({
      id: "room01-back-main",

      position:
        new THREE.Vector3(
          0,
          5.4,
          backWallZ + 0.7
        ),

      width: 9,
      height: 5
    });

  room.add(backArtwork);

  // ==========================================
  // LIGHTS
  // ==========================================

  const roomFill =
    new THREE.HemisphereLight(
      0xe7e9ee,
      0x303238,
      0.75
    );

  room.add(roomFill);

  const frontLight =
    new THREE.PointLight(
      0xffffff,
      1.5,
      45
    );

  frontLight.position.set(
    0,
    8,
    8
  );

  room.add(frontLight);

  const centerLight =
    new THREE.PointLight(
      0xdde6ff,
      1.25,
      38
    );

  centerLight.position.set(
    0,
    7,
    -16
  );

  room.add(centerLight);

  const backLight =
    new THREE.PointLight(
      0xffffff,
      1,
      32
    );

  backLight.position.set(
    0,
    6,
    -29
  );

  room.add(backLight);

  room.traverse((child) => {
    if (child.isMesh) {
      child.receiveShadow = true;
    }
  });

  scene.add(room);

  return room;
}