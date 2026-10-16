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
    color: 0x4d5056,
    roughness: 0.78,
    metalness: 0.03
  });

const ceramicMaterial =
  new THREE.MeshPhysicalMaterial({
    color: 0xf2f1ec,
    roughness: 0.2,
    metalness: 0,
    clearcoat: 0.45,
    clearcoatRoughness: 0.12
  });

const ceramicInsideMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xd9dcda,
    roughness: 0.35,
    metalness: 0
  });

const counterMaterial =
  new THREE.MeshPhysicalMaterial({
    color: 0xc7c3b9,
    roughness: 0.28,
    metalness: 0.04,
    clearcoat: 0.25,
    clearcoatRoughness: 0.2
  });

const metalMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xc1c7ce,
    roughness: 0.13,
    metalness: 0.96
  });

const darkMetalMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x34383e,
    roughness: 0.28,
    metalness: 0.72
  });

const mirrorMaterial =
  new THREE.MeshPhysicalMaterial({
    color: 0xdce5ef,
    roughness: 0.025,
    metalness: 0.94,
    clearcoat: 1,
    clearcoatRoughness: 0.01,
    reflectivity: 1,
    side: THREE.DoubleSide
  });

const mirrorBackingMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x16191e,
    roughness: 0.35,
    metalness: 0.48
  });

const ledMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xfff4dc,
    emissive: 0xffe6ba,
    emissiveIntensity: 2.3,
    roughness: 0.28
  });

const drainMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x555b63,
    roughness: 0.12,
    metalness: 0.94
  });

const sensorMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x101216,
    roughness: 0.2,
    metalness: 0.35
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

  // Длинная столешница справа.
  createVanityWall({
    parent: room,
    x: 8.5,
    z: -2.5,
    rotationY: -Math.PI / 2
  });

  // Зеркало в полный рост в женском туалете.
  if (roomType === "women") {
    createFullLengthMirror({
      parent: room,
      x: -8.53,
      y: 3.05,
      z: -2.5,
      rotationY: Math.PI / 2
    });
  }

  // Кабинки в глубине.
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

    child.castShadow = true;
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

  const ceiling =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        roomWidth,
        0.18,
        roomDepth
      ),
      wallMaterial
    );

  ceiling.position.set(
    0,
    roomHeight,
    centerZ
  );

  parent.add(ceiling);
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
// VANITY WALL
// =====================================================

function createVanityWall({
  parent,
  x,
  z,
  rotationY
}) {
  const vanity =
    new THREE.Group();

  vanity.position.set(
    x,
    0,
    z
  );

  vanity.rotation.y =
    rotationY;

  const counterWidth = 11.2;
  const counterDepth = 1.3;

  // Столешница.
  const counter =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        counterWidth,
        0.2,
        counterDepth
      ),
      counterMaterial
    );

  counter.position.set(
    0,
    1.15,
    0.65
  );

  vanity.add(counter);

  // Передняя кромка.
  const frontEdge =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        counterWidth + 0.04,
        0.26,
        0.13
      ),
      ceramicMaterial
    );

  frontEdge.position.set(
    0,
    1.04,
    1.26
  );

  vanity.add(frontEdge);

  // Задняя защитная панель.
  const backsplash =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        counterWidth,
        0.42,
        0.1
      ),
      counterMaterial
    );

  backsplash.position.set(
    0,
    1.35,
    0.08
  );

  vanity.add(backsplash);

  // Нижняя панель.
  const underPanel =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        counterWidth - 0.15,
        0.55,
        0.18
      ),
      partitionMaterial
    );

  underPanel.position.set(
    0,
    0.82,
    0.18
  );

  vanity.add(underPanel);

  createCounterSupport({
    parent: vanity,
    x: -5
  });

  createCounterSupport({
    parent: vanity,
    x: 0
  });

  createCounterSupport({
    parent: vanity,
    x: 5
  });

  // Три раковины.
  // Каждая функция создаёт собственную чашу,
  // слив, трубы и отдельный кран.
  createBasin({
    parent: vanity,
    x: -3.55
  });

  createBasin({
    parent: vanity,
    x: 0
  });

  createBasin({
    parent: vanity,
    x: 3.55
  });

  createPanoramicMirror({
    parent: vanity,
    width: 10.75,
    height: 2.75,
    y: 3.08
  });

  // LED-подсветка.
  const ledHousing =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        10.45,
        0.19,
        0.17
      ),
      darkMetalMaterial
    );

  ledHousing.position.set(
    0,
    4.67,
    0.07
  );

  vanity.add(ledHousing);

  const ledBar =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        10.18,
        0.1,
        0.13
      ),
      ledMaterial
    );

  ledBar.position.set(
    0,
    4.61,
    0.17
  );

  vanity.add(ledBar);

  // Мягкий свет над столешницей.
  const vanityLight =
    new THREE.PointLight(
      0xffedd1,
      0.72,
      12,
      2
    );

  vanityLight.position.set(
    0,
    4.25,
    2
  );

  vanity.add(vanityLight);

  parent.add(vanity);
}

