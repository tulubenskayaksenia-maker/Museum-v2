import {
  scene,
  camera,
  renderer
} from "./core/scene.js?v=84d1282";

import {
  createSky
} from "./environment/sky.js?v=84d1282";

import {
  createLights
} from "./core/lights.js?v=84d1282";

import {
  createEntrance
} from "./rooms/entrance.js?v=84d1282";

import {
  createSideRoom
} from "./rooms/sideRoom.js?v=84d1282";

import {
  createFacilitiesRoom
} from "./rooms/facilitiesRoom.js?v=84d1282";

import {
  createRestroom
} from "./rooms/restroom.js?v=84d1282";

import {
  createCorridor
} from "./rooms/corridor.js?v=84d1282";

import {
  createCorridorLeftRoom01
} from "./rooms/corridorLeftRoom01.js?v=84d1282";

import {
  createCorridorRightRoom01
} from "./rooms/corridorRightRoom01.js?v=84d1282";

import {
  createCorridorLeftRoom02,
  updateCorridorLeftRoom02
} from "./rooms/corridorLeftRoom02.js?v=84d1282";

import {
  createCinemaRoom
} from "./rooms/cinemaRoom.js?v=84d1282";

import {
  createShopRoom
} from "./rooms/shopRoom.js?v=84d1282";

import {
  createFireStairs
} from "./rooms/fireStairs.js?v=84d1282";

import {
  setupShopMenu
} from "./ui/shopMenu.js?v=84d1282";

import {
  setupInfoBoards
} from "./ui/infoBoards.js?v=84d1282";

import {
  setupSound
} from "./ui/sound.js?v=84d1282";

import {
  createCorridorSigns
} from "./objects/corridorSigns.js?v=84d1282";

import {
  updateTicketBoothIndicator
} from "./objects/ticketBooth.js?v=84d1282";

import {
  setupSculptureViewer
} from "./ui/sculptureViewer.js?v=84d1282";

import {
  setupMovement,
  updateMovement
} from "./player/movement.js?v=84d1282";

import {
  setupTicketMenu
} from "./ui/ticketMenu.js?v=84d1282";

import {
  setupCinemaViewer,
  setCinemaFilm
} from "./ui/cinemaViewer.js?v=84d1282";

import {
  setupOnboarding
} from "./ui/onboarding.js?v=84d1282";

import {
  isMuseumLocked,
  setupInvite
} from "./ui/invite.js?v=84d1282";

import {
  setupMobileControls
} from "./ui/mobileControls.js?v=84d1282";

import {
  setupDesktopMouseControls
} from "./ui/desktopMouseControls.js?v=84d1282";

import {
  updateArtworkViewer
} from "./objects/artwork.js?v=84d1282";

// =====================================================
// UI — создаём интерфейсы до комнат и движения
// =====================================================

// До открытия (23.11, 19:00) вместо приветствия — экран-приглашение
const museumLocked =
  isMuseumLocked();

setupOnboarding({
  show: !museumLocked
});

if (museumLocked) {
  setupInvite();
}

setupTicketMenu();
setupShopMenu();
setupInfoBoards();
setupSound();
setupCinemaViewer();
setupSculptureViewer();
setupMobileControls();
setupDesktopMouseControls();

setCinemaFilm({
  title: "HIM",
  artist: "Asaf Tal",
  year: "2026",

  warningTitle: "18+",

  warningText:
    `This film contains disturbing imagery and themes
    that may not be suitable for all viewers.
    Viewer discretion is advised.`,

  videoUrl:
    "./assets/videos/cinema-film.mp4"
});

// =====================================================
// ENVIRONMENT
// =====================================================

createSky();
createLights();

// =====================================================
// MAIN HALL
// =====================================================

const entrance =
  createEntrance();

// =====================================================
// WARDROBE / WC
// =====================================================

const leftRoom =
  createFacilitiesRoom();

const rightRoom =
  createSideRoom(
    "Right Room"
  );

// =====================================================
// RESTROOMS
// =====================================================

const womenWC =
  createRestroom({
    name: "Women WC",
    label: "WOMEN",
    roomType: "women"
  });

const menWC =
  createRestroom({
    name: "Men WC",
    label: "MEN",
    roomType: "men"
  });

// =====================================================
// CORRIDOR
// =====================================================

const corridor =
  createCorridor();

createCorridorSigns(
  corridor
);

// =====================================================
// FIRST INSTALLATION ROOMS
// =====================================================

const room01 =
  createCorridorLeftRoom01();

const room02 =
  createCorridorRightRoom01();

// =====================================================
// SECOND ROOMS
// =====================================================

const room03 =
  createCorridorLeftRoom02();

const room04 =
  createCinemaRoom();

// =====================================================
// OTHER ROOMS
// =====================================================

const room05 =
  createSideRoom(
    "Room 05"
  );

const room06 =
  createSideRoom(
    "Room 06"
  );

// Магазин в конце галерей
const shop =
  createShopRoom();

// Пожарная винтовая лестница через космос
const fireStairs =
  createFireStairs();

// =====================================================
// MOVEMENT
// =====================================================

setupMovement({
  entrance,
  leftRoom,
  rightRoom,

  womenWC,
  menWC,

  corridor,

  room01,
  room02,
  room03,
  room04,
  room05,
  room06,

  shop,

  fireStairs
});

// =====================================================
// ANIMATION
// =====================================================

function animate() {
  requestAnimationFrame(
    animate
  );

  updateMovement();
  updateArtworkViewer();
  updateCorridorLeftRoom02();
  updateTicketBoothIndicator();

  renderer.render(
    scene,
    camera
  );
}

animate();