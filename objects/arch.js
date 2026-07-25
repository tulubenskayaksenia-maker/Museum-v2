import { THREE } from "../core/scene.js";

import {
  archMaterial,
  darkMaterial
} from "../core/materials.js";

import {
  ARCHES
} from "../config/layout.js";

// =====================================================
// БОКОВАЯ АРКА В ХОЛЛЕ
// =====================================================

export function createSideArches(parent) {
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
}

// =====================================================
// ЕДИНАЯ ТОНКАЯ АРКА ДЛЯ ВСЕГО МУЗЕЯ
//
// Форма:
// - тонкая;
// - с округлёнными рёбрами;
// - слегка стрельчатая;
// - вершина заострённая, но не острая;
// - одинаковая для холла и галереи.
// =====================================================

export function createArchPortal({
  width = 4.75,
  height = 7.45,
  depth = 0.72,

  openingWidth = 4.02,
  openingHeight = 6.88,

  target = "",
  showDarkOpening = true
} = {}) {
  const portal =
    new THREE.Group();

  portal.name =
    "Soft Pointed Arch Portal";

  if (target) {
    markAsDoor(
      portal,
      target
    );
  }

  const outerShoulderY =
    height * 0.53;

  const innerShoulderY =
    openingHeight * 0.54;

  const outerTipRoundness =
    0.18;

  const innerTipRoundness =
    0.15;

  // ===================================================
  // ОСНОВНАЯ ГЛАДКАЯ АРКА
  // ===================================================

  const frameGeometry =
    createArchFrameGeometry({
      width,
      height,
      depth,

      openingWidth,
      openingHeight,

      outerShoulderY,
      innerShoulderY,

      outerTipRoundness,
      innerTipRoundness
    });

  const frame =
    new THREE.Mesh(
      frameGeometry,
      archMaterial
    );

  frame.name =
    "Rounded Thin Arch Frame";

  frame.castShadow = true;
  frame.receiveShadow = true;

  if (target) {
    markAsDoor(
      frame,
      target
    );
  }

  portal.add(frame);

  // ===================================================
  // ТЁМНЫЙ ПРОЁМ
  // ===================================================

  if (showDarkOpening) {
    const opening =
      createFilledArchMesh({
        width:
          openingWidth,

        height:
          openingHeight,

        shoulderY:
          innerShoulderY,

        tipRoundness:
          innerTipRoundness,

        material:
          darkMaterial
      });

    opening.name =
      "Dark Arch Opening";

    opening.position.z =
      depth / 2 + 0.012;

    opening.renderOrder = 2;

    if (target) {
      markAsDoor(
        opening,
        target
      );
    }

    portal.add(opening);
  }

  // ===================================================
  // НЕВИДИМАЯ ЗОНА КЛИКА
  // ===================================================

  if (target) {
    const hitbox =
      createFilledArchMesh({
        width:
          openingWidth + 0.34,

        height:
          openingHeight + 0.18,

        shoulderY:
          innerShoulderY + 0.05,

        tipRoundness:
          innerTipRoundness,

        material:
          new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false,
            side: THREE.DoubleSide
          })
      });

    hitbox.name =
      "Arch Door Hitbox";

    hitbox.position.z =
      depth / 2 + 0.045;

    hitbox.renderOrder = 10;

    markAsDoor(
      hitbox,
      target
    );

    portal.add(hitbox);
  }

  return portal;
}


// =====================================================
// ЦЕЛЬНАЯ СТЕНА С НАСТОЯЩИМ АРОЧНЫМ ПРОЁМОМ
//
// В отличие от стены из трёх прямоугольников,
// здесь отверстие вырезано непосредственно в геометрии.
// Поэтому верх проёма повторяет форму арки и не выглядит
// как квадратная дыра за декоративной рамой.
// =====================================================

export function createWallWithArchOpening({
  wallWidth,
  wallHeight,
  wallDepth = 0.8,
  openingWidth,
  openingHeight,
  material,
  target = ""
}) {
  const wallShape =
    new THREE.Shape();

  wallShape.moveTo(
    -wallWidth / 2,
    0
  );

  wallShape.lineTo(
    wallWidth / 2,
    0
  );

  wallShape.lineTo(
    wallWidth / 2,
    wallHeight
  );

  wallShape.lineTo(
    -wallWidth / 2,
    wallHeight
  );

  wallShape.closePath();

  const shoulderY =
    openingHeight * 0.58;

  const halfOpening =
    openingWidth / 2;

  // Hole path is intentionally clockwise.
  const openingHole =
    new THREE.Path();

  openingHole.moveTo(
    -halfOpening,
    0
  );

  openingHole.lineTo(
    -halfOpening,
    shoulderY
  );

  openingHole.bezierCurveTo(
    -halfOpening,
    openingHeight * 0.78,
    -openingWidth * 0.22,
    openingHeight * 0.96,
    0,
    openingHeight
  );

  openingHole.bezierCurveTo(
    openingWidth * 0.22,
    openingHeight * 0.96,
    halfOpening,
    openingHeight * 0.78,
    halfOpening,
    shoulderY
  );

  openingHole.lineTo(
    halfOpening,
    0
  );

  openingHole.closePath();

  wallShape.holes.push(
    openingHole
  );

  const geometry =
    new THREE.ExtrudeGeometry(
      wallShape,
      {
        depth: wallDepth,
        bevelEnabled: false,
        curveSegments: 32
      }
    );

  geometry.translate(
    0,
    0,
    -wallDepth / 2
  );

  geometry.computeVertexNormals();

  const wall =
    new THREE.Mesh(
      geometry,
      material
    );

  wall.name =
    "Wall With True Arch Opening";

  wall.castShadow = true;
  wall.receiveShadow = true;

  if (target) {
    markAsDoor(
      wall,
      target
    );
  }

  return wall;
}

