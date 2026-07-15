import { THREE } from "../core/scene.js";

import {
  archMaterial,
  darkMaterial
} from "../core/materials.js";

import {
  ARCHES
} from "../config/layout.js";

// =====================================================
// БОКОВЫЕ АРКИ В ГЛАВНОМ ХОЛЛЕ
// =====================================================

export function createSideArches(parent) {
  // Левая боковая арка:
  // ведёт в гардероб и WC
  const leftArch = createArchPortal({
    target: "leftRoom",
    showDarkOpening: true
  });

  leftArch.name =
    "Facilities Hall Arch";

  leftArch.position.set(
    -ARCHES.sideX,
    ARCHES.sideY,
    ARCHES.sideZ
  );

  leftArch.rotation.y =
    Math.PI / 2;

  parent.add(leftArch);

  // Правую боковую арку не создаём.
  // На её месте стоит билетная касса.
}

// =====================================================
// УНИВЕРСАЛЬНАЯ АРКА
//
// Используется:
// - левой аркой в холле;
// - верхней аркой над лестницей;
// - всеми арками в коридоре.
// =====================================================

export function createArchPortal({
  width = 5.2,
  height = 7.4,
  depth = 1.3,

  openingWidth = 3.6,
  openingHeight = 6.2,

  target = "",
  showDarkOpening = true
} = {}) {
  const arch =
    new THREE.Group();

  arch.name =
    "Arch Portal";

  // Только арка с target становится дверью
  if (target) {
    arch.userData.type =
      "door";

    arch.userData.target =
      target;
  }

  const sideThickness =
    (width - openingWidth) / 2;

  const radius =
    openingWidth / 2;

  const straightHeight =
    openingHeight - radius;

  // ===================================================
  // ЧЁРНЫЙ ПРОЁМ
  // ===================================================

  if (showDarkOpening) {
    const opening =
      createFilledArchShape(
        openingWidth,
        openingHeight,
        darkMaterial
      );

    opening.name =
      "Dark Arch Opening";

    /*
      Ставим чёрную плоскость чуть впереди,
      чтобы серая задняя стена её не перекрывала.
    */

    opening.position.set(
      0,
      0,
      depth / 2 + 0.012
    );

    opening.renderOrder = 2;

    arch.add(opening);
  }

  // ===================================================
  // ЛЕВАЯ ВЕРТИКАЛЬНАЯ ЧАСТЬ
  // ===================================================

  const leftColumn =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        sideThickness,
        straightHeight,
        depth
      ),
      archMaterial
    );

  leftColumn.name =
    "Left Arch Column";

  leftColumn.position.set(
    -openingWidth / 2 -
      sideThickness / 2,

    straightHeight / 2,
    0
  );

  arch.add(leftColumn);

  // ===================================================
  // ПРАВАЯ ВЕРТИКАЛЬНАЯ ЧАСТЬ
  // ===================================================

  const rightColumn =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        sideThickness,
        straightHeight,
        depth
      ),
      archMaterial
    );

  rightColumn.name =
    "Right Arch Column";

  rightColumn.position.set(
    openingWidth / 2 +
      sideThickness / 2,

    straightHeight / 2,
    0
  );

  arch.add(rightColumn);

  // ===================================================
  // ПОЛУКРУГЛЫЙ ВЕРХ
  // ===================================================

  const blockCount = 32;

  const archRadius =
    radius + sideThickness / 2;

  for (
    let i = 0;
    i <= blockCount;
    i++
  ) {
    const progress =
      i / blockCount;

    const angle =
      Math.PI -
      progress * Math.PI;

    const block =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          sideThickness * 0.96,
          sideThickness * 0.96,
          depth
        ),
        archMaterial
      );

    block.name =
      `Arch Block ${i}`;

    block.position.set(
      Math.cos(angle) *
        archRadius,

      straightHeight +
        Math.sin(angle) *
          archRadius,

      0
    );

    block.rotation.z =
      angle -
      Math.PI / 2;

    arch.add(block);
  }

  // ===================================================
  // ТЕНИ
  // ===================================================

  arch.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;
  });

  return arch;
}

// =====================================================
// ЗАПОЛНЕННАЯ АРОЧНАЯ ФОРМА
// =====================================================

function createFilledArchShape(
  width,
  height,
  material
) {
  const radius =
    width / 2;

  const straightHeight =
    height - radius;

  const shape =
    new THREE.Shape();

  shape.moveTo(
    -width / 2,
    0
  );

  shape.lineTo(
    -width / 2,
    straightHeight
  );

  // Верхний полукруг
  shape.absarc(
    0,
    straightHeight,
    radius,
    Math.PI,
    0,
    true
  );

  shape.lineTo(
    width / 2,
    0
  );

  shape.closePath();

  const geometry =
    new THREE.ShapeGeometry(
      shape
    );

  const mesh =
    new THREE.Mesh(
      geometry,
      material
    );

  return mesh;
}