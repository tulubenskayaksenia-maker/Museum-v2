// =====================================================
// MUSEUM SHOP
// rooms/shopRoom.js
// =====================================================
//
// Небольшой магазин в конце галерей: прилавок с QR-кодом
// «поддержать музей», витрина со стикерами и выход сразу
// в лобби, чтобы не идти обратно через весь коридор.

import {
  THREE,
  scene
} from "../core/scene.js?v=384ad6f";

import {
  floorMaterial,
  wallMaterial
} from "../core/materials.js?v=384ad6f";

import {
  createArchPortal,
  createWallWithArchOpening
} from "../objects/arch.js?v=384ad6f";

import {
  createSignTexture,
  createSignFaceMaterial
} from "../objects/signText.js?v=384ad6f";

export const SHOP_STICKERS = [
  "logo",
  "coat",
  "opening-night",
  "cloakroom-ticket",
  "incognito-museum",
  "arch",
  "ticket-desk",
  "see-you-inside"
];

const counterMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x111214,
    roughness: 0.55,
    metalness: 0.2
  });

const counterTopMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xe9e7e1,
    roughness: 0.35,
    metalness: 0.05
  });

const boardMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x1a1b1f,
    roughness: 0.8,
    metalness: 0.05
  });

// Всё, по чему можно кликнуть, чтобы открыть окно магазина
function markShop(object) {
  object.userData.type = "shopCounter";
  return object;
}

function createSign(text, width, height, canvasWidth = 1500) {
  const canvasHeight =
    Math.round(canvasWidth * height / width);

  const sign =
    new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      createSignFaceMaterial(
        createSignTexture(text, canvasWidth, canvasHeight)
      )
    );

  const back =
    new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.08, height + 0.08, 0.1),
      counterMaterial
    );

  back.position.z = -0.06;

  const group = new THREE.Group();
  group.add(back);
  group.add(sign);

  return group;
}

