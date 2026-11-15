import {
  THREE,
  scene
} from "../core/scene.js?v=7500b44";

import {
  createFloor
} from "../objects/floor.js?v=7500b44";

import {
  createWalls
} from "../objects/wall.js?v=7500b44";

import {
  createStairs
} from "../objects/stairs.js?v=7500b44";

import {
  createSideArches
} from "../objects/arch.js?v=7500b44";

import {
  createMainPortal
} from "../objects/door.js?v=7500b44";

import {
  createTicketBooth
} from "../objects/ticketBooth.js?v=7500b44";

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