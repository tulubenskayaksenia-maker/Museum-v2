// =====================================================
// SELFIE MIRROR
// ui/selfieMirror.js
// =====================================================
//
// Двойной тап по зеркалу в туалете → фронтальная камера.
// Человек вырезается из своего фона (MediaPipe, всё на устройстве)
// и стоит «в зеркале» музейного туалета: плитка, светящийся логотип,
// бра, картины. Кнопка INCOGNITO — чёрная полоска на глаза.
// Снимок — с аркой-зеркалом, логотипом и подписью; сохранить
// или поделиться. Видео никуда не отправляется.

import { THREE, scene } from "../core/scene.js";
import { SELFIE_VIEW } from "../objects/restroomDecor.js";

const MP_VERSION = "0.10.14";
const MP_BUNDLE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/vision_bundle.mjs`;
const MP_WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`;
const SEG_MODEL = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";
const FACE_MODEL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

// Размер фото (4:5, как пост в Instagram)
const W = 1080;
const H = 1350;

// Арка-зеркало (та же форма, что у логотипа музея)
const ARCH = { x: 90, y: 70, w: 900, h: 1110 };

let root = null;
let stage = null;
let stageCtx = null;
let video = null;
let stream = null;
let open = false;
let loop = 0;

let backdrop = null;          // отрисованная стена туалета
let segmenter = null;
let face = null;
let faceLoading = null;
let incognito = true;
let lastLandmarks = null;
let lastMask = null;          // canvas с маской человека
let maskCanvas = null;
let personCanvas = null;
let logoImage = null;
let lastVideoTime = -1;

// ---------- UI ----------

function el(tag, attrs = {}, html = "") {
  const node = document.createElement(tag);
  Object.assign(node, attrs);
  if (html) node.innerHTML = html;
  return node;
}

