// =====================================================
// SOLID OBJECTS / COLLISIONS
// player/collision.js
// =====================================================
//
// Все крупные предметы в музее твёрдые, как в настоящем мире:
// стойка билетов, гардероб, блок туалетов, кабинки и раковины,
// кресла в кинозале, стенки-перегородки в залах, экран в зале 03.
//
// Игрок — это «столбик» радиусом PLAYER_RADIUS. Если шаг упирается
// в предмет, движение вдоль предмета остаётся (скольжение),
// а сквозь предмет пройти нельзя.
//
// Как добавить новый твёрдый предмет:
//   1. Дай ему понятное имя (object.name = "Мой стол").
//   2. Добавь это имя в SOLID_NAMES для нужной комнаты ниже.
//
// Чтобы временно выключить все столкновения с предметами:
//   поставь COLLISIONS_ENABLED = false.

import { THREE } from "../core/scene.js";

export const COLLISIONS_ENABLED = true;

// Радиус игрока (в единицах сцены).
export const PLAYER_RADIUS = 0.45;

// Предмет считается препятствием, только если он пересекает
// «рост» человека: от колен до макушки (над полом комнаты).
const BODY_MIN_Y = 0.4;
const BODY_MAX_Y = 2.2;

/*
  Какие предметы твёрдые в каждой комнате.
  names    — точные имена объектов верхнего уровня комнаты;
  prefixes — имена, которые начинаются с этого текста;
  groups   — true: все безымянные группы (кабинки, раковины),
             которые попадают в «рост» человека;
  lowMeshes— true: низкие большие меши (сцена кинозала).
*/
const SOLID_NAMES = {
  entrance: {
    names: ["Ticket Booth"]
  },

  leftRoom: {
    names: ["Cloakroom", "Toilet Entrance Block"]
  },

  womenWC: { groups: true },
  menWC: { groups: true },

  room01: {
    prefixes: [
      "room01-central-wall",
      "room01-entry-panel"
    ]
  },

  room03: {
    names: ["Ksenia central film screen"]
  },

  room04: {
    names: ["Cinema Seat"],
    lowMeshes: true
  }
};

const colliderCache = new Map();
const tmpBox = new THREE.Box3();

function box2D(object) {
  tmpBox.setFromObject(object);

  if (tmpBox.isEmpty()) {
    return null;
  }

  return {
    minX: tmpBox.min.x,
    maxX: tmpBox.max.x,
    minZ: tmpBox.min.z,
    maxZ: tmpBox.max.z,
    minY: tmpBox.min.y,
    maxY: tmpBox.max.y
  };
}

function intersectsBody(box) {
  return box.minY < BODY_MAX_Y && box.maxY > BODY_MIN_Y;
}

function buildColliders(roomName, roomGroup) {
  const rule = SOLID_NAMES[roomName];

  if (!rule || !roomGroup) {
    return [];
  }

  roomGroup.updateMatrixWorld(true);

  const result = [];

  for (const child of roomGroup.children) {
    const byName =
      rule.names && rule.names.includes(child.name);

    const byPrefix =
      rule.prefixes &&
      rule.prefixes.some((prefix) =>
        child.name.startsWith(prefix)
      );

    const isGroup =
      child.children.length > 0 && !child.isMesh;

    const byGroup =
      rule.groups && isGroup && child.name === "";

    const bounds = box2D(child);

    if (!bounds) {
      continue;
    }

    const isLowBigMesh =
      rule.lowMeshes &&
      child.isMesh &&
      bounds.maxY > 0.4 &&
      bounds.maxY <= 1.2 &&
      (bounds.maxX - bounds.minX) *
        (bounds.maxZ - bounds.minZ) >
        4;

    if (byName || byPrefix) {
      // Явно названные предметы твёрдые всегда.
      result.push(bounds);
    } else if (byGroup && intersectsBody(bounds)) {
      result.push(bounds);
    } else if (isLowBigMesh) {
      result.push(bounds);
    }
  }

  return result;
}

export function getColliders(roomName, roomGroup) {
  if (!colliderCache.has(roomName)) {
    colliderCache.set(
      roomName,
      buildColliders(roomName, roomGroup)
    );
  }

  return colliderCache.get(roomName);
}

function isBlocked(x, z, colliders) {
  for (const c of colliders) {
    if (
      x > c.minX - PLAYER_RADIUS &&
      x < c.maxX + PLAYER_RADIUS &&
      z > c.minZ - PLAYER_RADIUS &&
      z < c.maxZ + PLAYER_RADIUS
    ) {
      return true;
    }
  }

  return false;
}

/*
  Принимает текущую позицию и желаемую новую.
  Возвращает позицию, куда игрок реально может встать:
  по каждой оси отдельно, поэтому вдоль стенки предмета
  можно скользить, а не «прилипать» к ней.
*/
export function resolveCollisions(
  roomName,
  roomGroup,
  fromX,
  fromZ,
  toX,
  toZ
) {
  if (!COLLISIONS_ENABLED) {
    return { x: toX, z: toZ };
  }

  const colliders = getColliders(roomName, roomGroup);

  if (colliders.length === 0) {
    return { x: toX, z: toZ };
  }

  // Если игрок уже внутри предмета (например, при входе в комнату),
  // не запираем его: разрешаем только шаги, которые не углубляют.
  const alreadyInside = isBlocked(fromX, fromZ, colliders);

  if (alreadyInside) {
    return { x: toX, z: toZ };
  }

  // Идём маленькими шагами, чтобы на слабом телефоне
  // (большой шаг за кадр) нельзя было «проскочить» сквозь предмет.
  const distance = Math.hypot(toX - fromX, toZ - fromZ);
  const steps = Math.max(1, Math.ceil(distance / 0.2));

  let x = fromX;
  let z = fromZ;

  let blockedX = false;
  let blockedZ = false;

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;

    // Как только ось упёрлась в предмет, дальше по ней не идём.
    if (!blockedX) {
      const stepX = fromX + (toX - fromX) * t;

      if (isBlocked(stepX, z, colliders)) {
        blockedX = true;
      } else {
        x = stepX;
      }
    }

    if (!blockedZ) {
      const stepZ = fromZ + (toZ - fromZ) * t;

      if (isBlocked(x, stepZ, colliders)) {
        blockedZ = true;
      } else {
        z = stepZ;
      }
    }
  }

  return { x, z };
}
