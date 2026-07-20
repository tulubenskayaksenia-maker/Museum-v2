import {
  THREE,
  scene,
  camera,
  renderer
} from "../core/scene.js";

import {
  floorMaterial,
  wallMaterial,
  darkMaterial
} from "../core/materials.js";

// =====================================================
// МОНОХРОМНАЯ ПАЛИТРА
// =====================================================

const PALETTE = {
  wall: 0x555860,
  middleGrey: 0x4b4e55,
  darkGrey: 0x24262b,
  nearBlack: 0x101114,
  black: 0x020204,
  silver: 0x777b82,
  lightSilver: 0xa4a7ad,
  offWhite: 0xe3e1dc,
  pureWhite: 0xffffff
};

// =====================================================
// МАТЕРИАЛЫ КОМНАТЫ
// =====================================================

const toiletWallMaterial =
  new THREE.MeshStandardMaterial({
    color: PALETTE.wall,
    roughness: 0.94,
    metalness: 0
  });

const doorMaterial =
  new THREE.MeshStandardMaterial({
    color: PALETTE.nearBlack,
    roughness: 0.82,
    metalness: 0.04
  });

const metalMaterial =
  new THREE.MeshStandardMaterial({
    color: PALETTE.silver,
    roughness: 0.34,
    metalness: 0.82
  });

const darkMetalMaterial =
  new THREE.MeshStandardMaterial({
    color: PALETTE.darkGrey,
    roughness: 0.38,
    metalness: 0.72
  });

const blackMetalMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x17191d,
    roughness: 0.25,
    metalness: 0.9
  });

const counterMaterial =
  new THREE.MeshStandardMaterial({
    color: PALETTE.darkGrey,
    roughness: 0.86,
    metalness: 0.02
  });

const counterTopMaterial =
  new THREE.MeshStandardMaterial({
    color: PALETTE.nearBlack,
    roughness: 0.64,
    metalness: 0.18
  });

const wardrobePanelMaterial =
  new THREE.MeshStandardMaterial({
    color: PALETTE.middleGrey,
    roughness: 0.94,
    metalness: 0
  });

const shelfMaterial =
  new THREE.MeshStandardMaterial({
    color: PALETTE.darkGrey,
    roughness: 0.68,
    metalness: 0.18
  });

// =====================================================
// МАТЕРИАЛЫ НОМЕРКОВ
// =====================================================

const ticketSupportMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x17191d,
    roughness: 0.26,
    metalness: 0.9
  });

const ticketWhiteMaterial =
  new THREE.MeshStandardMaterial({
    color: PALETTE.offWhite,
    roughness: 0.78,
    metalness: 0.02,
    emissive: 0x000000,
    emissiveIntensity: 0
  });

// =====================================================
// МАТЕРИАЛЫ ПАЛЬТО
// =====================================================

const coatMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x303238,
    roughness: 0.96,
    metalness: 0,
    side: THREE.DoubleSide
  });

const coatDetailMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x15171b,
    roughness: 0.92,
    metalness: 0,
    side: THREE.DoubleSide
  });

// =====================================================
// СОСТОЯНИЕ ГАРДЕРОБА
// =====================================================

const raycaster =
  new THREE.Raycaster();

const pointer =
  new THREE.Vector2();

const TICKET_NUMBERS = [
  101,
  102,
  103,
  104,
  105,
  106
];

const ticketObjects = [];
const hangerSlots = new Map();

let wardrobeRoom = null;
let depositedCoat = null;
let selectedNumber = null;
let interactionInstalled = false;
let coatAnimationId = 0;

// =====================================================
// СОЗДАНИЕ КОМНАТЫ
// =====================================================

export function createFacilitiesRoom() {
  resetWardrobeState();

  const room =
    new THREE.Group();

  room.name =
    "Facilities Room";

  room.visible = false;

  wardrobeRoom = room;

  createArchitecture(room);
  createCloakroom(room);
  createToiletBlock(room);
  createLighting(room);

  room.traverse((object) => {
    if (!object.isMesh) {
      return;
    }

    object.castShadow = true;
    object.receiveShadow = true;
  });

  scene.add(room);

  installWardrobeInteraction();

  return room;
}

function resetWardrobeState() {
  ticketObjects.length = 0;
  hangerSlots.clear();

  depositedCoat = null;
  selectedNumber = null;
  coatAnimationId += 1;
}

// =====================================================
// АРХИТЕКТУРА
// =====================================================