export function createShopRoom() {
  const room = new THREE.Group();

  room.name = "Museum Shop";
  room.visible = false;

  const roomWidth = 22;
  const roomHeight = 12;
  const frontZ = 9.45;
  const backZ = -16;
  const depth = frontZ - backZ;
  const centerZ = (frontZ + backZ) / 2;

  // ==========================================
  // FLOOR AND WALLS (сверху — небо, как в залах)
  // ==========================================

  const floor =
    new THREE.Mesh(
      new THREE.BoxGeometry(roomWidth, 0.14, depth + 2),
      floorMaterial
    );

  floor.position.set(0, -0.07, centerZ);
  room.add(floor);

  const backWall =
    new THREE.Mesh(
      new THREE.BoxGeometry(roomWidth, roomHeight, 0.8),
      wallMaterial
    );

  backWall.position.set(0, roomHeight / 2, backZ);
  room.add(backWall);

  const rightWall =
    new THREE.Mesh(
      new THREE.BoxGeometry(0.8, roomHeight, depth + 1),
      wallMaterial
    );

  rightWall.position.set(roomWidth / 2, roomHeight / 2, centerZ);
  room.add(rightWall);

  // Левая стена с аркой выхода в лобби
  const exitZ = -3;

  const leftWall =
    createWallWithArchOpening({
      wallWidth: depth + 1,
      wallHeight: roomHeight,
      wallDepth: 0.8,
      openingWidth: 4.3,
      openingHeight: 6.6,
      material: wallMaterial
    });

  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-roomWidth / 2, 0, centerZ - (centerZ - exitZ));
  room.add(leftWall);

  // Стена с аркой, через которую вошли из коридора
  const entranceWall =
    createWallWithArchOpening({
      wallWidth: roomWidth,
      wallHeight: roomHeight,
      wallDepth: 0.8,
      openingWidth: 4.3,
      openingHeight: 6.6,
      material: wallMaterial
    });

  entranceWall.position.set(0, 0, frontZ);
  room.add(entranceWall);

  // Выход обратно в коридор
  const returnDoor =
    createArchPortal({
      width: 5,
      height: 7.15,
      openingWidth: 4.3,
      openingHeight: 6.6,
      depth: 0.72,
      target: "corridor",
      showDarkOpening: false
    });

  returnDoor.position.set(0, 0, frontZ - 0.45);
  returnDoor.rotation.y = Math.PI;
  room.add(returnDoor);

  // Выход в лобби
  const lobbyDoor =
    createArchPortal({
      width: 5,
      height: 7.15,
      openingWidth: 4.3,
      openingHeight: 6.6,
      depth: 0.72,
      target: "entrance",
      showDarkOpening: true
    });

  lobbyDoor.position.set(-roomWidth / 2 + 0.45, 0, exitZ);
  lobbyDoor.rotation.y = Math.PI / 2;
  room.add(lobbyDoor);

  const lobbySign =
    createSign("EXIT · LOBBY", 4.6, 0.75);

  lobbySign.position.set(-roomWidth / 2 + 0.5, 8.1, exitZ);
  lobbySign.rotation.y = Math.PI / 2;
  room.add(lobbySign);

  // ==========================================
  // SHOP SIGN ON THE BACK WALL
  // ==========================================

  const shopSign =
    createSign("SHOP", 7, 1.3);

  shopSign.position.set(0, 8.2, backZ + 0.5);
  room.add(shopSign);

  const shopSub =
    createSign("STICKERS · SUPPORT THE MUSEUM", 7, 0.55, 2000);

  shopSub.position.set(0, 7.15, backZ + 0.5);
  room.add(shopSub);

  // ==========================================
  // COUNTER WITH QR CODE
  // ==========================================

  const counterZ = -9;

  const counter = new THREE.Group();
  counter.name = "Shop Counter";
  markShop(counter);

  const body =
    markShop(new THREE.Mesh(
      new THREE.BoxGeometry(7, 2.1, 1.7),
      counterMaterial
    ));

  body.position.y = 1.05;
  counter.add(body);

  const top =
    markShop(new THREE.Mesh(
      new THREE.BoxGeometry(7.3, 0.12, 1.9),
      counterTopMaterial
    ));

  top.position.y = 2.16;
  counter.add(top);

  // Подставка с QR-кодом (смотрит на посетителя)
  const loader = new THREE.TextureLoader();

  const qrTexture =
    loader.load("./IMG_8960.JPG");

  qrTexture.colorSpace = THREE.SRGBColorSpace;

  const qrStand = new THREE.Group();

  const qrBack =
    markShop(new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.45, 0.08),
      counterTopMaterial
    ));

  qrStand.add(qrBack);

  const qr =
    markShop(new THREE.Mesh(
      new THREE.PlaneGeometry(1.3, 1.18),
      new THREE.MeshBasicMaterial({ map: qrTexture, toneMapped: false })
    ));

  qr.position.z = 0.045;
  qrStand.add(qr);

  qrStand.position.set(1.6, 2.95, 0.2);
  qrStand.rotation.x = -0.18;
  counter.add(qrStand);

  // Табличка на прилавке
  const card =
    createSign("SUPPORT THE MUSEUM", 3, 0.5, 1800);

  card.traverse(markShop);
  card.position.set(-1.5, 2.5, 0.7);
  card.rotation.x = -0.35;
  counter.add(card);

  counter.position.set(0, 0, counterZ);
  room.add(counter);

  // ==========================================
  // STICKER WALL (правая стена)
  // ==========================================

  const board = new THREE.Group();
  board.name = "Sticker Wall";

  const boardPanel =
    markShop(new THREE.Mesh(
      new THREE.BoxGeometry(9, 5.4, 0.12),
      boardMaterial
    ));

  board.add(boardPanel);

  SHOP_STICKERS.forEach((name, index) => {
    const tex =
      loader.load(`./assets/stickers/${name}.png`);

    tex.colorSpace = THREE.SRGBColorSpace;

    const sticker =
      markShop(new THREE.Mesh(
        new THREE.PlaneGeometry(1.75, 1.75),
        new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          toneMapped: false,
          depthWrite: false
        })
      ));

    const col = index % 4;
    const row = Math.floor(index / 4);

    sticker.position.set(
      -3.3 + col * 2.2,
      1.15 - row * 2.2,
      0.08
    );

    sticker.rotation.z = (index % 2 ? 1 : -1) * 0.05;

    board.add(sticker);
  });

  const boardSign =
    createSign("STICKERS · FREE", 4, 0.6);

  boardSign.position.set(0, 3.25, 0.05);
  board.add(boardSign);

  board.position.set(roomWidth / 2 - 0.5, 4.2, -6);
  board.rotation.y = -Math.PI / 2;
  room.add(board);

  // ==========================================
  // LIGHTING
  // ==========================================

  room.add(
    new THREE.HemisphereLight(0xe8ebf1, 0x303238, 0.9)
  );

  for (const [x, y, z] of [[0, 8.5, 2], [0, 8.5, -9], [7, 7.5, -6], [-7, 7.5, -3]]) {
    const light = new THREE.PointLight(0xffffff, 1.1, 22);
    light.position.set(x, y, z);
    room.add(light);
  }

  const counterSpot =
    new THREE.SpotLight(0xffffff, 40, 20, 0.5, 0.6);

  counterSpot.position.set(0, 10, counterZ + 3);
  counterSpot.target.position.set(0, 2, counterZ);
  room.add(counterSpot);
  room.add(counterSpot.target);

  room.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(room);

  return room;
}
