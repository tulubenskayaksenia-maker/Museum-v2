// =====================================================
// MOBILE GAME CONTROLS
// ui/mobileControls.js
// =====================================================

const isMobileControlDevice =
  window.matchMedia("(pointer: coarse)").matches;

const KEY_MAP = {
  KeyW: "w",
  KeyA: "a",
  KeyS: "s",
  KeyD: "d"
};

const activeKeys = new Set();

let controlsRoot = null;
let joystickZone = null;
let joystickThumb = null;
let activePointerId = null;
let controlsAreHidden = true;
let guideTimer = null;

const JOYSTICK_RADIUS = 48;
const DEAD_ZONE = 0.16;
const KEY_THRESHOLD = 0.24;

// =====================================================
// PUBLIC SETUP
// =====================================================

export function setupMobileControls() {
  if (!isMobileControlDevice) {
    return;
  }

  if (
    document.getElementById(
      "museum-mobile-controls"
    )
  ) {
    return;
  }

  createControls();
  createStyles();
  bindJoystick();
  bindVisibilityObservers();

  updateControlsVisibility();
}

// =====================================================
// CREATE UI
// =====================================================

function createControls() {
  controlsRoot =
    document.createElement("div");

  controlsRoot.id =
    "museum-mobile-controls";

  controlsRoot.setAttribute(
    "aria-hidden",
    "true"
  );

  controlsRoot.innerHTML = `
    <div
      id="museum-mobile-joystick"
      class="museum-mobile-joystick"
      role="application"
      aria-label="Movement joystick"
    >
      <div class="museum-mobile-joystick-ring">
        <span class="museum-mobile-joystick-arrow museum-mobile-joystick-arrow--up">↑</span>
        <span class="museum-mobile-joystick-arrow museum-mobile-joystick-arrow--right">→</span>
        <span class="museum-mobile-joystick-arrow museum-mobile-joystick-arrow--down">↓</span>
        <span class="museum-mobile-joystick-arrow museum-mobile-joystick-arrow--left">←</span>

        <div
          id="museum-mobile-joystick-thumb"
          class="museum-mobile-joystick-thumb"
        ></div>
      </div>

      <span class="museum-mobile-joystick-label">
        MOVE
      </span>
    </div>

    <div
      id="museum-mobile-look-hint"
      class="museum-mobile-look-hint"
      aria-hidden="true"
    >
      <span class="museum-mobile-look-icon">↔</span>
      <span>SWIPE TO LOOK</span>
    </div>

    <div
      id="museum-mobile-quick-guide"
      class="museum-mobile-quick-guide"
      aria-hidden="true"
    >
      <span>LEFT THUMB · MOVE</span>
      <span>RIGHT SIDE · LOOK</span>
      <span>TAP OBJECTS · OPEN</span>
    </div>
  `;

  document.body.appendChild(
    controlsRoot
  );

  joystickZone =
    document.getElementById(
      "museum-mobile-joystick"
    );

  joystickThumb =
    document.getElementById(
      "museum-mobile-joystick-thumb"
    );
}

// =====================================================
// JOYSTICK INPUT
// =====================================================

function bindJoystick() {
  if (!joystickZone) {
    return;
  }

  joystickZone.addEventListener(
    "pointerdown",
    handleJoystickStart
  );

  joystickZone.addEventListener(
    "pointermove",
    handleJoystickMove
  );

  joystickZone.addEventListener(
    "pointerup",
    handleJoystickEnd
  );

  joystickZone.addEventListener(
    "pointercancel",
    handleJoystickEnd
  );

  joystickZone.addEventListener(
    "lostpointercapture",
    handleJoystickEnd
  );

  joystickZone.addEventListener(
    "contextmenu",
    event => {
      event.preventDefault();
      event.stopPropagation();
    }
  );
}

function handleJoystickStart(event) {
  if (controlsAreHidden) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  activePointerId =
    event.pointerId;

  joystickZone.setPointerCapture(
    event.pointerId
  );

  joystickZone.classList.add(
    "is-active"
  );

  updateJoystickFromPointer(event);
}

