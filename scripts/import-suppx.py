"""Import the public SuppX best-seller collection. No credentials required.

The initial collection page is also captured separately with ScrapeGraphAI.
Shopify's public feed supplies lossless prices/options; product pages supply
product-specific Judge.me aggregates (never the store-wide rating).
"""
import concurrent.futures
import datetime
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import time
import urllib.request
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / '.just-scrape' / 'suppx'
ASSETS = ROOT / 'public' / 'products' / 'suppx'
COLLECTION = 'https://www.suppx.co.in/collections/suppx-best-seller'

class PlainText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.skip += 1
        if tag in ('p', 'div', 'li', 'br', 'h1', 'h2', 'h3', 'h4', 'tr'): self.parts.append('\n')
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.skip = max(0, self.skip - 1)
        if tag in ('td', 'th'): self.parts.append(' | ')
        if tag in ('p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'tr'): self.parts.append('\n')
    def handle_data(self, data):
        if not self.skip: self.parts.append(data)
    def text(self, markup):
        self.feed(markup)
        return '\n'.join(line for line in (' '.join(x.split()) for x in ''.join(self.parts).splitlines()) if line)

def fetch(url):
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; CatalogImport/1.0)'})
            with urllib.request.urlopen(req, timeout=45) as response:
                return response.read(), response.headers.get_content_type()
        except Exception:
            if attempt == 2: raise
            time.sleep(attempt + 1)

def cached(url, path):
    if path.exists(): return path.read_bytes()
    data, _ = fetch(url)
    path.write_bytes(data)
    return data

BRANDS = [
    ('belive', 'Belive', 'BLV'), ('unmatched', 'Unmatched', 'UM'),
    ('pvl', 'PVL', 'PVL'), ('applied-nutrition', 'Applied Nutrition', 'AN'),
    ('weider', 'Weider', 'W'), ('innova', 'Innova Pharma', 'IP'),
    ('raw', 'RAW Nutrition', 'RAW'), ('jacked-factory', 'Jacked Factory', 'JF'),
    ('diesel', 'Perfect Sports', 'PS'), ('dymatize', 'Dymatize', 'DYM'),
    ('gat', 'GAT Sport', 'GAT'), ('biotechusa', 'BioTechUSA', 'BIO'),
    ('bpi', 'BPI Sports', 'BPI'), ('enhanced', 'Enhanced Labs', 'EL'),
    ('evogen', 'Evogen', 'EV'), ('hyde', 'ProSupps', 'PRO'),
    ('prosupps', 'ProSupps', 'PRO'), ('lipo-6', 'Nutrex', 'NX'),
    ('muscletech', 'MuscleTech', 'MT'), ('myprotein', 'Myprotein', 'MP'),
    ('ronnie-coleman', 'Ronnie Coleman', 'RC'), ('rule-1', 'Rule 1', 'R1'),
]

def brand_for(p):
    for prefix, name, short in BRANDS:
        if p['handle'].startswith(prefix):
            existing = {'dymatize': 'dym', 'muscletech': 'mt', 'hyde': 'prosupps', 'diesel': 'perfect-sports'}
            return {'id': existing.get(prefix, prefix), 'name': name, 'short': short, 'color': '#800020'}
    return {'id': 'suppx', 'name': 'SuppX', 'short': 'SX', 'color': '#800020'}

def category_for(p):
    title = p['title'].lower()
    if any(x in title for x in ('combo', 'stack')): return 'c11'
    if any(x in title for x in ('mass gainer', 'huge gainz', 'gain supreme')): return 'c4'
    if 'collagen' in title: return 'c14'
    if any(x in title for x in ('whey', 'protein', 'isoject', 'iso 100', 'iso hd')): return 'c1'
    if 'creatine' in title: return 'c2'
    if any(x in title for x in ('preworkout', 'pre-workout', 'citrulline', 'beta alanine', 'beta-alanine')): return 'c3'
    if 'amino' in title: return 'c5'
    if any(x in title for x in ('fat burn', 'fat loss', 'carnitine', 'carnigen', 'l-carnix', 'meta cut')): return 'c12'
    if any(x in title for x in ('anabol', 'pepti', 'genesis', 'ecdysterone', 'muscle build', 'performance booster', 'testesterone')): return 'c13'
    if 'vitamin' in title: return 'c7'
    return 'c9'

def rating_for(page, product_id):
    pattern = r'jdgm\.data\.reviewWidget\[' + str(product_id) + r'\]\s*=\s*'
    match = re.search(pattern, page)
    if match:
        value, _ = json.JSONDecoder().raw_decode(page[match.end():])
        count = int(value.get('number_of_reviews', 0))
        rating = float(value.get('average_rating', 0))
        return ({'value': rating, 'count': count, 'scale': 5} if count > 0 and 0 < rating <= 5 else None), count
    return None, None