function ensureUi() {
  if (root) return;

  root = el("div", { id: "selfie-mirror" });
  root.setAttribute("aria-hidden", "true");

  root.innerHTML = `
    <div class="selfie-panel" data-step="intro">
      <div class="selfie-label">SELFIE MIRROR</div>
      <h2>Take a picture in our mirror</h2>
      <p>
        The mirror uses your front camera. Everything happens on your phone,
        nothing is uploaded anywhere.
      </p>
      <button type="button" class="selfie-primary" data-action="start">ALLOW CAMERA</button>
      <button type="button" class="selfie-secondary" data-action="close">NOT NOW</button>
      <p class="selfie-error" hidden></p>
    </div>

    <div class="selfie-live" data-step="live" hidden>
      <canvas class="selfie-stage" width="${W}" height="${H}"></canvas>
      <div class="selfie-loading">Getting the mirror ready…</div>
      <div class="selfie-controls">
        <button type="button" class="selfie-toggle" data-action="incognito" aria-pressed="true">INCOGNITO</button>
        <button type="button" class="selfie-shutter" data-action="shoot" aria-label="Take photo"></button>
        <button type="button" class="selfie-close" data-action="close" aria-label="Close">×</button>
      </div>
    </div>

    <div class="selfie-result" data-step="result" hidden>
      <img class="selfie-photo" alt="Your selfie in the Incognito Museum mirror" />
      <div class="selfie-result-actions">
        <button type="button" class="selfie-primary" data-action="share">SHARE</button>
        <button type="button" class="selfie-secondary" data-action="save">SAVE</button>
        <button type="button" class="selfie-secondary" data-action="retake">RETAKE</button>
      </div>
      <button type="button" class="selfie-close selfie-close-top" data-action="close" aria-label="Close">×</button>
    </div>
  `;

  document.body.appendChild(root);

  stage = root.querySelector(".selfie-stage");
  stageCtx = stage.getContext("2d");

  root.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;

    event.preventDefault();
    event.stopPropagation();

    if (action === "start") startCamera();
    if (action === "close") closeSelfieMirror();
    if (action === "shoot") shoot();
    if (action === "retake") showStep("live");
    if (action === "save") savePhoto();
    if (action === "share") sharePhoto();
    if (action === "incognito") toggleIncognito();
  });

  // Касания внутри окна не должны управлять камерой музея
  root.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && open) closeSelfieMirror();
  });

  const style = document.createElement("style");
  style.textContent = `
    #selfie-mirror {
      position: fixed; inset: 0; z-index: 9700;
      display: none; align-items: center; justify-content: center;
      padding: 16px;
      background: rgba(3, 3, 4, 0.94);
      color: #f3f1eb;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    }
    #selfie-mirror.visible { display: flex; }
    #selfie-mirror [hidden] { display: none !important; }

    .selfie-panel {
      width: min(460px, 100%);
      padding: 40px 32px 32px;
      background: #15171b;
      border: 1px solid rgba(255,255,255,0.16);
      text-align: center;
    }
    .selfie-label {
      margin-bottom: 18px;
      color: rgba(232,235,240,0.5);
      font-size: 10px; letter-spacing: 0.28em;
    }
    .selfie-panel h2 {
      margin: 0 0 14px;
      font: 400 34px/1.05 Georgia, "Times New Roman", serif;
    }
    .selfie-panel p {
      margin: 0 0 26px;
      color: rgba(235,236,240,0.65);
      font-size: 14px; line-height: 1.6;
    }
    .selfie-primary, .selfie-secondary {
      display: block; width: 100%;
      padding: 16px 20px; margin-top: 10px;
      font-size: 10px; font-weight: 600; letter-spacing: 0.2em;
      cursor: pointer; border-radius: 0;
    }
    .selfie-primary { color: #16171a; background: #f0eee8; border: 0; }
    .selfie-secondary { color: rgba(240,241,244,0.85); background: transparent; border: 1px solid rgba(255,255,255,0.2); }
    .selfie-error { margin-top: 16px !important; color: #f0a39b !important; font-size: 13px !important; }

    .selfie-live, .selfie-result {
      position: relative;
      display: flex; flex-direction: column; align-items: center; gap: 16px;
      width: 100%; height: 100%;
      justify-content: center;
    }
    .selfie-stage, .selfie-photo {
      display: block;
      max-width: 100%;
      max-height: calc(100% - 110px);
      aspect-ratio: 4 / 5;
      object-fit: contain;
      background: #0b0c0e;
    }
    .selfie-loading {
      position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%);
      padding: 10px 16px;
      background: rgba(0,0,0,0.55);
      font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
      pointer-events: none;
    }
    .selfie-controls {
      display: flex; align-items: center; justify-content: center; gap: 28px;
    }
    .selfie-shutter {
      width: 74px; height: 74px; border-radius: 50%;
      background: #f3f1eb; border: 5px solid rgba(255,255,255,0.35);
      background-clip: padding-box; cursor: pointer;
    }
    .selfie-shutter:active { transform: scale(0.94); }
    .selfie-toggle {
      min-width: 112px; padding: 12px 14px;
      color: rgba(240,241,244,0.9); background: transparent;
      border: 1px solid rgba(255,255,255,0.3);
      font-size: 10px; font-weight: 600; letter-spacing: 0.18em; cursor: pointer;
    }
    .selfie-toggle[aria-pressed="true"] { color: #16171a; background: #f0eee8; border-color: #f0eee8; }
    .selfie-close {
      width: 52px; height: 52px; border-radius: 50%;
      color: #f3f1eb; background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.22);
      font-size: 26px; font-weight: 300; line-height: 1; cursor: pointer;
    }
    .selfie-close-top { position: absolute; top: 0; right: 0; }
    .selfie-result-actions {
      display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
      width: min(460px, 100%);
    }
    .selfie-result-actions button { margin-top: 0; }
  `;
  document.head.appendChild(style);
}

function showStep(step) {
  for (const node of root.querySelectorAll("[data-step]")) {
    node.hidden = node.dataset.step !== step;
  }

  if (step === "live" && stream) {
    startLoop();
  } else {
    stopLoop();
  }
}

function showError(text) {
  showStep("intro");
  const error = root.querySelector(".selfie-error");
  error.textContent = text;
  error.hidden = false;
}

// ---------- Открыть / закрыть ----------

export function openSelfieMirror() {
  ensureUi();

  open = true;
  root.classList.add("visible");
  root.setAttribute("aria-hidden", "false");
  root.querySelector(".selfie-error").hidden = true;

  window.dispatchEvent(new CustomEvent("museum-sound", { detail: { type: "click" } }));

  if (document.pointerLockElement) {
    document.exitPointerLock?.();
  }

  showStep(stream ? "live" : "intro");
}

export function closeSelfieMirror() {
  if (!root) return;

  open = false;
  root.classList.remove("visible");
  root.setAttribute("aria-hidden", "true");

  stopLoop();
  stopCamera();
}

export function isSelfieMirrorOpen() {
  return open;
}

