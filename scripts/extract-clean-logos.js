const playwright = require('../frontend/node_modules/playwright');
const fs = require('fs');

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  // 1. Header Logo from BM_SOLAR_du-an_desktop.png (Header is white #FFFFFF)
  const refDesktop = fs.readFileSync('frontend/BM_SOLAR_NextJS_Visual_Agent_Prompts_V3/BM_SOLAR_Full_Page_Designs/BM_SOLAR_du-an_desktop.png').toString('base64');
  await page.setContent(`<body style="margin:0;"><img id="ref" src="data:image/png;base64,${refDesktop}" style="width:1440px;" /></body>`);

  const headerLogoData = await page.evaluate(() => {
    const img = document.getElementById('ref');
    const canvas = document.createElement('canvas');
    // Crop region for header logo: around x: 74, y: 40, width: 180, height: 50
    // Let's find exact bounds first
    const testCanvas = document.createElement('canvas');
    testCanvas.width = 250;
    testCanvas.height = 70;
    const tctx = testCanvas.getContext('2d');
    tctx.drawImage(img, 65, 35, 250, 70, 0, 0, 250, 70);
    const imgData = tctx.getImageData(0, 0, 250, 70);
    const d = imgData.data;

    let minX = 250, maxX = 0, minY = 70, maxY = 0;
    for (let y = 0; y < 70; y++) {
      for (let x = 0; x < 250; x++) {
        const i = (y * 250 + x) * 4;
        const r = d[i], g = d[i+1], b = d[i+2];
        if (r < 240 || g < 240 || b < 240) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Now make transparent canvas with exact bounds + 2px padding
    const pad = 2;
    const finalW = maxX - minX + 1 + pad * 2;
    const finalH = maxY - minY + 1 + pad * 2;
    canvas.width = finalW;
    canvas.height = finalH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(testCanvas, minX, minY, maxX - minX + 1, maxY - minY + 1, pad, pad, maxX - minX + 1, maxY - minY + 1);

    const outData = ctx.getImageData(0, 0, finalW, finalH);
    const od = outData.data;
    // Anti-aliased white knockout
    for (let i = 0; i < od.length; i += 4) {
      const r = od[i], g = od[i+1], b = od[i+2];
      // Luminance
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum >= 250) {
        od[i+3] = 0; // 100% transparent
      } else if (lum >= 235) {
        const alphaFraction = (250 - lum) / 15;
        od[i+3] = Math.round(255 * alphaFraction);
      }
    }
    ctx.putImageData(outData, 0, 0);
    return { dataUrl: canvas.toDataURL('image/png'), bounds: { minX, maxX, minY, maxY, finalW, finalH } };
  });

  console.log('Header logo bounds:', headerLogoData.bounds);
  const base64Header = headerLogoData.dataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('frontend/public/images/logo.png', Buffer.from(base64Header, 'base64'));
  fs.writeFileSync('frontend/public/images/logo-header.png', Buffer.from(base64Header, 'base64'));

  // 2. Footer Logo from ref-footer-full.png
  const refFooter = fs.readFileSync('test-results/ref-footer-full.png').toString('base64');
  await page.setContent(`<body style="margin:0;"><img id="footerRef" src="data:image/png;base64,${refFooter}" style="width:1440px;" /></body>`);

  const footerLogoData = await page.evaluate(() => {
    const img = document.getElementById('footerRef');
    const testCanvas = document.createElement('canvas');
    testCanvas.width = 250;
    testCanvas.height = 70;
    const tctx = testCanvas.getContext('2d');
    // Footer logo is located around x: 70, y: 190
    tctx.drawImage(img, 70, 185, 250, 70, 0, 0, 250, 70);
    const imgData = tctx.getImageData(0, 0, 250, 70);
    const d = imgData.data;

    // Detect footer dark background color ~ #08182E / #082b52
    const bgR = d[0], bgG = d[1], bgB = d[2];

    let minX = 250, maxX = 0, minY = 70, maxY = 0;
    for (let y = 0; y < 70; y++) {
      for (let x = 0; x < 250; x++) {
        const i = (y * 250 + x) * 4;
        const r = d[i], g = d[i+1], b = d[i+2];
        const dist = Math.sqrt((r - bgR)**2 + (g - bgG)**2 + (b - bgB)**2);
        if (dist > 35) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const pad = 2;
    const finalW = maxX - minX + 1 + pad * 2;
    const finalH = maxY - minY + 1 + pad * 2;
    const canvas = document.createElement('canvas');
    canvas.width = finalW;
    canvas.height = finalH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(testCanvas, minX, minY, maxX - minX + 1, maxY - minY + 1, pad, pad, maxX - minX + 1, maxY - minY + 1);

    const outData = ctx.getImageData(0, 0, finalW, finalH);
    const od = outData.data;
    for (let i = 0; i < od.length; i += 4) {
      const r = od[i], g = od[i+1], b = od[i+2];
      const dist = Math.sqrt((r - bgR)**2 + (g - bgG)**2 + (b - bgB)**2);
      if (dist < 25) {
        od[i+3] = 0;
      } else if (dist < 45) {
        od[i+3] = Math.round(255 * ((dist - 25) / 20));
      }
    }
    ctx.putImageData(outData, 0, 0);
    return { dataUrl: canvas.toDataURL('image/png'), bounds: { minX, maxX, minY, maxY, finalW, finalH } };
  });

  console.log('Footer logo bounds:', footerLogoData.bounds);
  const base64Footer = footerLogoData.dataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('frontend/public/images/logo-footer.png', Buffer.from(base64Footer, 'base64'));

  await browser.close();
  console.log('Successfully generated transparent header and footer logos!');
})();
