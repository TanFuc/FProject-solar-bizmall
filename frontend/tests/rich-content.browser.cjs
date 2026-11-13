const { test } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const frontend = process.env.BMSOLAR_FRONTEND_URL || 'http://localhost:3000';
const backend = process.env.BMSOLAR_BACKEND_URL || 'http://localhost:3001';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aE1sAAAAASUVORK5CYII=', 'base64');
const routes = [
  ['/gioi-thieu', 'Khảo sát để chọn đúng cấu hình'],
  ['/du-an/du-an-ap-mai-biet-thu-quy-nhon-15kw', 'Cấu hình thiết bị trong hồ sơ'],
  ['/san-pham/inverter-hybrid-deye-5kw-1-pha', 'Vai trò trong hệ thống Hybrid'],
  ['/tin-tuc/cam-nang-chon-bien-tan-inverter-hybrid-2026', 'Bắt đầu từ tải thực tế'],
];

test('long content is published and fits the layout at desktop and mobile widths', async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [375, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 850 } });
      for (const [route, heading] of routes) {
        const response = await page.goto(frontend + route, { waitUntil: 'domcontentloaded' });
        assert.equal(response.status(), 200, route);
        await page.getByRole('heading', { name: heading, exact: true }).waitFor();
        const dimensions = await page.locator('.solar-document').first().evaluate(el => ({
          width: el.clientWidth, scrollWidth: el.scrollWidth,
        }));
        assert.ok(dimensions.width > 0);
        assert.doesNotMatch(await page.locator(".solar-document").first().textContent(), /"type"\s*:\s*"doc"/);
        assert.ok(dimensions.scrollWidth <= dimensions.width + 1, route + ' at ' + width);
      }
      await page.close();
    }
  } finally { await browser.close(); }
});

test('admin editor inserts an uploaded image, previews its placement and saves the document', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const real = await fetch(backend + '/api/v1/public/pages/about');
    const published = (await real.json()).data;
    const target = { id: 'qa-page', pageKey: 'about', routeSlug: '/gioi-thieu', title: published.title, locale: 'vi-VN', publicationState: 'published' };
    let revision = { id: 'qa-rev', blocksJson: JSON.stringify(published.blocks), seoJson: null };
    const sample = frontend + '/test-editor-image.png';
    await page.addInitScript(() => localStorage.setItem('bmsolar_admin_token', 'eyBrowserTestFixture'));
    await page.route('**/api/v1/admin/**', async route => {
      const { pathname } = new URL(route.request().url());
      const headers = { 'Access-Control-Allow-Origin': frontend, 'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'authorization, content-type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
      if (pathname.endsWith('/auth/me')) return route.fulfill({ headers, json: { data: { id: 'qa' } } });
      if (pathname.endsWith('/admin/media')) return route.fulfill({ headers, json: { data: [] } });
      if (pathname.endsWith('/admin/pages')) return route.fulfill({ headers, json: { data: [target] } });
      if (pathname.endsWith('/qa-page')) return route.fulfill({ headers, json: { data: { ...target, currentDraftRevisionId: revision.id, revisions: [revision] } } });
      if (pathname.endsWith('/revisions')) {
        revision = { id: 'qa-new-rev', ...route.request().postDataJSON() };
        return route.fulfill({ headers, json: { data: revision } });
      }
      return route.abort();
    });
    await page.route('**/api/admin/editor-media', route => {
      assert.match(route.request().headers()['content-type'], /^multipart\/form-data/);
      return route.fulfill({ status: 201, json: { data: { id: 'qa-media', url: sample } } });
    });
    await page.route('**/test-editor-image.png', route => route.fulfill({ contentType: 'image/png', body: png }));
    await page.goto(frontend + '/admin/media');
    const panel = page.locator('.media-content-editor');
    await panel.locator('select').first().selectOption('about');
    const input = panel.getByRole('textbox', { name: 'Nội dung dài của trang' });
    await input.waitFor();
    await panel.getByRole('button', { name: 'Xem trước', exact: true }).click();
    const preview = panel.locator('.rich-preview .solar-document');
    await preview.getByRole('heading', { name: routes[0][1], exact: true }).waitFor();
    const snapshot = element => Array.from(element.children).map(child => ({
      tag: child.tagName, text: child.textContent, align: child.style.textAlign,
      lineHeight: getComputedStyle(child).lineHeight, fontSize: getComputedStyle(child).fontSize,
    }));
    const original = await preview.evaluate(snapshot);
    const publicPage = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    await publicPage.goto(frontend + '/gioi-thieu');
    await publicPage.getByRole('heading', { name: routes[0][1], exact: true }).waitFor();
    assert.deepEqual(original, await publicPage.locator('.solar-document').first().evaluate(snapshot));
    await publicPage.close();

    await panel.getByRole('button', { name: 'Soạn thảo', exact: true }).click();
    await input.click();
    await page.keyboard.press('Control+End');
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.insertText('Đoạn thử định dạng');
    await page.keyboard.press('Shift+Home');
    await panel.locator('.rich-editor').first().getByLabel('Phông chữ').selectOption('georgia');
    await panel.locator('.rich-editor').first().getByLabel('Cỡ chữ').selectOption('26');
    await panel.getByRole('button', { name: 'Căn giữa', exact: true }).click();
    await panel.locator('.rich-editor').first().getByLabel('Chọn ảnh trong nội dung').setInputFiles({ name: 'sample.png', mimeType: 'image/png', buffer: png });
    await panel.getByLabel('Vị trí ảnh').selectOption('float-right');
    await panel.getByLabel('Chiều rộng').selectOption('40');
    await panel.getByLabel('Chú thích', { exact: true }).fill('Ảnh minh họa cho bản xem trước');
    const imageIndexBefore = await input.locator('figure').evaluate(el => Array.from(el.parentElement.children).indexOf(el));
    await panel.getByRole('button', { name: 'Đưa ảnh lên' }).click();
    const imageIndexAfter = await input.locator('figure').evaluate(el => Array.from(el.parentElement.children).indexOf(el));
    assert.equal(imageIndexAfter, imageIndexBefore - 1, 'move image up');
    await panel.getByRole('button', { name: 'Xem trước', exact: true }).click();
    await preview.getByText('Ảnh minh họa cho bản xem trước').waitFor();
    assert.equal(await preview.getByText('Đoạn thử định dạng', { exact: true }).evaluate(el => getComputedStyle(el).fontSize), '26px');
    assert.equal(await preview.locator('figure').getAttribute('data-placement'), 'float-right');
    assert.equal(await preview.locator('figure').evaluate(el => el.style.width), '40%');
    assert.equal(await preview.getByText('Đoạn thử định dạng').evaluate(el => el.closest('p,h2,h3,h4').style.textAlign), 'center');
    await panel.getByRole('button', { name: 'Điện thoại', exact: true }).click();
    assert.equal(await preview.locator('figure').evaluate(el => getComputedStyle(el).float), 'none');
    await panel.getByRole('button', { name: 'Lưu bản nháp', exact: true }).click();
    await panel.getByRole('status').filter({ hasText: 'Đã lưu bản nháp.' }).waitFor();
    const doc = JSON.parse(revision.blocksJson).find(block => block.id === 'editor_long_content').data.document;
    const image = doc.content.find(node => node.type === 'image');
    assert.equal(image.attrs.mediaId, 'qa-media');
    assert.equal(image.attrs.placement, 'float-right');
    assert.equal(doc.content.findIndex(node => node.type === 'image'), imageIndexAfter);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});
