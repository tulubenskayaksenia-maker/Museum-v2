// =====================================================
// REAL STAR MAP
// objects/starMap.js
// =====================================================
//
// Яркие звёзды по настоящим координатам (прямое восхождение
// в часах, склонение в градусах) и звёздной величине.
// Чем меньше величина, тем ярче и крупнее звезда.
// Цвет — по спектральному классу (красные гиганты, голубые и т.д.).
// Плюс Млечный Путь вдоль галактической плоскости
// и много слабых фоновых звёзд.

import { THREE } from "../core/scene.js?v=84d1282";

const BLUE = 0xcfdcff;
const WHITE = 0xffffff;
const YELLOW = 0xfff1cf;
const ORANGE = 0xffd3a1;
const RED = 0xffb07c;

// [имя, RA (часы), Dec (градусы), величина, цвет]
const STARS = [
  // Orion
  ["Betelgeuse", 5.919, 7.41, 0.5, RED],
  ["Rigel", 5.242, -8.2, 0.13, BLUE],
  ["Bellatrix", 5.418, 6.35, 1.64, BLUE],
  ["Mintaka", 5.533, -0.3, 2.23, BLUE],
  ["Alnilam", 5.604, -1.2, 1.69, BLUE],
  ["Alnitak", 5.679, -1.94, 1.77, BLUE],
  ["Saiph", 5.796, -9.67, 2.06, BLUE],
  ["Meissa", 5.585, 9.93, 3.4, BLUE],

  // Big Dipper
  ["Dubhe", 11.062, 61.75, 1.8, ORANGE],
  ["Merak", 11.031, 56.38, 2.37, WHITE],
  ["Phecda", 11.897, 53.69, 2.44, WHITE],
  ["Megrez", 12.257, 57.03, 3.31, WHITE],
  ["Alioth", 12.9, 55.96, 1.77, WHITE],
  ["Mizar", 13.399, 54.93, 2.04, WHITE],
  ["Alkaid", 13.792, 49.31, 1.86, BLUE],

  // Cassiopeia
  ["Caph", 0.153, 59.15, 2.28, YELLOW],
  ["Schedar", 0.675, 56.54, 2.24, ORANGE],
  ["Navi", 0.945, 60.72, 2.15, BLUE],
  ["Ruchbah", 1.43, 60.24, 2.66, WHITE],
  ["Segin", 1.907, 63.67, 3.35, BLUE],

  // Cygnus
  ["Deneb", 20.69, 45.28, 1.25, WHITE],
  ["Sadr", 20.37, 40.26, 2.23, YELLOW],
  ["Albireo", 19.512, 27.96, 3.05, ORANGE],
  ["Gienah", 20.77, 33.97, 2.48, ORANGE],
  ["Delta Cygni", 19.75, 45.13, 2.87, BLUE],

  // Lyra
  ["Vega", 18.616, 38.78, 0.03, BLUE],
  ["Zeta Lyrae", 18.746, 37.6, 4.3, WHITE],
  ["Delta Lyrae", 18.908, 36.9, 4.3, RED],
  ["Sulafat", 18.982, 32.69, 3.25, BLUE],
  ["Sheliak", 18.835, 33.36, 3.5, BLUE],

  // Leo
  ["Regulus", 10.139, 11.97, 1.35, BLUE],
  ["Eta Leonis", 10.122, 16.76, 3.5, WHITE],
  ["Algieba", 10.333, 19.84, 2.0, ORANGE],
  ["Adhafera", 10.278, 23.42, 3.4, WHITE],
  ["Rasalas", 9.879, 26.0, 3.9, ORANGE],
  ["Epsilon Leonis", 9.764, 23.77, 3.0, YELLOW],
  ["Denebola", 11.818, 14.57, 2.1, WHITE],
  ["Zosma", 11.235, 20.52, 2.56, WHITE],
  ["Chertan", 11.237, 15.43, 3.33, WHITE],

  // Scorpius
  ["Antares", 16.49, -26.43, 1.06, RED],
  ["Dschubba", 16.006, -22.62, 2.3, BLUE],
  ["Acrab", 16.09, -19.8, 2.6, BLUE],
  ["Pi Scorpii", 15.981, -26.11, 2.9, BLUE],
  ["Sigma Scorpii", 16.353, -25.59, 2.9, BLUE],
  ["Tau Scorpii", 16.598, -28.22, 2.8, BLUE],
  ["Epsilon Scorpii", 16.836, -34.29, 2.3, ORANGE],
  ["Mu Scorpii", 16.864, -38.05, 3.0, BLUE],
  ["Zeta Scorpii", 16.909, -42.36, 3.6, ORANGE],
  ["Eta Scorpii", 17.203, -43.24, 3.3, WHITE],
  ["Sargas", 17.622, -43.0, 1.86, YELLOW],
  ["Iota Scorpii", 17.793, -40.13, 3.0, YELLOW],
  ["Kappa Scorpii", 17.708, -39.03, 2.4, BLUE],
  ["Shaula", 17.56, -37.1, 1.62, BLUE],

  // Crux and Centaurus
  ["Acrux", 12.443, -63.1, 0.77, BLUE],
  ["Mimosa", 12.795, -59.69, 1.25, BLUE],
  ["Gacrux", 12.519, -57.11, 1.64, RED],
  ["Delta Crucis", 12.252, -58.75, 2.8, BLUE],
  ["Alpha Centauri", 14.66, -60.83, -0.27, YELLOW],
  ["Hadar", 14.064, -60.37, 0.61, BLUE],

  // Single bright stars
  ["Sirius", 6.752, -16.72, -1.46, WHITE],
  ["Canopus", 6.4, -52.7, -0.74, WHITE],
  ["Arcturus", 14.261, 19.18, -0.05, ORANGE],
  ["Capella", 5.278, 46.0, 0.08, YELLOW],
  ["Procyon", 7.655, 5.22, 0.34, YELLOW],
  ["Achernar", 1.629, -57.24, 0.46, BLUE],
  ["Altair", 19.846, 8.87, 0.77, WHITE],
  ["Aldebaran", 4.599, 16.51, 0.85, ORANGE],
  ["Spica", 13.42, -11.16, 0.97, BLUE],
  ["Pollux", 7.755, 28.03, 1.14, ORANGE],
  ["Castor", 7.577, 31.89, 1.58, WHITE],
  ["Fomalhaut", 22.961, -29.62, 1.16, WHITE],
  ["Polaris", 2.53, 89.26, 1.98, YELLOW],
  ["Alphard", 9.46, -8.66, 1.98, ORANGE],
  ["Hamal", 2.12, 23.46, 2.0, ORANGE],
  ["Nunki", 18.921, -26.3, 2.05, BLUE],
  ["Kaus Australis", 18.403, -34.38, 1.85, BLUE],
  ["Mirfak", 3.405, 49.86, 1.79, YELLOW],
  ["Alpheratz", 0.14, 29.09, 2.06, BLUE],
  ["Rasalhague", 17.582, 12.56, 2.08, WHITE],

  // Pleiades
  ["Alcyone", 3.791, 24.1, 2.87, BLUE],
  ["Atlas", 3.819, 24.05, 3.6, BLUE],
  ["Electra", 3.748, 24.11, 3.7, BLUE],
  ["Maia", 3.763, 24.37, 3.9, BLUE],
  ["Merope", 3.772, 23.95, 4.2, BLUE],
  ["Taygeta", 3.753, 24.47, 4.3, BLUE]
];

