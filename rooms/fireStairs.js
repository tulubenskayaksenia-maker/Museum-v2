// =====================================================
// FIRE EXIT + SPIRAL STAIRS THROUGH SPACE
// rooms/fireStairs.js
// =====================================================
//
// В конце коридора — пожарная дверь с зелёной табличкой EXIT.
// За ней металлическая винтовая лестница висит в открытом космосе.
// Спуск идёт сам (камера шагает вниз по спирали), внизу —
// дверь в лобби. Кнопка SKIP пропускает спуск.

import {
  THREE,
  scene,
  camera
} from "../core/scene.js?v=2368a10";

// ---------- Параметры лестницы ----------

const STEP_COUNT = 150;
const STEP_ANGLE = 0.21;   // поворот на каждую ступеньку, рад
const STEP_RISE = 0.27;    // высота ступеньки
const INNER_R = 0.42;
const OUTER_R = 3.7;
const CAMERA_R = 2.25;
const EYE = 2.9;
const RAIL_H = 1.65;
const TOTAL_DROP = STEP_COUNT * STEP_RISE;
const RIDE_SECONDS = 26;

const metal =
  new THREE.MeshStandardMaterial({
    color: 0x5b6068,
    roughness: 0.42,
    metalness: 0.9
  });

const darkMetal =
  new THREE.MeshStandardMaterial({
    color: 0x34373d,
    roughness: 0.45,
    metalness: 0.8
  });

const doorMetal =
  new THREE.MeshStandardMaterial({
    color: 0x5d6168,
    roughness: 0.5,
    metalness: 0.6
  });

// ---------- Зелёная табличка EXIT с бегущим человечком ----------

function createExitSignTexture(label = "EXIT") {
  const W = 1024;
  const H = 400;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;

  const c = canvas.getContext("2d");

  c.fillStyle = "#0f8a4b";
  c.fillRect(0, 0, W, H);

  c.strokeStyle = "rgba(255,255,255,0.85)";
  c.lineWidth = 10;
  c.strokeRect(18, 18, W - 36, H - 36);

  // Бегущий человечек
  c.fillStyle = "#ffffff";
  c.strokeStyle = "#ffffff";
  c.lineCap = "round";
  c.lineJoin = "round";

  const ox = 120;
  const oy = 70;

  c.beginPath();
  c.arc(ox + 120, oy + 30, 30, 0, Math.PI * 2);
  c.fill();

  c.lineWidth = 34;
  c.beginPath();
  c.moveTo(ox + 105, oy + 80);   // плечи
  c.lineTo(ox + 75, oy + 170);   // таз
  c.stroke();

  c.lineWidth = 26;
  c.beginPath();                 // руки
  c.moveTo(ox + 20, oy + 120);
  c.lineTo(ox + 80, oy + 95);
  c.lineTo(ox + 115, oy + 85);
  c.lineTo(ox + 165, oy + 140);
  c.stroke();

  c.beginPath();                 // ноги
  c.moveTo(ox, oy + 260);
  c.lineTo(ox + 45, oy + 215);
  c.lineTo(ox + 75, oy + 170);
  c.lineTo(ox + 140, oy + 215);
  c.lineTo(ox + 150, oy + 270);
  c.stroke();

  // Стрелка и дверной проём
  c.fillRect(ox + 230, oy + 20, 12, 250);
  c.beginPath();
  c.moveTo(ox + 250, oy + 145);
  c.lineTo(ox + 320, oy + 145);
  c.stroke();

  // Текст
  c.font = '700 150px "Helvetica Neue", Helvetica, Arial, sans-serif';
  c.textBaseline = "middle";
  c.textAlign = "left";
  c.fillText(label, 540, H / 2 + 6);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

function createExitSign(label, width = 2.6) {
  const height = width * 400 / 1024;
  const group = new THREE.Group();

  const box =
    new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.1, height + 0.1, 0.16),
      darkMetal
    );

  box.position.z = -0.09;
  group.add(box);

  const face =
    new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({
        map: createExitSignTexture(label),
        toneMapped: false
      })
    );

  group.add(face);

  // Лёгкое зелёное свечение вокруг
  const glow = new THREE.PointLight(0x2bd17e, 2.2, 7);
  glow.position.set(0, -0.3, 0.8);
  group.add(glow);

  return group;
}

// ---------- Металлическая пожарная дверь ----------

