const puppeteer = require('puppeteer')
const fs = require('fs')

const year = 60 * 60 * 24 * 360

async function main(settingsPath) {
    const url = 'https://instagram.com'
    const browser = await puppeteer.launch({ headless: false })
    const settings = JSON.parse(
        fs.readFileSync(settingsPath, 'utf8').toString()
    )
    const page = await browser.newPage()
    await page.goto(url)
    const now = new Date().getTime() / 1000
    const cookies = Object.entries(settings.cookies)
        .map(([name, x]) => x)
        .map(({ expires, ...rest }) => ({...rest, expires: expires || now + year}))
    await page.setCookie(...cookies)
    await page.evaluate((year) => {
        localStorage.setItem('ig_notifications_dismiss', String(new Date().getTime() + year * 1000))
    }, year)
    const cookiesSet = await page.cookies(url)
    await page.reload({})
    // console.log(JSON.stringify(cookiesSet))
    // await browser.close()
}

main('/Users/morse/Documents/GitHub/instagram-funnel/bot_settings.json')
