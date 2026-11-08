import assert from 'assert';
import crypto from 'crypto';
import {
  removeVietnameseDiacritics,
  phraseToHashtag,
  generateHashtags,
} from '../src/lib/seo/hashtagPipeline';
import {
  getOrganizationSchema,
  getLocalBusinessSchema,
  getProductSchema,
  getArticleSchema,
  getBreadcrumbSchema,
} from '../src/lib/seo/structuredData';
import { constructMetadata } from '../src/lib/seo/metadata';
import {
  isRouteAllowed,
  verifyWebhookSignature,
  processIndexingEvent,
  assertGoogleIndexingPolicy,
  ContentOutboxEvent,
} from '../src/lib/seo/indexingEvents';
import { SiteShellData, BranchItem } from '../src/types/bmsolar-api';

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

// 4. STRUCTURED DATA: DYNAMIC DERIVATION FROM SHELL FIXTURES (NO HARDCODING)
console.log('Test 4: Dynamic Structured Data Validation via Shell Fixtures');

const fixtureBranchA: BranchItem = {
  id: 'br-da-nang',
  code: 'DNG-01',
  slug: 'da-nang',
  name: 'Chi nhánh Đà Nẵng',
  streetAddress: '123 Đường Lê Duẩn, Hải Châu, Đà Nẵng',
  isActive: true,
  channels: [
    {
      id: 'ch-dn-01',
      type: 'phone',
      label: 'Hotline Đà Nẵng',
      target: '0911222333',
      sortOrder: 1,
    },
  ],
};

const fixtureBranchB: BranchItem = {
  id: 'br-can-tho',
  code: 'CTO-01',
  slug: 'can-tho',
  name: 'Chi nhánh Cần Thơ',
  streetAddress: '456 Đường 30 Tháng 4, Ninh Kiều, Cần Thơ',
  isActive: true,
  channels: [
    {
      id: 'ch-ct-01',
      type: 'phone',
      label: 'Hotline Cần Thơ',
      target: '0988777666',
      sortOrder: 1,
    },
  ],
};

const fixtureShellA: Partial<SiteShellData> = {
  brand: {
    name: 'BM SOLAR',
    logo: { url: '/images/custom-logo.png', alt: 'BM SOLAR' },
  },
  utilityBar: {
    visible: true,
    showHotline: true,
    showEmail: true,
    branches: [fixtureBranchA],
  },
  footer: {
    socialLinks: [
      {
        id: 'soc-fb',
        type: 'facebook',
        label: 'Facebook',
        target: 'https://facebook.com/bmsolar.danang',
        sortOrder: 1,
      },
    ],
  },
};

const fixtureShellB: Partial<SiteShellData> = {
  brand: {
    name: 'BM SOLAR',
    logo: { url: '/images/custom-logo.png', alt: 'BM SOLAR' },
  },
  utilityBar: {
    visible: true,
    showHotline: true,
    showEmail: true,
    branches: [fixtureBranchB],
  },
  footer: {
    socialLinks: [
      {
        id: 'soc-fb',
        type: 'facebook',
        label: 'Facebook',
        target: 'https://facebook.com/bmsolar.cantho',
        sortOrder: 1,
      },
    ],
  },
};

// Verify fixture A outputs fixture A's specific data
const schemaA = getOrganizationSchema(fixtureShellA);
assert.strictEqual(schemaA['@context'], 'https://schema.org');
assert.strictEqual(schemaA['@type'], 'Organization');
const addrA = schemaA.address;
assert.ok(addrA && addrA.length === 1);
assert.strictEqual(addrA[0]?.streetAddress, '123 Đường Lê Duẩn, Hải Châu, Đà Nẵng');
assert.strictEqual(schemaA.telephone, '0911222333');

// Verify fixture B outputs fixture B's specific data
const schemaB = getOrganizationSchema(fixtureShellB);
const addrB = schemaB.address;
assert.ok(addrB && addrB.length === 1);
assert.strictEqual(addrB[0]?.streetAddress, '456 Đường 30 Tháng 4, Ninh Kiều, Cần Thơ');
assert.strictEqual(schemaB.telephone, '0988777666');

// Changing the fixture changes schema output
assert.notStrictEqual(
  addrA[0]?.streetAddress,
  addrB[0]?.streetAddress,
  'Different siteShell input must yield distinct schema output'
);