function createMetalDoor({ target, width = 2.6, height = 4.6 }) {
  const door = new THREE.Group();
  door.name = "Fire Exit Door";

  const mark = (o) => {
    o.userData.type = "door";
    o.userData.target = target;
    return o;
  };

  mark(door);

  const frame =
    new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.4, height + 0.25, 0.2),
      darkMetal
    );

  frame.position.y = (height + 0.25) / 2;
  door.add(mark(frame));

  const panel =
    new THREE.Mesh(
      new THREE.BoxGeometry(width, height, 0.12),
      doorMetal
    );

  panel.position.set(0, height / 2, 0.1);
  door.add(mark(panel));

  // Горизонтальная ручка-штанга «PUSH»
  const bar =
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, width * 0.8, 12),
      metal
    );

  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, height * 0.46, 0.3);
  door.add(mark(bar));

  for (const x of [-width * 0.38, width * 0.38]) {
    const holder =
      new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.16, 0.18),
        metal
      );

    holder.position.set(x, height * 0.46, 0.22);
    door.add(mark(holder));
  }

  // Невидимая зона попадания чуть больше двери (удобно на телефоне)
  const hitbox =
    new THREE.Mesh(
      new THREE.PlaneGeometry(width + 1, height + 0.8),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false
      })
    );

  hitbox.position.set(0, height / 2, 0.45);
  door.add(mark(hitbox));

  const sign = createExitSign("EXIT");
  sign.position.set(0, height + 0.95, 0.05);
  door.add(sign);

  return door;
}

/*
  Дверь в конце коридора (правая стена).
  Координаты — в системе коридора.
*/
export function createFireExitDoor(corridor) {
  const door = createMetalDoor({ target: "fireStairs" });

  door.position.set(7.35, 0, -150);
  door.rotation.y = -Math.PI / 2;

  corridor.add(door);

  return door;
}

// ---------- Винтовая лестница ----------

function stepPose(i) {
  const angle = i * STEP_ANGLE;
  const y = -i * STEP_RISE;

  return { angle, y };
}

