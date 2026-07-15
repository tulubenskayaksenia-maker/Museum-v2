import { THREE } from "../core/scene.js";

export function createSkylight(parent) {
  const skylight = new THREE.Group();
  skylight.name = "Skylight";

  const sky = new THREE.Mesh(
    new THREE.CircleGeometry(18, 128),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    })
  );

  sky.rotation.x = -Math.PI / 2;
  sky.position.set(0, 14, 0);

  skylight.add(sky);
  parent.add(skylight);
}