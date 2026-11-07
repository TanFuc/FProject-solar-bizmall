import assert from 'assert';
import crypto from 'crypto';
import {
  removeVietnameseDiacritics,
  phraseToHashtag,
  generateHashtags,
  buildLocalSeoSuggestion,
} from '../src/lib/seo/hashtagPipeline';
import {
  getOrganizationSchema,
  getLocalBusinessSchema,
  getProductSchema,
  getArticleSchema,
  getBreadcrumbSchema,
} from '../src/lib/seo/structuredData';
import {
  isRouteAllowed,
  verifyWebhookSignature,
  processIndexingEvent,
  assertGoogleIndexingPolicy,
  ContentOutboxEvent,
} from '../src/lib/seo/indexingEvents';

console.log('--- STARTING BM SOLAR SEO & PIPELINE AUTOMATED TESTS ---');

// 1. DIACRITICS STRIPPING TEST
console.log('Test 1: Vietnamese diacritics removal');
const sampleVi = 'Điện mặt trời áp mái và giải pháp lưu trữ năng lượng BESS';
const stripped = removeVietnameseDiacritics(sampleVi);
assert.strictEqual(
  stripped,
  'Dien mat troi ap mai va giai phap luu tru nang luong BESS',
  'Diacritics should be stripped cleanly to plain ASCII'
);
assert.strictEqual(removeVietnameseDiacritics('Đà Nẵng & TP. Hồ Chí Minh'), 'Da Nang & TP. Ho Chi Minh');
console.log('  ✓ Diacritics test passed');

// 2. HASHTAG FORMATTING TEST
console.log('Test 2: PascalCase Hashtag Generation');
assert.strictEqual(phraseToHashtag('điện mặt trời'), '#DienMatTroi');
assert.strictEqual(phraseToHashtag('pin lưu trữ BESS'), '#PinLuuTruBess');
assert.strictEqual(phraseToHashtag('Inverter Hybrid Deye 12kW'), '#InverterHybridDeye12kw');
assert.strictEqual(phraseToHashtag(''), '');
console.log('  ✓ Hashtag formatting passed');

// 3. HASHTAG EXTRACTION & DEDUPLICATION TEST
console.log('Test 3: Hashtag pipeline extraction & deduplication');
const tags = generateHashtags(
  'Lắp đặt điện mặt trời mái nhà 10kWp',
  'Giải pháp tiết kiệm điện gia đình tối ưu',
  ['Điện mặt trời', 'điện mặt trời', 'Biệt thự xanh'],
  5
);

assert.ok(tags.includes('#BMSOLAR'), 'Must include brand hashtag #BMSOLAR');
assert.ok(tags.includes('#DienMatTroi'), 'Must include category tag #DienMatTroi');
assert.strictEqual(new Set(tags.map((t) => t.toLowerCase())).size, tags.length, 'No duplicate tags allowed');
assert.ok(tags.length <= 5, 'Should respect maxCount constraint');
console.log('  ✓ Hashtag extraction & deduplication passed:', tags);

// 4. STRUCTURED DATA (JSON-LD) TESTS
console.log('Test 4: Structured Data Schema Validation');
const org = getOrganizationSchema();
assert.strictEqual(org['@context'], 'https://schema.org');
assert.strictEqual(org['@type'], 'Organization');
assert.strictEqual(org.name, 'Công ty TNHH Năng Lượng BM SOLAR');
assert.strictEqual(org.address.length, 2, 'Must include both Quy Nhon and TP.HCM addresses');

const hq = getLocalBusinessSchema('quynhon');
assert.strictEqual(hq['@type'], 'LocalBusiness');
assert.strictEqual(hq.name, 'BM SOLAR — Trụ Sở Chính Quy Nhơn');

const productSchema = getProductSchema({
  id: 'prod-01',
  sku: 'DEYE-SUN-12K-SG04LP3',
  slug: 'inverter-hybrid-deye-12kw',
  name: 'Biến Tần Inverter Hybrid Deye 12kW 3 Pha',
  summary: 'Inverter hybrid cao cấp 3 pha',
  status: 'active',
  brand: { id: 'b1', name: 'Deye', slug: 'deye' },
  category: { id: 'c1', name: 'Inverter', slug: 'inverter' },
});
assert.strictEqual(productSchema['@type'], 'Product');
assert.strictEqual(productSchema.name, 'Biến Tần Inverter Hybrid Deye 12kW 3 Pha');
assert.strictEqual(productSchema.sku, 'DEYE-SUN-12K-SG04LP3');
assert.strictEqual(productSchema.offers, undefined, 'No fake offers if price is not specified');

const breadcrumbs = getBreadcrumbSchema([
  { name: 'Trang chủ', url: '/' },
  { name: 'Sản phẩm', url: '/san-pham' },
  { name: 'Inverter Deye 12kW', url: '/san-pham/inverter-hybrid-deye-12kw' },
]);
assert.strictEqual(breadcrumbs['@type'], 'BreadcrumbList');
assert.strictEqual(breadcrumbs.itemListElement.length, 3);
assert.strictEqual(breadcrumbs.itemListElement[0]?.position, 1);
assert.strictEqual(breadcrumbs.itemListElement[2]?.position, 3);
console.log('  ✓ Structured data tests passed');

// 5. INDEXING EVENTS & WEBHOOK SECURITY TESTS
console.log('Test 5: Indexing Events, Routes & HMAC Verification');

// Allowlisted routes
assert.ok(isRouteAllowed('/'));
assert.ok(isRouteAllowed('/san-pham'));
assert.ok(isRouteAllowed('/san-pham/inverter-hybrid-deye-12kw'));
assert.ok(!isRouteAllowed('/admin/system-secrets'));
assert.ok(!isRouteAllowed('/api/internal/dump'));

// HMAC Signature Verification
const secret = 'test_secret_key_123';
const body = JSON.stringify({ eventType: 'ContentPublished', canonicalPath: '/san-pham/tam-pin-canadian-solar' });
const validSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
const invalidSignature = 'deadbeef0123456789';

assert.ok(verifyWebhookSignature(body, validSignature, secret), 'Valid HMAC signature must pass');
assert.ok(!verifyWebhookSignature(body, invalidSignature, secret), 'Invalid HMAC signature must be rejected');

// Process Event
const outboxEvent: ContentOutboxEvent = {
  eventId: 'evt-101',
  eventType: 'ContentPublished',
  resourceType: 'product',
  resourceId: 'prod-01',
  canonicalPath: '/san-pham/tam-pin-canadian-solar',
  revision: 1,
  timestamp: new Date().toISOString(),
  publicationState: 'published',
};

const result = processIndexingEvent(outboxEvent);
assert.strictEqual(result.success, true);
assert.strictEqual(result.sitemapAction, 'add');
assert.ok(result.revalidatedPaths.includes('/san-pham/tam-pin-canadian-solar'));
assert.ok(result.revalidatedPaths.includes('/san-pham'));
assert.ok(result.revalidatedPaths.includes('/'));

// Google Indexing API constraint guard (13_INDEXING_AUTOMATION.md)
const googlePolicy = assertGoogleIndexingPolicy('product');
assert.strictEqual(googlePolicy.allowed, false, 'Must enforce Google TOS: Indexing API not allowed for ordinary products');
console.log('  ✓ Indexing events & security tests passed');

console.log('\n--- ALL SEO & PIPELINE AUTOMATED TESTS PASSED (5/5) ---');
