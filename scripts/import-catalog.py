"""Import the curated storefront catalog from public retailer feeds.

Kapoor Medical Hall exposes the WooCommerce Store API and Guardian exposes the
Shopify products feed; neither needs credentials. When a feed has no product
description, the product page is read with the ScrapeGraphAI `just-scrape` CLI
(SGAI_API_KEY from the environment or the project .env file).

Raw responses are cached in .just-scrape/catalog/ so reruns replay the capture.
Source details are kept in the JSON for SOURCES.md; the storefront never shows them.
"""
import concurrent.futures
import datetime
import html
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import time
import urllib.request
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / '.just-scrape' / 'catalog'
ASSETS = ROOT / 'public' / 'products'
OUTPUT = ROOT / 'src' / 'data' / 'catalog.json'
MAX_IMAGES = 4

SOURCES = {
    'kapoor': {'name': 'Kapoor Medical Hall', 'base': 'https://kapoormedicalhall.com'},
    'guardian': {'name': 'Guardian', 'base': 'https://www.guardian.in'},
}

CATEGORIES = [
    {'id': 'c1', 'name': 'Whey Protein', 'handle': 'whey-protein', 'tagline': 'Make every scoop count'},
    {'id': 'c2', 'name': 'Creatine', 'handle': 'creatine', 'tagline': 'Your daily essential'},
    {'id': 'c3', 'name': 'Pre-Workout', 'handle': 'pre-workout', 'tagline': 'Find your focus'},
    {'id': 'c4', 'name': 'Mass Gainer', 'handle': 'mass-gainer', 'tagline': 'More in every serving'},
    {'id': 'c5', 'name': 'Vitamins & Wellness', 'handle': 'wellness', 'tagline': 'Your everyday foundation'},
    {'id': 'c6', 'name': 'Omega-3 & Fish Oil', 'handle': 'omega-3', 'tagline': 'Small softgel. Big routine.'},
]

BRANDS = [
    {'id': 'optimum-nutrition', 'name': 'Optimum Nutrition', 'short': 'ON', 'color': '#1f2a44'},
    {'id': 'muscletech', 'name': 'MuscleTech', 'short': 'MT', 'color': '#b82830'},
    {'id': 'dymatize', 'name': 'Dymatize', 'short': 'DYM', 'color': '#285c89'},
    {'id': 'gnc', 'name': 'GNC', 'short': 'GNC', 'color': '#b72132'},
    {'id': 'rule1', 'name': 'Rule 1', 'short': 'R1', 'color': '#242526'},
    {'id': 'applied-nutrition', 'name': 'Applied Nutrition', 'short': 'AN', 'color': '#1d4f91'},
    {'id': 'ghost', 'name': 'GHOST', 'short': 'GH', 'color': '#111111'},
]

# Official brand logos: each brand's own site, except GNC (public-domain file on Wikimedia Commons).
# The storefront draws them as single-colour masks, so only their shape (alpha) matters.
LOGOS = {
    'optimum-nutrition': 'https://cdn.shopify.com/s/files/1/0738/8649/9042/files/2.svg?v=1741776730',
    'muscletech': 'https://www.muscletech.com/cdn/shop/files/muscletech-logo-blk-checkout.png?v=1695820629&width=500',
    'dymatize': 'https://dymatize.com/#page-header__logo',
    'gnc': 'https://upload.wikimedia.org/wikipedia/commons/e/ee/GNC_Logo.svg',
    'rule1': 'https://www.ruleoneproteins.com/cdn/shop/files/web_logo_1c.svg?v=1694798567',
    'applied-nutrition': 'https://appliednutrition.uk/cdn/shop/files/AN_Applied_Logo_June_2025.jpg?v=1753276798&width=600',
    'ghost': 'https://www.ghostlifestyle.com/cdn/shop/t/771/assets/logo.png?v=143946769549390083501712686572',
}
LOGO_ASSETS = ROOT / 'public' / 'brands'

