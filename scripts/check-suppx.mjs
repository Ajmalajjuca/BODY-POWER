import { chromium, expect } from '@playwright/test'
import fs from 'node:fs'

const catalog = JSON.parse(
  fs.readFileSync(new URL('../src/data/suppx-catalog.json', import.meta.url), 'utf8'),
)
const origin = 'http://localhost:5173'
const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
try {
  await page.goto(origin + '/collections/suppx-best-seller')
  await expect(page.locator('.product-card')).toHaveCount(58)
  await expect(page.getByText('58 thoughtfully selected products')).toBeVisible()
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      .toBe(true)
  }
  await page.screenshot({ path: '/tmp/bpn-suppx-collection.png', fullPage: true })
  for (const product of catalog.products) {
    await page.goto(origin + '/products/' + product.handle)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(product.title)
    await expect(page.locator('.detail-price > strong')).toHaveText(
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: product.basePrice % 100 ? 2 : 0,
      }).format(product.basePrice / 100),
    )
    await expect(page.locator('.detail-image img')).toBeVisible()
    await expect(page.locator('.detail-image img')).toHaveAttribute('src', product.images[0])
    await expect(page.getByRole('link', { name: 'View original listing' })).toHaveAttribute(
      'href',
      product.source.url,
    )
    if (product.rating)
      await expect(
        page
          .locator('.product-detail')
          .getByLabel(`${product.rating.value} out of 5, ${product.rating.count} reviews on SuppX`),
      ).toBeVisible()
    else
      await expect(page.locator('.product-detail').getByText('No reviews on SuppX')).toBeVisible()
    if (product.variants.every((v) => !v.available))
      await expect(page.getByRole('button', { name: 'Add to demo bag' })).toBeDisabled()
  }
  const images = catalog.products.flatMap((p) => p.images)
  const failures = await page.evaluate(async (images) => {
    const failed = []
    for (let i = 0; i < images.length; i += 8) {
      await Promise.all(
        images.slice(i, i + 8).map(
          (src) =>
            new Promise((resolve) => {
              const img = new Image()
              img.onload = () => {
                if (!img.naturalWidth) failed.push(src)
                resolve()
              }
              img.onerror = () => {
                failed.push(src)
                resolve()
              }
              img.src = src
            }),
        ),
      )
    }
    return failed
  }, images)
  expect(failures).toEqual([])
  const product = catalog.products[0]
  await page.goto(origin + '/products/' + product.handle)
  await page.getByRole('button', { name: 'View product image 4', exact: true }).click()
  await expect(page.locator('.detail-image img')).toHaveAttribute('src', product.images[3])
  await page.setViewportSize({ width: 390, height: 844 })
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
    .toBe(true)
  await page.screenshot({ path: '/tmp/bpn-suppx-detail-mobile.png', fullPage: true })
  await page.getByRole('button', { name: 'Add to demo bag' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('.cart-total strong')).toHaveText('₹4,499')
  await page.keyboard.press('Escape')
  await page.goto(origin + '/cart')
  await expect(page.getByRole('heading', { name: product.title, exact: true })).toBeVisible()
  await page.reload()
  await expect(page.locator('.cart-total strong')).toHaveText('₹4,499')
  expect(errors).toEqual([])
  console.log(
    JSON.stringify({
      products: catalog.products.length,
      imagesDecoded: images.length,
      widths: [360, 390, 768, 1024, 1440],
      errors,
      gallery: 'passed',
      cart: 'passed',
      ratings: 'passed',
    }),
  )
} finally {
  await browser.close()
}
