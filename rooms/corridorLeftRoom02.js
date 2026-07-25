import {
  THREE,
  scene,
  camera,
  renderer
} from "../core/scene.js";

import {
  floorMaterial,
  wallMaterial
} from "../core/materials.js";

import {
  createArchPortal,
  createWallWithArchOpening
} from "../objects/arch.js";


// =====================================================
// CORRIDOR LEFT ROOM 02 — KSENIA TULUBENSKAYA
// =====================================================

const ROOM_ASSETS = {
  photo01: "./assets/artworks/room03/photo01.webp",
  photo02: "./assets/artworks/room03/photo02.webp",
  photo03: "./assets/artworks/room03/photo03.webp",
  film: new URL("../assets/videos/room03/film.mp4", import.meta.url).href
};



let roomRoot = null;
let screenHitArea = null;
let interactionInstalled = false;

let roomVideo = null;
let largeVideo = null;
let videoOverlay = null;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// =====================================================
// MAIN
// =====================================================

export function createCorridorLeftRoom02() {
  const room = new THREE.Group();

  room.name = "Corridor Left Room 02 — Ksenia Tulubenskaya";
  room.visible = false;
  roomRoot = room;

  createArchitecture(room);

  // Two photographs on the LEFT wall.
  createWallArtwork({
    parent: room,
    imageUrl: ROOM_ASSETS.photo01,
    wall: "left",
    position: new THREE.Vector3(-15.38, 5.3, -7.5),
    maxWidth: 7.2,
    maxHeight: 7.5
  });

  createWallArtwork({
    parent: room,
    imageUrl: ROOM_ASSETS.photo02,
    wall: "left",
    position: new THREE.Vector3(-15.38, 5.3, -22.5),
    maxWidth: 7.2,
    maxHeight: 7.5
  });

  // One large photograph on the RIGHT wall.
  createWallArtwork({
    parent: room,
    imageUrl: ROOM_ASSETS.photo03,
    wall: "right",
    position: new THREE.Vector3(15.38, 5.35, -4.5),
    maxWidth: 10.8,
    maxHeight: 8.4
  });

  // Freestanding electronic screen in the centre.
  createCentralScreen(room);

  installScreenInteraction();

  room.traverse(child => {
    if (!child.isMesh) return;

    child.castShadow = false;
    child.receiveShadow = true;
  });

  scene.add(room);
  return room;
}

export function updateCorridorLeftRoom02() {
  if (!roomRoot || !roomVideo) return;

  if (roomRoot.visible) {
    safePlay(roomVideo);
    return;
  }

  if (!roomVideo.paused) {
    roomVideo.pause();
  }

  if (
    videoOverlay &&
    videoOverlay.style.display === "flex"
  ) {
    closeLargeVideo();
  }

  renderer.domElement.style.cursor = "default";
}

// =====================================================
// ARCHITECTURE — SAME MATERIALS AND ARCH AS OTHER ROOMS
// =====================================================

function createArchitecture(parent) {
  const roomWidth = 32;
  const roomDepth = 46;
  const roomHeight = 12;

  const centerZ = -12;
  const backWallZ = -35;
  const entranceWallZ = 9.45;

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(roomWidth, 0.14, roomDepth),
    floorMaterial
  );

  floor.position.set(0, -0.07, centerZ);
  floor.receiveShadow = true;
  parent.add(floor);

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, roomHeight, roomDepth),
    wallMaterial
  );

  leftWall.position.set(-roomWidth / 2, roomHeight / 2, centerZ);
  parent.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, roomHeight, roomDepth),
    wallMaterial
  );

  rightWall.position.set(roomWidth / 2, roomHeight / 2, centerZ);
  parent.add(rightWall);

  // Solid far wall, exactly like the other corridor rooms.
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(roomWidth, roomHeight, 1.2),
    wallMaterial
  );

  backWall.position.set(0, roomHeight / 2, backWallZ);
  parent.add(backWall);

  // Entrance wall with the same arched opening used elsewhere.
  const entranceOpeningWidth = 4.3;
  const entranceOpeningHeight = 6.6;

  const entranceWall = createWallWithArchOpening({
    wallWidth: roomWidth,
    wallHeight: roomHeight,
    wallDepth: 0.8,
    openingWidth: entranceOpeningWidth,
    openingHeight: entranceOpeningHeight,
    material: wallMaterial
  });

  entranceWall.position.set(0, 0, entranceWallZ);
  parent.add(entranceWall);

  const returnDoor = createArchPortal({
    width: 5,
    height: 7.15,
    openingWidth: entranceOpeningWidth,
    openingHeight: entranceOpeningHeight,
    depth: 0.72,
    target: "corridor",
    showDarkOpening: false
  });

  returnDoor.position.set(0, 0, entranceWallZ - 0.45);
  returnDoor.rotation.y = Math.PI;
  parent.add(returnDoor);
}

