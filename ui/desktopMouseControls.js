// =====================================================
// DESKTOP MOUSE CONTROLS GUIDE
// ui/desktopMouseControls.js
// =====================================================

const isDesktopPointer =
  window.matchMedia("(pointer: fine)").matches;

let guideRoot = null;
let hideTimer = null;
let activeTimer = null;

const OVERLAY_SELECTORS = [
  "#museum-onboarding.visible",
  "#museum-instructions.visible",
  "#ticket-menu.visible",
  "#ticket-menu[aria-hidden='false']",
  "#artist-intro.is-visible",
  "#cinema-viewer.visible",
  "#cinema-viewer[aria-hidden='false']",
  "#sculpture-viewer.visible",
  "#sculpture-viewer[aria-hidden='false']"
];

// =====================================================
// PUBLIC SETUP
// =====================================================

export function setupDesktopMouseControls() {
  if (
    !isDesktopPointer ||
    document.getElementById(
      "museum-desktop-mouse-controls"
    )
  ) {
    return;
  }

  createStyles();
  createGuide();
  updateInstructionCopy();
  bindGuideEvents();
  bindInputFeedback();
  bindVisibilityObservers();

  updateVisibility();
}

// =====================================================
// CREATE GUIDE
// =====================================================

function createGuide() {
  guideRoot =
    document.createElement("aside");

  guideRoot.id =
    "museum-desktop-mouse-controls";

  guideRoot.setAttribute(
    "aria-label",
    "Mouse controls"
  );

  guideRoot.innerHTML = `
    <div class="museum-desktop-mouse-icon" aria-hidden="true">
      <span class="museum-desktop-mouse-left"></span>
      <span class="museum-desktop-mouse-right"></span>
      <span class="museum-desktop-mouse-wheel"></span>
    </div>

    <div class="museum-desktop-control-items">
      <div class="museum-desktop-control-item" data-mouse-action="look">
        <strong>MOVE MOUSE</strong>
        <span>LOOK — FULL TURN + NATURAL UP / DOWN</span>
      </div>

      <div class="museum-desktop-control-separator"></div>

      <div class="museum-desktop-control-item" data-mouse-action="forward">
        <strong>HOLD LEFT</strong>
        <span>WALK FORWARD — NO SIDEWAYS DRIFT</span>
      </div>

      <div class="museum-desktop-control-separator"></div>

      <div class="museum-desktop-control-item" data-mouse-action="backward">
        <strong>HOLD RIGHT</strong>
        <span>WALK BACKWARD</span>
      </div>

      <div class="museum-desktop-control-separator"></div>

      <div class="museum-desktop-control-item" data-mouse-action="open">
        <strong>CLICK OBJECT</strong>
        <span>OPEN</span>
      </div>

      <div class="museum-desktop-control-separator"></div>

      <div class="museum-desktop-control-item" data-mouse-action="zoom">
        <strong>SCROLL</strong>
        <span>ZOOM</span>
      </div>
    </div>

    <button
      class="museum-desktop-controls-close"
      type="button"
      aria-label="Hide mouse controls"
    >
      ×
    </button>
  `;

  document.body.appendChild(
    guideRoot
  );
}

function updateInstructionCopy() {
  const rows =
    document.querySelectorAll(
      ".museum-control-row"
    );

  rows.forEach(row => {
    const key =
      row.querySelector(
        ".museum-control-key"
      );

    const description =
      row.querySelector(
        ".museum-control-key + span"
      );

    const label =
      key?.textContent.trim();

    if (
      label === "HOLD LEFT BUTTON"
    ) {
      key.textContent =
        "HOLD LEFT";

      if (description) {
        description.textContent =
          "Walk forward in the direction you face. Turning changes heading without sideways drift";
      }
    }

    if (
      label === "RIGHT CLICK" ||
      label === "BACK BUTTON"
    ) {
      key.textContent =
        "HOLD RIGHT";

      if (description) {
        description.textContent =
          "Walk backward. On a Mac trackpad, hold a two-finger click";
      }
    }
  });
}

// =====================================================
// EVENTS
// =====================================================

