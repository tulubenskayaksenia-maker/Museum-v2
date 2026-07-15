import {
  THREE,
  camera
} from "../core/scene.js";

import {
  openTicketMenu,
  closeTicketMenu,
  isTicketMenuOpen
} from "../ui/ticketMenu.js";

import {
  openArtwork,
  closeArtwork,
  isArtworkOpen
} from "../objects/artwork.js";

// =====================================================
// RAYCASTER
// =====================================================

const raycaster =
  new THREE.Raycaster();

const mouse =
  new THREE.Vector2();

const movementDirection =
  new THREE.Vector3();

// =====================================================
// ROOMS
// =====================================================

let rooms = {};

let currentRoom =
  "entrance";

/*
  Сохраняет полный путь зрителя.

  Например:

  entrance
  → corridor
  → room03

  Возврат:

  room03
  → corridor
  → entrance
*/

const navigationHistory = [];

// =====================================================
// CAMERA MOVEMENT
// =====================================================

let targetX =
  camera.position.x;

let targetY =
  camera.position.y;

let targetZ =
  camera.position.z;

let lookX = 0;
let lookY = 0;

let isWalking = false;
let walkTime = 0;

/*
  Плавная инерция движения.

  0 — камера остановлена.
  1 — камера движется с полной скоростью.
*/

let movementBlend = 0;

// =====================================================
// SETTINGS
// =====================================================

const STEP_SIZE = 2.8;

/*
  Высота глаз взрослого человека.

  Это не полный рост персонажа,
  а именно уровень глаз.
*/

const DEFAULT_EYE_HEIGHT =
  1.75;

/*
  В некоторых комнатах камера слегка адаптирована
  под высоту экспозиции.

  Значения отличаются минимально,
  чтобы переходы между комнатами не выглядели резко.
*/

const ROOM_EYE_HEIGHTS = {
  entrance: 1.75,

  leftRoom: 1.75,
  rightRoom: 1.75,

  corridor: 1.75,

  room01: 1.78,
  room02: 1.82,
  room03: 1.8,
  room04: 1.75,
  room05: 1.75,
  room06: 1.75,

  womenWC: 1.75,
  menWC: 1.75
};

const EXIT_THRESHOLD =
  0.35;

const LOOK_HORIZONTAL =
  0.8;

const LOOK_VERTICAL =
  0.32;

const LOOK_SMOOTHNESS =
  0.07;

const WALK_SMOOTHNESS =
  0.08;

const HEAD_BOB_AMOUNT =
  0.018;

const HEAD_BOB_SPEED =
  8;

// =====================================================
// ROOM LIMITS
// =====================================================

const ROOM_LIMITS = {
  entrance: {
    startZ: 18,
    endZ: -23,

    minX: -9.8,
    maxX: 9.8,

    stairStartZ: -6,
    stairEndZ: -21,

    landingHeight: 4.75
  },

  leftRoom: {
    startZ: 10,
    endZ: -24,

    minX: -11,
    maxX: 11
  },

  rightRoom: {
    startZ: 10,
    endZ: -24,

    minX: -11,
    maxX: 11
  },

  womenWC: {
    startZ: 9,
    endZ: -14,

    minX: -8,
    maxX: 8
  },

  menWC: {
    startZ: 9,
    endZ: -14,

    minX: -8,
    maxX: 8
  },

  corridor: {
    startZ: 12,
    endZ: -155,

    minX: -5.4,
    maxX: 5.4
  },

  room01: {
    startZ: 10,
    endZ: -34,

    minX: -17,
    maxX: 17
  },

  room02: {
    startZ: 10,
    endZ: -32,

    minX: -17,
    maxX: 17
  },

  room03: {
    startZ: 10,
    endZ: -34,

    minX: -17,
    maxX: 17
  },

  room04: {
    startZ: 10,
    endZ: -36,

    minX: -13,
    maxX: 13
  },

  room05: {
    startZ: 10,
    endZ: -28,

    minX: -15,
    maxX: 15
  },

  room06: {
    startZ: 10,
    endZ: -28,

    minX: -15,
    maxX: 15
  }
};

// =====================================================
// SETUP
// =====================================================

export function setupMovement(
  roomMap
) {
  rooms = roomMap;

  /*
    Сразу исправляем стартовую высоту камеры.

    Благодаря этому не нужно отдельно менять scene.js:
    сайт сразу запускается с камерой
    на уровне глаз взрослого человека.
  */

  const initialEyeHeight =
    getBaseEyeHeight(
      currentRoom
    );

  camera.position.y =
    initialEyeHeight;

  targetX =
    camera.position.x;

  targetY =
    initialEyeHeight;

  targetZ =
    camera.position.z;

  window.addEventListener(
    "mousemove",
    handleMouseMove
  );

  window.addEventListener(
    "click",
    handleClick
  );

  window.addEventListener(
    "contextmenu",
    handleRightClick
  );

  window.addEventListener(
    "keydown",
    handleKeyDown
  );
}

