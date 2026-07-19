import {
  THREE,
  camera
} from "../core/scene.js";

import {
  openTicketMenu,
  closeTicketMenu,
  isTicketMenuOpen,
  hasTicket
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
// DEVICE
// =====================================================

const isTouchDevice =
  window.matchMedia(
    "(pointer: coarse)"
  ).matches;

// =====================================================
// ROOMS
// =====================================================

let rooms = {};

let currentRoom =
  "entrance";

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

/*
  Desktop:

  Положение мышки внутри экрана.
  Камера автоматически смотрит
  в соответствующую сторону.
*/

let lookX = 0;
let lookY = 0;

/*
  Mobile:

  Накопленный поворот камеры после свайпов.
*/

let mobileYaw = 0;
let mobilePitch = 0;

let isWalking = false;
let walkTime = 0;

// =====================================================
// TOUCH STATE
// =====================================================

let touchStartX = 0;
let touchStartY = 0;

let previousTouchX = 0;
let previousTouchY = 0;

let touchMoved = false;
let isTouching = false;

let ignoreNextClick = false;

let ticketNoticeTimeout = null;

// =====================================================
// PINCH ZOOM
// =====================================================

let pinchStartDistance = 0;
let pinchStartFov = 70;
let isPinching = false;

// =====================================================
// SETTINGS
// =====================================================

const STEP_SIZE_DESKTOP =
  2.8;

const STEP_SIZE_MOBILE =
  3.2;

const DEFAULT_EYE_HEIGHT =
  1.98;

const ROOM_EYE_HEIGHTS = {
  entrance: 1.98,

  leftRoom: 1.98,
  rightRoom: 1.98,

  corridor: 1.98,

  room01: 2.0,
  room02: 2.02,
  room03: 2.0,
  room04: 1.98,
  room05: 1.98,
  room06: 1.98,

  womenWC: 1.98,
  menWC: 1.98
};

const EXIT_THRESHOLD =
  0.35;

/*
  Desktop look.

  Чем больше значение,
  тем сильнее камера поворачивается
  к краям экрана.
*/

const LOOK_HORIZONTAL =
  0.82;

const LOOK_VERTICAL =
  0.22;

const LOOK_OFFSET =
  0.08;

/*
  Камера чуть быстрее догоняет мышку,
  но движение остаётся мягким.
*/

const LOOK_SMOOTHNESS =
  0.08;

const WALK_SMOOTHNESS =
  0.08;

const HEAD_BOB_AMOUNT =
  0.018;

const HEAD_BOB_SPEED =
  8;

/*
  Mobile swipe sensitivity.
*/

const MOBILE_LOOK_SPEED =
  0.005;

const MOBILE_MIN_PITCH =
  -0.7;

const MOBILE_MAX_PITCH =
  0.7;

/*
  Если палец сдвинулся меньше этого значения,
  жест считается тапом.
*/

const TOUCH_DRAG_THRESHOLD =
  9;

const MIN_FOV =
  55;

const MAX_FOV =
  78;

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

  const initialEyeHeight =
    getBaseEyeHeight(
      currentRoom
    );

  camera.position.y =
    initialEyeHeight;

  camera.rotation.order =
    "YXZ";

  targetX =
    camera.position.x;

  targetY =
    initialEyeHeight;

  targetZ =
    camera.position.z;

  mobileYaw =
    camera.rotation.y;

  mobilePitch =
    camera.rotation.x;

  setupInteractionStyles();

  /*
    Desktop events.
  */

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

  window.addEventListener(
    "wheel",
    handleWheel,
    {
      passive: false
    }
  );

  /*
    Mobile events.
  */

  window.addEventListener(
    "touchstart",
    handleTouchStart,
    {
      passive: false
    }
  );

  window.addEventListener(
    "touchmove",
    handleTouchMove,
    {
      passive: false
    }
  );

  window.addEventListener(
    "touchend",
    handleTouchEnd,
    {
      passive: false
    }
  );

  window.addEventListener(
    "touchcancel",
    handleTouchCancel,
    {
      passive: false
    }
  );

  if (isTouchDevice) {
    createMobileBackButton();
  }
}

