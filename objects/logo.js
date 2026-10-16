// =====================================================
// MUSEUM LOGO
// objects/logo.js
// =====================================================
//
// Логотип музея на задней стене входного холла, над главной аркой.
// Картинка лежит в assets/brand/logo.png: серо-чёрная фигура
// на прозрачном фоне. Чтобы поменять цвет — перекрась PNG.

import { THREE } from "../core/scene.js";
import { ROOM, LEVELS } from "../config/layout.js";

const LOGO_HEIGHT = 3.6;
const LOGO_ASPECT = 335 / 445;

export function createEntranceLogo(parent) {
  const texture =
    new THREE.TextureLoader().load(
      "assets/brand/logo.png"
    );

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const logo =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        LOGO_HEIGHT * LOGO_ASPECT,
        LOGO_HEIGHT
      ),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
      })
    );

  logo.name = "Museum Logo";

  // Над аркой: между верхом портала (~12) и потолком.
  // Лицевая сторона задней стены лежит на z = backWallZ + 0.6.
  logo.position.set(
    0,
    (12.5 + LEVELS.wallHeight) / 2 - 0.05,
    ROOM.backWallZ + 0.6 + 0.03
  );

  parent.add(logo);

  return logo;
}