// =====================================================
// COUNTER SUPPORT
// =====================================================

function createCounterSupport({
  parent,
  x
}) {
  const support =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.18,
        1.02,
        0.72
      ),
      partitionMaterial
    );

  support.position.set(
    x,
    0.53,
    0.55
  );

  parent.add(support);
}

// =====================================================
// BASIN WITH INDIVIDUAL FAUCET
// =====================================================

function createBasin({
  parent,
  x
}) {
  const basin =
    new THREE.Group();

  // Очень важно:
  // вся раковина перемещается вместе со своим краном.
  basin.position.x = x;

  // ---------------------------------------------------
  // OUTER BASIN
  // ---------------------------------------------------

  const outerBasin =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.68,
        0.54,
        0.26,
        48
      ),
      ceramicMaterial
    );

  outerBasin.scale.z = 0.72;

  outerBasin.position.set(
    0,
    1.15,
    0.68
  );

  basin.add(outerBasin);

  // ---------------------------------------------------
  // INNER BASIN
  // ---------------------------------------------------

  const innerBasin =
    new THREE.Mesh(
      new THREE.CircleGeometry(
        0.51,
        48
      ),
      ceramicInsideMaterial
    );

  innerBasin.scale.y = 0.7;

  innerBasin.rotation.x =
    -Math.PI / 2;

  innerBasin.position.set(
    0,
    1.292,
    0.68
  );

  basin.add(innerBasin);

  // Внутреннее углубление.
  const basinDepth =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.47,
        0.34,
        0.16,
        48,
        1,
        true
      ),
      ceramicInsideMaterial
    );

  basinDepth.scale.z = 0.7;

  basinDepth.position.set(
    0,
    1.22,
    0.68
  );

  basin.add(basinDepth);

  // ---------------------------------------------------
  // DRAIN
  // ---------------------------------------------------

  const drain =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.09,
        0.09,
        0.025,
        28
      ),
      drainMaterial
    );

  drain.position.set(
    0,
    1.31,
    0.68
  );

  basin.add(drain);

  // Кольцо вокруг слива.
  const drainRing =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.105,
        0.012,
        10,
        28
      ),
      metalMaterial
    );

  drainRing.rotation.x =
    Math.PI / 2;

  drainRing.position.set(
    0,
    1.325,
    0.68
  );

  basin.add(drainRing);

  // ---------------------------------------------------
  // REALISTIC FAUCET BASE
  // ---------------------------------------------------

  const faucetBase =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.13,
        0.15,
        0.1,
        32
      ),
      metalMaterial
    );

  faucetBase.position.set(
    0,
    1.28,
    0.18
  );

  basin.add(faucetBase);

  const baseRing =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.135,
        0.018,
        10,
        32
      ),
      metalMaterial
    );

  baseRing.rotation.x =
    Math.PI / 2;

  baseRing.position.set(
    0,
    1.335,
    0.18
  );

  basin.add(baseRing);

  // ---------------------------------------------------
  // FAUCET: стойка → изгиб вперёд → излив вниз
  // ---------------------------------------------------
  // Геометрия крана в плоскости «вверх/вперёд» (оси Y и Z).
  const FAUCET_Z = 0.18;
  const FAUCET_R = 0.2;
  const FAUCET_TOP = 1.62;
  const SPOUT_Y = FAUCET_TOP + FAUCET_R;
  const SPOUT_END_Z = 0.66;

  const faucetStem =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.055,
        0.07,
        0.32,
        32
      ),
      metalMaterial
    );

  faucetStem.position.set(
    0,
    FAUCET_TOP - 0.16,
    FAUCET_Z
  );

  basin.add(faucetStem);

  // Плавный изгиб: четверть кольца, лежащая в плоскости Y–Z.
  const neckGeometry =
    new THREE.TorusGeometry(
      FAUCET_R,
      0.055,
      16,
      32,
      Math.PI / 2
    );

  // Дуга от «верха» к «левому краю», потом поворот в плоскость Y–Z.
  neckGeometry.rotateZ(Math.PI / 2);

  const faucetCurve =
    new THREE.Mesh(
      neckGeometry,
      metalMaterial
    );

  faucetCurve.rotation.y =
    -Math.PI / 2;

  faucetCurve.position.set(
    0,
    FAUCET_TOP,
    FAUCET_Z + FAUCET_R
  );

  basin.add(faucetCurve);

  // Горизонтальный излив.
  const spoutLength =
    SPOUT_END_Z -
    (FAUCET_Z + FAUCET_R);

  const faucetSpout =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.055,
        0.055,
        spoutLength,
        24
      ),
      metalMaterial
    );

  faucetSpout.rotation.x =
    Math.PI / 2;

  faucetSpout.position.set(
    0,
    SPOUT_Y,
    FAUCET_Z + FAUCET_R + spoutLength / 2
  );

  basin.add(faucetSpout);

  // Закруглённый конец излива.
  const faucetCap =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.055,
        20,
        14
      ),
      metalMaterial
    );

  faucetCap.position.set(
    0,
    SPOUT_Y,
    SPOUT_END_Z
  );

  basin.add(faucetCap);

  // Наконечник смотрит вниз, на слив.
  const faucetTip =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.05,
        0.06,
        0.09,
        24
      ),
      metalMaterial
    );

  faucetTip.position.set(
    0,
    SPOUT_Y - 0.06,
    SPOUT_END_Z
  );

  basin.add(faucetTip);

  // Тёмный аэратор: смотрит вниз.
  const aerator =
    new THREE.Mesh(
      new THREE.CircleGeometry(
        0.042,
        20
      ),
      sensorMaterial
    );

  aerator.rotation.x =
    Math.PI / 2;

  aerator.position.set(
    0,
    SPOUT_Y - 0.107,
    SPOUT_END_Z
  );

  basin.add(aerator);

  // ---------------------------------------------------
  // AUTOMATIC SENSOR
  // ---------------------------------------------------

  const sensor =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.065,
        0.045,
        0.025
      ),
      sensorMaterial
    );

  sensor.position.set(
    0,
    1.54,
    0.116
  );

  basin.add(sensor);

  // Маленький индикатор сенсора.
  const sensorLight =
    new THREE.Mesh(
      new THREE.CircleGeometry(
        0.009,
        12
      ),
      new THREE.MeshBasicMaterial({
        color: 0x88b7d8
      })
    );

  sensorLight.position.set(
    0,
    1.54,
    0.101
  );

  basin.add(sensorLight);

  // ---------------------------------------------------
  // PIPE UNDER BASIN
  // ---------------------------------------------------

  const pipe =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.065,
        0.065,
        0.55,
        20
      ),
      metalMaterial
    );

  pipe.position.set(
    0,
    0.78,
    0.68
  );

  basin.add(pipe);

  // S-образное колено.
  const pipeCurve =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.17,
        0.052,
        12,
        30,
        Math.PI
      ),
      metalMaterial
    );

  pipeCurve.rotation.z =
    Math.PI / 2;

  pipeCurve.position.set(
    0,
    0.51,
    0.53
  );

  basin.add(pipeCurve);

  const wallPipe =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.058,
        0.058,
        0.3,
        18
      ),
      metalMaterial
    );

  wallPipe.rotation.x =
    Math.PI / 2;

  wallPipe.position.set(
    0,
    0.51,
    0.28
  );

  basin.add(wallPipe);

  parent.add(basin);
}

