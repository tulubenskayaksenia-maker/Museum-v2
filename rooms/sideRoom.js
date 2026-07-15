import { THREE, scene } from "../core/scene.js";
import { floorMaterial, wallMaterial } from "../core/materials.js";

export function createSideRoom(name = "Side Room") {
  const room = new THREE.Group();
  room.name = name;
  room.visible = false;

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(34, 0.14, 38),
    floorMaterial
  );
  floor.position.set(0, -0.07, -10);
  floor.receiveShadow = true;
  room.add(floor);

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 12, 38),
    wallMaterial
  );
  leftWall.position.set(-17, 6, -10);
  room.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 12, 38),
    wallMaterial
  );
  rightWall.position.set(17, 6, -10);
  room.add(rightWall);

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(34, 12, 1.2),
    wallMaterial
  );
  backWall.position.set(0, 6, -29);
  room.add(backWall);

  room.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(room);
  return room;
}