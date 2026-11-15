import {
  OPENING_TIME,
  OPENING_LABEL,
  INVITE_ENDPOINT,
  PREVIEW_KEY
} from "../config/opening.js?v=20928d0";

const PREVIEW_STORAGE_KEY =
  "incognito-preview";

const GUEST_STORAGE_KEY =
  "incognito-guest";

function readGuest() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function saveGuest(guest) {
  try {
    const previous = readGuest() || {};
    localStorage.setItem(
      GUEST_STORAGE_KEY,
      JSON.stringify({ ...previous, ...guest })
    );
  } catch {
    // приватный режим — просто не запоминаем
  }
}

function forgetGuest() {
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch {
    // ничего
  }
}

function readPreviewAccess() {
  const params =
    new URLSearchParams(location.search);

  const preview =
    params.get("preview");

  try {
    if (preview === PREVIEW_KEY) {
      localStorage.setItem(PREVIEW_STORAGE_KEY, "1");
    } else if (preview === "off") {
      localStorage.removeItem(PREVIEW_STORAGE_KEY);
    }

    return localStorage.getItem(PREVIEW_STORAGE_KEY) === "1";
  } catch {
    return preview === PREVIEW_KEY;
  }
}

// true — музей ещё закрыт для этого посетителя
export function isMuseumLocked() {
  if (Date.now() >= OPENING_TIME.getTime()) {
    return false;
  }

  return !readPreviewAccess();
}

function formatLocalOpening() {
  const local =
    OPENING_TIME.toLocaleString(undefined, {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit"
    });

  const israel =
    OPENING_TIME.toLocaleString(undefined, {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jerusalem"
    });

  return local === israel ? "" : local;
}

function formatCountdown() {
  const ms =
    OPENING_TIME.getTime() - Date.now();

  if (ms <= 0) {
    return "";
  }

  const minutes = Math.floor(ms / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  const plural = (n, word) =>
    `${n} ${word}${n === 1 ? "" : "s"}`;

  if (days > 0) {
    return `Opens in ${plural(days, "day")} ${plural(hours, "hour")}`;
  }

  if (hours > 0) {
    return `Opens in ${plural(hours, "hour")} ${plural(mins, "minute")}`;
  }

  return `Opens in ${plural(Math.max(mins, 1), "minute")}`;
}

export function setupInvite() {
  const root =
    document.getElementById("museum-invite");

  if (!root) {
    return;
  }

  const form =
    root.querySelector("form");

  const status =
    root.querySelector(".museum-invite-status");

  const submit =
    root.querySelector("button[type=submit]");

  const countdown =
    root.querySelector(".museum-invite-countdown");

  const localTime =
    root.querySelector(".museum-invite-local");

  const title =
    root.querySelector("#museum-invite-title");

  const cta =
    root.querySelector(".museum-invite-cta");

  const registered =
    root.querySelector(".museum-invite-registered");

  const registeredText =
    root.querySelector(".museum-invite-registered-text");

  const againButton =
    root.querySelector(".museum-invite-again");

  root.querySelector(".museum-invite-date").textContent =
    OPENING_LABEL;

  // Состояние «вы уже в списке гостей»
  function showRegistered(guest, justSent = false) {
    const name =
      guest?.name ? `, ${guest.name}` : "";


    title.textContent =
      "See you on the 23rd";

    registeredText.textContent =
      `You're on the guest list${name}. ` +
      (guest?.ticket
        ? `Your ticket ${guest.ticket} is in your email. `
        : justSent
          ? "Your ticket is on its way to your email. "
          : "We sent your ticket by email. ") +
      "The museum opens on 23 November at 19:00 Israel time. " +
      "Come back to this page then, the door will be open.";

    cta.hidden = true;
    form.hidden = true;
    status.textContent = "";
    status.dataset.state = "";
    registered.hidden = false;
  }

  function showSignup() {
    title.textContent =
      "You're early";

    cta.hidden = false;
    form.hidden = false;
    form.reset();
    submit.disabled = false;
    submit.textContent = "GET AN INVITATION";
    status.textContent = "";
    status.dataset.state = "";
    registered.hidden = true;
  }

  againButton.addEventListener("click", () => {
    forgetGuest();
    showSignup();
  });

  // Пришли по ссылке из письма: ?ticket=IM-0007
  const ticketFromLink =
    new URLSearchParams(location.search).get("ticket");

  if (ticketFromLink && /^IM-[A-Z0-9]{1,8}$/i.test(ticketFromLink)) {
    saveGuest({ ticket: ticketFromLink.toUpperCase() });
  }

  const knownGuest =
    readGuest();

  if (knownGuest) {
    showRegistered(knownGuest);
  }

  const local =
    formatLocalOpening();

  if (local) {
    localTime.textContent =
      `That's ${local} where you are.`;
  }

  function tick() {
    if (Date.now() >= OPENING_TIME.getTime()) {
      // Время пришло — перезагружаем, музей откроется сам
      location.reload();
      return;
    }

    countdown.textContent =
      formatCountdown();
  }

  tick();
  setInterval(tick, 30000);

  document.body.classList.add("museum-locked");
  root.classList.add("visible");
  root.setAttribute("aria-hidden", "false");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data =
      new FormData(form);

    const email =
      String(data.get("email") || "").trim();

    // Поле-ловушка для ботов: люди его не видят
    if (data.get("website")) {
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent =
        "Please check the email address.";
      status.dataset.state = "error";
      return;
    }

    if (!INVITE_ENDPOINT) {
      status.textContent =
        "Invitations aren't open yet. Please try again a bit later.";
      status.dataset.state = "error";
      return;
    }

    submit.disabled = true;
    submit.textContent = "SENDING…";
    status.textContent = "";
    status.dataset.state = "";

    try {
      // Google Apps Script не отдаёт CORS-заголовки,
      // поэтому ответ не читаем: no-cors просто доставляет запрос.
      await fetch(INVITE_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({
          name: String(data.get("name") || "").trim(),
          email,
          timezone:
            Intl.DateTimeFormat().resolvedOptions().timeZone || ""
        })
      });

      const name =
        String(data.get("name") || "").trim();

      saveGuest({ name, email });
      showRegistered({ name }, true);

      status.dataset.state = "done";
      status.textContent =
        `We sent it to ${email}. Usually it arrives within a minute, ` +
        "on busy days it can take a few hours. " +
        "If you can't find it, look in the spam folder.";
    } catch {
      submit.disabled = false;
      submit.textContent = "GET AN INVITATION";
      status.dataset.state = "error";
      status.textContent =
        "Something went wrong. Check your connection and try again.";
    }
  });
}
