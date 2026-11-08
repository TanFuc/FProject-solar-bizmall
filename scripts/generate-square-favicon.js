const playwright = require('../frontend/node_modules/playwright');
const fs = require('fs');

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 600, height: 400 } });

  // 1. Crop top monogram from BM_SOLAR_logo.png (making white transparent)
  const logoBase64 = fs.readFileSync('frontend/BM_SOLAR_NextJS_Visual_Agent_Prompts_V3/BM_SOLAR_Full_Page_Designs/BM_SOLAR_logo.png').toString('base64');
  await page.setContent(`<body style="margin:0;"><img id="logo" src="data:image/png;base64,${logoBase64}" /></body>`);
  
  const croppedData = await page.evaluate(() => {
    const img = document.getElementById('logo');
    // Bounding box of the top monogram is ~ x: 20..825, y: 20..580
    // To make a SQUARE 1:1 icon:
    // width is ~805, height is ~560
    // If we make a square canvas of 840x840, center the monogram vertically:
    const size = 840;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // center vertically: y offset is (840 - 560)/2 = 140
    // x offset is (840 - 805)/2 = 17
    ctx.drawImage(img, 20, 20, 805, 560, 17, 140, 805, 560);

    const imgData = ctx.getImageData(0, 0, size, size);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i+1], b = d[i+2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum >= 250) {
        d[i+3] = 0;
      } else if (lum >= 235) {
        d[i+3] = Math.round(255 * ((250 - lum) / 15));
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Also create 32x32, 48x48, 64x64, 180x180, 512x512
    const resize = (targetSize) => {
      const c = document.createElement('canvas');
      c.width = targetSize;
      c.height = targetSize;
      const tctx = c.getContext('2d');
      tctx.imageSmoothingEnabled = true;
      tctx.imageSmoothingQuality = 'high';
      tctx.drawImage(canvas, 0, 0, targetSize, targetSize);
      return c.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    };

    return {
      s512: resize(512),
      s180: resize(180),
      s64: resize(64),
      s32: resize(32),
      s16: resize(16),
    };
  });

  // Save the square icons
  fs.writeFileSync('frontend/public/images/favicon-512.png', Buffer.from(croppedData.s512, 'base64'));
  fs.writeFileSync('frontend/public/images/favicon-180.png', Buffer.from(croppedData.s180, 'base64'));
  fs.writeFileSync('frontend/public/images/favicon-64.png', Buffer.from(croppedData.s64, 'base64'));
  fs.writeFileSync('frontend/public/images/favicon-32.png', Buffer.from(croppedData.s32, 'base64'));
  fs.writeFileSync('frontend/public/images/favicon.png', Buffer.from(croppedData.s32, 'base64'));
  fs.writeFileSync('frontend/public/favicon.ico', Buffer.from(croppedData.s32, 'base64'));
  fs.writeFileSync('frontend/src/app/icon.png', Buffer.from(croppedData.s32, 'base64'));
  fs.writeFileSync('frontend/src/app/apple-icon.png', Buffer.from(croppedData.s180, 'base64'));

  // Also create a visual check page
  await page.setContent(`
    <body style="background:#f1f5f9;font-family:sans-serif;padding:30px;">
      <h2>Square Favicon Preview (Simulating Browser Tab)</h2>
      <div style="background:#fff;padding:12px 20px;border-radius:10px;display:inline-flex;align-items:center;gap:10px;box-shadow:0 2px 8px rgba(0,0,0,0.1);border:1px solid #e2e8f0;">
        <img src="data:image/png;base64,${croppedData.s16}" width="16" height="16" style="display:block;" />
        <span style="font-size:12px;font-weight:600;color:#1e293b;">BM SOLAR — Lắp Đặt Điện Mặt Trời Chính Hãng</span>
        <span style="margin-left:15px;color:#94a3b8;cursor:pointer;">×</span>
      </div>
      <div style="margin-top:20px;display:flex;gap:20px;align-items:center;">
        <div>16x16: <img src="data:image/png;base64,${croppedData.s16}" width="16" height="16" style="border:1px solid #cbd5e1;background:#fff;" /></div>
        <div>32x32: <img src="data:image/png;base64,${croppedData.s32}" width="32" height="32" style="border:1px solid #cbd5e1;background:#fff;" /></div>
        <div>64x64: <img src="data:image/png;base64,${croppedData.s64}" width="64" height="64" style="border:1px solid #cbd5e1;background:#fff;" /></div>
        <div>180x180: <img src="data:image/png;base64,${croppedData.s180}" width="90" height="90" style="border:1px solid #cbd5e1;background:#fff;" /></div>
      </div>
    </body>
  `);

  await page.screenshot({ path: 'test-results/check-favicon-browser-tab.png' });
  await browser.close();
  console.log('Saved square favicons and browser tab test preview!');
})();

