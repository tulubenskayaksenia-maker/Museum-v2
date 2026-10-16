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

let atlasTexture = null;
let atlasNormal = null;

function loadAtlas(url, srgb) {
  const t = new THREE.TextureLoader().load(url);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  // Это данные, а не «картинка»: без гамма-преобразования.
  void srgb;
  return t;
}

function getAtlas() {
  if (!atlasTexture) {
    atlasTexture = loadAtlas("assets/textures/wall_atlas.jpg");
    atlasNormal = loadAtlas("assets/textures/wall_atlas_n.jpg");
  }

  return [atlasTexture, atlasNormal];
}

export function applyConcrete(
  material,
  {
    tile = 3.2,
    bump = 0,
    macro = 0,
    // Заброшенный бетон: сколы, арматура, швы, потёки, трещины.
    atlas = true,
    atlasTile = 20,
    // сколько поверхности «повреждено» (0..1) и сила рельефа
    damage = 0.62,
    relief = 1.0,
    // копоть и грязь у пола
    grime = 1.0
  } = {}
) {
  const texture = getConcreteTexture();

  material.customProgramCacheKey = () =>
    `concrete-${tile}-${atlas}-${atlasTile}-${damage}-${relief}-${grime}`;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.tConcrete = { value: texture };
    shader.uniforms.concreteTile = { value: tile };
    shader.uniforms.concreteBump = { value: bump };
    shader.uniforms.concreteMacro = { value: macro };

    const [atlasMap, atlasNormalMap] = getAtlas();

    shader.uniforms.tAtlas = { value: atlasMap };
    shader.uniforms.tAtlasN = { value: atlasNormalMap };
    shader.uniforms.atlasTile = { value: atlasTile };
    shader.uniforms.atlasDamage = { value: atlas ? damage : 0 };
    shader.uniforms.atlasRelief = { value: relief };
    shader.uniforms.concreteGrime = { value: grime };

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
           uniform sampler2D tAtlas;
           uniform sampler2D tAtlasN;
           uniform float atlasTile;
           uniform float atlasDamage;
           uniform float atlasRelief;
           uniform float concreteGrime;
           varying vec3 vCWorldPos;
           varying vec3 vCWorldNormal;

           float cHash(vec2 p) {
             p = fract(p * vec2(123.34, 456.21));
             p += dot(p, p + 45.32);
             return fract(p.x * p.y);
           }

           float cNoise(vec2 p) {
             vec2 i = floor(p);
             vec2 f = fract(p);
             f = f * f * (3.0 - 2.0 * f);
             return mix(
               mix(cHash(i), cHash(i + vec2(1.0, 0.0)), f.x),
               mix(cHash(i + vec2(0.0, 1.0)), cHash(i + vec2(1.0, 1.0)), f.x),
               f.y
             );
           }

           vec3 cTangentU() {
             vec3 n = abs(normalize(vCWorldNormal));
             if (n.x > n.y && n.x > n.z) return vec3(0.0, 0.0, 1.0);
             return vec3(1.0, 0.0, 0.0);
           }

           vec3 cTangentV() {
             vec3 n = abs(normalize(vCWorldNormal));
             if (n.x > n.y && n.x > n.z) return vec3(0.0, 1.0, 0.0);
             if (n.y > n.z) return vec3(0.0, 0.0, 1.0);
             return vec3(0.0, 1.0, 0.0);
           }

           float cDamageMask(vec2 uv) {
             // Какие участки стены «повреждены» — решает шум, а не повтор плитки.
             float a = cNoise(uv * 0.55 + 7.3);
             float b = cNoise(uv * 1.3 + 31.7);
             float m = a * 0.7 + b * 0.3;
             return smoothstep(0.48 - atlasDamage * 0.30, 0.62 - atlasDamage * 0.20, m);
           }

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
           diffuseColor.rgb *= ch;

           vec2 auv = concreteUV() * concreteTile / atlasTile;
           float dmask = cDamageMask(auv * atlasTile / 6.0);
           float amask = dmask * step(0.001, atlasDamage);
           vec3 atl = texture2D(tAtlas, auv).rgb * 2.0;
           diffuseColor.rgb *= mix(vec3(1.0), atl, amask);

           // Копоть и грязь у пола, лёгкая пыль и потёртость выше.
           float gy = vCWorldPos.y;
           float gnoise = cNoise(concreteUV() * 2.5) * 0.6 + cNoise(concreteUV() * 9.0) * 0.4;
           float floorGrime = 1.0 - smoothstep(0.0, 3.4 + gnoise * 2.2, gy);
           diffuseColor.rgb *= 1.0 - concreteGrime * 0.50 * floorGrime;`
        )
        .replace(
          "#include <normal_fragment_maps>",
          `#include <normal_fragment_maps>
           {
             vec3 anm = texture2D(tAtlasN, auv).xyz * 2.0 - 1.0;
             vec3 tu = normalize((viewMatrix * vec4(cTangentU(), 0.0)).xyz);
             vec3 tv = normalize((viewMatrix * vec4(cTangentV(), 0.0)).xyz);
             normal = normalize(
               normal + (tu * anm.x + tv * anm.y) * atlasRelief * amask
             );
           }
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
