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


export function createCorridorRightRoom01() {
  const room = new THREE.Group();

  room.name = "Corridor Right Room 01";
  room.visible = false;


  // ===================================================
  // ROOM PARAMETERS
  // ===================================================

  const roomWidth = 36;
  const roomDepth = 44;
  const roomHeight = 11;

  const roomCenterZ = -11;
  const entranceWallZ = 10.45;
  const backWallZ = -33;


  // ===================================================
  // FLOOR
  // ===================================================

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(
      roomWidth,
      0.14,
      roomDepth
    ),
    floorMaterial
  );

  floor.position.set(
    0,
    -0.07,
    roomCenterZ
  );

  floor.receiveShadow = true;

  room.add(floor);


  // ===================================================
  // LEFT WALL
  // ===================================================

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(
      1.2,
      roomHeight,
      roomDepth
    ),
    wallMaterial
  );

  leftWall.position.set(
    -roomWidth / 2,
    roomHeight / 2,
    roomCenterZ
  );

  leftWall.receiveShadow = true;

  room.add(leftWall);


  // ===================================================
  // RIGHT WALL
  // ===================================================

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(
      1.2,
      roomHeight,
      roomDepth
    ),
    wallMaterial
  );

  rightWall.position.set(
    roomWidth / 2,
    roomHeight / 2,
    roomCenterZ
  );

  rightWall.receiveShadow = true;

  room.add(rightWall);


  // ===================================================
  // BACK WALL
  // ===================================================

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(
      roomWidth,
      roomHeight,
      1.2
    ),
    wallMaterial
  );

  backWall.position.set(
    0,
    roomHeight / 2,
    backWallZ
  );

  backWall.receiveShadow = true;

  room.add(backWall);


  // ===================================================
  // ENTRANCE WALL
  // ===================================================

  const entranceOpeningWidth = 4.3;
  const entranceOpeningHeight = 6.4;

  const entranceWall =
    createWallWithArchOpening({
      wallWidth: roomWidth,
      wallHeight: roomHeight,
      wallDepth: 0.8,

      openingWidth:
        entranceOpeningWidth,

      openingHeight:
        entranceOpeningHeight,

      material:
        wallMaterial
    });

  entranceWall.position.set(
    0,
    0,
    entranceWallZ
  );

  room.add(entranceWall);


  // ===================================================
  // RETURN PORTAL
  // ===================================================

  const returnDoor =
    createArchPortal({
      width: 5,
      height: 6.95,

      openingWidth:
        entranceOpeningWidth,

      openingHeight:
        entranceOpeningHeight,

      depth: 0.72,

      target: "corridor",

      showDarkOpening:
        false
    });

  returnDoor.position.set(
    0,
    0,
    entranceWallZ - 0.45
  );

  returnDoor.rotation.y =
    Math.PI;

  room.add(returnDoor);


  // ===================================================
  // CEILING RAILS
  // ===================================================

  const railMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x292a2d,
      roughness: 0.7,
      metalness: 0.55
    });

  createRail({
    parent: room,
    material: railMaterial,
    x: -7.5,
    y: 10.3,
    z: -10.5,
    length: 37
  });

  createRail({
    parent: room,
    material: railMaterial,
    x: 7.5,
    y: 10.3,
    z: -10.5,
    length: 37
  });


  // ===================================================
  // 11 PHOTOGRAPHS
  // ===================================================

  const photographs = [
    {
      file: "room02-photo-01.webp",
      x: -7.2,
      y: 5.25,
      z: 3.2,
      width: 2.7,
      height: 3.8
    },

    {
      file: "room02-photo-02.webp",
      x: -8.5,
      y: 5.7,
      z: -2.7,
      width: 4.4,
      height: 2.9
    },

    {
      file: "room02-photo-03.webp",
      x: -7.3,
      y: 5.05,
      z: -8.7,
      width: 3,
      height: 4.3
    },

    {
      file: "room02-photo-04.webp",
      x: -8.4,
      y: 5.55,
      z: -14.8,
      width: 4.6,
      height: 3
    },

    {
      file: "room02-photo-05.webp",
      x: -7.2,
      y: 5.15,
      z: -21,
      width: 2.8,
      height: 4
    },

    {
      file: "room02-photo-06.webp",
      x: -8.3,
      y: 5.6,
      z: -27,
      width: 4.5,
      height: 2.9
    },

    {
      file: "room02-photo-07.webp",
      x: 8.4,
      y: 5.65,
      z: 0.3,
      width: 4.4,
      height: 2.9
    },

    {
      file: "room02-photo-08.webp",
      x: 7.2,
      y: 5.05,
      z: -5.7,
      width: 2.9,
      height: 4.2
    },

    {
      file: "room02-photo-09.webp",
      x: 8.5,
      y: 5.6,
      z: -11.8,
      width: 4.6,
      height: 3
    },

    {
      file: "room02-photo-10.webp",
      x: 7.3,
      y: 5.15,
      z: -18,
      width: 2.8,
      height: 4
    },

    {
      file: "room02-photo-11.webp",
      x: 8.4,
      y: 5.65,
      z: -24.5,
      width: 4.3,
      height: 2.8
    }
  ];


  photographs.forEach((photo) => {
    createHangingPhoto({
      parent: room,

      imagePath:
        `./assets/artworks/artworks/room02/${photo.file}`,

      x: photo.x,
      y: photo.y,
      z: photo.z,

      width: photo.width,
      height: photo.height,

      ceilingY: 10.3
    });
  });


  // ===================================================
  // VIDEO PATH
  // ===================================================

  const videoPath =
    "./assets/artworks/artworks/room02/video/kap-kap ויקטוריה סרדיוקובסקיה שנה ב.mp4";


  // ===================================================
  // VIDEO INSIDE THE ROOM
  // ===================================================

  const roomVideo =
    document.createElement("video");

  roomVideo.src = videoPath;
  roomVideo.loop = true;
  roomVideo.muted = true;
  roomVideo.autoplay = true;
  roomVideo.playsInline = true;
  roomVideo.preload = "auto";

  roomVideo.setAttribute(
    "playsinline",
    ""
  );

  roomVideo.setAttribute(
    "webkit-playsinline",
    ""
  );


  // ===================================================
  // VIDEO TEXTURE
  // ===================================================

  const videoTexture =
    new THREE.VideoTexture(
      roomVideo
    );

  videoTexture.minFilter =
    THREE.LinearFilter;

  videoTexture.magFilter =
    THREE.LinearFilter;

  videoTexture.generateMipmaps =
    false;

  if (
    THREE.SRGBColorSpace &&
    "colorSpace" in videoTexture
  ) {
    videoTexture.colorSpace =
      THREE.SRGBColorSpace;
  }


  // ===================================================
  // VIDEO FRAME
  // ===================================================

  const screenFrame =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        11.8,
        6.8,
        0.3
      ),

      new THREE.MeshStandardMaterial({
        color: 0x050505,
        roughness: 0.85,
        metalness: 0.08
      })
    );

  screenFrame.position.set(
    0,
    5.25,
    backWallZ + 0.72
  );

  room.add(screenFrame);


  // ===================================================
  // VIDEO SCREEN
  // ===================================================

  const videoScreen =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        10.8,
        5.95
      ),

      new THREE.MeshBasicMaterial({
        map: videoTexture,
        side: THREE.DoubleSide,
        toneMapped: false
      })
    );

  videoScreen.name =
    "room02-video-screen";

  videoScreen.position.set(
    0,
    5.25,
    backWallZ + 0.9
  );

  room.add(videoScreen);


  // ===================================================
  // SCREEN GLOW
  // ===================================================

  const screenGlow =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        12.5,
        7.4
      ),

      new THREE.MeshBasicMaterial({
        color: 0xdfe7ff,
        transparent: true,
        opacity: 0.06,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );

  screenGlow.position.set(
    0,
    5.25,
    backWallZ + 0.75
  );

  room.add(screenGlow);


  // ===================================================
  // REMOVE OLD HTML ELEMENTS
  // ===================================================

  const oldVideoOverlay =
    document.getElementById(
      "room02-video-overlay"
    );

  if (oldVideoOverlay) {
    oldVideoOverlay.remove();
  }


  /*
    Victoria's artist information is displayed by the
    universal ui/artistIntro.js component before room02
    is entered. No separate HTML modal is created here.
  */


  // ===================================================
  // LARGE VIDEO OVERLAY
  // ===================================================

  const videoOverlay =
    document.createElement("div");

  videoOverlay.id =
    "room02-video-overlay";

  Object.assign(
    videoOverlay.style,
    {
      position: "fixed",
      inset: "0",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      padding: "22px",
      boxSizing: "border-box",
      background: "rgba(0, 0, 0, 0.96)",
      zIndex: "999999"
    }
  );


  // ===================================================
  // LARGE VIDEO
  // ===================================================

  const largeVideo =
    document.createElement("video");

  largeVideo.src = videoPath;
  largeVideo.controls = true;
  largeVideo.loop = true;
  largeVideo.playsInline = true;
  largeVideo.preload = "metadata";

  Object.assign(
    largeVideo.style,
    {
      display: "block",
      width: "94vw",
      height: "90vh",
      maxWidth: "1700px",
      objectFit: "contain",
      background: "#000000",
      outline: "none"
    }
  );

  videoOverlay.appendChild(
    largeVideo
  );


  // ===================================================
  // CLOSE VIDEO BUTTON
  // ===================================================

  const closeVideoButton =
    document.createElement("button");

  closeVideoButton.type = "button";
  closeVideoButton.textContent = "×";

  closeVideoButton.setAttribute(
    "aria-label",
    "Close video"
  );

  Object.assign(
    closeVideoButton.style,
    {
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
      zIndex: "2"
    }
  );

  videoOverlay.appendChild(
    closeVideoButton
  );

  document.body.appendChild(
    videoOverlay
  );


  // ===================================================
  // VIDEO OVERLAY STATE
  // ===================================================

  let previousRoomVisibility =
    room.visible;


  // ===================================================
  // OPEN LARGE VIDEO
  // ===================================================

  function openLargeVideo() {
    videoOverlay.style.display =
      "flex";

    document.body.style.overflow =
      "hidden";

    if (
      Number.isFinite(
        roomVideo.currentTime
      )
    ) {
      largeVideo.currentTime =
        roomVideo.currentTime;
    }

    largeVideo.muted = false;

    const playPromise =
      largeVideo.play();

    if (
      playPromise &&
      typeof playPromise.catch ===
        "function"
    ) {
      playPromise.catch(() => {});
    }
  }


  // ===================================================
  // CLOSE LARGE VIDEO
  // ===================================================

  function closeLargeVideo() {
    largeVideo.pause();

    videoOverlay.style.display =
      "none";

    document.body.style.overflow =
      "";

    renderer.domElement.style.cursor =
      room.visible
        ? renderer.domElement.style.cursor
        : "default";
  }


  closeVideoButton.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeLargeVideo();
    }
  );


  videoOverlay.addEventListener(
    "click",
    (event) => {
      if (
        event.target === videoOverlay
      ) {
        closeLargeVideo();
      }
    }
  );


  // ===================================================
  // ESCAPE BUTTON
  // ===================================================

  window.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape" &&
        videoOverlay.style.display ===
          "flex"
      ) {
        event.preventDefault();
        event.stopPropagation();
        closeLargeVideo();
      }
    }
  );


  // ===================================================
  // CLEAN UP WHEN LEAVING ROOM
  // ===================================================

  function watchRoomVisibility() {
    const roomJustClosed =
      !room.visible &&
      previousRoomVisibility;

    if (roomJustClosed) {
      closeLargeVideo();

      renderer.domElement.style.cursor =
        "default";
    }

    previousRoomVisibility =
      room.visible;

    requestAnimationFrame(
      watchRoomVisibility
    );
  }

  watchRoomVisibility();


  // ===================================================
  // VIDEO CLICK DETECTION
  // ===================================================

  const raycaster =
    new THREE.Raycaster();

  const pointer =
    new THREE.Vector2();


  function updatePointer(event) {
    const rect =
      renderer.domElement.getBoundingClientRect();

    pointer.x =
      (
        (
          event.clientX -
          rect.left
        ) /
        rect.width
      ) * 2 - 1;

    pointer.y =
      -(
        (
          event.clientY -
          rect.top
        ) /
        rect.height
      ) * 2 + 1;
  }


  function pointerIsOnVideo(
    event
  ) {
    updatePointer(event);

    raycaster.setFromCamera(
      pointer,
      camera
    );

    const hits =
      raycaster.intersectObject(
        videoScreen,
        false
      );

    return hits.length > 0;
  }


  renderer.domElement.addEventListener(
    "click",
    (event) => {
      if (!room.visible) {
        return;
      }

      if (
        videoOverlay.style.display ===
        "flex"
      ) {
        return;
      }

      if (
        pointerIsOnVideo(event)
      ) {
        event.preventDefault();
        event.stopPropagation();
        openLargeVideo();
      }
    }
  );


  renderer.domElement.addEventListener(
    "pointermove",
    (event) => {
      if (
        !room.visible ||
        videoOverlay.style.display ===
          "flex"
      ) {
        renderer.domElement.style.cursor =
          "default";

        return;
      }

      renderer.domElement.style.cursor =
        pointerIsOnVideo(event)
          ? "pointer"
          : "default";
    }
  );


  // ===================================================
  // START ROOM VIDEO
  // ===================================================

  function startRoomVideo() {
    const playPromise =
      roomVideo.play();

    if (
      playPromise &&
      typeof playPromise.catch ===
        "function"
    ) {
      playPromise.catch(() => {});
    }
  }

  startRoomVideo();

  window.addEventListener(
    "pointerdown",
    startRoomVideo,
    {
      once: true
    }
  );


  // ===================================================
  // LIGHTING
  // ===================================================

  const ambientLight =
    new THREE.HemisphereLight(
      0xf1f1f1,
      0x444444,
      1.25
    );

  room.add(ambientLight);


  const frontLight =
    new THREE.PointLight(
      0xffffff,
      1.8,
      38,
      2
    );

  frontLight.position.set(
    0,
    8,
    5
  );

  room.add(frontLight);


  const middleLight =
    new THREE.PointLight(
      0xffffff,
      1.4,
      34,
      2
    );

  middleLight.position.set(
    0,
    8,
    -12
  );

  room.add(middleLight);


  const backLight =
    new THREE.PointLight(
      0xdce6ff,
      1.5,
      22,
      2
    );

  backLight.position.set(
    0,
    5,
    -28
  );

  room.add(backLight);


  // ===================================================
  // ADD ROOM TO SCENE
  // ===================================================

  scene.add(room);

  return room;
}


