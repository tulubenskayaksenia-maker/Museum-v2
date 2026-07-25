// =====================================================
// CINEMA VIEWER
// ui/cinemaViewer.js
// =====================================================

let cinemaRoot = null;
let cinemaVideo = null;

let currentFilm = {
  title: "HIM",
  artist: "Asaf Tal",
  year: "2026",

  warningTitle: "18+",

  warningText:
    `This film contains disturbing imagery and themes
    that may not be suitable for all viewers.
    Viewer discretion is advised.`,

  videoUrl: ""
};

let currentScreen = "warning";
let cinemaIsOpen = false;

// =====================================================
// CREATE
// =====================================================

export function setupCinemaViewer() {
  const existingViewer =
    document.getElementById(
      "cinema-viewer"
    );

  if (existingViewer) {
    cinemaRoot = existingViewer;

    cinemaVideo =
      document.getElementById(
        "cinema-video"
      );

    updateFilm();

    return;
  }

  cinemaRoot =
    document.createElement("div");

  cinemaRoot.id =
    "cinema-viewer";

  cinemaRoot.className =
    "cinema-viewer";

  cinemaRoot.hidden = true;

  cinemaRoot.innerHTML = `
    <div
      class="cinema-viewer__backdrop"
      data-cinema-close
    ></div>

    <div class="cinema-viewer__panel">

      <!-- ==========================================
           CONTENT WARNING
      =========================================== -->

      <section
        id="cinema-screen-warning"
        class="cinema-screen"
      >
        <button
          id="cinema-warning-close"
          class="cinema-close"
          type="button"
          aria-label="Close content warning"
        >
          ×
        </button>

        <p class="cinema-eyebrow">
          CONTENT WARNING
        </p>

        <h1
          id="cinema-warning-title"
          class="cinema-title"
        >
          18+
        </h1>

        <p
          id="cinema-warning-text"
          class="cinema-description"
        ></p>

        <div class="cinema-actions">
          <button
            id="cinema-watch"
            class="
              cinema-button
              cinema-button--main
            "
            type="button"
          >
            WATCH FILM
          </button>

          <button
            id="cinema-return"
            class="
              cinema-button
              cinema-button--secondary
            "
            type="button"
          >
            RETURN TO CINEMA ROOM
          </button>
        </div>
      </section>

      <!-- ==========================================
           PLAYER
      =========================================== -->

      <section
        id="cinema-screen-player"
        class="
          cinema-screen
          cinema-screen--player
        "
        hidden
      >
        <button
          id="cinema-player-close"
          class="
            cinema-close
            cinema-close--player
          "
          type="button"
          aria-label="Close film"
        >
          ×
        </button>

        <video
          id="cinema-video"
          class="cinema-video"
          playsinline
          controls
          preload="metadata"
          hidden
        ></video>

        <div
          id="cinema-placeholder"
          class="cinema-placeholder"
          hidden
        >
          <p class="cinema-eyebrow">
            SCREENING ROOM
          </p>

          <h2 class="cinema-subtitle">
            FILM UNAVAILABLE
          </h2>

          <p class="cinema-description">
            The video file could not be loaded.
          </p>

          <button
            id="cinema-placeholder-return"
            class="
              cinema-button
              cinema-button--secondary
            "
            type="button"
          >
            RETURN TO CINEMA ROOM
          </button>
        </div>
      </section>

    </div>
  `;

  document.body.appendChild(
    cinemaRoot
  );

  cinemaVideo =
    document.getElementById(
      "cinema-video"
    );

  bindCinemaEvents();
  updateFilm();
  showScreen("warning");
}

// =====================================================
// EVENTS
// =====================================================

function bindCinemaEvents() {
  document
    .getElementById(
      "cinema-warning-close"
    )
    ?.addEventListener(
      "click",
      closeCinemaViewer
    );

  document
    .getElementById(
      "cinema-return"
    )
    ?.addEventListener(
      "click",
      closeCinemaViewer
    );

  document
    .getElementById(
      "cinema-watch"
    )
    ?.addEventListener(
      "click",
      openPlayer
    );

  document
    .getElementById(
      "cinema-player-close"
    )
    ?.addEventListener(
      "click",
      closeCinemaViewer
    );

  document
    .getElementById(
      "cinema-placeholder-return"
    )
    ?.addEventListener(
      "click",
      closeCinemaViewer
    );

  cinemaRoot?.addEventListener(
    "click",
    event => {
      const backdrop =
        event.target.closest?.(
          "[data-cinema-close]"
        );

      if (backdrop) {
        closeCinemaViewer();
      }
    }
  );

  cinemaVideo?.addEventListener(
    "ended",
    closeCinemaViewer
  );

  cinemaVideo?.addEventListener(
    "error",
    showVideoError
  );

  document.addEventListener(
    "keydown",
    handleKeyboard
  );

  document.addEventListener(
    "fullscreenchange",
    handleFullscreenChange
  );
}

// =====================================================
// OPEN / CLOSE
// =====================================================

export function openCinemaViewer() {
  if (!cinemaRoot) {
    setupCinemaViewer();
  }

  if (!cinemaRoot) {
    console.error(
      "Cinema viewer was not created."
    );

    return;
  }

  cinemaIsOpen = true;

  stopFilm();
  showScreen("warning");

  cinemaRoot.hidden = false;

  requestAnimationFrame(() => {
    cinemaRoot.classList.add(
      "is-visible"
    );
  });

  document.body.classList.add(
    "cinema-viewer-open"
  );

  lockMuseumInteraction();
}

