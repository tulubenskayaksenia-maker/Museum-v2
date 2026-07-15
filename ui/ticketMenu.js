let menuElement = null;
let ticketButton = null;
let menuOpen = false;

export function setupTicketMenu() {
  menuElement =
    document.querySelector(
      "#ticket-menu"
    );

  ticketButton =
    document.querySelector(
      "#ticket-menu-button"
    );

  const closeButton =
    document.querySelector(
      "#ticket-menu-close"
    );

  if (!menuElement) {
    console.error(
      "Ticket menu HTML was not found"
    );

    return;
  }

  closeButton?.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();
      closeTicketMenu();
    }
  );

  ticketButton?.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();
      reserveTicket();
    }
  );

  menuElement.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();

      if (
        event.target === menuElement
      ) {
        closeTicketMenu();
      }
    }
  );

  const ticketWindow =
    menuElement.querySelector(
      ".ticket-window"
    );

  ticketWindow?.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();
    }
  );

  window.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape" &&
        menuOpen
      ) {
        closeTicketMenu();
      }
    }
  );
}

export function openTicketMenu() {
  if (!menuElement) {
    return;
  }

  menuOpen = true;

  menuElement.classList.add(
    "visible"
  );

  document.body.style.cursor =
    "default";
}

export function closeTicketMenu() {
  if (!menuElement) {
    return;
  }

  menuOpen = false;

  menuElement.classList.remove(
    "visible"
  );
}

export function isTicketMenuOpen() {
  return menuOpen;
}

function reserveTicket() {
  if (!ticketButton) {
    return;
  }

  ticketButton.textContent =
    "TICKET RESERVED";

  ticketButton.classList.add(
    "reserved"
  );

  window.setTimeout(() => {
    closeTicketMenu();

    ticketButton.textContent =
      "GET TICKET";

    ticketButton.classList.remove(
      "reserved"
    );
  }, 1000);
}