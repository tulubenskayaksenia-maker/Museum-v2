import {
  resolveCollisions
} from "./collision.js";
import {
  THREE,
  camera,
  renderer
} from "../core/scene.js";

import {
  USE_POINTER_LOCK
} from "../core/aim.js";

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

import {
  isMainGateOpen,
  requestMainGateOpening
} from "../objects/door.js";

import {
  openArtistIntro,
  isArtistIntroOpen
} from "../ui/artistIntro.js";


// =====================================================
// THREE.JS HELPERS
// =====================================================

const raycaster =
  new THREE.Raycaster();

const pointer =
  new THREE.Vector2();

const forwardVector =
  new THREE.Vector3();

const rightVector =
  new THREE.Vector3();

const movementVector =
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
// CAMERA ROTATION
// =====================================================

let yaw =
  camera.rotation.y;

let pitch =
  camera.rotation.x;

let targetYaw =
  yaw;

let targetPitch =
  pitch;


// =====================================================
// CAMERA MOVEMENT
// =====================================================

let currentVelocityX = 0;
let currentVelocityZ = 0;

let clickStepRemaining = 0;
let clickStepEndTime = 0;
let clickStepDirection = 1;
let clickStepYaw = yaw;

let walkTime = 0;

let previousUpdateTime =
  performance.now();


// =====================================================
// KEYBOARD
// =====================================================

const pressedKeys =
  new Set();


// =====================================================
// DOOR DOUBLE-CLICK CONFIRMATION
// =====================================================

// Сколько мс даём на второй клик по той же двери.
// На телефоне даём чуть больше времени на второй тап.
const DOOR_CONFIRM_WINDOW =
  isTouchDevice ? 650 : 450;

let pendingDoorObject = null;
let pendingDoorClickTime = 0;

// До этого момента тап на телефоне считается уже обработанным
// другим модулем (например, вешалкой в гардеробе).
let mobileInteractionConsumedUntil = 0;

// Захват мыши (pointer lock) — см. core/aim.js
let pointerLockErrors = 0;
let pointerLockFailed = false;

// Лёгкая оптимизация: рейкаст «что под курсором» не каждый кадр
let lastCursorRaycastTime = 0;
let lastInterfaceUpdateTime = 0;

let doorHintTimeout = null;

// Переиспользуемый вектор, чтобы не создавать новый каждый кадр
const lockedStepVector =
  new THREE.Vector3();


// =====================================================
// DESKTOP MOUSE
// =====================================================

let leftMouseDown = false;

let leftMouseDownTime = 0;

let leftMouseStartX = 0;
let leftMouseStartY = 0;

let mouseMovedDuringPress =
  false;

let rightMouseDown = false;
let rightMouseDownTime = 0;
let rightMouseStartX = 0;
let rightMouseStartY = 0;
let rightMouseMovedDuringPress = false;

// Mouse movement uses the camera's current horizontal heading directly.
// Only scalar speed is smoothed, so there is no sideways inertia
// and no delayed steering that can feel like drifting.
let currentMoveSpeed = 0;

let lastVerticalLookInputTime = 0;


// =====================================================
// MOBILE TOUCH
// =====================================================

let isTouching = false;
let touchMoved = false;
let isPinching = false;
let mobileWalking = false;

let touchStartTime = 0;

let touchStartX = 0;
let touchStartY = 0;

let previousTouchX = 0;
let previousTouchY = 0;

let pinchStartDistance = 0;
let pinchStartFov = 70;


// =====================================================
// TICKET NOTICE
// =====================================================

let ticketNoticeTimeout = null;

let ticketNoticeShownForApproach =
  false;


// =====================================================
// GENERAL SETTINGS
// =====================================================

const DEFAULT_EYE_HEIGHT =
  2.4;

const ROOM_EYE_HEIGHTS = {
  entrance: 2.4,

  leftRoom: 2.4,
  rightRoom: 2.4,

  corridor: 7.15,

  room01: 2.42,
  room02: 2.44,
  room03: 2.42,
  room04: 2.4,
  room05: 2.4,
  room06: 2.4,

  womenWC: 2.4,
  menWC: 2.4
};


// =====================================================
// MOVEMENT SETTINGS
// =====================================================

const WALK_SPEED =
  5.8;

const FAST_WALK_SPEED =
  8.2;

const MOBILE_WALK_SPEED =
  3.8;

const MOVEMENT_ACCELERATION =
  24;

const MOVEMENT_DECELERATION =
  42;

// Mouse-held walking follows the current yaw directly.
// This produces a clean forward curve instead of a sideways slide.


// =====================================================
// LOOK SETTINGS
// =====================================================

/*
  Поворот зависит только от реального
  движения мыши — event.movementX/Y.

  Уменьшай эти значения, если захочешь
  сделать камеру ещё медленнее.
*/

const MOUSE_LOOK_HORIZONTAL =
  0.00175;

const MOUSE_LOOK_VERTICAL =
  0.00115;

const LOOK_SMOOTHNESS =
  15;

// Horizon assist: while walking, the view returns to eye level sooner.
// While standing, the visitor has enough time to inspect high artworks.
const AUTO_LEVEL_WALK_DELAY =
  650;

const AUTO_LEVEL_IDLE_DELAY =
  2400;

const AUTO_LEVEL_WALK_RESPONSE =
  3.2;

const AUTO_LEVEL_IDLE_RESPONSE =
  1.15;

const KEYBOARD_TURN_SPEED =
  1.65;

const MOBILE_LOOK_SPEED =
  0.004;

const MIN_PITCH =
  THREE.MathUtils.degToRad(-50);

const MAX_PITCH =
  THREE.MathUtils.degToRad(50);

/*
  На телефоне взгляд вверх/вниз ограничен сильнее и сам возвращается
  к горизонту, чтобы камера не «залипала» в потолке или небе.
*/
const MOBILE_MIN_PITCH =
  THREE.MathUtils.degToRad(-40);

const MOBILE_MAX_PITCH =
  THREE.MathUtils.degToRad(40);

const AUTO_LEVEL_MOBILE_IDLE_DELAY =
  1300;

const AUTO_LEVEL_MOBILE_IDLE_RESPONSE =
  2.4;

/*
  Телефон: идти можно только джойстиком.
  Если когда-нибудь захочешь вернуть старое поведение —
  поставь true.
*/
const MOBILE_HOLD_TO_WALK = false;
const MOBILE_TAP_STEP = false;

// Как часто (мс) проверять, на что наведён курсор
const CURSOR_RAYCAST_INTERVAL = 80;


// =====================================================
// CLICK / HOLD SETTINGS
// =====================================================

const HOLD_TO_WALK_DELAY =
  180;

const CLICK_MOVEMENT_LIMIT =
  8;

const MOBILE_HOLD_DELAY =
  230;

const TOUCH_DRAG_THRESHOLD =
  9;

const CLICK_STEP_DISTANCE =
  0.9;

const CLICK_STEP_SPEED =
  2.6;

const CLICK_STEP_MAX_DURATION =
  700;


// =====================================================
// WALKING ANIMATION
// =====================================================

const HEAD_BOB_AMOUNT =
  0;

