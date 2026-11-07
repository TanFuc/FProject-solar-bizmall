const fs = require('fs');
const path = require('path');

const pages = [
  { slug: 'du-an', title: 'Dự án (Projects)' },
  { slug: 'giai-phap', title: 'Giải pháp (Solutions)' },
  { slug: 'gioi-thieu', title: 'Giới thiệu (About)' },
  { slug: 'san-pham', title: 'Sản phẩm (Products)' },
  { slug: 'tin-tuc', title: 'Tin tức (News)' },
  { slug: 'lien-he', title: 'Liên hệ (Contact)' }
];

let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>BM SOLAR — Visual Fidelity Comparison</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b132b; color: #fff; margin: 0; padding: 20px; }
  h1 { text-align: center; color: #ff6b19; margin-bottom: 5px; }
  p.subtitle { text-align: center; color: #8892b0; margin-top: 0; margin-bottom: 25px; }
  .tabs { display: flex; justify-content: center; gap: 10px; margin-bottom: 25px; flex-wrap: wrap; }
  .tab-btn { background: #1c2541; border: 1px solid #3a506b; color: #fff; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.2s; }
  .tab-btn:hover { background: #263859; }
  .tab-btn.active { background: #ff6b19; border-color: #ff6b19; }
  .page-view { display: none; }
  .page-view.active { display: block; }
  .view-heading { text-align: center; font-size: 20px; color: #ffb703; margin: 30px 0 15px; border-bottom: 1px solid #1c2541; padding-bottom: 10px; }
  .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .column { background: #111d4a; padding: 15px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
  .column h3 { text-align: center; font-size: 15px; margin-top: 0; color: #e2e8f0; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .column img { width: 100%; border-radius: 8px; border: 1px solid #3a506b; display: block; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; }
  .badge-ref { background: #ff6b19; color: white; }
  .badge-live { background: #00b4d8; color: white; }
</style>
</head>
<body>
<h1>BM SOLAR — 100% Visual Fidelity Side-by-Side Review</h1>
<p class="subtitle">Comparing Original BM_SOLAR_Full_Page_Designs Reference PNGs vs Live Rendered Playwright Captures</p>
<div class="tabs">
`;

pages.forEach((p, idx) => {
  html += `<button class="tab-btn ${idx === 0 ? 'active' : ''}" onclick="showTab('${p.slug}', this)">${p.title}</button>\n`;
});

html += `</div>\n`;

pages.forEach((p, idx) => {
  const refDesktop = '../frontend/BM_SOLAR_NextJS_Visual_Agent_Prompts_V3/BM_SOLAR_Full_Page_Designs/BM_SOLAR_' + p.slug + '_desktop.png';
  const liveDesktop = p.slug + '-desktop-1440.png';
  const refMobile = '../frontend/BM_SOLAR_NextJS_Visual_Agent_Prompts_V3/BM_SOLAR_Full_Page_Designs/BM_SOLAR_' + p.slug + '_mobile.png';
  const liveMobile = p.slug + '-mobile-390.png';

  html += `
  <div id="tab-${p.slug}" class="page-view ${idx === 0 ? 'active' : ''}">
    <h2 class="view-heading">🖥️ Desktop Viewport (1440px)</h2>
    <div class="comparison-grid">
      <div class="column">
        <h3><span class="badge badge-ref">ORIGINAL DESIGN</span> BM_SOLAR_${p.slug}_desktop.png</h3>
        <img src="${refDesktop}" />
      </div>
      <div class="column">
        <h3><span class="badge badge-live">LIVE NEXT.JS</span> ${liveDesktop}</h3>
        <img src="${liveDesktop}" />
      </div>
    </div>

    <h2 class="view-heading" style="margin-top: 50px;">📱 Mobile Viewport (390px)</h2>
    <div class="comparison-grid" style="max-width: 900px; margin: 0 auto;">
      <div class="column">
        <h3><span class="badge badge-ref">ORIGINAL DESIGN</span> BM_SOLAR_${p.slug}_mobile.png</h3>
        <img src="${refMobile}" />
      </div>
      <div class="column">
        <h3><span class="badge badge-live">LIVE NEXT.JS</span> ${liveMobile}</h3>
        <img src="${liveMobile}" />
      </div>
    </div>
  </div>`;
});

html += `
<script>
function showTab(slug, btn) {
  document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + slug).classList.add('active');
  btn.classList.add('active');
}
</script>
</body>
</html>`;

fs.writeFileSync('test-results/visual-comparison-report.html', html, 'utf-8');
console.log('Report generated at test-results/visual-comparison-report.html');
