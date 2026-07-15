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

const toiletWallMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x666970,
    roughness: 0.94,
    metalness: 0
  });

const doorMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x17191e,
    roughness: 0.82,
    metalness: 0.05
  });

const metalMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x70757e,
    roughness: 0.48,
    metalness: 0.62
  });

const counterMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x35383e,
    roughness: 0.84,
    metalness: 0.03
  });

// =====================================================
// MAIN ROOM
// =====================================================

export function createFacilitiesRoom() {
  const room =
    new THREE.Group();

  room.name =
    "Wardrobe And WC Room";

  room.visible = false;

  const roomWidth = 24;
  const roomDepth = 30;
  const roomHeight = 9;

  const centerZ = -5;
  const backWallZ = -20;

  createRoomArchitecture({
    parent: room,
    roomWidth,
    roomDepth,
    roomHeight,
    centerZ,
    backWallZ
  });

  createWardrobeArea(room);
  createToiletBlock(room);
  createRoomLights(room);

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
// ROOM ARCHITECTURE
// =====================================================

function createRoomArchitecture({
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

  floor.receiveShadow = true;

  parent.add(floor);

  const leftWall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1,
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
        1,
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
        1
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
// WARDROBE
// =====================================================

function createWardrobeArea(parent) {
  const wardrobe =
    new THREE.Group();

  wardrobe.name =
    "Wardrobe Area";

  const counter =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        7.5,
        1.2,
        1.1
      ),
      counterMaterial
    );

  counter.position.set(
    -6.4,
    0.6,
    -7
  );

  wardrobe.add(counter);

  const counterTop =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        7.8,
        0.12,
        1.4
      ),
      doorMaterial
    );

  counterTop.position.set(
    -6.4,
    1.25,
    -7
  );

  wardrobe.add(counterTop);

  const rail =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.055,
        0.055,
        8,
        12
      ),
      metalMaterial
    );

  rail.rotation.z =
    Math.PI / 2;

  rail.position.set(
    -6.2,
    6.2,
    -13.5
  );

  wardrobe.add(rail);

  for (let i = 0; i < 5; i++) {
    const x =
      -9.4 + i * 1.6;

    const support =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.025,
          0.025,
          3.8,
          8
        ),
        metalMaterial
      );

    support.position.set(
      x,
      4.3,
      -13.5
    );

    wardrobe.add(support);

    const hook =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.18,
          0.025,
          8,
          18,
          Math.PI
        ),
        metalMaterial
      );

    hook.rotation.z =
      Math.PI;

    hook.position.set(
      x,
      2.4,
      -13.5
    );

    wardrobe.add(hook);
  }

  const sign =
    createTextSign(
      "WARDROBE",
      5.8,
      0.72
    );

  sign.position.set(
    -6.3,
    7.4,
    -19.42
  );

  wardrobe.add(sign);

  parent.add(wardrobe);
}

// =====================================================
// TOILET BLOCK
// =====================================================

