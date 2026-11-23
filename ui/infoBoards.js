// =====================================================
// LOBBY BOARDS WINDOW: MAP + OPEN CALL
// ui/infoBoards.js
// =====================================================

import { boardImages } from "../objects/lobbyBoards.js?v=ff3bff6";

import {
  INVITE_ENDPOINT,
  CONTACT_EMAIL
} from "../config/opening.js?v=ff3bff6";

let root = null;
let open = false;

export function setupInfoBoards() {
  root = document.getElementById("info-board-menu");

  if (!root) {
    return;
  }

  document
    .getElementById("info-board-close")
    ?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeInfoBoard();
    });

  root.addEventListener("click", (event) => {
    if (event.target === root) {
      closeInfoBoard();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && open) {
      closeInfoBoard();
    }
  });

  const contact = root.querySelector(".open-call-contact");

  if (CONTACT_EMAIL && contact) {
    contact.hidden = false;
    contact.innerHTML =
      `Or write to us: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>`;
  }

  setupOpenCallForm();
}

export function openInfoBoard(kind) {
  if (!root) {
    return;
  }

  for (const panel of root.querySelectorAll(".info-board-panel")) {
    panel.hidden = panel.dataset.board !== kind;
  }

  if (kind === "map") {
    const img = root.querySelector(".info-board-map");

    if (img && !img.src && boardImages.map) {
      img.src = boardImages.map.toDataURL("image/png");
    }
  }

  window.dispatchEvent(
    new CustomEvent("museum-sound", { detail: { type: "click" } })
  );

  open = true;
  root.classList.add("visible");
  root.setAttribute("aria-hidden", "false");
  document.body.style.cursor = "default";

  if (document.pointerLockElement) {
    document.exitPointerLock?.();
  }
}

export function closeInfoBoard() {
  if (!root) {
    return;
  }

  open = false;
  root.classList.remove("visible");
  root.setAttribute("aria-hidden", "true");
}

export function isInfoBoardOpen() {
  return open;
}

function setupOpenCallForm() {
  const form = root.querySelector(".open-call-form");
  const status = root.querySelector(".open-call-status");

  if (!form) {
    return;
  }

  const submit = form.querySelector("button[type=submit]");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(form);

    if (data.get("website")) {
      return; // бот
    }

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();

    if (!name) {
      status.dataset.state = "error";
      status.textContent = "Please add your name.";
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.dataset.state = "error";
      status.textContent = "Please check the email address.";
      return;
    }

    if (!INVITE_ENDPOINT) {
      status.dataset.state = "error";
      status.textContent = "Applications aren't open yet. Please try again later.";
      return;
    }

    submit.disabled = true;
    submit.textContent = "SENDING…";
    status.textContent = "";

    try {
      await fetch(INVITE_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({
          kind: "application",
          name,
          email,
          link: String(data.get("link") || "").trim(),
          about: String(data.get("about") || "").trim()
        })
      });

      form.hidden = true;
      status.dataset.state = "done";
      status.textContent =
        `Thank you, ${name}. We got your application and will write to ${email}.`;
    } catch {
      submit.disabled = false;
      submit.textContent = "SEND APPLICATION";
      status.dataset.state = "error";
      status.textContent = "Something went wrong. Check your connection and try again.";
    }
  });
}
