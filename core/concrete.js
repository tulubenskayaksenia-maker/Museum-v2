// =====================================================
// CONCRETE WALL TEXTURE
// core/concrete.js
// =====================================================
//
// Бесшовная бетонная фактура (assets/textures/concrete.jpg):
// мелкое зерно, поры и лёгкие пятна. Накладывается по мировым
// координатам (box-проекция), поэтому на стенах любого размера
// поры остаются одного размера и нигде не растягиваются.
// Это только поверхность: форма стен не меняется.
//
// Использование:  applyConcrete(материал);
//
// Настройки:
//   tile  — сколько единиц сцены занимает одна «плитка» текстуры
//           (больше число → крупнее фактура);
//   bump  — сила рельефа (0 — гладко);
//   macro — сила крупных пятен.

import { THREE } from "./scene.js";

let sharedTexture = null;

function getConcreteTexture() {
  if (!sharedTexture) {
    sharedTexture =
      new THREE.TextureLoader().load(
        "assets/textures/concrete.jpg"
      );

    sharedTexture.wrapS = THREE.RepeatWrapping;
    sharedTexture.wrapT = THREE.RepeatWrapping;
    sharedTexture.anisotropy = 8;
    sharedTexture.minFilter =
      THREE.LinearMipmapLinearFilter;
    sharedTexture.magFilter = THREE.LinearFilter;
  }

  return sharedTexture;
}

export function applyConcrete(
  material,
  { tile = 3.2, bump = 0, macro = 0 } = {}
) {
  const texture = getConcreteTexture();

  material.customProgramCacheKey = () =>
    `concrete-${tile}-${bump}-${macro}`;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.tConcrete = { value: texture };
    shader.uniforms.concreteTile = { value: tile };
    shader.uniforms.concreteBump = { value: bump };
    shader.uniforms.concreteMacro = { value: macro };

    shader.vertexShader =
      shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
           varying vec3 vCWorldPos;
           varying vec3 vCWorldNormal;`
        )
        .replace(
          "#include <project_vertex>",
          `#include <project_vertex>
           vCWorldPos =
             (modelMatrix * vec4(transformed, 1.0)).xyz;
           vCWorldNormal =
             normalize(mat3(modelMatrix) * objectNormal);`
        );

    shader.fragmentShader =
      shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
           uniform sampler2D tConcrete;
           uniform float concreteTile;
           uniform float concreteBump;
           uniform float concreteMacro;
           varying vec3 vCWorldPos;
           varying vec3 vCWorldNormal;

           vec2 concreteUV() {
             vec3 n = abs(normalize(vCWorldNormal));
             vec3 p = vCWorldPos;
             vec2 uv;
             if (n.x > n.y && n.x > n.z) uv = vec2(p.z, p.y);
             else if (n.y > n.z) uv = vec2(p.x, p.z);
             else uv = vec2(p.x, p.y);
             return uv / concreteTile;
           }`
        )
        .replace(
          "#include <map_fragment>",
          `#include <map_fragment>
           vec2 cuv = concreteUV();
           // Три слоя одной фактуры с разным масштабом и поворотом:
           // повторов и симметрии не видно, рисунок хаотичный.
           mat2 cRotB = mat2(0.8, 0.6, -0.6, 0.8);
           mat2 cRotC = mat2(0.8776, -0.4794, 0.4794, 0.8776);
           float tA = texture2D(tConcrete, cuv).r * 2.0;
           float tB = texture2D(
             tConcrete, cRotB * cuv * 0.43 + vec2(0.37, 0.71)
           ).r * 2.0;
           float tC = texture2D(
             tConcrete, cRotC * cuv * 0.19 + vec2(0.13, 0.52)
           ).r * 2.0;
           float ch = tA * mix(1.0, tB, 0.65) * mix(1.0, tC, 0.45);
           diffuseColor.rgb *= ch;`
        )
        .replace(
          "#include <normal_fragment_maps>",
          `#include <normal_fragment_maps>
           {
             vec2 dH =
               vec2(dFdx(ch), dFdy(ch)) * concreteBump;
             vec3 sX = dFdx(-vViewPosition);
             vec3 sY = dFdy(-vViewPosition);
             vec3 R1 = cross(sY, normal);
             vec3 R2 = cross(normal, sX);
             float det = dot(sX, R1) * faceDirection;
             vec3 grad = sign(det) * (dH.x * R1 + dH.y * R2);
             normal = normalize(abs(det) * normal - grad);
           }`
        );
  };

  material.needsUpdate = true;

  return material;
}
