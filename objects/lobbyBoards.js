// =====================================================
// LOBBY BOARDS: MUSEUM MAP + UPCOMING EXHIBITIONS
// objects/lobbyBoards.js
// =====================================================
//
// Две доски в лобби: схема музея у касс (правая стена)
// и афиша будущих выставок напротив (левая стена).
// По клику открываются окна: крупная схема / open call.

import { THREE } from "../core/scene.js?v=89a4dbd";

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

  // Fire exit at the far end of the corridor → spiral stairs to the lobby
  ctx.save();
  ctx.setLineDash([16, 14]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(43, 209, 126, 0.85)";
  ctx.beginPath();
  ctx.moveTo(cx + corW / 2, corTop + 40);
  ctx.lineTo(W - 120, corTop + 40);
  ctx.lineTo(W - 120, 1500);
  ctx.lineTo(W - 260, 1500);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#0f8a4b";
  ctx.fillRect(cx + corW / 2 + 40, corTop + 6, 220, 68);
  spaced(ctx, "FIRE EXIT", cx + corW / 2 + 150, corTop + 40, 22, "#ffffff", 600, 0.2, "center");

  ctx.save();
  ctx.translate(W - 92, 1010);
  ctx.rotate(Math.PI / 2);
  spaced(ctx, "SPIRAL STAIRS TO LOBBY", 0, 0, 20, "rgba(43, 209, 126, 0.9)", 300, 0.3, "center");
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

  // You are here
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(lobbyX + lobbyW - 330, lobbyY + 240, 16, 0, Math.PI * 2);
  ctx.fill();
  spaced(ctx, "YOU ARE HERE", lobbyX + lobbyW - 360, lobbyY + 240, 22, INK, 400, 0.2, "right");

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

export function createLobbyBoards(parent) {
  const mapCanvas = drawMap();
  const exhibitionsCanvas = drawExhibitions();

  boardImages.map = mapCanvas;
  boardImages.exhibitions = exhibitionsCanvas;

  // Схема — на правой стене, перед кассами
  const map = createBoard(mapCanvas, "map", 3.2);
  map.position.set(11.88, 4.4, 7.2);
  map.rotation.y = -Math.PI / 2;
  parent.add(map);

  // Афиша — напротив, на левой стене
  const poster = createBoard(exhibitionsCanvas, "exhibitions", 3.2);
  poster.position.set(-11.88, 4.4, 7.2);
  poster.rotation.y = Math.PI / 2;
  parent.add(poster);

  return { map, poster };
}
