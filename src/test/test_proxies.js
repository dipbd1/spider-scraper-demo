const axios = require('axios');
const fs = require('fs');
const chalk = require('chalk');

async function testProxy(proxy) {
    try {
        console.log(`Testing proxy: ${proxy.ip}:${proxy.port}`);

        const response = await axios.get('https://api.ipify.org?format=json', {
            proxy: {
                host: proxy.ip,
                port: proxy.port,
                protocol: proxy.https ? 'https' : 'http'
            },
            timeout: 5000 // 5 second timeout
        });

        console.log(chalk.green(`Proxy working! Connected with IP: ${proxy.ip}:${proxy.port}`));
        return { ...proxy, working: true };
    } catch (error) {
        console.log(`Proxy failed: ${proxy.ip}:${proxy.port}`);
        return { ...proxy, working: false };
    }
}

async function main() {
    // Get proxies from file
    const proxies = JSON.parse(fs.readFileSync('proxies.json', 'utf8'));

    // Test all proxies concurrently
    console.log('\nTesting a few proxies:');
    const testResults = await Promise.all(proxies.map(proxy => testProxy(proxy)));

    // Filter out the working proxies
    const workingProxies = testResults.filter(result => result.working);

    // Write the working proxies to a separate file
    fs.writeFileSync('working_proxies.json', JSON.stringify(workingProxies, null, 2));
    console.log(chalk.blue(`Saved ${workingProxies.length} working proxies to working_proxies.json`));
}

main();