# (source, source product id, storefront title, brand, category, featured, bestseller, size when the feed has none)
SELECTION = [
    ('kapoor', 21924, 'Gold Standard 100% Whey', 'optimum-nutrition', 'c1', True, True, None),
    ('kapoor', 21890, 'Nitro-Tech Whey Protein', 'muscletech', 'c1', True, True, None),
    ('kapoor', 21912, 'ISO 100 Hydrolyzed Whey Protein', 'dymatize', 'c1', True, True, '2.3 kg'),
    ('kapoor', 21909, 'Whey Blend Protein', 'rule1', 'c1', False, True, None),
    ('guardian', 9630476894439, 'Pro Performance 100% Whey', 'gnc', 'c1', True, False, None),
    ('kapoor', 21930, 'Micronised Creatine Monohydrate', 'optimum-nutrition', 'c2', True, True, None),
    ('kapoor', 21908, 'Platinum Creatine Monohydrate', 'muscletech', 'c2', False, False, None),
    ('kapoor', 23505, 'Creatine Monohydrate', 'applied-nutrition', 'c2', False, False, '250 g'),
    ('guardian', 9116225536231, 'Pro Performance Creatine Monohydrate', 'gnc', 'c2', False, True, None),
    ('kapoor', 27777, 'Legend Pre-Workout', 'ghost', 'c3', True, False, '30 Servings'),
    ('kapoor', 24258, 'Energyze Pre-Workout', 'dymatize', 'c3', False, False, '400 g'),
    ('kapoor', 23657, 'Vapor X5 Pre-Workout', 'muscletech', 'c3', False, True, '270 g'),
    ('kapoor', 24120, 'PreLift Pre-Workout', 'rule1', 'c3', False, False, '30 Servings'),
    ('kapoor', 21964, 'Serious Mass Gainer', 'optimum-nutrition', 'c4', True, True, None),
    ('kapoor', 21904, 'Mass-Tech Extreme 2000', 'muscletech', 'c4', False, False, None),
    ('kapoor', 22685, 'Mass Gainer', 'rule1', 'c4', False, False, None),
    ('guardian', 7641509298407, 'AMP Amplified Mass XXX', 'gnc', 'c4', False, False, None),
    ('guardian', 8290938126567, 'Mega Men One Daily Multivitamin', 'gnc', 'c5', True, True, None),
    ('guardian', 7645707567335, "Women's One Daily Multivitamin", 'gnc', 'c5', False, False, None),
    ('kapoor', 23368, "Men's Multi-Vitamin", 'rule1', 'c5', False, False, '90 Tablets'),
    ('kapoor', 24219, 'Multivitamin Complex', 'applied-nutrition', 'c5', False, False, '90 Capsules'),
    ('guardian', 7641432883431, 'Triple Strength Fish Oil', 'gnc', 'c6', True, True, None),
    ('kapoor', 22518, 'Platinum Omega Fish Oil', 'muscletech', 'c6', False, False, '100 Softgels'),
    ('kapoor', 23889, 'Fish Oil Softgels', 'optimum-nutrition', 'c6', False, False, '60 Softgels'),
    ('kapoor', 29900, 'Omega 3 Essential Fatty Acids', 'applied-nutrition', 'c6', False, False, '100 Softgels'),
]

# Homepage hero packs (main, then back), cut out from each product's front photo.
HERO = ['optimum-nutrition-gold-standard-100-whey', 'muscletech-nitro-tech-whey-protein']

