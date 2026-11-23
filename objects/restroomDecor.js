// =====================================================
// RESTROOM DECOR — фон для селфи в зеркале
// objects/restroomDecor.js
// =====================================================
//
// Стена напротив зеркал: чёрная глянцевая плитка, светящийся
// логотип музея, бра по бокам и подвесные светильники сверху.
// Именно её «отражает» зеркало на селфи.

import { THREE } from "../core/scene.js?v=89a4dbd";

// Внутренние поверхности стен туалета
const LEFT_X = -8.58;
const RIGHT_X = 8.58;

// Центр фона — напротив зеркала над раковинами
export const BACKDROP_Z = -2.5;

// Откуда «смотрит» зеркало на селфи (позиция и точка взгляда)
// (камера пониже — логотип и светильники оказываются над головой)
export const SELFIE_VIEW = {
  position: new THREE.Vector3(7.4, 2.4, BACKDROP_Z),
  target: new THREE.Vector3(LEFT_X, 2.7, BACKDROP_Z),
  fov: 60
};

let tileTexture = null;

function getTileTexture() {
  if (tileTexture) return tileTexture;

  // Вертикальная «кабанчик»-плитка, глубокий чёрный с бликом
  const W = 512;
  const H = 512;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;

  const c = canvas.getContext("2d");
  c.fillStyle = "#c9ccd2";
  c.fillRect(0, 0, W, H);

  const cols = 4;
  const rows = 2;
  const tw = W / cols;
  const th = H / rows;
  const grout = 5;

  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const offset = r % 2 ? tw / 2 : 0;

      for (const dx of [0, -W]) {
        const x = col * tw + offset + dx;
        const y = r * th;

        const g = c.createLinearGradient(x, y, x + tw, y + th);
        g.addColorStop(0, "#1b1d22");
        g.addColorStop(0.45, "#121317");
        g.addColorStop(1, "#0c0d10");

        c.fillStyle = g;
        c.fillRect(x + grout / 2, y + grout / 2, tw - grout, th - grout);

        // узкий блик по краю плитки
        c.fillStyle = "rgba(255,255,255,0.05)";
        c.fillRect(x + grout / 2 + 6, y + grout / 2 + 6, 5, th - grout - 12);
      }
    }
  }

  tileTexture = new THREE.CanvasTexture(canvas);
  tileTexture.colorSpace = THREE.SRGBColorSpace;
  tileTexture.wrapS = THREE.RepeatWrapping;
  tileTexture.wrapT = THREE.RepeatWrapping;
  tileTexture.anisotropy = 4;

  return tileTexture;
}

function tilePanel(width, height) {
  const texture = getTileTexture().clone();
  texture.needsUpdate = true;
  texture.repeat.set(width / 1.6, height / 1.6);

  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.22,
      metalness: 0.15
    })
  );
}

