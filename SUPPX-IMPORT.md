# SuppX collection import

Source: https://www.suppx.co.in/collections/suppx-best-seller

Captured on 19 October 2026. This is a static snapshot, not a live price or stock integration.

- 58 products, 79 variants and 192 locally hosted WebP images.
- Product names, descriptions, tags, prices, compare-at prices, options and availability come from the public Shopify collection feed.
- ScrapeGraphAI was used to capture the collection page and pagination links. The public feed covers the full collection; its next page is empty.
- Product pages supply product-specific Judge.me rating aggregates: four products have ratings, each 5/5 from one review. The other 54 explicitly have zero product reviews. Store-wide ratings are excluded.
- Shipping weights are not used as package sizes. Missing package size is labeled Standard pack; variant flavors/options are preserved.
- Descriptions are converted to plain text; external HTML and scripts are never rendered or executed. Source links and capture dates appear on imported detail pages.

## In the site

Open `/collections/suppx-best-seller`, or use the Bestsellers navigation link. Imported products also appear first in the default shop and featured/bestseller homepage sections. Their images work in cards, galleries and cart lines. The original 40 demo products remain available. Imported stock status controls add-to-bag availability. Existing demo combo rules remain illustrative; no orders or payments are accepted.

## Files and repeatability

- `src/data/suppx-catalog.json`: normalized product snapshot, provenance and original image URLs.
- `public/products/suppx/`: 192 optimized images, about 23 MB total.
- `scripts/import-suppx.py`: importer using Python 3 standard library plus the `cwebp` command.
- `.just-scrape/suppx/`: ignored raw capture cache and original image files.

Running `python3 scripts/import-suppx.py` replays cached data when present and preserves the feed's original capture timestamp. For a fresh snapshot, move the cache and local imported image directory aside before running it. The generated snapshot is committed/deployed with the site; no API key is included in application code.

## Verification

`npm test`, `npm run lint`, `npm run build` and `node scripts/check-suppx.mjs` validate the import. The browser script requires a running dev server on port 5173 and Chrome at `/usr/bin/google-chrome`. It checks all 58 detail pages, decodes all 192 images, verifies prices/ratings/sold-out states, exercises gallery and cart persistence, and checks the collection at five screen widths.

The existing production JavaScript bundle-size warning remains.