// =====================================================
// UI CHECK
// =====================================================

function isInterfaceElement(
  target
) {
  if (!target?.closest) {
    return false;
  }

  return Boolean(
    target.closest(
      [
        "#ticket-menu",
        "#cinema-viewer",
        "#sculpture-viewer",
        "#museum-onboarding",
        "#museum-instructions",
        "#museum-mobile-back"
      ].join(",")
    )
  );
}

// =====================================================
// POINTER COORDINATES
// =====================================================

function updateMouseCoordinates(
  clientX,
  clientY
) {
  mouse.x =
    (
      clientX /
      window.innerWidth
    ) * 2 - 1;

  mouse.y =
    -(
      clientY /
      window.innerHeight
    ) * 2 + 1;
}

// =====================================================
// DESKTOP MOUSE LOOK
// =====================================================

function handleMouseMove(event) {
  if (isTouchDevice) {
    return;
  }

  updateMouseCoordinates(
    event.clientX,
    event.clientY
  );

  /*
    Старая логика сохранена:

    положение мыши определяет,
    куда смотрит камера.
  */

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
// DESKTOP CLICK
// =====================================================

function handleClick(event) {
  /*
    После мобильного touchend браузер
    иногда создаёт дополнительный click.
    Его нужно игнорировать.
  */

  if (ignoreNextClick) {
    ignoreNextClick = false;

    return;
  }

  if (isInterfaceElement(event.target)) {
    return;
  }

  if (
    event.button !== undefined &&
    event.button !== 0
  ) {
    return;
  }

  updateMouseCoordinates(
    event.clientX,
    event.clientY
  );

  performPrimaryAction();
}

// =====================================================
// MOBILE TOUCH START
// =====================================================

function handleTouchStart(event) {
  if (
    !isTouchDevice ||
    isInterfaceElement(event.target)
  ) {
    return;
  }

  /*
    Два пальца — начало pinch zoom.
  */

  if (
    event.touches.length === 2
  ) {
    isPinching = true;
    touchMoved = true;

    pinchStartDistance =
      getTouchDistance(
        event.touches[0],
        event.touches[1]
      );

    pinchStartFov =
      camera.fov;

    event.preventDefault();

    return;
  }

  if (
    event.touches.length !== 1
  ) {
    return;
  }

  const touch =
    event.touches[0];

  touchStartX =
    touch.clientX;

  touchStartY =
    touch.clientY;

  previousTouchX =
    touch.clientX;

  previousTouchY =
    touch.clientY;

  touchMoved = false;
  isTouching = true;

  updateMouseCoordinates(
    touch.clientX,
    touch.clientY
  );

  event.preventDefault();
}

// =====================================================
// MOBILE TOUCH MOVE
// =====================================================

function handleTouchMove(event) {
  if (
    !isTouchDevice ||
    isInterfaceElement(event.target)
  ) {
    return;
  }

  /*
    Pinch zoom.
  */

  if (
    event.touches.length === 2
  ) {
    if (!isPinching) {
      isPinching = true;

      pinchStartDistance =
        getTouchDistance(
          event.touches[0],
          event.touches[1]
        );

      pinchStartFov =
        camera.fov;
    }

    const currentDistance =
      getTouchDistance(
        event.touches[0],
        event.touches[1]
      );

    if (
      pinchStartDistance > 0
    ) {
      const scale =
        currentDistance /
        pinchStartDistance;

      camera.fov =
        THREE.MathUtils.clamp(
          pinchStartFov /
            scale,
          MIN_FOV,
          MAX_FOV
        );

      camera.updateProjectionMatrix();
    }

    touchMoved = true;

    event.preventDefault();

    return;
  }

  if (
    !isTouching ||
    event.touches.length !== 1
  ) {
    return;
  }

  const touch =
    event.touches[0];

  const totalDistance =
    Math.hypot(
      touch.clientX -
        touchStartX,

      touch.clientY -
        touchStartY
    );

  if (
    totalDistance >
    TOUCH_DRAG_THRESHOLD
  ) {
    touchMoved = true;
  }

  if (touchMoved) {
    const deltaX =
      touch.clientX -
      previousTouchX;

    const deltaY =
      touch.clientY -
      previousTouchY;

    mobileYaw -=
      deltaX *
      MOBILE_LOOK_SPEED;

    mobilePitch -=
      deltaY *
      MOBILE_LOOK_SPEED;

    mobilePitch =
      THREE.MathUtils.clamp(
        mobilePitch,
        MOBILE_MIN_PITCH,
        MOBILE_MAX_PITCH
      );
  }

  previousTouchX =
    touch.clientX;

  previousTouchY =
    touch.clientY;

  updateMouseCoordinates(
    touch.clientX,
    touch.clientY
  );

  event.preventDefault();
}

// =====================================================
// MOBILE TOUCH END
// =====================================================

function handleTouchEnd(event) {
  if (
    !isTouchDevice ||
    isInterfaceElement(event.target)
  ) {
    return;
  }

  /*
    Один палец ещё остался:
    значит жест пока не закончен.
  */

  if (
    event.touches.length > 0
  ) {
    return;
  }

  ignoreNextClick = true;

  /*
    После pinch никакое действие
    в сцене не выполняется.
  */

  if (isPinching) {
    isPinching = false;
    isTouching = false;
    touchMoved = false;

    event.preventDefault();

    return;
  }

  const changedTouch =
    event.changedTouches[0];

  if (changedTouch) {
    updateMouseCoordinates(
      changedTouch.clientX,
      changedTouch.clientY
    );
  }

  /*
    Если палец практически не двигался,
    это обычный тап.
  */

  if (!touchMoved) {
    performPrimaryAction();
  }

  isTouching = false;
  touchMoved = false;

  event.preventDefault();
}

// =====================================================
// TOUCH CANCEL
// =====================================================

function handleTouchCancel() {
  isTouching = false;
  touchMoved = false;
  isPinching = false;
}

// =====================================================
// TOUCH DISTANCE
// =====================================================

function getTouchDistance(
  firstTouch,
  secondTouch
) {
  return Math.hypot(
    secondTouch.clientX -
      firstTouch.clientX,

    secondTouch.clientY -
      firstTouch.clientY
  );
}

// =====================================================
// PRIMARY ACTION
// =====================================================

function performPrimaryAction() {
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
    stopWalking();

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
    stopWalking();

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
    const targetRoom =
      interactiveObject.userData.target;

    if (
      targetRoom === "corridor" &&
      !hasTicket()
    ) {
      stopWalking();
      showTicketRequiredNotice();

      return;
    }

    goToRoom(targetRoom);

    return;
  }

  // ===================================================
  // EMPTY SPACE
  // ===================================================

  walkTowardPointer();
}

