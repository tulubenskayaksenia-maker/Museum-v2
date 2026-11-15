// =====================================================
// MUSEUM SOUND
// ui/sound.js
// =====================================================
//
// Все звуки синтезируются в браузере (Web Audio API):
// никаких файлов, лицензий и лишнего трафика.
//  - тихий гул зала (разный в залах, коридоре, кинозале);
//  - шаги с эхом (в коридоре эхо длиннее);
//  - мягкий «вдох» при переходе между залами;
//  - скрип двери кабинки, щелчок при открытии окон.
// Кнопка со значком динамика включает и выключает звук.

import { camera } from "../core/scene.js?v=2368a10";

const STORAGE_KEY = "incognito-sound";

let ctx = null;
let master = null;
let reverb = null;
let reverbGain = null;
let ambientFilter = null;
let ambientGain = null;
let humGain = null;
let enabled = true;
let videoDucked = false;
let started = false;
let currentRoom = "entrance";

const lastPos = { x: 0, y: 0, z: 0, ready: false };
let stepDistance = 0;
let stepSide = 0;

// Характер звука по залам
const ROOM_SOUND = {
  entrance: { filter: 420, ambient: 0.05, reverb: 2.6, wet: 0.32, hum: 0 },
  corridor: { filter: 300, ambient: 0.06, reverb: 3.8, wet: 0.45, hum: 0 },
  leftRoom: { filter: 600, ambient: 0.035, reverb: 1.2, wet: 0.18, hum: 0 },
  womenWC: { filter: 700, ambient: 0.03, reverb: 1.6, wet: 0.3, hum: 0 },
  menWC: { filter: 700, ambient: 0.03, reverb: 1.6, wet: 0.3, hum: 0 },
  room04: { filter: 220, ambient: 0.04, reverb: 1.0, wet: 0.12, hum: 0.025 },
  shop: { filter: 650, ambient: 0.035, reverb: 1.3, wet: 0.2, hum: 0 },
  // Космос: почти тишина, очень долгое эхо
  fireStairs: { filter: 140, ambient: 0.05, reverb: 5.5, wet: 0.55, hum: 0 },
  default: { filter: 480, ambient: 0.045, reverb: 2.0, wet: 0.26, hum: 0 }
};

function readPreference() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

function savePreference(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "on" : "off");
  } catch {
    // ничего
  }
}

function noiseBuffer(seconds, brown = false) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;

  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;

    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      data[i] = white;
    }
  }

  return buffer;
}

function impulse(seconds) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);

  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c);

    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.2);
    }
  }

  return buffer;
}