// =====================================================
// CREATE HANGING PHOTO
// The original image is never cropped.
// The photograph and its frame are resized automatically
// according to the real aspect ratio of each WebP file.
// =====================================================

function createHangingPhoto({
  parent,
  imagePath,
  x,
  y,
  z,
  width,
  height,
  ceilingY
}) {
  const group =
    new THREE.Group();

  group.position.set(
    x,
    y,
    z
  );

  parent.add(group);


  // ===================================================
  // MATERIALS
  // ===================================================

  const frameMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.75,
      metalness: 0.15
    });

  const wireMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x777777
    });


  // ===================================================
  // LOAD THE ORIGINAL IMAGE
  // ===================================================

  const textureLoader =
    new THREE.TextureLoader();

  textureLoader.load(
    imagePath,

    (texture) => {
      if (
        THREE.SRGBColorSpace &&
        "colorSpace" in texture
      ) {
        texture.colorSpace =
          THREE.SRGBColorSpace;
      }

      texture.minFilter =
        THREE.LinearFilter;

      texture.magFilter =
        THREE.LinearFilter;

      texture.generateMipmaps =
        true;


      // ===============================================
      // READ THE REAL IMAGE PROPORTIONS
      // ===============================================

      const imageWidth =
        texture.image?.naturalWidth ||
        texture.image?.videoWidth ||
        texture.image?.width ||
        1;

      const imageHeight =
        texture.image?.naturalHeight ||
        texture.image?.videoHeight ||
        texture.image?.height ||
        1;

      const imageAspect =
        imageWidth / imageHeight;

      const availableAspect =
        width / height;


      // ===============================================
      // FIT INSIDE THE GIVEN MAXIMUM SIZE
      // WITHOUT CROPPING OR STRETCHING
      // ===============================================

      let photoWidth;
      let photoHeight;

      if (
        imageAspect >
        availableAspect
      ) {
        photoWidth =
          width;

        photoHeight =
          width / imageAspect;
      } else {
        photoHeight =
          height;

        photoWidth =
          height * imageAspect;
      }


      // ===============================================
      // FRAME FITS THE REAL PHOTO SIZE
      // ===============================================

      const frameBorder =
        0.16;

      const frame =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            photoWidth + frameBorder,
            photoHeight + frameBorder,
            0.13
          ),

          frameMaterial
        );

      frame.castShadow =
        true;

      frame.receiveShadow =
        true;

      group.add(frame);


      // ===============================================
      // PHOTO PLANE
      // ===============================================

      const photo =
        new THREE.Mesh(
          new THREE.PlaneGeometry(
            photoWidth,
            photoHeight
          ),

          new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            toneMapped: false
          })
        );

      photo.position.z =
        0.071;

      group.add(photo);


      // ===============================================
      // HANGING WIRES FOLLOW THE ACTUAL FRAME SIZE
      // ===============================================

      const wireLength =
        Math.max(
          0.2,
          ceilingY -
            (
              y +
              photoHeight / 2
            )
        );

      const wireGeometry =
        new THREE.CylinderGeometry(
          0.012,
          0.012,
          wireLength,
          8
        );


      const leftWire =
        new THREE.Mesh(
          wireGeometry,
          wireMaterial
        );

      leftWire.position.set(
        -photoWidth * 0.32,
        photoHeight / 2 +
          wireLength / 2,
        0
      );

      group.add(leftWire);


      const rightWire =
        new THREE.Mesh(
          wireGeometry,
          wireMaterial
        );

      rightWire.position.set(
        photoWidth * 0.32,
        photoHeight / 2 +
          wireLength / 2,
        0
      );

      group.add(rightWire);

      console.log(
        "Loaded without cropping:",
        imagePath,
        `${imageWidth}×${imageHeight}`,
        "displayed as",
        `${photoWidth.toFixed(2)}×${photoHeight.toFixed(2)}`
      );
    },

    undefined,

    (error) => {
      console.error(
        "Could not load image:",
        imagePath,
        error
      );
    }
  );
}


// =====================================================
// CREATE CEILING RAIL
// =====================================================

function createRail({
  parent,
  material,
  x,
  y,
  z,
  length
}) {
  const rail =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.06,
        0.06,
        length,
        12
      ),
      material
    );

  rail.rotation.x =
    Math.PI / 2;

  rail.position.set(
    x,
    y,
    z
  );

  parent.add(rail);
}