import { THREE } from "../core/scene.js";
import { wallMaterial } from "../core/materials.js";
import { LEVELS, ROOM } from "../config/layout.js";

export function createWalls(parent) {
  const walls = new THREE.Group();
  walls.name = "Entrance Walls";

  const wallHeight = LEVELS.wallHeight;
  const wallThickness = 4.4;

  // Левая стена
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(
      wallThickness,
      wallHeight,
      ROOM.depth
    ),
    wallMaterial
  );

  leftWall.position.set(
    -ROOM.width / 2 - wallThickness / 2,
    wallHeight / 2,
    ROOM.centerZ
  );

  leftWall.castShadow = true;
  leftWall.receiveShadow = true;

  walls.add(leftWall);

  // Правая стена
  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(
      wallThickness,
      wallHeight,
      ROOM.depth
    ),
    wallMaterial
  );

  rightWall.position.set(
    ROOM.width / 2 + wallThickness / 2,
    wallHeight / 2,
    ROOM.centerZ
  );

  rightWall.castShadow = true;
  rightWall.receiveShadow = true;

  walls.add(rightWall);

  // Задняя стена
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(
      ROOM.width,
      wallHeight,
      1.2
    ),
    wallMaterial
  );

  backWall.position.set(
    0,
    wallHeight / 2,
    ROOM.backWallZ
  );

  backWall.castShadow = true;
  backWall.receiveShadow = true;

  walls.add(backWall);

  parent.add(walls);
}