function createArchitecture(parent) {
  const roomWidth = 24;
  const roomDepth = 30;
  const roomHeight = 9;

  const centerZ = -5;
  const backWallZ = -20;

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
    leftWall.clone();

  rightWall.position.x =
    roomWidth / 2;

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
// ГАРДЕРОБНАЯ
// =====================================================

function createCloakroom(parent) {
  const cloakroom =
    new THREE.Group();

  cloakroom.name =
    "Cloakroom";

  createCloakroomShell(cloakroom);
  createCounter(cloakroom);
  createClothingRail(cloakroom);
  createCloakroomSign(cloakroom);

  parent.add(cloakroom);
}

// =====================================================
// НИША ГАРДЕРОБА
// =====================================================

function createCloakroomShell(parent) {
  const backPanel =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        10.5,
        7.2,
        0.3
      ),
      wardrobePanelMaterial
    );

  backPanel.position.set(
    -6.3,
    3.6,
    -19.2
  );

  parent.add(backPanel);

  const leftPanel =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.28,
        7.2,
        5.5
      ),
      wardrobePanelMaterial
    );

  leftPanel.position.set(
    -11.42,
    3.6,
    -16.55
  );

  parent.add(leftPanel);

  const ceilingPanel =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        10.5,
        0.2,
        5.5
      ),
      wardrobePanelMaterial
    );

  ceilingPanel.position.set(
    -6.3,
    7.18,
    -16.55
  );

  parent.add(ceilingPanel);

  const innerFloor =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        10.2,
        0.1,
        5.3
      ),
      floorMaterial
    );

  innerFloor.position.set(
    -6.3,
    0.02,
    -16.45
  );

  parent.add(innerFloor);
}

// =====================================================
// СТОЙКА
// =====================================================

function createCounter(parent) {
  const counter =
    new THREE.Group();

  counter.name =
    "Cloakroom Counter";

  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        9.5,
        1.28,
        1.22
      ),
      counterMaterial
    );

  body.position.set(
    -6.35,
    0.64,
    -10.45
  );

  counter.add(body);

  const top =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        9.8,
        0.13,
        1.5
      ),
      counterTopMaterial
    );

  top.position.set(
    -6.35,
    1.36,
    -10.45
  );

  counter.add(top);

  const frontInset =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        7.5,
        0.58,
        0.04
      ),
      darkMaterial
    );

  frontInset.position.set(
    -6.35,
    0.55,
    -9.82
  );

  counter.add(frontInset);

  createServiceBell(counter);
  createTicketRow(counter);

  parent.add(counter);
}

// =====================================================
// ЗВОНОК
// =====================================================

function createServiceBell(parent) {
  const bell =
    new THREE.Group();

  bell.name =
    "Service Bell";

  const base =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.15,
        0.18,
        0.055,
        20
      ),
      darkMetalMaterial
    );

  base.position.y =
    0.027;

  bell.add(base);

  const dome =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.13,
        20,
        10,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2
      ),
      metalMaterial
    );

  dome.position.y =
    0.055;

  bell.add(dome);

  const button =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.024,
        0.024,
        0.05,
        10
      ),
      darkMetalMaterial
    );

  button.position.y =
    0.18;

  bell.add(button);

  bell.position.set(
    -10.15,
    1.45,
    -10.22
  );

  parent.add(bell);
}

// =====================================================
// БЕЛЫЕ НОМЕРКИ НА ЛЕВОЙ ЧАСТИ СТОЛА
// =====================================================

function createTicketRow(parent) {
  const row =
    new THREE.Group();

  row.name =
    "Cloakroom Tickets";

  const spacing = 0.92;

  /*
    Группа уже получает мировые координаты,
    потому что counter сам не сдвинут целиком.
    Номерки идут слева направо по поверхности стойки.
  */

  const firstX = -8.85;

  TICKET_NUMBERS.forEach(
    (number, index) => {
      const ticket =
        createStandingTicket(number);

      ticket.position.set(
        firstX + index * spacing,
        1.43,
        -10.1
      );

      ticket.rotation.set(
        0,
        0,
        0
      );

      row.add(ticket);
      ticketObjects.push(ticket);
    }
  );

  parent.add(row);
}