// =====================================================
// MOUSE
// =====================================================

function handleMouseMove(event) {
  mouse.x =
    (
      event.clientX /
      window.innerWidth
    ) * 2 - 1;

  mouse.y =
    -(
      event.clientY /
      window.innerHeight
    ) * 2 + 1;

  lookX =
    event.clientX /
      window.innerWidth -
    0.5;

  lookY =
    event.clientY /
      window.innerHeight -
    0.5;

  updateCursor();
}

// =====================================================
// LEFT CLICK
// =====================================================

function handleClick(event) {
  /*
    Не передаём клики из меню кассы
    в Three.js-сцену.
  */

  if (
    event.target.closest?.(
      "#ticket-menu"
    )
  ) {
    return;
  }

  /*
    Не передаём клики из полноэкранного
    просмотра кино.
  */

  if (
    event.target.closest?.(
      "#cinema-viewer"
    )
  ) {
    return;
  }

  /*
    Не передаём клики из 360-просмотра
    скульптур.
  */

  if (
    event.target.closest?.(
      "#sculpture-viewer"
    )
  ) {
    return;
  }

  if (isTicketMenuOpen()) {
    return;
  }

  if (isArtworkOpen()) {
    closeArtwork();

    return;
  }

  const interactiveObject =
    getClickedInteractiveObject();

  // ===================================================
  // TICKET COMPUTER
  // ===================================================

  if (
    interactiveObject?.userData.type ===
    "ticketComputer"
  ) {
    isWalking = false;

    openTicketMenu();

    return;
  }

  // ===================================================
  // ARTWORK
  // ===================================================

  if (
    interactiveObject?.userData.type ===
    "artwork"
  ) {
    isWalking = false;

    openArtwork(
      interactiveObject
    );

    return;
  }

  // ===================================================
  // DOOR
  // ===================================================

  if (
    interactiveObject?.userData.type ===
      "door" &&
    interactiveObject.userData.target
  ) {
    goToRoom(
      interactiveObject.userData.target
    );

    return;
  }

  // ===================================================
  // EMPTY SPACE
  // ===================================================

  walkTowardMouse();
}

// =====================================================
// RIGHT CLICK
// =====================================================

function handleRightClick(event) {
  event.preventDefault();

  if (isTicketMenuOpen()) {
    closeTicketMenu();

    return;
  }

  if (isArtworkOpen()) {
    closeArtwork();

    return;
  }

  /*
    В главном холле правый клик
    просто ведёт зрителя назад.
  */

  if (
    currentRoom === "entrance"
  ) {
    walkBackward();

    return;
  }

  const limits =
    ROOM_LIMITS[currentRoom];

  if (!limits) {
    return;
  }

  /*
    Проверяем, дошёл ли зритель
    до входной точки комнаты.
  */

  const targetDistance =
    limits.startZ -
    targetZ;

  const cameraDistance =
    limits.startZ -
    camera.position.z;

  const horizontalDistance =
    Math.abs(targetX);

  const cameraHorizontalDistance =
    Math.abs(
      camera.position.x
    );

  const stillInsideRoom =
    targetDistance >
      EXIT_THRESHOLD ||
    cameraDistance >
      EXIT_THRESHOLD ||
    horizontalDistance >
      EXIT_THRESHOLD ||
    cameraHorizontalDistance >
      EXIT_THRESHOLD;

  if (stillInsideRoom) {
    walkBackward();

    return;
  }

  /*
    Когда зритель уже находится у входа,
    следующий правый клик возвращает
    в предыдущее пространство.
  */

  returnToPreviousSpace();
}

// =====================================================
// KEYBOARD
// =====================================================

function handleKeyDown(event) {
  if (
    event.key !== "Escape"
  ) {
    return;
  }

  if (isTicketMenuOpen()) {
    closeTicketMenu();

    return;
  }

  if (isArtworkOpen()) {
    closeArtwork();
  }
}

// =====================================================
// INTERACTIVE OBJECT SEARCH
// =====================================================

