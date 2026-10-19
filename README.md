# Body Power Nutrition

A browser-local supplement storefront and design studio built with React, TypeScript and Vite.

## Local use

Run `npm install`, then `npm run dev` and open the URL printed by Vite. Open **Design Studio** to change layouts, themes and sections. The Versions tab supports saved designs, comparison, JSON import/export, share links and a selection summary.

The catalog contains 58 imported SuppX bestsellers plus the original 40 illustrative products. The Bestsellers navigation link opens the imported collection, including source prices, descriptions, product ratings where published and 192 locally hosted images. See [SUPPX-IMPORT.md](SUPPX-IMPORT.md) for provenance, counts and verification. Combo savings use integer paise: two eligible units save 5%, three to eight save 10%. Standalone products stay separate. The bag supports up to 100 lines.

## Checks

Run `npm test`, `npm run lint` and `npm run build`. With the dev server at `http://localhost:5173` and Chrome installed at `/usr/bin/google-chrome`, run `node scripts/browser-check.mjs`. It checks seven routes at five widths, studio version persistence and cart workflows. Screenshots and report are saved to `/tmp/bpn-*`.

## Deployment and limitations

Build output is in `dist/`. Configure static hosting to serve `index.html` for application routes. `npm run preview` serves the production build locally.

This prototype has no backend, authentication, checkout, payments, email delivery or live Shopify integration. Imported SuppX prices and availability are captured snapshots; other prices and packaging are illustrative. Cart and designs persist in this browser only; export JSON for a portable copy. Selection summaries do not constitute client approval.

The build reports a main JavaScript chunk above 500 KB; Studio loads separately. See [PLAN.md](PLAN.md) for architecture and Shopify handoff guidance.
