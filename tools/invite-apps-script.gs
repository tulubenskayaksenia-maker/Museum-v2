/**
 * Incognito Museum: invitations to the opening (Google Apps Script)
 *
 * What it does:
 *  - receives an email address from the site form ("Get an invitation");
 *  - writes the guest to the Google Sheet (sheet "Guests");
 *  - immediately sends a ticket email with a calendar file;
 *  - on opening day sends everyone a reminder (sendOpeningReminder);
 *  - keeps artist applications (sheet "Applications") and guest book
 *    notes (sheet "Reviews"). A note shows on the shop wall only after
 *    you tick its "Show" box.
 *
 * Emails go out from your Gmail. Google limit: about 100 emails a day
 * for a regular account. If the limit runs out, the guest waits in a queue
 * (empty "Ticket sent" column) and processQueue sends the remaining
 * tickets every hour once Google allows sending again.
 *
 * Run setupTriggers ONCE only if the triggers do not exist yet.
 */

// ---------- SETTINGS ----------

const SITE_URL = "https://incogmusem.com";

// Link from the email: the site recognises the guest and shows "you're on the guest list"
function guestLink_(ticket) {
  return SITE_URL + "/?ticket=" + encodeURIComponent(ticket || "");
}
const LOGO_URL = "https://incogmusem.com/assets/brand/logo-light.png";

const OPENING_START = new Date("2026-11-23T19:00:00+02:00");
const OPENING_END = new Date("2026-11-23T21:00:00+02:00");
const OPENING_DATE_TEXT = "Monday, 23 November 2026";
const OPENING_TIME_TEXT = "19:00 Israel time";

const SENDER_NAME = "Incognito Museum";
const SIGNATURE = "Ksenia, Incognito Museum";

const SHEET_NAME = "Guests";

// Discord invite for the optional conversation during the opening.
// If empty, the reminder is sent without the Discord lines.
const DISCORD_URL = "https://discord.gg/AKAwH93xq";
const DISCORD_LINE =
  "I'll also be on Discord at 20:00 for a small, " +
  "optional conversation: feedback, questions, anything about the museum.\n";


// Sheet columns (numbered from 1)
const COL_REMINDER = 6;   // F: Reminder sent
const COL_TICKET = 7;     // G: Ticket sent

// Reminder: 23.11 from 17:00 until the end of the day
const REMINDER_START = new Date("2026-11-23T17:00:00+02:00");
const REMINDER_STOP = new Date("2026-11-24T00:00:00+02:00");

// ---------- SIGN-UPS FROM THE SITE ----------

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Artist application from the open-call board
  if (p.kind === "application") {
    return handleApplication_(p);
  }

  // Note for the guest book in the shop
  if (p.kind === "review") {
    return handleReview_(p);
  }

  const email = String(p.email || "").trim().toLowerCase();
  const name = String(p.name || "").trim().slice(0, 80);
  const timezone = String(p.timezone || "").slice(0, 60);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
    return reply_("invalid");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const sheet = getSheet_();
    const rows = sheet.getDataRange().getValues();

    // Already on the list: do not create a new ticket
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][2]).toLowerCase() === email) {
        if (!rows[i][COL_TICKET - 1]) {
          return reply_("queued"); // ticket still queued, it will be sent automatically
        }
        if (MailApp.getRemainingDailyQuota() > 0) {
          trySendTicket_(sheet, i + 1, email, rows[i][1] || name, rows[i][3], true);
        }
        return reply_("resent");
      }
    }

    const ticket = "IM-" + String(rows.length).padStart(4, "0");
    sheet.appendRow([new Date(), name, email, ticket, timezone, "", ""]);
    trySendTicket_(sheet, sheet.getLastRow(), email, name, ticket, false);

    return reply_("ok");
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};

  // Approved guest book notes for the shop wall
  if (p.kind === "reviews") {
    return ContentService
      .createTextOutput(JSON.stringify({ reviews: getApprovedReviews_() }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return reply_("Incognito Museum invitations are running.");
}

// Sends the ticket if quota allows. Otherwise leaves it in the queue.
function trySendTicket_(sheet, rowNumber, email, name, ticket, isResend) {
  if (MailApp.getRemainingDailyQuota() < 1) {
    return false;
  }

  try {
    sendTicket_(email, name, ticket);
  } catch (err) {
    console.warn("Ticket not sent, left in queue: " + email + " " + err);
    return false;
  }

  if (!isResend) {
    sheet.getRange(rowNumber, COL_TICKET).setValue(new Date());
  }

  return true;
}

// ---------- QUEUE (runs every hour) ----------

function processQueue() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return;
  }

  try {
    const now = new Date();
    const reminderTime = now >= REMINDER_START && now < REMINDER_STOP;

    // On opening day: reminders first, then tickets
    if (reminderTime) {
      sendPendingReminders_();
    }

    // No tickets needed after the opening starts: the museum is open
    if (now < OPENING_START) {
      sendPendingTickets_();
    }
  } finally {
    lock.releaseLock();
  }
}

