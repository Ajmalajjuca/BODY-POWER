import { chromium, expect } from '@playwright/test'

const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox'],
})
try {
  const page = await browser.newPage()
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('http://localhost:5174/shop')
    const button = page.locator('.product-card .card-add').first()
    await expect(button).toHaveText('Add to cart')
    const before = await button.boundingBox()
    await button.click()
    await expect(button).toHaveText('Add to cartAdded')
    const after = await button.boundingBox()
    expect(after.width).toBe(before.width)
    expect(after.height).toBe(before.height)
    await expect(button).toHaveAttribute('data-added', 'false', { timeout: 3000 })
    await expect(button).toHaveText('Add to cart')
    await button.click()
    await expect(button).toHaveAttribute('data-added', 'true')
    await expect(page.locator('dialog[open]')).toHaveCount(0)
    console.log(
      `PASS ${width}px: immediate feedback, stable dimensions, automatic reset, repeat add works`,
    )
  }
} finally {
  await browser.close()
}