function textTexture(text, width = 1600, height = 200) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const c = canvas.getContext("2d");
  c.clearRect(0, 0, width, height);
  c.fillStyle = "#f3efe6";
  c.textBaseline = "middle";

  const label = text.toUpperCase();
  let size = height * 0.42;

  const measure = () => {
    c.font = `300 ${size}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
    let w = 0;
    for (const ch of label) w += c.measureText(ch).width + size * 0.45;
    return w - size * 0.45;
  };

  while (measure() > width * 0.92 && size > 10) size -= 2;

  let x = (width - measure()) / 2;

  for (const ch of label) {
    c.fillText(ch, x, height / 2);
    x += c.measureText(ch).width + size * 0.45;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

// Лайтбокс с логотипом-аркой
function logoLightbox() {
  const group = new THREE.Group();
  group.name = "Restroom Logo Lightbox";

  const w = 2.6;
  const h = w * 445 / 335;

  const box =
    new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.5, h + 0.5, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 0.4, metalness: 0.5 })
    );

  box.position.z = 0.09;
  group.add(box);

  const logoTexture = new THREE.TextureLoader().load("./assets/brand/logo-light.png");
  logoTexture.colorSpace = THREE.SRGBColorSpace;

  const logo =
    new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        map: logoTexture,
        transparent: true,
        toneMapped: false,
        color: 0xfff4e2
      })
    );

  logo.position.z = 0.19;
  group.add(logo);

  const glow = new THREE.PointLight(0xffe7c4, 3, 6, 1.8);
  glow.position.set(0, 0, 1.2);
  group.add(glow);

  return group;
}

// Настенное бра: латунная чаша с тёплым светом
function sconce() {
  const group = new THREE.Group();

  const brass =
    new THREE.MeshStandardMaterial({ color: 0xb08d57, roughness: 0.3, metalness: 0.9 });

  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 24), brass);
  plate.rotation.x = Math.PI / 2;
  group.add(plate);

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.45, 10), brass);
  arm.rotation.x = Math.PI / 2;
  arm.position.z = 0.24;
  group.add(arm);

  const shade =
    new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0xffe2b8, toneMapped: false })
    );

  shade.position.set(0, 0.05, 0.5);
  group.add(shade);

  const light = new THREE.PointLight(0xffc98a, 2.6, 8, 1.7);
  light.position.set(0, 0.1, 0.8);
  group.add(light);

  return group;
}

// Подвесной светильник: тонкий трос, латунный колпачок, матовый шар
function pendant(drop = 3.6) {
  const group = new THREE.Group();

  const brass =
    new THREE.MeshStandardMaterial({ color: 0xb08d57, roughness: 0.3, metalness: 0.9 });

  const cord =
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, drop, 6),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 })
    );

  cord.position.y = -drop / 2;
  group.add(cord);

  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 24), brass);
  group.add(canopy);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.18, 24), brass);
  cap.position.y = -drop - 0.05;
  group.add(cap);

  const globe =
    new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 32, 20),
      new THREE.MeshBasicMaterial({ color: 0xffe9cc, toneMapped: false })
    );

  globe.position.y = -drop - 0.5;
  group.add(globe);

  const light = new THREE.PointLight(0xffd4a0, 3.2, 10, 1.6);
  light.position.y = -drop - 0.5;
  group.add(light);

  return group;
}

export function createRestroomDecor(room) {
  const decor = new THREE.Group();
  decor.name = "Restroom Selfie Backdrop";

  // Плитка на обеих боковых стенах
  const left = tilePanel(24.4, 10.8);
  left.position.set(LEFT_X, 5.4, -3);
  left.rotation.y = Math.PI / 2;
  decor.add(left);

  const right = tilePanel(24.4, 10.8);
  right.position.set(RIGHT_X, 5.4, -3);
  right.rotation.y = -Math.PI / 2;
  decor.add(right);

  // Стена-фон напротив зеркала над раковинами
  const wall = new THREE.Group();
  wall.position.set(LEFT_X + 0.01, 0, BACKDROP_Z);
  wall.rotation.y = Math.PI / 2;

  const lightbox = logoLightbox();
  lightbox.position.set(0, 6.9, 0);
  wall.add(lightbox);

  for (const z of [-2.15, 2.15]) {
    const s = sconce();
    s.position.set(z, 5.0, 0);
    wall.add(s);
  }

  // Два подвесных светильника по бокам от логотипа
  for (const z of [-3.4, 3.4]) {
    const p = pendant(3.4);
    p.position.set(z, 10.9, 1.6);
    wall.add(p);
  }

  decor.add(wall);

  // Тёплый общий свет на стену-фон
  const wash = new THREE.SpotLight(0xffe0bd, 26, 16, 0.75, 0.6, 1.4);
  wash.position.set(-2, 9.5, BACKDROP_Z);
  wash.target.position.set(LEFT_X, 4.5, BACKDROP_Z);
  decor.add(wash, wash.target);

  // Подсказка над зеркалом у раковин
  const hint =
    new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 0.42),
      new THREE.MeshBasicMaterial({
        map: textTexture("Selfie mirror · double tap"),
        transparent: true,
        toneMapped: false
      })
    );

  hint.position.set(RIGHT_X - 0.05, 5.05, BACKDROP_Z);
  hint.rotation.y = -Math.PI / 2;
  decor.add(hint);

  room.add(decor);

  return decor;
}