// Линии созвездий (очень бледные)
const LINES = [
  ["Betelgeuse", "Bellatrix"], ["Betelgeuse", "Alnitak"], ["Bellatrix", "Mintaka"],
  ["Mintaka", "Alnilam"], ["Alnilam", "Alnitak"], ["Alnitak", "Saiph"],
  ["Mintaka", "Rigel"], ["Meissa", "Betelgeuse"], ["Meissa", "Bellatrix"],

  ["Dubhe", "Merak"], ["Merak", "Phecda"], ["Phecda", "Megrez"], ["Megrez", "Dubhe"],
  ["Megrez", "Alioth"], ["Alioth", "Mizar"], ["Mizar", "Alkaid"],

  ["Caph", "Schedar"], ["Schedar", "Navi"], ["Navi", "Ruchbah"], ["Ruchbah", "Segin"],

  ["Deneb", "Sadr"], ["Sadr", "Albireo"], ["Gienah", "Sadr"], ["Sadr", "Delta Cygni"],

  ["Vega", "Zeta Lyrae"], ["Zeta Lyrae", "Delta Lyrae"], ["Delta Lyrae", "Sulafat"],
  ["Sulafat", "Sheliak"], ["Sheliak", "Zeta Lyrae"],

  ["Regulus", "Eta Leonis"], ["Eta Leonis", "Algieba"], ["Algieba", "Adhafera"],
  ["Adhafera", "Rasalas"], ["Rasalas", "Epsilon Leonis"], ["Algieba", "Zosma"],
  ["Zosma", "Denebola"], ["Denebola", "Chertan"], ["Chertan", "Regulus"], ["Zosma", "Chertan"],

  ["Acrab", "Dschubba"], ["Dschubba", "Pi Scorpii"], ["Dschubba", "Sigma Scorpii"],
  ["Sigma Scorpii", "Antares"], ["Antares", "Tau Scorpii"], ["Tau Scorpii", "Epsilon Scorpii"],
  ["Epsilon Scorpii", "Mu Scorpii"], ["Mu Scorpii", "Zeta Scorpii"], ["Zeta Scorpii", "Eta Scorpii"],
  ["Eta Scorpii", "Sargas"], ["Sargas", "Iota Scorpii"], ["Iota Scorpii", "Kappa Scorpii"],
  ["Kappa Scorpii", "Shaula"],

  ["Acrux", "Gacrux"], ["Mimosa", "Delta Crucis"],
  ["Castor", "Pollux"]
];

function direction(raHours, decDeg) {
  const ra = (raHours / 24) * Math.PI * 2;
  const dec = THREE.MathUtils.degToRad(decDeg);

  return new THREE.Vector3(
    Math.cos(dec) * Math.cos(ra),
    Math.sin(dec),
    -Math.cos(dec) * Math.sin(ra)
  );
}

