# Page versions: design

Date: 2026-10-19 · Status: implemented (plan: docs/superpowers/plans/2026-10-19-page-versions.md)

## Intent

The site is a prototype for showing a client their future store, Body Power Nutrition. The owner walks the client through it in a meeting. The client should be able to compare three versions of every page and choose one per page, the way premium theme demos work. In the owner's reference screenshots, hovering "Home" opens a menu with "Home V1" and "Home V2".

When the meeting ends, the site should show exactly the set of pages the client chose.

This replaces the Design Studio. The owner asked for it to be removed.

## Goals

- Every main nav item has a dropdown listing **V1, V2 and V3** of that page. Clicking a version opens the page in that version.
- Each version has its **own layout and its own colour scheme**.
- The chosen version is **remembered per page**. Home, Shop, Cart and the rest each keep their own choice. Choices survive reloads in the same browser.
- Every link in the site opens the target page in its remembered version. This includes product cards, "Shop all", the bag and the footer.
- All three versions work at 360, 390, 768, 1024 and 1440 px, with no horizontal scroll.

## Non-goals

- No Studio or other in-page editor. Fine-tuning colours or sections is out of scope for now.
- No mixing beyond page level. A page uses one whole version; sections are not chosen individually.
- No backend. Choices live in the browser.
- No changes to catalog data, pricing rules or the cart logic.

## Anti-goals (failure even if it "works")

- A version that is only a recolour. V2 and V3 must have visibly different layouts, not just different colours.
- Losing the "real store" feel. All the versions are real, working pages with the real catalog, and none of them carries demo or prototype wording.
- A version that breaks a flow, such as adding to the bag, combos, filters or search.

## The three versions (a shared style per version number)

The same version number feels like the same design family on every page.

|         | V1 · Classic                                             | V2 · Editorial                                                                                               | V3 · Performance Dark                                                                             |
| ------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Mood    | Today's site: clean marketplace                          | Premium, airy, magazine-like                                                                                 | Bold gym energy, dense                                                                            |
| Colours | Warm white `#FAF7F5`, burgundy `#800020`, white surfaces | Ivory `#F5F0E6`, deep wine `#58181F`, gold `#C9A96E` (decorative only, never text), cream surfaces `#FFFCF6` | Near-black `#141014`, red `#FF4D5E` with dark text on red buttons, surfaces `#251D22`, light text |
| Type    | Current sans                                             | Serif headings (editorial font already in the project), sans body                                            | Heavy condensed uppercase headings, sans body                                                     |
| Spacing | Current                                                  | Airy, large imagery                                                                                          | Compact, dense grids                                                                              |

Text and accent colours must pass WCAG AA contrast on their backgrounds. The first V3 red, `#E23A4E`, failed this (3.8:1 for button text, 4.4:1 as text on black). `#FF4D5E` passes: 4.95:1 for dark button text and 5.81:1 on black.

## Pages and what changes per version

Each "page" below is a nav-level page with its own remembered version. Related routes share their page's version.

| Page             | Routes                                             | V1                                  | V2                                                                         | V3                                                                                |
| ---------------- | -------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Home             | `/`                                                | Current Marketplace Plus homepage   | The current "Premium Minimal" homepage, restyled Editorial                 | The current "Performance" homepage, restyled Dark                                 |
| Shop             | `/shop`, `/collections/:handle`, `/brands/:handle` | Filter sidebar and grid (today)     | Campaign banner, filters as chips, large 2-up cards                        | Category tabs along the top, dense 4-up grid, compact cards                       |
| Product          | `/products/:handle`                                | Gallery left, details right (today) | Large stacked gallery, sticky details column, serif title                  | Full-width dark hero with the product photo, specs and price band, add-to-bag bar |
| Brands           | `/brands`                                          | Card grid with logos (today)        | Large logo tiles, one brand per row with a short intro                     | Logo wall grid on dark                                                            |
| Combos           | `/combos`                                          | Three bundle cards (today)          | Builder-first: pick products with a live savings panel, ready combos below | One spotlight combo with a big saving, the others in a horizontal scroller        |
| Build your combo | `/build-your-combo`                                | Today's builder                     | Two-column editorial builder with a cream summary card                     | Dark builder with a sticky bottom savings bar                                     |
| Cart             | `/cart` and the bag drawer                         | Lines and summary card (today)      | Single-column receipt style with large product photos                      | Dark split layout with a bold total and checkout panel                            |
| Pages            | `/about`, `/contact`, `/faq`                       | Today's layouts                     | Editorial long-form with pull quotes and an accordion FAQ                  | Dark, bold headline blocks, FAQ as cards                                          |