// =====================================================
// PHOTOGRAPHS
// =====================================================

function createWallArtwork({
  parent,
  imageUrl,
  wall,
  position,
  maxWidth,
  maxHeight
}) {
  const artwork = new THREE.Group();
  artwork.name = `Ksenia artwork — ${wall}`;
  artwork.position.copy(position);

  if (wall === "left") artwork.rotation.y = Math.PI / 2;
  if (wall === "right") artwork.rotation.y = -Math.PI / 2;

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.72,
    metalness: 0.08
  });

  const initialWidth = maxWidth;
  const initialHeight = maxHeight;

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(
      initialWidth + 0.28,
      initialHeight + 0.28,
      0.14
    ),
    frameMaterial
  );

  artwork.add(frame);

  const photoMaterial = new THREE.MeshBasicMaterial({
    color: 0xe7e7e4,
    side: THREE.DoubleSide
  });

  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(initialWidth, initialHeight),
    photoMaterial
  );

  photo.position.z = 0.081;
  artwork.add(photo);
  parent.add(artwork);

  const loader = new THREE.TextureLoader();

  loader.load(
    imageUrl,
    texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const aspect = texture.image.width / texture.image.height;
      let width = maxWidth;
      let height = width / aspect;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspect;
      }

      photo.geometry.dispose();
      photo.geometry = new THREE.PlaneGeometry(width, height);

      frame.geometry.dispose();
      frame.geometry = new THREE.BoxGeometry(
        width + 0.28,
        height + 0.28,
        0.14
      );

      photo.material.map = texture;
      photo.material.color.set(0xffffff);
      photo.material.needsUpdate = true;
    },
    undefined,
    () => console.warn(`Artwork was not found: ${imageUrl}`)
  );
}

// =====================================================
// CENTRAL ELECTRONIC SCREEN INSTALLATION
// Same behavior as Victoria's room:
// the film plays on the room screen, and clicking it opens
// a large player immediately without warning screens.
// =====================================================

function createCentralScreen(parent) {
  const screen = new THREE.Group();
  screen.name = "Ksenia central film screen";
  screen.position.set(0, 0, -15);

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x080808,
    roughness: 0.7,
    metalness: 0.18
  });

  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x252629,
    roughness: 0.48,
    metalness: 0.72
  });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(11.8, 7.4, 0.52),
    bodyMaterial
  );

  body.position.y = 4.45;
  screen.add(body);

  // Video element used as the live texture inside the room.
  roomVideo = document.createElement("video");
  roomVideo.src = ROOM_ASSETS.film;
  roomVideo.loop = true;
  roomVideo.muted = true;
  roomVideo.autoplay = true;
  roomVideo.playsInline = true;
  roomVideo.preload = "auto";

  roomVideo.setAttribute("playsinline", "");
  roomVideo.setAttribute("webkit-playsinline", "");
  roomVideo.load();

  roomVideo.addEventListener("error", () => {
    console.warn(
      "Ksenia room video could not be loaded:",
      ROOM_ASSETS.film,
      roomVideo.error
    );
  });

  const videoTexture = new THREE.VideoTexture(roomVideo);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.generateMipmaps = false;

  if (
    THREE.SRGBColorSpace &&
    "colorSpace" in videoTexture
  ) {
    videoTexture.colorSpace = THREE.SRGBColorSpace;
  }

  const surface = new THREE.Mesh(
    new THREE.PlaneGeometry(10.85, 6.1),
    new THREE.MeshBasicMaterial({
      map: videoTexture,
      color: 0xffffff,
      side: THREE.DoubleSide,
      toneMapped: false
    })
  );

  surface.position.set(0, 4.48, 0.271);
  surface.name = "Ksenia clickable film screen";
  screen.add(surface);
  screenHitArea = surface;

  const supportGeometry = new THREE.BoxGeometry(
    0.28,
    1.45,
    0.38
  );

  [-4.15, 4.15].forEach(x => {
    const support = new THREE.Mesh(
      supportGeometry,
      metalMaterial
    );

    support.position.set(x, 0.73, 0);
    screen.add(support);
  });

  const leftFoot = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.16, 1.65),
    metalMaterial
  );

  leftFoot.position.set(-4.15, 0.08, 0);
  screen.add(leftFoot);

  const rightFoot = leftFoot.clone();
  rightFoot.position.x = 4.15;
  screen.add(rightFoot);

  const powerLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0x63ff87
    })
  );

  powerLight.position.set(5.17, 1.18, 0.29);
  screen.add(powerLight);

  parent.add(screen);

  createPowerCable(parent);
  createWallOutlet(parent);
  createLargeVideoOverlay();

  roomVideo.addEventListener(
    "loadeddata",
    () => safePlay(roomVideo),
    { once: true }
  );

  safePlay(roomVideo);

  window.addEventListener(
    "pointerdown",
    () => safePlay(roomVideo),
    { once: true }
  );
}

