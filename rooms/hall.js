import {
  THREE,
  scene
} from "../core/scene.js?v=5d12b72";

import {
  createFloor
} from "../objects/floor.js?v=5d12b72";

import {
  createWalls
} from "../objects/wall.js?v=5d12b72";

import {
  createStairs
} from "../objects/stairs.js?v=5d12b72";

import {
  createSideArches
} from "../objects/arch.js?v=5d12b72";

import {
  createMainPortal
} from "../objects/door.js?v=5d12b72";

import {
  createTicketBooth
} from "../objects/ticketBooth.js?v=5d12b72";

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