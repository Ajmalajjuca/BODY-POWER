// Browser matrix for page versions: every page × V1–V3 × five widths, plus URL and nav checks.
// Usage: node scripts/versions-check.mjs [--page <key>] [--versions 1,2,3] [--extra] [--nav]
// Needs the dev server on http://localhost:5173 and Chrome at /usr/bin/google-chrome.
import { chromium } from '@playwright/test'

const BASE = 'http://localhost:5173'
const args = process.argv.slice(2)
const arg = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)
const only = arg('--page')
const versions = (arg('--versions') ?? '1,2,3').split(',').map(Number)
const widths = [360, 390, 768, 1024, 1440]
const routes = {
  home: '/',
  shop: '/shop',
  product: '/products/optimum-nutrition-gold-standard-100-whey',
  brands: '/brands',
  combos: '/combos',
  build: '/build-your-combo',
  cart: '/cart',
  about: '/about',
  contact: '/contact',
  faq: '/faq',
}
// Extra states each page must render in every version (empty states, missing records).
const states = {
  shop: [{ route: '/shop?q=zzzz', expect: 'button:has-text("Reset filters")' }],
  product: [{ route: '/products/nope', expect: 'text=Product not found' }],
  cart: [{ route: '/cart', empty: true, expect: 'text=Room for good things.' }],
}
const failures = []
const fail = (msg) => failures.push(msg)
const withV = (route, v) => `${BASE}${route}${route.includes('?') ? '&' : '?'}v=${v}`

const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox'],
})

async function freshPage(width = 1440) {
  const context = await browser.newContext({ viewport: { width, height: 900 } })
  const page = await context.newPage()
  page.setDefaultTimeout(5000)
  page.errors = []
  page.on('pageerror', (e) => page.errors.push(e.message))
  return page
}
async function settle(page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(async () => {
    for (const img of document.querySelectorAll('img')) {
      img.loading = 'eager'
      await img.decode().catch(() => {})
    }
  })
}
async function audit(page, label, width) {
  const report = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    broken: [...document.querySelectorAll('img')]
      .filter((i) => i.complete && !i.naturalWidth)
      .map((i) => i.src),
  }))
  if (report.scroll > width + 1) fail(`${label}: horizontal overflow (${report.scroll}px)`)
  if (report.broken.length) fail(`${label}: broken images ${report.broken.join(', ')}`)
  if (page.errors.length) fail(`${label}: page errors ${page.errors.join(' | ')}`)
  page.errors.length = 0
}
async function addToBag(page) {
  await page.goto(`${BASE}${routes.product}`)
  await page.getByRole('button', { name: 'Add to bag' }).click()
  await page.keyboard.press('Escape')
}

// Matrix
for (const [key, route] of Object.entries(routes)) {
  if (only && only !== key) continue
  for (const width of widths) {
    const page = await freshPage(width)
    if (key === 'cart') await addToBag(page)
    for (const v of versions) {
      const label = `${key} V${v} @${width}`
      await page.goto(withV(route, v))
      await settle(page)
      if (!(await page.locator(`.page-frame.version-${v}`).count()))
        fail(`${label}: page frame is not version-${v}`)
      if (!(await page.locator(`[data-layout="${key}-v${v}"]`).count()))
        fail(`${label}: missing [data-layout="${key}-v${v}"]`)
      await audit(page, label, width)
      for (const state of states[key] ?? []) {
        if (state.empty) await page.evaluate(() => localStorage.removeItem('bpn-cart-v1'))
        await page.goto(withV(state.route, v))
        await settle(page)
        if (
          !(await page
            .locator(state.expect)
            .first()
            .isVisible()
            .catch(() => false))
        )
          fail(`${label}: ${state.route} should show ${state.expect}`)
        await audit(page, `${label} ${state.route}`, width)
        if (state.empty) await addToBag(page)
      }
    }
    await page.context().close()
  }
  console.log(`checked ${key}`)
}

