import { THREE } from "../core/scene.js";
import { ceilingMaterial } from "../core/materials.js";

export function createCeiling(parent) {
  const ceiling = new THREE.Group();
  ceiling.name = "High Ceiling Rect Opening";

  const y = 14;
  const thickness = 0.55;

  const left = new THREE.Mesh(
    new THREE.BoxGeometry(8, thickness, 40),
    ceilingMaterial
  );
  left.position.set(-8, y, -5);
  ceiling.add(left);

  const right = new THREE.Mesh(
    new THREE.BoxGeometry(8, thickness, 40),
    ceilingMaterial
  );
  right.position.set(8, y, -5);
  ceiling.add(right);

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(24, thickness, 14),
    ceilingMaterial
  );
  back.position.set(0, y, -19);
  ceiling.add(back);

  const front = new THREE.Mesh(
    new THREE.BoxGeometry(24, thickness, 12),
    ceilingMaterial
  );
  front.position.set(0, y, 8);
  ceiling.add(front);

  ceiling.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  parent.add(ceiling);
}