// =====================================================
// RIGHT CLICK
// =====================================================

function handleRightClick(event) {
  if (isInterfaceElement(event.target)) {
    return;
  }

  event.preventDefault();

  handleBackAction();
}

// =====================================================
// BACK ACTION
// =====================================================

function handleBackAction() {
  if (isTicketMenuOpen()) {
    closeTicketMenu();

    return;
  }

  if (isArtworkOpen()) {
    closeArtwork();

    return;
  }

  /*
    В главном холле действие назад
    ведёт камеру к стартовой позиции.
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

  returnToPreviousSpace();
}

// =====================================================
// KEYBOARD
// =====================================================

function handleKeyDown(event) {
  if (
    event.key === "Escape"
  ) {
    handleBackAction();

    return;
  }

  /*
    Дополнительное удобство:

    W / стрелка вверх — шаг вперёд.
  */

  if (
    event.key === "ArrowUp" ||
    event.key.toLowerCase() === "w"
  ) {
    updateMouseCoordinates(
      window.innerWidth / 2,
      window.innerHeight / 2
    );

    walkTowardPointer();
  }
}

// =====================================================
// WHEEL ZOOM
// =====================================================

function handleWheel(event) {
  if (
    isInterfaceElement(event.target)
  ) {
    return;
  }

  event.preventDefault();

  camera.fov +=
    event.deltaY *
    0.012;

  camera.fov =
    THREE.MathUtils.clamp(
      camera.fov,
      MIN_FOV,
      MAX_FOV
    );

  camera.updateProjectionMatrix();
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
    Сначала ищем интерактивные данные
    непосредственно на меше.
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
    Затем проверяем родителей объекта.
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
// TICKET HOVER HINT
// =====================================================

function getTicketHoverHint() {
  let hint =
    document.getElementById(
      "ticket-hover-hint"
    );

  if (hint) {
    return hint;
  }

  hint =
    document.createElement("div");

  hint.id =
    "ticket-hover-hint";

  hint.innerHTML = `
    <span class="ticket-hover-arrow">
      →
    </span>

    <span>
      BUY TICKET
    </span>
  `;

  document.body.appendChild(hint);

  return hint;
}

function showTicketHoverHint() {
  const hint =
    getTicketHoverHint();

  const cursorX =
    (mouse.x + 1) *
    0.5 *
    window.innerWidth;

  const cursorY =
    (1 - mouse.y) *
    0.5 *
    window.innerHeight;

  hint.style.left =
    `${cursorX + 18}px`;

  hint.style.top =
    `${cursorY}px`;

  hint.classList.add(
    "visible"
  );
}

function hideTicketHoverHint() {
  document
    .getElementById(
      "ticket-hover-hint"
    )
    ?.classList.remove(
      "visible"
    );
}

// =====================================================
// TICKET REQUIRED NOTICE
// =====================================================

function getTicketRequiredNotice() {
  let notice =
    document.getElementById(
      "museum-ticket-notice"
    );

  if (notice) {
    return notice;
  }

  notice =
    document.createElement("div");

  notice.id =
    "museum-ticket-notice";

  notice.innerHTML = `
    <span class="museum-ticket-notice-arrow">
      ←
    </span>

    <span>
      GET YOUR FREE TICKET FIRST
    </span>
  `;

  document.body.appendChild(
    notice
  );

  return notice;
}

function showTicketRequiredNotice() {
  const notice =
    getTicketRequiredNotice();

  notice.classList.add(
    "visible"
  );

  window.clearTimeout(
    ticketNoticeTimeout
  );

  ticketNoticeTimeout =
    window.setTimeout(() => {
      notice.classList.remove(
        "visible"
      );
    }, 2200);
}

// =====================================================
// CURSOR
// =====================================================

function updateCursor() {
  if (isTouchDevice) {
    return;
  }

  if (isTicketMenuOpen()) {
    document.body.style.cursor =
      "default";

    hideTicketHoverHint();

    return;
  }

  if (isArtworkOpen()) {
    document.body.style.cursor =
      "zoom-out";

    hideTicketHoverHint();

    return;
  }

  const object =
    getClickedInteractiveObject();

  if (
    object?.userData.type ===
    "ticketComputer"
  ) {
    document.body.style.cursor =
      "pointer";

    showTicketHoverHint();

    return;
  }

  hideTicketHoverHint();

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
    "door"
  ) {
    document.body.style.cursor =
      "pointer";

    return;
  }

  document.body.style.cursor =
    "crosshair";
}

