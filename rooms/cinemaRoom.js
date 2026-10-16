import {
  THREE,
  scene,
  camera
} from "../core/scene.js";

import { getAimPoint } from "../core/aim.js";

import {
  openCinemaViewer,
  setCinemaFilm
} from "../ui/cinemaViewer.js";

// =====================================================
// MATERIALS
// =====================================================

const floorMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x070708,
    roughness: 0.96,
    metalness: 0
  });

const wallMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x050506,
    roughness: 1,
    metalness: 0
  });

const ceilingMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x020203,
    roughness: 1,
    metalness: 0
  });

const stageMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x0b0b0c,
    roughness: 0.95,
    metalness: 0
  });

const chairFabricMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x141417,
    roughness: 0.98,
    metalness: 0
  });

const chairDarkMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x070709,
    roughness: 0.9,
    metalness: 0.03
  });

const chairMetalMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x202227,
    roughness: 0.55,
    metalness: 0.5
  });

const screenMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xd8d8d2,

    emissive: 0x777772,
    emissiveIntensity: 0.32,

    roughness: 0.82,
    metalness: 0,

    side: THREE.DoubleSide
  });

const frameMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x030304,
    roughness: 1,
    metalness: 0
  });

const projectorMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x24262b,
    roughness: 0.52,
    metalness: 0.48
  });

// =====================================================
// MAIN
// =====================================================

export function createCinemaRoom() {
  const room =
    new THREE.Group();

  room.name =
    "Cinema Room";

  room.visible = false;

  const roomWidth = 28;
  const roomDepth = 48;
  const roomHeight = 11;

  const centerZ = -13;
  const backWallZ = -37;

  createArchitecture({
    parent: room,
    roomWidth,
    roomDepth,
    roomHeight,
    centerZ,
    backWallZ
  });

  createStage({
    parent: room,
    backWallZ
  });

  const screen =
    createScreen({
      parent: room,
      backWallZ
    });

  createCinemaSeats(room);
  createAisleLights(room);
  createProjector(room);

  createCinemaLighting({
    parent: room,
    backWallZ
  });

  setupScreenInteraction({
    room,
    screen
  });

  room.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.castShadow = false;
    child.receiveShadow = true;
  });

  scene.add(room);

  return room;
}

// =====================================================
// ARCHITECTURE
// =====================================================

function createArchitecture({
  parent,
  roomWidth,
  roomDepth,
  roomHeight,
  centerZ,
  backWallZ
}) {
  const floor =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        roomWidth,
        0.16,
        roomDepth
      ),
      floorMaterial
    );

  floor.position.set(
    0,
    -0.08,
    centerZ
  );

  parent.add(floor);

  const leftWall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.8,
        roomHeight,
        roomDepth
      ),
      wallMaterial
    );

  leftWall.position.set(
    -roomWidth / 2,
    roomHeight / 2,
    centerZ
  );

  parent.add(leftWall);

  const rightWall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.8,
        roomHeight,
        roomDepth
      ),
      wallMaterial
    );

  rightWall.position.set(
    roomWidth / 2,
    roomHeight / 2,
    centerZ
  );

  parent.add(rightWall);

  const backWall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        roomWidth,
        roomHeight,
        0.8
      ),
      wallMaterial
    );

  backWall.position.set(
    0,
    roomHeight / 2,
    backWallZ
  );

  parent.add(backWall);

  const ceiling =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        roomWidth,
        0.3,
        roomDepth
      ),
      ceilingMaterial
    );

  ceiling.position.set(
    0,
    roomHeight,
    centerZ
  );

  parent.add(ceiling);
}

// =====================================================
// STAGE
// =====================================================

function createStage({
  parent,
  backWallZ
}) {
  const stage =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        21,
        0.72,
        4.8
      ),
      stageMaterial
    );

  stage.position.set(
    0,
    0.36,
    backWallZ + 3.1
  );

  parent.add(stage);

  const stageFront =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        21.2,
        0.76,
        0.18
      ),
      frameMaterial
    );

  stageFront.position.set(
    0,
    0.38,
    backWallZ + 5.52
  );

  parent.add(stageFront);
}

// =====================================================
// SCREEN
// =====================================================

function createScreen({
  parent,
  backWallZ
}) {
  const screenRoot =
    new THREE.Group();

  screenRoot.name =
    "Interactive Cinema Screen";

  screenRoot.userData.type =
    "cinemaScreen";

  const frame =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        18.8,
        8.6,
        0.2
      ),
      frameMaterial
    );

  screenRoot.add(frame);

  const screen =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        18,
        7.8
      ),
      screenMaterial
    );

  screen.name =
    "Cinema Screen Surface";

  screen.userData.type =
    "cinemaScreen";

  screen.position.z = 0.11;

  screenRoot.add(screen);

  screenRoot.position.set(
    0,
    5.65,
    backWallZ + 0.62
  );

  parent.add(screenRoot);

  return screenRoot;
}