function start() {
  if (started) {
    ctx?.resume?.();
    return;
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;

  if (!AudioCtx) {
    return;
  }

  ctx = new AudioCtx();
  started = true;

  master = ctx.createGain();
  master.gain.value = enabled && !videoDucked ? 1 : 0;
  master.connect(ctx.destination);

  // Эхо
  reverb = ctx.createConvolver();
  reverb.buffer = impulse(2.6);
  reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.3;
  reverb.connect(reverbGain);
  reverbGain.connect(master);

  // Гул зала: коричневый шум через фильтр низких частот
  const ambient = ctx.createBufferSource();
  ambient.buffer = noiseBuffer(6, true);
  ambient.loop = true;

  ambientFilter = ctx.createBiquadFilter();
  ambientFilter.type = "lowpass";
  ambientFilter.frequency.value = 420;

  ambientGain = ctx.createGain();
  ambientGain.gain.value = 0;

  ambient.connect(ambientFilter);
  ambientFilter.connect(ambientGain);
  ambientGain.connect(master);
  ambient.start();

  // Низкий гул проектора в кинозале
  const hum = ctx.createOscillator();
  hum.type = "sine";
  hum.frequency.value = 55;
  humGain = ctx.createGain();
  humGain.gain.value = 0;
  hum.connect(humGain);
  humGain.connect(master);
  hum.start();

  applyRoom(currentRoom, 1.5);
}

function applyRoom(room, fade = 0.8) {
  currentRoom = room || "entrance";

  if (!ctx) {
    return;
  }

  const s = ROOM_SOUND[currentRoom] || ROOM_SOUND.default;
  const t = ctx.currentTime;

  ambientFilter.frequency.setTargetAtTime(s.filter, t, fade / 3);
  ambientGain.gain.setTargetAtTime(s.ambient, t, fade / 3);
  humGain.gain.setTargetAtTime(s.hum, t, fade / 3);
  reverbGain.gain.setTargetAtTime(s.wet, t, fade / 3);

  if (Math.abs(reverb.buffer.duration - s.reverb) > 0.3) {
    reverb.buffer = impulse(s.reverb);
  }
}

function out(node, wet = true) {
  node.connect(master);

  if (wet) {
    node.connect(reverb);
  }
}

// Шаг по металлической ступеньке: звонкий удар с призвуком
function playMetalStep() {
  const t = ctx.currentTime;
  stepSide = 1 - stepSide;

  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(0.08);

  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 2300 + Math.random() * 600;
  band.Q.value = 3;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.14, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

  src.connect(band);
  band.connect(g);
  out(g);
  src.start(t);
  src.stop(t + 0.09);

  // Металлический призвук ступени
  for (const [freq, level] of [[620 + stepSide * 40, 0.05], [1530 + Math.random() * 80, 0.025]]) {
    const ring = ctx.createOscillator();
    ring.type = "sine";
    ring.frequency.value = freq;

    const rg = ctx.createGain();
    rg.gain.setValueAtTime(0.0001, t);
    rg.gain.exponentialRampToValueAtTime(level, t + 0.005);
    rg.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

    ring.connect(rg);
    out(rg);
    ring.start(t);
    ring.stop(t + 0.5);
  }
}

// Шаг: щелчок каблука + мягкий низкий удар
function playStep() {
  if (!ctx || !enabled || videoDucked) {
    return;
  }

  if (currentRoom === "fireStairs") {
    playMetalStep();
    return;
  }

  const t = ctx.currentTime;
  stepSide = 1 - stepSide;

  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(0.12);

  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 900 + Math.random() * 500 + stepSide * 120;
  band.Q.value = 1.4;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.16, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

  src.connect(band);
  band.connect(g);
  out(g);
  src.start(t);
  src.stop(t + 0.13);

  const thump = ctx.createOscillator();
  thump.type = "sine";
  thump.frequency.setValueAtTime(110, t);
  thump.frequency.exponentialRampToValueAtTime(55, t + 0.06);

  const tg = ctx.createGain();
  tg.gain.setValueAtTime(0.0001, t);
  tg.gain.exponentialRampToValueAtTime(0.12, t + 0.005);
  tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

  thump.connect(tg);
  out(tg, false);
  thump.start(t);
  thump.stop(t + 0.1);
}

// Переход между залами: мягкий «вдох»
function playWhoosh() {
  if (!ctx || !enabled || videoDucked) {
    return;
  }

  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(0.9);

  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 0.8;
  f.frequency.setValueAtTime(300, t);
  f.frequency.exponentialRampToValueAtTime(1600, t + 0.35);
  f.frequency.exponentialRampToValueAtTime(400, t + 0.8);

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.09, t + 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);

  src.connect(f);
  f.connect(g);
  out(g);
  src.start(t);
  src.stop(t + 0.9);
}

// Скрип двери
function playCreak() {
  if (!ctx || !enabled || videoDucked) {
    return;
  }

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.linearRampToValueAtTime(260, t + 0.25);
  osc.frequency.linearRampToValueAtTime(150, t + 0.55);

  const wobble = ctx.createOscillator();
  wobble.frequency.value = 32;
  const wobbleGain = ctx.createGain();
  wobbleGain.gain.value = 25;
  wobble.connect(wobbleGain);
  wobbleGain.connect(osc.frequency);

  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 900;
  f.Q.value = 3;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.05, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

  osc.connect(f);
  f.connect(g);
  out(g);
  osc.start(t);
  wobble.start(t);
  osc.stop(t + 0.62);
  wobble.stop(t + 0.62);
}

// Тихий щелчок при открытии окна
function playClick() {
  if (!ctx || !enabled || videoDucked) {
    return;
  }

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1400, t);
  osc.frequency.exponentialRampToValueAtTime(700, t + 0.05);

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.05, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

  osc.connect(g);
  out(g, false);
  osc.start(t);
  osc.stop(t + 0.08);
}

function updateMasterGain() {
  if (!master || !ctx) {
    return;
  }

  const target =
    enabled && !videoDucked ? 1 : 0;

  // Плавно: 0.25 с на затухание, чуть дольше на возврат
  master.gain.setTargetAtTime(
    target,
    ctx.currentTime,
    target ? 0.4 : 0.12
  );
}