// =====================================================
// WALK TOWARD POINTER
// =====================================================

function walkTowardPointer() {
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

  movementDirection.y = 0;

  if (
    movementDirection.lengthSq() <
    0.0001
  ) {
    return;
  }

  movementDirection.normalize();

  const stepSize =
    isTouchDevice
      ? STEP_SIZE_MOBILE
      : STEP_SIZE_DESKTOP;

  let nextX =
    targetX +
    movementDirection.x *
      stepSize;

  let nextZ =
    targetZ +
    movementDirection.z *
      stepSize;

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

  const exitDirection =
    new THREE.Vector3(
      -targetX,
      0,
      limits.startZ -
        targetZ
    );

  const stepSize =
    isTouchDevice
      ? STEP_SIZE_MOBILE
      : STEP_SIZE_DESKTOP;

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
      stepSize;

    targetZ +=
      exitDirection.z *
      stepSize;
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

  if (
    Math.abs(targetX) <
    stepSize
  ) {
    targetX = 0;
  }

  if (
    Math.abs(
      limits.startZ -
      targetZ
    ) <
    stepSize
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

  if (
    currentRoom !== "entrance"
  ) {
    return eyeHeight;
  }

  const limits =
    ROOM_LIMITS.entrance;

  if (
    z >
    limits.stairStartZ
  ) {
    return eyeHeight;
  }

  if (
    z <
    limits.stairEndZ
  ) {
    return (
      eyeHeight +
      limits.landingHeight
    );
  }

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
    targetZ,

    lookX,
    lookY,

    mobileYaw,
    mobilePitch
  });

  hideAllRooms();

  room.visible = true;

  currentRoom =
    roomName;

  const eyeHeight =
    getBaseEyeHeight(
      currentRoom
    );

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

  mobileYaw = 0;
  mobilePitch = 0;

  stopWalking();

  document.body.style.cursor =
    "default";

  hideTicketHoverHint();
  updateMobileBackButton();
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

  lookX =
    previousState.lookX ?? 0;

  lookY =
    previousState.lookY ?? 0;

  mobileYaw =
    previousState.mobileYaw ??
    previousState.rotation.y;

  mobilePitch =
    previousState.mobilePitch ??
    previousState.rotation.x;

  stopWalking();

  document.body.style.cursor =
    "default";

  hideTicketHoverHint();
  updateMobileBackButton();
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
// STOP WALKING
// =====================================================