function handleJoystickMove(event) {
  if (
    activePointerId === null ||
    event.pointerId !== activePointerId
  ) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  updateJoystickFromPointer(event);
}

function handleJoystickEnd(event) {
  if (
    activePointerId !== null &&
    event.pointerId !== undefined &&
    event.pointerId !== activePointerId
  ) {
    return;
  }

  event?.preventDefault?.();
  event?.stopPropagation?.();

  activePointerId = null;

  joystickZone?.classList.remove(
    "is-active"
  );

  resetJoystick();
}

function updateJoystickFromPointer(event) {
  const bounds =
    joystickZone.getBoundingClientRect();

  const centerX =
    bounds.left + bounds.width / 2;

  const centerY =
    bounds.top + bounds.height / 2;

  let deltaX =
    event.clientX - centerX;

  let deltaY =
    event.clientY - centerY;

  const distance =
    Math.hypot(deltaX, deltaY);

  if (distance > JOYSTICK_RADIUS) {
    const scale =
      JOYSTICK_RADIUS / distance;

    deltaX *= scale;
    deltaY *= scale;
  }

  const normalizedX =
    applyDeadZone(
      deltaX / JOYSTICK_RADIUS
    );

  const normalizedY =
    applyDeadZone(
      deltaY / JOYSTICK_RADIUS
    );

  joystickThumb.style.transform =
    `translate(${deltaX}px, ${deltaY}px)`;

  updateMovementKeys(
    normalizedX,
    normalizedY
  );
}

function applyDeadZone(value) {
  if (Math.abs(value) < DEAD_ZONE) {
    return 0;
  }

  const sign =
    Math.sign(value);

  return sign *
    (
      Math.abs(value) - DEAD_ZONE
    ) /
    (1 - DEAD_ZONE);
}

function updateMovementKeys(
  horizontal,
  vertical
) {
  setVirtualKey(
    "KeyW",
    vertical < -KEY_THRESHOLD
  );

  setVirtualKey(
    "KeyS",
    vertical > KEY_THRESHOLD
  );

  setVirtualKey(
    "KeyA",
    horizontal < -KEY_THRESHOLD
  );

  setVirtualKey(
    "KeyD",
    horizontal > KEY_THRESHOLD
  );
}

function setVirtualKey(
  code,
  shouldBePressed
) {
  const isPressed =
    activeKeys.has(code);

  if (
    shouldBePressed === isPressed
  ) {
    return;
  }

  if (shouldBePressed) {
    activeKeys.add(code);
    dispatchVirtualKey(
      "keydown",
      code
    );
  } else {
    activeKeys.delete(code);
    dispatchVirtualKey(
      "keyup",
      code
    );
  }
}

function dispatchVirtualKey(
  type,
  code
) {
  window.dispatchEvent(
    new KeyboardEvent(type, {
      code,
      key: KEY_MAP[code],
      bubbles: true,
      cancelable: true
    })
  );
}

function releaseAllMovementKeys() {
  for (const code of activeKeys) {
    dispatchVirtualKey(
      "keyup",
      code
    );
  }

  activeKeys.clear();
}

function resetJoystick() {
  releaseAllMovementKeys();

  if (joystickThumb) {
    joystickThumb.style.transform =
      "translate(0px, 0px)";
  }
}

// =====================================================
// VISIBILITY
// =====================================================

function bindVisibilityObservers() {
  const observer =
    new MutationObserver(
      updateControlsVisibility
    );

  observer.observe(
    document.body,
    {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
      subtree: true
    }
  );

  window.addEventListener(
    "museum-interaction-lock",
    updateControlsVisibility
  );

  window.addEventListener(
    "museum-interaction-unlock",
    updateControlsVisibility
  );

  window.addEventListener(
    "blur",
    resetJoystick
  );

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        resetJoystick();
      }
    }
  );

  window.addEventListener(
    "orientationchange",
    () => {
      resetJoystick();

      window.setTimeout(
        updateControlsVisibility,
        180
      );
    }
  );
}

