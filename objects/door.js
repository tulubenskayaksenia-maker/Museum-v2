import {
  createArchPortal
} from "./arch.js";

import {
  ROOM
} from "../config/layout.js";

import {
  getLandingLevel
} from "./stairs.js";

// =====================================================
// MAIN ENTRANCE GATE
// =====================================================

const OPEN_DURATION = 500;
const OPEN_DELAY = 180;

let gatePanel = null;
let gateClosedY = 0;

let gateOpening = false;
let gateOpen = false;
let listenersInstalled = false;
let openTimeout = null;

// =====================================================
// CREATE
// =====================================================

export function createMainPortal(parent) {
  const portal =
    createArchPortal({
      width: 5.2,
      height: 7.4,
      depth: 1.4,

      openingWidth: 3.6,
      openingHeight: 6.2,

      /*
        У главной двери нет старого target,
        поэтому клик по ней не телепортирует
        посетителя в другую точку.
      */
      target: "",

      showDarkOpening: true
    });

  portal.name =
    "Main Corridor Portal";

  portal.position.set(
    0,
    getLandingLevel(),
    ROOM.backWallZ + 1.05
  );

  prepareGatePanel(portal);
  installGateListeners();

  parent.add(portal);

  return portal;
}

// =====================================================
// BLACK SLIDING PANEL
// =====================================================

function prepareGatePanel(portal) {
  const panel =
    portal.getObjectByName(
      "Dark Arch Opening"
    );

  if (!panel) {
    console.warn(
      "Main gate: Dark Arch Opening was not found."
    );

    return;
  }

  /*
    Панель расположена внутри толщины стены.

    Пока она поднимается, видна только та её часть,
    которая остаётся внутри арочного отверстия.
    По поверхности серой стены она не ползёт.
  */

  panel.position.z = -0.59;
  panel.renderOrder = 1;

  gatePanel = panel;
  gateClosedY = panel.position.y;
}

// =====================================================
// EVENTS
// =====================================================

function installGateListeners() {
  if (listenersInstalled) {
    return;
  }

  listenersInstalled = true;

  /*
    После покупки билета дверь открывается сразу.
    Отдельный запрос при подходе к двери также оставлен,
    чтобы логика продолжала работать после перезагрузки
    или восстановления уже купленного билета.
  */
  window.addEventListener(
    "museum-ticket-reserved",
    scheduleMainGateOpening
  );

  window.addEventListener(
    "museum-main-gate-open-request",
    scheduleMainGateOpening
  );

  window.addEventListener(
    "museum-ticket-cleared",
    resetMainGate
  );
}

// =====================================================
// OPEN WHEN A TICKET HOLDER APPROACHES
// =====================================================

function scheduleMainGateOpening() {
  if (
    gateOpen ||
    gateOpening ||
    openTimeout
  ) {
    return;
  }

  /*
    Билетное окно закрывается через 650 мс.

    Дверь начинает двигаться немного позже,
    чтобы пользователь видел всю анимацию,
    а не только её конец.
  */

  openTimeout =
    window.setTimeout(() => {
      openTimeout = null;
      openMainGate();
    }, OPEN_DELAY);
}

function openMainGate() {
  if (
    !gatePanel ||
    gateOpen ||
    gateOpening
  ) {
    return;
  }

  gateOpening = true;
  gatePanel.visible = true;

  const startTime =
    performance.now();

  const startY =
    gatePanel.position.y;

  const endY =
    gateClosedY + 7.35;

  function animate(now) {
    const progress =
      Math.min(
        (now - startTime) /
          OPEN_DURATION,
        1
      );

    const eased =
      easeInOutCubic(progress);

    gatePanel.position.y =
      startY +
      (endY - startY) *
        eased;

    if (progress < 1) {
      requestAnimationFrame(
        animate
      );

      return;
    }

    gatePanel.position.y = endY;
    gatePanel.visible = false;

    gateOpening = false;
    gateOpen = true;
  }

  requestAnimationFrame(
    animate
  );
}

// =====================================================
// RESET
// =====================================================

function resetMainGate() {
  if (openTimeout) {
    window.clearTimeout(
      openTimeout
    );

    openTimeout = null;
  }

  if (!gatePanel) {
    return;
  }

  gateOpening = false;
  gateOpen = false;

  gatePanel.position.y =
    gateClosedY;

  gatePanel.visible = true;
}

// =====================================================
// PUBLIC GATE STATE
// =====================================================

export function isMainGateOpen() {
  return gateOpen;
}

export function isMainGateOpening() {
  return gateOpening || Boolean(openTimeout);
}

export function requestMainGateOpening() {
  if (
    gateOpen ||
    gateOpening ||
    openTimeout
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      "museum-main-gate-open-request"
    )
  );
}

// =====================================================
// EASING
// =====================================================

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 *
        value *
        value *
        value
    : 1 -
        Math.pow(
          -2 * value + 2,
          3
        ) / 2;
}