if (args.includes('--extra')) {
  const page = await freshPage()
  await page.goto(`${BASE}/shop?q=whey&v=3`)
  await settle(page)
  const url = new URL(page.url())
  if (url.searchParams.get('q') !== 'whey' || url.searchParams.has('v'))
    fail(`?v= override should keep q and drop v, got ${url.search}`)
  if (!(await page.locator('.page-frame.version-3').count())) fail('/shop?v=3 should render V3')
  await page.goto(`${BASE}/cart`)
  await settle(page)
  if (!(await page.locator('.page-frame.version-1').count()))
    fail('choosing Shop V3 must not change Cart')
  const fresh = await freshPage()
  await fresh.goto(`${BASE}/shop?v=abc`)
  await settle(fresh)
  if (new URL(fresh.url()).search !== '')
    fail(`/shop?v=abc should end at /shop, got ${fresh.url()}`)
  if (!(await fresh.locator('.page-frame.version-1').count())) fail('/shop?v=abc should stay V1')
  console.log('checked extra')
}

if (args.includes('--nav')) {
  const step = async (label, fn) => {
    try {
      await fn()
    } catch (e) {
      fail(`nav: ${label}: ${e.message.split('\n')[0]}`)
    }
  }
  const page = await freshPage()
  await page.goto(`${BASE}/`)
  await settle(page)
  const shopMenu = page.getByRole('menu', { name: 'Shop versions' })
  await step('hover opens Shop menu with V1 checked', async () => {
    await page.getByRole('button', { name: 'Shop versions' }).hover()
    await shopMenu.waitFor({ timeout: 3000 })
    const items = shopMenu.getByRole('menuitemradio')
    if ((await items.count()) !== 3) throw new Error(`expected 3 items, got ${await items.count()}`)
    if ((await items.nth(0).getAttribute('aria-checked')) !== 'true')
      throw new Error('V1 not checked')
  })
  await step('choosing V2 opens Shop V2 and remembers it', async () => {
    await shopMenu.getByRole('menuitemradio', { name: 'V2 · Editorial' }).click()
    await page.waitForURL(`${BASE}/shop`)
    await page.locator('.page-frame.version-2').waitFor({ timeout: 3000 })
    await page.reload()
    await page.locator('.page-frame.version-2').waitFor({ timeout: 3000 })
  })
  await step('other pages keep their own version', async () => {
    await page.goto(`${BASE}/cart`)
    await page.locator('.page-frame.version-1').waitFor({ timeout: 3000 })
  })
  await step('keyboard: Enter opens, arrows move, Escape closes to trigger', async () => {
    const trigger = page.getByRole('button', { name: 'Combos versions' })
    await trigger.focus()
    await page.keyboard.press('Enter')
    const menu = page.getByRole('menu', { name: 'Combos versions' })
    await menu.waitFor({ timeout: 3000 })
    const focused = () => page.evaluate(() => document.activeElement?.textContent?.trim())
    if (!(await focused())?.startsWith('V1')) throw new Error(`focus on ${await focused()}`)
    await page.keyboard.press('ArrowDown')
    if (!(await focused())?.startsWith('V2'))
      throw new Error(`ArrowDown focus on ${await focused()}`)
    await page.keyboard.press('Escape')
    await menu.waitFor({ state: 'hidden', timeout: 3000 })
    if (!(await trigger.evaluate((el) => el === document.activeElement)))
      throw new Error('focus did not return to trigger')
  })
  const mobile = await freshPage(390)
  await mobile.goto(`${BASE}/`)
  await settle(mobile)
  await step('mobile: tapping a page expands its versions without navigating', async () => {
    await mobile.getByRole('button', { name: 'Open navigation' }).click()
    await mobile.getByRole('button', { name: 'Combos versions' }).click()
    await mobile.getByRole('menu', { name: 'Combos versions' }).waitFor({ timeout: 3000 })
    if (new URL(mobile.url()).pathname !== '/') throw new Error(`navigated to ${mobile.url()}`)
  })
  console.log('checked nav')
}

await browser.close()
console.log(failures.length ? `FAILED (${failures.length})\n${failures.join('\n')}` : 'PASSED')
process.exitCode = failures.length ? 1 : 0
