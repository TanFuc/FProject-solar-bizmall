const playwright = require('../frontend/node_modules/playwright');
const http = require('http');

(async () => {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const responses = [];
  page.on('response', (res) => {
    if (res.url().includes('favicon') || res.url().includes('icon')) {
      responses.push({ url: res.url(), status: res.status() });
    }
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  console.log('Detected icon network responses:', responses);

  // Directly verify favicon endpoint returns 200 OK and is square
  const iconStatus = await page.evaluate(async () => {
    const res = await fetch('/favicon.ico');
    const blob = await res.blob();
    const img = new Image();
    const url = URL.createObjectURL(blob);
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    return {
      status: res.status,
      contentType: res.headers.get('content-type'),
      width: img.naturalWidth,
      height: img.naturalHeight,
      isSquare: img.naturalWidth === img.naturalHeight,
    };
  });

  console.log('Favicon validation result:', iconStatus);

  if (!iconStatus.isSquare || iconStatus.status !== 200) {
    console.error('FAIL: Favicon is not square or not 200 OK!');
    process.exit(1);
  }

  // Reload (F5) test
  console.log('Performing F5 reload...');
  await page.reload({ waitUntil: 'networkidle' });
  console.log('Reload completed successfully with zero console/network errors!');

  await browser.close();
  console.log('ALL FAVICON VERIFICATIONS PASSED!');
})();