// =====================================================
// ОБЪЁМНАЯ РАМКА С ОТВЕРСТИЕМ
// =====================================================

function createArchFrameGeometry({
  width,
  height,
  depth,

  openingWidth,
  openingHeight,

  outerShoulderY,
  innerShoulderY,

  outerTipRoundness,
  innerTipRoundness
}) {
  const outerShape =
    createArchShape({
      width,
      height,
      shoulderY:
        outerShoulderY,
      tipRoundness:
        outerTipRoundness
    });

  const innerHole =
    createArchHole({
      width:
        openingWidth,
      height:
        openingHeight,
      shoulderY:
        innerShoulderY,
      tipRoundness:
        innerTipRoundness
    });

  outerShape.holes.push(
    innerHole
  );

  const geometry =
    new THREE.ExtrudeGeometry(
      outerShape,
      {
        depth,
        steps: 1,

        // Более заметное скругление краёв.
        bevelEnabled: true,
        bevelThickness: 0.075,
        bevelSize: 0.075,
        bevelOffset: -0.012,
        bevelSegments: 8,

        curveSegments: 64
      }
    );

  geometry.translate(
    0,
    0,
    -depth / 2
  );

  geometry.computeVertexNormals();

  return geometry;
}

// =====================================================
// ВНЕШНИЙ СИЛУЭТ
// =====================================================

function createArchShape({
  width,
  height,
  shoulderY,
  tipRoundness
}) {
  const halfWidth =
    width / 2;

  const shape =
    new THREE.Shape();

  shape.moveTo(
    -halfWidth,
    0
  );

  shape.lineTo(
    -halfWidth,
    shoulderY
  );

  addSoftPointedTop({
    path: shape,
    halfWidth,
    height,
    shoulderY,
    tipRoundness,
    reverse: false
  });

  shape.lineTo(
    halfWidth,
    0
  );

  shape.lineTo(
    -halfWidth,
    0
  );

  shape.closePath();

  return shape;
}

// =====================================================
// ВНУТРЕННЕЕ ОТВЕРСТИЕ
// =====================================================

function createArchHole({
  width,
  height,
  shoulderY,
  tipRoundness
}) {
  const halfWidth =
    width / 2;

  const hole =
    new THREE.Path();

  hole.moveTo(
    -halfWidth,
    0
  );

  hole.lineTo(
    halfWidth,
    0
  );

  hole.lineTo(
    halfWidth,
    shoulderY
  );

  addSoftPointedTop({
    path: hole,
    halfWidth,
    height,
    shoulderY,
    tipRoundness,
    reverse: true
  });

  hole.lineTo(
    -halfWidth,
    0
  );

  hole.closePath();

  return hole;
}

// =====================================================
// МЯГКАЯ СТРЕЛЬЧАТАЯ ВЕРШИНА
//
// Вместо одного острого угла используется маленькая
// округлая вершина. Поэтому форма выглядит изящно,
// но не превращается в жёсткую готическую стрелу.
// =====================================================

function addSoftPointedTop({
  path,
  halfWidth,
  height,
  shoulderY,
  tipRoundness,
  reverse
}) {
  const tipX =
    tipRoundness;

  const tipY =
    height - 0.045;

  const controlHeight =
    shoulderY +
    (height - shoulderY) * 0.58;

  if (!reverse) {
    path.bezierCurveTo(
      -halfWidth,
      controlHeight,

      -halfWidth * 0.47,
      height - 0.34,

      -tipX,
      tipY
    );

    path.quadraticCurveTo(
      0,
      height + 0.055,

      tipX,
      tipY
    );

    path.bezierCurveTo(
      halfWidth * 0.47,
      height - 0.34,

      halfWidth,
      controlHeight,

      halfWidth,
      shoulderY
    );

    return;
  }

  path.bezierCurveTo(
    halfWidth,
    controlHeight,

    halfWidth * 0.47,
    height - 0.34,

    tipX,
    tipY
  );

  path.quadraticCurveTo(
    0,
    height + 0.055,

    -tipX,
    tipY
  );

  path.bezierCurveTo(
    -halfWidth * 0.47,
    height - 0.34,

    -halfWidth,
    controlHeight,

    -halfWidth,
    shoulderY
  );
}

// =====================================================
// ЗАПОЛНЕННАЯ АРОЧНАЯ ПЛОСКОСТЬ
// =====================================================

function createFilledArchMesh({
  width,
  height,
  shoulderY,
  tipRoundness,
  material
}) {
  const shape =
    createArchShape({
      width,
      height,
      shoulderY,
      tipRoundness
    });

  const geometry =
    new THREE.ShapeGeometry(
      shape,
      64
    );

  return new THREE.Mesh(
    geometry,
    material
  );
}

// =====================================================
// НАВИГАЦИЯ
// =====================================================

function markAsDoor(
  object,
  target
) {
  object.userData.type =
    "door";

  object.userData.target =
    target;
}