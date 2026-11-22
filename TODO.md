# Indy's website: to-do list

Tick these off as you go. Anything marked 💬 means: send it to Claude and it'll handle the code.

## Files to make 🎨
- [ ] **Logo.** Redraw "INDY's" on plain white paper with a dark marker, then photograph it straight-on in good light (no shadows). 💬
- [ ] **Hero art from Procreate.** Export the pint drawing and the "ONE FLAVOR. TEN PINTS. EVERY MONTH." lettering as separate transparent PNGs, at least 2× the size you drew them. The site uses copies cut from your mockup screenshot for now. 💬
- [ ] **Cone drawing.** Same thing: the original or a fresh one, on white paper. 💬
- [ ] **Photo of little Indy.** The original photo file, as big as you have it. 💬
- [ ] **Extra doodles (optional but fun).** Sprinkles, scoops, a spoon, a pint, arrows, stars, your handwriting saying things like "no repeats!". Anything drawn on white paper. These get scattered around the site. 💬

## Font
- [x] Indy's own handwriting is now a font ("Indy Hand", in `assets/fonts/`)
- [ ] **Optional:** draw 0–9 and `, ! ? ' & -` the same way so the font covers numbers and punctuation (right now those fall back to a look-alike) 💬

## Accounts to set up
- [ ] **Google Sheet for sign-ups** (~5 min). Follow [`google-sheets/README.md`](google-sheets/README.md), then send the web-app URL 💬
- [ ] **An email address for the business**, e.g. a new Gmail like indysicecream@gmail.com. Send it 💬 (it goes on the contact form)
- [ ] **Instagram.** Grab the handle (ideally the same name everywhere), then send it 💬 and it goes in the footer
- [ ] **Hotplate.** When you're ready to take orders, make your storefront and send the link 💬. Until then, people just join the list.

## Getting it online
- [ ] **Pick and buy a domain.** Check that it's free on Instagram too. Ideas: indysicecream.com, indys.cream, eatindys.com, indyscream.com. (~$12–20/year from Cloudflare, Porkbun or Namecheap.)
- [ ] **Publish the site.** Free on GitHub Pages or Netlify; steps are in the main README. Ask Claude to walk you through it 💬
- [ ] **Connect the domain** to the host 💬

## Before the first drop
- [ ] Decide drop #001's flavor (it can stay "top secret" on the site until you reveal it)
- [ ] Decide the pickup day/time and the general spot (keep exact addresses out of the website; send them by email to buyers only)
- [ ] Update the drop in `script.js` (or ask Claude 💬): flavor, date, then `status: "live"` on drop day
- [ ] Send your first "flavor reveal" email to the list (copy emails from the Sheet into BCC)

## Every month
- [ ] Mark last month's drop `sold-out` with its flavor name + a one-line description → it moves to the Archive
- [ ] Add the new drop, keep it secret or reveal it
- [ ] Count pints down as they're claimed (`pintsLeft`)