function sendPendingTickets_() {
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (!rows[i][2] || rows[i][COL_TICKET - 1]) {
      continue;
    }

    if (!trySendTicket_(sheet, i + 1, rows[i][2], rows[i][1], rows[i][3], false)) {
      if (MailApp.getRemainingDailyQuota() < 1) {
        break; // quota used up, continue next hour
      }
    }
  }
}

/** How many guests are waiting for a ticket and how many emails can still be sent today. */
function checkQueue() {
  const rows = getSheet_().getDataRange().getValues().slice(1);
  const waiting = rows.filter((r) => r[2] && !r[COL_TICKET - 1]).length;
  Logger.log("Guests total: " + rows.length);
  Logger.log("Waiting for a ticket: " + waiting);
  Logger.log("Emails left today: " + MailApp.getRemainingDailyQuota());
}

// ---------- TICKET EMAIL ----------

function sendTicket_(email, name, ticket) {
  const hello = name ? "Hi " + escape_(name) + "," : "Hi,";
  const guest = name ? escape_(name) : "Guest";

  const html =
    '<div style="background:#0d0e11;padding:32px 12px;font-family:Helvetica,Arial,sans-serif;">' +
      '<div style="max-width:520px;margin:0 auto;color:#e9e8e3;">' +

        '<img src="' + LOGO_URL + '" alt="Incognito Museum" width="120" ' +
          'style="display:block;margin:0 auto 28px;height:auto;">' +

        '<p style="font-size:15px;line-height:1.6;margin:0 0 14px;">' + hello + '</p>' +
        '<p style="font-size:15px;line-height:1.6;margin:0 0 28px;">' +
          'thank you for signing up. Here is your ticket to the opening of Incognito Museum.' +
        '</p>' +

        // Ticket
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" ' +
          'style="border:1px solid #3a3c42;background:#1b1d22;">' +
          '<tr><td style="padding:26px 26px 18px;">' +
            '<div style="font-size:10px;letter-spacing:3px;color:#8d8f95;">ADMIT ONE &middot; OPENING NIGHT</div>' +
            '<div style="font-family:Georgia,serif;font-size:34px;line-height:1.1;color:#f3f1eb;margin:12px 0 4px;">' +
              'Incognito Museum</div>' +
          '</td></tr>' +
          '<tr><td style="padding:0 26px 22px;">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#c9c8c3;">' +
              row_("DATE", OPENING_DATE_TEXT) +
              row_("TIME", OPENING_TIME_TEXT) +
              row_("GUEST", guest) +
              row_("TICKET", ticket) +
              row_("PRICE", "Free") +
            '</table>' +
          '</td></tr>' +
          '<tr><td style="border-top:1px dashed #3a3c42;padding:18px 26px;text-align:center;">' +
            '<a href="' + guestLink_(ticket) + '" style="display:inline-block;background:#f0eee8;color:#16171a;' +
              'text-decoration:none;font-size:11px;font-weight:bold;letter-spacing:3px;padding:14px 26px;">' +
              'INCOGMUSEM.COM</a>' +
          '</td></tr>' +
        '</table>' +

        '<p style="font-size:15px;line-height:1.6;margin:28px 0 14px;">' +
          'The museum opens online at 19:00. Go to incogmusem.com at that time and walk through ' +
          'the halls together with everyone else. A laptop or a phone is enough, there is nothing to install.' +
        '</p>' +
        '<p style="font-size:15px;line-height:1.6;margin:0 0 14px;">' +
          'The attached file adds the opening to your calendar. On the day I will send a short reminder.' +
        '</p>' +
        '<p style="font-size:15px;line-height:1.6;margin:0 0 28px;">See you there,<br>' + SIGNATURE + '</p>' +

        '<p style="font-size:11px;line-height:1.5;color:#6f7176;margin:0;">' +
          'You got this email because this address was entered on incogmusem.com. ' +
          'If it wasn\'t you, just ignore it.' +
        '</p>' +
      '</div>' +
    '</div>';

  const text =
    (name ? "Hi " + name + "," : "Hi,") + "\n\n" +
    "thank you for signing up. Here is your ticket to the opening of Incognito Museum.\n\n" +
    "Date: " + OPENING_DATE_TEXT + "\n" +
    "Time: " + OPENING_TIME_TEXT + "\n" +
    "Ticket: " + ticket + "\n" +
    "Where: " + guestLink_(ticket) + "\n\n" +
    "See you there,\n" + SIGNATURE;

  MailApp.sendEmail({
    to: email,
    name: SENDER_NAME,
    subject: "Your ticket: Incognito Museum opening, 23 November",
    body: text,
    htmlBody: html,
    attachments: [calendarFile_(ticket)]
  });
}

