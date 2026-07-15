import { THREE, scene } from "../core/scene.js";

export function createSky() {
  const group = new THREE.Group();
  group.name = "Night Sky";

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(500, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0x02030a,
      side: THREE.BackSide
    })
  );

  group.add(dome);

  const moon = new THREE.Mesh(
    new THREE.CircleGeometry(18, 64),
    new THREE.MeshBasicMaterial({
      color: 0xf5f3e8,
      side: THREE.DoubleSide
    })
  );

  moon.position.set(-70, 130, -180);
  moon.lookAt(0, 0, 0);
  group.add(moon);

  const starGeometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < 3000; i++) {
    const r = 420;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.45;

    positions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }

  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      transparent: true,
      opacity: 0.9
    })
  );

  group.add(stars);
  scene.add(group);
}