// ---------- Камера ----------

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    showError("This browser can't use the camera. Open incogmusem.com in Safari or Chrome to use the mirror.");
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
      audio: false
    });
  } catch (err) {
    showError(
      err?.name === "NotAllowedError"
        ? "The camera is blocked. Allow it in the browser settings and try again."
        : "We couldn't start the camera. Open incogmusem.com in Safari or Chrome and try again."
    );
    return;
  }

  video = video || el("video", { playsInline: true, muted: true, autoplay: true });
  video.setAttribute("playsinline", "");
  video.srcObject = stream;

  try {
    await video.play();
  } catch {
    // iOS иногда требует повторного касания — кадры всё равно пойдут
  }

  root.querySelector(".selfie-loading").hidden = false;
  showStep("live");

  // Фон и модели готовим параллельно
  renderBackdrop();
  loadLogo();
  loadSegmenter().finally(() => {
    root.querySelector(".selfie-loading").hidden = true;
  });

  if (incognito) loadFace();
}

function stopCamera() {
  if (stream) {
    for (const track of stream.getTracks()) track.stop();
  }

  stream = null;

  if (video) video.srcObject = null;
}

// ---------- Модели MediaPipe ----------

let visionModule = null;
let fileset = null;

async function vision() {
  if (!visionModule) {
    visionModule = await import(/* @vite-ignore */ MP_BUNDLE);
    fileset = await visionModule.FilesetResolver.forVisionTasks(MP_WASM);
  }

  return visionModule;
}

async function loadSegmenter() {
  if (segmenter) return segmenter;

  try {
    const v = await vision();

    segmenter = await v.ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: SEG_MODEL, delegate: "GPU" },
      runningMode: "VIDEO",
      outputCategoryMask: false,
      outputConfidenceMasks: true
    });
  } catch (err) {
    console.warn("Selfie segmenter unavailable, showing plain camera", err);
    segmenter = null;
  }

  return segmenter;
}

function loadFace() {
  if (face || faceLoading) return faceLoading;

  faceLoading = (async () => {
    try {
      const v = await vision();

      face = await v.FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: FACE_MODEL, delegate: "GPU" },
        runningMode: "VIDEO",
        numFaces: 1
      });
    } catch (err) {
      console.warn("Face landmarker unavailable", err);
      face = null;
    }
  })();

  return faceLoading;
}

function toggleIncognito() {
  incognito = !incognito;

  root.querySelector("[data-action=incognito]").setAttribute("aria-pressed", String(incognito));

  if (incognito) loadFace();
}

// ---------- Фон: стена туалета, отрисованная из зеркала ----------

let backdropRenderer = null;