function createStandingTicket(number) {
  const ticket =
    new THREE.Group();

  ticket.name =
    `Cloakroom Ticket ${number}`;

  markTicketObject(
    ticket,
    number
  );

  const foot =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.46,
        0.055,
        0.34
      ),
      ticketSupportMaterial
    );

  foot.position.set(
    0,
    0.025,
    0
  );

  markTicketObject(
    foot,
    number
  );

  ticket.add(foot);

  const stem =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.024,
        0.024,
        0.42,
        10
      ),
      ticketSupportMaterial
    );

  stem.position.y =
    0.25;

  markTicketObject(
    stem,
    number
  );

  ticket.add(stem);

  const plaqueMaterial =
    ticketWhiteMaterial.clone();

  const plaque =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.58,
        0.68,
        0.065
      ),
      plaqueMaterial
    );

  plaque.position.set(
    0,
    0.68,
    0
  );

  markTicketObject(
    plaque,
    number
  );

  ticket.userData.plaque =
    plaque;

  ticket.add(plaque);

  const texture =
    createTextTexture(
      String(number),
      {
        width: 512,
        height: 512,
        fontSize: 148,
        textColor: "#111216"
      }
    );

  const numberPlane =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        0.5,
        0.58
      ),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide
      })
    );

  numberPlane.position.set(
    0,
    0.68,
    0.034
  );

  numberPlane.renderOrder = 3;

  markTicketObject(
    numberPlane,
    number
  );

  ticket.add(numberPlane);

  const hitbox =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.78,
        1.2,
        0.46
      ),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false
      })
    );

  hitbox.position.set(
    0,
    0.54,
    0
  );

  markTicketObject(
    hitbox,
    number
  );

  ticket.add(hitbox);

  return ticket;
}

function markTicketObject(
  object,
  number
) {
  object.userData.type =
    "cloakroomTicket";

  object.userData.number =
    number;
}

// =====================================================
// ШТАНГА И ВЕШАЛКИ
// =====================================================

function createClothingRail(parent) {
  const rail =
    new THREE.Group();

  rail.name =
    "Numbered Clothing Rail";

  const width = 8.6;
  const height = 5.45;

  const leftPost =
    createMetalCylinder(
      0.055,
      height
    );

  leftPost.position.set(
    -width / 2,
    height / 2,
    0
  );

  rail.add(leftPost);

  const rightPost =
    leftPost.clone();

  rightPost.position.x =
    width / 2;

  rail.add(rightPost);

  const topRail =
    createMetalCylinder(
      0.055,
      width
    );

  topRail.rotation.z =
    Math.PI / 2;

  topRail.position.y =
    height;

  rail.add(topRail);

  const shelf =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width + 0.3,
        0.12,
        1.05
      ),
      shelfMaterial
    );

  shelf.position.y =
    6.05;

  rail.add(shelf);

  const spacing =
    width /
    TICKET_NUMBERS.length;

  const firstX =
    -width / 2 +
    spacing / 2;

  TICKET_NUMBERS.forEach(
    (number, index) => {
      const x =
        firstX +
        index * spacing;

      const hanger =
        createNumberedHanger(number);

      hanger.position.set(
        x,
        height - 0.1,
        0
      );

      rail.add(hanger);

      hangerSlots.set(
        number,
        {
          number,
          x,
          hanger,
          marker:
            hanger.userData.marker
        }
      );
    }
  );

  depositedCoat =
    createRealisticCoat();

  depositedCoat.name =
    "Deposited Visitor Coat";

  depositedCoat.visible =
    false;

  depositedCoat.position.set(
    0,
    height - 0.48,
    0.03
  );

  rail.add(depositedCoat);

  rail.position.set(
    -6.25,
    0,
    -16.25
  );

  parent.add(rail);
}

function createMetalCylinder(
  radius,
  length
) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(
      radius,
      radius,
      length,
      14
    ),
    metalMaterial
  );
}

// =====================================================
// МЕТАЛЛИЧЕСКАЯ ВЕШАЛКА
// =====================================================

function createNumberedHanger(number) {
  const hanger =
    new THREE.Group();

  hanger.name =
    `Metal Hanger ${number}`;

  const hook =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.12,
        0.017,
        7,
        20,
        Math.PI * 1.5
      ),
      blackMetalMaterial
    );

  hook.rotation.z =
    Math.PI * 0.77;

  hook.position.y =
    0.08;

  hanger.add(hook);

  const leftShoulder =
    createHangerShoulder(-1);

  const rightShoulder =
    createHangerShoulder(1);

  hanger.add(
    leftShoulder,
    rightShoulder
  );

  const bottomBar =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.015,
        0.015,
        0.76,
        8
      ),
      blackMetalMaterial
    );

  bottomBar.rotation.z =
    Math.PI / 2;

  bottomBar.position.y =
    -0.4;

  hanger.add(bottomBar);

  const marker =
    createHangerNumberMarker(
      number
    );

  marker.position.set(
    0,
    0.76,
    0.02
  );

  hanger.userData.marker =
    marker;

  hanger.add(marker);

  return hanger;
}

