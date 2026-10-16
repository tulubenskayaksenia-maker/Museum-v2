import {
  THREE
} from "../core/scene.js";

import {
  createSignTexture,
  createSignFaceMaterial
} from "./signText.js";

import {
  ARCHES
} from "../config/layout.js";

// =====================================================
// MATERIALS
// =====================================================

const panelMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x060607,
    roughness: 0.72,
    metalness: 0.14
  });

const edgeMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x1c1e22,
    roughness: 0.58,
    metalness: 0.45
  });

const bracketMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x35383f,
    roughness: 0.46,
    metalness: 0.72
  });

// =====================================================
// MAIN
// =====================================================

export function createFacilitySign(parent) {
  const root =
    new THREE.Group();

  root.name =
    "Wardrobe WC Blade Sign";

  /*
    Левая боковая стена находится
    примерно на x = -9.

    Табличку выдвигаем внутрь холла,
    чтобы она была хорошо видна спереди.
  */

  const wallX =
    -ARCHES.sideX - 0.55;

  const signCenterX =
    wallX + 2.1;

  root.position.set(
    signCenterX,
    7.85,
    ARCHES.sideZ
  );

  /*
    Плоскость текста смотрит вдоль оси Z.

    Поэтому посетитель видит надпись,
    когда идёт по главному холлу.
  */

  root.rotation.set(
    0,
    0,
    0
  );

  createSignPanel(root);
  createWallBracket(root);
  createSignGlow(root);

  parent.add(root);

  return root;
}

// =====================================================
// PANEL
// =====================================================

function createSignPanel(parent) {
  const width = 4.6;
  const height = 0.82;
  const depth = 0.12;

  const panel =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        depth
      ),
      panelMaterial
    );

  panel.name =
    "Wardrobe WC Sign Panel";

  panel.receiveShadow = true;

  parent.add(panel);

  // Верхняя металлическая грань
  const topEdge =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width + 0.06,
        0.045,
        depth + 0.045
      ),
      edgeMaterial
    );

  topEdge.position.y =
    height / 2 + 0.022;

  parent.add(topEdge);

  // Нижняя металлическая грань
  const bottomEdge =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width + 0.06,
        0.045,
        depth + 0.045
      ),
      edgeMaterial
    );

  bottomEdge.position.y =
    -height / 2 - 0.022;

  parent.add(bottomEdge);

  const texture =
    createTextTexture(
      "WARDROBE  ·  WC"
    );

  // Текст со стороны входа
  const frontText =
    createTextPlane({
      texture,
      width: width - 0.18,
      height: height - 0.14
    });

  frontText.position.z =
    depth / 2 + 0.008;

  parent.add(frontText);

  // Текст с обратной стороны
  const backText =
    createTextPlane({
      texture,
      width: width - 0.18,
      height: height - 0.14
    });

  backText.position.z =
    -depth / 2 - 0.008;

  backText.rotation.y =
    Math.PI;

  parent.add(backText);
}

// =====================================================
// WALL BRACKET
// =====================================================

function createWallBracket(parent) {
  /*
    Табличка находится справа от левой стены.

    Поэтому крепёж идёт от таблички
    обратно влево, к стене.
  */

  const panelHalfWidth = 4.6 / 2;
  const bracketLength = 1.55;

  const horizontalBracket =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.035,
        0.035,
        bracketLength,
        12
      ),
      bracketMaterial
    );

  horizontalBracket.rotation.z =
    Math.PI / 2;

  horizontalBracket.position.set(
    -panelHalfWidth -
      bracketLength / 2,
    0,
    0
  );

  parent.add(horizontalBracket);

  // Пластина на стене
  const wallPlate =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.12,
        0.55,
        0.46
      ),
      bracketMaterial
    );

  wallPlate.position.set(
    -panelHalfWidth -
      bracketLength,
    0,
    0
  );

  parent.add(wallPlate);

  // Верхняя диагональная поддержка
  const upperSupport =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.025,
        0.025,
        0.9,
        10
      ),
      bracketMaterial
    );

  upperSupport.position.set(
    -panelHalfWidth -
      bracketLength * 0.72,
    0.38,
    0
  );

  upperSupport.rotation.z =
    -Math.PI / 4;

  parent.add(upperSupport);
}

// =====================================================
// GLOW
// =====================================================

function createSignGlow(parent) {
  const frontGlow =
    new THREE.PointLight(
      0xdce6f5,
      0.22,
      4.8,
      2
    );

  frontGlow.position.set(
    0,
    0,
    0.8
  );

  parent.add(frontGlow);

  const backGlow =
    new THREE.PointLight(
      0xdce6f5,
      0.14,
      3.8,
      2
    );

  backGlow.position.set(
    0,
    0,
    -0.8
  );

  parent.add(backGlow);
}

// =====================================================
// TEXT PLANE
// =====================================================

function createTextPlane({
  texture,
  width,
  height
}) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(
      width,
      height
    ),
    createSignFaceMaterial(texture)
  );
}

// =====================================================
// TEXTURE
// =====================================================

function createTextTexture(text) {
  return createSignTexture(text, 1500, 240);
}
