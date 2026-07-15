import { THREE } from "../core/scene.js";

export function createLightSpot(parent) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");

  const gradient = ctx.createRadialGradient(
    256, 256, 0,
    256, 256, 256
  );

  gradient.addColorStop(0.0, "rgba(255,255,255,0.22)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.10)");
  gradient.addColorStop(0.72, "rgba(255,255,255,0.025)");
  gradient.addColorStop(1.0, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);

  const spot = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 11),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    })
  );

  spot.rotation.x = -Math.PI / 2;
  spot.position.set(0, 0.035, -2);

  parent.add(spot);
}