The 404 page always uses the Home version's colours.

## Navigation

- The main nav becomes: **Home ▾ · Shop ▾ · Product ▾ · Brands ▾ · Combos ▾ · Build ▾ · Cart ▾ · Pages ▾**.
  - Each dropdown lists V1 / V2 / V3 with a short name and two colour dots. The remembered version shows a check mark.
  - The Pages dropdown lists About, Contact and FAQ. Each has V1 / V2 / V3; a nested list is fine.
- Clicking the nav item's label (not the caret) opens the page in its remembered version.
- **Product ▾:** on a product page, switching the version re-renders that product. Elsewhere it opens the featured product, Optimum Nutrition Gold Standard 100% Whey, in the chosen version.
- **Mobile:** the menu button lists the same items, with versions as an expandable sub-list.
- **Accessibility:** dropdowns open on hover and on click or tap, work with the keyboard (Enter, Space, arrow keys, Escape) and expose `aria-expanded` and `aria-current`.
- **Kept:** the search box and the bag button. The "Shop by category" mega menu is removed; categories stay reachable from the homepage, Shop filters and search. _(Builder's call; see below.)_

## Remembering choices

- A persisted store maps each page key to its version: `home`, `shop`, `product`, `brands`, `combos`, `build`, `cart`, `about`, `contact`, `faq`. Every key starts at `1`.
- It lives in localStorage under a new key. Invalid stored values fall back to V1.
- **URL override:** `?v=2` on any route sets and remembers that page's version, then removes itself from the URL. The owner can send the client a link to a specific version.

## Colours and the page shell

- The version theme wraps the whole page: top bar, header, page content, footer and the bag drawer. The shell follows the current page's version, so a dark V3 page has a dark header and footer.
- The bag drawer uses the Cart page's version.
- Version themes set the same CSS variables the site already uses (`--bg`, `--surface`, `--text`, `--muted`, `--border`, `--accent`, `--on-accent`, `--radius` and so on). Existing components therefore recolour without per-component colour rules.
- The SVG logo mark already follows `--accent`, so it recolours automatically.

## Removing the Design Studio

Remove all of the following:

- the Studio panel and launcher (`src/studio/`)
- design presets and themes UI
- saved design versions, comparison, JSON import/export, share links, undo/redo
- preview viewport frames and presentation mode
- the `#design=` link handling
- the related state, CSS and tests

Remove dependencies that become unused, likely `@dnd-kit/*` and `lz-string`. Remove `zod` only if nothing else uses it.

The homepage keeps its section registry and renderers as static content. Each Home version is a fixed, ordered section list, taken from today's presets: Marketplace for V1, Minimal for V2, Performance for V3. They are no longer editable.

The README and browser check drop their Studio steps.

## Testing

- **Unit:** the version store clamps and validates values, persists them and applies the `?v=` override. Pricing, cart and catalog tests keep passing.
- **Browser check:**
  - Every page key is checked in V1, V2 and V3 at the five widths, with no page errors, horizontal overflow or broken images.
  - The dropdown switches the version and the choice survives a reload.
  - A choice for one page doesn't change another page.
  - The cart add, persist and remove flow works in each Cart version.

## Calls made by the designer (not decided by the owner; check while reading)

1. The three versions share a style family per number (Classic, Editorial, Performance Dark), so a picked set still feels like one brand.
2. Header, footer and bag drawer follow the current page's version colours.
3. Today's three homepage presets become Home V1, V2 and V3.
4. "Studio section" was read as the whole Design Studio, so everything Studio-related is removed, including saved designs and share links.
5. The `?v=2` URL override was added so specific versions can be linked.
6. The "Shop by category" mega menu is dropped from the nav to make room for the version menus.
7. There is no on-screen "selection summary". The check marks in the dropdowns show the current picks.
8. The Studio's other options go with it: the centred header, product columns, card style and corner radius. Each version fixes its own values for these.

## Left to the builder

- Exact component structure: per-version components versus one component with layout switches. Prefer sharing data and logic and varying only presentation.
- Exact spacing, font sizes and imagery within each version's mood and colours.
- Whether V2's serif and V3's condensed heading fonts come from fonts already in the project or a small font addition.
