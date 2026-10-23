import { chromium, expect } from '@playwright/test'
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
  args: ['--no-sandbox'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
const base = process.env.DEMO_URL || 'http://localhost:5173'
try {
  await page.goto(base + '/shop')
  const card = page.locator('.product-card').first()
  await card.getByRole('button', { name: /Add .* to cart/ }).click()
  await expect(page.locator('dialog[open]')).toHaveCount(0)
  await expect(page.getByRole('status')).toContainText('Added to cart')
  const cartBefore = await page.evaluate(() => localStorage.getItem('bpn-cart-v1'))
  await card.getByRole('button', { name: /Buy .* now/ }).click()
  const picker = page.getByRole('dialog', { name: 'Choose your size & flavour' })
  if (await picker.count())
    await picker.getByRole('button', { name: 'Continue to summary' }).click()
  await expect(page).toHaveURL(/checkout\?product=/)
  await expect(page.getByText('Checkout preview', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('bpn-cart-v1'))).toBe(cartBefore)
  await page.getByRole('button', { name: 'Increase quantity' }).click()
  await expect(page).toHaveURL(/quantity=2/)
  await page.reload()
  await expect(page.locator('.quantity')).toContainText('2')
  await page.getByRole('button', { name: 'Add more items', exact: true }).click()
  await expect(page).toHaveURL(/shop$/)
  const lines = await page.evaluate(
    () => JSON.parse(localStorage.getItem('bpn-cart-v1')).state.lines,
  )
  expect(lines[0].quantity).toBe(3)
  await page.getByRole('button', { name: /Open cart/ }).click()
  await page.getByRole('dialog').getByRole('link', { name: 'Proceed to Pay' }).click()
  await expect(page).toHaveURL(base + '/checkout')
  await expect(page.locator('dialog[open]')).toHaveCount(0)
  await expect(page.locator('.cart-line')).toHaveCount(1)
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of ['/shop', '/checkout']) {
      await page.goto(base + route)
      await expect(page.locator('h1')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width + 1,
      )
    }
    await page.goto(base + '/shop')
    const buttons = page.locator('.product-card').first().locator('.purchase-actions button')
    for (const button of await buttons.all())
      expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: '/tmp/bpn-purchase-mobile.png' })
  await page.goto(base + '/checkout?product=bad&variant=bad&quantity=0')
  await expect(page.getByText('This selection is unavailable.')).toBeVisible()
  expect(errors).toEqual([])
  console.log(
    'PASS: add-to-cart stays browsing; Buy Now preserves cart; quantity survives refresh; add-more merges once; cart checkout works; invalid URL handled; 360/390/768/1440 widths and 44px actions; no browser errors.',
  )
} finally {
  await browser.close()
}
