// =====================================================
// FIRE EXIT + SPIRAL STAIRS THROUGH SPACE
// rooms/fireStairs.js
// =====================================================
//
// В конце коридора — пожарная дверь, над ней двусторонняя
// табличка EXIT перпендикулярно стене (видно издалека).
// За дверью — металлическая винтовая лестница среди настоящего
// звёздного неба. Камера спускается сама, следуя за лестницей
// чуть сверху и снаружи, чтобы была видна вся спираль.
//  - свайп / мышь — оглядеться;
//  - зажать палец или кнопку — пауза;
//  - SKIP — сразу вниз;
//  - внизу дверь LOBBY: её нажимает сам посетитель.

import {
  THREE,
  scene,
  camera
} from "../core/scene.js";

import {
  createStarMap
} from "../objects/starMap.js";

// ---------- Параметры лестницы ----------

const STEP_COUNT = 96;
const STEP_ANGLE = 0.17;   // ≈ 2.6 витка, без резких поворотов
const STEP_RISE = 0.3;
const INNER_R = 0.45;
const OUTER_R = 3.8;
const RAIL_H = 1.7;
const TOTAL_DROP = STEP_COUNT * STEP_RISE;
const RIDE_SECONDS = 18;

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

// ---------- Зелёная табличка с бегущим человечком ----------

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
  c.moveTo(ox + 105, oy + 80);
  c.lineTo(ox + 75, oy + 170);
  c.stroke();

  c.lineWidth = 26;
  c.beginPath();
  c.moveTo(ox + 20, oy + 120);
  c.lineTo(ox + 80, oy + 95);
  c.lineTo(ox + 115, oy + 85);
  c.lineTo(ox + 165, oy + 140);
  c.stroke();

  c.beginPath();
  c.moveTo(ox, oy + 260);
  c.lineTo(ox + 45, oy + 215);
  c.lineTo(ox + 75, oy + 170);
  c.lineTo(ox + 140, oy + 215);
  c.lineTo(ox + 150, oy + 270);
  c.stroke();

  c.fillRect(ox + 230, oy + 20, 12, 250);
  c.beginPath();
  c.moveTo(ox + 250, oy + 145);
  c.lineTo(ox + 320, oy + 145);
  c.stroke();

  let size = 150;
  c.font = `700 ${size}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  c.textBaseline = "middle";
  c.textAlign = "left";

  while (c.measureText(label).width > W - 580 && size > 60) {
    size -= 6;
    c.font = `700 ${size}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  }

  c.fillText(label, 540, H / 2 + 6);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

// doubleSided — табличка видна с обеих сторон (для «лопасти» в коридоре)
function createExitSign(label, width = 2.6, doubleSided = false) {
  const height = width * 400 / 1024;
  const group = new THREE.Group();
  const texture = createExitSignTexture(label);

  group.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.1, height + 0.1, 0.16),
      darkMetal
    )
  );

  const faceMaterial =
    new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });

  const front = new THREE.Mesh(new THREE.PlaneGeometry(width, height), faceMaterial);
  front.position.z = 0.085;
  group.add(front);

  if (doubleSided) {
    const back = new THREE.Mesh(new THREE.PlaneGeometry(width, height), faceMaterial);
    back.position.z = -0.085;
    back.rotation.y = Math.PI;
    group.add(back);
  }

  const glow = new THREE.PointLight(0x2bd17e, 2.0, 7);
  glow.position.set(0, -0.6, 0);
  group.add(glow);

  return group;
}

// ---------- Металлическая дверь ----------

function createMetalDoor({ target, width = 2.6, height = 4.6, label = null }) {
  const door = new THREE.Group();
  door.name = `Metal Door to ${target}`;

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

  if (label) {
    const sign = createExitSign(label, 3);
    sign.position.set(0, height + 0.95, 0.1);
    door.add(sign);
  }

  return door;
}

/*
  Дверь в конце коридора (правая стена) и табличка-«лопасть»
  перпендикулярно стене над ней. Координаты — коридора.
*/
export function createFireExitDoor(corridor) {
  const z = -150;
  const doorHeight = 4.6;

  const door = createMetalDoor({ target: "fireStairs", height: doorHeight });

  door.position.set(7.35, 0, z);
  door.rotation.y = -Math.PI / 2;
  corridor.add(door);

  // Кронштейн из стены и двусторонняя табличка вдоль коридора
  const signY = doorHeight + 1.5;
  const signWidth = 2.6;

  const bracket =
    new THREE.Mesh(
      new THREE.BoxGeometry(signWidth + 0.5, 0.06, 0.06),
      darkMetal
    );

  bracket.position.set(7.4 - (signWidth + 0.5) / 2, signY + 0.62, z);
  corridor.add(bracket);

  const blade = createExitSign("EXIT", signWidth, true);
  blade.position.set(7.4 - signWidth / 2 - 0.25, signY, z);
  corridor.add(blade);

  return door;
}