def import_product(p):
    url = 'https://www.suppx.co.in/products/' + p['handle']
    page = cached(url, CACHE / (p['handle'] + '.html')).decode('utf-8')
    rating, review_count = rating_for(page, p['id'])
    images = []
    for index, image in enumerate(p['images']):
        source = image['src']
        if urlparse(source).hostname not in ('cdn.shopify.com', 'www.suppx.co.in'):
            raise ValueError('Unexpected image host')
        stem = str(p['id']) + '-' + str(index + 1)
        matches = list(ASSETS.glob(stem + '.*'))
        if matches:
            path = matches[0]
        else:
            parsed = urlparse(source)
            query = dict(parse_qsl(parsed.query)); query['width'] = '1000'
            payload, mime = fetch(urlunparse(parsed._replace(query=urlencode(query))))
            extension = {'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/avif': '.avif'}.get(mime)
            if not extension: raise ValueError('Unexpected image type: ' + mime)
            path = ASSETS / (stem + extension)
            path.write_bytes(payload)
        if path.suffix != '.webp':
            optimized = ASSETS / (stem + '.webp')
            subprocess.run(['cwebp', '-quiet', '-q', '82', str(path), '-o', str(optimized)], check=True)
            path.replace(CACHE / path.name)
            path = optimized
        images.append('/products/suppx/' + path.name)
    variants = []
    for v in p['variants']:
        options = {o['name'].lower(): v.get('option' + str(o['position'])) for o in p['options']}
        flavor = options.get('flavor') or options.get('flavour')
        size = options.get('size') or options.get('weight')
        if not size:
            size = v['title'] if not flavor and v['title'] != 'Default Title' else 'Standard pack'
        # Shipping weight is not a package size: never infer size from grams.
        price = round(float(v['price']) * 100)
        compare = round(float(v['compare_at_price']) * 100) if v.get('compare_at_price') else None
        variant = {'id': 'suppx-v' + str(v['id']), 'SKU': v.get('sku') or '', 'size': size, 'price': price, 'available': v['available']}
        if flavor: variant['flavor'] = flavor
        if compare and compare > price: variant['compareAtPrice'] = compare
        variants.append(variant)
    # Cards and product detail open on the lowest-price available option.
    variants.sort(key=lambda v: (not v['available'], v['price']))
    brand = brand_for(p)
    product = {'id': 'suppx-' + str(p['id']), 'handle': p['handle'], 'title': p['title'], 'brandId': brand['id'], 'categoryId': category_for(p), 'description': PlainText().text(p['body_html']), 'images': images, 'tags': p['tags'], 'basePrice': variants[0]['price'], 'currency': 'INR', 'featured': True, 'bestseller': True, 'variants': variants, 'source': {'name': 'SuppX', 'url': url, 'collection': COLLECTION, 'capturedAt': CAPTURED_AT, 'imageUrls': [i['src'] for i in p['images']], 'reviewCount': review_count}, 'rating': rating}
    if 'compareAtPrice' in variants[0]: product['compareAtPrice'] = variants[0]['compareAtPrice']
    return product, brand

if __name__ == '__main__':
    CACHE.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)
    source = []
    page_number = 1
    while True:
        data = json.loads(cached(COLLECTION + '/products.json?limit=250&page=' + str(page_number), CACHE / ('feed-' + str(page_number) + '.json')))
        if not data['products']: break
        source.extend(data['products'])
        page_number += 1
    if len({p['id'] for p in source}) != len(source): raise ValueError('Duplicate product IDs in source pagination')
    CAPTURED_AT = datetime.datetime.fromtimestamp((CACHE / 'feed-1.json').stat().st_mtime, datetime.timezone.utc).isoformat()
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(import_product, source))
    products = [r[0] for r in results]
    brands = list({r[1]['id']: r[1] for r in results}.values())
    output = {'collection': COLLECTION, 'capturedAt': CAPTURED_AT, 'products': products, 'brands': brands}
    (ROOT / 'src' / 'data' / 'suppx-catalog.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'products': len(products), 'variants': sum(len(p['variants']) for p in products), 'images': sum(len(p['images']) for p in products), 'ratedProducts': sum(p['rating'] is not None for p in products), 'noReviews': sum(p['source']['reviewCount'] == 0 for p in products), 'unknownRatings': sum(p['source']['reviewCount'] is None for p in products)}))
