export function setupOnboarding() {
  const onboarding =
    document.getElementById(
      "museum-onboarding"
    );

  const instructions =
    document.getElementById(
      "museum-instructions"
    );

  const enterButton =
    document.getElementById(
      "museum-enter-button"
    );

  const howButton =
    document.getElementById(
      "museum-open-instructions"
    );

  const helpButton =
    document.getElementById(
      "museum-help-button"
    );

  const closeButton =
    document.getElementById(
      "museum-instructions-close"
    );

  const startButton =
    document.getElementById(
      "museum-instructions-start"
    );

  if (!onboarding) {
    console.error(
      "museum-onboarding was not found in index.html"
    );

    return;
  }

  if (!instructions) {
    console.error(
      "museum-instructions was not found in index.html"
    );

    return;
  }

  function showOnboarding() {
    onboarding.classList.add(
      "visible"
    );

    onboarding.setAttribute(
      "aria-hidden",
      "false"
    );
  }

  function hideOnboarding() {
    onboarding.classList.remove(
      "visible"
    );

    onboarding.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  function showInstructions() {
    hideOnboarding();

    instructions.classList.add(
      "visible"
    );

    instructions.setAttribute(
      "aria-hidden",
      "false"
    );
  }

  function hideInstructions() {
    instructions.classList.remove(
      "visible"
    );

    instructions.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  enterButton?.addEventListener(
    "click",
    hideOnboarding
  );

  howButton?.addEventListener(
    "click",
    showInstructions
  );

  helpButton?.addEventListener(
    "click",
    showInstructions
  );

  closeButton?.addEventListener(
    "click",
    hideInstructions
  );

  startButton?.addEventListener(
    "click",
    hideInstructions
  );

  onboarding.addEventListener(
    "click",
    (event) => {
      if (
        event.target === onboarding
      ) {
        hideOnboarding();
      }
    }
  );

  instructions.addEventListener(
    "click",
    (event) => {
      if (
        event.target === instructions
      ) {
        hideInstructions();
      }
    }
  );

  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Escape") {
        return;
      }

      hideOnboarding();
      hideInstructions();
    }
  );

  showOnboarding();
}