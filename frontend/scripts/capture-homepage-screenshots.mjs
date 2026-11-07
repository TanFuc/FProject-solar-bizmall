import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve('test-results');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  console.log('Starting Playwright browser for Visual QA...');
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop 1440x900
    console.log('Capturing Desktop (1440x900)...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await desktopPage.waitForTimeout(2000); // allow transitions and image hydration
    const desktopPath = path.join(OUTPUT_DIR, 'homepage-desktop-1440.png');
    await desktopPage.screenshot({ path: desktopPath, fullPage: true });
    console.log(`Saved desktop screenshot to ${desktopPath}`);
    await desktopContext.close();

    // 2. Mobile iPhone 390x844
    console.log('Capturing Mobile (390x844)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await mobilePage.waitForTimeout(2000);
    const mobilePath = path.join(OUTPUT_DIR, 'homepage-mobile-390.png');
    await mobilePage.screenshot({ path: mobilePath, fullPage: true });
    console.log(`Saved mobile screenshot to ${mobilePath}`);
    await mobileContext.close();

    // 3. Mobile Compact 360x800
    console.log('Capturing Mobile Compact (360x800)...');
    const compactContext = await browser.newContext({
      viewport: { width: 360, height: 800 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
    const compactPage = await compactContext.newPage();
    await compactPage.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await compactPage.waitForTimeout(2000);
    const compactPath = path.join(OUTPUT_DIR, 'homepage-mobile-360.png');
    await compactPage.screenshot({ path: compactPath, fullPage: true });
    console.log(`Saved mobile compact screenshot to ${compactPath}`);
    await compactContext.close();

    console.log('All Homepage Visual QA screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Visual QA capture error:', err);
  process.exit(1);
});