# Retailer import stickers and promotional banners, found by reviewing every downloaded image.
EXCLUDED_IMAGES = {
    '11.jpg-1-1.webp', 'Importer-tag-5.webp', 'Dymatize-energyze-pre-workout-Z-2.webp', '8.jpg-2.webp',
    '811bbJQy4SL._SL1500_.jpg', 'Rule-1-mass-gainer-2.60kg-ZZ.webp', 'Rule-1-Man-multi-QQ-1.webp',
    'Rule-1-pre-lift-workout-Z-2.webp', 'zx6guarek8bmbnnbpl6u.webp',
}
# Option photos for this listing carry a free-shaker promotion; use its plain product shots instead.
IMAGE_PICKS = {
    9116225536231: ['1-90200027_72da27ec', '3-90200027.jpg', '5-90200027_bff85134', '1-90200027.jpg'],
}
# Retailer-specific lines (store names, importers, cross-promotions) never reach the storefront.
RETAILER_TEXT = re.compile(r'kapoor|guardian|suppx|imported by|marketed by|importer|buy (now|online)|shop now|order now|our store|\bat [A-Z][a-z]+ Medical', re.I)
# Bundle and multipack options are separate retail offers, not product variants.
EXCLUDED_OPTION = re.compile(r'pack of|\b\d+\s*x\b|combo|shaker|free', re.I)


class PlainText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.skip += 1
        if tag in ('p', 'div', 'li', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'tr'): self.parts.append('\n')
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.skip = max(0, self.skip - 1)
        if tag in ('td', 'th'): self.parts.append(' | ')
        if tag in ('p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'tr'): self.parts.append('\n')
    def handle_data(self, data):
        if not self.skip: self.parts.append(data)
    def text(self, markup):
        self.feed(markup)
        return '\n'.join(line for line in (' '.join(x.split()) for x in ''.join(self.parts).splitlines()) if line)


def clean_description(markup):
    lines = [line for line in PlainText().text(markup or '').splitlines() if not RETAILER_TEXT.search(line)]
    return '\n'.join(lines).strip()


def fetch(url):
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; CatalogImport/1.0)'})
            with urllib.request.urlopen(req, timeout=45) as response:
                return response.read(), response.headers.get_content_type()
        except Exception:
            if attempt == 2: raise
            time.sleep(attempt + 1)


def cached_json(url, name):
    path = CACHE / name
    if not path.exists():
        data, _ = fetch(url)
        path.write_bytes(data)
    return json.loads(path.read_bytes())


def api_key_env():
    env = dict(os.environ)
    dotenv = ROOT / '.env'
    if 'SGAI_API_KEY' not in env and dotenv.exists():
        for line in dotenv.read_text().splitlines():
            if line.startswith('SGAI_API_KEY='): env['SGAI_API_KEY'] = line.split('=', 1)[1].strip()
    return env


def scraped_description(url, name):
    """Read a product page with ScrapeGraphAI when the feed has no description."""
    path = CACHE / name
    if not path.exists():
        prompt = ('Extract the product description from the main product details section as plain text: '
                  'overview, key benefits and how to use. Exclude reviews, prices, offers, delivery and store information.')
        result = subprocess.run(['just-scrape', 'extract', url, '-p', prompt, '--json'], capture_output=True, text=True,
                                env=api_key_env(), stdin=subprocess.DEVNULL, timeout=240)
        if result.returncode != 0: raise RuntimeError('just-scrape failed for ' + url + ': ' + result.stderr[-400:])
        path.write_text(result.stdout)
    data = json.loads(path.read_text())
    found = []
    def collect(value):
        if isinstance(value, str): found.append(value)
        elif isinstance(value, list): [collect(v) for v in value]
        elif isinstance(value, dict):
            for key, v in value.items():
                if key not in ('id', 'request_id', 'status', 'url', 'website_url', 'error', 'usage', 'metadata'): collect(v)
    collect(data.get('result', data.get('json', data)))
    text = '\n'.join(' '.join(s.split()) for s in found if len(s.split()) > 3)
    return '\n'.join(line for line in text.splitlines() if not RETAILER_TEXT.search(line))


def raw_path(url):
    return CACHE / 'images' / (urlparse(url).hostname + '-' + re.sub(r'[^\w.-]+', '_', file_name(url)))


