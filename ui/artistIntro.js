// =====================================================
// UNIVERSAL ARTIST INTRO
// ui/artistIntro.js
// =====================================================

let artistIntroRoot = null;
let artistIntroResolve = null;
let artistIntroIsOpen = false;

// =====================================================
// ARTIST DATA
// =====================================================

const ARTIST_INTROS = {
  room01: {
    roomLabel: "ROOM 01",
    year: "2026",

    eyebrow: "ABOUT THE ARTIST",

    firstName: "NADIA",
    lastName: "DZYURA",

    paragraphs: [
      `Nadia Dzyura is a contemporary artist born on
      19 April 2005 in Moscow, Russia. She is currently
      studying Visual Communication at Bezalel Academy
      of Arts and Design in Jerusalem, Israel.`,

      `Her practice spans painting, animation,
      illustration, sculpture, and mixed media.
      Combining traditional craftsmanship with digital
      techniques, she creates concept-driven works
      that explore visual storytelling, materiality,
      and experimentation.`
    ],

    socialLabel: "INSTAGRAM",
    socialText: "@nadiadzyura",
    socialUrl: "https://www.instagram.com/nadiadzyura/"
  },

room02: {
    roomLabel: "ROOM 02",
    year: "2026",

    eyebrow: "ABOUT THE ARTIST",

    firstName: "VICTORIA",
    lastName: "SERDYUKOVSKAYA",

    paragraphs: [
      `Victoria Serdyukovskaya is a multidisciplinary artist born in 2001 in Yaroslavl, Russia, currently pursuing her studies at the Bezalel Academy of Arts and Design in Jerusalem, in the Screen Based Arts department, specializing in Video.`,

      `Her artistic practice spans documentary filmmaking, video art, and photography. Through documentary narratives and nostalgic images of her hometown, she explores themes of human psychology, memory, identity, and cultural codes.`,

      `Her work reflects an interest in the relationship between personal and collective memory, using intimate stories and everyday observations to examine how identity is shaped by place, history, and lived experience.`
    ],

    socialLabel: "INSTAGRAM",
    socialText: "@_victorias_ooqw",
    socialUrl: "https://www.instagram.com/_victorias_ooqw/"
  },

  room03: {
    roomLabel: "ROOM 03",
    year: "2026",

    eyebrow: "ABOUT THE ARTIST",

    firstName: "KSENIA",
    lastName: "TULUBENSKAYA",

    paragraphs: [
      `Ksenia Tulubenskaya is a multidisciplinary artist born in Moscow, Russia, currently studying at the Bezalel Academy of Arts and Design in Jerusalem in the Screen Based Arts department, specializing in Video.`,

      `Her practice explores themes of memory, identity, displacement, and human relationships through filmmaking, photography, and video art. Combining observational narratives with carefully constructed visual language, she creates works that examine personal experience, emotional vulnerability, and the ways people search for connection and belonging.`
    ],

    socialLabel: "INSTAGRAM",
    socialText: "@ktuluben",
    socialUrl: "https://www.instagram.com/ktuluben/"
  },


  room04: {
  roomLabel: "ROOM 04",
  year: "2026",

  eyebrow: "ABOUT THE ARTIST",

  firstName: "ASAF",
  lastName: "TAL",

  paragraphs: [
    `Asaf Tal is a video artist born in Tel Aviv, Israel, currently pursuing his studies at the Bezalel Academy of Arts and Design in Jerusalem, in the Screen Based Arts department, specializing in Video.`,

    `His artistic work explores themes such as the search for truth within a framed reality and simulacra. In his video "Him", he addresses the question "What makes us human?" by depicting the evolutionary process of the human species through the personal narrative of an ominous creature.`
  ],

  socialLabel: "INSTAGRAM",
  socialText: "@asaf___t",
  socialUrl: "https://www.instagram.com/asaf___t/"
  }
};

// =====================================================
// CREATE
// =====================================================

function createArtistIntro() {
  if (
    document.getElementById(
      "artist-intro"
    )
  ) {
    artistIntroRoot =
      document.getElementById(
        "artist-intro"
      );

    return;
  }

  artistIntroRoot =
    document.createElement("div");

  artistIntroRoot.id =
    "artist-intro";

  artistIntroRoot.className =
    "artist-intro";

  artistIntroRoot.hidden = true;

  artistIntroRoot.innerHTML = `
    <div
      class="artist-intro__backdrop"
      data-artist-intro-close
    ></div>

    <article
      class="artist-intro__panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="artist-intro-name"
    >
      <button
        id="artist-intro-close"
        class="artist-intro__close"
        type="button"
        aria-label="Close artist information"
      >
        ×
      </button>

      <header class="artist-intro__header">
        <span id="artist-intro-room">
          ROOM
        </span>

        <span id="artist-intro-year">
          2026
        </span>
      </header>

      <div class="artist-intro__divider"></div>

      <div class="artist-intro__content">

        <section class="artist-intro__identity">
          <p
            id="artist-intro-eyebrow"
            class="artist-intro__eyebrow"
          >
            ABOUT THE ARTIST
          </p>

          <h1
            id="artist-intro-name"
            class="artist-intro__name"
          >
            <span id="artist-intro-first-name">
              ARTIST
            </span>

            <span id="artist-intro-last-name">
              NAME
            </span>
          </h1>
        </section>

        <section class="artist-intro__information">
          <div
            id="artist-intro-biography"
            class="artist-intro__biography"
          ></div>

          <div
            id="artist-intro-social-block"
            class="artist-intro__social"
          >
            <p
              id="artist-intro-social-label"
              class="artist-intro__social-label"
            >
              INSTAGRAM
            </p>

            <a
              id="artist-intro-social-link"
              class="artist-intro__social-link"
              href="#"
              target="_blank"
              rel="noopener noreferrer"
            >
              @artist
            </a>
          </div>
        </section>

      </div>

      <button
        id="artist-intro-enter"
        class="artist-intro__enter"
        type="button"
      >
        <span>
          ENTER EXHIBITION
        </span>

        <span
          class="artist-intro__arrow"
          aria-hidden="true"
        >
          →
        </span>
      </button>
    </article>
  `;

  document.body.appendChild(
    artistIntroRoot
  );

  bindArtistIntroEvents();
}

