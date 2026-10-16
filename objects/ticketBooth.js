import {
  THREE,
  camera
} from "../core/scene.js";

import {
  createSignTexture,
  createSignFaceMaterial
} from "./signText.js";

import {
  ARCHES
} from "../config/layout.js";

import {
  hasTicket
} from "../ui/ticketMenu.js";

// =====================================================
// TICKET COMPUTER INDICATORS
// =====================================================

const ticketComputerIndicators = [];

const indicatorWorldPosition =
  new THREE.Vector3();

const indicatorDirection =
  new THREE.Vector3();

const cameraDirection =
  new THREE.Vector3();

let indicatorClock = 0;

// =====================================================
// MATERIALS
// =====================================================

const counterMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x3b3d43,
    roughness: 0.86,
    metalness: 0.03
  });

const darkMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x15161a,
    roughness: 0.72,
    metalness: 0.1
  });

const metalMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x5b606a,
    roughness: 0.5,
    metalness: 0.55
  });

const computerBodyMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x0e0f13,
    roughness: 0.48,
    metalness: 0.28
  });

const screenMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x182235,
    emissive: 0x6f9edc,
    emissiveIntensity: 0.75,
    roughness: 0.42,
    metalness: 0
  });

const signPanelMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x060607,
    roughness: 0.72,
    metalness: 0.14
  });

const signEdgeMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x1c1e22,
    roughness: 0.58,
    metalness: 0.45
  });

const signBracketMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x35383f,
    roughness: 0.46,
    metalness: 0.72
  });

// =====================================================
// MAIN
// =====================================================

export function createTicketBooth(parent) {
  /*
    Стойка кассы остаётся отдельной группой,
    повёрнутой к центру холла.
  */

  const booth =
    new THREE.Group();

  booth.name =
    "Ticket Booth";

  booth.position.set(
    ARCHES.sideX - 1.6,
    0,
    ARCHES.sideZ + 1.1
  );

  booth.rotation.y =
    -Math.PI / 2;

  createCounter(booth);

  createComputer({
    parent: booth,
    x: -1.45,
    name: "Ticket Computer Left"
  });

  createComputer({
    parent: booth,
    x: 1.45,
    name: "Ticket Computer Right"
  });

  createTicketTray(booth);
  createBoothLights(booth);
  createTicketComputerIndicators(booth);

  booth.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.castShadow = false;
    child.receiveShadow = true;
  });

  parent.add(booth);

  /*
    Вывеску добавляем не внутрь повёрнутой группы booth,
    а прямо в parent.

    Благодаря этому её ориентация
    не зависит от поворота кассы.
  */

  createTicketBladeSign(parent);

  return booth;
}


// =====================================================
// UPDATE TICKET COMPUTER INDICATORS
// =====================================================

export function updateTicketBoothIndicator() {
  if (
    ticketComputerIndicators.length === 0
  ) {
    return;
  }

  indicatorClock += 0.016;

  camera.getWorldDirection(
    cameraDirection
  );

  const ticketReserved =
    hasTicket();

  ticketComputerIndicators.forEach(
    (indicator, index) => {
      indicator.getWorldPosition(
        indicatorWorldPosition
      );

      indicatorDirection
        .copy(indicatorWorldPosition)
        .sub(camera.position);

      const distance =
        indicatorDirection.length();

      indicatorDirection.normalize();

      const lookingAtIndicator =
        cameraDirection.dot(
          indicatorDirection
        );

      const shouldAppear =
        !ticketReserved &&
        distance < 24 &&
        lookingAtIndicator > 0.88;

      const pulse =
        0.82 +
        Math.sin(
          indicatorClock * 4.2 +
          index * 0.7
        ) * 0.18;

      const targetOpacity =
        shouldAppear
          ? pulse
          : 0;

      indicator.material.opacity =
        THREE.MathUtils.lerp(
          indicator.material.opacity,
          targetOpacity,
          0.12
        );

      indicator.position.y =
        indicator.userData.baseY +
        Math.sin(
          indicatorClock * 2.8 +
          index * 0.6
        ) * 0.08;

      indicator.visible =
        indicator.material.opacity > 0.015;
    }
  );
}

// =====================================================
// CREATE TICKET COMPUTER INDICATORS
// =====================================================