function createPowerCable(parent) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(4.7, 0.07, -15),
    new THREE.Vector3(6.2, 0.045, -14.2),
    new THREE.Vector3(9.2, 0.04, -12.9),
    new THREE.Vector3(13.3, 0.04, -12.5),
    new THREE.Vector3(15.35, 0.55, -12.5)
  ]);

  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(
      curve,
      48,
      0.055,
      8,
      false
    ),
    new THREE.MeshStandardMaterial({
      color: 0x090909,
      roughness: 0.9,
      metalness: 0
    })
  );

  cable.name = "Ksenia installation power cable";
  parent.add(cable);
}

function createWallOutlet(parent) {
  const outlet = new THREE.Group();
  outlet.name = "Ksenia installation wall outlet";
  outlet.position.set(15.38, 0.72, -12.5);
  outlet.rotation.y = -Math.PI / 2;

  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.9, 0.1),
    new THREE.MeshStandardMaterial({
      color: 0xd1d2ce,
      roughness: 0.88,
      metalness: 0
    })
  );

  outlet.add(plate);

  const socketMaterial = new THREE.MeshBasicMaterial({
    color: 0x262626
  });

  [-0.13, 0.13].forEach(x => {
    const socket = new THREE.Mesh(
      new THREE.CircleGeometry(0.055, 16),
      socketMaterial
    );

    socket.position.set(x, 0, 0.056);
    outlet.add(socket);
  });

  parent.add(outlet);
}

// =====================================================
// LARGE VIDEO OVERLAY — NO WARNING SCREEN
// =====================================================

function createLargeVideoOverlay() {
  document
    .getElementById("room03-video-overlay")
    ?.remove();

  videoOverlay = document.createElement("div");
  videoOverlay.id = "room03-video-overlay";

  Object.assign(videoOverlay.style, {
    position: "fixed",
    inset: "0",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    padding: "22px",
    boxSizing: "border-box",
    background: "rgba(0, 0, 0, 0.96)",
    zIndex: "999999"
  });

  largeVideo = document.createElement("video");
  largeVideo.src = ROOM_ASSETS.film;
  largeVideo.controls = true;
  largeVideo.loop = true;
  largeVideo.playsInline = true;
  largeVideo.preload = "metadata";

  largeVideo.setAttribute("playsinline", "");
  largeVideo.setAttribute("webkit-playsinline", "");
  largeVideo.load();

  Object.assign(largeVideo.style, {
    display: "block",
    width: "94vw",
    height: "90vh",
    maxWidth: "1700px",
    objectFit: "contain",
    background: "#000000",
    outline: "none"
  });

  largeVideo.addEventListener("error", () => {
    console.warn(
      "Ksenia large video could not be loaded:",
      ROOM_ASSETS.film,
      largeVideo.error
    );
  });

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "×";
  closeButton.setAttribute("aria-label", "Close video");

  Object.assign(closeButton.style, {
    position: "absolute",
    top: "15px",
    right: "24px",
    width: "54px",
    height: "54px",
    border: "none",
    padding: "0",
    background: "transparent",
    color: "#ffffff",
    fontSize: "48px",
    fontFamily: "Arial, sans-serif",
    fontWeight: "200",
    lineHeight: "50px",
    cursor: "pointer",
    zIndex: "3"
  });

  const fullscreenButton = document.createElement("button");
  fullscreenButton.type = "button";
  fullscreenButton.textContent = "FULLSCREEN";
  fullscreenButton.setAttribute(
    "aria-label",
    "Open video in fullscreen"
  );

  Object.assign(fullscreenButton.style, {
    position: "absolute",
    top: "28px",
    left: "28px",
    minWidth: "148px",
    height: "42px",
    border: "1px solid rgba(255,255,255,0.75)",
    padding: "0 18px",
    background: "rgba(0,0,0,0.55)",
    color: "#ffffff",
    fontFamily: "Arial, sans-serif",
    fontSize: "11px",
    letterSpacing: "0.18em",
    cursor: "pointer",
    zIndex: "3"
  });

  videoOverlay.appendChild(largeVideo);
  videoOverlay.appendChild(closeButton);
  videoOverlay.appendChild(fullscreenButton);
  document.body.appendChild(videoOverlay);

  closeButton.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    closeLargeVideo();
  });

  fullscreenButton.addEventListener(
    "click",
    async event => {
      event.preventDefault();
      event.stopPropagation();
      await enterVideoFullscreen();
    }
  );

  videoOverlay.addEventListener("click", event => {
    if (event.target === videoOverlay) {
      closeLargeVideo();
    }
  });

  window.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      videoOverlay?.style.display === "flex" &&
      !document.fullscreenElement
    ) {
      event.preventDefault();
      event.stopPropagation();
      closeLargeVideo();
    }
  });
}

