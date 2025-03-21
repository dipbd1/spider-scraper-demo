const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Function to scrape proxies from a common public proxy list
async function scrapeProxies() {
    try {
        console.log('Scraping proxies...');
        const response = await axios.get('https://free-proxy-list.net/');
        fs.writeFileSync('proxy_page.html', response.data);
        const $ = cheerio.load(response.data);

        const proxies = [];

        // Find the proxy table and extract data
        const table = $('.table.table-striped.table-bordered');

        table.find('tbody tr').each((index, element) => {
            const tds = $(element).find('td');

            const proxy = {
                ip: $(tds[0]).text(),
                port: parseInt($(tds[1]).text()),
                code: $(tds[2]).text(),
                country: $(tds[3]).text(),
                anonymity: $(tds[4]).text(),
                google: $(tds[5]).text() === 'yes',
                https: $(tds[6]).text() === 'yes',
                lastChecked: $(tds[7]).text()
            };

            proxies.push(proxy);
        });

        // Save to a file
        const jsonData = JSON.stringify(proxies, null, 2);
        const outputFilePath = path.join(process.cwd(), 'generated_files','scraped_proxies', 'proxies_free_proxy_list.json');
        const outputDir = path.dirname(outputFilePath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputFilePath, jsonData);
        console.log(`Successfully scraped ${proxies.length} proxies`);
        console.log('Saved to proxies.json');

        return proxies;
    } catch (error) {
        console.error('Error scraping proxies:', error.message);
        return [];
    }
}

// Main function to scrape and write them in file
async function main() {
    // Scrape proxies
    const proxies = await scrapeProxies();
}

// Run the script
main();