// =====================================================
// PANORAMIC MIRROR
// =====================================================

function createPanoramicMirror({
  parent,
  width,
  height,
  y
}) {
  const mirrorGroup =
    new THREE.Group();

  const backing =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width + 0.18,
        height + 0.18,
        0.1
      ),
      mirrorBackingMaterial
    );

  backing.position.set(
    0,
    y,
    0.03
  );

  mirrorGroup.add(backing);

  const glass =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        0.035
      ),
      mirrorMaterial
    );

  glass.position.set(
    0,
    y,
    0.105
  );

  mirrorGroup.add(glass);

  createMirrorFrame({
    parent: mirrorGroup,
    width: width + 0.18,
    height: height + 0.18,
    centerY: y,
    z: 0.14,
    thickness: 0.075
  });

  // Световой блик.
  const reflectionStrip =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        width * 0.1,
        height * 0.9
      ),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.055,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );

  reflectionStrip.position.set(
    -width * 0.3,
    y,
    0.128
  );

  reflectionStrip.rotation.z =
    -0.14;

  mirrorGroup.add(
    reflectionStrip
  );

  parent.add(mirrorGroup);
}

// =====================================================
// FULL-LENGTH MIRROR
// =====================================================

function createFullLengthMirror({
  parent,
  x,
  y,
  z,
  rotationY
}) {
  const mirrorGroup =
    new THREE.Group();

  mirrorGroup.position.set(
    x,
    y,
    z
  );

  mirrorGroup.rotation.y =
    rotationY;

  const width = 2.8;
  const height = 5.35;

  const backing =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width + 0.18,
        height + 0.18,
        0.11
      ),
      mirrorBackingMaterial
    );

  mirrorGroup.add(backing);

  const glass =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        0.035
      ),
      mirrorMaterial
    );

  glass.position.z = 0.075;

  mirrorGroup.add(glass);

  createMirrorFrame({
    parent: mirrorGroup,
    width: width + 0.18,
    height: height + 0.18,
    centerY: 0,
    z: 0.11,
    thickness: 0.085
  });

  const reflectionStrip =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        0.42,
        height * 0.9
      ),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.06,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );

  reflectionStrip.position.set(
    -0.65,
    0,
    0.1
  );

  reflectionStrip.rotation.z =
    -0.1;

  mirrorGroup.add(
    reflectionStrip
  );

  const mirrorLight =
    new THREE.PointLight(
      0xffefd6,
      0.4,
      6,
      2
    );

  mirrorLight.position.set(
    0,
    2.8,
    1.2
  );

  mirrorGroup.add(
    mirrorLight
  );

  parent.add(mirrorGroup);
}

