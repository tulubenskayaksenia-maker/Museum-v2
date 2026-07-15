import {
  THREE
} from "../core/scene.js";

// =====================================================
// MATERIALS
// =====================================================

const panelMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x060607,
    roughness: 0.72,
    metalness: 0.14
  });

const edgeMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x1c1e22,
    roughness: 0.58,
    metalness: 0.45
  });

const bracketMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x35383f,
    roughness: 0.46,
    metalness: 0.72
  });

// =====================================================
// MAIN
// =====================================================

export function createCorridorSigns(parent) {
  const signsRoot =
    new THREE.Group();

  signsRoot.name =
    "Corridor Navigation Signs";

  /*
    Все вывески располагаются возле дверей,
    но их плоскость направлена вдоль коридора.

    Поэтому посетитель видит текст,
    пока идёт вперёд по оси Z.
  */

  createBladeSign({
    parent: signsRoot,

    label: "GALLERY I",

    side: "left",

    z: -16
  });

  createBladeSign({
    parent: signsRoot,

    label: "GALLERY II",

    side: "right",

    z: -16
  });

  createBladeSign({
    parent: signsRoot,

    label: "SCULPTURE",

    side: "left",

    z: -34
  });

  createBladeSign({
    parent: signsRoot,

    label: "CINEMA",

    side: "right",

    z: -34
  });

  parent.add(signsRoot);

  return signsRoot;
}

// =====================================================
// PERPENDICULAR BLADE SIGN
// =====================================================

function createBladeSign({
  parent,
  label,
  side,
  z
}) {
  const root =
    new THREE.Group();

  root.name =
    `${label} Corridor Sign`;

  const isLeft =
    side === "left";

  /*
    Стены коридора находятся около x = ±8.

    Табличка выступает из стены внутрь коридора.
  */

  const wallX =
    isLeft
      ? -7.36
      : 7.36;

  const direction =
    isLeft
      ? 1
      : -1;

  /*
    Центр таблички немного смещён
    от стены к центру коридора.
  */

  root.position.set(
    wallX +
      direction * 1.75,

    8.15,

    z
  );

  /*
    Не вращаем root на ±90°.

    BoxGeometry по умолчанию имеет
    большие лицевые поверхности по оси Z.

    Поэтому надпись обращена вдоль коридора,
    а табличка перпендикулярна боковой стене.
  */

  root.rotation.set(
    0,
    0,
    0
  );

  createPanel({
    parent: root,
    label
  });

  createWallBracket({
    parent: root,
    direction
  });

  createSignGlow({
    parent: root
  });

  parent.add(root);
}

// =====================================================
// PANEL
// =====================================================

function createPanel({
  parent,
  label
}) {
  const width = 3.5;
  const height = 0.78;
  const depth = 0.11;

  const panel =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        depth
      ),
      panelMaterial
    );

  panel.name =
    `${label} Sign Panel`;

  panel.receiveShadow = true;

  parent.add(panel);

  /*
    Тонкая металлическая верхняя грань.
  */

  const topEdge =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width + 0.06,
        0.045,
        depth + 0.045
      ),
      edgeMaterial
    );

  topEdge.position.y =
    height / 2 + 0.022;

  parent.add(topEdge);

  /*
    Текст размещаем с обеих сторон,
    чтобы вывеску было видно при движении
    как вперёд, так и назад по коридору.
  */

  const texture =
    createTextTexture(label);

  const frontText =
    createTextPlane({
      texture,
      width: width - 0.16,
      height: height - 0.13
    });

  frontText.position.z =
    depth / 2 + 0.008;

  parent.add(frontText);

  const backText =
    createTextPlane({
      texture,
      width: width - 0.16,
      height: height - 0.13
    });

  backText.position.z =
    -depth / 2 - 0.008;

  backText.rotation.y =
    Math.PI;

  parent.add(backText);
}

// =====================================================
// WALL BRACKET
// =====================================================

function createWallBracket({
  parent,
  direction
}) {
  /*
    Табличка крепится к боковой стене
    горизонтальной металлической штангой.
  */

  const bracketLength = 1.72;

  const bracket =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.035,
        0.035,
        bracketLength,
        12
      ),
      bracketMaterial
    );

  bracket.rotation.z =
    Math.PI / 2;

  /*
    Штанга направлена от центра таблички
    обратно к боковой стене.
  */

  bracket.position.set(
    -direction *
      (
        3.5 / 2 +
        bracketLength / 2
      ),

    0,
    0
  );

  parent.add(bracket);

  /*
    Настенная металлическая пластина.
  */

  const wallPlate =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.12,
        0.48,
        0.42
      ),
      bracketMaterial
    );

  wallPlate.position.set(
    -direction *
      (
        3.5 / 2 +
        bracketLength
      ),

    0,
    0
  );

  parent.add(wallPlate);

  /*
    Небольшая верхняя поддержка.
  */

  const upperSupport =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.025,
        0.025,
        0.72,
        10
      ),
      bracketMaterial
    );

  upperSupport.position.set(
    -direction *
      (
        3.5 / 2 +
        bracketLength * 0.72
      ),

    0.35,
    0
  );

  parent.add(upperSupport);
}

// =====================================================
// GLOW
// =====================================================

function createSignGlow({
  parent
}) {
  const glow =
    new THREE.PointLight(
      0xdce5f3,
      0.2,
      4.5,
      2
    );

  glow.position.set(
    0,
    0,
    0.7
  );

  parent.add(glow);
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
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
}

// =====================================================
// TEXTURE
// =====================================================

function createTextTexture(
  text
) {
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = 1200;
  canvas.height = 240;

  const context =
    canvas.getContext("2d");

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  context.font =
    "500 68px Arial, Helvetica, sans-serif";

  context.textAlign =
    "center";

  context.textBaseline =
    "middle";

  context.fillStyle =
    "#f0f2f5";

  context.shadowColor =
    "rgba(200, 218, 245, 0.55)";

  context.shadowBlur = 12;

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

  texture.needsUpdate = true;

  return texture;
}