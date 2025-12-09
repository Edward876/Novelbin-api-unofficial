const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

let browser;
let launchPromise;

async function startBrowser() {
    if (browser && browser.isConnected()) return browser;

    if (launchPromise) return launchPromise;

    launchPromise = (async () => {
        try {
            console.log('Launching browser...');
            const newBrowser = await puppeteer.launch({
                args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath() || process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome',
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });
            console.log('Browser launched');
            return newBrowser;
        } catch (error) {
            console.error('Failed to launch browser:', error);
            throw error;
        } finally {
            launchPromise = null;
        }
    })();

    browser = await launchPromise;
    return browser;
}

async function getPage() {
    if (!browser || !browser.isConnected()) {
        console.log('Browser not connected, restarting...');
        await closeBrowser();
        await startBrowser();
    }
    const page = await browser.newPage();
    
    // Block images and fonts to save bandwidth
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    // Set User Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    return page;
}

async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
    }
}

module.exports = {
    startBrowser,
    getPage,
    closeBrowser
};