function bindGuideEvents() {
  const closeButton =
    guideRoot?.querySelector(
      ".museum-desktop-controls-close"
    );

  closeButton?.addEventListener(
    "click",
    () => {
      guideRoot?.classList.add(
        "is-dismissed"
      );
    }
  );

  guideRoot?.addEventListener(
    "mouseenter",
    () => {
      window.clearTimeout(
        hideTimer
      );

      guideRoot.classList.remove(
        "is-compact"
      );
    }
  );

  guideRoot?.addEventListener(
    "mouseleave",
    scheduleCompactMode
  );
}

function bindInputFeedback() {
  window.addEventListener(
    "mousemove",
    () => {
      activateItem("look", 260);
    },
    {
      passive: true
    }
  );

  window.addEventListener(
    "mousedown",
    event => {
      if (
        event.button === 0 &&
        !event.ctrlKey
      ) {
        activateItem(
          "forward",
          520
        );
      }

      if (
        event.button === 2 ||
        (
          event.button === 0 &&
          event.ctrlKey
        )
      ) {
        activateItem(
          "backward",
          520
        );
      }
    },
    {
      passive: true
    }
  );

  window.addEventListener(
    "click",
    () => {
      activateItem("open", 520);
    },
    {
      passive: true
    }
  );

  window.addEventListener(
    "contextmenu",
    () => {
      activateItem(
        "backward",
        620
      );
    }
  );

  window.addEventListener(
    "wheel",
    () => {
      activateItem("zoom", 420);
    },
    {
      passive: true
    }
  );
}

function activateItem(
  action,
  duration = 420
) {
  if (
    !guideRoot ||
    guideRoot.classList.contains(
      "is-dismissed"
    )
  ) {
    return;
  }

  const items =
    guideRoot.querySelectorAll(
      "[data-mouse-action]"
    );

  items.forEach(item => {
    item.classList.toggle(
      "is-active",
      item.dataset.mouseAction ===
        action
    );
  });

  guideRoot.classList.remove(
    "is-compact"
  );

  window.clearTimeout(
    activeTimer
  );

  activeTimer =
    window.setTimeout(
      () => {
        items.forEach(item => {
          item.classList.remove(
            "is-active"
          );
        });

        scheduleCompactMode();
      },
      duration
    );
}

// =====================================================
// VISIBILITY
// =====================================================

function bindVisibilityObservers() {
  const observer =
    new MutationObserver(
      updateVisibility
    );

  [
    "museum-onboarding",
    "museum-instructions",
    "ticket-menu",
    "artist-intro",
    "cinema-viewer",
    "sculpture-viewer"
  ].forEach(id => {
    const element =
      document.getElementById(id);

    if (!element) {
      return;
    }

    observer.observe(
      element,
      {
        attributes: true,
        attributeFilter: [
          "class",
          "hidden",
          "aria-hidden"
        ]
      }
    );
  });

  window.addEventListener(
    "museum-interaction-lock",
    updateVisibility
  );

  window.addEventListener(
    "museum-interaction-unlock",
    updateVisibility
  );

  window.addEventListener(
    "resize",
    updateVisibility
  );
}

function updateVisibility() {
  if (!guideRoot) {
    return;
  }

  const overlayIsOpen =
    OVERLAY_SELECTORS.some(
      selector =>
        Boolean(
          document.querySelector(
            selector
          )
        )
    );

  guideRoot.classList.toggle(
    "is-visible",
    !overlayIsOpen
  );

  if (!overlayIsOpen) {
    window.clearTimeout(
      hideTimer
    );

    hideTimer =
      window.setTimeout(
        scheduleCompactMode,
        9000
      );
  }
}

function scheduleCompactMode() {
  if (!guideRoot) {
    return;
  }

  window.clearTimeout(
    hideTimer
  );

  hideTimer =
    window.setTimeout(
      () => {
        guideRoot?.classList.add(
          "is-compact"
        );
      },
      1800
    );
}

// =====================================================
// STYLES
// =====================================================

