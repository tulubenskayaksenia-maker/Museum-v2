// =====================================================
// CINEMA VIEWER
// ui/cinemaViewer.js
// =====================================================

let cinemaRoot = null;
let cinemaVideo = null;

let currentFilm = {
  title: "UNTITLED FILM",
  artist: "",
  year: "",
  description: "",
  videoUrl: ""
};

let currentScreen = "menu";
let cinemaIsOpen = false;

// =====================================================
// CREATE
// =====================================================

export function setupCinemaViewer() {
  if (document.getElementById("cinema-viewer")) {
    cinemaRoot = document.getElementById("cinema-viewer");
    cinemaVideo = document.getElementById("cinema-video");
    return;
  }

  cinemaRoot = document.createElement("div");
  cinemaRoot.id = "cinema-viewer";
  cinemaRoot.className = "cinema-viewer";
  cinemaRoot.hidden = true;

  cinemaRoot.innerHTML = `
    <div class="cinema-viewer__backdrop"></div>

    <div class="cinema-viewer__panel">

      <!-- MAIN MENU -->
      <section
        id="cinema-screen-menu"
        class="cinema-screen"
      >
        <button
          id="cinema-close"
          class="cinema-close"
          type="button"
          aria-label="Close cinema"
        >
          ×
        </button>

        <p class="cinema-eyebrow">
          SCREENING ROOM
        </p>

        <h1 class="cinema-title">
          CINEMA
        </h1>

        <p class="cinema-description">
          Enter the screening room to watch the film.
        </p>

        <div class="cinema-actions">
          <button
            id="cinema-watch"
            class="cinema-button cinema-button--main"
            type="button"
          >
            WATCH FILM
          </button>

          <button
            id="cinema-return"
            class="cinema-button cinema-button--secondary"
            type="button"
          >
            RETURN TO MUSEUM
          </button>
        </div>
      </section>

      <!-- FULLSCREEN CONFIRMATION -->
      <section
        id="cinema-screen-confirmation"
        class="cinema-screen"
        hidden
      >
        <button
          id="cinema-confirmation-close"
          class="cinema-close"
          type="button"
          aria-label="Return to cinema menu"
        >
          ×
        </button>

        <p class="cinema-eyebrow">
          FULLSCREEN VIEWING
        </p>

        <h2 class="cinema-subtitle">
          THE FILM WILL OPEN<br>
          IN FULLSCREEN
        </h2>

        <p class="cinema-description">
          Press Escape at any time to leave fullscreen.
        </p>

        <div class="cinema-actions">
          <button
            id="cinema-enter-fullscreen"
            class="cinema-button cinema-button--main"
            type="button"
          >
            ENTER FULLSCREEN
          </button>

          <button
            id="cinema-confirmation-back"
            class="cinema-button cinema-button--secondary"
            type="button"
          >
            BACK
          </button>
        </div>
      </section>

      <!-- PLAYER -->
      <section
        id="cinema-screen-player"
        class="cinema-screen cinema-screen--player"
        hidden
      >
        <button
          id="cinema-player-close"
          class="cinema-close cinema-close--player"
          type="button"
          aria-label="Close film"
        >
          ×
        </button>

        <div
          id="cinema-placeholder"
          class="cinema-placeholder"
        >
          <p class="cinema-eyebrow">
            SCREENING ROOM
          </p>

          <h2 class="cinema-subtitle">
            FILM WILL BE ADDED SOON
          </h2>

          <p class="cinema-description">
            The screening programme is currently being prepared.
          </p>

          <button
            id="cinema-placeholder-return"
            class="cinema-button cinema-button--secondary"
            type="button"
          >
            RETURN
          </button>
        </div>

        <video
          id="cinema-video"
          class="cinema-video"
          playsinline
          controls
          preload="metadata"
          hidden
        ></video>
      </section>

    </div>
  `;

  document.body.appendChild(cinemaRoot);

  cinemaVideo = document.getElementById("cinema-video");

  bindCinemaEvents();
  updateFilm();
  showScreen("menu");
}

// =====================================================
// EVENTS
// =====================================================

