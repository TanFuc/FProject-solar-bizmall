import playwright from '../frontend/node_modules/playwright/index.js';
const { chromium } = playwright;
import path from 'path';
import fs from 'fs';

const OUT_DIR = path.resolve('frontend/public/images/designs');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function extractAll() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 4500 } });

  console.log('Extracting exact crops from BM_SOLAR_Full_Page_Designs...');

  async function cropBox(refRelativePath, box, destFileName) {
    const fullRef = path.resolve(refRelativePath);
    await page.goto('file:///' + fullRef.replace(/\\/g, '/'));
    const dataUrl = await page.evaluate((b) => {
      const img = document.querySelector('img');
      const canvas = document.createElement('canvas');
      canvas.width = b.w;
      canvas.height = b.h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, b.x, b.y, b.w, b.h, 0, 0, b.w, b.h);
      return canvas.toDataURL('image/png');
    }, box);

    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const destPath = path.join(OUT_DIR, destFileName);
    fs.writeFileSync(destPath, base64Data, 'base64');
    console.log(`  ✓ Extracted ${destFileName} (${box.w}x${box.h}) - ${fs.statSync(destPath).size} bytes`);
  }

  // 1. DU AN (BM_SOLAR_du-an_desktop.png 1440x2903)
  const duAn = 'frontend/BM_SOLAR_NextJS_Visual_Agent_Prompts_V3/BM_SOLAR_Full_Page_Designs/BM_SOLAR_du-an_desktop.png';
  await cropBox(duAn, { x: 0, y: 110, w: 1440, h: 420 }, 'hero-du-an.png');
  // 9 cards
  const duAnCols = [90, 516, 942];
  const duAnRows = [905, 1210, 1515];
  let pIdx = 1;
  for (let r = 0; r < duAnRows.length; r++) {
    for (let c = 0; c < duAnCols.length; c++) {
      await cropBox(duAn, { x: duAnCols[c], y: duAnRows[r], w: 408, h: 285 }, `du-an-${pIdx}.png`);
      pIdx++;
    }
  }

  // 2. GIAI PHAP (BM_SOLAR_giai-phap_desktop.png 1440x4120)
  const giaiPhap = 'frontend/BM_SOLAR_NextJS_Visual_Agent_Prompts_V3/BM_SOLAR_Full_Page_Designs/BM_SOLAR_giai-phap_desktop.png';
  await cropBox(giaiPhap, { x: 0, y: 110, w: 1440, h: 420 }, 'hero-giai-phap.png');
  // 3 Wide Cards
  await cropBox(giaiPhap, { x: 90, y: 730, w: 408, h: 270 }, 'giai-phap-card-1.png');
  await cropBox(giaiPhap, { x: 516, y: 730, w: 408, h: 270 }, 'giai-phap-card-2.png');
  await cropBox(giaiPhap, { x: 942, y: 730, w: 408, h: 270 }, 'giai-phap-card-3.png');
  // 3 Detail feature blocks
  await cropBox(giaiPhap, { x: 90, y: 1250, w: 600, h: 360 }, 'giai-phap-feature-1.png');
  await cropBox(giaiPhap, { x: 750, y: 1650, w: 600, h: 360 }, 'giai-phap-feature-2.png');
  await cropBox(giaiPhap, { x: 90, y: 2050, w: 600, h: 360 }, 'giai-phap-feature-3.png');

  // 3. GIOI THIEU (BM_SOLAR_gioi-thieu_desktop.png 1440x3938)
  const gioiThieu = 'frontend/BM_SOLAR_NextJS_Visual_Agent_Prompts_V3/BM_SOLAR_Full_Page_Designs/BM_SOLAR_gioi-thieu_desktop.png';
  await cropBox(gioiThieu, { x: 0, y: 110, w: 1440, h: 420 }, 'hero-gioi-thieu.png');
  await cropBox(gioiThieu, { x: 750, y: 730, w: 600, h: 400 }, 'gioi-thieu-story.png');
  await cropBox(gioiThieu, { x: 90, y: 1720, w: 408, h: 260 }, 'gioi-thieu-card-1.png');
  await cropBox(gioiThieu, { x: 516, y: 1720, w: 408, h: 260 }, 'gioi-thieu-card-2.png');
  await cropBox(gioiThieu, { x: 942, y: 1720, w: 408, h: 260 }, 'gioi-thieu-card-3.png');
  await cropBox(gioiThieu, { x: 90, y: 2360, w: 1260, h: 320 }, 'gioi-thieu-gallery-top.png');
  await cropBox(gioiThieu, { x: 90, y: 2710, w: 615, h: 300 }, 'gioi-thieu-gallery-bottom-1.png');
  await cropBox(gioiThieu, { x: 735, y: 2710, w: 615, h: 300 }, 'gioi-thieu-gallery-bottom-2.png');

  // 4. SAN PHAM (BM_SOLAR_san-pham_desktop.png 1440x3130)
  const sanPham = 'frontend/BM_SOLAR_NextJS_Visual_Agent_Prompts_V3/BM_SOLAR_Full_Page_Designs/BM_SOLAR_san-pham_desktop.png';
  await cropBox(sanPham, { x: 0, y: 110, w: 1440, h: 420 }, 'hero-san-pham.png');
  await cropBox(sanPham, { x: 90, y: 730, w: 235, h: 180 }, 'cat-panel.png');
  await cropBox(sanPham, { x: 345, y: 730, w: 235, h: 180 }, 'cat-inverter.png');
  await cropBox(sanPham, { x: 600, y: 730, w: 235, h: 180 }, 'cat-battery.png');
  await cropBox(sanPham, { x: 855, y: 730, w: 235, h: 180 }, 'cat-charger.png');
  await cropBox(sanPham, { x: 1110, y: 730, w: 235, h: 180 }, 'cat-accessories.png');
  const pCols = [90, 410, 730, 1050];
  const pRows = [1180, 1600];
  let spIdx = 1;
  for (let r = 0; r < pRows.length; r++) {
    for (let c = 0; c < pCols.length; c++) {
      await cropBox(sanPham, { x: pCols[c], y: pRows[r], w: 300, h: 380 }, `san-pham-${spIdx}.png`);
      spIdx++;
    }
  }

  // 5. TIN TUC (BM_SOLAR_tin-tuc_desktop.png 1440x3354)
  const tinTuc = 'frontend/BM_SOLAR_NextJS_Visual_Agent_Prompts_V3/BM_SOLAR_Full_Page_Designs/BM_SOLAR_tin-tuc_desktop.png';
  await cropBox(tinTuc, { x: 0, y: 110, w: 1440, h: 420 }, 'hero-tin-tuc.png');
  await cropBox(tinTuc, { x: 90, y: 730, w: 750, h: 420 }, 'tin-tuc-featured.png');
  await cropBox(tinTuc, { x: 90, y: 1350, w: 408, h: 320 }, 'tin-tuc-1.png');
  await cropBox(tinTuc, { x: 516, y: 1350, w: 408, h: 320 }, 'tin-tuc-2.png');
  await cropBox(tinTuc, { x: 942, y: 1350, w: 408, h: 320 }, 'tin-tuc-3.png');

  // 6. LIEN HE (BM_SOLAR_lien-he_desktop.png 1440x2951)
  const lienHe = 'frontend/BM_SOLAR_NextJS_Visual_Agent_Prompts_V3/BM_SOLAR_Full_Page_Designs/BM_SOLAR_lien-he_desktop.png';
  await cropBox(lienHe, { x: 0, y: 110, w: 1440, h: 420 }, 'hero-lien-he.png');

  // 7. TRANG CHU (BM_SOLAR_trang-chu_desktop.png 1024x1536)
  const trangChu = 'frontend/BM_SOLAR_NextJS_Visual_Agent_Prompts_V3/BM_SOLAR_Full_Page_Designs/BM_SOLAR_trang-chu_desktop.png';
  await cropBox(trangChu, { x: 0, y: 70, w: 1024, h: 420 }, 'hero-home.png');

  await browser.close();
  console.log('All crops finished successfully!');
}

extractAll().catch((err) => {
  console.error('Extraction error:', err);
  process.exit(1);
});
