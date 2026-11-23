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

import {
  createFacilitySign
} from "../objects/facilitySign.js?v=84d1282";

import {
  createLobbyBoards
} from "../objects/lobbyBoards.js?v=84d1282";

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