function row_(label, value) {
  return '<tr>' +
    '<td style="padding:7px 0;border-bottom:1px solid #2a2c31;font-size:10px;letter-spacing:2px;color:#8d8f95;width:90px;">' +
      label + '</td>' +
    '<td style="padding:7px 0;border-bottom:1px solid #2a2c31;color:#f3f1eb;">' + value + '</td>' +
  '</tr>';
}

function calendarFile_(ticket) {
  const stamp = (d) => Utilities.formatDate(d, "UTC", "yyyyMMdd'T'HHmmss'Z'");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Incognito Museum//Opening//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:opening-2026-" + ticket + "@incogmusem.com",
    "DTSTAMP:" + stamp(new Date()),
    "DTSTART:" + stamp(OPENING_START),
    "DTEND:" + stamp(OPENING_END),
    "SUMMARY:Incognito Museum opening",
    "DESCRIPTION:Ticket " + ticket + ". Open " + SITE_URL + " at 19:00 Israel time.",
    "LOCATION:" + SITE_URL,
    "URL:" + guestLink_(ticket),
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  return Utilities.newBlob(ics, "text/calendar", "incognito-museum-opening.ics");
}

// ---------- OPENING-DAY REMINDER ----------

/**
 * Run ONCE by hand, only if the triggers do not exist yet.
 * Sets up: ticket queue every hour + reminder on 23.11 at 17:00.
 */
function setupTriggers() {
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger("processQueue")
    .timeBased()
    .everyHours(1)
    .create();

  ScriptApp.newTrigger("sendOpeningReminder")
    .timeBased()
    .at(REMINDER_START)
    .create();

  getSheet_(); // also adds the "Ticket sent" column if missing
  Logger.log("Done: hourly queue and reminder on 23.11 at 17:00.");
}

// Old name kept so nothing breaks
function scheduleReminder() {
  setupTriggers();
}

function sendOpeningReminder() {
  sendPendingReminders_();
}