// When no shell is provided, do NOT fabricate branch addresses
const schemaEmpty = getOrganizationSchema(null);
assert.strictEqual(schemaEmpty.address, undefined, 'No fabricated addresses when shell is null');
assert.strictEqual(schemaEmpty.telephone, undefined, 'No fabricated phone when shell is null');

// LocalBusiness helper tests
const lbDynamic = getLocalBusinessSchema(fixtureBranchA);
assert.strictEqual(lbDynamic['@type'], 'LocalBusiness');
assert.strictEqual(lbDynamic.name, 'Chi nhánh Đà Nẵng');
const lbAddr = lbDynamic.address;
assert.strictEqual(lbAddr?.streetAddress, '123 Đường Lê Duẩn, Hải Châu, Đà Nẵng');

// Legacy string call must not fabricate addresses or coordinates
const lbLegacy = getLocalBusinessSchema('quynhon');
assert.strictEqual(lbLegacy['@type'], 'LocalBusiness');
assert.strictEqual(lbLegacy.address, undefined, 'Legacy string call must not fabricate address facts');
assert.strictEqual(lbLegacy.telephone, undefined, 'Legacy string call must not fabricate telephone facts');
console.log('  ✓ Structured data tests passed');

// 5. METADATA REGRESSION TESTS (ICON, TITLE DEDUPLICATION, NOINDEX, ALTERNATES)
console.log('Test 5: Metadata Regression Tests');
const standardMeta = constructMetadata({
  title: 'Inverter Hybrid Deye 5kW | BM SOLAR',
  canonicalPath: '/san-pham/inverter-hybrid-deye-5kw-1-pha',
});

// Title deduplication check
const titleObj = standardMeta.title as { default: string; template: string };
assert.strictEqual(
  titleObj.default,
  'Inverter Hybrid Deye 5kW',
  'Duplicate | BM SOLAR brand suffix must be cleanly stripped before template formatting'
);
assert.strictEqual(titleObj.template, '%s | BM SOLAR Việt Nam');

// Favicon / App Icon check
const icons = standardMeta.icons as { icon: Array<{ url: string }>; apple: Array<{ url: string }> };
assert.ok(icons && Array.isArray(icons.icon), 'Icons must contain icon array');
assert.strictEqual(icons.icon[0]?.url, '/favicon.ico', 'Must point to genuine brand favicon');
assert.strictEqual(icons.apple[0]?.url, '/images/favicon-180.png', 'Must point to genuine apple-touch-icon');

// Language alternates check
const alternates = standardMeta.alternates as { canonical: string; languages: Record<string, string> };
assert.ok(alternates.languages['vi-VN'], 'Must declare vi-VN alternate');
assert.ok(alternates.languages['x-default'], 'Must declare x-default alternate');

// Noindex check
const noindexMeta = constructMetadata({
  title: 'Admin Secret Area',
  noIndex: true,
});
const robots = noindexMeta.robots as { index: boolean; follow: boolean };
assert.strictEqual(robots.index, false, 'Noindex flag must set robots.index to false');
assert.strictEqual(robots.follow, false, 'Noindex flag must set robots.follow to false');
console.log('  ✓ Metadata regression tests passed');

// 6. INDEXING EVENTS & WEBHOOK SECURITY TESTS
console.log('Test 6: Indexing Events, Routes & HMAC Verification');

assert.ok(isRouteAllowed('/'));
assert.ok(isRouteAllowed('/san-pham'));
assert.ok(isRouteAllowed('/san-pham/inverter-hybrid-deye-12kw'));
assert.ok(!isRouteAllowed('/admin/system-secrets'));
assert.ok(!isRouteAllowed('/api/internal/dump'));

const secret = 'test_secret_key_123';
const body = JSON.stringify({ eventType: 'ContentPublished', canonicalPath: '/san-pham/tam-pin-canadian-solar' });
const validSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
const invalidSignature = 'deadbeef0123456789';

assert.ok(verifyWebhookSignature(body, validSignature, secret), 'Valid HMAC signature must pass');
assert.ok(!verifyWebhookSignature(body, invalidSignature, secret), 'Invalid HMAC signature must be rejected');

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

const googlePolicy = assertGoogleIndexingPolicy('product');
assert.strictEqual(googlePolicy.allowed, false, 'Must enforce Google TOS: Indexing API not allowed for ordinary products');
console.log('  ✓ Indexing events & security tests passed');

console.log('\n--- ALL SEO & PIPELINE AUTOMATED TESTS PASSED (6/6) ---');

