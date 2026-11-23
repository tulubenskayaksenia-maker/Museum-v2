import {
  THREE,
  scene
} from "../core/scene.js?v=89a4dbd";

import {
  createFloor
} from "../objects/floor.js?v=89a4dbd";

import {
  createWalls
} from "../objects/wall.js?v=89a4dbd";

import {
  createStairs
} from "../objects/stairs.js?v=89a4dbd";

import {
  createSideArches
} from "../objects/arch.js?v=89a4dbd";

import {
  createMainPortal
} from "../objects/door.js?v=89a4dbd";

import {
  createTicketBooth
} from "../objects/ticketBooth.js?v=89a4dbd";

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