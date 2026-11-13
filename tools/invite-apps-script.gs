/**
 * Incognito Museum: приглашения на открытие (Google Apps Script)
 *
 * Что делает:
 *  - принимает email с сайта (форма «Get an invitation»);
 *  - записывает гостя в Google-таблицу (лист «Guests»);
 *  - сразу отправляет ему письмо с билетом и файлом для календаря;
 *  - в день открытия рассылает всем напоминание (sendOpeningReminder).
 *
 * Письма уходят с твоего Gmail. Лимит Google: около 100 писем в день
 * для обычного аккаунта. Остаток видно в функции checkQuota.
 *
 * Как установить: см. инструкцию в чате или README рядом.
 */

// ---------- НАСТРОЙКИ ----------

const SITE_URL = "https://incogmusem.com";
const LOGO_URL = "https://incogmusem.com/assets/brand/logo-light.png";

const OPENING_START = new Date("2026-11-23T19:00:00+02:00");
const OPENING_END = new Date("2026-11-23T21:00:00+02:00");
const OPENING_DATE_TEXT = "Monday, 23 November 2026";
const OPENING_TIME_TEXT = "19:00 Israel time";

const SENDER_NAME = "Incognito Museum";
const SIGNATURE = "Ksenia, Incognito Museum";

const SHEET_NAME = "Guests";

// ---------- ПРИЁМ ЗАЯВОК С САЙТА ----------

function doPost(e) {
  const p = (e && e.parameter) || {};
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

    // Уже есть в списке — повторно билет не создаём, просто шлём ещё раз
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][2]).toLowerCase() === email) {
        sendTicket_(email, rows[i][1] || name, rows[i][3]);
        return reply_("resent");
      }
    }

    const ticket = "IM-" + String(rows.length).padStart(4, "0");
    sheet.appendRow([new Date(), name, email, ticket, timezone, ""]);
    sendTicket_(email, name, ticket);

    return reply_("ok");
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return reply_("Incognito Museum invitations are running.");
}

// ---------- ПИСЬМО С БИЛЕТОМ ----------

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

        // Билет
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" ' +
          'style="border:1px solid #3a3c42;background:#1b1d22;">' +
          '<tr><td style="padding:26px 26px 18px;">' +
            '<div style="font-size:10px;letter-spacing:3px;color:#8d8f95;">ADMIT ONE · OPENING NIGHT</div>' +
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
            '<a href="' + SITE_URL + '" style="display:inline-block;background:#f0eee8;color:#16171a;' +
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
    "Where: " + SITE_URL + "\n\n" +
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
    "URL:" + SITE_URL,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  return Utilities.newBlob(ics, "text/calendar", "incognito-museum-opening.ics");
}

// ---------- НАПОМИНАНИЕ В ДЕНЬ ОТКРЫТИЯ ----------

/**
 * Запусти ОДИН раз вручную: поставит автоматическую отправку
 * напоминания 23 ноября в 17:00 по Израилю (за 2 часа до открытия).
 */
function scheduleReminder() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === "sendOpeningReminder")
    .forEach((t) => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger("sendOpeningReminder")
    .timeBased()
    .at(new Date("2026-11-23T17:00:00+02:00"))
    .create();
}

function sendOpeningReminder() {
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    const email = rows[i][2];
    const name = rows[i][1];
    const alreadySent = rows[i][5];

    if (!email || alreadySent) {
      continue;
    }

    if (MailApp.getRemainingDailyQuota() < 1) {
      break; // лимит на сегодня кончился, остальные — при следующем запуске
    }

    const hello = name ? "Hi " + name + "," : "Hi,";

    MailApp.sendEmail({
      to: email,
      name: SENDER_NAME,
      subject: "Today at 19:00: Incognito Museum opens",
      body:
        hello + "\n\n" +
        "we open in two hours, at 19:00 Israel time.\n" +
        "Here is the link: " + SITE_URL + "\n\n" +
        "Your ticket number is " + rows[i][3] + ". You won't need to show it, " +
        "the door will simply be open.\n\n" +
        "See you inside,\n" + SIGNATURE
    });

    sheet.getRange(i + 1, 6).setValue(new Date());
  }
}

// ---------- СЛУЖЕБНОЕ ----------

function checkQuota() {
  Logger.log("Писем можно отправить сегодня: " + MailApp.getRemainingDailyQuota());
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
    sheet.appendRow(["Signed up", "Name", "Email", "Ticket", "Timezone", "Reminder sent"]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/** Запусти один раз, чтобы выдать разрешения и проверить письмо на себе. */
function testSendToMe() {
  const me = Session.getActiveUser().getEmail();
  getSheet_();
  sendTicket_(me, "Ksenia", "IM-TEST");
  Logger.log("Тестовый билет отправлен на " + me);
}

function escape_(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}

function reply_(message) {
  return ContentService.createTextOutput(message);
}
