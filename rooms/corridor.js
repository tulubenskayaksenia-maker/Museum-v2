import {
  THREE,
  scene
} from "../core/scene.js";

import {
  floorMaterial,
  wallMaterial
} from "../core/materials.js";

import {
  createArchPortal
} from "../objects/arch.js";

import {
  LEVELS,
  ROOM
} from "../config/layout.js";

import {
  getLandingLevel
} from "../objects/stairs.js";

// =====================================================
// CONTINUOUS CORRIDOR
// =====================================================

export function createCorridor() {
  const corridor =
    new THREE.Group();

  corridor.name =
    "Infinite Corridor";

  /*
    Коридор находится в общей сцене постоянно,
    но его передний край начинается только
    ЗА задней стеной холла.

    Поэтому боковые стены больше не торчат
    внутрь входного пространства.
  */

  corridor.visible = true;

  corridor.position.set(
    0,
    getLandingLevel(),
    ROOM.backWallZ - 15.8
  );

  const corridorWallHeight =
    LEVELS.wallHeight -
    getLandingLevel();

  // ===================================================
  // FLOOR
  // ===================================================

  const floor =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        16,
        0.14,
        180
      ),
      floorMaterial
    );

  floor.position.set(
    0,
    -0.07,
    -75
  );

  corridor.add(floor);

  // ===================================================
  // LEFT WALL
  // ===================================================

  const leftWall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.2,
        corridorWallHeight,
        180
      ),
      wallMaterial
    );

  leftWall.position.set(
    -8,
    corridorWallHeight / 2,
    -75
  );

  corridor.add(leftWall);

  // ===================================================
  // RIGHT WALL
  // ===================================================

  const rightWall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.2,
        corridorWallHeight,
        180
      ),
      wallMaterial
    );

  rightWall.position.set(
    8,
    corridorWallHeight / 2,
    -75
  );

  corridor.add(rightWall);

  // ===================================================
  // ACTIVE DOORS
  // ===================================================

  const doors = [
    {
      side: "left",
      z: -16,
      target: "room01"
    },
    {
      side: "right",
      z: -16,
      target: "room02"
    },
    {
      side: "left",
      z: -34,
      target: "room03"
    },
    {
      side: "right",
      z: -34,
      target: "room04"
    }
  ];

  doors.forEach((door) => {
    const portal =
      createArchPortal({
        target: door.target
      });

    if (door.side === "left") {
      portal.position.set(
        -7.35,
        0,
        door.z
      );

      portal.rotation.y =
        Math.PI / 2;
    } else {
      portal.position.set(
        7.35,
        0,
        door.z
      );

      portal.rotation.y =
        -Math.PI / 2;
    }

    corridor.add(portal);
  });

  // ===================================================
  // SHADOWS
  // ===================================================

  corridor.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(corridor);

  return corridor;
}