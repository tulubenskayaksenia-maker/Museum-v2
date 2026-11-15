// =====================================================
// MUSEUM SHOP WINDOW
// ui/shopMenu.js
// =====================================================

let menuElement = null;
let menuOpen = false;

export function setupShopMenu() {
  menuElement =
    document.getElementById("shop-menu");

  if (!menuElement) {
    return;
  }

  document
    .getElementById("shop-menu-close")
    ?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeShopMenu();
    });

  // Клик по тёмному фону вокруг окна закрывает магазин
  menuElement.addEventListener("click", (event) => {
    if (event.target === menuElement) {
      closeShopMenu();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) {
      closeShopMenu();
    }
  });
}

export function openShopMenu() {
  if (!menuElement) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("museum-sound", { detail: { type: "click" } })
  );

  menuOpen = true;
  menuElement.classList.add("visible");
  menuElement.setAttribute("aria-hidden", "false");
  document.body.style.cursor = "default";

  if (document.pointerLockElement) {
    document.exitPointerLock?.();
  }
}

export function closeShopMenu() {
  if (!menuElement) {
    return;
  }

  menuOpen = false;
  menuElement.classList.remove("visible");
  menuElement.setAttribute("aria-hidden", "true");
}

export function isShopMenuOpen() {
  return menuOpen;
}
