import { THREE, scene } from "./scene.js";

export function createLights() {
  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);

  const moonLight = new THREE.DirectionalLight(0xdde7ff, 2.8);
  moonLight.position.set(-30, 60, 20);
moonLight.castShadow = false;
  scene.add(moonLight);

  const frontFill = new THREE.PointLight(0xffffff, 2.2, 45);
  frontFill.position.set(0, 4, 12);
  scene.add(frontFill);
}