// ---------- Винтовая лестница ----------

function stepPose(i) {
  return { angle: i * STEP_ANGLE, y: -i * STEP_RISE };
}

let stairsRoom = null;

export function createFireStairs() {
  const room = new THREE.Group();
  room.name = "Fire Stairs";
  room.visible = false;

  const stepLength = OUTER_R - INNER_R;
  const stepWidth = OUTER_R * STEP_ANGLE * 1.15;

  const steps =
    new THREE.InstancedMesh(
      new THREE.BoxGeometry(stepLength, 0.09, stepWidth),
      metal,
      STEP_COUNT
    );

  const nosings =
    new THREE.InstancedMesh(
      new THREE.BoxGeometry(stepLength, 0.11, 0.06),
      darkMetal,
      STEP_COUNT
    );

  const balusters =
    new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.03, 0.03, RAIL_H, 6),
      darkMetal,
      STEP_COUNT
    );

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const one = new THREE.Vector3(1, 1, 1);
  const mid = (INNER_R + OUTER_R) / 2;

  for (let i = 0; i < STEP_COUNT; i++) {
    const { angle, y } = stepPose(i);

    q.setFromAxisAngle(up, -angle);
    m.compose(new THREE.Vector3(Math.cos(angle) * mid, y, Math.sin(angle) * mid), q, one);
    steps.setMatrixAt(i, m);

    const edge = angle + STEP_ANGLE * 0.5;
    q.setFromAxisAngle(up, -edge);
    m.compose(new THREE.Vector3(Math.cos(edge) * mid, y + 0.01, Math.sin(edge) * mid), q, one);
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

  const pole =
    new THREE.Mesh(
      new THREE.CylinderGeometry(INNER_R, INNER_R, TOTAL_DROP + 8, 24),
      darkMetal
    );

  pole.position.y = -TOTAL_DROP / 2 + 2;
  room.add(pole);

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

  room.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPoints), STEP_COUNT * 3, 0.06, 8, false),
      metal
    )
  );

  // Верхняя площадка и дверь обратно в коридор
  const topLanding =
    new THREE.Mesh(
      new THREE.CylinderGeometry(OUTER_R + 1.2, OUTER_R + 1.2, 0.12, 40, 1, false, Math.PI * 0.95, Math.PI * 0.75),
      metal
    );

  topLanding.position.y = STEP_RISE - 0.02;
  room.add(topLanding);

  const topDoor = createMetalDoor({ target: "corridor" });
  const topAngle = -STEP_ANGLE * 6;

  topDoor.position.set(
    Math.cos(topAngle) * (OUTER_R + 1.0),
    STEP_RISE,
    Math.sin(topAngle) * (OUTER_R + 1.0)
  );
  topDoor.lookAt(0, STEP_RISE, 0);
  room.add(topDoor);

  // Нижняя площадка и дверь LOBBY
  const last = stepPose(STEP_COUNT - 1);
  const bottomY = last.y - STEP_RISE;

  const bottomLanding =
    new THREE.Mesh(
      new THREE.CylinderGeometry(OUTER_R + 2, OUTER_R + 2, 0.14, 48),
      metal
    );

  bottomLanding.position.y = bottomY;
  room.add(bottomLanding);

  const exitAngle = last.angle + STEP_ANGLE * 7;
  const doorR = OUTER_R + 1.7;
  const lobbyDoor = createMetalDoor({ target: "entrance", label: "LOBBY" });

  lobbyDoor.position.set(Math.cos(exitAngle) * doorR, bottomY + 0.07, Math.sin(exitAngle) * doorR);
  lobbyDoor.lookAt(0, bottomY + 0.07, 0);
  room.add(lobbyDoor);

  // Свет: мягкий общий и фонари на стойке
  room.add(new THREE.HemisphereLight(0xcfd8ff, 0x101015, 0.5));

  for (let i = 0; i <= STEP_COUNT; i += 24) {
    const { angle, y } = stepPose(i);
    const lamp = new THREE.PointLight(i % 48 ? 0xffd9a8 : 0xc9d6ff, 1.2, 12, 1.6);
    lamp.position.set(Math.cos(angle) * (INNER_R + 0.25), y + 3.2, Math.sin(angle) * (INNER_R + 0.25));
    room.add(lamp);

    const bulb =
      new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 8),
        new THREE.MeshBasicMaterial({ color: i % 48 ? 0xffe6c4 : 0xe3eaff })
      );

    bulb.position.copy(lamp.position);
    room.add(bulb);
  }

  const doorLight = new THREE.PointLight(0xffffff, 1.4, 10, 1.6);
  doorLight.position.set(Math.cos(exitAngle) * (doorR - 2), bottomY + 4, Math.sin(exitAngle) * (doorR - 2));
  room.add(doorLight);

  // Настоящее звёздное небо вокруг
  const sky = createStarMap(150);
  sky.position.y = -TOTAL_DROP / 2;
  room.add(sky);

  // Далёкая планета внизу
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

  planet.position.set(40, bottomY - 34, -28);
  planet.raycast = () => {};
  room.add(planet);

  const planetLight = new THREE.DirectionalLight(0xdde7ff, 0.9);
  planetLight.position.set(-30, 20, 40);
  planetLight.target = planet;
  room.add(planetLight);

  room.userData.bottomY = bottomY;
  room.userData.exitAngle = exitAngle;
  room.userData.doorR = doorR;

  stairsRoom = room;
  scene.add(room);

  return room;
}