function stopWalking() {
  isWalking = false;
  walkTime = 0;
}

// =====================================================
// MOBILE BACK BUTTON
// =====================================================

function createMobileBackButton() {
  if (
    document.getElementById(
      "museum-mobile-back"
    )
  ) {
    return;
  }

  const button =
    document.createElement(
      "button"
    );

  button.id =
    "museum-mobile-back";

  button.type =
    "button";

  button.setAttribute(
    "aria-label",
    "Go back"
  );

  button.innerHTML = `
    <span class="museum-mobile-back-arrow">
      ←
    </span>

    <span class="museum-mobile-back-label">
      BACK
    </span>
  `;

  button.addEventListener(
    "touchstart",
    (event) => {
      event.stopPropagation();
    },
    {
      passive: true
    }
  );

  button.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      handleBackAction();
    }
  );

  document.body.appendChild(
    button
  );

  updateMobileBackButton();
}

function updateMobileBackButton() {
  const button =
    document.getElementById(
      "museum-mobile-back"
    );

  if (!button) {
    return;
  }

  const shouldShow =
    currentRoom !== "entrance" ||
    navigationHistory.length > 0;

  button.classList.toggle(
    "museum-mobile-back-visible",
    shouldShow
  );
}

// =====================================================
// INTERACTION STYLES
// =====================================================

