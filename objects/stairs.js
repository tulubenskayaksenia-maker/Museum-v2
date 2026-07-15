import { THREE } from "../core/scene.js";
import { stairMaterial } from "../core/materials.js";
import { STAIRS } from "../config/layout.js";

export function createStairs(parent) {
  const stairs = new THREE.Group();

  for (let i = 0; i < STAIRS.stepCount; i++) {
    const isLastStep = i === STAIRS.stepCount - 1;

    const step = new THREE.Mesh(
      new THREE.BoxGeometry(
        13 - i * 0.07,
        STAIRS.stepVisualHeight,
        isLastStep ? STAIRS.topLandingDepth : STAIRS.stepDepth
      ),
      stairMaterial
    );

    step.position.set(
      0,
      STAIRS.stepVisualHeight / 2 + i * STAIRS.stepHeight,
      isLastStep
        ? STAIRS.startZ - i * STAIRS.stepDepth - STAIRS.topLandingDepth / 2
        : STAIRS.startZ - i * STAIRS.stepDepth
    );

    step.castShadow = true;
    step.receiveShadow = true;
    stairs.add(step);
  }

  parent.add(stairs);
}

export function getLandingLevel() {
  return STAIRS.stepVisualHeight / 2 + (STAIRS.stepCount - 1) * STAIRS.stepHeight;
}

export function getLandingZ() {
  const i = STAIRS.stepCount - 1;
  return STAIRS.startZ - i * STAIRS.stepDepth - STAIRS.topLandingDepth / 2;
}