export function createFireStairs() {
  const room = new THREE.Group();
  room.name = "Fire Stairs";
  room.visible = false;

  const stepLength = OUTER_R - INNER_R;
  const stepWidth = OUTER_R * STEP_ANGLE * 1.15;

  // Ступени (одна сетка на все — быстро даже на телефоне)
  const stepGeometry = new THREE.BoxGeometry(stepLength, 0.08, stepWidth);
  const steps = new THREE.InstancedMesh(stepGeometry, metal, STEP_COUNT);

  const nosingGeometry = new THREE.BoxGeometry(stepLength, 0.1, 0.06);
  const nosings = new THREE.InstancedMesh(nosingGeometry, darkMetal, STEP_COUNT);

  const balusterGeometry = new THREE.CylinderGeometry(0.03, 0.03, RAIL_H, 6);
  const balusters = new THREE.InstancedMesh(balusterGeometry, darkMetal, STEP_COUNT);

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const one = new THREE.Vector3(1, 1, 1);

  for (let i = 0; i < STEP_COUNT; i++) {
    const { angle, y } = stepPose(i);
    const mid = (INNER_R + OUTER_R) / 2;

    q.setFromAxisAngle(up, -angle);

    m.compose(
      new THREE.Vector3(Math.cos(angle) * mid, y, Math.sin(angle) * mid),
      q,
      one
    );
    steps.setMatrixAt(i, m);

    const edgeAngle = angle + STEP_ANGLE * 0.5;
    q.setFromAxisAngle(up, -edgeAngle);
    m.compose(
      new THREE.Vector3(Math.cos(edgeAngle) * mid, y + 0.01, Math.sin(edgeAngle) * mid),
      q,
      one
    );
    nosings.setMatrixAt(i, m);

    m.compose(
      new THREE.Vector3(
        Math.cos(angle) * (OUTER_R - 0.08),
        y + RAIL_H / 2,
        Math.sin(angle) * (OUTER_R - 0.08)
      ),
      new THREE.Quaternion(),
      one
    );
    balusters.setMatrixAt(i, m);
  }

  room.add(steps, nosings, balusters);

  // Центральная стойка
  const pole =
    new THREE.Mesh(
      new THREE.CylinderGeometry(INNER_R, INNER_R, TOTAL_DROP + 9, 24),
      darkMetal
    );

  pole.position.y = -TOTAL_DROP / 2 + 1.5;
  room.add(pole);

  // Перила по спирали
  const railPoints = [];

  for (let i = -2; i <= STEP_COUNT + 2; i++) {
    const angle = i * STEP_ANGLE;
    railPoints.push(
      new THREE.Vector3(
        Math.cos(angle) * (OUTER_R - 0.08),
        -i * STEP_RISE + RAIL_H,
        Math.sin(angle) * (OUTER_R - 0.08)
      )
    );
  }

  const rail =
    new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(railPoints),
        STEP_COUNT * 3,
        0.06,
        8,
        false
      ),
      metal
    );

  room.add(rail);

  // Верхняя площадка с дверью, через которую вошли
  const topLanding =
    new THREE.Mesh(
      new THREE.CylinderGeometry(OUTER_R + 1.2, OUTER_R + 1.2, 0.12, 40, 1, false, Math.PI * 0.95, Math.PI * 0.75),
      metal
    );

  topLanding.position.y = STEP_RISE - 0.02;
  room.add(topLanding);

  const topDoor =
    createMetalDoor({ target: "corridor" });

  const topAngle = -STEP_ANGLE * 6;
  topDoor.position.set(
    Math.cos(topAngle) * (OUTER_R + 1.0),
    STEP_RISE,
    Math.sin(topAngle) * (OUTER_R + 1.0)
  );
  topDoor.lookAt(0, STEP_RISE, 0);
  room.add(topDoor);

  // Нижняя площадка и дверь в лобби
  const last = stepPose(STEP_COUNT - 1);
  const bottomY = last.y - STEP_RISE;

  const bottomLanding =
    new THREE.Mesh(
      new THREE.CylinderGeometry(OUTER_R + 1.5, OUTER_R + 1.5, 0.14, 40),
      metal
    );

  bottomLanding.position.y = bottomY;
  room.add(bottomLanding);

  const exitAngle = last.angle + STEP_ANGLE * 6;
  const lobbyDoor = createMetalDoor({ target: "entrance" });

  lobbyDoor.position.set(
    Math.cos(exitAngle) * (OUTER_R + 1.3),
    bottomY + 0.07,
    Math.sin(exitAngle) * (OUTER_R + 1.3)
  );
  lobbyDoor.lookAt(0, bottomY + 0.07, 0);

  // Табличка над нижней дверью: LOBBY
  lobbyDoor.children
    .filter((child) => child.isGroup)
    .forEach((child) => lobbyDoor.remove(child));

  const lobbySign = createExitSign("LOBBY", 3);
  lobbySign.position.set(0, 4.6 + 1.05, 0.05);
  lobbyDoor.add(lobbySign);

  room.add(lobbyDoor);

  // Свет: холодный сверху, тёплые фонари по ходу спирали
  room.add(new THREE.HemisphereLight(0xcfd8ff, 0x101015, 0.45));

  // Фонари на центральной стойке, чуть выше перил
  for (let i = 0; i <= STEP_COUNT; i += 30) {
    const { angle, y } = stepPose(i);
    const lamp = new THREE.PointLight(i % 60 ? 0xffd9a8 : 0xc9d6ff, 1.1, 11, 1.6);
    lamp.position.set(Math.cos(angle) * (INNER_R + 0.25), y + 3.2, Math.sin(angle) * (INNER_R + 0.25));
    room.add(lamp);

    const bulb =
      new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 8),
        new THREE.MeshBasicMaterial({ color: i % 60 ? 0xffe6c4 : 0xe3eaff })
      );

    bulb.position.copy(lamp.position);
    room.add(bulb);
  }

  // Космос вокруг: звёзды со всех сторон, в том числе снизу
  const starCount = 2600;
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);
  const centerY = -TOTAL_DROP / 2;

  for (let i = 0; i < starCount; i++) {
    const u = Math.random() * 2 - 1;
    const phi = Math.random() * Math.PI * 2;
    const r = 70 + Math.random() * 90;
    const k = Math.sqrt(1 - u * u);

    starPositions[i * 3] = Math.cos(phi) * k * r;
    starPositions[i * 3 + 1] = centerY + u * r;
    starPositions[i * 3 + 2] = Math.sin(phi) * k * r;

    const tint = 0.75 + Math.random() * 0.25;
    starColors[i * 3] = tint;
    starColors[i * 3 + 1] = tint;
    starColors[i * 3 + 2] = Math.min(1, tint + Math.random() * 0.2);
  }

  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

  const stars =
    new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        size: 0.55,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      })
    );

  stars.raycast = () => {}; // по звёздам не кликаем
  room.add(stars);

  // Далёкая планета внизу — ориентир, куда спускаешься
  const planet =
    new THREE.Mesh(
      new THREE.SphereGeometry(14, 48, 32),
      new THREE.MeshStandardMaterial({
        color: 0x3a4152,
        roughness: 0.9,
        metalness: 0,
        emissive: 0x0b0e16
      })
    );

  planet.position.set(38, bottomY - 34, -26);
  planet.raycast = () => {};
  room.add(planet);

  const planetLight = new THREE.DirectionalLight(0xdde7ff, 0.9);
  planetLight.position.set(-30, 20, 40);
  planetLight.target = planet;
  room.add(planetLight);

  room.userData.bottomY = bottomY;
  room.userData.exitAngle = exitAngle;

  scene.add(room);

  return room;
}

