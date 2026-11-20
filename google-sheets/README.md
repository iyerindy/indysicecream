# Sign-ups → Google Sheets (about 5 minutes, free)

1. Make a new Google Sheet, e.g. **"Indy's list"**.
2. In the sheet: **Extensions → Apps Script**. Delete what's there and paste in everything from `Code.gs`.
   - Optional: put your email in `NOTIFY_EMAIL` to get an email for each contact-form message.
3. Click **Deploy → New deployment**, then the gear icon → **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**, allow the permissions Google asks for (it's your own script), and copy the **Web app URL** (ends in `/exec`).
5. Paste that URL into `SHEET_URL` at the top of `script.js` on the website.

That's it. Sign-ups show up in a **List** tab and messages in a **Messages** tab. The tabs get created the first time someone submits.

**To email the list:** copy the Email column from the List tab into the BCC field of a normal email. When the list gets big, or once you're on Hotplate, you can import the same column into a newsletter tool.

**If you ever change `Code.gs`:** Deploy → Manage deployments → edit (pencil) → Version: *New version* → Deploy. The URL stays the same.
