import { createArchPortal } from "./arch.js";

import {
  ROOM
} from "../config/layout.js";

import {
  getLandingLevel
} from "./stairs.js";

export function createMainPortal(parent) {
  const portal = createArchPortal({
    width: 5.2,
    height: 7.4,
    depth: 1.4,

    openingWidth: 3.6,
    openingHeight: 6.2,

    target: "corridor",

    // Внутри арки должна быть чёрная плоскость
    showDarkOpening: true
  });

  portal.name = "Main Corridor Portal";

  /*
    Ставим портал чуть ближе к камере,
    чтобы чёрный проём находился перед задней стеной,
    а не прятался внутри неё.
  */

  portal.position.set(
    0,
    getLandingLevel(),
    ROOM.backWallZ + 1.05
  );

  parent.add(portal);
}