function sendPendingReminders_() {
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    const email = rows[i][2];
    const name = rows[i][1];

    if (!email || rows[i][COL_REMINDER - 1]) {
      continue;
    }

    if (MailApp.getRemainingDailyQuota() < 1) {
      break; // the rest next hour
    }

    const hello = name ? "Hi " + name + "," : "Hi,";

    try {
      MailApp.sendEmail({
        to: email,
        name: SENDER_NAME,
        subject: "Today at 19:00: Incognito Museum opens",
        body:
          hello + "\n\n" +
          "we open today at 19:00 Israel time.\n" +
          "Here is the link: " + guestLink_(rows[i][3]) + "\n\n" +
          "Your ticket number is " + rows[i][3] + ". You won't need to show it, " +
          "the door will simply be open.\n\n" +
          (DISCORD_URL ? DISCORD_LINE + DISCORD_URL + "\n\n" : "") +
          "See you inside,\n" + SIGNATURE
      });
    } catch (err) {
      console.warn("Reminder not sent: " + email + " " + err);
      continue;
    }

    sheet.getRange(i + 1, COL_REMINDER).setValue(new Date());
  }
}

// ---------- ARTIST APPLICATIONS (OPEN CALL) ----------

const APPLICATIONS_SHEET = "Applications";

function handleApplication_(p) {
  const name = String(p.name || "").trim().slice(0, 80);
  const email = String(p.email || "").trim().toLowerCase().slice(0, 120);
  const link = String(p.link || "").trim().slice(0, 300);
  const about = String(p.about || "").trim().slice(0, 1000);

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reply_("invalid");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const ss = getSheet_().getParent();
    let sheet = ss.getSheetByName(APPLICATIONS_SHEET);

    if (!sheet) {
      sheet = ss.insertSheet(APPLICATIONS_SHEET);
      sheet.appendRow(["Received", "Name", "Email", "Link", "About"]);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([new Date(), name, email, link, about]);
  } finally {
    lock.releaseLock();
  }

  // Email to you: new application
  if (MailApp.getRemainingDailyQuota() > 1) {
    try {
      MailApp.sendEmail({
        to: Session.getEffectiveUser().getEmail(),
        name: SENDER_NAME,
        replyTo: email,
        subject: "Open call: new application from " + name,
        body:
          "Name: " + name + "\n" +
          "Email: " + email + "\n" +
          "Link: " + (link || "-") + "\n\n" +
          (about || "(no description)") + "\n\n" +
          "Reply to this email to answer the artist."
      });

      // Confirmation to the artist
      MailApp.sendEmail({
        to: email,
        name: SENDER_NAME,
        subject: "We got your application",
        body:
          "Hi " + name + ",\n\n" +
          "thank you for applying to show your work at Incognito Museum. " +
          "We read every application and will write back to this address.\n\n" +
          SIGNATURE
      });
    } catch (err) {
      console.warn("Application mail failed: " + err);
    }
  }

  return reply_("ok");
}

// ---------- GUEST BOOK (NOTES ON THE SHOP WALL) ----------

const REVIEWS_SHEET = "Reviews";
const COL_REVIEW_SHOW = 4; // D: Show (tick to put the note on the wall)

function getReviewsSheet_() {
  const ss = getSheet_().getParent();
  let sheet = ss.getSheetByName(REVIEWS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(REVIEWS_SHEET);
    sheet.appendRow(["Received", "Name", "Note", "Show"]);
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(3, 420);
  }

  return sheet;
}

