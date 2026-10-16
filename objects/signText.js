// =====================================================
// SHARED SIGN STYLE (black & white)
// objects/signText.js
// =====================================================
//
// Общий вид всех вывесок: чёрная табличка, тонкая белая рамка
// и разреженные заглавные буквы. Лицевая сторона непрозрачная,
// поэтому текст больше не «плавает» в текстурах и не мерцает
// на фоне панели.

import { THREE } from "../core/scene.js";

export const SIGN_BACKGROUND = "#0a0a0b";
export const SIGN_INK = "#efefef";

/*
  Рисует вывеску на canvas.
  width / height — размер canvas в пикселях (соотношение сторон
  должно совпадать с соотношением плоскости, на которую накладывается).
*/
export function createSignTexture(
  text,
  width = 1500,
  height = 240
) {
  // В два раза больше, чем просили: чёткий текст вблизи.
  const scale = 2;

  const canvas =
    document.createElement("canvas");

  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = SIGN_BACKGROUND;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Тонкая внутренняя рамка.
  const inset = canvas.height * 0.09;

  ctx.strokeStyle = "rgba(239, 239, 239, 0.55)";
  ctx.lineWidth = Math.max(2, canvas.height * 0.012);
  ctx.strokeRect(
    inset,
    inset,
    canvas.width - inset * 2,
    canvas.height - inset * 2
  );

  // Разреженные заглавные буквы, подогнанные под ширину.
  const label = String(text).toUpperCase();

  let fontSize = canvas.height * 0.36;

  const setFont = () => {
    ctx.font =
      `300 ${fontSize}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  };

  const spacingFor = () => fontSize * 0.34;

  const measure = () => {
    setFont();

    let total = 0;

    for (const ch of label) {
      total += ctx.measureText(ch).width + spacingFor();
    }

    return total - spacingFor();
  };

  const maxWidth = canvas.width * 0.76;

  while (measure() > maxWidth && fontSize > 12) {
    fontSize -= 2;
  }

  setFont();

  ctx.fillStyle = SIGN_INK;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  let x = (canvas.width - measure()) / 2;
  const y = canvas.height / 2 + fontSize * 0.04;

  for (const ch of label) {
    ctx.fillText(ch, x, y);
    x += ctx.measureText(ch).width + spacingFor();
  }

  const texture =
    new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return texture;
}

/*
  Материал лицевой стороны: непрозрачный, с небольшим сдвигом
  по глубине, чтобы не спорить с панелью (z-fighting).
*/
export function createSignFaceMaterial(texture) {
  return new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });
}
