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

import {
  createFacilitySign
} from "../objects/facilitySign.js?v=89a4dbd";

import {
  createLobbyBoards
} from "../objects/lobbyBoards.js?v=89a4dbd";

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