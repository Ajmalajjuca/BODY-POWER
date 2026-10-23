# Purchase experience refinement

## Approved direction

Keep the existing storefront composition, imagery, palette and design presets. Improve buying clarity through stronger prices, readable product metadata and explicit purchase actions. This remains a frontend prototype: no payment, authentication, shipping collection or order submission.

## Interaction design

- Cards: primary Buy Now and secondary Add to Cart, both visible and at least 44px high. The secondary action includes the existing plus icon with a text label.
- Add to Cart: add the displayed available variant, stay on the current page and announce success. The header cart remains available for review.
- Buy Now: for multi-variant cards, show a labelled variant picker before continuing. Single-variant cards proceed immediately. Product pages use the currently selected variant and quantity.
- Direct purchase opens `/checkout?product=…&variant=…&quantity=…`. Resolve IDs and prices from fixtures, reject unavailable/invalid selections, and preserve the existing cart untouched. URL parameters make refresh reliable without storing duplicate totals.
- Purchase summary: show product, variant, editable quantity, price and total. Add more items transfers the direct selection to the existing cart exactly once, then opens the catalog. Explicitly disclose that no payment or order is submitted.
- Cart popup/page: Proceed to checkout opens `/checkout`, showing existing grouped cart items with recalculated discounts. Keep quantity/remove controls and an Add more items link.
- Typography: strengthen titles, prices, subtotal/total and action labels; increase size/variant text. Stack card actions on mobile and compact cards to avoid crowding.

## Architecture and files

- `src/domain/purchase.ts`: pure URL construction and validated selection resolution, using existing pricing validation.
- `src/components/PurchaseActions.tsx`: reusable card purchase controls and accessible variant dialog.
- `src/pages/Checkout.tsx`: cart or direct-item summary, no server calls.
- Existing `ProductCard`, `Product`, `Cart`, `App`, and `state/store`: integrate actions and routing; retain combo quick-add drawer behavior.
- `src/index.css`: scoped typography/action rules, no global redesign.

## Implementation and verification

- [x] Write regression tests for direct purchase URL parsing, invalid IDs/availability/quantities, and cart-independent selection.
- [x] Implement shared actions, summary route and cart navigation.
- [x] Apply targeted hierarchy and mobile action styles.
- [x] Run unit suite, strict TypeScript/build and lint.
- [x] Browser-check card Buy Now, variant choice, cart-preserving direct purchase, quantity updates, Add more items, cart checkout, invalid states and responsive widths.

## Verification results

- `npm test`: 18 tests passed across 4 files.
- `npm run build`: strict TypeScript and production build passed.
- `npm run lint` and `git diff --check`: passed.
- `DEMO_URL=http://localhost:5174 node scripts/purchase-check.mjs`: passed. Confirmed non-interrupting Add to Cart, isolated direct purchase, quantity persistence after refresh, transfer to cart, popup-to-summary navigation, invalid selections, no browser exceptions, no horizontal overflow at 360/390/768/1440px, and purchase buttons at least 44px high.
- Local preview: http://localhost:5174. No deployment, commit or push performed.

## Handoff

## Card refinement after client screenshot

Implemented consistent two-line title and variant slots, reserved review space (empty when unrated), and a bottom-anchored price row. Discounts now sit beside the price as quiet badges. Desktop purchase controls share a single row; narrower cards use a primary Buy now button with a lighter Add to cart action. Existing cart items show a check icon and Add another feedback without disabling further purchases. Long titles retain their full accessible text and product-detail link.

Verification: all 18 tests, production build and lint pass. `scripts/card-layout-check.mjs` measured every catalog row at 360, 390, 768 and 1440px: price/action coordinates aligned within 2px and no horizontal overflow. Existing end-to-end purchase checks passed, including 44px minimum button heights and cart isolation.

Shopify replaces the demo summary with platform checkout. Add to Cart maps to Ajax Cart. Direct purchase needs an explicit policy for existing-cart handling; this prototype isolates that selection. No client approval is inferred. Existing uncommitted package-lock changes are preserved.
