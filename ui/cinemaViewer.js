let viewer = null;
let viewerPanel = null;
let isOpen = false;

export function setupCinemaViewer() {
  viewer =
    document.querySelector(
      "#cinema-viewer"
    );

  viewerPanel =
    document.querySelector(
      ".cinema-viewer-screen"
    );

  const closeButton =
    document.querySelector(
      "#cinema-viewer-close"
    );

  if (!viewer) {
    console.error(
      "Cinema viewer HTML was not found."
    );

    return;
  }

  closeButton?.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();

      closeCinemaViewer();
    }
  );

  viewer.addEventListener(
    "click",
    (event) => {
      if (
        event.target === viewer
      ) {
        closeCinemaViewer();
      }
    }
  );

  window.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape" &&
        isOpen
      ) {
        closeCinemaViewer();
      }
    }
  );
}

export function openCinemaViewer() {
  if (!viewer) {
    return;
  }

  isOpen = true;

  viewer.classList.add(
    "visible"
  );

  /*
    Просим браузер открыть просмотр
    в настоящем полноэкранном режиме.

    Если Safari не разрешит Fullscreen API,
    CSS-окно всё равно займёт весь экран.
  */

  viewerPanel
    ?.requestFullscreen?.()
    .catch(() => {});
}

export function closeCinemaViewer() {
  if (!viewer) {
    return;
  }

  isOpen = false;

  viewer.classList.remove(
    "visible"
  );

  if (document.fullscreenElement) {
    document
      .exitFullscreen?.()
      .catch(() => {});
  }
}

export function isCinemaViewerOpen() {
  return isOpen;
}