function createHangerShoulder(direction) {
  const shoulder =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.03,
        0.045,
        0.5,
        10
      ),
      blackMetalMaterial
    );

  shoulder.rotation.z =
    direction *
    Math.PI *
    0.34;

  shoulder.position.set(
    direction * 0.2,
    -0.2,
    0
  );

  return shoulder;
}

function createHangerNumberMarker(number) {
  const marker =
    new THREE.Group();

  const baseMaterial =
    new THREE.MeshStandardMaterial({
      color: PALETTE.nearBlack,
      roughness: 0.3,
      metalness: 0.82,
      emissive: 0x000000,
      emissiveIntensity: 0
    });

  const base =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.66,
        0.34,
        0.055
      ),
      baseMaterial
    );

  marker.userData.base =
    base;

  marker.add(base);

  const texture =
    createTextTexture(
      String(number),
      {
        width: 512,
        height: 220,
        fontSize: 112,
        textColor: "#e3e1dc"
      }
    );

  const label =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        0.58,
        0.26
      ),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide
      })
    );

  label.position.z =
    0.031;

  label.renderOrder = 3;

  marker.add(label);

  return marker;
}

// =====================================================
// ПАЛЬТО С РУКАВАМИ И ВОРОТНИКОМ
// =====================================================

function createRealisticCoat() {
  const coat =
    new THREE.Group();

  coat.name =
    "Black Museum Coat";

  const bodyShape =
    new THREE.Shape();

  bodyShape.moveTo(
    -0.52,
    -0.08
  );

  bodyShape.bezierCurveTo(
    -0.67,
    -0.18,
    -0.66,
    -0.5,
    -0.62,
    -0.78
  );

  bodyShape.lineTo(
    -0.75,
    -2.62
  );

  bodyShape.bezierCurveTo(
    -0.36,
    -2.72,
    0.36,
    -2.72,
    0.75,
    -2.62
  );

  bodyShape.lineTo(
    0.62,
    -0.78
  );

  bodyShape.bezierCurveTo(
    0.66,
    -0.5,
    0.67,
    -0.18,
    0.52,
    -0.08
  );

  bodyShape.bezierCurveTo(
    0.25,
    0.04,
    -0.25,
    0.04,
    -0.52,
    -0.08
  );

  const bodyGeometry =
    new THREE.ExtrudeGeometry(
      bodyShape,
      {
        depth: 0.22,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 3,
        curveSegments: 18
      }
    );

  bodyGeometry.translate(
    0,
    0,
    -0.11
  );

  const body =
    new THREE.Mesh(
      bodyGeometry,
      coatMaterial
    );

  body.castShadow = true;

  coat.add(body);

  coat.add(
    createCoatSleeve(-1),
    createCoatSleeve(1)
  );

  coat.add(
    createCoatCollar()
  );

  coat.add(
    createLapel(-1),
    createLapel(1)
  );

  const seam =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.018,
        1.7,
        0.018
      ),
      coatDetailMaterial
    );

  seam.position.set(
    0,
    -1.34,
    0.135
  );

  coat.add(seam);

  coat.add(
    createPocket(-1),
    createPocket(1)
  );

  const buttonGeometry =
    new THREE.CylinderGeometry(
      0.034,
      0.034,
      0.018,
      14
    );

  for (
    let index = 0;
    index < 4;
    index += 1
  ) {
    const button =
      new THREE.Mesh(
        buttonGeometry,
        coatDetailMaterial
      );

    button.rotation.x =
      Math.PI / 2;

    button.position.set(
      0.11,
      -0.72 -
        index * 0.38,
      0.145
    );

    coat.add(button);
  }

  coat.rotation.y =
    0.03;

  return coat;
}

function createCoatSleeve(direction) {
  const sleeve =
    new THREE.Group();

  const upper =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.15,
        0.98,
        6,
        12
      ),
      coatMaterial
    );

  upper.scale.set(
    1,
    1,
    0.68
  );

  upper.rotation.z =
    direction * 0.13;

  upper.position.set(
    direction * 0.65,
    -0.76,
    0
  );

  sleeve.add(upper);

  const lower =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.125,
        0.74,
        6,
        12
      ),
      coatMaterial
    );

  lower.scale.set(
    1,
    1,
    0.68
  );

  lower.rotation.z =
    direction * 0.07;

  lower.position.set(
    direction * 0.75,
    -1.64,
    0
  );

  sleeve.add(lower);

  return sleeve;
}