def tighten_viewbox(path):
    """Crop an SVG's viewBox to its drawn mark, so built-in padding doesn't shrink the logo."""
    svg = path.read_text()
    match = re.search(r'viewBox="([\d.\s-]+)"', svg)
    x, y, w, h = (float(n) for n in match.group(1).split())
    density = 300
    full = subprocess.run(['magick', '-background', 'none', '-density', str(density), str(path), '-format', '%w', 'info:'],
                          capture_output=True, text=True, check=True).stdout
    box = subprocess.run(['magick', '-background', 'none', '-density', str(density), str(path), '-format', '%@', 'info:'],
                         capture_output=True, text=True, check=True).stdout
    bw, bh, bx, by = (int(n) for n in re.match(r'(\d+)x(\d+)\+(\d+)\+(\d+)', box).groups())
    scale = w / int(full)
    tight = f'{x + bx * scale:.2f} {y + by * scale:.2f} {bw * scale:.2f} {bh * scale:.2f}'
    path.write_text(svg.replace(match.group(0), f'viewBox="{tight}"', 1))


def save_logo(brand_id):
    url = LOGOS[brand_id]
    cache = CACHE / 'logos' / f'{brand_id}{Path(urlparse(url).path).suffix or ".html"}'
    if not cache.exists():
        payload, _ = fetch(url.split('#')[0])
        cache.write_bytes(payload)
    data = cache.read_bytes()
    if cache.suffix == '.html':
        # Dymatize renders its logo as inline SVG inside the page header.
        page = data.decode('utf-8')
        start = page.index('<svg', page.index(urlparse(url).fragment))
        target = LOGO_ASSETS / f'{brand_id}.svg'
        target.write_text(page[start:page.index('</svg>', start) + 6])
    elif cache.suffix == '.svg':
        target = LOGO_ASSETS / f'{brand_id}.svg'
        target.write_bytes(data)
    else:
        # Raster logos: crop to the mark. A logo on a white backdrop (JPEG) gets its shape from
        # darkness, which keeps anti-aliased edges smooth.
        target = LOGO_ASSETS / f'{brand_id}.png'
        shape = ['-colorspace', 'gray', '-negate', '-level', '0%,60%', '-background', 'black', '-alpha', 'shape'] if cache.suffix == '.jpg' else []
        subprocess.run(['magick', str(cache), *shape, '-trim', '+repage', '-strip', str(target)], check=True)
    if target.suffix == '.svg': tighten_viewbox(target)
    size = subprocess.run(['magick', 'identify', '-format', '%w %h', str(target)], capture_output=True, text=True, check=True).stdout.split()
    # Width / height lets the storefront size every logo to a similar visual weight.
    return {'logo': '/brands/' + target.name, 'logoAspect': round(int(size[0]) / int(size[1]), 3)}


def save_cutout(product, name):
    """Hero packs: the product's front photo with its white background made transparent."""
    target = ASSETS / name
    corners = ['color 0,0 floodfill', 'color %[fx:w-1],0 floodfill', 'color 0,%[fx:h-1] floodfill', 'color %[fx:w-1],%[fx:h-1] floodfill']
    args = ['magick', str(raw_path(product['source']['imageUrls'][0])), '-alpha', 'set', '-fuzz', '8%', '-fill', 'none']
    for corner in corners: args += ['-draw', corner]
    subprocess.run(args + ['-trim', '+repage', '-resize', '900x900>', '-quality', '85', str(target)], check=True)
    return {'src': '/products/' + name, 'productId': product['id'], 'alt': product['title']}


def save_image(url, stem):
    """Download once, cap at 1000 px, store as WebP on a white square canvas."""
    if urlparse(url).hostname not in ('kapoormedicalhall.com', 'cdn.shopify.com', 'www.guardian.in'):
        raise ValueError('Unexpected image host: ' + url)
    target = ASSETS / (stem + '.webp')
    raw = raw_path(url)
    marker = CACHE / 'images' / (stem + '.from')
    if target.exists() and marker.exists() and marker.read_text() == url: return '/products/' + target.name
    if not raw.exists():
        payload, mime = fetch(url + ('&' if '?' in url else '?') + 'width=1000' if 'cdn.shopify.com' in url else url)
        if not mime.startswith('image/'): raise ValueError('Unexpected image type: ' + mime)
        raw.write_bytes(payload)
    subprocess.run(['magick', str(raw), '-resize', '1000x1000>', '-background', 'white', '-alpha', 'remove',
                    '-gravity', 'center', '-extent', '%[fx:max(w,h)]x%[fx:max(w,h)]', '-quality', '82', str(target)], check=True)
    marker.write_text(url)
    return '/products/' + target.name


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower().replace("'", '')).strip('-')