// ---------- Автоматический спуск ----------

let riding = false;
let rideStart = 0;
let rideDone = null;
let rideFrame = 0;
let skipButton = null;
let fade = null;

function ensureUi() {
  if (!skipButton) {
    skipButton = document.createElement("button");
    skipButton.id = "fire-stairs-skip";
    skipButton.type = "button";
    skipButton.textContent = "SKIP ›";
    skipButton.setAttribute("aria-label", "Skip the stairs");

    skipButton.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
    skipButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      finishRide();
    });

    document.body.appendChild(skipButton);
  }

  if (!fade) {
    fade = document.createElement("div");
    fade.id = "fire-stairs-fade";
    document.body.appendChild(fade);

    const style = document.createElement("style");
    style.textContent = `
      #fire-stairs-skip {
        position: fixed;
        left: 50%;
        bottom: max(28px, calc(env(safe-area-inset-bottom) + 18px));
        z-index: 9100;
        transform: translateX(-50%);

        display: none;
        padding: 12px 26px;

        color: rgba(255, 255, 255, 0.9);
        background: rgba(5, 5, 6, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.3);

        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);

        font: 600 11px/1 "Helvetica Neue", Helvetica, Arial, sans-serif;
        letter-spacing: 0.22em;

        cursor: pointer;
      }

      #fire-stairs-skip.visible { display: block; }

      #fire-stairs-fade {
        position: fixed;
        inset: 0;
        z-index: 9050;
        background: #000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.6s ease;
      }

      #fire-stairs-fade.on { opacity: 1; }

      /* Во время спуска подсказки и джойстик не нужны */
      body.museum-riding #museum-mobile-controls,
      body.museum-riding #museum-desktop-mouse-controls,
      body.museum-riding .museum-mobile-quick-guide,
      body.museum-riding [class*="swipe"],
      body.museum-riding [id*="swipe"] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

function cameraPose(t) {
  // Плавный разгон и замедление
  const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const stepFloat = e * (STEP_COUNT - 1);

  const angle = stepFloat * STEP_ANGLE;
  const y = -stepFloat * STEP_RISE + EYE;
  const bob = Math.sin(stepFloat * Math.PI) * 0.05;

  const pos = new THREE.Vector3(
    Math.cos(angle) * CAMERA_R,
    y + bob,
    Math.sin(angle) * CAMERA_R
  );

  // Смотрим вперёд по ходу спирали, чуть вниз и наружу — в космос
  const ahead = angle + 0.55;
  const look = new THREE.Vector3(
    Math.cos(ahead) * (CAMERA_R + 4),
    y - 4.5,
    Math.sin(ahead) * (CAMERA_R + 4)
  );

  return { pos, look };
}

function tick() {
  if (!riding) {
    return;
  }

  const t = Math.min(1, (performance.now() - rideStart) / (RIDE_SECONDS * 1000));
  const { pos, look } = cameraPose(t);

  camera.position.copy(pos);
  camera.lookAt(look);

  if (t >= 1) {
    finishRide();
    return;
  }

  rideFrame = requestAnimationFrame(tick);
}

function finishRide() {
  if (!riding) {
    return;
  }

  riding = false;
  document.body.classList.remove("museum-riding");
  cancelAnimationFrame(rideFrame);
  skipButton?.classList.remove("visible");

  const done = rideDone;
  rideDone = null;

  // Короткое затемнение — и мы в лобби
  fade?.classList.add("on");

  setTimeout(() => {
    done?.();
    setTimeout(() => fade?.classList.remove("on"), 120);
  }, 600);
}

export function startFireStairsRide(onDone) {
  ensureUi();

  riding = true;
  document.body.classList.add("museum-riding");
  rideDone = onDone;
  rideStart = performance.now();

  camera.fov = 70;
  camera.updateProjectionMatrix();

  skipButton.classList.add("visible");

  const { pos, look } = cameraPose(0);
  camera.position.copy(pos);
  camera.lookAt(look);

  rideFrame = requestAnimationFrame(tick);
}

// Прервать спуск (кнопка BACK): без перехода в лобби
export function stopFireStairsRide() {
  riding = false;
  document.body.classList.remove("museum-riding");
  rideDone = null;
  cancelAnimationFrame(rideFrame);
  skipButton?.classList.remove("visible");
}

export function isFireStairsRiding() {
  return riding;
}