function createCoatCollar() {
  const collar =
    new THREE.Group();

  const left =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.32,
        0.4,
        0.1
      ),
      coatDetailMaterial
    );

  left.position.set(
    -0.17,
    -0.12,
    0.11
  );

  left.rotation.z =
    -0.37;

  collar.add(left);

  const right =
    left.clone();

  right.position.x =
    0.17;

  right.rotation.z =
    0.37;

  collar.add(right);

  return collar;
}

function createLapel(direction) {
  const shape =
    new THREE.Shape();

  shape.moveTo(
    0,
    0
  );

  shape.lineTo(
    direction * 0.34,
    -0.22
  );

  shape.lineTo(
    direction * 0.17,
    -0.9
  );

  shape.lineTo(
    0,
    -0.5
  );

  shape.closePath();

  const lapel =
    new THREE.Mesh(
      new THREE.ShapeGeometry(
        shape
      ),
      coatDetailMaterial
    );

  lapel.position.z =
    0.136;

  return lapel;
}

function createPocket(direction) {
  const pocket =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.36,
        0.052,
        0.032
      ),
      coatDetailMaterial
    );

  pocket.position.set(
    direction * 0.36,
    -1.58,
    0.145
  );

  pocket.rotation.z =
    direction * 0.14;

  return pocket;
}

// =====================================================
// ВЫВЕСКА НА ПЕРЕДНЕМ ВЫСТУПЕ НАД ВЕШАЛКАМИ
// =====================================================

function createCloakroomSign(parent) {
  const fascia =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        10.5,
        0.92,
        0.16
      ),
      wardrobePanelMaterial
    );

  fascia.position.set(
    -6.3,
    6.68,
    -13.78
  );

  parent.add(fascia);

  const title =
    createTextSign(
  "WARDROBE",
      5.8,
      0.64,
      64
    );

  title.position.set(
    -6.3,
    6.79,
    -13.68
  );

  title.rotation.set(
    0,
    0,
    0
  );

  parent.add(title);

  const subtitle =
    createTextSign(
      "SELECT A NUMBER",
      4.2,
      0.27,
      28
    );

  subtitle.position.set(
    -6.3,
    6.33,
    -13.67
  );

  subtitle.rotation.set(
    0,
    0,
    0
  );

  parent.add(subtitle);
}

