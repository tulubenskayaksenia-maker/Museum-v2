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

import {
  createArchPortal,
  createWallWithArchOpening
} from "../objects/arch.js";

export function createCorridorLeftRoom01() {
  const room = new THREE.Group();

  room.name = "Corridor Left Room 01";
  room.visible = false;

  // ==========================================
  // ROOM SIZE
  // ==========================================

  const roomWidth = 32;
  const roomDepth = 46;
  const roomHeight = 12;

  const centerZ = -12;
  const backWallZ = -35;
  const leftWallX = -roomWidth / 2;
  const rightWallX = roomWidth / 2;

  // ==========================================
  // MATERIALS
  // ==========================================

  const innerWallMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xd7d8d5,
      roughness: 0.94,
      metalness: 0
    });

  const innerWallSideMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xbfc1be,
      roughness: 0.96,
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
    leftWallX,
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
    rightWallX,
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
  // HELPERS
  // ==========================================

  function artworkPath(number) {
    return `./assets/artworks/room01/artwork-${String(number).padStart(2, "0")}.webp`;
  }

  function addWallArtwork({
    number,
    x,
    y = 5.55,
    z,
    rotationY = 0,
    width = 3.6,
    height = 4.8
  }) {
    const artwork =
      createWallArtwork({
        id: `room01-artwork-${String(number).padStart(2, "0")}`,

        position: new THREE.Vector3(
          x,
          y,
          z
        ),

        rotationY,
        width,
        height,

        image: artworkPath(number)
      });

    room.add(artwork);

    return artwork;
  }

  // ==========================================
  // CENTRAL GALLERY WALL
  // ==========================================

  function createGalleryWall({
    id,
    x,
    z,
    rotationY = 0,
    frontArtwork = null,
    backArtwork = null,
    width = 8,
    height = 8.8,
    depth = 0.42
  }) {
    const wallGroup =
      new THREE.Group();

    wallGroup.name = id;

    const wallBlock =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          width,
          height,
          depth
        ),
        [
          innerWallSideMaterial,
          innerWallSideMaterial,
          innerWallMaterial,
          innerWallMaterial,
          innerWallMaterial,
          innerWallMaterial
        ]
      );

    wallBlock.position.y =
      height / 2;

    wallBlock.castShadow = true;
    wallBlock.receiveShadow = true;

    wallGroup.add(wallBlock);

    // Передняя сторона.
    // Рамка создаётся только при наличии номера картины.

    if (
      frontArtwork !== null &&
      frontArtwork !== undefined
    ) {
      const front =
        createWallArtwork({
          id: `${id}-front-artwork`,

          position: new THREE.Vector3(
            0,
            5.45,
            depth / 2 + 0.09
          ),

          width: 3.35,
          height: 4.55,

          image: artworkPath(frontArtwork)
        });

      wallGroup.add(front);
    }

    // Обратная сторона.
    // Если backArtwork равен null,
    // рамка вообще не создаётся.

    if (
      backArtwork !== null &&
      backArtwork !== undefined
    ) {
      const back =
        createWallArtwork({
          id: `${id}-back-artwork`,

          position: new THREE.Vector3(
            0,
            5.45,
            -depth / 2 - 0.09
          ),

          rotationY: Math.PI,

          width: 3.35,
          height: 4.55,

          image: artworkPath(backArtwork)
        });

      wallGroup.add(back);
    }

    wallGroup.position.set(
      x,
      0,
      z
    );

    wallGroup.rotation.y =
      rotationY;

    room.add(wallGroup);

    return wallGroup;
  }

  // ==========================================
  // ENTRANCE WALL + RETURN DOOR
  // ==========================================

  const entranceWallZ = 9.45;
  const entranceOpeningWidth = 4.3;
  const entranceOpeningHeight = 6.6;

  const entranceWall =
    createWallWithArchOpening({
      wallWidth: roomWidth,
      wallHeight: roomHeight,
      wallDepth: 0.8,

      openingWidth: entranceOpeningWidth,
      openingHeight: entranceOpeningHeight,

      material: wallMaterial
    });

  entranceWall.position.set(
    0,
    0,
    entranceWallZ
  );

  room.add(entranceWall);

  const returnDoor =
    createArchPortal({
      width: 5,
      height: 7.15,

      openingWidth: entranceOpeningWidth,
      openingHeight: entranceOpeningHeight,

      depth: 0.72,

      target: "corridor",
      showDarkOpening: false
    });

  returnDoor.position.set(
    0,
    0,
    entranceWallZ - 0.45
  );

  returnDoor.rotation.y =
    Math.PI;

  room.add(returnDoor);

  // ==========================================
  // ENTRY ARTWORK PANELS
  // ==========================================

  function createEntryArtworkPanel({
    id,
    number,
    x,
    rotationY
  }) {
    const panel =
      new THREE.Group();

    panel.name = id;

    const panelWidth = 5;
    const panelHeight = 8.4;
    const panelDepth = 0.38;

    const wallBlock =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          panelWidth,
          panelHeight,
          panelDepth
        ),
        innerWallMaterial
      );

    wallBlock.position.y =
      panelHeight / 2;

    wallBlock.castShadow = true;
    wallBlock.receiveShadow = true;

    panel.add(wallBlock);

    const artwork =
      createWallArtwork({
        id: `${id}-artwork`,

        position: new THREE.Vector3(
          0,
          5.55,
          panelDepth / 2 + 0.09
        ),

        width: 3.45,
        height: 4.75,

        image: artworkPath(number)
      });

    panel.add(artwork);

    panel.position.set(
      x,
      0,
      2.25
    );

    panel.rotation.y =
      rotationY;

    room.add(panel);

    return panel;
  }

  createEntryArtworkPanel({
    id: "room01-entry-panel-left",
    number: 1,
    x: -8.2,
    rotationY: Math.PI / 4.7
  });

  createEntryArtworkPanel({
    id: "room01-entry-panel-right",
    number: 5,
    x: 8.2,
    rotationY: -Math.PI / 4.7
  });

  // ==========================================
  // SIDE WALLS — ARTWORKS 02–08
  // ==========================================

  const sideArtworkZ = [
    -5,
    -15,
    -25.8
  ];

  // Левая стена: 02, 03, 04

  sideArtworkZ.forEach(
    (z, index) => {
      addWallArtwork({
        number: index + 2,

        x: leftWallX + 0.7,
        z,

        rotationY: Math.PI / 2,

        width: 3.55,
        height: 4.75
      });
    }
  );

  // Правая стена: 06, 07, 08

  sideArtworkZ.forEach(
    (z, index) => {
      addWallArtwork({
        number: index + 6,

        x: rightWallX - 0.7,
        z,

        rotationY: -Math.PI / 2,

        width: 3.55,
        height: 4.75
      });
    }
  );

  // ==========================================
  // BACK WALL — ARTWORK 09
  // ==========================================

  addWallArtwork({
    number: 9,

    x: 0,
    z: backWallZ + 0.7,

    width: 4.15,
    height: 5.2
  });

  // ==========================================
  // THREE CENTRAL WALLS — ARTWORKS 10–14
  // ==========================================

  const centralWallX = 0;

  const centralWallPositionsZ = [
    -6.5,
    -15,
    -23.5
  ];

  // Первая центральная стена: 10 и 11

  createGalleryWall({
    id: "room01-central-wall-front",

    x: centralWallX,
    z: centralWallPositionsZ[0],

    rotationY: 0,

    frontArtwork: 10,
    backArtwork: 11,

    width: 8,
    height: 8.8
  });

  // Вторая центральная стена: 12 и 13

  createGalleryWall({
    id: "room01-central-wall-middle",

    x: centralWallX,
    z: centralWallPositionsZ[1],

    rotationY: 0,

    frontArtwork: 12,
    backArtwork: 13,

    width: 8,
    height: 8.8
  });

  // Третья центральная стена: только 14.
  // На обратной стороне нет ни картины, ни рамки.

  createGalleryWall({
    id: "room01-central-wall-back",

    x: centralWallX,
    z: centralWallPositionsZ[2],

    rotationY: 0,

    frontArtwork: 14,
    backArtwork: null,

    width: 8,
    height: 8.8
  });

  // ==========================================
  // LIGHTING
  // ==========================================

  const roomFill =
    new THREE.HemisphereLight(
      0xe8ebf1,
      0x303238,
      0.86
    );

  room.add(roomFill);

  const lightPositions = [
    [0, 9.3, 3],
    [-8, 8.7, -8],
    [8, 8.7, -8],
    [-8, 8.7, -21],
    [8, 8.7, -21],
    [0, 9, -31]
  ];

  lightPositions.forEach(
    (position, index) => {
      const light =
        new THREE.PointLight(
          index % 2 === 0
            ? 0xffffff
            : 0xe8edff,

          1.05,
          24
        );

      light.position.set(
        position[0],
        position[1],
        position[2]
      );

      room.add(light);
    }
  );

  // ==========================================
  // SHADOWS
  // ==========================================

  room.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(room);

  return room;
}