function getClickedInteractiveObject() {
  const activeRoom =
    rooms[currentRoom];

  if (!activeRoom) {
    return null;
  }

  raycaster.setFromCamera(
    mouse,
    camera
  );

  const hits =
    raycaster.intersectObjects(
      activeRoom.children,
      true
    );

  if (
    hits.length === 0
  ) {
    return null;
  }

  /*
    Сначала ищем интерактивный тип
    непосредственно на меше.

    Это важно для больших невидимых
    зон дверей WOMEN и MEN.
  */

  for (const hit of hits) {
    const object =
      hit.object;

    const type =
      object.userData.type;

    if (
      type === "door" ||
      type === "ticketComputer" ||
      type === "artwork"
    ) {
      return object;
    }
  }

  /*
    Если интерактивных данных нет на меше,
    поднимаемся по его родителям.
  */

  for (const hit of hits) {
    let object =
      hit.object;

    while (
      object &&
      object !== activeRoom
    ) {
      const type =
        object.userData.type;

      if (
        type === "door" ||
        type === "ticketComputer" ||
        type === "artwork"
      ) {
        return object;
      }

      object =
        object.parent;
    }
  }

  return null;
}

// =====================================================
// CURSOR
// =====================================================

function updateCursor() {
  if (isTicketMenuOpen()) {
    document.body.style.cursor =
      "default";

    return;
  }

  if (isArtworkOpen()) {
    document.body.style.cursor =
      "zoom-out";

    return;
  }

  const object =
    getClickedInteractiveObject();

  if (
    object?.userData.type ===
    "artwork"
  ) {
    document.body.style.cursor =
      "zoom-in";

    return;
  }

  if (
    object?.userData.type ===
      "door" ||
    object?.userData.type ===
      "ticketComputer"
  ) {
    document.body.style.cursor =
      "pointer";

    return;
  }

  document.body.style.cursor =
    "crosshair";
}

// =====================================================
// WALK TOWARD MOUSE
// =====================================================

function walkTowardMouse() {
  const limits =
    ROOM_LIMITS[currentRoom];

  if (!limits) {
    return;
  }

  raycaster.setFromCamera(
    mouse,
    camera
  );

  movementDirection.copy(
    raycaster.ray.direction
  );

  /*
    Убираем вертикальную составляющую:
    зритель двигается только по полу.
  */

  movementDirection.y = 0;

  if (
    movementDirection.lengthSq() <
    0.0001
  ) {
    return;
  }

  movementDirection.normalize();

  let nextX =
    targetX +
    movementDirection.x *
      STEP_SIZE;

  let nextZ =
    targetZ +
    movementDirection.z *
      STEP_SIZE;

  /*
    Не даём зрителю пройти
    сквозь внешние стены комнаты.
  */

  nextX =
    THREE.MathUtils.clamp(
      nextX,
      limits.minX,
      limits.maxX
    );

  nextZ =
    THREE.MathUtils.clamp(
      nextZ,
      limits.endZ,
      limits.startZ
    );

  targetX = nextX;
  targetZ = nextZ;

  targetY =
    getEyeHeightForCurrentRoom(
      targetZ
    );

  isWalking = true;
}

// =====================================================
// WALK BACKWARD
// =====================================================

function walkBackward() {
  const limits =
    ROOM_LIMITS[currentRoom];

  if (!limits) {
    return;
  }

  /*
    Направляем зрителя назад
    к центральной входной точке комнаты.
  */

  const exitDirection =
    new THREE.Vector3(
      -targetX,
      0,
      limits.startZ -
        targetZ
    );

  if (
    exitDirection.lengthSq() <
    0.0001
  ) {
    targetX = 0;

    targetZ =
      limits.startZ;
  } else {
    exitDirection.normalize();

    targetX +=
      exitDirection.x *
      STEP_SIZE;

    targetZ +=
      exitDirection.z *
      STEP_SIZE;
  }

  targetX =
    THREE.MathUtils.clamp(
      targetX,
      limits.minX,
      limits.maxX
    );

  targetZ =
    THREE.MathUtils.clamp(
      targetZ,
      limits.endZ,
      limits.startZ
    );

  /*
    При приближении точно фиксируем
    камеру на центральной входной позиции.
  */

  if (
    Math.abs(targetX) <
    STEP_SIZE
  ) {
    targetX = 0;
  }

  if (
    Math.abs(
      limits.startZ -
      targetZ
    ) <
    STEP_SIZE
  ) {
    targetZ =
      limits.startZ;
  }

  targetY =
    getEyeHeightForCurrentRoom(
      targetZ
    );

  isWalking = true;
}

// =====================================================
// CAMERA HEIGHT
// =====================================================

function getBaseEyeHeight(
  roomName
) {
  return (
    ROOM_EYE_HEIGHTS[
      roomName
    ] ??
    DEFAULT_EYE_HEIGHT
  );
}

