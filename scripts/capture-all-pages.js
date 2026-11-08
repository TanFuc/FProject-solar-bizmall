const playwright = require('../frontend/node_modules/playwright');
const path = require('path');

const pages = [
  { slug: 'trang-chu', route: '/', file: 'homepage' },
  { slug: 'du-an', route: '/du-an', file: 'du-an' },
  { slug: 'giai-phap', route: '/giai-phap', file: 'giai-phap' },
  { slug: 'gioi-thieu', route: '/gioi-thieu', file: 'gioi-thieu' },
  { slug: 'san-pham', route: '/san-pham', file: 'san-pham' },
  { slug: 'tin-tuc', route: '/tin-tuc', file: 'tin-tuc' },
  { slug: 'lien-he', route: '/lien-he', file: 'lien-he' },
];

(async () => {
  const browser = await playwright.chromium.launch();

  for (const p of pages) {
    console.log(`Capturing ${p.file}...`);
    // Desktop 1440
    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await desktopPage.goto(`http://localhost:3000${p.route}`, { waitUntil: 'networkidle' });
    // Scroll down to trigger any lazy images
    await desktopPage.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 400;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            setTimeout(resolve, 300);
          }
        }, 50);
      });
    });
    await desktopPage.screenshot({
      path: path.join('test-results', `${p.file}-desktop-1440.png`),
      fullPage: true,
    });
    await desktopPage.close();

    // Mobile 390
    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    await mobilePage.goto(`http://localhost:3000${p.route}`, { waitUntil: 'networkidle' });
    await mobilePage.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 400;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            setTimeout(resolve, 300);
          }
        }, 50);
      });
    });
    await mobilePage.screenshot({
      path: path.join('test-results', `${p.file}-mobile-390.png`),
      fullPage: true,
    });
    await mobilePage.close();
  }

  await browser.close();
  console.log('Finished capturing all pages!');
})();

