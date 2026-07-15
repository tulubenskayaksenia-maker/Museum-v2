import { THREE, scene } from "../core/scene.js";
import {
  floorMaterial,
  wallMaterial
} from "../core/materials.js";
import {
  createArchPortal
} from "../objects/arch.js";

export function createCorridor() {
  const corridor = new THREE.Group();

  corridor.name = "Infinite Corridor";
  corridor.visible = false;

  // ==========================================
  // FLOOR
  // ==========================================

  const floor = new THREE.Mesh(
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

  // ==========================================
  // LEFT WALL
  // ==========================================

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(
      1.2,
      12,
      180
    ),
    wallMaterial
  );

  leftWall.position.set(
    -8,
    6,
    -75
  );

  corridor.add(leftWall);

  // ==========================================
  // RIGHT WALL
  // ==========================================

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(
      1.2,
      12,
      180
    ),
    wallMaterial
  );

  rightWall.position.set(
    8,
    6,
    -75
  );

  corridor.add(rightWall);

  // ==========================================
  // ACTIVE DOORS
  // ==========================================

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

  // ==========================================
  // CREATE DOORS
  // ==========================================

  doors.forEach((door) => {
    const portal = createArchPortal({
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

  // ==========================================
  // SHADOWS
  // ==========================================

  corridor.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(corridor);

  return corridor;
}