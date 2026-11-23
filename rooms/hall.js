import {
  THREE,
  scene
} from "../core/scene.js?v=84d1282";

import {
  createFloor
} from "../objects/floor.js?v=84d1282";

import {
  createWalls
} from "../objects/wall.js?v=84d1282";

import {
  createStairs
} from "../objects/stairs.js?v=84d1282";

import {
  createSideArches
} from "../objects/arch.js?v=84d1282";

import {
  createMainPortal
} from "../objects/door.js?v=84d1282";

import {
  createTicketBooth
} from "../objects/ticketBooth.js?v=84d1282";

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