// =====================================================
// CINEMA SEATS
// =====================================================

function createCinemaSeats(parent) {
  /*
    Кресла начинаются почти сразу после входа.

    Вход камеры в room04 находится примерно на z = 10.
    Первый ряд ставим на z = 5.2, чтобы посетитель
    сразу попадал внутрь зрительного зала.
  */

  const rows = 9;

  const seatsPerSide = 5;

  const firstRowZ = 5.2;
  const rowSpacing = 4.15;

  const seatSpacing = 2.05;

  /*
    Центральный проход достаточно широкий,
    чтобы по нему можно было нормально двигаться.
  */

  const aisleHalfWidth = 1.65;

  for (
    let row = 0;
    row < rows;
    row++
  ) {
    const z =
      firstRowZ -
      row * rowSpacing;

    /*
      Лёгкий амфитеатр:
      дальние ряды постепенно становятся выше.
    */

    const rowHeight =
      row * 0.13;

    for (
      let index = 0;
      index < seatsPerSide;
      index++
    ) {
      const offset =
        aisleHalfWidth +
        0.82 +
        index * seatSpacing;

      createCinemaSeat({
        parent,
        x: -offset,
        y: rowHeight,
        z
      });

      createCinemaSeat({
        parent,
        x: offset,
        y: rowHeight,
        z
      });
    }
  }
}

// =====================================================
// REALISTIC CINEMA CHAIR
// =====================================================

function createCinemaSeat({
  parent,
  x,
  y,
  z
}) {
  const chair =
    new THREE.Group();

  chair.name =
    "Cinema Seat";

  /*
    Металлическая ножка под креслом.
  */

  const leg =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.11,
        0.15,
        0.46,
        12
      ),
      chairMetalMaterial
    );

  leg.position.set(
    0,
    0.23,
    0.16
  );

  chair.add(leg);

  /*
    Нижнее крепление к полу.
  */

  const floorBase =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.3,
        0.36,
        0.08,
        18
      ),
      chairDarkMaterial
    );

  floorBase.position.y = 0.04;

  chair.add(floorBase);

  /*
    Подушка сиденья.

    Используем CapsuleGeometry, чтобы кресло
    не выглядело как прямоугольный ящик.
  */

  const cushion =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.58,
        0.58,
        6,
        14
      ),
      chairFabricMaterial
    );

  cushion.scale.set(
    1.05,
    0.33,
    1.02
  );

  cushion.rotation.x =
    Math.PI / 2;

  cushion.position.set(
    0,
    0.65,
    -0.08
  );

  chair.add(cushion);

  /*
    Высокая мягкая спинка.
  */

  const back =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.62,
        1,
        8,
        16
      ),
      chairFabricMaterial
    );

  back.scale.set(
    1,
    1.05,
    0.3
  );

  back.position.set(
    0,
    1.55,
    0.52
  );

  back.rotation.x =
    -0.08;

  chair.add(back);

  /*
    Подголовник.
  */

  const headrest =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.5,
        18,
        14
      ),
      chairFabricMaterial
    );

  headrest.scale.set(
    1.08,
    0.55,
    0.32
  );

  headrest.position.set(
    0,
    2.28,
    0.46
  );

  chair.add(headrest);

  /*
    Левый подлокотник.
  */

  const leftArm =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.12,
        0.82,
        5,
        10
      ),
      chairDarkMaterial
    );

  leftArm.rotation.x =
    Math.PI / 2;

  leftArm.position.set(
    -0.72,
    0.92,
    0
  );

  chair.add(leftArm);

  /*
    Правый подлокотник.
  */

  const rightArm =
    leftArm.clone();

  rightArm.position.x =
    0.72;

  chair.add(rightArm);

  /*
    Небольшие боковые опоры.
  */

  const leftSupport =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.12,
        0.7,
        0.22
      ),
      chairMetalMaterial
    );

  leftSupport.position.set(
    -0.72,
    0.52,
    0.22
  );

  chair.add(leftSupport);

  const rightSupport =
    leftSupport.clone();

  rightSupport.position.x =
    0.72;

  chair.add(rightSupport);

  chair.position.set(
    x,
    y,
    z
  );

  /*
    Все кресла направлены к экрану,
    расположенному по отрицательной оси Z.
  */

  chair.rotation.y = 0;

  parent.add(chair);
}

// =====================================================
// AISLE LIGHTS
// =====================================================

function createAisleLights(parent) {
  const lightMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x59616e,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });

  /*
    Свет начинается сразу у входа
    и продолжается до сцены.
  */

  for (
    let i = 0;
    i < 10;
    i++
  ) {
    const z =
      7 - i * 4.15;

    const left =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.055,
          0.02,
          0.62
        ),
        lightMaterial
      );

    left.position.set(
      -1.38,
      0.018,
      z
    );

    parent.add(left);

    const right =
      left.clone();

    right.position.x = 1.38;

    parent.add(right);
  }
}

