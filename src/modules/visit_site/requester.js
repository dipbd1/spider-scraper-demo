const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class Requester {
    constructor() {
        this.proxyList = [];
        // this.loadProxies();
        // this.loadProxisFromPath();
        this.userAgents = [
            // Windows - Chrome (various versions)
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.112 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.185 Safari/537.36',
            'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',

            // Windows - Firefox
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
            'Mozilla/5.0 (Windows NT 11.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',

            // Windows - Edge
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.2420.65',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.112 Safari/537.36 Edg/122.0.2365.92',
            'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.2420.65',

            // macOS - Safari
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_16_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',

            // macOS - Chrome
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_16_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',

            // macOS - Firefox
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.16; rv:125.0) Gecko/20100101 Firefox/125.0',

            // Linux - Chrome
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.112 Safari/537.36',

            // Linux - Firefox
            'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',

            // iPhone - Safari
            'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',

            // iPad - Safari
            'Mozilla/5.0 (iPad; CPU OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (iPad; CPU OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',

            // Android - Chrome
            'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
            'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.112 Mobile Safari/537.36',
            'Mozilla/5.0 (Linux; Android 14; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',

            // Android - Firefox
            'Mozilla/5.0 (Android 14; Mobile; rv:125.0) Gecko/125.0 Firefox/125.0',
            'Mozilla/5.0 (Android 13; Mobile; rv:124.0) Gecko/124.0 Firefox/124.0'
        ];
    }

    loadProxies() {
        try {
            const proxyFile = path.join(__dirname, '..', 'scrape_working_proxies', 'working_proxies.json');
            this.proxyList = JSON.parse(fs.readFileSync(proxyFile, 'utf8'));
            console.log(`Loaded ${this.proxyList.length} proxies`);
        } catch (error) {
            console.error('Error loading proxies:', error);
            this.proxyList = [];
        }
    }

    loadProxisFromPath(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            this.proxyList = lines.map(line => {
                const [ip, portStr] = line.split(':');
                return {
                    ip,
                    port: parseInt(portStr, 10)
                };
            });
            console.log(`Loaded ${this.proxyList.length} proxies`);
        } catch (error) {
            console.error('Error loading proxies:', error);
            this.proxyList = [];
        }
    }


    getProxies() {
        return this.proxyList;
    }

    getRandomProxy() {
        if (this.proxyList.length === 0) {
            console.warn('No proxies available');
            return null;
        }
        return this.proxyList[Math.floor(Math.random() * this.proxyList.length)];
    }

    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async randomDelay(min, max) {
        const delay = this.getRandomInt(min, max);
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    async simulateHumanBehavior(page) {
        // Randomize viewport size (simulate different screen sizes)
        await page.setViewportSize({
            width: this.getRandomInt(1024, 1920),
            height: this.getRandomInt(768, 1080)
        });

        // Perform random scrolling
        const scrollCount = this.getRandomInt(3, 8);
        for (let i = 0; i < scrollCount; i++) {
            // Random scroll amount
            const scrollAmount = this.getRandomInt(100, 800);
            await page.evaluate(amount => {
                window.scrollBy(0, amount);
            }, scrollAmount);

            // Random delay between scrolls (500ms - 3000ms)
            await this.randomDelay(500, 3000);
        }

        // Random mouse movements
        const moveCount = this.getRandomInt(5, 15);
        for (let i = 0; i < moveCount; i++) {
            await page.mouse.move(
                this.getRandomInt(0, page.viewportSize().width),
                this.getRandomInt(0, page.viewportSize().height),
                { steps: this.getRandomInt(5, 15) } // Smooth movement with steps
            );
            await this.randomDelay(200, 1000);
        }

        // Sometimes click on a random link
        if (Math.random() > 0.6) {
            const links = await page.$$('a');
            if (links.length > 0) {
                const randomLink = links[Math.floor(Math.random() * links.length)];
                // Make sure link is in viewport
                await randomLink.scrollIntoViewIfNeeded();
                await this.randomDelay(500, 1500);
                await randomLink.click();
                await page.waitForLoadState('networkidle');
                await this.randomDelay(2000, 5000);
                await page.goBack();
            }
        }
    }

    async visitSite(url, options = {}) {
        const proxy = this.getRandomProxy();
        if (!proxy) {
            throw new Error('No proxy available');
        }

        const userAgent = this.getRandomUserAgent();
        const browser = await chromium.launch({
            headless: options.headless ? true : false,
            proxy: {
                server: `http://${proxy.ip}:${proxy.port}`
            }
        });

        console.log(`Using proxy: ${proxy.ip}:${proxy.port}`);
        console.log(`Using user agent: ${userAgent}`);

        try {
            // Create context with random fingerprint properties
            const context = await browser.newContext({
                userAgent,
                viewport: {
                    width: this.getRandomInt(1024, 1920),
                    height: this.getRandomInt(768, 1080)
                },
                deviceScaleFactor: Math.random() > 0.5 ? 1 : 2,
                hasTouch: Math.random() > 0.9,
                locale: ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES'][Math.floor(Math.random() * 5)],
                timezoneId: ['America/New_York', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo'][Math.floor(Math.random() * 4)],
                permissions: ['geolocation'],
                ignoreHTTPSErrors: options.ignoreHTTPSErrors || false
                // Can add more fingerprint properties here
            });

            // Randomize browser fingerprint
            await context.addInitScript(() => {
                // Override navigator properties
                const originalGetProperty = Object.getOwnPropertyDescriptor(Navigator.prototype, 'userAgent').get;
                Object.defineProperties(Navigator.prototype, {
                    'webdriver': {
                        get: () => undefined
                    },
                    'platform': {
                        get: () => ['Win32', 'MacIntel', 'Linux x86_64'][Math.floor(Math.random() * 3)]
                    },
                    'hardwareConcurrency': {
                        get: () => Math.floor(Math.random() * 8) + 2
                    },
                    'deviceMemory': {
                        get: () => [2, 4, 8, 16][Math.floor(Math.random() * 4)]
                    }
                });

                // Add noise to canvas fingerprinting
                const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
                HTMLCanvasElement.prototype.toDataURL = function (type) {
                    const result = originalToDataURL.call(this, type);
                    if (Math.random() < 0.1) {
                        const randomPixel = Math.floor(Math.random() * 10);
                        return result.substring(0, result.length - randomPixel) +
                            result.substring(result.length - randomPixel).split('').reverse().join('');
                    }
                    return result;
                };
            });

            // Open page
            const page = await context.newPage();
            await page.goto(url, { waitUntil: 'networkidle' });
            console.log(`Successfully loaded: ${url}`);

            // Simulate human behavior
            await this.simulateHumanBehavior(page);

            // Stay on page for random time (5-20 seconds)
            const visitDuration = this.getRandomInt(5000, 20000);
            await this.randomDelay(visitDuration, visitDuration);

            // Capture screenshot if needed
            if (options.screenshot) {
                await page.screenshot({ path: `screenshot-${Date.now()}.png` });
            }

            // Return page content or other data
            const content = await page.content();

            // Close browser with all contexts
            await browser.close();

            return {
                success: true,
                content,
                proxy: proxy,
                userAgent
            };
        } catch (error) {
            await browser.close();
            throw error;
        }
    }
}

module.exports = Requester;