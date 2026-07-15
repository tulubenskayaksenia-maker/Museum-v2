import { THREE } from "../core/scene.js";
import { floorMaterial } from "../core/materials.js";

export function createFloor(parent) {
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(24, 0.12, 40),
    floorMaterial
  );

  floor.position.set(0, -0.06, -5);

  floor.castShadow = false;
  floor.receiveShadow = true;

  parent.add(floor);
}