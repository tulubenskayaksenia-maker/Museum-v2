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

import {
  createFacilitySign
} from "../objects/facilitySign.js?v=ff3bff6";

import {
  createLobbyBoards
} from "../objects/lobbyBoards.js?v=ff3bff6";

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

  // Схема музея у касс и афиша будущих выставок напротив
  createLobbyBoards(entrance);

  scene.add(entrance);

  return entrance;
}