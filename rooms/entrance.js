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

import {
  createFacilitySign
} from "../objects/facilitySign.js";

export function createEntrance() {
  const entrance =
    new THREE.Group();

  entrance.name =
    "Entrance";

  // Основная архитектура
  createFloor(entrance);
  createWalls(entrance);
  createStairs(entrance);

  // Левая боковая арка:
  // WARDROBE / WC
  createSideArches(entrance);

  // Верхняя арка:
  // переход в коридор
  createMainPortal(entrance);

  // Билетная касса справа
  createTicketBooth(entrance);

  // Перпендикулярная вывеска
  // WARDROBE · WC слева
  createFacilitySign(entrance);

  scene.add(entrance);

  return entrance;
}