// =====================================================
// EVENTS
// =====================================================

function bindArtistIntroEvents() {
  const closeButton =
    document.getElementById(
      "artist-intro-close"
    );

  const enterButton =
    document.getElementById(
      "artist-intro-enter"
    );

  closeButton?.addEventListener(
    "click",
    () => {
      closeArtistIntro(false);
    }
  );

  enterButton?.addEventListener(
    "click",
    () => {
      closeArtistIntro(true);
    }
  );

  artistIntroRoot?.addEventListener(
    "click",
    event => {
      const closeTarget =
        event.target.closest(
          "[data-artist-intro-close]"
        );

      if (closeTarget) {
        closeArtistIntro(false);
      }
    }
  );

  document.addEventListener(
    "keydown",
    event => {
      if (
        !artistIntroIsOpen ||
        event.key !== "Escape"
      ) {
        return;
      }

      event.preventDefault();
      closeArtistIntro(false);
    }
  );
}

// =====================================================
// OPEN
// =====================================================

export function openArtistIntro(
  roomName = "room01"
) {
  createArtistIntro();

  const artistData =
    ARTIST_INTROS[roomName] ??
    ARTIST_INTROS.room01;

  updateArtistIntro(
    artistData
  );

  artistIntroIsOpen = true;

  artistIntroRoot.hidden = false;

  requestAnimationFrame(() => {
    artistIntroRoot.classList.add(
      "is-visible"
    );
  });

  document.body.classList.add(
    "artist-intro-open"
  );

  lockMuseumInteraction();

  window.setTimeout(() => {
    document
      .getElementById(
        "artist-intro-enter"
      )
      ?.focus();
  }, 100);

  return new Promise(resolve => {
    artistIntroResolve = resolve;
  });
}

// =====================================================
// UPDATE CONTENT
// =====================================================

function updateArtistIntro(data) {
  setText(
    "artist-intro-room",
    data.roomLabel
  );

  setText(
    "artist-intro-year",
    data.year
  );

  setText(
    "artist-intro-eyebrow",
    data.eyebrow
  );

  setText(
    "artist-intro-first-name",
    data.firstName
  );

  setText(
    "artist-intro-last-name",
    data.lastName
  );

  const biography =
    document.getElementById(
      "artist-intro-biography"
    );

  if (biography) {
    biography.innerHTML =
      data.paragraphs
        .map(
          paragraph => `
            <p>
              ${escapeHtml(paragraph)}
            </p>
          `
        )
        .join("");
  }

  const socialBlock =
    document.getElementById(
      "artist-intro-social-block"
    );

  const socialLabel =
    document.getElementById(
      "artist-intro-social-label"
    );

  const socialLink =
    document.getElementById(
      "artist-intro-social-link"
    );

  if (
    socialBlock &&
    socialLabel &&
    socialLink &&
    data.socialText
  ) {
    socialBlock.hidden = false;

    socialLabel.textContent =
      data.socialLabel ||
      "INSTAGRAM";

    socialLink.textContent =
      data.socialText;

    if (data.socialUrl) {
      socialLink.href =
        data.socialUrl;

      socialLink.removeAttribute(
        "aria-disabled"
      );

      socialLink.classList.remove(
        "is-disabled"
      );
    } else {
      socialLink.removeAttribute(
        "href"
      );

      socialLink.setAttribute(
        "aria-disabled",
        "true"
      );

      socialLink.classList.add(
        "is-disabled"
      );
    }
  } else if (socialBlock) {
    socialBlock.hidden = true;
  }
}

// =====================================================
// CLOSE
// =====================================================

function closeArtistIntro(
  shouldEnter
) {
  if (
    !artistIntroRoot ||
    !artistIntroIsOpen
  ) {
    return;
  }

  artistIntroIsOpen = false;

  artistIntroRoot.classList.remove(
    "is-visible"
  );

  document.body.classList.remove(
    "artist-intro-open"
  );

  unlockMuseumInteraction();

  const resolve =
    artistIntroResolve;

  artistIntroResolve = null;

  window.setTimeout(() => {
    if (
      artistIntroRoot &&
      !artistIntroIsOpen
    ) {
      artistIntroRoot.hidden = true;
    }

    resolve?.(shouldEnter);
  }, 240);
}

// =====================================================
// PUBLIC STATE
// =====================================================

export function isArtistIntroOpen() {
  return artistIntroIsOpen;
}

// =====================================================
// HELPERS
// =====================================================

function setText(
  elementId,
  value
) {
  const element =
    document.getElementById(
      elementId
    );

  if (element) {
    element.textContent =
      value ?? "";
  }
}

function escapeHtml(value) {
  const element =
    document.createElement("div");

  element.textContent =
    value ?? "";

  return element.innerHTML;
}

// =====================================================
// MUSEUM LOCK
// =====================================================

function lockMuseumInteraction() {
  window.dispatchEvent(
    new CustomEvent(
      "museum-interaction-lock",
      {
        detail: {
          source:
            "artist-intro"
        }
      }
    )
  );
}

function unlockMuseumInteraction() {
  window.dispatchEvent(
    new CustomEvent(
      "museum-interaction-unlock",
      {
        detail: {
          source:
            "artist-intro"
        }
      }
    )
  );
}