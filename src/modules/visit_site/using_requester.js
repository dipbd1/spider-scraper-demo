const Requester = require('./requester');

const CONFIG = {
    numberOfVisits: 15,             // Number of times to visit the site
    // targetUrl: 'https://www.fiverr.com/dipbd1/develop-a-responsive-wordpress-ecommerce-website-with-woocommerce-integration',
    targetUrl: 'https://www.kumodevs.com',
    minDelayBetweenVisits: 5000,    // Minimum delay between visits (ms)
    maxAdditionalDelay: 15000,      // Additional random delay (ms)
    showBrowser: true,              // Set to false for headless mode
    takeScreenshots: fa,           // Whether to capture screenshots
    ignoreHTTPSErrors : true
  };

  async function main() {
    const requester = new Requester();
    
    console.log(`Starting ${CONFIG.numberOfVisits} visits to ${CONFIG.targetUrl}`);
    
    // Visit sites multiple times with different proxies
    for (let i = 0; i < CONFIG.numberOfVisits; i++) {
      try {
        console.log(`\n[Visit ${i+1}/${CONFIG.numberOfVisits}] Starting...`);
        
        const result = await requester.visitSite(CONFIG.targetUrl, {
          headless: showBrowser ? false : true,
          screenshot: CONFIG.takeScreenshots,
          ignoreHTTPSErrors: CONFIG.ignoreHTTPSErrors
        });
        
        console.log(`[Visit ${i+1}/${CONFIG.numberOfVisits}] Completed successfully`);
        
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
    
    console.log(`\nAll ${CONFIG.numberOfVisits} visits completed.`);
  }
  
  main();