function bindCinemaEvents() {
  const closeButton =
    document.getElementById("cinema-close");

  const returnButton =
    document.getElementById("cinema-return");

  const watchButton =
    document.getElementById("cinema-watch");

  const confirmationCloseButton =
    document.getElementById("cinema-confirmation-close");

  const confirmationBackButton =
    document.getElementById("cinema-confirmation-back");

  const fullscreenButton =
    document.getElementById("cinema-enter-fullscreen");

  const playerCloseButton =
    document.getElementById("cinema-player-close");

  const placeholderReturnButton =
    document.getElementById("cinema-placeholder-return");

  closeButton?.addEventListener(
    "click",
    closeCinemaViewer
  );

  returnButton?.addEventListener(
    "click",
    closeCinemaViewer
  );

  watchButton?.addEventListener(
    "click",
    () => {
      showScreen("confirmation");
    }
  );

  confirmationCloseButton?.addEventListener(
    "click",
    () => {
      showScreen("menu");
    }
  );

  confirmationBackButton?.addEventListener(
    "click",
    () => {
      showScreen("menu");
    }
  );

  fullscreenButton?.addEventListener(
    "click",
    openPlayer
  );

  playerCloseButton?.addEventListener(
    "click",
    closePlayer
  );

  placeholderReturnButton?.addEventListener(
    "click",
    closePlayer
  );

  cinemaRoot?.addEventListener(
    "click",
    event => {
      if (
        event.target.classList.contains(
          "cinema-viewer__backdrop"
        )
      ) {
        closeCinemaViewer();
      }
    }
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
    console.error("Cinema viewer was not created.");
    return;
  }

  cinemaIsOpen = true;

  cinemaRoot.hidden = false;

  requestAnimationFrame(() => {
    cinemaRoot.classList.add("is-visible");
  });

  document.body.classList.add(
    "cinema-viewer-open"
  );

  showScreen("menu");
  lockMuseumInteraction();
}

export function closeCinemaViewer() {
  if (!cinemaRoot) {
    return;
  }

  cinemaIsOpen = false;

  stopFilm();
  leaveFullscreen();

  cinemaRoot.classList.remove("is-visible");

  document.body.classList.remove(
    "cinema-viewer-open"
  );

  window.setTimeout(() => {
    if (!cinemaIsOpen && cinemaRoot) {
      cinemaRoot.hidden = true;
    }
  }, 250);

  showScreen("menu");
  unlockMuseumInteraction();
}

// =====================================================
// SCREENS
// =====================================================

function showScreen(screenName) {
  if (!cinemaRoot) {
    return;
  }

  currentScreen = screenName;

  const menuScreen =
    document.getElementById("cinema-screen-menu");

  const confirmationScreen =
    document.getElementById(
      "cinema-screen-confirmation"
    );

  const playerScreen =
    document.getElementById(
      "cinema-screen-player"
    );

  if (menuScreen) {
    menuScreen.hidden =
      screenName !== "menu";
  }

  if (confirmationScreen) {
    confirmationScreen.hidden =
      screenName !== "confirmation";
  }

  if (playerScreen) {
    playerScreen.hidden =
      screenName !== "player";
  }

  window.setTimeout(() => {
    focusCurrentScreen(screenName);
  }, 50);
}

function focusCurrentScreen(screenName) {
  if (screenName === "menu") {
    document
      .getElementById("cinema-watch")
      ?.focus();

    return;
  }

  if (screenName === "confirmation") {
    document
      .getElementById(
        "cinema-enter-fullscreen"
      )
      ?.focus();

    return;
  }

  if (screenName === "player") {
    document
      .getElementById("cinema-player-close")
      ?.focus();
  }
}

// =====================================================
// PLAYER
// =====================================================

async function openPlayer() {
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

  if (
    currentFilm.videoUrl &&
    cinemaVideo
  ) {
    try {
      cinemaVideo.currentTime = 0;
      await cinemaVideo.play();
    } catch (error) {
      console.warn(
        "Video could not start:",
        error
      );
    }
  }
}

function closePlayer() {
  stopFilm();
  leaveFullscreen();
  showScreen("menu");
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

// =====================================================
// FULLSCREEN
// =====================================================

function leaveFullscreen() {
  if (!document.fullscreenElement) {
    return;
  }

  document.exitFullscreen().catch(() => {});
}

function handleFullscreenChange() {
  if (
    currentScreen === "player" &&
    !document.fullscreenElement
  ) {
    stopFilm();
    showScreen("menu");
  }
}

// =====================================================
// FILM DATA
// =====================================================

export function setCinemaFilm({
  title = "UNTITLED FILM",
  artist = "",
  year = "",
  description = "",
  videoUrl = ""
} = {}) {
  currentFilm = {
    title,
    artist,
    year,
    description,
    videoUrl
  };

  updateFilm();
}

function updateFilm() {
  if (!cinemaVideo) {
    return;
  }

  const placeholder =
    document.getElementById(
      "cinema-placeholder"
    );

  if (currentFilm.videoUrl) {
    if (
      cinemaVideo.getAttribute("src") !==
      currentFilm.videoUrl
    ) {
      cinemaVideo.src =
        currentFilm.videoUrl;

      cinemaVideo.load();
    }

    cinemaVideo.hidden = false;

    if (placeholder) {
      placeholder.hidden = true;
    }

    return;
  }

  cinemaVideo.pause();
  cinemaVideo.removeAttribute("src");
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

  if (museumKeys.includes(event.key)) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (event.key !== "Escape") {
    return;
  }

  if (currentScreen === "player") {
    closePlayer();
    return;
  }

  if (currentScreen === "confirmation") {
    showScreen("menu");
    return;
  }

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