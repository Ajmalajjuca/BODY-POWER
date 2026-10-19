import { chromium, expect } from '@playwright/test'
import fs from 'node:fs'
const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.screenshot({ path: '/tmp/bpn-desktop.png', fullPage: true })
console.log('Home:', await page.title(), 'h1:', await page.locator('h1').innerText())
const overflow = []
for (const width of [360, 390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 })
  for (const route of [
    '/',
    '/shop',
    '/build-your-combo',
    '/products/optimum-nutrition-gold-standard-100-whey',
    '/collections/whey-protein',
    '/combos',
    '/brands',
    '/about',
  ]) {
    await page.goto('http://localhost:5173' + route)
    await page.locator('h1').first().waitFor()
    await page.waitForTimeout(80)
    const measure = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
    }))
    if (measure.scroll > width + 1) overflow.push({ route, ...measure })
  }
  console.log('Checked width', width)
}
await page.goto('http://localhost:5173/shop', { waitUntil: 'networkidle' })
await page.evaluate(async () => {
  for (const img of document.querySelectorAll('img')) {
    img.loading = 'eager'
    img.scrollIntoView()
    await img.decode().catch(() => {})
  }
})
const brokenImages = await page.evaluate(() =>
  [...document.querySelectorAll('img')].filter((i) => !i.naturalWidth).map((i) => i.src),
)
if (brokenImages.length) errors.push(`Broken images: ${brokenImages.join(', ')}`)
await page.setViewportSize({ width: 390, height: 844 })
await page.goto('http://localhost:5173/')
await page.screenshot({ path: '/tmp/bpn-mobile.png', fullPage: true })
await page.setViewportSize({ width: 1440, height: 1000 })
await page.goto('http://localhost:5173/')
await page.getByRole('button', { name: 'Open Design Studio', exact: false }).click()
await page.screenshot({ path: '/tmp/bpn-studio.png', fullPage: true })
console.log('Browser errors:', errors, 'Overflow:', overflow)
await page.getByRole('button', { name: 'Performance Bold energy.', exact: false }).click()
await page.getByRole('button', { name: 'Undo design change' }).click()
await page.getByRole('button', { name: 'Redo design change' }).click()
await page.getByRole('button', { name: 'versions', exact: true }).click()
await page.getByLabel('Name this direction').fill('Performance review')
await page.getByRole('button', { name: 'Save design version' }).click()
await expect(page.getByText('Performance review', { exact: true })).toBeVisible()
await page.reload()
await page.getByRole('button', { name: 'Open Design Studio', exact: false }).click()
await page.getByRole('button', { name: 'versions', exact: true }).click()
await expect(page.getByText('Performance review', { exact: true })).toBeVisible()
await page.getByRole('button', { name: 'Close Design Studio' }).click()
await page.goto('http://localhost:5173/products/optimum-nutrition-gold-standard-100-whey')
await page.getByRole('button', { name: 'Add to bag' }).click()
await expect(page.getByRole('dialog')).toBeVisible()
await page.keyboard.press('Escape')
await page.goto('http://localhost:5173/cart')
await expect(page.getByRole('heading', { name: 'Gold Standard 100% Whey' })).toBeVisible()
await page.reload()
await expect(page.getByRole('heading', { name: 'Gold Standard 100% Whey' })).toBeVisible()
await page.getByRole('button', { name: 'Remove Gold Standard 100% Whey' }).click()
await expect(page.getByText('Room for good things.')).toBeVisible()
console.log(
  'Workflows: studio presets, undo/redo, saved-version persistence, cart add/persistence/removal passed',
)
fs.writeFileSync('/tmp/bpn-browser-report.json', JSON.stringify({ errors, overflow }, null, 2))
await browser.close()
if (errors.length || overflow.length) process.exitCode = 1
