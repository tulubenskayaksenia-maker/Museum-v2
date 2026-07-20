let menuElement = null;
let ticketButton = null;
let menuOpen = false;
let ticketReserved = false;

export function setupTicketMenu() {
  menuElement = document.querySelector("#ticket-menu");
  ticketButton = document.querySelector("#ticket-menu-button");
  const closeButton = document.querySelector("#ticket-menu-close");

  if (!menuElement) {
    console.error("Ticket menu HTML was not found");
    return;
  }

  closeButton?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeTicketMenu();
  });

  ticketButton?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    reserveTicket();
  });

  menuElement.addEventListener("click", (event) => {
    if (event.target === menuElement) closeTicketMenu();
  });

  menuElement.querySelector(".ticket-window")?.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) closeTicketMenu();
  });

  updateTicketButton();
}

export function openTicketMenu() {
  if (!menuElement) return;
  menuOpen = true;
  updateTicketButton();
  menuElement.classList.add("visible");
  menuElement.setAttribute("aria-hidden", "false");
  document.body.style.cursor = "default";
}

export function closeTicketMenu() {
  if (!menuElement) return;
  menuOpen = false;
  menuElement.classList.remove("visible");
  menuElement.setAttribute("aria-hidden", "true");
}

export function isTicketMenuOpen() {
  return menuOpen;
}

export function hasTicket() {
  return ticketReserved;
}

export function clearTicket() {
  ticketReserved = false;
  updateTicketButton();
  window.dispatchEvent(new CustomEvent("museum-ticket-cleared"));
}

function reserveTicket() {
  if (!ticketButton) return;
  if (hasTicket()) {
    closeTicketMenu();
    return;
  }

  ticketReserved = true;
  updateTicketButton();
  window.dispatchEvent(new CustomEvent("museum-ticket-reserved"));
  window.setTimeout(closeTicketMenu, 650);
}

function updateTicketButton() {
  if (!ticketButton) return;

  if (hasTicket()) {
    ticketButton.textContent = "TICKET RECEIVED";
    ticketButton.classList.add("reserved");
  } else {
    ticketButton.textContent = "GET FREE TICKET";
    ticketButton.classList.remove("reserved");
  }
}