import {
  scene,
  camera,
  renderer
} from "./core/scene.js";

import {
  createSky
} from "./environment/sky.js";

import {
  createLights
} from "./core/lights.js";

import {
  createEntrance
} from "./rooms/entrance.js";

import {
  createSideRoom
} from "./rooms/sideRoom.js";

import {
  createFacilitiesRoom
} from "./rooms/facilitiesRoom.js";

import {
  createRestroom
} from "./rooms/restroom.js";

import {
  createCorridor
} from "./rooms/corridor.js";

import {
  createCorridorLeftRoom01
} from "./rooms/corridorLeftRoom01.js";

import {
  createCorridorRightRoom01
} from "./rooms/corridorRightRoom01.js";

import {
  createCorridorLeftRoom02,
  updateCorridorLeftRoom02
} from "./rooms/corridorLeftRoom02.js";

import {
  createCinemaRoom
} from "./rooms/cinemaRoom.js";

import {
  createCorridorSigns
} from "./objects/corridorSigns.js";

import {
  updateTicketBoothIndicator
} from "./objects/ticketBooth.js";

import {
  setupSculptureViewer
} from "./ui/sculptureViewer.js";

import {
  setupMovement,
  updateMovement
} from "./player/movement.js";

import {
  setupTicketMenu
} from "./ui/ticketMenu.js";

import {
  setupCinemaViewer,
  setCinemaFilm
} from "./ui/cinemaViewer.js";

import {
  setupOnboarding
} from "./ui/onboarding.js";

import {
  setupMobileControls
} from "./ui/mobileControls.js";

import {
  setupDesktopMouseControls
} from "./ui/desktopMouseControls.js";

import {
  updateArtworkViewer
} from "./objects/artwork.js";

// =====================================================
// UI — создаём интерфейсы до комнат и движения
// =====================================================

setupOnboarding();
setupTicketMenu();
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
  room06
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