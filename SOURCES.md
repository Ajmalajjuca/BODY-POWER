# Catalog sources

The storefront shows no retailer names. This file records where its catalog came from. It is for the team and is not linked from the site.

Captured on 19 October 2026 as a static snapshot. Prices and stock are not live.

| Source                                      | Feed                                                   | Products |
| ------------------------------------------- | ------------------------------------------------------ | -------- |
| Kapoor Medical Hall (kapoormedicalhall.com) | WooCommerce Store API, `/wp-json/wc/store/v1/products` | 19       |
| Guardian (guardian.in)                      | Shopify `/products.json`                               | 6        |

SuppX (suppx.co.in) was reviewed and was not used. Its stock overlaps these brands at higher prices.

- 25 products, 92 variants, 78 images, 6 categories and 7 brands (Optimum Nutrition, MuscleTech, Dymatize, GNC, Rule 1, Applied Nutrition, GHOST).
- Prices are each source's selling price. Strike-through prices are the source's regular or compare-at price.
- Ratings appear only where the source published product reviews: 13 Kapoor products. No ratings are invented.
- Titles are shortened storefront names. Descriptions are the source text converted to plain text. Lines naming the retailer, the importer or cross-promotions are removed.
- The Guardian whey listing has no feed description. Its text was extracted from the product page with ScrapeGraphAI (`just-scrape extract`).
- Images were reviewed by hand. Retailer import-sticker photos, shaker promotions and banners are excluded in `EXCLUDED_IMAGES` and `IMAGE_PICKS`.
- Brand logos in `public/brands/` come from each brand's own website: Optimum Nutrition (optimumnutrition.co.in), MuscleTech, Dymatize (the inline header SVG), Rule 1, Applied Nutrition and GHOST. GNC's is the public-domain `GNC_Logo.svg` on Wikimedia Commons. ScrapeGraphAI's branding extraction was tried for Dymatize but returned a blog photo, so that logo is taken from the page header instead. The site draws logos as single-colour masks in the theme's text colour. URLs are listed in `LOGOS` in the importer.
- The homepage hero packs are cut-outs of the Optimum Nutrition and MuscleTech front photos.
- Each product's `source` field in `src/data/catalog.json` keeps its original URL, capture time and image URLs.

## Before launch

Product photography and descriptions belong to the brands and the source retailers. They are suitable for a private client presentation. A public store needs images and copy supplied or licensed through the client's distributors, and its own prices and stock.

## Re-running

`python3 scripts/import-catalog.py` needs Python 3, ImageMagick (`magick`) and, for missing descriptions only, the `just-scrape` CLI with `SGAI_API_KEY` in the environment or `.env`.

Raw responses are cached in `.just-scrape/catalog/`, which is gitignored, so reruns replay the same capture. Delete that folder for a fresh snapshot.

To change the product mix, edit `SELECTION`. Then run `npm test`, which checks counts, images, prices and that no retailer names appear.