function openLargeVideo() {
  if (!videoOverlay || !largeVideo) return;

  videoOverlay.style.display = "flex";
  document.body.style.overflow = "hidden";

  if (
    roomVideo &&
    Number.isFinite(roomVideo.currentTime)
  ) {
    try {
      largeVideo.currentTime = roomVideo.currentTime;
    } catch (error) {
      console.warn(
        "Ksenia video time could not be synchronized:",
        error
      );
    }
  }

  largeVideo.muted = false;
  safePlay(largeVideo);
}

function closeLargeVideo() {
  if (!videoOverlay || !largeVideo) return;

  largeVideo.pause();
  videoOverlay.style.display = "none";
  document.body.style.overflow = "";
  renderer.domElement.style.cursor = "default";
}

async function enterVideoFullscreen() {
  if (!largeVideo) return;

  try {
    if (largeVideo.requestFullscreen) {
      await largeVideo.requestFullscreen();
      return;
    }

    if (largeVideo.webkitEnterFullscreen) {
      largeVideo.webkitEnterFullscreen();
    }
  } catch (error) {
    console.warn(
      "Fullscreen could not be opened:",
      error
    );
  }
}

// =====================================================
// SCREEN CLICK / HOVER
// =====================================================

function installScreenInteraction() {
  if (interactionInstalled) return;
  interactionInstalled = true;

  renderer.domElement.addEventListener(
    "click",
    handleScreenClick
  );

  renderer.domElement.addEventListener(
    "pointermove",
    handleScreenHover
  );
}

function handleScreenClick(event) {
  if (
    !roomRoot ||
    !roomRoot.visible ||
    !screenHitArea ||
    videoOverlay?.style.display === "flex"
  ) {
    return;
  }

  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObject(
    screenHitArea,
    false
  );

  if (hits.length === 0) return;

  event.preventDefault();
  event.stopPropagation();
  openLargeVideo();
}

function handleScreenHover(event) {
  if (
    !roomRoot ||
    !roomRoot.visible ||
    !screenHitArea ||
    videoOverlay?.style.display === "flex"
  ) {
    renderer.domElement.style.cursor = "default";
    return;
  }

  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObject(
    screenHitArea,
    false
  );

  renderer.domElement.style.cursor =
    hits.length > 0
      ? "pointer"
      : "default";
}

function updatePointer(event) {
  const rect =
    renderer.domElement.getBoundingClientRect();

  pointer.x =
    ((event.clientX - rect.left) / rect.width) * 2 - 1;

  pointer.y =
    -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function safePlay(video) {
  if (
    !video ||
    !roomRoot?.visible ||
    !video.paused
  ) {
    return;
  }

  const playPromise = video.play();

  if (
    playPromise &&
    typeof playPromise.catch === "function"
  ) {
    playPromise.catch(() => {});
  }
}