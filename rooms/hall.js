import {
  THREE,
  scene
} from "../core/scene.js?v=e34eec8";

import {
  createFloor
} from "../objects/floor.js?v=e34eec8";

import {
  createWalls
} from "../objects/wall.js?v=e34eec8";

import {
  createStairs
} from "../objects/stairs.js?v=e34eec8";

import {
  createSideArches
} from "../objects/arch.js?v=e34eec8";

import {
  createMainPortal
} from "../objects/door.js?v=e34eec8";

import {
  createTicketBooth
} from "../objects/ticketBooth.js?v=e34eec8";

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