const HEAD_BOB_SPEED =
  8;


// =====================================================
// ZOOM
// =====================================================

const MIN_FOV =
  52;

const MAX_FOV =
  72;


// =====================================================
// ENTRANCE / CORRIDOR
// =====================================================

const ENTRANCE_TO_CORRIDOR_Z =
  -25.45;

const CORRIDOR_TO_ENTRANCE_Z =
  -24.15;

const CLOSED_GATE_STOP_Z =
  -23.75;

const TICKET_NOTICE_STOP_Z =
  -13.5;


// =====================================================
// ROOM LIMITS
// =====================================================

const ROOM_LIMITS = {
  entrance: {
    startZ: 18,
    endZ: -31,

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
    startZ: -23.4,
    endZ: -195.6,

    minX: -5.4,
    maxX: 5.4
  },

  room01: {
    startZ: 10,
    endZ: -34,

    minX: -15,
    maxX: 15
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

    minX: -15,
    maxX: 15
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

  yaw =
    camera.rotation.y;

  pitch = 0;

  targetYaw =
    yaw;

  targetPitch = 0;

  camera.rotation.x = 0;

  updatePointerCoordinates(
    window.innerWidth / 2,
    window.innerHeight / 2
  );

  setupInteractionStyles();

  window.addEventListener(
    "mousemove",
    handleMouseMove
  );

  window.addEventListener(
    "mousedown",
    handleMouseDown
  );

  window.addEventListener(
    "mouseup",
    handleMouseUp
  );

  window.addEventListener(
    "contextmenu",
    handleRightClick
  );

  window.addEventListener(
    "museum-back-request",
    handleExternalBackRequest
  );

  window.addEventListener(
    "keydown",
    handleKeyDown
  );

  window.addEventListener(
    "keyup",
    handleKeyUp
  );

  window.addEventListener(
    "blur",
    clearInputState
  );

  window.addEventListener(
    "wheel",
    handleWheel,
    {
      passive: false
    }
  );

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

  // Другие модули (например, гардероб) сообщают, что тап уже
  // обработан ими — тогда движение не должно делать шаг вперёд.
  window.addEventListener(
    "museum-mobile-interaction-consumed",
    () => {
      mobileInteractionConsumedUntil =
        performance.now() + 700;
    }
  );

  document.addEventListener(
    "pointerlockchange",
    handlePointerLockChange
  );

  document.addEventListener(
    "pointerlockerror",
    handlePointerLockError
  );

  setupAimStyles();

  if (isTouchDevice) {
    createMobileBackButton();
  }

  updateCursor();
  broadcastNavigationState();
}


// =====================================================
// INTERFACE CHECK
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
        "#artist-intro",
        "#cinema-viewer",
        "#sculpture-viewer",
        "#museum-onboarding",
        "#museum-instructions",
        "#museum-mobile-back",
        "#museum-help-button",
        "#museum-mobile-controls",
        "#museum-desktop-mouse-controls"
      ].join(",")
    )
  );
}

/*
  Из списка касаний убираем те, что лежат на джойстике / кнопках
  интерфейса. Так можно держать джойстик одним пальцем и крутить
  камеру другим — движение не примет это за pinch-to-zoom.
*/
function getWorldTouches(touchList) {
  const touches = [];

  for (let i = 0; i < touchList.length; i++) {
    const touch = touchList[i];

    if (!isInterfaceElement(touch.target)) {
      touches.push(touch);
    }
  }

  return touches;
}

// =====================================================
// MOUSE CAPTURE (POINTER LOCK) — компьютер
// =====================================================

const OVERLAY_OPEN_SELECTOR = [
  "#museum-onboarding.visible",
  "#museum-instructions.visible",
  "#ticket-menu.visible",
  "#artist-intro:not([hidden])",
  "#cinema-viewer:not([hidden])",
  "#sculpture-viewer.visible"
].join(",");

function isPointerLocked() {
  return Boolean(
    document.pointerLockElement
  );
}

/*
  Любое окно поверх сцены (билет, кино, видео, интро художника...).
  Пока оно открыто, мышь должна быть свободна.
*/
function isAnyOverlayOpen() {
  if (
    isInteractionBlocked() ||
    isArtistIntroOpen()
  ) {
    return true;
  }

  if (
    document.querySelector(
      OVERLAY_OPEN_SELECTOR
    )
  ) {
    return true;
  }

  for (const id of [
    "room02-video-overlay",
    "room03-video-overlay"
  ]) {
    const element =
      document.getElementById(id);

    if (
      element &&
      element.style.display ===
        "flex"
    ) {
      return true;
    }
  }

  return false;
}

function canLookWithMouse() {
  if (
    !USE_POINTER_LOCK ||
    pointerLockFailed
  ) {
    return true;
  }

  return isPointerLocked();
}

function shouldCaptureMouse(event) {
  return (
    USE_POINTER_LOCK &&
    !pointerLockFailed &&
    !isTouchDevice &&
    !isPointerLocked() &&
    !isInterfaceElement(
      event.target
    ) &&
    !isAnyOverlayOpen()
  );
}

function requestMouseCapture() {
  if (
    !USE_POINTER_LOCK ||
    pointerLockFailed ||
    isTouchDevice ||
    isPointerLocked()
  ) {
    return;
  }

  try {
    const result =
      renderer.domElement
        .requestPointerLock();

    // В новых браузерах это Promise — ошибку ловим молча,
    // её обработает pointerlockerror.
    if (
      result &&
      typeof result.catch ===
        "function"
    ) {
      result.catch(() => {});
    }
  } catch (error) {
    handlePointerLockError();
  }
}

function handlePointerLockChange() {
  clearInputState();

  if (isPointerLocked()) {
    pointerLockErrors = 0;

    // При захвате мыши целимся в центр экрана.
    updatePointerCoordinates(
      window.innerWidth / 2,
      window.innerHeight / 2
    );
  }

  lastInterfaceUpdateTime = 0;
  lastCursorRaycastTime = 0;

  updateInterfaceHints(
    performance.now()
  );
}

function handlePointerLockError() {
  pointerLockErrors += 1;

  // Один-два сбоя бывают при быстром повторном клике после Esc.
  // Если мышь не захватывается совсем — возвращаем старое
  // управление со свободным курсором.
  if (pointerLockErrors >= 3) {
    pointerLockFailed = true;
  }

  lastInterfaceUpdateTime = 0;
}


// =====================================================
// AIM CROSSHAIR / HINTS
// =====================================================

function getOrCreateElement(
  id,
  className,
  text = ""
) {
  let element =
    document.getElementById(id);

  if (element) {
    return element;
  }

  element =
    document.createElement("div");

  element.id = id;

  if (className) {
    element.className = className;
  }

  element.textContent = text;

  document.body.appendChild(
    element
  );

  return element;
}