function updateControlsVisibility() {
  if (!controlsRoot) {
    return;
  }

  const shouldHide =
    Boolean(
      document.querySelector(
        [
          "#museum-onboarding.visible",
          "#museum-instructions.visible",
          "#ticket-menu.visible",
          "#artist-intro.is-visible",
          "#cinema-viewer.is-visible",
          "#sculpture-viewer.is-visible"
        ].join(",")
      )
    ) ||
    document.body.classList.contains(
      "artist-intro-open"
    ) ||
    document.body.classList.contains(
      "cinema-viewer-open"
    );

  controlsAreHidden =
    shouldHide;

  controlsRoot.classList.toggle(
    "is-visible",
    !shouldHide
  );

  controlsRoot.setAttribute(
    "aria-hidden",
    String(shouldHide)
  );

  if (shouldHide) {
    activePointerId = null;
    resetJoystick();
  } else {
    showTemporaryGuide();
  }
}

function showTemporaryGuide() {
  if (
    controlsRoot.dataset.guideShown ===
    "true"
  ) {
    return;
  }

  controlsRoot.dataset.guideShown =
    "true";

  controlsRoot.classList.add(
    "show-guide"
  );

  window.clearTimeout(
    guideTimer
  );

  guideTimer =
    window.setTimeout(
      () => {
        controlsRoot?.classList.remove(
          "show-guide"
        );
      },
      6500
    );
}

// =====================================================
// STYLES
// =====================================================