function getEyeHeightForCurrentRoom(
  z
) {
  const eyeHeight =
    getBaseEyeHeight(
      currentRoom
    );

  /*
    Во всех комнатах, кроме главного холла,
    пол находится на одном уровне.
  */

  if (
    currentRoom !== "entrance"
  ) {
    return eyeHeight;
  }

  const limits =
    ROOM_LIMITS.entrance;

  /*
    До начала лестницы.
  */

  if (
    z >
    limits.stairStartZ
  ) {
    return eyeHeight;
  }

  /*
    На верхней платформе.
  */

  if (
    z <
    limits.stairEndZ
  ) {
    return (
      eyeHeight +
      limits.landingHeight
    );
  }

  /*
    Плавное изменение высоты
    во время подъёма по лестнице.
  */

  const progress =
    (
      limits.stairStartZ -
      z
    ) /
    (
      limits.stairStartZ -
      limits.stairEndZ
    );

  return (
    eyeHeight +
    progress *
      limits.landingHeight
  );
}

// =====================================================
// ENTER ROOM
// =====================================================

function goToRoom(roomName) {
  const room =
    rooms[roomName];

  const limits =
    ROOM_LIMITS[roomName];

  if (!room) {
    console.error(
      `Room "${roomName}" does not exist in setupMovement().`
    );

    return;
  }

  if (!limits) {
    console.error(
      `ROOM_LIMITS missing for "${roomName}".`
    );

    return;
  }

  /*
    Сохраняем текущее пространство,
    позицию камеры и направление взгляда.
  */

  navigationHistory.push({
    roomName:
      currentRoom,

    position:
      camera.position.clone(),

    rotation: {
      x: camera.rotation.x,
      y: camera.rotation.y,
      z: camera.rotation.z
    },

    targetX,
    targetY,
    targetZ
  });

  hideAllRooms();

  room.visible = true;

  currentRoom =
    roomName;

  const eyeHeight =
    getBaseEyeHeight(
      currentRoom
    );

  /*
    Новая комната всегда начинается
    с центральной позиции у входа.
  */

  camera.position.set(
    0,
    eyeHeight,
    limits.startZ
  );

  camera.rotation.set(
    0,
    0,
    0
  );

  targetX = 0;
  targetY = eyeHeight;

  targetZ =
    limits.startZ;

  lookX = 0;
  lookY = 0;

  isWalking = false;
  walkTime = 0;

  document.body.style.cursor =
    "default";
}

// =====================================================
// RETURN TO PREVIOUS SPACE
// =====================================================

function returnToPreviousSpace() {
  const previousState =
    navigationHistory.pop();

  if (!previousState) {
    return;
  }

  const previousRoom =
    rooms[
      previousState.roomName
    ];

  if (!previousRoom) {
    return;
  }

  hideAllRooms();

  previousRoom.visible =
    true;

  currentRoom =
    previousState.roomName;

  camera.position.copy(
    previousState.position
  );

  camera.rotation.set(
    previousState.rotation.x,
    previousState.rotation.y,
    previousState.rotation.z
  );

  targetX =
    previousState.targetX;

  targetY =
    previousState.targetY;

  targetZ =
    previousState.targetZ;

  isWalking = false;
  walkTime = 0;

  document.body.style.cursor =
    "default";
}

// =====================================================
// HIDE ALL ROOMS
// =====================================================

function hideAllRooms() {
  Object.values(rooms).forEach(
    (room) => {
      if (room) {
        room.visible = false;
      }
    }
  );
}

// =====================================================
// UPDATE
// =====================================================

export function updateMovement() {
  if (
    isTicketMenuOpen() ||
    isArtworkOpen()
  ) {
    isWalking = false;

    return;
  }

  const distanceX =
    Math.abs(
      targetX -
      camera.position.x
    );

  const distanceY =
    Math.abs(
      targetY -
      camera.position.y
    );

  const distanceZ =
    Math.abs(
      targetZ -
      camera.position.z
    );

  if (
    distanceX < 0.03 &&
    distanceY < 0.03 &&
    distanceZ < 0.03
  ) {
    isWalking = false;
  }

  if (isWalking) {
    walkTime += 0.18;
  }

  const headBob =
    isWalking
      ? Math.sin(
          walkTime *
          HEAD_BOB_SPEED
        ) *
        HEAD_BOB_AMOUNT
      : 0;

  camera.position.x +=
    (
      targetX -
      camera.position.x
    ) *
    WALK_SMOOTHNESS;

  camera.position.y +=
    (
      targetY +
      headBob -
      camera.position.y
    ) *
    WALK_SMOOTHNESS;

  camera.position.z +=
    (
      targetZ -
      camera.position.z
    ) *
    WALK_SMOOTHNESS;

  camera.rotation.y +=
    (
      -lookX *
        LOOK_HORIZONTAL -
      camera.rotation.y
    ) *
    LOOK_SMOOTHNESS;

  camera.rotation.x +=
    (
      -lookY *
        LOOK_VERTICAL -
      camera.rotation.x
    ) *
    LOOK_SMOOTHNESS;

  camera.rotation.z = 0;
}