// =====================================================
// PROJECTOR
// =====================================================

function createProjector(parent) {
  const projector =
    new THREE.Group();

  projector.name =
    "Cinema Projector";

  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.2,
        0.48,
        1.55
      ),
      projectorMaterial
    );

  projector.add(body);

  const lens =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.16,
        0.2,
        0.28,
        18
      ),
      new THREE.MeshStandardMaterial({
        color: 0xe4e8ee,
        emissive: 0xffffff,
        emissiveIntensity: 1.5,
        roughness: 0.28,
        metalness: 0.2
      })
    );

  lens.rotation.x =
    Math.PI / 2;

  lens.position.set(
    0,
    0,
    -0.9
  );

  projector.add(lens);

  projector.position.set(
    0,
    9.2,
    6
  );

  parent.add(projector);
}

// =====================================================
// LIGHTING
// =====================================================

function createCinemaLighting({
  parent,
  backWallZ
}) {
  const ambient =
    new THREE.AmbientLight(
      0x626975,
      0.045
    );

  parent.add(ambient);

  /*
    Мягкое свечение экрана.
  */

  const screenLight =
    new THREE.RectAreaLight(
      0xe0e1dd,
      1.25,
      18,
      7.8
    );

  screenLight.position.set(
    0,
    5.65,
    backWallZ + 0.85
  );

  screenLight.rotation.y =
    Math.PI;

  parent.add(screenLight);

  /*
    Проекторный SpotLight.
  */

  const projectorSpot =
    new THREE.SpotLight(
      0xe8e9e5,
      2.1,
      48,
      Math.PI / 16,
      0.82,
      1.6
    );

  projectorSpot.position.set(
    0,
    9.15,
    5.2
  );

  projectorSpot.target.position.set(
    0,
    5.6,
    backWallZ + 0.8
  );

  projectorSpot.castShadow =
    false;

  parent.add(projectorSpot);
  parent.add(projectorSpot.target);

  /*
    Очень прозрачный луч.
  */

  const beam =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.11,
        3.2,
        41,
        32,
        1,
        true
      ),
      new THREE.MeshBasicMaterial({
        color: 0xdfe3e8,
        transparent: true,
        opacity: 0.007,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending:
          THREE.AdditiveBlending
      })
    );

  beam.rotation.x =
    Math.PI / 2;

  beam.position.set(
    0,
    7.35,
    -14.4
  );

  parent.add(beam);

  /*
    Слабый свет возле входа,
    чтобы первые кресла не исчезали полностью.
  */

  const entranceLight =
    new THREE.PointLight(
      0x687385,
      0.18,
      14,
      2
    );

  entranceLight.position.set(
    0,
    2.8,
    7
  );

  parent.add(entranceLight);

  /*
    Очень слабый боковой свет,
    который показывает контуры кресел.
  */

  const chairFillLeft =
    new THREE.PointLight(
      0x606a78,
      0.12,
      24,
      2
    );

  chairFillLeft.position.set(
    -9,
    3,
    -9
  );

  parent.add(chairFillLeft);

  const chairFillRight =
    new THREE.PointLight(
      0x606a78,
      0.12,
      24,
      2
    );

  chairFillRight.position.set(
    9,
    3,
    -9
  );

  parent.add(chairFillRight);
}

// =====================================================
// SCREEN INTERACTION
// =====================================================

function setupScreenInteraction({
  room,
  screen
}) {
  const raycaster =
    new THREE.Raycaster();

  const pointer =
    new THREE.Vector2();

  window.addEventListener(
    "click",
    (event) => {
      if (!room.visible) {
        return;
      }

      if (
        event.target.closest?.(
          "#cinema-viewer, button, a, input, textarea, select"
        )
      ) {
        return;
      }

      // При захвате мыши целимся в центр экрана (см. core/aim.js)
      const aim =
        getAimPoint(event);

      pointer.x =
        (
          aim.x /
          window.innerWidth
        ) * 2 - 1;

      pointer.y =
        -(
          aim.y /
          window.innerHeight
        ) * 2 + 1;

      raycaster.setFromCamera(
        pointer,
        camera
      );

      const hits =
        raycaster.intersectObject(
          screen,
          true
        );

      if (
        hits.length === 0
      ) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      setCinemaFilm({
        title: "HIM",
        artist: "Asaf Tal",
        year: "2026",

        warningTitle: "18+",

        warningText:
          `This film contains disturbing imagery and themes
          that may not be suitable for all viewers.
          Viewer discretion is advised.`,

        videoUrl:
          "./assets/videos/cinema-film.mp4"
      });

      openCinemaViewer();
    },
    true
  );
}