/*
  Видео смотрим в тишине: пока открыт полноэкранный плеер
  или где-то играет видео со звуком, звуки музея выключены.
  Видео на стенах в залах беззвучные и звук музея не трогают.
*/
function isVideoWithSoundOpen() {
  if (
    document.querySelector("#cinema-viewer:not([hidden])")
  ) {
    return true;
  }

  for (const id of ["room02-video-overlay", "room03-video-overlay"]) {
    const overlay = document.getElementById(id);

    if (overlay && overlay.style.display === "flex") {
      return true;
    }
  }

  for (const video of document.querySelectorAll("video")) {
    if (!video.paused && !video.muted && video.volume > 0) {
      return true;
    }
  }

  return false;
}

function watchVideos() {
  const ducked = isVideoWithSoundOpen();

  if (ducked !== videoDucked) {
    videoDucked = ducked;
    updateMasterGain();
  }
}

// Шаги считаем по пройденному пути камеры
function trackSteps() {
  requestAnimationFrame(trackSteps);

  const p = camera.position;

  if (!lastPos.ready) {
    lastPos.x = p.x;
    lastPos.y = p.y;
    lastPos.z = p.z;
    lastPos.ready = true;
    return;
  }

  const dx = p.x - lastPos.x;
  const dy = p.y - lastPos.y;
  const dz = p.z - lastPos.z;
  const moved = Math.sqrt(dx * dx + dz * dz + dy * dy * 0.5);

  lastPos.x = p.x;
  lastPos.y = p.y;
  lastPos.z = p.z;

  // Скачок при смене зала — не шаг
  if (moved > 3) {
    stepDistance = 0;
    return;
  }

  stepDistance += moved;

  const stride =
    currentRoom === "fireStairs" ? 0.95 : 1.9;

  if (stepDistance > stride) {
    stepDistance = 0;
    playStep();
  }
}

function setEnabled(value) {
  enabled = value;
  savePreference(value);

  if (value) {
    start();
  }

  updateMasterGain();

  const button = document.getElementById("museum-sound-button");

  if (button) {
    button.setAttribute("aria-pressed", String(value));
    button.setAttribute("aria-label", value ? "Turn sound off" : "Turn sound on");
    button.classList.toggle("muted", !value);
  }
}

function createButton() {
  const button = document.createElement("button");
  button.id = "museum-sound-button";
  button.type = "button";

  button.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/>
      <path class="wave" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path class="cross" d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
  `;

  button.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    setEnabled(!enabled);
  });

  document.body.appendChild(button);

  const style = document.createElement("style");
  style.textContent = `
    #museum-sound-button {
      position: fixed;
      right: 78px;
      bottom: 22px;
      z-index: 4000;

      display: flex;
      align-items: center;
      justify-content: center;

      width: 44px;
      height: 44px;
      padding: 0;

      color: rgba(255, 255, 255, 0.88);
      background: rgba(10, 10, 12, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 50%;

      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);

      cursor: pointer;
    }

    #museum-sound-button .cross { display: none; }
    #museum-sound-button.muted .cross { display: inline; }
    #museum-sound-button.muted .wave { display: none; }
    #museum-sound-button.muted { color: rgba(255, 255, 255, 0.5); }

    @media (max-width: 600px) {
      #museum-sound-button {
        right: 68px;
        bottom: 15px;
      }
    }
  `;

  document.head.appendChild(style);
}

export function setupSound() {
  enabled = readPreference();

  createButton();
  setEnabled(enabled);

  // Браузеры разрешают звук только после действия посетителя:
  // запускаем при первом касании / клике / клавише.
  const unlock = () => {
    if (enabled) {
      start();
    }
  };

  for (const type of ["pointerdown", "touchstart", "keydown"]) {
    window.addEventListener(type, unlock, { passive: true });
  }

  window.addEventListener("museum-navigation-state", (event) => {
    const room = event.detail?.room;

    if (room && room !== currentRoom) {
      playWhoosh();
      applyRoom(room);
    }
  });

  window.addEventListener("museum-sound", (event) => {
    const type = event.detail?.type;

    if (type === "creak") playCreak();
    if (type === "click") playClick();
  });

  requestAnimationFrame(trackSteps);

  setInterval(watchVideos, 250);

  if (new URLSearchParams(location.search).has("debug")) {
    window.__sound = {
      get ducked() { return videoDucked; },
      get gain() { return master ? master.gain.value : null; },
      get state() { return ctx ? ctx.state : "not started"; }
    };
  }
}

// Удобный вызов из других модулей
export function museumSound(type) {
  window.dispatchEvent(new CustomEvent("museum-sound", { detail: { type } }));
}
