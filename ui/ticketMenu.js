let menuElement = null;
let ticketButton = null;
let menuOpen = false;

/*
  Билет хранится только в памяти страницы.

  После обновления сайта состояние сбрасывается,
  поэтому посетителю снова нужно получить билет.
*/

let ticketReserved = false;

// =====================================================
// SETUP
// =====================================================

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
      event.preventDefault();
      event.stopPropagation();

      closeTicketMenu();
    }
  );

  ticketButton?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
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

  updateTicketButton();
}

// =====================================================
// OPEN / CLOSE
// =====================================================

export function openTicketMenu() {
  if (!menuElement) {
    return;
  }

  menuOpen = true;

  updateTicketButton();

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

// =====================================================
// TICKET STATE
// =====================================================

export function hasTicket() {
  return ticketReserved;
}

export function clearTicket() {
  ticketReserved = false;

  updateTicketButton();

  window.dispatchEvent(
    new CustomEvent(
      "museum-ticket-cleared"
    )
  );
}

// =====================================================
// FREE TICKET
// =====================================================

function reserveTicket() {
  if (!ticketButton) {
    return;
  }

  if (hasTicket()) {
    closeTicketMenu();
    return;
  }

  ticketReserved = true;

  updateTicketButton();

  window.dispatchEvent(
    new CustomEvent(
      "museum-ticket-reserved"
    )
  );

  window.setTimeout(() => {
    closeTicketMenu();
  }, 650);
}

// =====================================================
// BUTTON
// =====================================================

function updateTicketButton() {
  if (!ticketButton) {
    return;
  }

  if (hasTicket()) {
    ticketButton.textContent =
      "TICKET RECEIVED";

    ticketButton.classList.add(
      "reserved"
    );

    return;
  }

  ticketButton.textContent =
    "GET FREE TICKET";

  ticketButton.classList.remove(
    "reserved"
  );
}