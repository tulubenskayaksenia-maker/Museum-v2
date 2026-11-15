// =====================================================
// LOBBY BOARDS: MUSEUM MAP + UPCOMING EXHIBITIONS
// objects/lobbyBoards.js
// =====================================================
//
// Две доски в лобби: схема музея у касс (правая стена)
// и афиша будущих выставок напротив (левая стена).
// По клику открываются окна: крупная схема / open call.

import { THREE } from "../core/scene.js?v=e34eec8";

const INK = "#efefef";
const MUTED = "rgba(239, 239, 239, 0.55)";
const BG = "#0a0a0b";

const frameMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x111214,
    roughness: 0.55,
    metalness: 0.25
  });

// Холсты для окон: те же картинки, что на стенах
export const boardImages = {};

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

function serif(ctx, text, x, y, size, color = INK, align = "left") {
  ctx.font = `400 ${size}px Georgia, "Times New Roman", serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.textAlign = "left";
}

function baseCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(239, 239, 239, 0.4)";
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, width - 56, height - 56);

  ctx.textBaseline = "middle";

  return { canvas, ctx };
}

// -----------------------------------------------------
// MAP
// -----------------------------------------------------

function drawMap() {
  const W = 1400;
  const H = 1900;
  const { canvas, ctx } = baseCanvas(W, H);

  spaced(ctx, "MUSEUM MAP", W / 2, 120, 46, INK, 300, 0.4, "center");

  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;

  const room = (x, y, w, h) => ctx.strokeRect(x, y, w, h);

  const label = (text, x, y, size = 30, color = INK, align = "center") =>
    spaced(ctx, text, x, y, size, color, 400, 0.22, align);

  const sub = (text, x, y, align = "center") =>
    spaced(ctx, text, x, y, 22, MUTED, 300, 0.2, align);

  // Coordinates: lobby at the bottom, corridor going up
  const cx = W / 2;

  // Corridor
  const corW = 170;
  const corTop = 330;
  const corBottom = 1250;
  room(cx - corW / 2, corTop, corW, corBottom - corTop);

  spaced(ctx, "CORRIDOR", cx, (corTop + corBottom) / 2 + 40, 24, MUTED, 300, 0.35, "center");

  // Rooms along the corridor
  const roomW = 380;
  const roomH = 200;

  const sideRoom = (side, y, title, kind) => {
    const x = side === "left" ? cx - corW / 2 - roomW - 40 : cx + corW / 2 + 40;
    room(x, y - roomH / 2, roomW, roomH);

    // door line to the corridor
    const doorX1 = side === "left" ? x + roomW : x;
    const doorX2 = side === "left" ? cx - corW / 2 : cx + corW / 2;
    ctx.beginPath();
    ctx.moveTo(doorX1, y);
    ctx.lineTo(doorX2, y);
    ctx.stroke();

    label(title, x + roomW / 2, y - 22);
    sub(kind, x + roomW / 2, y + 30);
  };

  sideRoom("left", 1080, "GALLERY 1", "PAINTINGS");
  sideRoom("right", 1080, "GALLERY 2", "PHOTOGRAPHY · VIDEO");
  sideRoom("left", 800, "GALLERY 3", "FILM");
  sideRoom("right", 800, "GALLERY 4", "CINEMA");
  sideRoom("left", 520, "SHOP", "STICKERS · SUPPORT");

  // Shop exit back to the lobby (dashed line on the far left)
  ctx.save();
  ctx.setLineDash([16, 14]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = MUTED;
  const shopLeft = cx - corW / 2 - roomW - 40;
  ctx.beginPath();
  ctx.moveTo(shopLeft, 520);
  ctx.lineTo(120, 520);
  ctx.lineTo(120, 1500);
  ctx.lineTo(260, 1500);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(92, 1010);
  ctx.rotate(-Math.PI / 2);
  spaced(ctx, "EXIT TO LOBBY", 0, 0, 20, MUTED, 300, 0.3, "center");
  ctx.restore();

  // Stairs
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    const y = 1290 + i * 18;
    ctx.beginPath();
    ctx.moveTo(cx - 90, y);
    ctx.lineTo(cx + 90, y);
    ctx.stroke();
  }
  sub("STAIRS", cx + 200, 1335, "left");

  // Lobby
  ctx.lineWidth = 4;
  const lobbyX = 260;
  const lobbyY = 1420;
  const lobbyW = W - 520;
  const lobbyH = 330;
  room(lobbyX, lobbyY, lobbyW, lobbyH);

  label("LOBBY", cx, lobbyY + 70, 34);

  // Tickets (right) and wardrobe (left)
  room(lobbyX + lobbyW - 200, lobbyY + 120, 150, 130);
  sub("TICKETS", lobbyX + lobbyW - 125, lobbyY + 185);

  room(lobbyX + 40, lobbyY + 120, 210, 130);
  sub("WARDROBE", lobbyX + 145, lobbyY + 170);
  sub("WC", lobbyX + 145, lobbyY + 205);

  // You are here — у входа, между стендами
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(cx, lobbyY + 270, 16, 0, Math.PI * 2);
  ctx.fill();
  spaced(ctx, "YOU ARE HERE", cx + 34, lobbyY + 270, 22, INK, 400, 0.2, "left");

  // Entrance
  sub("ENTRANCE", cx, lobbyY + lobbyH + 50);

  return canvas;
}

// -----------------------------------------------------
// UPCOMING EXHIBITIONS
// -----------------------------------------------------

function drawExhibitions() {
  const W = 1400;
  const H = 1900;
  const { canvas, ctx } = baseCanvas(W, H);

  spaced(ctx, "INCOGNITO MUSEUM", W / 2, 120, 30, MUTED, 300, 0.4, "center");
  serif(ctx, "Upcoming", W / 2, 270, 130, INK, "center");
  serif(ctx, "exhibitions", W / 2, 400, 130, INK, "center");

  const row = (y, tag, title, line) => {
    ctx.strokeStyle = "rgba(239, 239, 239, 0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, y - 90);
    ctx.lineTo(W - 120, y - 90);
    ctx.stroke();

    spaced(ctx, tag, 120, y - 30, 26, MUTED, 400, 0.3);
    serif(ctx, title, 120, y + 50, 72);
    spaced(ctx, line, 120, y + 130, 26, MUTED, 300, 0.15);
  };

  row(640, "NOW", "Opening exhibition", "FROM 23 NOVEMBER 2026");
  row(940, "NEXT", "Your work could be here", "OPEN CALL FOR ARTISTS");
  row(1240, "ALWAYS", "Free entry", "ONLINE · OPEN DAY AND NIGHT");

  // Apply button
  ctx.fillStyle = INK;
  ctx.fillRect(120, 1500, W - 240, 170);
  spaced(ctx, "APPLY TO EXHIBIT", W / 2, 1585, 44, BG, 500, 0.3, "center");

  spaced(ctx, "TAP THE POSTER", W / 2, 1760, 24, MUTED, 300, 0.35, "center");

  return canvas;
}

// -----------------------------------------------------
// BOARD MESH
// -----------------------------------------------------

function createBoard(canvas, kind, width) {
  const height = width * canvas.height / canvas.width;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const group = new THREE.Group();
  group.name = `Lobby ${kind} board`;

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
        map: texture,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
      })
    );

  for (const part of [frame, face]) {
    part.userData.type = "infoBoard";
    part.userData.board = kind;
  }

  group.add(frame);
  group.add(face);

  return group;
}

const legMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x2a2c31,
    roughness: 0.4,
    metalness: 0.7
  });

// Стенд: доска на двух тонких стойках с основанием
function createStand(canvas, kind) {
  const width = 2.5;
  const board = createBoard(canvas, kind, width);
  const height = width * canvas.height / canvas.width;
  const bottom = 1.35;

  const stand = new THREE.Group();
  stand.name = `Lobby ${kind} stand`;

  board.position.y = bottom + height / 2;
  stand.add(board);

  for (const x of [-width * 0.36, width * 0.36]) {
    const leg =
      new THREE.Mesh(
        new THREE.BoxGeometry(0.07, bottom + 0.1, 0.07),
        legMaterial
      );

    leg.position.set(x, (bottom + 0.1) / 2, -0.08);
    stand.add(leg);

    const foot =
      new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.05, 0.7),
        legMaterial
      );

    foot.position.set(x, 0.025, -0.08);
    stand.add(foot);
  }

  stand.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return stand;
}

export function createLobbyBoards(parent) {
  const mapCanvas = drawMap();
  const exhibitionsCanvas = drawExhibitions();

  boardImages.map = mapCanvas;
  boardImages.exhibitions = exhibitionsCanvas;

  /*
    Отдельно стоящие стенды лицом ко входу.
    На телефоне в вертикальном кадре видно только ~25° в стороны,
    поэтому стенды стоят ближе к центру и смотрят на посетителя.
  */
  const map = createStand(mapCanvas, "map");
  map.position.set(3.1, 0, 6.5);
  map.rotation.y = -0.12;
  parent.add(map);

  const poster = createStand(exhibitionsCanvas, "exhibitions");
  poster.position.set(-3.1, 0, 6.5);
  poster.rotation.y = 0.12;
  parent.add(poster);

  return { map, poster };
}