def file_name(url):
    return unquote(Path(urlparse(url).path).name)


def rating(product):
    count = int(product.get('review_count') or 0)
    value = float(product.get('average_rating') or 0)
    return {'value': value, 'count': count, 'scale': 5} if count > 0 and 0 < value <= 5 else None


def kapoor_product(source_id, default_size):
    base = SOURCES['kapoor']['base']
    p = cached_json(f'{base}/wp-json/wc/store/v1/products/{source_id}', f'kapoor-{source_id}.json')
    options = []
    if p['type'] == 'variable':
        for v in p['variations']:
            detail = cached_json(f'{base}/wp-json/wc/store/v1/products/{v["id"]}', f'kapoor-{v["id"]}.json')
            attrs = dict(part.split(': ', 1) for part in html.unescape(detail['variation']).split(', ') if ': ' in part)
            attrs = {k.lower(): v for k, v in attrs.items()}
            options.append((v['id'], attrs.get('size') or default_size, attrs.get('flavour') or attrs.get('flavor'), detail['prices'], detail['is_in_stock']))
    else:
        options.append((p['id'], default_size, None, p['prices'], p['is_in_stock']))
    variants = []
    for vid, size, flavor, prices, available in options:
        price, regular = int(prices['price']), int(prices['regular_price'] or 0)
        if prices.get('currency_minor_unit') != 2 or price <= 0: raise ValueError(f'Unexpected Kapoor price for {vid}')
        variants.append({'source': vid, 'size': size or 'Standard pack', 'flavor': flavor, 'price': price,
                         'compare': regular if regular > price else None, 'available': bool(available)})
    return {'url': p['permalink'], 'description': clean_description(p['description']),
            'images': [i['src'] for i in p['images']], 'variants': variants, 'rating': rating(p), 'sku': p.get('sku') or ''}


def guardian_feed():
    products, page = [], 1
    while True:
        data = cached_json(f'{SOURCES["guardian"]["base"]}/products.json?limit=250&page={page}', f'guardian-feed-{page}.json')
        if not data['products']: return {p['id']: p for p in products}
        products.extend(data['products'])
        page += 1


def guardian_product(p):
    names = [o['name'].lower() for o in p['options']]
    variants = []
    for v in p['variants']:
        values = {name: v.get(f'option{i + 1}') for i, name in enumerate(names)}
        if EXCLUDED_OPTION.search(v['title']): continue
        price = round(float(v['price']) * 100)
        compare = round(float(v['compare_at_price']) * 100) if v.get('compare_at_price') else None
        variants.append({'source': v['id'], 'size': values.get('size') or 'Standard pack', 'flavor': values.get('flavour') or values.get('flavor'),
                         'price': price, 'compare': compare if compare and compare > price else None, 'available': v['available'], 'sku': v.get('sku') or ''})
    # The feed's first images often show other pack sizes; prefer each option's own photo.
    images = []
    if p['id'] in IMAGE_PICKS:
        images = [next(i['src'] for i in p['images'] if file_name(i['src']).startswith(pick)) for pick in IMAGE_PICKS[p['id']]]
    for v in p['variants']:
        src = (v.get('featured_image') or {}).get('src')
        if src and src not in images and not EXCLUDED_OPTION.search(v['title']) and p['id'] not in IMAGE_PICKS: images.append(src)
    for image in p['images']:
        if not images: images.append(image['src'])
    url = f'{SOURCES["guardian"]["base"]}/products/{p["handle"]}'
    description = clean_description(p['body_html'])
    if len(description) < 200:
        description = scraped_description(url, f'guardian-{p["id"]}-extract.json') or description
    return {'url': url, 'description': description, 'images': [i.split('?')[0] for i in images], 'variants': variants, 'rating': None}