// ---------- Спуск ----------

let mode = "idle";        // idle | riding | landed
let elapsed = 0;          // секунды спуска (без пауз)
let lastTime = 0;
let held = false;
let frame = 0;
let lastStep = -1;

let lookYaw = 0;
let lookPitch = 0;
let dragging = false;
let dragX = 0;
let dragY = 0;

let skipButton = null;
let hint = null;

const smooth = (t) => t * t * (3 - 2 * t);

function ensureUi() {
  if (skipButton) {
    return;
  }

  skipButton = document.createElement("button");
  skipButton.id = "fire-stairs-skip";
  skipButton.type = "button";
  skipButton.textContent = "SKIP ›";
  skipButton.setAttribute("aria-label", "Skip to the bottom");

  skipButton.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
  skipButton.addEventListener("pointerdown", (e) => e.stopPropagation());
  skipButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    land();
  });

  document.body.appendChild(skipButton);

  hint = document.createElement("div");
  hint.id = "fire-stairs-hint";
  document.body.appendChild(hint);

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

    #fire-stairs-hint {
      position: fixed;
      left: 50%;
      top: max(80px, calc(env(safe-area-inset-top) + 70px));
      z-index: 9100;
      transform: translateX(-50%);
      display: none;
      padding: 9px 16px;
      color: rgba(255, 255, 255, 0.8);
      background: rgba(5, 5, 6, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.18);
      font: 500 10px/1.4 "Helvetica Neue", Helvetica, Arial, sans-serif;
      letter-spacing: 0.18em;
      text-align: center;
      white-space: nowrap;
      pointer-events: none;
    }

    #fire-stairs-hint.visible { display: block; }

    body.museum-riding #museum-mobile-controls,
    body.museum-riding #museum-desktop-mouse-controls {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  // Оглядеться: перетаскивание (палец / мышь) или мышь в захвате
  window.addEventListener("pointerdown", (event) => {
    if (mode === "idle" || isUiTarget(event.target)) return;
    dragging = true;
    held = true;
    dragX = event.clientX;
    dragY = event.clientY;
  });

  window.addEventListener("pointermove", (event) => {
    if (mode === "idle") return;

    if (document.pointerLockElement) {
      rotateLook(event.movementX || 0, event.movementY || 0, 0.0025);
      return;
    }

    if (!dragging) return;

    rotateLook(event.clientX - dragX, event.clientY - dragY, 0.006);
    dragX = event.clientX;
    dragY = event.clientY;
  });

  const release = () => {
    dragging = false;
    held = false;
  };

  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
}

function isUiTarget(target) {
  return Boolean(
    target?.closest?.(
      "#fire-stairs-skip, #museum-mobile-back, #museum-help-button, #museum-sound-button"
    )
  );
}

function rotateLook(dx, dy, speed) {
  lookYaw -= dx * speed;
  lookPitch = THREE.MathUtils.clamp(lookPitch - dy * speed, -1.2, 1.2);
}

function setHint(text) {
  if (!hint) return;
  hint.textContent = text;
  hint.classList.toggle("visible", Boolean(text));
}

