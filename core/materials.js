import { THREE } from "./scene.js";

// ==========================================
// ГЛАДКИЙ ПОЛ
// ==========================================

export const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x3f4147,
  roughness: 0.82,
  metalness: 0.02
});

// ==========================================
// ГЛАДКИЕ СТЕНЫ
// ==========================================

export const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0x555860,
  roughness: 0.94,
  metalness: 0
});

// Оставляем экспорт, чтобы старые импорты не ломали сайт.
// Но никакой текстуры здесь больше нет.
export const lobbyStoneMaterial = new THREE.MeshStandardMaterial({
  color: 0x555860,
  roughness: 0.94,
  metalness: 0
});

// ==========================================
// ЛЕСТНИЦА
// ==========================================

export const stairMaterial = new THREE.MeshStandardMaterial({
  color: 0x4b4e55,
  roughness: 0.9,
  metalness: 0
});

// ==========================================
// АРКИ
// ==========================================

export const archMaterial = new THREE.MeshStandardMaterial({
  color: 0x686b72,
  roughness: 0.96,
  metalness: 0
});

// ==========================================
// ТЁМНЫЕ ПРОЁМЫ
// ==========================================

export const darkMaterial = new THREE.MeshStandardMaterial({
  color: 0x020204,
  roughness: 1,
  metalness: 0
});

// ==========================================
// ПОТОЛОК — ПОКА НЕ ИСПОЛЬЗУЕТСЯ
// ==========================================

export const ceilingMaterial = new THREE.MeshStandardMaterial({
  color: 0x3b3d42,
  roughness: 1,
  metalness: 0
});

// ==========================================
// РАМКИ КАРТИН
// ==========================================

export const frameMaterial = new THREE.MeshStandardMaterial({
  color: 0x151515,
  roughness: 0.72,
  metalness: 0.06
});

// ==========================================
// ПОЛОТНА КАРТИН
// ==========================================

export const paintingMaterial = new THREE.MeshStandardMaterial({
  color: 0xd8d5cf,
  roughness: 0.88,
  metalness: 0,
  emissive: 0x111111,
  emissiveIntensity: 0.18
});