function createStyles() {
  if (
    document.getElementById(
      "museum-mobile-controls-styles"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "museum-mobile-controls-styles";

  style.textContent = `
    #museum-mobile-controls {
      position: fixed;
      inset: 0;
      z-index: 8600;

      opacity: 0;
      visibility: hidden;
      pointer-events: none;

      transition:
        opacity 0.24s ease,
        visibility 0.24s ease;
    }

    #museum-mobile-controls.is-visible {
      opacity: 1;
      visibility: visible;
    }

    .museum-mobile-joystick {
      position: absolute;

      left: max(
        20px,
        env(safe-area-inset-left)
      );

      bottom: max(
        24px,
        calc(env(safe-area-inset-bottom) + 18px)
      );

      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      width: 128px;
      height: 151px;

      pointer-events: auto;
      touch-action: none;
      -webkit-user-select: none;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    .museum-mobile-joystick-ring {
      position: relative;

      width: 124px;
      height: 124px;

      border:
        1px solid
        rgba(255, 255, 255, 0.36);

      border-radius: 50%;

      background:
        radial-gradient(
          circle at 50% 45%,
          rgba(255, 255, 255, 0.12),
          rgba(8, 10, 14, 0.5) 58%,
          rgba(3, 4, 6, 0.68)
        );

      box-shadow:
        inset 0 0 0 9px
        rgba(255, 255, 255, 0.025),
        0 14px 36px
        rgba(0, 0, 0, 0.32);

      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);

      transition:
        transform 0.16s ease,
        border-color 0.16s ease,
        background 0.16s ease;
    }

    .museum-mobile-joystick.is-active
    .museum-mobile-joystick-ring {
      transform: scale(1.035);

      border-color:
        rgba(255, 255, 255, 0.62);

      background:
        radial-gradient(
          circle at 50% 45%,
          rgba(255, 255, 255, 0.2),
          rgba(8, 10, 14, 0.58) 58%,
          rgba(3, 4, 6, 0.76)
        );
    }

    .museum-mobile-joystick-thumb {
      position: absolute;
      left: 50%;
      top: 50%;

      width: 54px;
      height: 54px;

      margin-left: -27px;
      margin-top: -27px;

      border:
        1px solid
        rgba(255, 255, 255, 0.72);

      border-radius: 50%;

      background:
        radial-gradient(
          circle at 38% 32%,
          rgba(255, 255, 255, 0.82),
          rgba(205, 212, 224, 0.42) 26%,
          rgba(25, 29, 37, 0.76) 70%
        );

      box-shadow:
        0 6px 18px
        rgba(0, 0, 0, 0.42),
        inset 0 0 12px
        rgba(255, 255, 255, 0.14);

      pointer-events: none;

      transition:
        box-shadow 0.16s ease;

      will-change: transform;
    }

    .museum-mobile-joystick.is-active
    .museum-mobile-joystick-thumb {
      box-shadow:
        0 8px 24px
        rgba(0, 0, 0, 0.54),
        0 0 20px
        rgba(255, 255, 255, 0.12),
        inset 0 0 13px
        rgba(255, 255, 255, 0.2);
    }

    .museum-mobile-joystick-arrow {
      position: absolute;

      color:
        rgba(255, 255, 255, 0.34);

      font-size: 12px;
      line-height: 1;

      pointer-events: none;
    }

    .museum-mobile-joystick-arrow--up {
      top: 7px;
      left: 50%;
      transform: translateX(-50%);
    }

    .museum-mobile-joystick-arrow--right {
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
    }

    .museum-mobile-joystick-arrow--down {
      bottom: 7px;
      left: 50%;
      transform: translateX(-50%);
    }

    .museum-mobile-joystick-arrow--left {
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
    }

    .museum-mobile-joystick-label {
      color:
        rgba(255, 255, 255, 0.7);

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.24em;

      text-shadow:
        0 2px 10px
        rgba(0, 0, 0, 0.8);

      pointer-events: none;
    }

    .museum-mobile-look-hint {
      position: absolute;

      right: max(
        22px,
        env(safe-area-inset-right)
      );

      top: 50%;

      display: flex;
      align-items: center;
      gap: 9px;

      padding: 10px 13px;

      color:
        rgba(255, 255, 255, 0.8);

      background:
        rgba(4, 5, 8, 0.42);

      border:
        1px solid
        rgba(255, 255, 255, 0.2);

      border-radius: 999px;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.15em;

      opacity: 0;
      transform:
        translateY(-50%)
        translateX(8px);

      pointer-events: none;

      backdrop-filter: blur(7px);
      -webkit-backdrop-filter: blur(7px);

      transition:
        opacity 0.4s ease,
        transform 0.4s ease;
    }

    .museum-mobile-look-icon {
      font-size: 20px;
      font-weight: 300;
      line-height: 1;

      animation:
        museumMobileLookMove
        0.9s ease-in-out
        infinite alternate;
    }

    .museum-mobile-quick-guide {
      position: absolute;

      left: 50%;
      top: max(
        18px,
        calc(env(safe-area-inset-top) + 10px)
      );

      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 7px 14px;

      width: min(94vw, 560px);

      padding: 11px 14px;

      color:
        rgba(255, 255, 255, 0.86);

      background:
        rgba(4, 5, 8, 0.54);

      border:
        1px solid
        rgba(255, 255, 255, 0.18);

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      font-size: 8px;
      font-weight: 600;
      letter-spacing: 0.13em;

      opacity: 0;

      transform:
        translate(-50%, -8px);

      pointer-events: none;

      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);

      transition:
        opacity 0.4s ease,
        transform 0.4s ease;
    }

    #museum-mobile-controls.show-guide
    .museum-mobile-look-hint {
      opacity: 1;

      transform:
        translateY(-50%)
        translateX(0);
    }

    #museum-mobile-controls.show-guide
    .museum-mobile-quick-guide {
      opacity: 1;

      transform:
        translate(-50%, 0);
    }

    @keyframes museumMobileLookMove {
      from {
        transform: translateX(-4px);
      }

      to {
        transform: translateX(4px);
      }
    }

    @media (orientation: landscape) {
      .museum-mobile-joystick {
        left: max(
          15px,
          env(safe-area-inset-left)
        );

        bottom: max(
          12px,
          calc(env(safe-area-inset-bottom) + 8px)
        );

        width: 112px;
        height: 130px;
      }

      .museum-mobile-joystick-ring {
        width: 106px;
        height: 106px;
      }

      .museum-mobile-look-hint {
        right: max(
          16px,
          env(safe-area-inset-right)
        );
      }
    }

    @media (pointer: fine) {
      #museum-mobile-controls {
        display: none !important;
      }
    }
  `;

  document.head.appendChild(style);
}