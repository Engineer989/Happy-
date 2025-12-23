# Digital Poster — Simple Static Webpage

This repository contains a ready-to-run static webpage to sell a digital poster and accept payments via UPI (contact number: 7410514965).

Files added:
- `index.html` — main page with product, UPI section, contact form, visitor counters
- `styles.css` — styles
- `script.js` — client-side logic: visitor counts (localStorage), contact save, UPI link/QR, WhatsApp notify

How it works
- The page shows a UPI QR generated via Google Chart API which encodes a simple UPI deep link for `7410514965@upi`.
- The contact form fields are saved in the browser's `localStorage` (no server). After payment, click "I've Paid — Notify Seller" to open WhatsApp with a prefilled message to the contact number (assumes country code +91).
- Visitor counts are tracked per-browser using `localStorage` and `sessionStorage`. Daily and monthly counts shown reflect visits from this browser only.

Preview locally
1. Start a simple static server from the repo root (requires Python):

```bash
cd /workspaces/Happy-
python3 -m http.server 8000
```

2. Open http://localhost:8000 in your browser.

Notes & next steps
- This is a static front-end only. To collect contact submissions centrally or count global visitors, add a backend (e.g., a small Node/Flask endpoint) and update `script.js` to POST form data and increment global counters.
- The UPI VPA used here is `7410514965@upi` as a placeholder for the contact number; verify the real UPI ID before accepting payments.
# Happy-
Various types information are available.