export function closeCinemaViewer() {
  if (
    !cinemaRoot ||
    !cinemaIsOpen
  ) {
    return;
  }

  cinemaIsOpen = false;

  stopFilm();

  cinemaRoot.classList.remove(
    "is-visible"
  );

  document.body.classList.remove(
    "cinema-viewer-open"
  );

  unlockMuseumInteraction();

  leaveFullscreen();

  window.setTimeout(() => {
    if (
      cinemaRoot &&
      !cinemaIsOpen
    ) {
      cinemaRoot.hidden = true;
      showScreen("warning");
    }
  }, 220);
}

export function isCinemaViewerOpen() {
  return cinemaIsOpen;
}

// =====================================================
// SCREENS
// =====================================================

function showScreen(screenName) {
  if (!cinemaRoot) {
    return;
  }

  currentScreen = screenName;

  const warningScreen =
    document.getElementById(
      "cinema-screen-warning"
    );

  const playerScreen =
    document.getElementById(
      "cinema-screen-player"
    );

  if (warningScreen) {
    warningScreen.hidden =
      screenName !== "warning";
  }

  if (playerScreen) {
    playerScreen.hidden =
      screenName !== "player";
  }

  window.setTimeout(() => {
    if (screenName === "warning") {
      document
        .getElementById(
          "cinema-watch"
        )
        ?.focus();
    }

    if (screenName === "player") {
      document
        .getElementById(
          "cinema-player-close"
        )
        ?.focus();
    }
  }, 60);
}

// =====================================================
// PLAYER
// =====================================================

async function openPlayer() {
  if (!cinemaVideo) {
    return;
  }

  showScreen("player");
  updateFilm();

  const playerScreen =
    document.getElementById(
      "cinema-screen-player"
    );

  try {
    if (
      playerScreen &&
      !document.fullscreenElement
    ) {
      await playerScreen.requestFullscreen();
    }
  } catch (error) {
    console.warn(
      "Fullscreen is unavailable:",
      error
    );
  }

  if (!currentFilm.videoUrl) {
    showVideoError();

    return;
  }

  try {
    cinemaVideo.currentTime = 0;

    await cinemaVideo.play();
  } catch (error) {
    console.warn(
      "Video could not start:",
      error
    );

    showVideoError();
  }
}

function stopFilm() {
  if (!cinemaVideo) {
    return;
  }

  cinemaVideo.pause();

  try {
    cinemaVideo.currentTime = 0;
  } catch (error) {
    console.warn(
      "Video time could not be reset:",
      error
    );
  }
}

function showVideoError() {
  const placeholder =
    document.getElementById(
      "cinema-placeholder"
    );

  if (cinemaVideo) {
    cinemaVideo.hidden = true;
  }

  if (placeholder) {
    placeholder.hidden = false;
  }
}

// =====================================================
// FULLSCREEN
// =====================================================

function leaveFullscreen() {
  if (!document.fullscreenElement) {
    return;
  }

  document
    .exitFullscreen()
    .catch(() => {});
}

function handleFullscreenChange() {
  if (
    cinemaIsOpen &&
    currentScreen === "player" &&
    !document.fullscreenElement
  ) {
    closeCinemaViewer();
  }
}

// =====================================================
// FILM DATA
// =====================================================

export function setCinemaFilm({
  title = "HIM",
  artist = "Asaf Tal",
  year = "2026",

  warningTitle = "18+",

  warningText =
    `This film contains disturbing imagery and themes
    that may not be suitable for all viewers.
    Viewer discretion is advised.`,

  videoUrl = ""
} = {}) {
  currentFilm = {
    title,
    artist,
    year,
    warningTitle,
    warningText,
    videoUrl
  };

  updateFilm();
}

function updateFilm() {
  const warningTitle =
    document.getElementById(
      "cinema-warning-title"
    );

  const warningText =
    document.getElementById(
      "cinema-warning-text"
    );

  if (warningTitle) {
    warningTitle.textContent =
      currentFilm.warningTitle;
  }

  if (warningText) {
    warningText.textContent =
      currentFilm.warningText;
  }

  if (!cinemaVideo) {
    return;
  }

  const placeholder =
    document.getElementById(
      "cinema-placeholder"
    );

  if (placeholder) {
    placeholder.hidden = true;
  }

  if (currentFilm.videoUrl) {
    if (
      cinemaVideo.getAttribute(
        "src"
      ) !== currentFilm.videoUrl
    ) {
      cinemaVideo.src =
        currentFilm.videoUrl;

      cinemaVideo.load();
    }

    cinemaVideo.hidden = false;

    return;
  }

  cinemaVideo.pause();
  cinemaVideo.removeAttribute(
    "src"
  );
  cinemaVideo.load();
  cinemaVideo.hidden = true;

  if (placeholder) {
    placeholder.hidden = false;
  }
}

// =====================================================
// KEYBOARD
// =====================================================

function handleKeyboard(event) {
  if (!cinemaIsOpen) {
    return;
  }

  const museumKeys = [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "w",
    "W",
    "a",
    "A",
    "s",
    "S",
    "d",
    "D",
    " "
  ];

  if (
    museumKeys.includes(
      event.key
    )
  ) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (event.key !== "Escape") {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  closeCinemaViewer();
}

// =====================================================
// MUSEUM INTERACTION
// =====================================================

function lockMuseumInteraction() {
  window.dispatchEvent(
    new CustomEvent(
      "museum-interaction-lock",
      {
        detail: {
          source: "cinema"
        }
      }
    )
  );
}

function unlockMuseumInteraction() {
  window.dispatchEvent(
    new CustomEvent(
      "museum-interaction-unlock",
      {
        detail: {
          source: "cinema"
        }
      }
    )
  );
}