function setupInteractionStyles() {
  if (
    document.getElementById(
      "museum-movement-styles"
    )
  ) {
    return;
  }

  const style =
    document.createElement(
      "style"
    );

  style.id =
    "museum-movement-styles";

  style.textContent = `
    html,
    body {
      width: 100%;
      height: 100%;
      margin: 0;
      overflow: hidden;
      overscroll-behavior: none;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
      -webkit-tap-highlight-color: transparent;
    }

    @media (pointer: coarse) {
      html,
      body,
      canvas {
        touch-action: none;
        -webkit-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
      }
    }

    #museum-mobile-back {
      position: fixed;

      top: max(
        18px,
        env(safe-area-inset-top)
      );

      left: max(
        16px,
        env(safe-area-inset-left)
      );

      z-index: 9000;

      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;

      min-width: 82px;
      min-height: 43px;

      padding: 10px 14px;

      border:
        1px solid
        rgba(255, 255, 255, 0.3);

      border-radius: 0;

      color:
        rgba(255, 255, 255, 0.92);

      background:
        rgba(5, 5, 5, 0.56);

      backdrop-filter:
        blur(9px);

      -webkit-backdrop-filter:
        blur(9px);

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      opacity: 0;
      visibility: hidden;
      pointer-events: none;

      transform:
        translateY(-8px);

      transition:
        opacity 0.3s ease,
        visibility 0.3s ease,
        transform 0.3s ease,
        background 0.2s ease;

      -webkit-tap-highlight-color:
        transparent;
    }

    #museum-mobile-back.museum-mobile-back-visible {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;

      transform:
        translateY(0);
    }

    #museum-mobile-back:active {
      background:
        rgba(255, 255, 255, 0.16);
    }

    .museum-mobile-back-arrow {
      font-size: 18px;
      line-height: 1;
    }

    .museum-mobile-back-label {
      font-size: 9px;
      font-weight: 500;
      letter-spacing: 0.18em;
    }

    #ticket-hover-hint {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 9000;

      display: flex;
      align-items: center;
      gap: 10px;

      padding: 10px 14px;

      border:
        1px solid
        rgba(150, 205, 255, 0.58);

      background:
        rgba(5, 8, 14, 0.84);

      color: #eef7ff;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      font-size: 11px;
      letter-spacing: 0.18em;
      white-space: nowrap;

      opacity: 0;
      visibility: hidden;
      pointer-events: none;

      transform:
        translate(18px, -50%);

      transition:
        opacity 0.18s ease,
        visibility 0.18s ease;

      box-shadow:
        0 0 24px
        rgba(90, 170, 255, 0.22);

      backdrop-filter:
        blur(8px);

      -webkit-backdrop-filter:
        blur(8px);
    }

    #ticket-hover-hint.visible {
      opacity: 1;
      visibility: visible;
    }

    .ticket-hover-arrow {
      display: inline-block;
      font-size: 22px;
      line-height: 1;

      animation:
        ticketHoverArrowMove
        0.75s ease-in-out
        infinite alternate;
    }

    #museum-ticket-notice {
      position: fixed;
      left: 34px;
      bottom: 42px;
      z-index: 9500;

      display: flex;
      align-items: center;
      gap: 14px;

      padding: 13px 18px;

      border:
        1px solid
        rgba(255, 255, 255, 0.38);

      background:
        rgba(5, 5, 5, 0.76);

      color:
        rgba(255, 255, 255, 0.96);

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      font-size: 11px;
      letter-spacing: 0.18em;
      white-space: nowrap;

      opacity: 0;
      visibility: hidden;
      pointer-events: none;

      transform:
        translateX(-14px);

      transition:
        opacity 0.25s ease,
        visibility 0.25s ease,
        transform 0.25s ease;

      backdrop-filter:
        blur(10px);

      -webkit-backdrop-filter:
        blur(10px);
    }

    #museum-ticket-notice.visible {
      opacity: 1;
      visibility: visible;

      transform:
        translateX(0);
    }

    .museum-ticket-notice-arrow {
      font-size: 26px;
      line-height: 1;

      animation:
        ticketNoticeArrowMove
        0.8s ease-in-out
        infinite alternate;
    }

    @keyframes ticketHoverArrowMove {
      from {
        transform:
          translateX(0);
      }

      to {
        transform:
          translateX(7px);
      }
    }

    @keyframes ticketNoticeArrowMove {
      from {
        transform:
          translateX(0);
      }

      to {
        transform:
          translateX(-8px);
      }
    }

    @media (pointer: coarse) {
      #ticket-hover-hint {
        display: none;
      }

      #museum-ticket-notice {
        left: 18px;
        right: 18px;
        bottom: 24px;
        justify-content: center;
      }
    }

    @media (pointer: fine) {
      #museum-mobile-back {
        display: none;
      }
    }
  `;

  document.head.appendChild(
    style
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

  /*
    На телефоне камера следует
    за направлением свайпа.

    На компьютере камера автоматически
    следует за положением мышки.
  */

  const desiredYaw =
    isTouchDevice
      ? mobileYaw
      : -lookX *
        LOOK_HORIZONTAL;

  const desiredPitch =
    isTouchDevice
      ? mobilePitch +
        LOOK_OFFSET
      : -lookY *
        LOOK_VERTICAL +
        LOOK_OFFSET;

  camera.rotation.y +=
    (
      desiredYaw -
      camera.rotation.y
    ) *
    LOOK_SMOOTHNESS;

  camera.rotation.x +=
    (
      desiredPitch -
      camera.rotation.x
    ) *
    LOOK_SMOOTHNESS;

  camera.rotation.z = 0;
}