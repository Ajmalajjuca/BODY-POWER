import { chromium, expect } from '@playwright/test'
const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const page = await browser.newPage()
try {
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({width,height:1000})
    await page.goto('http://localhost:5174/shop')
    await page.locator('.product-card').first().waitFor()
    const cards = await page.locator('.product-card').evaluateAll(nodes => nodes.map(node => {
      const box=node.getBoundingClientRect(), price=node.querySelector('.product-bottom strong').getBoundingClientRect(), action=node.querySelector('.purchase-actions').getBoundingClientRect()
      return {top:box.top,price:price.top,action:action.top}
    }))
    const rows=new Map()
    for(const card of cards) { const key=Math.round(card.top); rows.set(key,[...(rows.get(key) || []),card]) }
    for(const row of rows.values()) {
      expect(Math.max(...row.map(c=>c.price))-Math.min(...row.map(c=>c.price))).toBeLessThan(2)
      expect(Math.max(...row.map(c=>c.action))-Math.min(...row.map(c=>c.action))).toBeLessThan(2)
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    if(width===1440) {await page.locator('.product-card').nth(4).scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/bpn-cards-desktop.png'})}
    if(width===390) {await page.locator('.product-card').first().scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/bpn-cards-mobile.png'})}
    console.log(`PASS ${width}px: all rows align prices and actions; no overflow`)
  }
} finally {await browser.close()}
