import {
  THREE,
  scene
} from "../core/scene.js";

import {
  floorMaterial,
  wallMaterial
} from "../core/materials.js";

import {
  createHangingArtwork,
  createFloorArtwork
} from "../objects/artwork.js";

export function createCorridorRightRoom01() {
  const room =
    new THREE.Group();

  room.name =
    "Corridor Right Room 01";

  room.visible = false;

  // ===================================================
  // ROOM SIZE
  // ===================================================

  const roomWidth = 36;
  const roomDepth = 44;
  const roomHeight = 11;

  const centerZ = -11;
  const backWallZ = -33;

  // ===================================================
  // FLOOR
  // ===================================================

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

  // ===================================================
  // WALLS
  // ===================================================

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

  // ===================================================
  // CEILING RAILS
  // ===================================================

  const railMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x2c2d30,
      roughness: 0.7,
      metalness: 0.55
    });

  /*
    Две рейки вместо одной:
    так подвесные работы распределяются
    по всей глубине комнаты логичнее.
  */

  createRail({
    parent: room,
    material: railMaterial,
    x: 0,
    y: 10.3,
    z: -9,
    length: 29
  });

  createRail({
    parent: room,
    material: railMaterial,
    x: 0,
    y: 10.3,
    z: -23,
    length: 29
  });

  // ===================================================
  // HANGING ARTWORKS — 6
  //
  // Два ряда по три работы.
  // Центральные немного крупнее.
  // ===================================================

  const hangingWorks = [
    {
      id: "room02-hanging-01",
      x: -9,
      y: 5,
      z: -8,
      width: 2.2,
      height: 3.1
    },

    {
      id: "room02-hanging-main",
      x: 0,
      y: 5.6,
      z: -8,
      width: 4.2,
      height: 5.4
    },

    {
      id: "room02-hanging-03",
      x: 9,
      y: 5,
      z: -8,
      width: 2.2,
      height: 3.1
    },

    {
      id: "room02-hanging-04",
      x: -9,
      y: 4.9,
      z: -22,
      width: 2.7,
      height: 3.6
    },

    {
      id: "room02-hanging-05",
      x: 0,
      y: 5.2,
      z: -22,
      width: 4.8,
      height: 2.6
    },

    {
      id: "room02-hanging-06",
      x: 9,
      y: 4.9,
      z: -22,
      width: 2.7,
      height: 3.6
    }
  ];

  hangingWorks.forEach(
    (work) => {
      room.add(
        createHangingArtwork({
          id: work.id,

          position:
            new THREE.Vector3(
              work.x,
              work.y,
              work.z
            ),

          width: work.width,
          height: work.height,
          ceilingY: 10.3
        })
      );
    }
  );

  // ===================================================
  // FLOOR ARTWORKS — 4
  //
  // Распределены между подвесными рядами
  // и ближе к дальней части комнаты.
  // Центральный проход свободен.
  // ===================================================

  const floorWorks = [
    {
      id: "room02-floor-01",
      x: -8.5,
      z: -14,
      width: 3,
      depth: 2
    },

    {
      id: "room02-floor-02",
      x: 8.5,
      z: -14,
      width: 3,
      depth: 2
    },

    {
      id: "room02-floor-03",
      x: -7,
      z: -28,
      width: 3.4,
      depth: 2.3
    },

    {
      id: "room02-floor-04",
      x: 7,
      z: -28,
      width: 3.4,
      depth: 2.3
    }
  ];

  floorWorks.forEach(
    (work) => {
      room.add(
        createFloorArtwork({
          id: work.id,

          position:
            new THREE.Vector3(
              work.x,
              0,
              work.z
            ),

          width: work.width,
          depth: work.depth
        })
      );
    }
  );

  // ===================================================
  // BACK WALL ARTWORK
  //
  // Небольшой акцент в глубине,
  // чтобы комната не обрывалась пустой стеной.
  // ===================================================

  room.add(
    createHangingArtwork({
      id: "room02-back-artwork",

      position:
        new THREE.Vector3(
          0,
          5.2,
          backWallZ + 0.75
        ),

      width: 5.5,
      height: 3.5,
      ceilingY: 10.3
    })
  );

  // ===================================================
  // LIGHTING
  // ===================================================

  const roomAmbient =
    new THREE.HemisphereLight(
      0xe2e4e9,
      0x383a40,
      0.72
    );

  room.add(roomAmbient);

  const frontLight =
    new THREE.PointLight(
      0xe9edf4,
      1.15,
      38,
      2
    );

  frontLight.position.set(
    0,
    8,
    4
  );

  room.add(frontLight);

  const middleLight =
    new THREE.SpotLight(
      0xfff1d4,
      3.2,
      34,
      Math.PI / 4,
      0.76,
      1.1
    );

  middleLight.position.set(
    0,
    10,
    -2
  );

  middleLight.target.position.set(
    0,
    4,
    -16
  );

  room.add(middleLight);
  room.add(middleLight.target);

  const backLight =
    new THREE.PointLight(
      0xdde5ff,
      0.85,
      30,
      2
    );

  backLight.position.set(
    0,
    6,
    -28
  );

  room.add(backLight);

  room.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.receiveShadow = true;
  });

  scene.add(room);

  return room;
}

// ===================================================
// RAIL CREATOR
// ===================================================

function createRail({
  parent,
  material,
  x,
  y,
  z,
  length
}) {
  const rail =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.06,
        0.06,
        length,
        12
      ),
      material
    );

  rail.rotation.z =
    Math.PI / 2;

  rail.position.set(
    x,
    y,
    z
  );

  parent.add(rail);
}