function createTicketComputerIndicators(
  parent
) {
  ticketComputerIndicators.length = 0;

  const texture =
    createArrowTexture();

  [-1.45, 1.45].forEach(
    (x, index) => {
      const material =
        new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: 0,
          depthTest: true,
          depthWrite: false,
          toneMapped: false
        });

      const indicator =
        new THREE.Sprite(
          material
        );

      indicator.name =
        `Ticket Computer Arrow ${
          index + 1
        }`;

      indicator.position.set(
        x,
        4.05,
        0.12
      );

      indicator.scale.set(
        0.72,
        1.2,
        1
      );

      indicator.center.set(
        0.5,
        0.18
      );

      indicator.renderOrder = 20;

      indicator.userData.baseY =
        indicator.position.y;

      indicator.visible = false;

      parent.add(indicator);

      ticketComputerIndicators.push(
        indicator
      );
    }
  );
}

// =====================================================
// ARROW TEXTURE
// =====================================================

function createArrowTexture() {
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = 256;
  canvas.height = 384;

  const context =
    canvas.getContext("2d");

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  context.lineCap =
    "round";

  context.lineJoin =
    "round";

  context.strokeStyle =
    "rgba(245, 248, 255, 0.98)";

  context.shadowColor =
    "rgba(160, 200, 255, 0.9)";

  context.shadowBlur = 22;

  context.lineWidth = 18;

  drawChevron(
    context,
    128,
    105,
    62,
    42
  );

  drawChevron(
    context,
    128,
    205,
    62,
    42
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

  texture.needsUpdate = true;

  return texture;
}

function drawChevron(
  context,
  centerX,
  centerY,
  halfWidth,
  height
) {
  context.beginPath();

  context.moveTo(
    centerX - halfWidth,
    centerY
  );

  context.lineTo(
    centerX,
    centerY + height
  );

  context.lineTo(
    centerX + halfWidth,
    centerY
  );

  context.stroke();
}

// =====================================================
// COUNTER
// =====================================================

function createCounter(parent) {
  const counter =
    new THREE.Group();

  counter.name =
    "Ticket Counter";

  const base =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        5.2,
        0.7,
        1
      ),
      darkMaterial
    );

  base.position.set(
    0,
    0.35,
    0
  );

  counter.add(base);

  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        6.2,
        1.32,
        1.35
      ),
      counterMaterial
    );

  body.position.set(
    0,
    1.2,
    0
  );

  counter.add(body);

  const top =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        6.55,
        0.16,
        1.62
      ),
      darkMaterial
    );

  top.position.set(
    0,
    1.94,
    0
  );

  counter.add(top);

  const sideExtension =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.5,
        0.95,
        1.65
      ),
      counterMaterial
    );

  sideExtension.position.set(
    3.4,
    0.77,
    0
  );

  counter.add(sideExtension);

  parent.add(counter);
}

// =====================================================
// COMPUTER
// =====================================================

function createComputer({
  parent,
  x,
  name
}) {
  const computer =
    new THREE.Group();

  computer.name = name;

  computer.userData.type =
    "ticketComputer";

  const monitorBody =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.42,
        0.94,
        0.12
      ),
      computerBodyMaterial
    );

  monitorBody.userData.type =
    "ticketComputer";

  computer.add(monitorBody);

  const screen =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        1.27,
        0.79
      ),
      screenMaterial.clone()
    );

  screen.position.z = 0.066;

  screen.userData.type =
    "ticketComputer";

  computer.add(screen);

  const stand =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.13,
        0.55,
        0.13
      ),
      metalMaterial
    );

  stand.position.y = -0.72;

  stand.userData.type =
    "ticketComputer";

  computer.add(stand);

  const standBase =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.72,
        0.08,
        0.42
      ),
      metalMaterial
    );

  standBase.position.y = -1;

  standBase.userData.type =
    "ticketComputer";

  computer.add(standBase);

  computer.position.set(
    x,
    2.72,
    0
  );

  computer.rotation.x = -0.07;

  parent.add(computer);
}

// =====================================================
// TICKET TRAY
// =====================================================

function createTicketTray(parent) {
  const tray =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.5,
        0.06,
        0.66
      ),
      metalMaterial
    );

  tray.position.set(
    0,
    2.05,
    0.35
  );

  parent.add(tray);

  const slot =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.9,
        0.035,
        0.12
      ),
      new THREE.MeshBasicMaterial({
        color: 0x020202
      })
    );

  slot.position.set(
    0,
    2.09,
    0.18
  );

  parent.add(slot);
}

// =====================================================
// PERPENDICULAR TICKETS SIGN
// =====================================================

