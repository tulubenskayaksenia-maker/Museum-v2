import {
  THREE,
  scene
} from "../core/scene.js?v=384ad6f";

import {
  createFloor
} from "../objects/floor.js?v=384ad6f";

import {
  createWalls
} from "../objects/wall.js?v=384ad6f";

import {
  createStairs
} from "../objects/stairs.js?v=384ad6f";

import {
  createSideArches
} from "../objects/arch.js?v=384ad6f";

import {
  createMainPortal
} from "../objects/door.js?v=384ad6f";

import {
  createTicketBooth
} from "../objects/ticketBooth.js?v=384ad6f";

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