import {
  THREE
} from "../core/scene.js";

import {
  createSignTexture,
  createSignFaceMaterial
} from "./signText.js";

export function createSculptureSign(parent) {
  const root =
    new THREE.Group();

  root.name =
    "Sculpture Corridor Sign";

  /*
    Вторая дверь слева.
    Z должен совпадать с комнатой room03.
  */

  root.position.set(
    -5.72,
    0,
    -31
  );

  root.rotation.y =
    Math.PI / 2;

  const panelMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x050506,
      roughness: 0.7,
      metalness: 0.18
    });

  const cableMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x33363c,
      roughness: 0.45,
      metalness: 0.65
    });

  const width = 5.3;
  const height = 0.78;

  const sign =
    new THREE.Group();

  const panel =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        0.1
      ),
      panelMaterial
    );

  sign.add(panel);

  const texture =
    createTextTexture(
      "SCULPTURE"
    );

  const text =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        width - 0.16,
        height - 0.14
      ),
      createSignFaceMaterial(texture)
    );

  text.position.z = 0.056;

  sign.add(text);

  sign.position.set(
    0,
    8.1,
    0.45
  );

  root.add(sign);

  createCable({
    parent: root,
    material: cableMaterial,
    x: -1.75
  });

  createCable({
    parent: root,
    material: cableMaterial,
    x: 1.75
  });

  const glow =
    new THREE.PointLight(
      0xdde5f2,
      0.3,
      5,
      2
    );

  glow.position.set(
    0,
    7.9,
    1
  );

  root.add(glow);

  parent.add(root);

  return root;
}

function createCable({
  parent,
  material,
  x
}) {
  const cable =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.012,
        0.012,
        0.8,
        8
      ),
      material
    );

  cable.position.set(
    x,
    8.88,
    0.45
  );

  parent.add(cable);
}

function createTextTexture(text) {
  return createSignTexture(text, 1200, 200);
}