function createStyles() {
  if (
    document.getElementById(
      "museum-desktop-mouse-controls-styles"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "museum-desktop-mouse-controls-styles";

  style.textContent = `
    #museum-desktop-mouse-controls {
      position: fixed;
      left: 50%;
      bottom: max(18px, env(safe-area-inset-bottom));
      z-index: 8200;

      display: flex;
      align-items: center;
      gap: 15px;

      max-width: calc(100vw - 40px);
      padding: 11px 14px;

      border: 1px solid rgba(255, 255, 255, 0.28);
      background: rgba(5, 5, 5, 0.68);
      color: rgba(255, 255, 255, 0.94);

      font-family: Arial, Helvetica, sans-serif;

      opacity: 0;
      visibility: hidden;
      pointer-events: none;

      transform: translate(-50%, 14px);

      transition:
        opacity 0.3s ease,
        visibility 0.3s ease,
        transform 0.3s ease,
        background 0.2s ease,
        padding 0.28s ease;

      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    #museum-desktop-mouse-controls.is-visible:not(.is-dismissed) {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: translate(-50%, 0);
    }

    #museum-desktop-mouse-controls.is-dismissed {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .museum-desktop-mouse-icon {
      position: relative;
      flex: 0 0 auto;
      width: 28px;
      height: 42px;
      border: 1px solid rgba(255, 255, 255, 0.72);
      border-radius: 14px;
    }

    .museum-desktop-mouse-left,
    .museum-desktop-mouse-right {
      position: absolute;
      top: 0;
      width: 50%;
      height: 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.35);
    }

    .museum-desktop-mouse-left {
      left: 0;
      border-right: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 14px 0 0 0;
    }

    .museum-desktop-mouse-right {
      right: 0;
      border-radius: 0 14px 0 0;
    }

    .museum-desktop-mouse-wheel {
      position: absolute;
      left: 50%;
      top: 5px;
      width: 3px;
      height: 8px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.92);
      transform: translateX(-50%);
    }

    .museum-desktop-control-items {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .museum-desktop-control-item {
      display: grid;
      gap: 3px;
      white-space: nowrap;
      opacity: 0.65;
      transition:
        opacity 0.18s ease,
        transform 0.18s ease;
    }

    .museum-desktop-control-item strong {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.14em;
    }

    .museum-desktop-control-item span {
      font-size: 8px;
      letter-spacing: 0.17em;
      color: rgba(255, 255, 255, 0.62);
    }

    .museum-desktop-control-item.is-active {
      opacity: 1;
      transform: translateY(-2px);
    }

    .museum-desktop-control-item.is-active span {
      color: rgba(255, 255, 255, 0.95);
    }

    .museum-desktop-control-separator {
      width: 1px;
      height: 26px;
      background: rgba(255, 255, 255, 0.18);
    }

    .museum-desktop-controls-close {
      flex: 0 0 auto;
      width: 24px;
      height: 24px;
      padding: 0;
      border: 0;
      background: transparent;
      color: rgba(255, 255, 255, 0.64);
      font: inherit;
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
      transition: color 0.18s ease;
    }

    .museum-desktop-controls-close:hover {
      color: #ffffff;
    }

    #museum-desktop-mouse-controls.is-compact {
      gap: 9px;
      padding: 8px 11px;
      background: rgba(5, 5, 5, 0.5);
    }

    #museum-desktop-mouse-controls.is-compact
    .museum-desktop-control-item,
    #museum-desktop-mouse-controls.is-compact
    .museum-desktop-control-separator,
    #museum-desktop-mouse-controls.is-compact
    .museum-desktop-controls-close {
      display: none;
    }

    #museum-desktop-mouse-controls.is-compact::after {
      content: "HOLD LEFT + MOVE · FORWARD / STEER   HOLD RIGHT + MOVE · BACK / STEER";
      font-size: 8px;
      font-weight: 600;
      letter-spacing: 0.12em;
      white-space: nowrap;
      color: rgba(255, 255, 255, 0.82);
    }

    #museum-desktop-mouse-controls.is-compact
    .museum-desktop-mouse-icon {
      width: 22px;
      height: 32px;
      border-radius: 11px;
    }

    #museum-desktop-mouse-controls.is-compact
    .museum-desktop-mouse-left,
    #museum-desktop-mouse-controls.is-compact
    .museum-desktop-mouse-right {
      height: 12px;
    }

    @media (max-width: 1100px) and (pointer: fine) {
      #museum-desktop-mouse-controls {
        gap: 9px;
        padding: 9px 10px;
      }

      .museum-desktop-control-items {
        gap: 7px;
      }

      .museum-desktop-control-item strong {
        font-size: 7px;
      }

      .museum-desktop-control-item span {
        font-size: 6px;
      }
    }

    @media (pointer: coarse) {
      #museum-desktop-mouse-controls {
        display: none !important;
      }
    }
  `;

  document.head.appendChild(
    style
  );
}