// =====================================================
// MIRROR FRAME
// =====================================================

function createMirrorFrame({
  parent,
  width,
  height,
  centerY,
  z,
  thickness
}) {
  const top =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        thickness,
        thickness
      ),
      darkMetalMaterial
    );

  top.position.set(
    0,
    centerY + height / 2,
    z
  );

  parent.add(top);

  const bottom =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        thickness,
        thickness
      ),
      darkMetalMaterial
    );

  bottom.position.set(
    0,
    centerY - height / 2,
    z
  );

  parent.add(bottom);

  const left =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        thickness,
        height,
        thickness
      ),
      darkMetalMaterial
    );

  left.position.set(
    -width / 2,
    centerY,
    z
  );

  parent.add(left);

  const right =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        thickness,
        height,
        thickness
      ),
      darkMetalMaterial
    );

  right.position.set(
    width / 2,
    centerY,
    z
  );

  parent.add(right);
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
        width - 0.34,
        4.85,
        0.15
      ),
      darkMaterial
    );

  door.position.set(
    0,
    2.67,
    depth / 2
  );

  cabin.add(door);

  const handle =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.055,
        0.055,
        0.35,
        16
      ),
      metalMaterial
    );

  handle.rotation.x =
    Math.PI / 2;

  handle.position.set(
    width * 0.32,
    2.7,
    depth / 2 + 0.13
  );

  cabin.add(handle);

  const toiletBase =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.54,
        0.68,
        0.7,
        32
      ),
      ceramicMaterial
    );

  toiletBase.position.set(
    0,
    0.35,
    -0.8
  );

  cabin.add(toiletBase);

  const bowl =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.65,
        0.53,
        0.32,
        32
      ),
      ceramicMaterial
    );

  bowl.scale.z = 1.22;

  bowl.position.set(
    0,
    0.72,
    -0.73
  );

  cabin.add(bowl);

  const bowlInside =
    new THREE.Mesh(
      new THREE.CircleGeometry(
        0.47,
        32
      ),
      ceramicInsideMaterial
    );

  bowlInside.scale.y = 1.15;

  bowlInside.rotation.x =
    -Math.PI / 2;

  bowlInside.position.set(
    0,
    0.9,
    -0.73
  );

  cabin.add(bowlInside);

  const toiletSeat =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.52,
        0.095,
        14,
        36
      ),
      ceramicMaterial
    );

  toiletSeat.scale.y = 1.18;

  toiletSeat.rotation.x =
    Math.PI / 2;

  toiletSeat.position.set(
    0,
    0.94,
    -0.73
  );

  cabin.add(toiletSeat);

  const flushTank =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.25,
        1,
        0.38
      ),
      ceramicMaterial
    );

  flushTank.position.set(
    0,
    1.25,
    -1.58
  );

  cabin.add(flushTank);

  const flushButton =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.09,
        0.09,
        0.035,
        20
      ),
      metalMaterial
    );

  flushButton.position.set(
    0,
    1.77,
    -1.58
  );

  cabin.add(flushButton);

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
  const hemisphereLight =
    new THREE.HemisphereLight(
      0xf2f5fa,
      0x27292d,
      0.72
    );

  parent.add(
    hemisphereLight
  );

  const entranceLight =
    new THREE.PointLight(
      0xfff1d9,
      1.15,
      25,
      2
    );

  entranceLight.position.set(
    0,
    6.2,
    3
  );

  parent.add(
    entranceLight
  );

  const middleLight =
    new THREE.PointLight(
      0xf2f4f7,
      1,
      24,
      2
    );

  middleLight.position.set(
    2,
    6.4,
    -4
  );

  parent.add(
    middleLight
  );

  const backLight =
    new THREE.PointLight(
      0xe2eaf5,
      0.95,
      20,
      2
    );

  backLight.position.set(
    0,
    5.6,
    -12
  );

  parent.add(
    backLight
  );
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

  plane.position.z = 0.046;

  sign.add(plane);

  return sign;
}

function createTextTexture(text) {
  const canvas =
    document.createElement(
      "canvas"
    );

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