function handleReview_(p) {
  const name = String(p.name || "").trim().slice(0, 40);
  const text = String(p.text || "").trim().slice(0, 400);

  if (text.length < 2) {
    return reply_("invalid");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  let sheet;

  try {
    sheet = getReviewsSheet_();
    sheet.appendRow([new Date(), name, text, false]);
    sheet.getRange(sheet.getLastRow(), COL_REVIEW_SHOW).insertCheckboxes();
  } finally {
    lock.releaseLock();
  }

  // Email to you: a new note is waiting
  if (MailApp.getRemainingDailyQuota() > 1) {
    try {
      MailApp.sendEmail({
        to: Session.getEffectiveUser().getEmail(),
        name: SENDER_NAME,
        subject: "Guest book: new note" + (name ? " from " + name : ""),
        body:
          (name || "(no name)") + " wrote:\n\n" + text + "\n\n" +
          "To show it on the shop wall, tick \"Show\" in the Reviews tab:\n" +
          sheet.getParent().getUrl()
      });
    } catch (err) {
      console.warn("Review mail failed: " + err);
    }
  }

  return reply_("ok");
}

// Notes you ticked "Show" for, newest first
function getApprovedReviews_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("reviews");

  if (cached) {
    return JSON.parse(cached);
  }

  const ss = getSheet_().getParent();
  const sheet = ss.getSheetByName(REVIEWS_SHEET);
  let list = [];

  if (sheet && sheet.getLastRow() > 1) {
    list = sheet.getDataRange().getValues().slice(1)
      .filter((row) => row[COL_REVIEW_SHOW - 1] === true && String(row[2]).trim())
      .map((row) => ({
        name: String(row[1] || "").slice(0, 40),
        text: String(row[2]).slice(0, 400),
        date: row[0] instanceof Date ? row[0].toISOString() : ""
      }))
      .reverse()
      .slice(0, 40);
  }

  cache.put("reviews", JSON.stringify(list), 60);
  return list;
}

/** Run once if you want the Reviews tab to exist before the first note. */
function setupReviewsSheet() {
  getReviewsSheet_();
}

// ---------- HELPERS ----------

function checkQuota() {
  Logger.log("Emails left today: " + MailApp.getRemainingDailyQuota());
}

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty("SHEET_ID");
  let ss;

  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create("Incognito Museum: opening guests");
    props.setProperty("SHEET_ID", ss.getId());
  }

  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName(SHEET_NAME);
    sheet.appendRow(["Signed up", "Name", "Email", "Ticket", "Timezone", "Reminder sent", "Ticket sent"]);
    sheet.setFrozenRows(1);
  }

  // Sheet from the first version: add the "Ticket sent" column.
  // Everyone who signed up before that already got their ticket.
  if (sheet.getRange(1, COL_TICKET).getValue() !== "Ticket sent") {
    sheet.getRange(1, COL_TICKET).setValue("Ticket sent");
    const last = sheet.getLastRow();
    if (last > 1) {
      sheet.getRange(2, COL_TICKET, last - 1, 1).setValue("sent (v1)");
    }
  }

  return sheet;
}

/** Run once to grant permissions and test the email on yourself. */
function testSendToMe() {
  const me = Session.getActiveUser().getEmail();
  getSheet_();
  sendTicket_(me, "Ksenia", "IM-TEST");
  Logger.log("Test ticket sent to " + me);
}

function escape_(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}

function reply_(message) {
  return ContentService.createTextOutput(message);
}

/** Sends the opening-day reminder to yourself only, to check it. Does not touch the sheet. */
function testReminderToMe() {
  const me = Session.getActiveUser().getEmail();
  MailApp.sendEmail({
    to: me,
    name: SENDER_NAME,
    subject: "TEST: Today at 19:00: Incognito Museum opens",
    body:
      "Hi Ksenia,\n\n" +
      "we open today at 19:00 Israel time.\n" +
      "Here is the link: " + guestLink_("IM-TEST") + "\n\n" +
      "Your ticket number is IM-TEST. You won't need to show it, " +
      "the door will simply be open.\n\n" +
      (DISCORD_URL ? DISCORD_LINE + DISCORD_URL + "\n\n" : "") +
      "See you inside,\n" + SIGNATURE
  });
  Logger.log("Test reminder sent to " + me);
}
