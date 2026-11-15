import {
  THREE,
  scene
} from "../core/scene.js?v=b43ba13";

import {
  createFloor
} from "../objects/floor.js?v=b43ba13";

import {
  createWalls
} from "../objects/wall.js?v=b43ba13";

import {
  createStairs
} from "../objects/stairs.js?v=b43ba13";

import {
  createSideArches
} from "../objects/arch.js?v=b43ba13";

import {
  createMainPortal
} from "../objects/door.js?v=b43ba13";

import {
  createTicketBooth
} from "../objects/ticketBooth.js?v=b43ba13";

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