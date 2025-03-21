
const path = require('path');
const VisitRequester = require('./src/modules/visit_site/requester');
const visitRequester = new VisitRequester();


const CONFIG = {
    numberOfVisits: 15,             // Number of times to visit the site
    // targetUrl: 'https://www.fiverr.com/dipbd1/develop-a-responsive-wordpress-ecommerce-website-with-woocommerce-integration',
    targetUrl: 'https://www.kumodevs.com',
    minDelayBetweenVisits: 5000,    // Minimum delay between visits (ms)
    maxAdditionalDelay: 15000,      // Additional random delay (ms)
    showBrowser: true,              // Set to false for headless mode
    takeScreenshots: true,           // Whether to capture screenshots
    ignoreHTTPSErrors : true
  };

const loadFromLocalProxiesAndVisit = async () =>{

    const localFilePath = path.join(process.cwd(), 'proxies.txt');
    visitRequester.loadProxisFromPath(localFilePath);

    for (let i = 0; i < CONFIG.numberOfVisits; i++) {
        try {
          console.log(`\n[Visit ${i+1}/${CONFIG.numberOfVisits}] Starting...`);
          
          const result = await visitRequester.visitSite(CONFIG.targetUrl, {
            headless: !CONFIG.showBrowser,
            screenshot: CONFIG.takeScreenshots
          });
          
          console.log(`[Visit ${i+1}/${CONFIG.numberOfVisits}] Completed successfully`);
          console.log('Result:', result);
          
          // Skip waiting after the last visit
          if (i < CONFIG.numberOfVisits - 1) {
            const waitTime = CONFIG.minDelayBetweenVisits + Math.random() * CONFIG.maxAdditionalDelay;
            const waitSeconds = Math.round(waitTime / 1000);
            console.log(`Waiting ~${waitSeconds} seconds before next visit...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        } catch (error) {
          console.error(`[Visit ${i+1}/${CONFIG.numberOfVisits}] Failed:`, error.message);
          // Continue with next visit despite errors
        }
      }
}

loadFromLocalProxiesAndVisit();