function createTicketBladeSign(parent) {
  const root =
    new THREE.Group();

  root.name =
    "Tickets Blade Sign";

  /*
    Вывеска находится возле правой стены
    и выступает внутрь холла.

    Её лицевая сторона смотрит вдоль оси Z.
  */

  const wallX =
    ARCHES.sideX + 0.55;

  const signCenterX =
    wallX - 2;

  root.position.set(
    signCenterX,
    7.85,
    ARCHES.sideZ + 0.8
  );

  root.rotation.set(
    0,
    0,
    0
  );

  const width = 3.9;
  const height = 0.82;
  const depth = 0.12;

  const panel =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        depth
      ),
      signPanelMaterial
    );

  panel.name =
    "Tickets Sign Panel";

  root.add(panel);

  const topEdge =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width + 0.06,
        0.045,
        depth + 0.045
      ),
      signEdgeMaterial
    );

  topEdge.position.y =
    height / 2 + 0.022;

  root.add(topEdge);

  const bottomEdge =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width + 0.06,
        0.045,
        depth + 0.045
      ),
      signEdgeMaterial
    );

  bottomEdge.position.y =
    -height / 2 - 0.022;

  root.add(bottomEdge);

  const texture =
    createTextTexture(
      "TICKETS"
    );

  const frontText =
    createTextPlane({
      texture,
      width: width - 0.18,
      height: height - 0.14
    });

  frontText.position.z =
    depth / 2 + 0.008;

  root.add(frontText);

  const backText =
    createTextPlane({
      texture,
      width: width - 0.18,
      height: height - 0.14
    });

  backText.position.z =
    -depth / 2 - 0.008;

  backText.rotation.y =
    Math.PI;

  root.add(backText);

  createTicketSignBracket({
    parent: root,
    panelWidth: width
  });

  const frontGlow =
    new THREE.PointLight(
      0xdce6f5,
      0.22,
      4.8,
      2
    );

  frontGlow.position.set(
    0,
    0,
    0.8
  );

  root.add(frontGlow);

  const backGlow =
    new THREE.PointLight(
      0xdce6f5,
      0.14,
      3.8,
      2
    );

  backGlow.position.set(
    0,
    0,
    -0.8
  );

  root.add(backGlow);

  parent.add(root);
}

// =====================================================
// TICKETS SIGN BRACKET
// =====================================================

function createTicketSignBracket({
  parent,
  panelWidth
}) {
  /*
    Вывеска находится слева от правой стены.

    Поэтому крепление идёт вправо,
    обратно к стене.
  */

  const panelHalfWidth =
    panelWidth / 2;

  const bracketLength = 1.45;

  const bracket =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.035,
        0.035,
        bracketLength,
        12
      ),
      signBracketMaterial
    );

  bracket.rotation.z =
    Math.PI / 2;

  bracket.position.set(
    panelHalfWidth +
      bracketLength / 2,
    0,
    0
  );

  parent.add(bracket);

  const wallPlate =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.12,
        0.55,
        0.46
      ),
      signBracketMaterial
    );

  wallPlate.position.set(
    panelHalfWidth +
      bracketLength,
    0,
    0
  );

  parent.add(wallPlate);

  const upperSupport =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.025,
        0.025,
        0.9,
        10
      ),
      signBracketMaterial
    );

  upperSupport.position.set(
    panelHalfWidth +
      bracketLength * 0.72,
    0.38,
    0
  );

  upperSupport.rotation.z =
    Math.PI / 4;

  parent.add(upperSupport);
}

// =====================================================
// BOOTH LIGHTS
// =====================================================

function createBoothLights(parent) {
  const upperLight =
    new THREE.PointLight(
      0xdce6f8,
      1.15,
      10,
      2
    );

  upperLight.position.set(
    0,
    4.6,
    1
  );

  parent.add(upperLight);

  const screenGlow =
    new THREE.PointLight(
      0x8eb7f2,
      0.6,
      5.5,
      2
    );

  screenGlow.position.set(
    0,
    2.8,
    0.8
  );

  parent.add(screenGlow);
}

// =====================================================
// TEXT PLANE
// =====================================================

function createTextPlane({
  texture,
  width,
  height
}) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(
      width,
      height
    ),
    createSignFaceMaterial(texture)
  );
}

// =====================================================
// TEXTURE
// =====================================================

function createTextTexture(text) {
  return createSignTexture(text, 1200, 240);
}