// Круглая звезда с мягким краем (вместо квадратной точки)
let starTexture = null;

function getStarTexture() {
  if (starTexture) {
    return starTexture;
  }

  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const c = canvas.getContext("2d");
  const g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);

  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.95)");
  g.addColorStop(0.5, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");

  c.fillStyle = g;
  c.fillRect(0, 0, size, size);

  starTexture = new THREE.CanvasTexture(canvas);
  starTexture.colorSpace = THREE.SRGBColorSpace;

  return starTexture;
}

function pointsLayer(positions, colors, size, opacity) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const points =
    new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        // Текстура с мягким краем делает точку визуально меньше — компенсируем
        size: size * 1.9 * Math.min(window.devicePixelRatio || 1, 2),
        sizeAttenuation: false,
        map: getStarTexture(),
        vertexColors: true,
        transparent: true,
        opacity,
        depthWrite: false
      })
    );

  points.raycast = () => {};
  points.renderOrder = -1;

  return points;
}

// Случайное нормальное распределение
function gauss() {
  let u = 0;
  let v = 0;

  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();

  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function createStarMap(radius = 150) {
  const group = new THREE.Group();
  group.name = "Real Star Map";

  const color = new THREE.Color();
  const byName = new Map();

  // Яркие звёзды — по величине в 4 слоя (разный размер и яркость)
  const layers = [
    { max: 0.5, size: 5.2, opacity: 1, pos: [], col: [] },
    { max: 1.5, size: 3.8, opacity: 1, pos: [], col: [] },
    { max: 2.5, size: 2.8, opacity: 0.95, pos: [], col: [] },
    { max: 9, size: 2.0, opacity: 0.8, pos: [], col: [] }
  ];

  for (const [name, ra, dec, mag, hex] of STARS) {
    const p = direction(ra, dec).multiplyScalar(radius);
    byName.set(name, p);

    const layer = layers.find((l) => mag <= l.max);
    color.setHex(hex);

    layer.pos.push(p.x, p.y, p.z);
    layer.col.push(color.r, color.g, color.b);
  }

  for (const layer of layers) {
    group.add(pointsLayer(layer.pos, layer.col, layer.size, layer.opacity));
  }

  // Млечный Путь: много слабых звёзд вдоль галактической плоскости,
  // гуще к центру Галактики (Стрелец)
  const ngp = direction(12.857, 27.13);              // северный полюс Галактики
  const center = direction(17.761, -29.0);           // центр Галактики
  const third = new THREE.Vector3().crossVectors(ngp, center).normalize();

  const mwPos = [];
  const mwCol = [];

  for (let i = 0; i < 5200; i++) {
    // долгота: чаще ближе к центру Галактики
    const l = gauss() * 1.1 + (Math.random() < 0.35 ? 0 : Math.random() * Math.PI * 2);
    const b = gauss() * THREE.MathUtils.degToRad(Math.random() < 0.7 ? 4 : 10);

    const dir = new THREE.Vector3()
      .addScaledVector(center, Math.cos(l) * Math.cos(b))
      .addScaledVector(third, Math.sin(l) * Math.cos(b))
      .addScaledVector(ngp, Math.sin(b))
      .normalize()
      .multiplyScalar(radius * 1.02);

    mwPos.push(dir.x, dir.y, dir.z);

    const t = 0.55 + Math.random() * 0.45;
    mwCol.push(t * 0.92, t * 0.95, t);
  }

  group.add(pointsLayer(mwPos, mwCol, 1.1, 0.45));

  // Слабые фоновые звёзды по всему небу
  const bgPos = [];
  const bgCol = [];

  for (let i = 0; i < 2600; i++) {
    const u = Math.random() * 2 - 1;
    const phi = Math.random() * Math.PI * 2;
    const k = Math.sqrt(1 - u * u);
    const r = radius * 1.03;

    bgPos.push(Math.cos(phi) * k * r, u * r, Math.sin(phi) * k * r);

    const t = 0.45 + Math.random() * 0.5;
    const warm = Math.random();
    bgCol.push(t, t * (warm > 0.8 ? 0.9 : 1), t * (warm > 0.8 ? 0.8 : 1));
  }

  group.add(pointsLayer(bgPos, bgCol, 1.3, 0.7));

  // Едва заметные линии созвездий
  const linePos = [];

  for (const [a, b] of LINES) {
    const pa = byName.get(a);
    const pb = byName.get(b);

    if (pa && pb) {
      linePos.push(pa.x * 0.995, pa.y * 0.995, pa.z * 0.995, pb.x * 0.995, pb.y * 0.995, pb.z * 0.995);
    }
  }

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePos, 3));

  const lines =
    new THREE.LineSegments(
      lineGeometry,
      new THREE.LineBasicMaterial({
        color: 0x9fb4ff,
        transparent: true,
        opacity: 0.13,
        depthWrite: false
      })
    );

  lines.raycast = () => {};
  group.add(lines);

  return group;
}
