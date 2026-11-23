// =====================================================
// GUEST BOOK BOARD IN THE SHOP
// objects/reviewsBoard.js
// =====================================================
//
// Доска «Guest book» на стене магазина: последние отзывы
// посетителей (только те, что одобрены в Google-таблице).
// По клику открывается окно с формой и всеми отзывами.

import { THREE } from "../core/scene.js?v=84d1282";

const INK = "#efefef";
const MUTED = "rgba(239, 239, 239, 0.55)";
const LINE = "rgba(239, 239, 239, 0.25)";
const BG = "#0a0a0b";

const W = 1400;
const H = 1900;

const frameMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x111214,
    roughness: 0.55,
    metalness: 0.25
  });

let boardCanvas = null;
let boardTexture = null;

function spaced(ctx, text, x, y, size, color, weight = 300, spacing = 0.3, align = "left") {
  ctx.font = `${weight} ${size}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  ctx.fillStyle = color;

  const chars = [...text];
  const gap = size * spacing;
  const width =
    chars.reduce((sum, ch) => sum + ctx.measureText(ch).width + gap, 0) - gap;

  let cx =
    align === "center" ? x - width / 2 :
    align === "right" ? x - width :
    x;

  for (const ch of chars) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + gap;
  }
}

// Разбивает текст на строки по ширине; лишнее обрезает многоточием
function wrapLines(ctx, text, maxWidth, maxLines) {
  const words = String(text).replace(/\s+/g, " ").trim().split(" ");
  const lines = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;

    if (ctx.measureText(test).width <= maxWidth || !line) {
      line = test;
    } else {
      lines.push(line);
      line = word;
    }
  }

  if (line) {
    lines.push(line);
  }

  if (lines.length > maxLines) {
    const cut = lines.slice(0, maxLines);
    let last = cut[maxLines - 1];

    while (last && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }

    cut[maxLines - 1] = `${last.trimEnd()}…`;
    return cut;
  }

  return lines;
}

function draw(reviews) {
  const ctx = boardCanvas.getContext("2d");

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(239, 239, 239, 0.4)";
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  spaced(ctx, "INCOGNITO MUSEUM", W / 2, 120, 30, MUTED, 300, 0.4, "center");

  ctx.font = `400 130px Georgia, "Times New Roman", serif`;
  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.fillText("Guest book", W / 2, 280);
  ctx.textAlign = "left";

  spaced(ctx, "NOTES FROM VISITORS", W / 2, 400, 26, MUTED, 400, 0.3, "center");

  const left = 120;
  const right = W - 120;
  const top = 480;
  const bottom = 1420;

  if (!reviews.length) {
    ctx.font = `italic 400 58px Georgia, "Times New Roman", serif`;
    ctx.fillStyle = MUTED;
    ctx.textAlign = "center";
    ctx.fillText("Be the first", W / 2, 880);
    ctx.fillText("to leave a note.", W / 2, 960);
    ctx.textAlign = "left";
  } else {
    let y = top;

    for (const review of reviews) {
      ctx.font = `italic 400 46px Georgia, "Times New Roman", serif`;
      const lines = wrapLines(ctx, `“${review.text}”`, right - left, 4);
      const blockHeight = 50 + lines.length * 60 + 50 + 40;

      if (y + blockHeight > bottom) {
        break;
      }

      ctx.strokeStyle = LINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();

      let ly = y + 70;

      ctx.fillStyle = INK;
      for (const line of lines) {
        ctx.fillText(line, left, ly);
        ly += 60;
      }

      spaced(
        ctx,
        (review.name || "A visitor").toUpperCase().slice(0, 32),
        left,
        ly + 10,
        24,
        MUTED,
        400,
        0.25
      );

      y += blockHeight;
    }
  }

  // Кнопка
  ctx.fillStyle = INK;
  ctx.fillRect(120, 1500, W - 240, 170);
  spaced(ctx, "LEAVE A NOTE", W / 2, 1585, 44, BG, 500, 0.3, "center");

  spaced(ctx, "TAP THE BOARD", W / 2, 1760, 24, MUTED, 300, 0.35, "center");

  if (boardTexture) {
    boardTexture.needsUpdate = true;
  }
}

// Перерисовать доску с новыми одобренными отзывами
export function updateReviewsBoard(reviews) {
  if (!boardCanvas) {
    return;
  }

  draw(Array.isArray(reviews) ? reviews : []);
}

export function createReviewsBoard(width = 3.6) {
  boardCanvas = document.createElement("canvas");
  boardCanvas.width = W;
  boardCanvas.height = H;

  boardTexture = new THREE.CanvasTexture(boardCanvas);
  boardTexture.colorSpace = THREE.SRGBColorSpace;
  boardTexture.anisotropy = 4;

  draw([]);

  const height = width * H / W;

  const group = new THREE.Group();
  group.name = "Guest book board";

  const frame =
    new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.16, height + 0.16, 0.1),
      frameMaterial
    );

  frame.position.z = -0.05;

  const face =
    new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({
        map: boardTexture,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
      })
    );

  for (const part of [frame, face]) {
    part.userData.type = "infoBoard";
    part.userData.board = "reviews";
  }

  group.add(frame);
  group.add(face);

  return group;
}