function setupAimStyles() {
  if (
    document.getElementById(
      "museum-aim-styles"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "museum-aim-styles";

  style.textContent = `
    #museum-crosshair {
      position: fixed;
      left: 50%;
      top: 50%;
      z-index: 8000;

      width: 8px;
      height: 8px;
      margin: -4px 0 0 -4px;

      border-radius: 50%;
      background: rgba(255, 255, 255, 0.88);
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);

      opacity: 0;
      pointer-events: none;

      transition:
        opacity 0.2s ease,
        transform 0.15s ease,
        background 0.15s ease;
    }

    #museum-crosshair.visible {
      opacity: 1;
    }

    #museum-crosshair.active {
      transform: scale(2.4);
      background: rgba(255, 255, 255, 0.12);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.95);
    }

    #museum-lock-hint,
    #museum-door-hint {
      position: fixed;
      z-index: 9000;

      padding: 10px 16px;

      border: 1px solid rgba(255, 255, 255, 0.34);
      background: rgba(5, 5, 5, 0.66);
      color: rgba(255, 255, 255, 0.94);

      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
      letter-spacing: 0.18em;
      white-space: nowrap;

      opacity: 0;
      visibility: hidden;
      pointer-events: none;

      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);

      transition:
        opacity 0.2s ease,
        visibility 0.2s ease,
        background 0.15s ease,
        border-color 0.15s ease;
    }

    #museum-lock-hint {
      left: 50%;
      top: 24px;
      transform: translateX(-50%);
    }

    #museum-door-hint {
      left: 0;
      top: 0;
      transform: translate(-50%, 0);
    }

    #museum-lock-hint.visible,
    #museum-door-hint.visible {
      opacity: 1;
      visibility: visible;
    }

    #museum-door-hint.armed {
      border-color: rgba(255, 255, 255, 0.95);
      background: rgba(255, 255, 255, 0.2);
    }

    @media (pointer: coarse) {
      #museum-crosshair,
      #museum-lock-hint {
        display: none;
      }
    }
  `;

  document.head.appendChild(
    style
  );
}

function setCrosshairActive(active) {
  if (isTouchDevice) {
    return;
  }

  getOrCreateElement(
    "museum-crosshair"
  ).classList.toggle(
    "active",
    active
  );
}

/*
  Прицел и подсказка «CLICK TO LOOK AROUND».
  Обновляем не каждый кадр, а раз в 100 мс.
*/
function updateInterfaceHints(now) {
  if (
    isTouchDevice ||
    now - lastInterfaceUpdateTime < 100
  ) {
    return;
  }

  lastInterfaceUpdateTime = now;

  const locked =
    isPointerLocked();

  const overlayOpen =
    isAnyOverlayOpen();

  getOrCreateElement(
    "museum-crosshair"
  ).classList.toggle(
    "visible",
    locked && !overlayOpen
  );

  getOrCreateElement(
    "museum-lock-hint",
    "",
    "CLICK TO LOOK AROUND · ESC TO RELEASE"
  ).classList.toggle(
    "visible",
    USE_POINTER_LOCK &&
      !pointerLockFailed &&
      !locked &&
      !overlayOpen
  );
}


// =====================================================
// DOOR HINT
// =====================================================

/*
  Выход ли это из комнаты (а не вход в неё):
  дверь внутри отдельной комнаты, ведущая в коридор.
*/
function isExitDoor(doorObject) {
  return (
    currentRoom !== "entrance" &&
    currentRoom !== "corridor" &&
    doorObject?.userData.target ===
      "corridor"
  );
}

function positionDoorHint() {
  const hint =
    getOrCreateElement(
      "museum-door-hint"
    );

  hint.style.left =
    `${(pointer.x + 1) * 0.5 *
      window.innerWidth}px`;

  hint.style.top =
    `${(1 - pointer.y) * 0.5 *
      window.innerHeight + 28}px`;

  return hint;
}

// Компьютер: подсказка, пока прицел/курсор наведён на дверь
function showDoorHint(doorObject) {
  const hint =
    positionDoorHint();

  hint.textContent =
    isExitDoor(doorObject)
      ? "DOUBLE CLICK TO LEAVE"
      : "DOUBLE CLICK TO ENTER";

  hint.classList.add(
    "visible"
  );
}

function hideDoorHint() {
  window.clearTimeout(
    doorHintTimeout
  );

  const hint =
    document.getElementById(
      "museum-door-hint"
    );

  hint?.classList.remove(
    "visible",
    "armed"
  );
}

// Первый клик/тап по двери: подсвечиваем, что он засчитан
function flashDoorHint(doorObject) {
  const hint =
    positionDoorHint();

  const action =
    isExitDoor(doorObject)
      ? "LEAVE"
      : "ENTER";

  hint.textContent =
    isTouchDevice
      ? `TAP AGAIN TO ${action}`
      : `DOUBLE CLICK TO ${action}`;

  hint.classList.add(
    "visible",
    "armed"
  );

  window.clearTimeout(
    doorHintTimeout
  );

  doorHintTimeout =
    window.setTimeout(
      () => {
        hint.classList.remove(
          "armed"
        );

        // На телефоне наведения нет — подсказка исчезает сама.
        if (isTouchDevice) {
          hint.classList.remove(
            "visible"
          );
        }
      },
      DOOR_CONFIRM_WINDOW + 250
    );
}


function isOnboardingVisible() {
  return (
    document
      .getElementById(
        "museum-onboarding"
      )
      ?.classList.contains(
        "visible"
      ) ?? false
  );
}

function isInstructionsVisible() {
  return (
    document
      .getElementById(
        "museum-instructions"
      )
      ?.classList.contains(
        "visible"
      ) ?? false
  );
}

function isInteractionBlocked() {
  return (
    isTicketMenuOpen() ||
    isArtworkOpen() ||
    isArtistIntroOpen() ||
    isOnboardingVisible() ||
    isInstructionsVisible()
  );
}


// =====================================================
// POINTER COORDINATES
// =====================================================

function updatePointerCoordinates(
  clientX,
  clientY
) {
  pointer.x =
    (
      clientX /
      window.innerWidth
    ) * 2 - 1;

  pointer.y =
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

  // Когда мышь захвачена, прицел всегда в центре экрана.
  if (!isPointerLocked()) {
    updatePointerCoordinates(
      event.clientX,
      event.clientY
    );
  }

  /*
    movementX и movementY существуют
    только в момент настоящего движения мыши.

    Когда мышь перестала двигаться,
    targetYaw и targetPitch больше не меняются.
  */

  if (
    canLookWithMouse() &&
    !isInteractionBlocked() &&
    !isInterfaceElement(event.target)
  ) {
    const deltaX =
      THREE.MathUtils.clamp(
        event.movementX || 0,
        -70,
        70
      );

    const deltaY =
      THREE.MathUtils.clamp(
        event.movementY || 0,
        -55,
        55
      );

    targetYaw -=
      deltaX *
      MOUSE_LOOK_HORIZONTAL;

    if (Math.abs(deltaY) > 0) {
      targetPitch -=
        deltaY *
        MOUSE_LOOK_VERTICAL;

      lastVerticalLookInputTime =
        performance.now();
    }

    targetPitch =
      THREE.MathUtils.clamp(
        targetPitch,
        MIN_PITCH,
        MAX_PITCH
      );
  }

  if (leftMouseDown) {
    const distance =
      Math.hypot(
        event.clientX -
          leftMouseStartX,

        event.clientY -
          leftMouseStartY
      );

    if (
      distance >
      CLICK_MOVEMENT_LIMIT
    ) {
      mouseMovedDuringPress =
        true;
    }
  }

  if (rightMouseDown) {
    const distance =
      Math.hypot(
        event.clientX -
          rightMouseStartX,

        event.clientY -
          rightMouseStartY
      );

    if (
      distance >
      CLICK_MOVEMENT_LIMIT
    ) {
      rightMouseMovedDuringPress =
        true;
    }
  }

  updateCursor();
}


// =====================================================
// DESKTOP MOUSE BUTTONS
// =====================================================

function isBackwardMouseEvent(event) {
  return (
    event.button === 2 ||
    (
      event.button === 0 &&
      event.ctrlKey
    )
  );
}

function handleMouseDown(event) {
  if (isTouchDevice) {
    return;
  }

  const backwardButton =
    isBackwardMouseEvent(event);

  const forwardButton =
    event.button === 0 &&
    !event.ctrlKey;

  if (
    !forwardButton &&
    !backwardButton
  ) {
    return;
  }

  if (backwardButton) {
    event.preventDefault();
  }

  // A normal left click still closes an open artwork.
  if (
    forwardButton &&
    isArtworkOpen()
  ) {
    event.preventDefault();
    clearInputState();
    closeArtwork();

    // Картина закрылась — сразу снова захватываем мышь.
    requestMouseCapture();

    updateCursor();
    return;
  }

  // Первый клик по сцене только захватывает мышь
  // (дальше можно крутить камеру и кликать по прицелу).
  if (
    forwardButton &&
    shouldCaptureMouse(event)
  ) {
    event.preventDefault();
    requestMouseCapture();
    return;
  }

  if (
    isInterfaceElement(event.target) ||
    isInteractionBlocked()
  ) {
    return;
  }

  // Клик по компьютеру в кассе открывает меню билета сразу
  // при нажатии, не дожидаясь отпускания кнопки.
  if (forwardButton) {
    updatePointerCoordinates(
      event.clientX,
      event.clientY
    );

    if (
      getInteractiveObject()?.userData
        .type === "ticketComputer"
    ) {
      event.preventDefault();
      clearInputState();
      openTicketMenu();
      updateCursor();
      return;
    }
  }

  clickStepRemaining = 0;
  clickStepEndTime = 0;

  // Walking uses the current horizontal camera heading.
  // There is no delayed steering vector, so turning does not slide sideways.

  if (backwardButton) {
    rightMouseDown = true;
    rightMouseDownTime =
      performance.now();
    rightMouseStartX =
      event.clientX;
    rightMouseStartY =
      event.clientY;
    rightMouseMovedDuringPress =
      false;
  } else {
    leftMouseDown = true;
    leftMouseDownTime =
      performance.now();
    leftMouseStartX =
      event.clientX;
    leftMouseStartY =
      event.clientY;
    mouseMovedDuringPress =
      false;
  }

  updatePointerCoordinates(
    event.clientX,
    event.clientY
  );

  updateCursor();
}

function handleMouseUp(event) {
  if (isTouchDevice) {
    return;
  }

  const backwardButton =
    isBackwardMouseEvent(event);

  const forwardButton =
    event.button === 0 &&
    !event.ctrlKey;

  if (
    backwardButton &&
    rightMouseDown
  ) {
    event.preventDefault();

    rightMouseDown = false;

    const pressDuration =
      performance.now() -
      rightMouseDownTime;

    const isShortClick =
      pressDuration <
        HOLD_TO_WALK_DELAY &&
      !rightMouseMovedDuringPress;

    if (
      isShortClick &&
      !isInterfaceElement(
        event.target
      )
    ) {
      startClickStep(-1);
    }

    updateCursor();
    return;
  }

  if (
    !forwardButton ||
    !leftMouseDown
  ) {
    return;
  }

  leftMouseDown = false;

  const pressDuration =
    performance.now() -
    leftMouseDownTime;

  const isShortClick =
    pressDuration <
      HOLD_TO_WALK_DELAY &&
    !mouseMovedDuringPress;

  if (
    isShortClick &&
    !isInterfaceElement(
      event.target
    )
  ) {
    updatePointerCoordinates(
      event.clientX,
      event.clientY
    );

    const actionHandled =
      performPrimaryAction();

    if (!actionHandled) {
      startClickStep(1);
    }
  }

  updateCursor();
}

// =====================================================
// KEYBOARD
// =====================================================

function handleKeyDown(event) {
  // event.code привязан к физическому расположению клавиши,
  // поэтому управление работает при любой раскладке языка.
  const code = event.code;

  const movementCodes = [
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "ShiftLeft",
    "ShiftRight",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "KeyQ",
    "KeyE"
  ];

  if (
    movementCodes.includes(code)
  ) {
    clickStepRemaining = 0;
    clickStepEndTime = 0;

    pressedKeys.add(code);

    event.preventDefault();

    return;
  }

  if (code === "Backspace") {
    event.preventDefault();

    handleBackAction();

    return;
  }

  if (code === "Escape") {
    clearInputState();

    if (isTicketMenuOpen()) {
      closeTicketMenu();

      return;
    }

    if (isArtworkOpen()) {
      closeArtwork();

      return;
    }
  }
}

function handleKeyUp(event) {
  pressedKeys.delete(
    event.code
  );
}


// =====================================================
// RESET INPUT
// =====================================================

function clearInputState() {
  pressedKeys.clear();

  leftMouseDown =
    false;

  rightMouseDown =
    false;

  mobileWalking =
    false;

  clickStepRemaining =
    0;

  clickStepEndTime =
    0;

  clickStepDirection =
    1;

  currentVelocityX =
    0;

  currentVelocityZ =
    0;

  currentMoveSpeed =
    0;

  pendingDoorObject =
    null;

  pendingDoorClickTime =
    0;

  hideDoorHint();
}


// =====================================================
// SECONDARY CLICK / BACKWARD MOVEMENT
// =====================================================

function handleRightClick(event) {
  if (
    isInterfaceElement(
      event.target
    )
  ) {
    return;
  }

  // Secondary click is movement now, not instant navigation.
  // Prevent the browser context menu from appearing.
  event.preventDefault();
}

function handleExternalBackRequest() {
  clearInputState();
  handleBackAction();
}

function broadcastNavigationState() {
  window.dispatchEvent(
    new CustomEvent(
      "museum-navigation-state",
      {
        detail: {
          canGoBack:
            navigationHistory.length > 0
        }
      }
    )
  );
}


// =====================================================
// WHEEL ZOOM
// =====================================================

function handleWheel(event) {
  if (
    isInterfaceElement(
      event.target
    )
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
// MOBILE TOUCH START
// =====================================================

function handleTouchStart(event) {
  if (!isTouchDevice) {
    return;
  }

  // Повторный тап закрывает открытую картину.
  if (
    isArtworkOpen() &&
    event.touches.length === 1
  ) {
    event.preventDefault();
    clearInputState();
    closeArtwork();
    updateCursor();
    return;
  }

  const worldTouches =
    getWorldTouches(
      event.touches
    );

  if (
    worldTouches.length === 0
  ) {
    // все текущие касания — джойстик / интерфейс
    return;
  }

  if (
    worldTouches.length === 2
  ) {
    isPinching =
      true;

    touchMoved =
      true;

    mobileWalking =
      false;

    pinchStartDistance =
      getTouchDistance(
        worldTouches[0],
        worldTouches[1]
      );

    pinchStartFov =
      camera.fov;

    event.preventDefault();

    return;
  }

  if (
    worldTouches.length !== 1
  ) {
    return;
  }

  const touch =
    worldTouches[0];

  isTouching =
    true;

  touchMoved =
    false;

  mobileWalking =
    false;

  touchStartTime =
    performance.now();

  touchStartX =
    touch.clientX;

  touchStartY =
    touch.clientY;

  previousTouchX =
    touch.clientX;

  previousTouchY =
    touch.clientY;

  updatePointerCoordinates(
    touch.clientX,
    touch.clientY
  );

  event.preventDefault();
}


// =====================================================
// MOBILE TOUCH MOVE
// =====================================================

function handleTouchMove(event) {
  if (!isTouchDevice) {
    return;
  }

  const worldTouches =
    getWorldTouches(
      event.touches
    );

  if (
    worldTouches.length === 0
  ) {
    return;
  }

  if (
    worldTouches.length === 2
  ) {
    if (!isPinching) {
      isPinching =
        true;

      mobileWalking =
        false;

      pinchStartDistance =
        getTouchDistance(
          worldTouches[0],
          worldTouches[1]
        );

      pinchStartFov =
        camera.fov;
    }

    const currentDistance =
      getTouchDistance(
        worldTouches[0],
        worldTouches[1]
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

    touchMoved =
      true;

    event.preventDefault();

    return;
  }

  if (
    !isTouching ||
    worldTouches.length !== 1
  ) {
    return;
  }

  const touch =
    worldTouches[0];

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
    touchMoved =
      true;

    mobileWalking =
      false;
  }

  if (touchMoved) {
    const deltaX =
      touch.clientX -
      previousTouchX;

    const deltaY =
      touch.clientY -
      previousTouchY;

    yaw -=
      deltaX *
      MOBILE_LOOK_SPEED;

    pitch -=
      deltaY *
      MOBILE_LOOK_SPEED;

    pitch =
      THREE.MathUtils.clamp(
        pitch,
        MOBILE_MIN_PITCH,
        MOBILE_MAX_PITCH
      );

    // Запоминаем момент последнего взгляда вверх/вниз,
    // чтобы потом камера сама вернулась к горизонту.
    if (Math.abs(deltaY) > 0) {
      lastVerticalLookInputTime =
        performance.now();
    }

    targetYaw =
      yaw;

    targetPitch =
      pitch;
  }

  previousTouchX =
    touch.clientX;

  previousTouchY =
    touch.clientY;

  updatePointerCoordinates(
    touch.clientX,
    touch.clientY
  );

  event.preventDefault();
}


// =====================================================
// MOBILE TOUCH END
// =====================================================

function handleTouchEnd(event) {
  if (!isTouchDevice) {
    return;
  }

  if (
    getWorldTouches(
      event.touches
    ).length > 0
  ) {
    // ещё остался «игровой» палец
    return;
  }

  const endedWorldTouch =
    getWorldTouches(
      event.changedTouches
    )[0];

  if (!endedWorldTouch) {
    // убрали палец с джойстика — к движению не относится
    return;
  }

  if (isPinching) {
    isPinching =
      false;

    isTouching =
      false;

    touchMoved =
      false;

    mobileWalking =
      false;

    event.preventDefault();

    return;
  }

  const duration =
    performance.now() -
    touchStartTime;

  const changedTouch =
    endedWorldTouch;

  if (changedTouch) {
    updatePointerCoordinates(
      changedTouch.clientX,
      changedTouch.clientY
    );
  }

  if (
    !touchMoved &&
    duration <
      MOBILE_HOLD_DELAY &&
    performance.now() >=
      mobileInteractionConsumedUntil
  ) {
    const actionHandled =
      performPrimaryAction();

    if (
      !actionHandled &&
      MOBILE_TAP_STEP
    ) {
      startClickStep();
    }
  }

  isTouching =
    false;

  touchMoved =
    false;

  mobileWalking =
    false;

  event.preventDefault();
}

function handleTouchCancel() {
  isTouching =
    false;

  touchMoved =
    false;

  isPinching =
    false;

  mobileWalking =
    false;
}

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

/*
  Первый клик по двери только «взводит» её; переход происходит
  вторым кликом по ТОЙ ЖЕ двери в пределах DOOR_CONFIRM_WINDOW.
*/
function confirmDoorClick(doorObject) {
  const now =
    performance.now();

  const isSameDoor =
    pendingDoorObject === doorObject;

  const withinWindow =
    now - pendingDoorClickTime <=
    DOOR_CONFIRM_WINDOW;

  if (isSameDoor && withinWindow) {
    pendingDoorObject = null;
    pendingDoorClickTime = 0;

    return true;
  }

  pendingDoorObject = doorObject;
  pendingDoorClickTime = now;

  return false;
}

function performPrimaryAction() {
  if (isTicketMenuOpen()) {
    return true;
  }

  if (isArtworkOpen()) {
    closeArtwork();

    return true;
  }

  const interactiveObject =
    getInteractiveObject();

  if (
    interactiveObject?.userData.type ===
    "ticketComputer"
  ) {
    clearInputState();

    openTicketMenu();

    return true;
  }

  if (
    interactiveObject?.userData.type ===
    "artwork"
  ) {
    clearInputState();

    openArtwork(
      interactiveObject
    );

    return true;
  }

  if (
    interactiveObject?.userData.type ===
      "door" &&
    interactiveObject.userData.target
  ) {
    if (
      !confirmDoorClick(
        interactiveObject
      )
    ) {
      // первый клик — дверь только «взведена», перехода нет
      flashDoorHint(
        interactiveObject
      );

      return true;
    }

    hideDoorHint();

    const targetRoom =
      interactiveObject.userData.target;

    /*
      Выход из комнаты = возврат на шаг назад.
      Так игрок оказывается в коридоре прямо у той двери,
      из которой вышел, а история переходов не разрастается.
    */
    if (isExitDoor(interactiveObject)) {
      const previousState =
        navigationHistory[
          navigationHistory.length - 1
        ];

      if (
        previousState &&
        previousState.roomName ===
          "corridor"
      ) {
        clearInputState();

        returnToPreviousSpace();

        return true;
      }
    }

    if (
      targetRoom === "corridor" &&
      !hasTicket()
    ) {
      clearInputState();

      showTicketRequiredNotice();

      return true;
    }

    const roomsWithArtistIntro = [
      "room01",
      "room02",
      "room03",
      "room04"
    ];

    if (
      roomsWithArtistIntro.includes(
        targetRoom
      )
    ) {
      clearInputState();

      openArtistIntro(
        targetRoom
      ).then(
        (shouldEnter) => {
          if (shouldEnter) {
            goToRoom(
              targetRoom
            );
          }
        }
      );

      return true;
    }

    goToRoom(
      targetRoom
    );

    return true;
  }

  return false;
}

function startClickStep(
  direction = 1
) {
  if (
    isInteractionBlocked() ||
    isTouching ||
    isPinching
  ) {
    return;
  }

  clickStepDirection =
    direction >= 0 ? 1 : -1;

  clickStepYaw = yaw;

  clickStepRemaining =
    CLICK_STEP_DISTANCE;

  clickStepEndTime =
    performance.now() +
    CLICK_STEP_MAX_DURATION;
}



// =====================================================
// INTERACTIVE OBJECT SEARCH
// =====================================================

function getInteractiveObject() {
  const activeRoom =
    rooms[currentRoom];

  if (!activeRoom) {
    return null;
  }

  raycaster.setFromCamera(
    pointer,
    camera
  );

  const hits =
    raycaster.intersectObjects(
      activeRoom.children,
      true
    );

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
// MOVEMENT INPUT
// =====================================================

function getMovementInput() {
  let cameraForwardInput = 0;
  let sideInput = 0;
  let mouseForwardInput = 0;
  let stepForwardInput = 0;

  if (
    pressedKeys.has("KeyW") ||
    pressedKeys.has("ArrowUp")
  ) {
    cameraForwardInput += 1;
  }

  if (
    pressedKeys.has("KeyS") ||
    pressedKeys.has("ArrowDown")
  ) {
    cameraForwardInput -= 1;
  }

  if (
    pressedKeys.has("KeyD") ||
    pressedKeys.has("ArrowRight")
  ) {
    sideInput += 1;
  }

  if (
    pressedKeys.has("KeyA") ||
    pressedKeys.has("ArrowLeft")
  ) {
    sideInput -= 1;
  }

  const leftHoldDuration =
    performance.now() -
    leftMouseDownTime;

  const rightHoldDuration =
    performance.now() -
    rightMouseDownTime;

  const mouseWalkingForward =
    leftMouseDown &&
    leftHoldDuration >=
      HOLD_TO_WALK_DELAY;

  const mouseWalkingBackward =
    rightMouseDown &&
    rightHoldDuration >=
      HOLD_TO_WALK_DELAY;

  if (mouseWalkingForward) {
    mouseForwardInput += 1;
  }

  if (mouseWalkingBackward) {
    mouseForwardInput -= 1;
  }

  const touchHoldDuration =
    performance.now() -
    touchStartTime;

  if (
    MOBILE_HOLD_TO_WALK &&
    isTouching &&
    !touchMoved &&
    !isPinching &&
    touchHoldDuration >=
      MOBILE_HOLD_DELAY
  ) {
    mobileWalking =
      true;
  }

  if (mobileWalking) {
    cameraForwardInput += 1;
  }

  const clickStepActive =
    clickStepRemaining > 0.001 &&
    performance.now() <
      clickStepEndTime;

  if (clickStepActive) {
    stepForwardInput =
      clickStepDirection;
  } else if (clickStepRemaining > 0) {
    clickStepRemaining = 0;
    clickStepEndTime = 0;
    clickStepDirection = 1;
  }

  return {
    cameraForwardInput:
      THREE.MathUtils.clamp(
        cameraForwardInput,
        -1,
        1
      ),

    mouseForwardInput:
      THREE.MathUtils.clamp(
        mouseForwardInput,
        -1,
        1
      ),

    stepForwardInput,

    sideInput:
      THREE.MathUtils.clamp(
        sideInput,
        -1,
        1
      ),

    mouseWalkingBackward
  };
}

// =====================================================
// CAMERA LOOK UPDATE
// =====================================================

function updateCameraLook(
  deltaTime
) {
  // Добавочный поворот клавишами.
  // event.code уже используется выше, поэтому Q/E
  // работают при любой языковой раскладке.
  if (pressedKeys.has("KeyQ")) {
    targetYaw +=
      KEYBOARD_TURN_SPEED *
      deltaTime;
  }

  if (pressedKeys.has("KeyE")) {
    targetYaw -=
      KEYBOARD_TURN_SPEED *
      deltaTime;
  }

  const isWalkingNow =
    leftMouseDown ||
    rightMouseDown ||
    mobileWalking ||
    pressedKeys.has("KeyW") ||
    pressedKeys.has("KeyS") ||
    pressedKeys.has("ArrowUp") ||
    pressedKeys.has("ArrowDown");

  const verticalIdleTime =
    performance.now() -
    lastVerticalLookInputTime;

  const autoLevelDelay =
    isWalkingNow
      ? AUTO_LEVEL_WALK_DELAY
      : isTouchDevice
        ? AUTO_LEVEL_MOBILE_IDLE_DELAY
        : AUTO_LEVEL_IDLE_DELAY;

  if (verticalIdleTime > autoLevelDelay) {
    const autoLevelResponse =
      isWalkingNow
        ? AUTO_LEVEL_WALK_RESPONSE
        : isTouchDevice
          ? AUTO_LEVEL_MOBILE_IDLE_RESPONSE
          : AUTO_LEVEL_IDLE_RESPONSE;

    const levelFactor =
      1 -
      Math.exp(
        -autoLevelResponse *
        deltaTime
      );

    targetPitch =
      THREE.MathUtils.lerp(
        targetPitch,
        0,
        levelFactor
      );
  }

  /*
    Работает и на компьютере, и на телефоне.
    Горизонтальный поворот остаётся быстрым, а взгляд вверх/вниз
    через небольшую паузу плавно возвращается к горизонту.
  */
  const smoothingFactor =
    1 -
    Math.exp(
      -LOOK_SMOOTHNESS *
      deltaTime
    );

  yaw =
    THREE.MathUtils.lerp(
      yaw,
      targetYaw,
      smoothingFactor
    );

  pitch =
    THREE.MathUtils.lerp(
      pitch,
      targetPitch,
      smoothingFactor
    );

  camera.rotation.y =
    yaw;

  camera.rotation.x =
    pitch;

  camera.rotation.z =
    0;
}


// =====================================================
// CAMERA MOVEMENT UPDATE
// =====================================================

function updateCameraMovement(
  deltaTime
) {
  const limits =
    ROOM_LIMITS[currentRoom];

  if (!limits) {
    return;
  }

  const {
    cameraForwardInput,
    mouseForwardInput,
    stepForwardInput,
    sideInput,
    mouseWalkingBackward
  } = getMovementInput();

  const hasMovementInput =
    Math.abs(
      cameraForwardInput
    ) > 0.001 ||
    Math.abs(
      mouseForwardInput
    ) > 0.001 ||
    Math.abs(
      stepForwardInput
    ) > 0.001 ||
    Math.abs(
      sideInput
    ) > 0.001;

  // Current camera direction: keyboard and mobile movement.
  forwardVector.set(
    -Math.sin(yaw),
    0,
    -Math.cos(yaw)
  );

  rightVector.set(
    Math.cos(yaw),
    0,
    -Math.sin(yaw)
  );

  movementVector.set(
    0,
    0,
    0
  );

  movementVector.addScaledVector(
    forwardVector,
    cameraForwardInput
  );

  movementVector.addScaledVector(
    rightVector,
    sideInput
  );

  // Mouse-held walking is always purely forward/backward along yaw.
  // No separate steering heading means no lateral drift or delayed pull.
  if (
    Math.abs(mouseForwardInput) >
    0.001
  ) {
    movementVector.addScaledVector(
      forwardVector,
      mouseForwardInput
    );
  }

  if (
    Math.abs(stepForwardInput) >
    0.001
  ) {
    lockedStepVector.set(
      -Math.sin(clickStepYaw),
      0,
      -Math.cos(clickStepYaw)
    );

    movementVector.addScaledVector(
      lockedStepVector,
      stepForwardInput
    );
  }

  if (
    movementVector.lengthSq() > 1
  ) {
    movementVector.normalize();
  }

  const clickStepActive =
    clickStepRemaining > 0.001 &&
    performance.now() <
      clickStepEndTime;

  const hasManualMovementInput =
    pressedKeys.has("KeyW") ||
    pressedKeys.has("KeyS") ||
    pressedKeys.has("KeyA") ||
    pressedKeys.has("KeyD") ||
    pressedKeys.has("ArrowUp") ||
    pressedKeys.has("ArrowDown") ||
    pressedKeys.has("ArrowLeft") ||
    pressedKeys.has("ArrowRight") ||
    leftMouseDown ||
    rightMouseDown ||
    mobileWalking;

  let speed =
    clickStepActive &&
    !hasManualMovementInput
      ? CLICK_STEP_SPEED
      : isTouchDevice
        ? MOBILE_WALK_SPEED
        : WALK_SPEED;

  if (
    (pressedKeys.has("ShiftLeft") || pressedKeys.has("ShiftRight"))
  ) {
    speed =
      FAST_WALK_SPEED;
  }

  const movementAmount =
    Math.min(
      1,
      movementVector.length()
    );

  if (movementAmount > 0.0001) {
    movementVector.normalize();

    const desiredMoveSpeed =
      speed *
      movementAmount;

    const accelerationFactor =
      1 -
      Math.exp(
        -MOVEMENT_ACCELERATION *
        deltaTime
      );

    currentMoveSpeed =
      THREE.MathUtils.lerp(
        currentMoveSpeed,
        desiredMoveSpeed,
        accelerationFactor
      );

    // Direction is always taken from this frame's input.
    // Only speed is smoothed, so there is no sideways inertia.
    currentVelocityX =
      movementVector.x *
      currentMoveSpeed;

    currentVelocityZ =
      movementVector.z *
      currentMoveSpeed;
  } else {
    // Museum movement should stop exactly when the visitor stops
    // pressing. This removes the slippery / drifting feeling.
    currentMoveSpeed = 0;
    currentVelocityX = 0;
    currentVelocityZ = 0;
  }

  let nextX =
    camera.position.x +
    currentVelocityX *
      deltaTime;

  let nextZ =
    camera.position.z +
    currentVelocityZ *
      deltaTime;

  nextX =
    THREE.MathUtils.clamp(
      nextX,
      limits.minX,
      limits.maxX
    );

  nextZ =
    applyRoomZLimits(
      nextZ,
      currentVelocityZ,
      limits
    );

  const previousX =
    camera.position.x;

  const previousZ =
    camera.position.z;

  // Твёрдые предметы: столы, стойки, кресла, кабинки и т.д.
  const solidResult =
    resolveCollisions(
      currentRoom,
      rooms[currentRoom],
      previousX,
      previousZ,
      nextX,
      nextZ
    );

  nextX = solidResult.x;
  nextZ = solidResult.z;

  camera.position.x =
    nextX;

  camera.position.z =
    nextZ;

  /*
    Leaving a separate room now happens only after the visitor
    physically walks backward to the entrance boundary. This works
    with S / ArrowDown, a held secondary click, or a short backward step.
  */
  const walkingBackwardToExit =
    pressedKeys.has("KeyS") ||
    pressedKeys.has("ArrowDown") ||
    mouseWalkingBackward ||
    (
      clickStepActive &&
      clickStepDirection < 0
    );

  const isSeparateRoom =
    currentRoom !== "entrance" &&
    currentRoom !== "corridor";

  const reachedRoomExit =
    camera.position.z >=
      limits.startZ - 0.08;

  if (
    walkingBackwardToExit &&
    isSeparateRoom &&
    reachedRoomExit &&
    navigationHistory.length > 0
  ) {
    handleBackAction();

    return;
  }

  if (clickStepRemaining > 0) {
    const movedDistance =
      Math.hypot(
        camera.position.x -
          previousX,
        camera.position.z -
          previousZ
      );

    clickStepRemaining =
      Math.max(
        0,
        clickStepRemaining -
          movedDistance
      );

    if (
      clickStepRemaining <= 0.001 ||
      performance.now() >=
        clickStepEndTime
    ) {
      clickStepRemaining = 0;
      clickStepEndTime = 0;
      clickStepDirection = 1;
    }
  }

  const isActuallyWalking =
    Math.abs(
      currentVelocityX
    ) > 0.08 ||
    Math.abs(
      currentVelocityZ
    ) > 0.08;

  if (isActuallyWalking) {
    walkTime +=
      deltaTime;
  }

  const headBob =
    isActuallyWalking
      ? Math.sin(
          walkTime *
          HEAD_BOB_SPEED
        ) *
        HEAD_BOB_AMOUNT
      : 0;

  const desiredHeight =
    getEyeHeightForCurrentRoom(
      camera.position.z
    ) +
    headBob;

  camera.position.y =
    THREE.MathUtils.lerp(
      camera.position.y,
      desiredHeight,
      1 -
        Math.exp(
          -10 *
          deltaTime
        )
    );
}


// =====================================================
// ROOM Z LIMITS / MAIN GATE
// =====================================================

function applyRoomZLimits(
  nextZ,
  velocityZ,
  limits
) {
  let effectiveEndZ =
    limits.endZ;

  if (
    currentRoom === "entrance" &&
    !isMainGateOpen()
  ) {
    if (!hasTicket()) {
      effectiveEndZ =
        TICKET_NOTICE_STOP_Z;

      const reachedTicketStop =
        velocityZ < 0 &&
        nextZ <=
          TICKET_NOTICE_STOP_Z;

      if (
        reachedTicketStop &&
        !ticketNoticeShownForApproach
      ) {
        showTicketRequiredNotice();

        ticketNoticeShownForApproach =
          true;
      }
    } else {
      effectiveEndZ =
        CLOSED_GATE_STOP_Z;

      const reachedClosedGate =
        velocityZ < 0 &&
        nextZ <=
          CLOSED_GATE_STOP_Z;

      if (reachedClosedGate) {
        requestMainGateOpening();
      }
    }
  }

  return THREE.MathUtils.clamp(
    nextZ,
    effectiveEndZ,
    limits.startZ
  );
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
// ENTRANCE / CORRIDOR TRANSITION
// =====================================================

function updateContinuousEntranceCorridor() {
  if (
    currentRoom === "entrance" &&
    camera.position.z > -8.5
  ) {
    ticketNoticeShownForApproach =
      false;
  }

  if (hasTicket()) {
    ticketNoticeShownForApproach =
      false;

    document
      .getElementById(
        "museum-ticket-notice"
      )
      ?.classList.remove(
        "visible"
      );
  }

  if (
    currentRoom === "entrance" &&
    hasTicket() &&
    isMainGateOpen() &&
    camera.position.z <
      ENTRANCE_TO_CORRIDOR_Z
  ) {
    currentRoom =
      "corridor";

    updateMobileBackButton();

    return;
  }

  if (
    currentRoom === "corridor" &&
    camera.position.z >
      CORRIDOR_TO_ENTRANCE_Z
  ) {
    currentRoom =
      "entrance";

    camera.position.z =
      Math.max(
        camera.position.z,
        CORRIDOR_TO_ENTRANCE_Z
      );

    updateMobileBackButton();
  }
}


// =====================================================
// ENTER ROOM
// =====================================================

function goToRoom(
  roomName
) {
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

    yaw,
    pitch,

    targetYaw,
    targetPitch,

    fov:
      camera.fov
  });

  hideAllRooms();

  room.visible =
    true;

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

  yaw = 0;
  pitch = 0;

  targetYaw =
    yaw;

  targetPitch =
    pitch;

  camera.rotation.set(
    pitch,
    yaw,
    0
  );

  clearInputState();

  hideTicketHoverHint();
  updateMobileBackButton();
  broadcastNavigationState();
}


// =====================================================
// BACK ACTION
// =====================================================

function handleBackAction() {
  if (isArtistIntroOpen()) {
    return;
  }

  if (isTicketMenuOpen()) {
    closeTicketMenu();

    return;
  }

  if (isArtworkOpen()) {
    closeArtwork();

    return;
  }

  if (
    navigationHistory.length === 0
  ) {
    return;
  }

  returnToPreviousSpace();
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

  if (
    previousState.roomName ===
      "entrance" ||
    previousState.roomName ===
      "corridor"
  ) {
    if (rooms.entrance) {
      rooms.entrance.visible =
        true;
    }

    if (rooms.corridor) {
      rooms.corridor.visible =
        true;
    }
  } else {
    previousRoom.visible =
      true;
  }

  currentRoom =
    previousState.roomName;

  camera.position.copy(
    previousState.position
  );

  yaw =
    previousState.yaw ??
    0;

  pitch = 0;

  targetYaw =
    previousState.targetYaw ??
    yaw;

  targetPitch = 0;

  camera.rotation.set(
    pitch,
    yaw,
    0
  );

  if (
    Number.isFinite(
      previousState.fov
    )
  ) {
    camera.fov =
      previousState.fov;

    camera.updateProjectionMatrix();
  }

  clearInputState();

  hideTicketHoverHint();
  updateMobileBackButton();
  broadcastNavigationState();
}


// =====================================================
// HIDE ROOMS
// =====================================================

function hideAllRooms() {
  Object.values(
    rooms
  ).forEach(
    (room) => {
      if (room) {
        room.visible =
          false;
      }
    }
  );
}


// =====================================================
// CURSOR
// =====================================================

function updateCursor() {
  if (isTouchDevice) {
    return;
  }

  if (
    isTicketMenuOpen() ||
    isArtistIntroOpen() ||
    isOnboardingVisible() ||
    isInstructionsVisible()
  ) {
    document.body.style.cursor =
      "default";

    hideTicketHoverHint();
    hideDoorHint();
    setCrosshairActive(false);

    return;
  }

  if (isArtworkOpen()) {
    document.body.style.cursor =
      "zoom-out";

    hideTicketHoverHint();
    hideDoorHint();
    setCrosshairActive(false);

    return;
  }

  /*
    Рейкаст по всей комнате — дорогая операция.
    Делаем его не чаще, чем раз в CURSOR_RAYCAST_INTERVAL мс,
    а не 60 раз в секунду.
  */
  const now =
    performance.now();

  if (
    now - lastCursorRaycastTime <
    CURSOR_RAYCAST_INTERVAL
  ) {
    return;
  }

  lastCursorRaycastTime = now;

  const object =
    getInteractiveObject();

  const type =
    object?.userData.type;

  setCrosshairActive(
    Boolean(type)
  );

  if (type === "ticketComputer") {
    document.body.style.cursor =
      "pointer";

    hideDoorHint();
    showTicketHoverHint();

    return;
  }

  hideTicketHoverHint();

  if (
    type === "door" &&
    object.userData.target
  ) {
    document.body.style.cursor =
      "pointer";

    showDoorHint(object);

    return;
  }

  hideDoorHint();

  if (type === "artwork") {
    document.body.style.cursor =
      "zoom-in";

    return;
  }

  if (type === "door") {
    document.body.style.cursor =
      "pointer";

    return;
  }

  document.body.style.cursor =
    leftMouseDown ||
    rightMouseDown
      ? "grabbing"
      : "crosshair";
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
    document.createElement(
      "div"
    );

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

  document.body.appendChild(
    hint
  );

  return hint;
}

function showTicketHoverHint() {
  const hint =
    getTicketHoverHint();

  const cursorX =
    (pointer.x + 1) *
    0.5 *
    window.innerWidth;

  const cursorY =
    (1 - pointer.y) *
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
    document.createElement(
      "div"
    );

  notice.id =
    "museum-ticket-notice";

  notice.innerHTML = `
    <span class="museum-ticket-notice-arrow">
      ←
    </span>

    <span>
      PLEASE GET A TICKET FIRST
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
    window.setTimeout(
      () => {
        notice.classList.remove(
          "visible"
        );
      },
      2200
    );
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
    currentRoom !==
      "entrance" ||
    navigationHistory.length > 0;

  button.classList.toggle(
    "museum-mobile-back-visible",
    shouldShow
  );
}


// =====================================================
// DYNAMIC STYLES
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

      color:
        #eef7ff;

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
      left: 50%;
      top: 50%;
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
        translate(-50%, -50%)
        scale(0.96);

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
        translate(-50%, -50%)
        scale(1);
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
// MAIN UPDATE
// =====================================================

export function updateMovement() {
  const currentTime =
    performance.now();

  const deltaTime =
    Math.min(
      (
        currentTime -
        previousUpdateTime
      ) / 1000,
      0.05
    );

  previousUpdateTime =
    currentTime;

  // Окно поверх сцены открылось — отпускаем мышь,
  // чтобы можно было кликать по интерфейсу.
  if (
    isPointerLocked() &&
    isAnyOverlayOpen()
  ) {
    document.exitPointerLock();
  }

  updateInterfaceHints(
    currentTime
  );

  if (isInteractionBlocked()) {
    currentVelocityX =
      0;

    currentVelocityZ =
      0;

    currentMoveSpeed =
      0;

    targetPitch = 0;
    pitch = 0;
    camera.rotation.x = 0;

    return;
  }

  updateCameraLook(
    deltaTime
  );

  updateCameraMovement(
    deltaTime
  );

  updateContinuousEntranceCorridor();

  updateCursor();
}