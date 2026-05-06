import { chromium } from 'playwright'

export async function fetchPage(url: string): Promise<string | null> {
  let browser: any = null

  try {
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 12000,
    })

    const text = await page.evaluate(() => {
      document.querySelectorAll(
        'nav, footer, header, script, style, noscript, iframe, .cookie-banner, #cookie-notice, [class*="cookie"], [id*="cookie"]'
      ).forEach(el => el.remove())

      return document.body?.innerText ?? ''
    })

    return text.slice(0, 6000).trim()
  } catch (err) {
    console.error(`fetchPage failed for ${url}:`, err)
    return null
  } finally {
    if (browser) await browser.close()
  }
}
