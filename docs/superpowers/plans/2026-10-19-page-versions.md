# Page Versions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Design Studio with a theme-demo style navigation. Every page offers V1 / V2 / V3 from a nav dropdown, each version with its own layout and colours, and the choice is remembered per page.

**Architecture:** A persisted Zustand store maps each page key to a version (1–3). A `VersionFrame` applies that version's CSS variables and class to the page shell. The page is resolved from the route, and the cart drawer uses the Cart page's version. Each page component reads its version and renders a layout variant. Data and logic stay shared, and only the presentation branches. Every page root carries `data-layout="<page>-v<n>"`, which the browser matrix check asserts.

**Tech Stack:** React 19, TypeScript, Vite, Zustand (persist), React Router 7, Vitest, Playwright (Chrome at `/usr/bin/google-chrome`) for browser checks.

**Spec:** `docs/superpowers/specs/2026-10-19-page-versions-design.md`

## Global Constraints

- **Page keys, exactly:** `home`, `shop`, `product`, `brands`, `combos`, `build`, `cart`, `about`, `contact`, `faq`. Versions are `1 | 2 | 3`, and every key defaults to `1`.
- **localStorage key:** `bpn-page-versions-v1`.
- **Version names in the UI:** V1 "Classic", V2 "Editorial", V3 "Performance Dark".
- **V1 colours:** bg `#FAF7F5`, surface `#FFFFFF`, text `#242024`, muted `#71676B`, border `#E9E2E5`, accent `#800020`.
- **V2 colours:** bg `#F5F0E6`, surface `#FFFCF6`, text `#2B2220`, muted `#6E5F57`, border `#E1D8CB`, accent `#58181F`, decorative gold `#C9A96E`. Gold is never used for text.
- **V3 colours:** bg `#141014`, surface `#251D22`, text `#FFF9FB`, muted `#C6B7BF`, border `#49353E`, accent `#FF4D5E`, on-accent `#242024`.
- **Fonts (system stacks only, no new font dependencies):**
  - V2 headings: `Georgia, 'Times New Roman', serif`
  - V3 headings: `'Arial Narrow', 'Helvetica Neue', Arial, sans-serif`, weight 800, uppercase
- **Widths:** no horizontal overflow at 360, 390, 768, 1024 and 1440 px.
- **Copy:** real store copy only. No "demo", "prototype", "illustrative" or retailer names.
- **No new runtime dependencies.** Remove `@dnd-kit/*` and `lz-string`. Remove `zod` if no import remains.
- **Commits:** the owner has not asked for commits. Each task ends with a checkpoint (all checks green), not a commit, unless the owner says otherwise.

## Review Focus

1. **Stale or tampered storage:** a stored version of `4`, `"2"`, `null`, or a missing or extra page key falls back to V1 per page without crashing. Test in Task 2.
2. **Bad `?v=` values:** `?v=7`, `?v=abc` and `?v=` are ignored, the param is removed, and the page renders its remembered version. Test in Tasks 2 and 3.
3. **`?v=` mixed with other query params:** `/shop?q=whey&v=3` sets Shop V3 and keeps `q=whey`. Test in Task 3.
4. **Keyboard and touch use of the version dropdowns:**
   - Enter or Space opens the menu.
   - Arrow keys move between items.
   - Escape closes the menu and returns focus to the trigger.
   - A tap toggles the menu without navigating.
   - Test in Task 4.
5. **Empty and edge states in each version:** the empty bag, a missing product, and a collection with no matches render inside V2 and V3 layouts with readable colours. Tests in Tasks 7, 6 and 11.

---

## File map