def build(entry, feed, captured_at):
    source, source_id, title, brand_id, category_id, featured, bestseller, default_size = entry
    raw = kapoor_product(source_id, default_size) if source == 'kapoor' else guardian_product(feed[source_id])
    brand = next(b for b in BRANDS if b['id'] == brand_id)
    handle = slug(brand['name'] + ' ' + title)
    variants = []
    for v in raw['variants']:
        variant = {'id': f'{handle}-{v["source"]}', 'SKU': v.get('sku', '') or '', 'size': v['size'], 'price': v['price'], 'available': v['available']}
        if v['flavor']: variant['flavor'] = v['flavor']
        if v['compare']: variant['compareAtPrice'] = v['compare']
        variants.append(variant)
    if not variants: raise ValueError('No variants for ' + handle)
    # Cards and product pages open on the lowest-price available option.
    variants.sort(key=lambda v: (not v['available'], v['price']))
    sources = [url for url in raw['images'] if file_name(url) not in EXCLUDED_IMAGES][:MAX_IMAGES]
    images = [save_image(url, f'{handle}-{i + 1}') for i, url in enumerate(sources)]
    if not images: raise ValueError('No images for ' + handle)
    product = {'id': handle, 'handle': handle, 'title': title, 'brandId': brand_id, 'categoryId': category_id,
               'description': raw['description'], 'images': images,
               'tags': [next(c['name'] for c in CATEGORIES if c['id'] == category_id), brand['name']],
               'basePrice': variants[0]['price'], 'currency': 'INR', 'featured': featured, 'bestseller': bestseller,
               'variants': variants, 'rating': raw['rating'],
               'source': {'name': SOURCES[source]['name'], 'url': raw['url'], 'capturedAt': captured_at,
                          'imageUrls': sources}}
    if 'compareAtPrice' in variants[0]: product['compareAtPrice'] = variants[0]['compareAtPrice']
    return product


if __name__ == '__main__':
    (CACHE / 'images').mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)
    if not shutil.which('magick'): raise SystemExit('ImageMagick (magick) is required')
    feed = guardian_feed()
    captured_at = datetime.datetime.fromtimestamp((CACHE / 'guardian-feed-1.json').stat().st_mtime, datetime.timezone.utc).isoformat()
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        products = list(pool.map(lambda e: build(e, feed, captured_at), SELECTION))
    if len({p['handle'] for p in products}) != len(products): raise ValueError('Duplicate handles')
    leaked = [p['handle'] for p in products if RETAILER_TEXT.search(p['title'] + p['description'])]
    if leaked: raise ValueError('Retailer text in: ' + ', '.join(leaked))
    by_handle = {p['handle']: p for p in products}
    hero = [save_cutout(by_handle[handle], f'hero-{i + 1}.webp') for i, handle in enumerate(HERO)]
    (CACHE / 'logos').mkdir(exist_ok=True)
    LOGO_ASSETS.mkdir(parents=True, exist_ok=True)
    brands = [{**b, **save_logo(b['id'])} for b in BRANDS]
    output = {'capturedAt': captured_at, 'sources': list(SOURCES.values()), 'categories': CATEGORIES, 'brands': brands, 'hero': hero, 'products': products}
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')
    used = {Path(image).name for p in products for image in p['images']} | {Path(h['src']).name for h in hero}
    for stale in ASSETS.glob('*.webp'):
        if stale.name not in used: stale.unlink()
    print(json.dumps({'products': len(products), 'variants': sum(len(p['variants']) for p in products),
                      'images': sum(len(p['images']) for p in products), 'rated': sum(p['rating'] is not None for p in products),
                      'shortDescriptions': [p['handle'] for p in products if len(p['description']) < 200]}))
