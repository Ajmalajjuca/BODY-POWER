# Body Power Nutrition implementation plan

**Goal:** Build the client-facing, browser-local supplement marketplace and interactive design approval studio described in the supplied brief. No backend, payments, authentication, Shopify API, or claims of approval.

**Execution:** Native, phased implementation in the existing workspace, as requested. Preserve Vite/React/TypeScript tooling. Run checks after each major phase.

## Architecture and design direction

React + Vite, strict TypeScript, React Router, Zustand, Tailwind/CSS variables, dnd-kit and Motion. Light catalog surfaces, burgundy actions, large editorial type, locally rendered product pack illustrations, and contrasting campaign sections. Marketplace uses split campaign plus offer panels, Performance uses oversized dark campaign and larger category blocks, Minimal uses centered editorial composition and selective products. Existing starter artwork is unused but preserved.

Data and state are separate from presentation. Files: `src/data/catalog.ts` (40 products/brands/categories), `src/domain/pricing.ts` (integer-paise pricing), `src/design/config.ts` (schemas/presets), `src/state/store.ts` (cart/config/UI), `src/components/` (shared UI), `src/sections/` (registry/renderers), `src/pages/` (route content), `src/studio/` (editor), `src/index.css` (tokens/responsiveness).

## Routes and hierarchy

App → themed responsive preview → Header, route outlet, Footer; sibling Studio and cart dialog. Routes: `/`, `/shop`, `/collections/:handle`, `/brands`, `/brands/:handle`, `/products/:handle`, `/combos`, `/build-your-combo`, `/cart`, `/about`, `/contact`, `/faq`, catch-all 404. Scroll reset on pathname change; reduced-motion-aware entrance transitions. Header supports categories, search suggestions, mobile navigation and quantity badge.

## Models and state boundaries

Product: id, handle, title, brandId, categoryId, description, images, tags, basePrice, optional compareAtPrice, INR currency, featured, bestseller, variants. Variant: id, SKU, size, flavor, integer price, compareAtPrice, available. Four products per ten categories. Brand/category handles are stable. Images are original local SVG pack illustrations, explicitly representative.

CartLine stores product/variant IDs, quantity and optional combo group ID/name. Pricing resolves current fixture prices rather than trusting persisted totals. Combo rules: min 2/max 8 eligible units; 2 units 5%, 3+ 10%; integer rounding once per group. Invalid IDs, unavailable variants, fractional or out-of-range quantities are rejected. Group discounts recompute after edits. Standalone products never receive combo discounts.

DesignConfig v1 stores theme, semantic color overrides, font, density, radius, header variant, hero variant, card style, columns, layout, sections. Section instance has stable id, registered type, enabled, heading, subheading, scheme, custom background, width, spacing, columns, card style, alignment, mobile appearance, selection. Zod validation constrains enums, counts, colors, lengths and unique section IDs. No executable configuration. Zustand persists config, named versions and cart; ephemeral editor and drawer state stay separate. Config mutations have bounded undo/redo history; saved versions are deep snapshots.

## Theme and registry

Tokens: background, surface, text, muted, border, accent, accent-foreground, radius, spacing, heading-font. Themes: Burgundy Luxe, Midnight Burgundy, Burgundy & Ivory. Custom colors choose readable foregrounds. Container queries drive framed previews without another application instance.

Registry types: Hero, Announcement, Category Grid, Brand Grid, Featured Products, Bestsellers, Deals, Product Spotlight, Combo Promotion, Featured Combos, Fitness Goals, Trust Features, FAQ, Newsletter UI, Promotional Banner. Each entry provides defaults, settings schema and renderer. Common schema renders editing forms. Layouts are serializable presets with different content, order, hierarchy and CSS compositions.

## Implementation phases

- [ ] Phase 1: Install required dependencies; define fixtures, validated design config, pure pricing and persisted state. Write pricing/config tests first (discount boundaries, invalid quantities, unavailable products, corrupted imports, round-trip Unicode).
- [ ] Phase 2: Build storefront shell, three homepage compositions and section registry; original scalable product illustrations; reusable product cards; responsive navigation, search, themes.
- [ ] Phase 3: Complete catalog filters/sorting, collections/brands, product gallery/variants, cart drawer/page, ready combos, custom combo builder, informational pages and empty states.
- [ ] Phase 4: Build Studio: global settings, generic section editor, keyboard/pointer sortable list, add/duplicate/remove/reset, undo/redo, local versions, isolated comparison, validated import/export and compressed share URLs, responsive preview and read-only selection summary.
- [ ] Phase 5: TypeScript, lint, production build, pricing/schema tests and browser workflow/responsiveness checks. Correct discovered issues; document real limitations and deployment/handoff.

## Review focus and quality checklist

- Money: quantity changes crossing discount thresholds, unavailable variants, current price resolution, persistence and group isolation.
- Configuration: malformed/oversized JSON or URLs, duplicate IDs, Unicode, invalid colors/enums, constrained section count, isolated snapshots.
- Responsive: 360/390/768/1024/1440 widths, no horizontal overflow; editor narrow-screen usage; true container-based previews.
- Accessibility: labels, visible focus, keyboard sorting, modal focus management and Escape, contrast-safe color pairs, reduced motion.
- All CTAs navigate or perform explicit local actions; newsletter/contact forms explicitly demo-only and never claim delivery.
- No fabricated ratings, certifications, shipping guarantees or customer reviews. Demo catalog/price and representative artwork disclosures.
- Approval summary records design selection only; no fabricated approval status.

## Shopify handoff

Map registry sections to Liquid sections/schema, cards to snippets, routes to JSON templates, tokens to theme settings, product/variant fixtures to Shopify objects. Replace cart state with Ajax Cart API and search with predictive search/filter APIs. Bundle pricing needs a supported bundle/discount app or Shopify Functions; client-side discounts cannot determine checkout price. Studio history/comparison/export is React-only tooling, with approved settings transferred to the theme editor.

## Reference review

Browsed https://www.guardian.in/pages/crazy-deals, https://kapoormedicalhall.com/ and https://www.suppx.co.in/ for navigation and promotional patterns only. No reference content or product artwork copied.

## Progress and evidence

Implementation is present for all five phases. Resumed verification on 2026-10-19: Chrome checks pass across seven routes at 360/390/768/1024/1440 widths with no page errors or horizontal overflow. Studio preset/undo/redo, saved-version reload, cart add/reload/removal workflows pass. Fixed the Node persistence-test setup to provide window.localStorage. Independent review identified a mismatch between accepted and persisted cart line counts; additions now enforce the 100-line limit atomically, covered by a regression test observed failing before the fix. Browser checks now fail on page errors or overflow. README documents local use, deployment and limitations. Main JavaScript chunk remains above Vite's 500 KB warning threshold. Minor deferred review finding: section column inputs can submit fractional values that fail schema validation.
