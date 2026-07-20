import {
  THREE
} from "../core/scene.js";

import {
  wallMaterial
} from "../core/materials.js";

import {
  LEVELS,
  ROOM
} from "../config/layout.js";

import {
  getLandingLevel
} from "./stairs.js";

// =====================================================
// ENTRANCE WALLS
// =====================================================

export function createWalls(parent) {
  const walls =
    new THREE.Group();

  walls.name =
    "Entrance Walls";

  const wallHeight =
    LEVELS.wallHeight;

  const sideWallThickness =
    4.4;

  // ===================================================
  // SIDE WALLS
  // ===================================================

  const leftWall =
    createWallBlock(
      sideWallThickness,
      wallHeight,
      ROOM.depth
    );

  leftWall.position.set(
    -ROOM.width / 2 -
      sideWallThickness / 2,
    wallHeight / 2,
    ROOM.centerZ
  );

  walls.add(leftWall);

  const rightWall =
    createWallBlock(
      sideWallThickness,
      wallHeight,
      ROOM.depth
    );

  rightWall.position.set(
    ROOM.width / 2 +
      sideWallThickness / 2,
    wallHeight / 2,
    ROOM.centerZ
  );

  walls.add(rightWall);

  // ===================================================
  // BACK WALL WITH AN ARCH-SHAPED OPENING
  // ===================================================

  /*
    Это одна цельная задняя стена с настоящим
    отверстием точно по форме внутренней арки.

    Здесь больше нет квадратного проёма,
    собранного из четырёх прямоугольных блоков.
  */

  const backWall =
    createBackWallWithArchOpening({
      width:
        ROOM.width,

      height:
        wallHeight,

      depth:
        1.2,

      openingWidth:
        3.66,

      openingHeight:
        6.26,

      openingBottom:
        getLandingLevel()
    });

  backWall.position.z =
    ROOM.backWallZ;

  walls.add(backWall);

  parent.add(walls);
}

// =====================================================
// ARCH-SHAPED BACK WALL
// =====================================================

function createBackWallWithArchOpening({
  width,
  height,
  depth,

  openingWidth,
  openingHeight,
  openingBottom
}) {
  const halfWidth =
    width / 2;

  const wallShape =
    new THREE.Shape();

  wallShape.moveTo(
    -halfWidth,
    0
  );

  wallShape.lineTo(
    halfWidth,
    0
  );

  wallShape.lineTo(
    halfWidth,
    height
  );

  wallShape.lineTo(
    -halfWidth,
    height
  );

  wallShape.closePath();

  const openingShoulderY =
    openingBottom +
    openingHeight * 0.54;

  const openingTopY =
    openingBottom +
    openingHeight;

  const openingHalfWidth =
    openingWidth / 2;

  const tipRoundness =
    0.15;

  const tipX =
    tipRoundness;

  const tipY =
    openingTopY - 0.045;

  const controlHeight =
    openingShoulderY +
    (
      openingTopY -
      openingShoulderY
    ) * 0.58;

  /*
    Направление отверстия противоположно
    направлению внешнего прямоугольника.
  */

  const hole =
    new THREE.Path();

  hole.moveTo(
    -openingHalfWidth,
    openingBottom
  );

  hole.lineTo(
    openingHalfWidth,
    openingBottom
  );

  hole.lineTo(
    openingHalfWidth,
    openingShoulderY
  );

  hole.bezierCurveTo(
    openingHalfWidth,
    controlHeight,

    openingHalfWidth * 0.47,
    openingTopY - 0.34,

    tipX,
    tipY
  );

  hole.quadraticCurveTo(
    0,
    openingTopY + 0.055,

    -tipX,
    tipY
  );

  hole.bezierCurveTo(
    -openingHalfWidth * 0.47,
    openingTopY - 0.34,

    -openingHalfWidth,
    controlHeight,

    -openingHalfWidth,
    openingShoulderY
  );

  hole.lineTo(
    -openingHalfWidth,
    openingBottom
  );

  hole.closePath();

  wallShape.holes.push(hole);

  const geometry =
    new THREE.ExtrudeGeometry(
      wallShape,
      {
        depth,
        steps: 1,
        bevelEnabled: false,
        curveSegments: 64
      }
    );

  geometry.translate(
    0,
    0,
    -depth / 2
  );

  geometry.computeVertexNormals();

  const wall =
    new THREE.Mesh(
      geometry,
      wallMaterial
    );

  wall.name =
    "Back Wall With Arch Opening";

  wall.castShadow = true;
  wall.receiveShadow = true;

  return wall;
}

// =====================================================
// SIMPLE WALL BLOCK
// =====================================================

function createWallBlock(
  width,
  height,
  depth
) {
  const wall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        depth
      ),
      wallMaterial
    );

  wall.castShadow = true;
  wall.receiveShadow = true;

  return wall;
}