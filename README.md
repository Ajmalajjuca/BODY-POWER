# Body Power Nutrition

A browser-local supplement storefront built with React, TypeScript and Vite.

## Local use

Run `npm install`, then `npm run dev` and open the URL printed by Vite.

## Page versions

Every page in the main nav comes in three versions, each with its own layout and colours: **V1 Classic** (light, burgundy), **V2 Editorial** (ivory, deep wine, gold) and **V3 Performance Dark** (black and red). Hover or tap a nav item and pick a version from its dropdown. The choice is remembered per page in this browser, so Home can be V1 while Shop is V2 and Cart is V3. The header, footer and bag drawer follow the colours of the page you are on.

Add `?v=2` (or `1`, `3`) to any page link to open and remember that version, for example `/shop?v=3`.

The catalog holds 25 real products across 6 categories and 7 brands, captured from public retailer feeds with real prices, flavours, sizes, published ratings and locally hosted photos. The storefront presents them as its own; [SOURCES.md](SOURCES.md) records provenance and how to re-run `scripts/import-catalog.py`. Combo savings use integer paise: two eligible units save 5%, three to eight save 10%. Standalone products stay separate. The bag supports up to 100 lines.

## Checks

Run `npm test`, `npm run lint` and `npm run build`. With the dev server at `http://localhost:5173` and Chrome installed at `/usr/bin/google-chrome`, run `node scripts/browser-check.mjs`. It checks eight routes at five widths, product images and cart workflows. `node scripts/versions-check.mjs --extra --nav --review` checks every page in all three versions at five widths, plus the version menus, `?v=` links, remembered choices, the cart flow in each version and contrast and layout regressions. Screenshots and report are saved to `/tmp/bpn-*`.

## Deployment and limitations

Build output is in `dist/`. Configure static hosting to serve `index.html` for application routes. `npm run preview` serves the production build locally.

This prototype has no backend, authentication, checkout, payments, email delivery or live Shopify integration. Checkout shows a coming-soon notice and the newsletter and contact forms send nothing. Prices and availability are a captured snapshot, and product photos and descriptions belong to their brands and source retailers: license or replace them before a public launch. The bag and each page's chosen version persist in this browser only.

The build reports a main JavaScript chunk above 500 KB. See [PLAN.md](PLAN.md) for architecture and Shopify handoff guidance.