| File                                                           | Responsibility                                                                                     |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/state/versions.ts` (new)                                  | Page keys, `Version` type, persisted store, `pageForPath`, `parseVersion`, `usePageVersion`        |
| `src/state/versions.test.ts` (new)                             | Store, parsing and route-mapping tests                                                             |
| `src/design/versions.ts` (new)                                 | `versionThemes` (names, swatches, CSS variables), `contrast()`                                     |
| `src/design/versions.test.ts` (new)                            | WCAG contrast tests per version                                                                    |
| `src/design/VersionFrame.tsx` (new, replaces `ThemeFrame.tsx`) | Applies a version's variables and the `version-<n>` class                                          |
| `src/components/VersionMenu.tsx` (new)                         | One nav dropdown: label link and V1–V3 items                                                       |
| `src/components/Header.tsx`                                    | New nav built from `VersionMenu`. Mega menu and `centered` prop removed.                           |
| `src/App.tsx`                                                  | Shell resolves the page, wraps it in `VersionFrame`, applies the `?v=` override. Studio removed.   |
| `src/sections/Home.tsx` + `src/design/config.ts`               | Home renders a fixed preset per version. Config machinery is trimmed to presets plus `foreground`. |
| `src/pages/*.tsx`                                              | Each page renders V1, V2 or V3 and sets `data-layout`                                              |
| `src/index.css`                                                | `.version-2` and `.version-3` rules, per-page variant layout rules, Studio CSS removed             |
| `scripts/versions-check.mjs` (new)                             | Browser matrix: pages × versions × widths, plus nav and persistence checks                         |
| `scripts/browser-check.mjs`, `README.md`                       | Studio steps removed                                                                               |

---

### Task 1: Remove the Design Studio

**Files:**

- **Delete:**
  - `src/studio/Studio.tsx`
  - `src/design/ThemeFrame.tsx` (temporarily replaced by the inline V1 frame described below)
- **Modify:**
  - `src/App.tsx`
  - `src/state/store.ts`: delete `useDesign` and `SavedVersion`. Trim `UIState` to `{ cart: boolean; toast: string; set }`.
  - `src/design/config.ts`: keep `sectionTypes`, `sectionNames`, `Section`, `DesignConfig` (now a plain TS interface), `makeSection`, `presets` and `foreground`. Delete the zod schemas, `themes`, `parseConfig`, `encodeConfig` and `decodeConfig`.
  - `src/sections/registry.ts`: keep `registry[type].renderer` and `.name`. Delete `commonFields` and `fields`.
  - `src/sections/Home.tsx`: takes `config: DesignConfig`.
  - `src/pages/Catalog.tsx`, `src/pages/Product.tsx`: replace `useDesign` reads with `columns = 4`, `card = 'detailed'` (constants for now; Task 6 and Task 7 vary them).
  - `src/components/Header.tsx`: drop the `centered` prop.
  - `src/index.css`: delete every `.studio-*`, `.with-studio`, `.preview-*`, `.viewport-label`, `.storefront-viewport`, `.presentation*` and `.header-centered` rule.
  - `package.json`: uninstall `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` and `lz-string`. Uninstall `zod` once no import remains.
  - `scripts/browser-check.mjs`: delete the Studio steps (open studio, presets, undo/redo, versions).
  - `README.md`: delete the Studio sentences.
- **Tests to update:**
  - `src/domain/pricing.test.ts`: delete the "configuration trust boundary" tests that use `configSchema`, `encodeConfig` and `decodeConfig`. Keep the `selectProducts` test.
  - `src/domain/store.test.ts`: delete "design history and snapshots". Keep the cart tests and the null-cart-merge test.

**Interfaces:**

- Produces: `presets: Record<'marketplace' | 'minimal' | 'performance', DesignConfig>` and `foreground(hex: string): '#242024' | '#FFFFFF'` from `src/design/config.ts`. Also `useUI` with `{ cart, toast, set }`.

- [ ] **Step 1:** Make the edits above. Until Task 3 adds `VersionFrame`, `App` wraps the shell in a `<div className="theme-frame">` that sets the V1 colour variables from Global Constraints inline. Home renders `presets.marketplace`.
- [ ] **Step 2:** Run `npx tsc -b && npm run lint && npm test`. Expected: no errors. Tests pass, with the deleted config and design-history tests gone.
- [ ] **Step 3:** Run `grep -rn "useDesign\|studio\|decodeConfig\|lz-string\|dnd-kit" src package.json`. Expected: no matches.
- [ ] **Step 4:** With the dev server on :5173, run `node scripts/browser-check.mjs`. Expected: exit 0, `Browser errors: [] Overflow: []`, cart workflow passed.
- [ ] **Step 5:** Checkpoint: `npm run build` succeeds.

---

### Task 2: Page version store

**Files:**

- Create: `src/state/versions.ts`, `src/state/versions.test.ts`

**Interfaces:**

- Produces:
  ```ts
  export const pageKeys = ['home','shop','product','brands','combos','build','cart','about','contact','faq'] as const
  export type PageKey = (typeof pageKeys)[number]
  export type Version = 1 | 2 | 3
  export function parseVersion(value: unknown): Version | null        // accepts 1|2|3 and '1'|'2'|'3' only
  export function pageForPath(pathname: string): PageKey | null       // null for 404
  export const useVersions: UseBoundStore<…{ versions: Record<PageKey, Version>; choose(page: PageKey, version: Version): void }>
  export function usePageVersion(page: PageKey): Version
  ```
- Route mapping for `pageForPath`:

  | Path                                          | Page key                  |
  | --------------------------------------------- | ------------------------- |
  | `/`                                           | `home`                    |
  | `/shop`, `/collections/*`, `/brands/<handle>` | `shop`                    |
  | `/brands`                                     | `brands`                  |
  | `/products/*`                                 | `product`                 |
  | `/combos`                                     | `combos`                  |
  | `/build-your-combo`                           | `build`                   |
  | `/cart`                                       | `cart`                    |
  | `/about`, `/contact`, `/faq`                  | `about`, `contact`, `faq` |
  | anything else                                 | `null`                    |

- [ ] **Step 1: Write the failing tests** in `versions.test.ts`. It needs the same `localStorage` and `window` stub as `store.test.ts`, inside `vi.hoisted`.
  ```ts
  it('defaults every page to V1', () =>
    expect(Object.values(useVersions.getState().versions).every((v) => v === 1)).toBe(true))
  it('remembers each page independently', () => {
    choose('shop', 2)
    choose('cart', 3)
    expect(versions.shop).toBe(2)
    expect(versions.cart).toBe(3)
    expect(versions.home).toBe(1)
  })
  it('parses only 1–3', () => {
    expect(parseVersion('2')).toBe(2)
    for (const bad of [0, 4, '7', 'abc', '', null, 2.5, undefined])
      expect(parseVersion(bad)).toBeNull()
  })
  it('maps routes to pages', () => {
    expect(pageForPath('/brands')).toBe('brands')
    expect(pageForPath('/brands/gnc')).toBe('shop')
    expect(pageForPath('/collections/creatine')).toBe('shop')
    expect(pageForPath('/products/x')).toBe('product')
    expect(pageForPath('/nope')).toBeNull()
  })
  it('repairs stale storage per page', () => {
    const merge = useVersions.persist.getOptions().merge!
    const restored = merge(
      { versions: { home: 4, shop: '2', cart: null, extra: 3 } },
      useVersions.getState(),
    )
    expect(restored.versions).toEqual({
      home: 1,
      shop: 2,
      product: 1,
      brands: 1,
      combos: 1,
      build: 1,
      cart: 1,
      about: 1,
      contact: 1,
      faq: 1,
    })
  })
  ```
- [ ] **Step 2:** Run `npx vitest run src/state/versions.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 3:** Implement `src/state/versions.ts` with `persist`, name `bpn-page-versions-v1`, and a `merge` that rebuilds all ten keys through `parseVersion`, falling back to `1`.
- [ ] **Step 4:** Run `npx vitest run src/state/versions.test.ts`. Expected: PASS (5 tests).
- [ ] **Step 5:** Checkpoint: `npm test && npm run lint`.

---

### Task 3: Version themes, frame and shell wiring

**Files:**

- Create: `src/design/versions.ts`, `src/design/versions.test.ts`, `src/design/VersionFrame.tsx`, `scripts/versions-check.mjs`
- Modify: `src/App.tsx`, `src/index.css`

**Interfaces:**

- Consumes: `pageForPath`, `parseVersion`, `useVersions`, `usePageVersion` (Task 2).
- Produces:
  ```ts
  // src/design/versions.ts
  export interface VersionTheme {
    name: 'Classic' | 'Editorial' | 'Performance Dark'
    swatches: [string, string]
    vars: Record<
      | '--bg'
      | '--surface'
      | '--text'
      | '--surface-text'
      | '--muted'
      | '--surface-muted'
      | '--border'
      | '--accent'
      | '--on-accent'
      | '--radius'
      | '--section-gap',
      string
    >
  }
  export const versionThemes: Record<Version, VersionTheme>
  export function contrast(a: string, b: string): number // WCAG ratio
  // src/design/VersionFrame.tsx
  export function VersionFrame(props: {
    version: Version
    children: ReactNode
    className?: string
  }): JSX.Element // renders <div class="theme-frame version-<n>"> with vars
  ```
- `scripts/versions-check.mjs [--page <key>] [--versions 1,2,3]`:
  - It visits each page's route with `?v=<n>` at widths 360, 390, 768, 1024 and 1440.
  - On each visit it asserts that `[data-layout="<page>-v<n>"]` exists, that there are no page errors, no horizontal overflow and no broken images.
  - It exits 1 on any failure and prints a summary.
  - Routes:

    | Page                      | Route                                                |
    | ------------------------- | ---------------------------------------------------- |
    | `home`                    | `/`                                                  |
    | `shop`                    | `/shop`                                              |
    | `product`                 | `/products/optimum-nutrition-gold-standard-100-whey` |
    | `brands`                  | `/brands`                                            |
    | `combos`                  | `/combos`                                            |
    | `build`                   | `/build-your-combo`                                  |
    | `cart`                    | `/cart`, after adding one product via its page       |
    | `about`, `contact`, `faq` | `/about`, `/contact`, `/faq`                         |

- [ ] **Step 1: Write the failing test** in `src/design/versions.test.ts`:
  ```ts
  for (const v of [1, 2, 3] as const)
    it(`V${v} meets WCAG AA`, () => {
      const t = versionThemes[v].vars
      expect(contrast(t['--text'], t['--bg'])).toBeGreaterThanOrEqual(4.5)
      expect(contrast(t['--surface-text'], t['--surface'])).toBeGreaterThanOrEqual(4.5)
      expect(contrast(t['--muted'], t['--bg'])).toBeGreaterThanOrEqual(4.5)
      expect(contrast(t['--on-accent'], t['--accent'])).toBeGreaterThanOrEqual(4.5)
      expect(contrast(t['--accent'], t['--bg'])).toBeGreaterThanOrEqual(4.5)
    })
  ```
- [ ] **Step 2:** Run `npx vitest run src/design/versions.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 3:** Implement `versions.ts` with the colours from Global Constraints. `--on-accent` is `foreground(accent)`, except V3, which is pinned to `#242024`. Implement `VersionFrame`. In `index.css`:
  - set `.version-2` heading fonts
  - set `.version-3` heading font, uppercase and compact `--section-gap: 42px`
  - set V2 `--section-gap: 92px`
- [ ] **Step 4:** Run `npx vitest run src/design/versions.test.ts`. Expected: PASS (3 tests).
- [ ] **Step 5:** Wire `App.tsx`:
  - `page = pageForPath(location.pathname)`
  - `version = usePageVersion(page ?? 'home')`
  - wrap the top bar, header, main and footer in `<VersionFrame version={version}>`
  - wrap `CartDrawer` in `<VersionFrame version={usePageVersion('cart')}>`
  - add an effect on `location.search`. When `v` is present, set it if `parseVersion` accepts it and `page` isn't null, then `navigate(pathname + remaining search, { replace: true })`, keeping every other param.
- [ ] **Step 6:** Write `scripts/versions-check.mjs`. Add a `--extra` block that asserts:
  - `/shop?q=whey&v=3` ends at a URL containing `q=whey` and not `v=`, and `[data-layout="shop-v3"]` is present once Task 6 lands. Until then it asserts only the URL and `.version-3` on the frame.
  - `/shop?v=abc` ends at `/shop` with `.version-1`.
- [ ] **Step 7:** Run `node scripts/versions-check.mjs --extra`. Expected: the URL and frame-class assertions pass. The `data-layout` assertions fail for every page; they're filled in by Tasks 5–12.
- [ ] **Step 8:** Checkpoint: `npm test && npm run lint && npx tsc -b`.

---

### Task 4: Version menus in the header

**Files:**

- Create: `src/components/VersionMenu.tsx`
- Modify: `src/components/Header.tsx`, `src/index.css`, `scripts/versions-check.mjs`

**Interfaces:**

- Consumes: `useVersions`, `PageKey`, `Version` (Task 2) and `versionThemes` (Task 3).
- Produces:
  ```ts
  export function VersionMenu(
    props:
      | { label: string; to: string; page: PageKey }
      | { label: string; group: { label: string; to: string; page: PageKey }[] },
  ): JSX.Element
  ```
  - The trigger button has `aria-haspopup="menu"` and `aria-expanded`. The label link has `aria-current="page"` when on that page.
  - Each item is a `role="menuitemradio"` with `aria-checked`, shows "V<n> · <name>" plus the two swatch dots, calls `choose(page, n)` and navigates to `to`.
- Nav order:
  - Home `/`
  - Shop `/shop`
  - Product `/products/<current handle if on a product page, else optimum-nutrition-gold-standard-100-whey>`
  - Brands `/brands`
  - Combos `/combos`
  - Build `/build-your-combo`
  - Cart `/cart`
  - Pages (group: About, Contact, FAQ)
- Remove the "Shop by category" mega menu, the old nav links and the `nav-offer` link. Keep search, the "Build a combo" action, the bag button and the mobile menu toggle.

- [ ] **Step 1:** Extend `versions-check.mjs` with a `--nav` block that does the following, then run it. Expected: FAIL (no menu yet).
  1. Hover "Shop". Expect a `menu` with 3 `menuitemradio` items, V1 checked.
  2. Click "V2 · Editorial". Expect the URL `/shop`, `.version-2`, and `aria-checked` on V2.
  3. Reload. Expect it still V2.
  4. Go to `/cart`. Expect `.version-1`, since pages are independent.
  5. Focus the "Combos" trigger and press Enter. Expect the menu open with focus on the first item. Press ArrowDown, then Escape. Expect the menu closed and focus back on the trigger.
  6. At 390 px, open the mobile menu, tap "Combos". Expect the sub-list expanded and the URL unchanged.
- [ ] **Step 2:** Implement `VersionMenu`:
  - opens on hover (pointer devices), click and tap
  - Enter, Space and ArrowDown open it
  - Arrow keys move between items
  - Escape and outside clicks close it
  - the label link navigates to `to`
  - nested "Pages" items render as a sub-group with headings About, Contact and FAQ
- [ ] **Step 3:** Rebuild the `Header` nav from `VersionMenu`s. Mobile shows the same items as accordions.
- [ ] **Step 4:** Run `node scripts/versions-check.mjs --nav`. Expected: PASS.
- [ ] **Step 5:** Checkpoint: `npm run lint && npx tsc -b`, then `node scripts/browser-check.mjs` exits 0.

---

### Tasks 5–12: Page variants

Every page task follows the same cycle:

- **Step 1:** run `node scripts/versions-check.mjs --page <key>` and expect FAIL on the missing `data-layout`.
- **Step 2:** implement the variants.
- **Step 3:** rerun the check and expect PASS for all three versions at all five widths.
- **Step 4:** screenshot V1, V2 and V3 at 1440 and 390 and confirm the layouts visibly differ, as the spec's anti-goal requires.
- **Checkpoint:** `npm test && npm run lint && npx tsc -b`.

Each page component reads `const v = usePageVersion('<key>')` and sets `data-layout={`<key>-v${v}`}` on its root `<main>` (`<div className="home">` for Home). Shared data and handlers stay in one place, and only the JSX and CSS branch. Class names follow `<page>-v<n>`, for example `shop-v2`. V1 must stay visually identical to today.

### Task 5: Home

- **Modify:** `src/sections/Home.tsx`, `src/App.tsx` (pass the version), `src/index.css`.
- **Mapping:**
  - V1 uses `presets.marketplace`.
  - V2 uses `presets.minimal` with `hero: 'editorial'` and `card: 'minimal'`.
  - V3 uses `presets.performance` with `hero: 'bold'`.
- The existing `layout-*`, `hero-*` and `card-*` CSS already differentiates them. Add `.version-2` and `.version-3` overrides only where hard-coded light colours break (hero campaign panel, category tiles, deal cards), so V3 reads as dark.
- **Check:** `--page home`.

### Task 6: Shop (`/shop`, `/collections/:handle`, `/brands/:handle`)

- **Modify:** `src/pages/Catalog.tsx` (the `Catalog` component), `src/index.css`.
- **V2:**
  - full-width campaign banner: category or brand name, tagline, and the category's featured product photo from `categoryProduct`, or the hero cutout on `/shop`
  - filters as horizontal chips: categories, then brands
  - price and sort in a single toolbar row
  - 2-column grid with `card='minimal'` at ≥768 px, 1 column below
- **V3:**
  - category tabs as a sticky top strip, brands in a dropdown
  - no sidebar
  - 4-column grid with `card='compact'` at ≥1024 px, 3 at 768, 2 below
- **Empty state:** "No matches" must render inside V2 and V3. Add it to the check by visiting `/shop?q=zzzz&v=2` and `?v=3` and asserting the reset button is visible.

### Task 7: Product (`/products/:handle`)

- **Modify:** `src/pages/Product.tsx`, `src/index.css`.
- **V2:**
  - all images stacked vertically on the left
  - details column `position: sticky`
  - serif title
  - "More good things" as a 3-up row
- **V3:**
  - dark hero band with the main image on the right, title, rating and price on the left
  - spec strip with size, flavour count and stock
  - thumbnails as a horizontal row
  - fixed bottom add-to-bag bar at ≤768 px
- **Missing product:** the "Product not found" empty state renders in all versions. Add `/products/nope?v=3` to the check, asserting the heading text and `.version-3`.

### Task 8: Brands (`/brands`)

- **Modify:** `Brands` in `src/pages/Catalog.tsx`, `src/index.css`.
- **V2:** one brand per row: a large logo tile on the left, then name, product count and up to 3 of the brand's product photos.
- **V3:** a dense logo wall, 4 columns down to 2. Logos sit in `--text` on `--surface` tiles, with the product count on hover and focus.

### Task 9: Combos (`/combos`)

- **Modify:** `Combos` in `src/pages/Combos.tsx`, `src/index.css`.
- **V2:** an inline builder section first, reusing `ComboBuilder`'s selection logic extracted into a `useComboBuilder()` hook in `Combos.tsx`. Ready combos appear below as cards.
- **V3:** the first combo becomes a spotlight. Its product photos and the "+" sit large, with the saving shown in large type. The other combos follow in a horizontal scroller.
- **Interface:** `useComboBuilder(): { items: Selection[]; add(productId: string, variantId: string): void; setQuantity(item: Selection, q: number): void; remove(item: Selection): void; price: ReturnType<typeof priceSelection>; count: number; reset(): void }` is used by Task 10 as well.

### Task 10: Build your combo (`/build-your-combo`)

- **Modify:** `ComboBuilder` in `src/pages/Combos.tsx` (uses `useComboBuilder` from Task 9), `src/index.css`.
- **V2:** two columns: products on the left, and a cream summary card on the right with serif headings and gold dividers.
- **V3:** a dark product grid with a sticky bottom savings bar at every width: count, discount tier and total, plus the add button. Replaces the side summary.

### Task 11: Cart (`/cart` and the drawer)

- **Modify:** `src/pages/Cart.tsx` (`CartContents`, `Cart`), `src/index.css`.
- **V2:** a single-column receipt. Each line has a large photo, the totals sit below with gold dividers, and the checkout button is full width.
- **V3:** a dark split layout. Lines are on the left. The summary panel on the right shows the total in large type and highlights the combo savings in red.
- The drawer uses the same `CartContents` and gets its version from the drawer's `VersionFrame` (Task 3), so read `usePageVersion('cart')`.
- **Empty bag:** the check visits `/cart?v=2` and `?v=3` with an empty bag and asserts the "Room for good things." heading.

### Task 12: About, Contact, FAQ

- **Modify:** `src/pages/Information.tsx`, `src/index.css`. `page` maps to the keys `about`, `contact` and `faq`.
- **V2:** editorial long-form:
  - a narrow serif column
  - a pull quote on About
  - Contact as a centred form card
  - FAQ as a large-type accordion
- **V3:** dark, bold headline blocks:
  - About as stat or value tiles
  - Contact split into a red info panel and the form
  - FAQ as cards in a 2-column grid

---

### Task 13: Final verification and docs

**Files:**

- Modify: `README.md`, `scripts/browser-check.mjs`, `docs/superpowers/specs/2026-10-19-page-versions-design.md` (status: implemented)

- [ ] **Step 1:** Update the README:
  - replace "Local use" Studio text with a description of the version menus
  - document `?v=` links
  - add `node scripts/versions-check.mjs` under Checks
- [ ] **Step 2:** Run the full gate:
  - `npx prettier --check .`
  - `npm run lint`
  - `npx tsc -b`
  - `npm test`
  - `npm run build`
  - `node scripts/browser-check.mjs`
  - `node scripts/versions-check.mjs --extra --nav`

  Expected: all succeed. The versions check reports 10 pages × 3 versions × 5 widths passed with no errors, overflow or broken images.

- [ ] **Step 3:** Run `grep -rniE "demo|prototype|illustrative|kapoor|guardian|suppx" src --include=*.tsx`. Expected: no user-facing matches.
- [ ] **Step 4:** Screenshot V1, V2 and V3 of every page at 1440 into the scratchpad for the owner's review.