// =====================================================
// ТУАЛЕТНЫЙ БЛОК
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

  const totalDoorWidth =
    doorWidth * 2 + gap;

  const sideWidth =
    (
      width -
      totalDoorWidth
    ) / 2;

  addBox({
    parent: toiletBlock,
    width: 0.45,
    height,
    depth,
    x: blockX - width / 2,
    y: height / 2,
    z: blockZ,
    material: toiletWallMaterial
  });

  addBox({
    parent: toiletBlock,
    width: 0.45,
    height,
    depth,
    x: blockX + width / 2,
    y: height / 2,
    z: blockZ,
    material: toiletWallMaterial
  });

  addBox({
    parent: toiletBlock,
    width,
    height,
    depth: 0.45,
    x: blockX,
    y: height / 2,
    z: blockZ - depth / 2,
    material: toiletWallMaterial
  });

  addBox({
    parent: toiletBlock,
    width: sideWidth,
    height,
    depth: 0.45,
    x:
      blockX -
      totalDoorWidth / 2 -
      sideWidth / 2,
    y: height / 2,
    z: frontZ,
    material: toiletWallMaterial
  });

  addBox({
    parent: toiletBlock,
    width: gap,
    height,
    depth: 0.45,
    x: blockX,
    y: height / 2,
    z: frontZ,
    material: toiletWallMaterial
  });

  addBox({
    parent: toiletBlock,
    width: sideWidth,
    height,
    depth: 0.45,
    x:
      blockX +
      totalDoorWidth / 2 +
      sideWidth / 2,
    y: height / 2,
    z: frontZ,
    material: toiletWallMaterial
  });

  addBox({
    parent: toiletBlock,
    width: totalDoorWidth,
    height:
      height - doorHeight,
    depth: 0.45,
    x: blockX,
    y:
      doorHeight +
      (
        height -
        doorHeight
      ) / 2,
    z: frontZ,
    material: toiletWallMaterial
  });

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
      3.2,
      0.62,
      62
    );

  wcSign.position.set(
    blockX,
    6.02,
    frontZ + 0.5
  );

  toiletBlock.add(wcSign);
  parent.add(toiletBlock);
}

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

  markDoorObject(
    door,
    target
  );

  const panel =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        0.2
      ),
      doorMaterial
    );

  markDoorObject(
    panel,
    target
  );

  panel.castShadow = true;
  panel.receiveShadow = true;

  door.add(panel);

  const hitbox =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        width + 1,
        height + 0.8
      ),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );

  hitbox.position.z =
    0.35;

  markDoorObject(
    hitbox,
    target
  );

  door.add(hitbox);

  const handle =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.038,
        0.038,
        0.65,
        10
      ),
      metalMaterial
    );

  handle.position.set(
    width * 0.31,
    0,
    0.18
  );

  markDoorObject(
    handle,
    target
  );

  door.add(handle);

  const labelSign =
    createTextSign(
      label,
      1.4,
      0.4,
      44
    );

  labelSign.position.set(
    0,
    height * 0.29,
    0.18
  );

  labelSign.traverse(
    (object) => {
      markDoorObject(
        object,
        target
      );
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

function markDoorObject(
  object,
  target
) {
  object.userData.type =
    "door";

  object.userData.target =
    target;
}

// =====================================================
// ИНТЕРАКТИВНОСТЬ НОМЕРКОВ
// =====================================================

function installWardrobeInteraction() {
  if (interactionInstalled) {
    return;
  }

  interactionInstalled = true;

  renderer.domElement.addEventListener(
    "pointermove",
    handleWardrobePointerMove,
    true
  );

  renderer.domElement.addEventListener(
    "click",
    handleWardrobeClick,
    true
  );
}

function handleWardrobePointerMove(event) {
  if (
    !wardrobeRoom ||
    !wardrobeRoom.visible
  ) {
    return;
  }

  const hit =
    getTicketIntersection(event);

  renderer.domElement.style.cursor =
    hit
      ? "pointer"
      : "";
}

function handleWardrobeClick(event) {
  if (
    !wardrobeRoom ||
    !wardrobeRoom.visible
  ) {
    return;
  }

  const hit =
    getTicketIntersection(event);

  if (!hit) {
    return;
  }

  const number =
    getTicketNumber(
      hit.object
    );

  if (!number) {
    return;
  }

  /*
    Не разрешаем movement.js одновременно
    интерпретировать клик как движение.
  */

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  selectCloakroomNumber(number);
}

function getTicketIntersection(event) {
  if (
    ticketObjects.length === 0
  ) {
    return null;
  }

  const bounds =
    renderer.domElement
      .getBoundingClientRect();

  pointer.x =
    (
      (
        event.clientX -
        bounds.left
      ) /
      bounds.width
    ) * 2 - 1;

  pointer.y =
    -(
      (
        event.clientY -
        bounds.top
      ) /
      bounds.height
    ) * 2 + 1;

  raycaster.setFromCamera(
    pointer,
    camera
  );

  const intersections =
    raycaster.intersectObjects(
      ticketObjects,
      true
    );

  return (
    intersections[0] ||
    null
  );
}

function getTicketNumber(object) {
  let current =
    object;

  while (current) {
    if (
      current.userData?.type ===
        "cloakroomTicket" &&
      Number.isFinite(
        current.userData.number
      )
    ) {
      return current.userData.number;
    }

    current =
      current.parent;
  }

  return null;
}

// =====================================================
// ВЫБОР НОМЕРКА
// =====================================================

function selectCloakroomNumber(number) {
  if (
    !hangerSlots.has(number)
  ) {
    return;
  }

  selectedNumber =
    number;

  updateTicketSelection();
  updateHangerSelection();
  animateCoatToNumber(number);

  showCloakroomMessage(
    `COAT STORED AT ${number}`
  );

  /*
    Сохраняем пользовательское событие,
    чтобы внешняя логика проекта при желании
    могла реагировать на гардероб.
  */

  window.dispatchEvent(
    new CustomEvent(
      "museum-cloakroom-item-deposited",
      {
        detail: {
          number
        }
      }
    )
  );
}

function updateTicketSelection() {
  ticketObjects.forEach(
    (ticket) => {
      const plaque =
        ticket.userData.plaque;

      if (!plaque?.material) {
        return;
      }

      const selected =
        ticket.userData.number ===
        selectedNumber;

      plaque.material.color.setHex(
        selected
          ? PALETTE.pureWhite
          : PALETTE.offWhite
      );

      plaque.material.emissive.setHex(
        selected
          ? 0x666666
          : 0x000000
      );

      plaque.material.emissiveIntensity =
        selected
          ? 0.32
          : 0;

      ticket.scale.setScalar(
        selected
          ? 1.08
          : 1
      );
    }
  );
}

function updateHangerSelection() {
  hangerSlots.forEach(
    (slot, number) => {
      const material =
        slot.marker
          ?.userData
          ?.base
          ?.material;

      if (!material) {
        return;
      }

      const selected =
        number ===
        selectedNumber;

      material.color.setHex(
        selected
          ? 0x555960
          : PALETTE.nearBlack
      );

      material.emissive.setHex(
        selected
          ? 0x555555
          : 0x000000
      );

      material.emissiveIntensity =
        selected
          ? 0.4
          : 0;
    }
  );
}

// =====================================================
// АНИМАЦИЯ ПАЛЬТО
// =====================================================

function animateCoatToNumber(number) {
  if (!depositedCoat) {
    return;
  }

  const slot =
    hangerSlots.get(number);

  if (!slot) {
    return;
  }

  coatAnimationId += 1;

  const currentAnimationId =
    coatAnimationId;

  const targetX =
    slot.x;

  const targetY =
    4.97;

  if (!depositedCoat.visible) {
    depositedCoat.visible =
      true;

    depositedCoat.position.set(
      targetX,
      targetY + 1.3,
      0.03
    );

    depositedCoat.scale.set(
      0.82,
      0.82,
      0.82
    );

    depositedCoat.rotation.set(
      0,
      0.06,
      -0.08
    );

    animateCoatDrop(
      currentAnimationId,
      targetX,
      targetY
    );

    return;
  }

  animateCoatTransfer(
    currentAnimationId,
    targetX,
    targetY
  );
}

function animateCoatDrop(
  animationId,
  targetX,
  targetY
) {
  const duration = 760;
  const startTime =
    performance.now();

  function frame(now) {
    if (
      animationId !==
      coatAnimationId
    ) {
      return;
    }

    const progress =
      Math.min(
        (
          now -
          startTime
        ) / duration,
        1
      );

    const eased =
      easeOutCubic(progress);

    depositedCoat.position.x =
      targetX;

    depositedCoat.position.y =
      targetY +
      (
        1 -
        eased
      ) * 1.3;

    depositedCoat.scale.setScalar(
      0.82 +
      eased * 0.18
    );

    depositedCoat.rotation.z =
      Math.sin(
        progress *
        Math.PI *
        3
      ) *
      (
        1 -
        progress
      ) *
      0.11;

    depositedCoat.rotation.y =
      0.03 +
      Math.sin(
        progress *
        Math.PI *
        2
      ) *
      (
        1 -
        progress
      ) *
      0.08;

    if (progress < 1) {
      requestAnimationFrame(
        frame
      );

      return;
    }

    depositedCoat.position.set(
      targetX,
      targetY,
      0.03
    );

    depositedCoat.scale.set(
      1,
      1,
      1
    );

    depositedCoat.rotation.set(
      0,
      0.03,
      0
    );
  }

  requestAnimationFrame(frame);
}

function animateCoatTransfer(
  animationId,
  targetX,
  targetY
) {
  const startX =
    depositedCoat.position.x;

  const startY =
    depositedCoat.position.y;

  const duration = 820;
  const startTime =
    performance.now();

  function frame(now) {
    if (
      animationId !==
      coatAnimationId
    ) {
      return;
    }

    const progress =
      Math.min(
        (
          now -
          startTime
        ) / duration,
        1
      );

    const eased =
      easeInOutCubic(progress);

    depositedCoat.position.x =
      THREE.MathUtils.lerp(
        startX,
        targetX,
        eased
      );

    depositedCoat.position.y =
      THREE.MathUtils.lerp(
        startY,
        targetY,
        eased
      ) +
      Math.sin(
        progress *
        Math.PI
      ) *
      0.5;

    depositedCoat.rotation.z =
      Math.sin(
        progress *
        Math.PI *
        2
      ) *
      0.09;

    depositedCoat.rotation.y =
      0.03 +
      Math.sin(
        progress *
        Math.PI
      ) *
      0.12;

    if (progress < 1) {
      requestAnimationFrame(
        frame
      );

      return;
    }

    depositedCoat.position.set(
      targetX,
      targetY,
      0.03
    );

    depositedCoat.rotation.set(
      0,
      0.03,
      0
    );
  }

  requestAnimationFrame(frame);
}

// =====================================================
// СООБЩЕНИЕ
// =====================================================

function showCloakroomMessage(text) {
  let message =
    document.getElementById(
      "cloakroom-message"
    );

  if (!message) {
    message =
      document.createElement(
        "div"
      );

    message.id =
      "cloakroom-message";

    Object.assign(
      message.style,
      {
        position: "fixed",
        left: "50%",
        bottom: "42px",
        transform:
          "translate(-50%, 16px)",
        zIndex: "10000",
        padding: "11px 18px",
        border:
          "1px solid rgba(227, 225, 220, 0.45)",
        background:
          "rgba(2, 2, 4, 0.92)",
        color: "#e3e1dc",
        fontFamily:
          "Arial, Helvetica, sans-serif",
        fontSize: "12px",
        fontWeight: "500",
        letterSpacing:
          "0.16em",
        textTransform:
          "uppercase",
        opacity: "0",
        pointerEvents:
          "none",
        transition:
          "opacity 220ms ease, transform 220ms ease"
      }
    );

    document.body.appendChild(
      message
    );
  }

  message.textContent =
    text;

  requestAnimationFrame(() => {
    message.style.opacity =
      "1";

    message.style.transform =
      "translate(-50%, 0)";
  });

  window.clearTimeout(
    message.hideTimer
  );

  message.hideTimer =
    window.setTimeout(() => {
      message.style.opacity =
        "0";

      message.style.transform =
        "translate(-50%, 16px)";
    }, 1800);
}

// =====================================================
// ОСВЕЩЕНИЕ
// =====================================================

function createLighting(parent) {
  const generalLight =
    new THREE.PointLight(
      0xe5e7eb,
      0.95,
      34,
      2
    );

  generalLight.position.set(
    0,
    7,
    1
  );

  parent.add(generalLight);

  const cloakroomLight =
    new THREE.RectAreaLight(
      0xd8d5cf,
      1.65,
      8,
      4
    );

  cloakroomLight.position.set(
    -6.3,
    6.1,
    -11.5
  );

  cloakroomLight.rotation.x =
    -Math.PI / 2.5;

  parent.add(cloakroomLight);

  const rearLight =
    new THREE.PointLight(
      0xc5c7cc,
      0.58,
      16,
      2
    );

  rearLight.position.set(
    -6.3,
    5.4,
    -16.2
  );

  parent.add(rearLight);

  const ticketLight =
    new THREE.PointLight(
      0xffffff,
      0.5,
      7,
      2
    );

  ticketLight.position.set(
    -6.5,
    3,
    -9.6
  );

  parent.add(ticketLight);

  const toiletLight =
    new THREE.PointLight(
      0xd8d5cf,
      0.92,
      18,
      2
    );

  toiletLight.position.set(
    5.8,
    5.8,
    -10
  );

  parent.add(toiletLight);
}

// =====================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =====================================================

function addBox({
  parent,
  width,
  height,
  depth,
  x,
  y,
  z,
  material
}) {
  const mesh =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        depth
      ),
      material
    );

  mesh.position.set(
    x,
    y,
    z
  );

  parent.add(mesh);

  return mesh;
}

