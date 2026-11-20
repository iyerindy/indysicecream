# Indy's — small batch ice cream

One flavor. Ten pints. Every month. No repeats.

This is a plain static site (HTML + CSS + a little JS). No build step: open `index.html` in a browser to preview it.

## Each month

Everything that changes month to month lives at the top of **`script.js`**, in the `DROPS` list.

1. Mark last month's drop as gone: set `status: "sold-out"` and fill in its `flavor` and `description`. It moves into the Archive.
2. Add the new drop to the bottom of the list:
   ```js
   { number: 2, flavor: null, description: "", when: "Pickup Sat Jan 9", status: "upcoming", pintsLeft: 10 },
   ```
   Leave `flavor: null` to keep it secret ("top secret 🤫"), or fill it in to reveal it.
3. When pints go on sale, set `status: "live"`. Lower `pintsLeft` as they're claimed. The ten little pints on the ticket gray out as they go, and the top bar and headline update by themselves.

## Email list + contact form

Also at the top of `script.js`, in `SITE`:

- `CONTACT_EMAIL`: your real email. **Change this before launching.**
- `LIST_ENDPOINT` / `CONTACT_ENDPOINT`: a form URL from a service like [Formspree](https://formspree.io), Basin or Getform (free tiers are fine for this size). Sign-ups and messages then land in that service and get emailed to you.

If an endpoint is left blank, that form opens the visitor's email app addressed to `CONTACT_EMAIL` instead.

## Publishing

It works on any static host. Two easy options:
- **GitHub Pages:** repo Settings → Pages → deploy from branch → `main` / root.
- **Netlify / Cloudflare Pages:** connect the repo; no build command; publish directory `/`.

## Files

```
index.html          the page
styles.css          all the styling (colors are at the top under :root)
script.js           settings + monthly drops
assets/img/         logo, cone drawing and Indy's photo (cut out from the original sketch)
```
