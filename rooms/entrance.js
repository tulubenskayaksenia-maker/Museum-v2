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

import {
  createFacilitySign
} from "../objects/facilitySign.js?v=b43ba13";

import {
  createLobbyBoards
} from "../objects/lobbyBoards.js?v=b43ba13";

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