function createTextSign(
  text,
  width,
  height,
  fontSize
) {
  const sign =
    new THREE.Group();

  const base =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        0.07
      ),
      darkMaterial
    );

  sign.add(base);

  const texture =
    createTextTexture(
      text,
      {
        width: 1024,
        height: 180,
        fontSize,
        textColor:
          "#e3e1dc"
      }
    );

  const plane =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        width - 0.1,
        height - 0.08
      ),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide
      })
    );

  plane.position.z =
    0.041;

  plane.renderOrder = 3;

  sign.add(plane);

  return sign;
}

function createTextTexture(
  text,
  {
    width = 1024,
    height = 180,
    fontSize = 62,
    textColor = "#e3e1dc"
  } = {}
) {
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = width;
  canvas.height = height;

  const context =
    canvas.getContext("2d");

  context.clearRect(
    0,
    0,
    width,
    height
  );

  context.font =
    `500 ${fontSize}px Arial, Helvetica, sans-serif`;

  context.textAlign =
    "center";

  context.textBaseline =
    "middle";

  context.fillStyle =
    textColor;

  context.fillText(
    text,
    width / 2,
    height / 2
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

  texture.needsUpdate =
    true;

  return texture;
}

function easeOutCubic(value) {
  return (
    1 -
    Math.pow(
      1 - value,
      3
    )
  );
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 *
      value *
      value *
      value
    : 1 -
      Math.pow(
        -2 * value + 2,
        3
      ) / 2;
}