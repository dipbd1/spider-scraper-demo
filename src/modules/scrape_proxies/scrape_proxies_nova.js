const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeProxyNova() {
    try {
        console.log('Scraping proxies from ProxyNova...');
        const response = await axios.get('https://www.proxynova.com/proxy-server-list/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
            }
        });
        
        // Save raw HTML for debugging
        fs.writeFileSync('proxynova_page.html', response.data);
        const $ = cheerio.load(response.data);
        
        const proxies = [];
        
        // ProxyNova uses a different table structure and JavaScript to obfuscate IP addresses
        // Their table has id "tbl_proxy_list"
        const table = $('#tbl_proxy_list');
        
        table.find('tbody tr').each((index, element) => {
            try {
                // Skip rows that don't have proxy data (e.g., ad rows)
                const firstCell = $(element).find('td').first();
                if (firstCell.find('script').length) {
                    // ProxyNova obfuscates IP with JavaScript - get the script content
                    const scriptContent = firstCell.find('script').html();
                    console.log('Script content:', scriptContent);
                    
                    // Extract IP using regex (this is an approximation since the script might vary)
                    let ip = scriptContent;
                    
                    // Try to extract numbers and dots from the script
                    const matches = scriptContent.match(/document\.write\([^"]*"([^"]+)"\)/);
                    if (matches && matches[1]) {
                        ip = matches[1];
                    } else {
                        // If the above doesn't work, try another approach
                        // By converting the script to readable IP format
                        ip = firstCell.text().trim();
                    }
                    
                    // Extract other columns
                    const tds = $(element).find('td');
                    const portText = $(tds[1]).text().trim();
                    let port = parseInt(portText);
                    
                    // If port isn't directly available or parsed correctly
                    if (isNaN(port) && $(tds[1]).find('a').length) {
                        port = parseInt($(tds[1]).find('a').text().trim());
                    }
                    
                    // Skip if we couldn't parse IP or port
                    if (!ip || isNaN(port)) return;
                    
                    const proxy = {
                        ip: ip.replace(/[^\d\.]/g, ''), // Clean up the IP (remove non-digit/dot chars)
                        port: port,
                        code: $(tds[2]).find('abbr').attr('title') || '',
                        country: $(tds[2]).text().trim(),
                        anonymity: $(tds[4]).text().trim(),
                        https: $(tds[6]).text().trim().toLowerCase().includes('yes'),
                        speed: $(tds[3]).find('small').attr('title') || $(tds[3]).text().trim(),
                        lastChecked: $(tds[5]).text().trim()
                    };
                    
                    // Only add if we have a valid IP and port
                    if (proxy.ip.split('.').length === 4 && !isNaN(proxy.port)) {
                        proxies.push(proxy);
                    }
                }
            } catch (rowError) {
                // Skip problematic rows
                console.log(`Skipped a row due to error: ${rowError.message}`);
            }
        });
        
        // Save to a file
        const jsonData = JSON.stringify(proxies, null, 2);
        fs.writeFileSync('proxynova_proxies.json', jsonData);
        
        console.log(`Successfully scraped ${proxies.length} proxies from ProxyNova`);
        console.log('Saved to proxynova_proxies.json');
        
        return proxies;
    } catch (error) {
        console.error('Error scraping ProxyNova proxies:', error.message);
        return [];
    }
}

// Function to merge proxy lists from different sources without duplicates
async function mergeProxyLists(lists) {
    const ipMap = {};
    const mergedList = [];
    
    // Combine all lists
    for (const list of lists) {
        for (const proxy of list) {
            const key = `${proxy.ip}:${proxy.port}`;
            if (!ipMap[key]) {
                ipMap[key] = true;
                mergedList.push(proxy);
            }
        }
    }
    
    // Save combined list
    const jsonData = JSON.stringify(mergedList, null, 2);
    fs.writeFileSync('combined_proxies.json', jsonData);
    
    console.log(`Combined ${mergedList.length} unique proxies from all sources`);
    console.log('Saved to combined_proxies.json');
    
    return mergedList;
}

// Main function to scrape and write them in file
async function main() {
    // Scrape from different sources
    const proxyNovaList = await scrapeProxyNova();
    
    // You can add more sources and then combine them
    // For example:
    // const freeProxyList = await scrapeProxies(); // Your existing function
    // await mergeProxyLists([proxyNovaList, freeProxyList]);
}

// Run the script
main();