// =====================================================
// LOBBY BOARDS WINDOW: MAP + OPEN CALL
// ui/infoBoards.js
// =====================================================

import { boardImages } from "../objects/lobbyBoards.js";

import { updateReviewsBoard } from "../objects/reviewsBoard.js";

import {
  INVITE_ENDPOINT,
  CONTACT_EMAIL
} from "../config/opening.js";

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
  setupReviewForm();
  loadReviews();

  // Свежие отзывы при каждом входе в магазин, даже если сайт открыт давно
  window.addEventListener("museum-navigation-state", (event) => {
    if (event.detail?.room === "shop") {
      loadReviews();
    }
  });
}

export function openInfoBoard(kind) {
  if (!root) {
    return;
  }

  for (const panel of root.querySelectorAll(".info-board-panel")) {
    panel.hidden = panel.dataset.board !== kind;
  }

  if (kind === "reviews") {
    loadReviews();
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

// -----------------------------------------------------
// GUEST BOOK (shop): approved notes + form
// -----------------------------------------------------

let reviewsLoadedAt = 0;
let reviewsLoading = false;

async function loadReviews() {
  if (!INVITE_ENDPOINT || reviewsLoading) {
    return;
  }

  // не чаще раза в 20 секунд (сервер и так кэширует на минуту)
  if (Date.now() - reviewsLoadedAt < 20000) {
    return;
  }

  reviewsLoading = true;

  try {
    const response =
      await fetch(`${INVITE_ENDPOINT}?kind=reviews`, { cache: "no-store" });

    const data = await response.json();
    const reviews = Array.isArray(data?.reviews) ? data.reviews : [];

    reviewsLoadedAt = Date.now();
    updateReviewsBoard(reviews);
    renderReviewList(reviews);
  } catch {
    // Скрипт ещё старой версии или нет сети: доска остаётся «Be the first…»
  } finally {
    reviewsLoading = false;
  }
}

function renderReviewList(reviews) {
  const list = root?.querySelector(".review-list");

  if (!list) {
    return;
  }

  list.replaceChildren();

  for (const review of reviews) {
    const item = document.createElement("div");
    item.className = "review-item";

    const text = document.createElement("p");
    text.className = "review-text";
    text.textContent = `“${String(review.text || "")}”`;

    const name = document.createElement("div");
    name.className = "review-name";
    name.textContent = String(review.name || "A visitor");

    item.append(text, name);
    list.append(item);
  }
}

function setupReviewForm() {
  const form = root.querySelector(".review-form");
  const status = root.querySelector(".review-status");

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
    const text = String(data.get("text") || "").trim();

    if (text.length < 2) {
      status.dataset.state = "error";
      status.textContent = "Please write a few words.";
      return;
    }

    if (!INVITE_ENDPOINT) {
      status.dataset.state = "error";
      status.textContent = "The guest book isn't open yet. Please try again later.";
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
          kind: "review",
          name,
          text
        })
      });

      form.hidden = true;
      status.dataset.state = "done";
      status.textContent =
        "Thank you. Your note will appear on the wall after a quick check.";
    } catch {
      submit.disabled = false;
      submit.textContent = "LEAVE A NOTE";
      status.dataset.state = "error";
      status.textContent = "Something went wrong. Check your connection and try again.";
    }
  });
}
