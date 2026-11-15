// =====================================================
// ОТКРЫТИЕ МУЗЕЯ
// =====================================================

// Время открытия: 23 ноября 2026, 19:00 по Израилю (UTC+2).
// До этого момента посетители видят экран-приглашение,
// после — музей открывается всем автоматически.
export const OPENING_TIME =
  new Date("2026-11-23T19:00:00+02:00");

export const OPENING_LABEL =
  "23 November, 19:00 Israel time";

// Адрес Google Apps Script (Deploy → Web app → URL).
export const INVITE_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzyUF47M_ysErHUsg3a2LNgQBexehDRYZqeEYqRezrTtyfe2xzXJKem60iBMrITc-wkgw/exec";

// Доступ для себя до открытия:
// открой сайт один раз как incogmusem.com/?preview=incognito-2311
// — браузер запомнит, и приглашение больше не будет показываться.
// Чтобы снова увидеть экран приглашения: ?preview=off
export const PREVIEW_KEY =
  "incognito-2311";

// Почта для связи на афише (open call). Пусто — строка не показывается.
export const CONTACT_EMAIL =
  "";
