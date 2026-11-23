import {
  THREE,
  scene
} from "../core/scene.js?v=ff3bff6";

import {
  createFloor
} from "../objects/floor.js?v=ff3bff6";

import {
  createWalls
} from "../objects/wall.js?v=ff3bff6";

import {
  createStairs
} from "../objects/stairs.js?v=ff3bff6";

import {
  createSideArches
} from "../objects/arch.js?v=ff3bff6";

import {
  createMainPortal
} from "../objects/door.js?v=ff3bff6";

import {
  createTicketBooth
} from "../objects/ticketBooth.js?v=ff3bff6";

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