// Камера «с дрона»: чуть сзади, снаружи и выше идущего по лестнице,
// смотрит на ступени впереди — видна сама спираль.
function ridePose(t) {
  const e = smooth(t);
  const s = e * (STEP_COUNT - 1);
  const a = s * STEP_ANGLE;
  const y = -s * STEP_RISE;

  const camA = a - 0.45;
  const pos = new THREE.Vector3(Math.cos(camA) * 8.2, y + 5.2, Math.sin(camA) * 8.2);

  const lookA = a + 0.35;
  const look = new THREE.Vector3(Math.cos(lookA) * 1.6, y - 0.6, Math.sin(lookA) * 1.6);

  return { pos, look, step: Math.floor(s) };
}

// Внизу: стоим на площадке лицом к двери LOBBY
function landedPose() {
  const room = stairsRoom;
  const bottomY = room.userData.bottomY;
  const a = room.userData.exitAngle;
  const standR = room.userData.doorR - 5.2;

  const pos = new THREE.Vector3(
    Math.cos(a - 0.15) * standR,
    bottomY + 2.9,
    Math.sin(a - 0.15) * standR
  );

  const look = new THREE.Vector3(
    Math.cos(a) * room.userData.doorR,
    bottomY + 3.6,
    Math.sin(a) * room.userData.doorR
  );

  return { pos, look };
}

function applyCamera(pos, look) {
  const dir = look.clone().sub(pos);

  // Поворот взгляда, который задал посетитель
  dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), lookYaw);

  const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
  dir.applyAxisAngle(side, lookPitch);

  camera.position.copy(pos);
  camera.lookAt(pos.clone().add(dir));
}

function tick(now) {
  if (mode === "idle") return;

  const dt = Math.min(0.1, (now - lastTime) / 1000 || 0);
  lastTime = now;

  if (mode === "riding") {
    if (!held) {
      elapsed += dt;

      // Отпустили — взгляд мягко возвращается к лестнице
      lookYaw *= 0.97;
      lookPitch *= 0.97;
    }

    const t = Math.min(1, elapsed / RIDE_SECONDS);

    // Последние 12% — плавный переход к виду на дверь
    const ride = ridePose(t);
    const blend = smooth(THREE.MathUtils.clamp((t - 0.88) / 0.12, 0, 1));

    if (blend > 0) {
      const end = landedPose();
      ride.pos.lerp(end.pos, blend);
      ride.look.lerp(end.look, blend);
    }

    applyCamera(ride.pos, ride.look);

    // Звук шагов по металлу: каждые две ступеньки
    if (ride.step !== lastStep && ride.step % 2 === 0) {
      lastStep = ride.step;
      window.dispatchEvent(new CustomEvent("museum-sound", { detail: { type: "metalStep" } }));
    }

    if (t >= 1) {
      land();
    }
  } else {
    const end = landedPose();
    applyCamera(end.pos, end.look);
  }

  frame = requestAnimationFrame(tick);
}

function land() {
  if (mode === "idle") return;

  mode = "landed";
  elapsed = RIDE_SECONDS;
  lookYaw = 0;
  lookPitch = 0;

  skipButton?.classList.remove("visible");

  const touch = window.matchMedia("(pointer: coarse)").matches;
  setHint(touch ? "TAP THE LOBBY DOOR TWICE" : "DOUBLE CLICK THE LOBBY DOOR");
}

export function startFireStairsRide() {
  ensureUi();

  mode = "riding";
  elapsed = 0;
  lastStep = -1;
  lookYaw = 0;
  lookPitch = 0;
  held = false;
  lastTime = performance.now();

  document.body.classList.add("museum-riding");

  camera.fov = 66;
  camera.updateProjectionMatrix();

  skipButton.classList.add("visible");

  const touch = window.matchMedia("(pointer: coarse)").matches;
  setHint(touch ? "SWIPE TO LOOK AROUND · HOLD TO PAUSE" : "DRAG TO LOOK AROUND · HOLD TO PAUSE");

  const start = ridePose(0);
  applyCamera(start.pos, start.look);

  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(tick);
}

// Уходим с лестницы (BACK, дверь LOBBY и т.д.)
export function stopFireStairsRide() {
  if (mode === "idle") return;

  mode = "idle";
  cancelAnimationFrame(frame);
  document.body.classList.remove("museum-riding");
  skipButton?.classList.remove("visible");
  setHint("");
}

// Пока мы на лестнице, обычное управление камерой выключено
export function isFireStairsRiding() {
  return mode !== "idle";
}
