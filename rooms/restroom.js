import {
  THREE,
  scene
} from "../core/scene.js";

import {
  floorMaterial,
  wallMaterial,
  darkMaterial
} from "../core/materials.js";

// =====================================================
// MATERIALS
// =====================================================

const partitionMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x55585f,
    roughness: 0.92,
    metalness: 0
  });

const ceramicMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xd7d8d5,
    roughness: 0.48,
    metalness: 0
  });

const metalMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x858b94,
    roughness: 0.3,
    metalness: 0.75
  });

const mirrorMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xaebac8,
    roughness: 0.08,
    metalness: 0.82
  });

// =====================================================
// MAIN
// =====================================================

export function createRestroom({
  name,
  label,
  roomType
}) {
  const room =
    new THREE.Group();

  room.name = name;
  room.visible = false;

  room.userData.roomType =
    roomType;

  const roomWidth = 18;
  const roomDepth = 25;
  const roomHeight = 8;

  const centerZ = -3;
  const backWallZ = -15.5;

  createArchitecture({
    parent: room,
    roomWidth,
    roomDepth,
    roomHeight,
    centerZ,
    backWallZ
  });

  createTitle({
    parent: room,
    label,
    backWallZ
  });

  createSink({
    parent: room,
    x: -3.1,
    z: -3
  });

  createSink({
    parent: room,
    x: 0,
    z: -3
  });

  createSink({
    parent: room,
    x: 3.1,
    z: -3
  });

  createCabin({
    parent: room,
    x: -4.8,
    z: -11
  });

  createCabin({
    parent: room,
    x: 0,
    z: -11
  });

  createCabin({
    parent: room,
    x: 4.8,
    z: -11
  });

  createLights(room);

  room.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

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
        0.14,
        roomDepth
      ),
      floorMaterial
    );

  floor.position.set(
    0,
    -0.07,
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
}

// =====================================================
// TITLE
// =====================================================

function createTitle({
  parent,
  label,
  backWallZ
}) {
  const title =
    createTextSign(
      label,
      5,
      0.75
    );

  title.position.set(
    0,
    6.7,
    backWallZ + 0.45
  );

  parent.add(title);
}

// =====================================================
// SINK
// =====================================================

function createSink({
  parent,
  x,
  z
}) {
  const sink =
    new THREE.Group();

  const bowl =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        2.2,
        0.32,
        0.85
      ),
      ceramicMaterial
    );

  bowl.position.y = 1.05;

  sink.add(bowl);

  const support =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.46,
        1,
        0.46
      ),
      partitionMaterial
    );

  support.position.y = 0.5;

  sink.add(support);

  const mirror =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        2.3,
        2.2
      ),
      mirrorMaterial
    );

  mirror.position.set(
    0,
    2.75,
    -0.46
  );

  sink.add(mirror);

  const faucet =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.18,
        0.035,
        8,
        20,
        Math.PI
      ),
      metalMaterial
    );

  faucet.rotation.x =
    Math.PI / 2;

  faucet.position.set(
    0,
    1.42,
    0
  );

  sink.add(faucet);

  sink.position.set(
    x,
    0,
    z
  );

  parent.add(sink);
}

// =====================================================
// CABIN
// =====================================================

function createCabin({
  parent,
  x,
  z
}) {
  const cabin =
    new THREE.Group();

  const width = 3.7;
  const depth = 4.8;
  const height = 5.7;

  const leftSide =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.22,
        height,
        depth
      ),
      partitionMaterial
    );

  leftSide.position.set(
    -width / 2,
    height / 2,
    0
  );

  cabin.add(leftSide);

  const rightSide =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.22,
        height,
        depth
      ),
      partitionMaterial
    );

  rightSide.position.set(
    width / 2,
    height / 2,
    0
  );

  cabin.add(rightSide);

  const back =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        0.22
      ),
      partitionMaterial
    );

  back.position.set(
    0,
    height / 2,
    -depth / 2
  );

  cabin.add(back);

  const door =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width - 0.35,
        4.8,
        0.16
      ),
      darkMaterial
    );

  door.position.set(
    0,
    2.65,
    depth / 2
  );

  cabin.add(door);

  const toiletBase =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.55,
        0.7,
        0.75,
        24
      ),
      ceramicMaterial
    );

  toiletBase.position.set(
    0,
    0.38,
    -0.8
  );

  cabin.add(toiletBase);

  const toiletSeat =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.52,
        0.11,
        12,
        28
      ),
      ceramicMaterial
    );

  toiletSeat.rotation.x =
    Math.PI / 2;

  toiletSeat.position.set(
    0,
    0.83,
    -0.8
  );

  cabin.add(toiletSeat);

  cabin.position.set(
    x,
    0,
    z
  );

  parent.add(cabin);
}

// =====================================================
// LIGHTS
// =====================================================

function createLights(parent) {
  const mainLight =
    new THREE.PointLight(
      0xf0f1ed,
      1.4,
      30,
      2
    );

  mainLight.position.set(
    0,
    6.5,
    0
  );

  parent.add(mainLight);

  const backLight =
    new THREE.PointLight(
      0xdce5f3,
      0.85,
      20,
      2
    );

  backLight.position.set(
    0,
    5,
    -12
  );

  parent.add(backLight);
}

// =====================================================
// SIGN
// =====================================================

function createTextSign(
  text,
  width,
  height
) {
  const sign =
    new THREE.Group();

  const base =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        0.08
      ),
      darkMaterial
    );

  sign.add(base);

  const texture =
    createTextTexture(text);

  const plane =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        width - 0.12,
        height - 0.1
      ),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );

  plane.position.z =
    0.046;

  sign.add(plane);

  return sign;
}

function createTextTexture(text) {
  const canvas =
    document.createElement("canvas");

  canvas.width = 1024;
  canvas.height = 180;

  const context =
    canvas.getContext("2d");

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  context.font =
    "500 62px Arial, Helvetica, sans-serif";

  context.textAlign =
    "center";

  context.textBaseline =
    "middle";

  context.fillStyle =
    "#eef2f7";

  context.fillText(
    text,
    canvas.width / 2,
    canvas.height / 2
  );

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.minFilter =
    THREE.LinearFilter;

  texture.magFilter =
    THREE.LinearFilter;

  return texture;
}