function renderBackdrop() {
  try {
    if (!backdropRenderer) {
      backdropRenderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      backdropRenderer.setPixelRatio(1);
      backdropRenderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    backdropRenderer.setSize(ARCH.w, ARCH.h, false);

    const cam = new THREE.PerspectiveCamera(SELFIE_VIEW.fov, ARCH.w / ARCH.h, 0.1, 500);
    cam.position.copy(SELFIE_VIEW.position);
    cam.lookAt(SELFIE_VIEW.target);

    backdropRenderer.render(scene, cam);

    // Слегка размываем — как глубина резкости за спиной
    backdrop = document.createElement("canvas");
    backdrop.width = ARCH.w;
    backdrop.height = ARCH.h;

    const ctx = backdrop.getContext("2d");
    ctx.filter = "blur(2px) brightness(1.05)";
    ctx.drawImage(backdropRenderer.domElement, 0, 0);
    ctx.filter = "none";
  } catch (err) {
    console.warn("Backdrop render failed", err);
    backdrop = null;
  }
}

function loadLogo() {
  if (logoImage) return;

  logoImage = new Image();
  logoImage.src = "./assets/brand/logo-light.png";
}

// ---------- Кадр ----------

function startLoop() {
  stopLoop();

  const frame = () => {
    drawFrame();
    loop = requestAnimationFrame(frame);
  };

  loop = requestAnimationFrame(frame);
}

function stopLoop() {
  cancelAnimationFrame(loop);
  loop = 0;
}

function archPath(ctx, { x, y, w, h }) {
  const r = w / 2;

  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, 0);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

function updateMask(now) {
  if (!segmenter || !video || video.readyState < 2) return;
  if (video.currentTime === lastVideoTime) return;

  lastVideoTime = video.currentTime;

  segmenter.segmentForVideo(video, now, (result) => {
    const mask = result.confidenceMasks?.[0];
    if (!mask) return;

    const mw = mask.width;
    const mh = mask.height;
    const data = mask.getAsFloat32Array();

    if (!maskCanvas || maskCanvas.width !== mw || maskCanvas.height !== mh) {
      maskCanvas = document.createElement("canvas");
      maskCanvas.width = mw;
      maskCanvas.height = mh;
    }

    const mctx = maskCanvas.getContext("2d");
    const image = mctx.createImageData(mw, mh);

    for (let i = 0; i < data.length; i++) {
      // мягкий порог: края волос не «рубятся»
      const v = Math.min(1, Math.max(0, (data[i] - 0.3) / 0.45));
      image.data[i * 4] = 255;
      image.data[i * 4 + 1] = 255;
      image.data[i * 4 + 2] = 255;
      image.data[i * 4 + 3] = v * 255;
    }

    mctx.putImageData(image, 0, 0);
    lastMask = maskCanvas;
  });

  if (incognito && face) {
    const res = face.detectForVideo(video, now);
    lastLandmarks = res.faceLandmarks?.[0] || null;
  }
}

// Где на фото рисуется видео: по высоте чуть меньше арки, по центру,
// снизу — чтобы над головой оставались логотип и светильники
function videoRect() {
  const vw = video.videoWidth || 720;
  const vh = video.videoHeight || 1280;

  const scale = Math.max((ARCH.h * 0.86) / vh, (ARCH.w * 0.62) / vw);
  const w = vw * scale;
  const h = vh * scale;

  return {
    x: ARCH.x + (ARCH.w - w) / 2,
    y: ARCH.y + ARCH.h - h,
    w,
    h
  };
}

function drawFrame() {
  if (!video) return;

  const now = performance.now();
  updateMask(now);

  const ctx = stageCtx;
  ctx.save();
  ctx.fillStyle = "#0b0c0e";
  ctx.fillRect(0, 0, W, H);

  archPath(ctx, ARCH);
  ctx.save();
  ctx.clip();

  // 1. Стена туалета за спиной
  if (backdrop && segmenter && lastMask) {
    ctx.drawImage(backdrop, ARCH.x, ARCH.y, ARCH.w, ARCH.h);
  }

  // 2. Человек (зеркально, как в настоящем зеркале)
  const rect = videoRect();

  if (!personCanvas) {
    personCanvas = document.createElement("canvas");
  }

  personCanvas.width = ARCH.w;
  personCanvas.height = ARCH.h;

  const p = personCanvas.getContext("2d");
  p.save();
  p.translate(ARCH.w, 0);
  p.scale(-1, 1);

  const local = {
    x: ARCH.w - (rect.x - ARCH.x) - rect.w,
    y: rect.y - ARCH.y,
    w: rect.w,
    h: rect.h
  };

  p.drawImage(video, local.x, local.y, local.w, local.h);

  if (segmenter && lastMask) {
    p.globalCompositeOperation = "destination-in";
    p.filter = "blur(3px)";
    p.drawImage(lastMask, local.x, local.y, local.w, local.h);
    p.filter = "none";
    p.globalCompositeOperation = "source-over";
  }

  p.restore();

  // тёплый свет бра на лице и лёгкая тень у ног
  ctx.drawImage(personCanvas, ARCH.x, ARCH.y);

  // 3. INCOGNITO: чёрная полоска на глазах
  if (incognito && lastLandmarks) {
    drawEyeBar(ctx, rect);
  }

  // 4. Стекло: мягкий блик по диагонали и затемнение к краям
  const sheen = ctx.createLinearGradient(ARCH.x, ARCH.y, ARCH.x + ARCH.w, ARCH.y + ARCH.h);
  sheen.addColorStop(0, "rgba(255,255,255,0.10)");
  sheen.addColorStop(0.35, "rgba(255,255,255,0.0)");
  sheen.addColorStop(0.6, "rgba(255,255,255,0.05)");
  sheen.addColorStop(1, "rgba(255,255,255,0.0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(ARCH.x, ARCH.y, ARCH.w, ARCH.h);

  const vignette = ctx.createRadialGradient(
    W / 2, ARCH.y + ARCH.h * 0.55, ARCH.w * 0.35,
    W / 2, ARCH.y + ARCH.h * 0.55, ARCH.w * 0.85
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = vignette;
  ctx.fillRect(ARCH.x, ARCH.y, ARCH.w, ARCH.h);

  ctx.restore();

  // 5. Рама-арка из латуни
  archPath(ctx, ARCH);
  const brass = ctx.createLinearGradient(ARCH.x, ARCH.y, ARCH.x + ARCH.w, ARCH.y + ARCH.h);
  brass.addColorStop(0, "#d9c39a");
  brass.addColorStop(0.5, "#8c6d42");
  brass.addColorStop(1, "#cfb27e");
  ctx.strokeStyle = brass;
  ctx.lineWidth = 12;
  ctx.stroke();

  archPath(ctx, { x: ARCH.x - 14, y: ARCH.y - 14, w: ARCH.w + 28, h: ARCH.h + 14 });
  ctx.strokeStyle = "rgba(217,195,154,0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function drawEyeBar(ctx, rect) {
  const lm = lastLandmarks;

  // уголки глаз (внешние) и верх/низ век
  const toPhoto = (pt) => ({
    // зеркально по горизонтали
    x: rect.x + (1 - pt.x) * rect.w,
    y: rect.y + pt.y * rect.h
  });

  const a = toPhoto(lm[33]);
  const b = toPhoto(lm[263]);
  const top = toPhoto(lm[159]);
  const bottom = toPhoto(lm[145]);

  const cx = (a.x + b.x) / 2;
  const cy = (a.y + b.y) / 2 + (bottom.y - top.y) * 0.1;
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const angle = Math.atan2(b.y - a.y, b.x - a.x);

  const barW = dist * 1.75;
  const barH = Math.max(dist * 0.42, (bottom.y - top.y) * 3.2);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  ctx.fillStyle = "#0a0a0b";
  ctx.fillRect(-barW / 2, -barH / 2, barW, barH);

  // маленькая надпись на полоске
  const size = Math.max(10, barH * 0.26);
  ctx.font = `600 ${size}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  ctx.fillStyle = "rgba(243,241,235,0.9)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const label = "I N C O G N I T O";
  ctx.fillText(label, 0, 1);

  ctx.restore();
}

// ---------- Снимок ----------

let photoBlob = null;

function drawCaption(ctx) {
  // Нижняя плашка: логотип + название + место и дата
  const y = ARCH.y + ARCH.h + 40;

  if (logoImage?.complete && logoImage.naturalWidth) {
    const lh = 92;
    const lw = lh * logoImage.naturalWidth / logoImage.naturalHeight;
    ctx.drawImage(logoImage, ARCH.x, y, lw, lh);
  }

  const textX = ARCH.x + 100;

  ctx.fillStyle = "#f3f1eb";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  const spaced = (text, x, yy, size, color, weight = 400, spacing = 0.3) => {
    ctx.font = `${weight} ${size}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
    ctx.fillStyle = color;
    let cx = x;
    for (const ch of text) {
      ctx.fillText(ch, cx, yy);
      cx += ctx.measureText(ch).width + size * spacing;
    }
  };

  const date = new Date();
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");

  spaced("INCOGNITO MUSEUM", textX, y + 42, 30, "#f3f1eb", 500, 0.32);
  spaced(`WC · ${dd}.${mm}.${date.getFullYear()} · INCOGMUSEM.COM`, textX, y + 82, 20, "rgba(243,241,235,0.55)", 400, 0.22);
}

function shoot() {
  if (!video) return;

  drawFrame();

  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;

  const ctx = out.getContext("2d");
  ctx.drawImage(stage, 0, 0);
  drawCaption(ctx);

  // короткая «вспышка»
  window.dispatchEvent(new CustomEvent("museum-sound", { detail: { type: "click" } }));

  out.toBlob((blob) => {
    photoBlob = blob;

    const img = root.querySelector(".selfie-photo");
    if (img.src) URL.revokeObjectURL(img.src);
    img.src = URL.createObjectURL(blob);

    showStep("result");
  }, "image/jpeg", 0.92);
}

function photoFile() {
  return new File([photoBlob], "incognito-museum-mirror.jpg", { type: "image/jpeg" });
}

function savePhoto() {
  if (!photoBlob) return;

  const a = document.createElement("a");
  a.href = URL.createObjectURL(photoBlob);
  a.download = "incognito-museum-mirror.jpg";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

async function sharePhoto() {
  if (!photoBlob) return;

  const file = photoFile();

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        text: "Incognito Museum · incogmusem.com"
      });
      return;
    } catch {
      return; // посетитель закрыл меню
    }
  }

  // Нет системного меню «Поделиться» (часто на компьютере) — просто сохраняем
  savePhoto();
}
