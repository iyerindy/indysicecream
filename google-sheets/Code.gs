/**
 * Indy's — saves website sign-ups and messages into this Google Sheet.
 * Paste this into Extensions → Apps Script of your sheet. Setup steps: README.md
 *
 *   "List" tab      ← email sign-ups (duplicates are skipped)
 *   "Messages" tab  ← contact form
 */

// Optional: get an email every time someone sends a message through the contact form.
const NOTIFY_EMAIL = ""; // e.g. "you@gmail.com"

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return ok_(); // spam bot filled the hidden field

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (p.form === "contact") {
      const sh = tab_(ss, "Messages", ["Date", "Name", "Email", "About", "Message"]);
      sh.appendRow([new Date(), clean_(p.name), clean_(p.email), clean_(p.topic), clean_(p.message)]);
      if (NOTIFY_EMAIL) {
        MailApp.sendEmail({
          to: NOTIFY_EMAIL,
          replyTo: String(p.email || ""),
          subject: "Indy's website: " + (p.topic || "message") + " from " + (p.name || "someone"),
          body: (p.message || "") + "\n\n— " + (p.name || "") + " (" + (p.email || "") + ")",
        });
      }
    } else {
      const email = String(p.email || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return ok_();
      const sh = tab_(ss, "List", ["Date", "Email"]);
      const existing = sh.getLastRow() > 1
        ? sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues().flat().map(String)
        : [];
      if (existing.indexOf(email) === -1) sh.appendRow([new Date(), clean_(email)]);
    }
  } finally {
    lock.releaseLock();
  }
  return ok_();
}

// Get (or create) a tab with a header row.
function tab_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
  return sh;
}

// Stop anyone from sneaking a spreadsheet formula in through the form.
function clean_(v) {
  const s = String(v == null ? "" : v).slice(0, 5000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function ok_() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
