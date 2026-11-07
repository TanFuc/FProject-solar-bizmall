import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve('test-results');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const routes = [
  { name: 'gioi-thieu', path: '/gioi-thieu' },
  { name: 'giai-phap', path: '/giai-phap' },
  { name: 'san-pham', path: '/san-pham' },
  { name: 'du-an', path: '/du-an' },
  { name: 'tin-tuc', path: '/tin-tuc' },
  { name: 'lien-he', path: '/lien-he' },
];

async function capture() {
  console.log('Starting Playwright browser for Phase P3 Visual QA on all 6 pages...');
  const browser = await chromium.launch({ headless: true });

  try {
    for (const r of routes) {
      const url = `http://localhost:3000${r.path}`;
      console.log(`Processing ${r.name} (${url})...`);

      // 1. Desktop 1440x900
      const desktopCtx = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      });
      const desktopPage = await desktopCtx.newPage();
      await desktopPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await desktopPage.waitForTimeout(1500);
      const desktopScreenshotPath = path.join(OUTPUT_DIR, `${r.name}-desktop-1440.png`);
      await desktopPage.screenshot({ path: desktopScreenshotPath, fullPage: true });
      console.log(`  ✓ Desktop: ${desktopScreenshotPath}`);
      await desktopCtx.close();

      // 2. Mobile iPhone 390x844
      const mobileCtx = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      });
      const mobilePage = await mobileCtx.newPage();
      await mobilePage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await mobilePage.waitForTimeout(1500);
      const mobileScreenshotPath = path.join(OUTPUT_DIR, `${r.name}-mobile-390.png`);
      await mobilePage.screenshot({ path: mobileScreenshotPath, fullPage: true });
      console.log(`  ✓ Mobile: ${mobileScreenshotPath}`);
      await mobileCtx.close();
    }

    console.log('All 6 pages captured successfully in Desktop and Mobile viewports!');
  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});