function createToiletBlock(parent) {
  const toiletBlock =
    new THREE.Group();

  toiletBlock.name =
    "Toilet Entrance Block";

  const blockX = 5.8;
  const blockZ = -13.2;

  const width = 9;
  const depth = 9.5;
  const height = 6.8;

  const frontZ =
    blockZ + depth / 2;

  const doorWidth = 2.1;
  const doorHeight = 4.8;
  const gap = 0.65;

  const totalDoorsWidth =
    doorWidth * 2 + gap;

  const sideSectionWidth =
    (width - totalDoorsWidth) / 2;

  // LEFT WALL
  const leftWall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.45,
        height,
        depth
      ),
      toiletWallMaterial
    );

  leftWall.position.set(
    blockX - width / 2,
    height / 2,
    blockZ
  );

  toiletBlock.add(leftWall);

  // RIGHT WALL
  const rightWall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.45,
        height,
        depth
      ),
      toiletWallMaterial
    );

  rightWall.position.set(
    blockX + width / 2,
    height / 2,
    blockZ
  );

  toiletBlock.add(rightWall);

  // BACK WALL
  const backWall =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        0.45
      ),
      toiletWallMaterial
    );

  backWall.position.set(
    blockX,
    height / 2,
    blockZ - depth / 2
  );

  toiletBlock.add(backWall);

  // FRONT LEFT SECTION
  const frontLeft =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        sideSectionWidth,
        height,
        0.45
      ),
      toiletWallMaterial
    );

  frontLeft.position.set(
    blockX -
      totalDoorsWidth / 2 -
      sideSectionWidth / 2,
    height / 2,
    frontZ
  );

  toiletBlock.add(frontLeft);

  // CENTER COLUMN
  const centerColumn =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        gap,
        height,
        0.45
      ),
      toiletWallMaterial
    );

  centerColumn.position.set(
    blockX,
    height / 2,
    frontZ
  );

  toiletBlock.add(centerColumn);

  // FRONT RIGHT SECTION
  const frontRight =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        sideSectionWidth,
        height,
        0.45
      ),
      toiletWallMaterial
    );

  frontRight.position.set(
    blockX +
      totalDoorsWidth / 2 +
      sideSectionWidth / 2,
    height / 2,
    frontZ
  );

  toiletBlock.add(frontRight);

  // TOP SECTION
  const topSection =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        totalDoorsWidth,
        height - doorHeight,
        0.45
      ),
      toiletWallMaterial
    );

  topSection.position.set(
    blockX,
    doorHeight +
      (height - doorHeight) / 2,
    frontZ
  );

  toiletBlock.add(topSection);

  // WOMEN DOOR
  createToiletDoor({
    parent: toiletBlock,

    x:
      blockX -
      gap / 2 -
      doorWidth / 2,

    y: doorHeight / 2,

    z: frontZ + 0.5,

    width: doorWidth,
    height: doorHeight,

    label: "WOMEN",
    target: "womenWC"
  });

  // MEN DOOR
  createToiletDoor({
    parent: toiletBlock,

    x:
      blockX +
      gap / 2 +
      doorWidth / 2,

    y: doorHeight / 2,

    z: frontZ + 0.5,

    width: doorWidth,
    height: doorHeight,

    label: "MEN",
    target: "menWC"
  });

  const wcSign =
    createTextSign(
      "WC",
      3.4,
      0.7
    );

  wcSign.position.set(
    blockX,
    6.05,
    frontZ + 0.5
  );

  toiletBlock.add(wcSign);

  parent.add(toiletBlock);
}

// =====================================================
// INTERACTIVE TOILET DOOR
// =====================================================

function createToiletDoor({
  parent,
  x,
  y,
  z,
  width,
  height,
  label,
  target
}) {
  const door =
    new THREE.Group();

  door.name =
    `${label} WC Door`;

  door.userData.type =
    "door";

  door.userData.target =
    target;

  // VISIBLE DOOR
  const panel =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        0.2
      ),
      doorMaterial
    );

  panel.name =
    `${label} Door Panel`;

  panel.userData.type =
    "door";

  panel.userData.target =
    target;

  panel.castShadow = true;
  panel.receiveShadow = true;

  door.add(panel);

  // LARGE INVISIBLE CLICK AREA
  const hitbox =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        width + 1.2,
        height + 1
      ),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide
      })
    );

  hitbox.name =
    `${label} Door Hitbox`;

  hitbox.position.z = 0.5;

  hitbox.userData.type =
    "door";

  hitbox.userData.target =
    target;

  hitbox.renderOrder = 999;

  door.add(hitbox);

  // HANDLE
  const handle =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.04,
        0.04,
        0.7,
        10
      ),
      metalMaterial
    );

  handle.position.set(
    width * 0.31,
    0,
    0.18
  );

  handle.userData.type =
    "door";

  handle.userData.target =
    target;

  door.add(handle);

  // LABEL
  const labelSign =
    createTextSign(
      label,
      1.5,
      0.44
    );

  labelSign.position.set(
    0,
    height * 0.29,
    0.18
  );

  labelSign.userData.type =
    "door";

  labelSign.userData.target =
    target;

  labelSign.traverse(
    (child) => {
      child.userData.type =
        "door";

      child.userData.target =
        target;
    }
  );

  door.add(labelSign);

  door.position.set(
    x,
    y,
    z
  );

  parent.add(door);
}

// =====================================================
// LIGHTS
// =====================================================

function createRoomLights(parent) {
  const generalLight =
    new THREE.PointLight(
      0xe7ebf2,
      1.25,
      34,
      2
    );

  generalLight.position.set(
    0,
    7,
    2
  );

  parent.add(generalLight);

  const toiletLight =
    new THREE.PointLight(
      0xf1eee5,
      1.1,
      18,
      2
    );

  toiletLight.position.set(
    5.8,
    5.8,
    -10
  );

  parent.add(toiletLight);

  const wardrobeLight =
    new THREE.PointLight(
      0xdde7fa,
      0.9,
      20,
      2
    );

  wardrobeLight.position.set(
    -6,
    5.5,
    -9
  );

  parent.add(wardrobeLight);
}

// =====================================================
// TEXT SIGN
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