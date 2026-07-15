import {
  THREE,
  scene
} from "../core/scene.js";

import {
  createFloor
} from "../objects/floor.js";

import {
  createWalls
} from "../objects/wall.js";

import {
  createStairs
} from "../objects/stairs.js";

import {
  createSideArches
} from "../objects/arch.js";

import {
  createMainPortal
} from "../objects/door.js";

import {
  createTicketBooth
} from "../objects/ticketBooth.js";

export function createEntrance() {
  const entrance = new THREE.Group();
  entrance.name = "Entrance";

  createFloor(entrance);
  createWalls(entrance);
  createStairs(entrance);

  // Только левая боковая арка
  createSideArches(entrance);

  // Арка наверху лестницы
  createMainPortal(entrance);

  // Касса справа
  createTicketBooth(entrance);

  scene.add(entrance);

  return entrance;
}