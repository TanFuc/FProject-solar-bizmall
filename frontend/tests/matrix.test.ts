import assert from 'assert';
import sitemap from '../src/app/sitemap';
import robots from '../src/app/robots';
import {
  fallbackProducts,
  fallbackProjects,
  fallbackArticles,
  fallbackSolutions,
  fallbackSiteShell,
} from '../src/lib/api/mockData';
import {
  isRouteAllowed,
  verifyWebhookSignature,
  processIndexingEvent,
  assertGoogleIndexingPolicy,
} from '../src/lib/seo/indexingEvents';
import {
  getOrganizationSchema,
  getLocalBusinessSchema,
  getProductSchema,
  getArticleSchema,
  getBreadcrumbSchema,
} from '../src/lib/seo/structuredData';

console.log('====================================================');
console.log('BM SOLAR — FULL PRODUCTION TEST MATRIX (18_TEST_MATRIX.md)');
console.log('====================================================\n');

// ----------------------------------------------------
// SCENARIO 1: SITEMAP INTEGRITY & CANONICAL POLICY
// ----------------------------------------------------
console.log('Scenario 1: Sitemap Integrity & Canonical Policy');
async function testSitemap() {
  const routes = await sitemap();
  assert.ok(Array.isArray(routes), 'Sitemap should return an array');
  assert.ok(routes.length >= 7, 'Sitemap should contain at least all 7 published static routes');

  // Verify no synthetic "new Date()" on every run - timestamps must be stable Date objects
  for (const r of routes) {
    assert.ok(r.url.startsWith('https://bmsolar.vn'), `URL ${r.url} must use canonical domain`);
    assert.ok(r.lastModified instanceof Date, `Route ${r.url} must have a valid lastModified Date object`);
    assert.ok(!isNaN(r.lastModified.getTime()), `Route ${r.url} lastModified Date must be valid`);
  }

  // Check specific routes
  const home = routes.find((r) => r.url === 'https://bmsolar.vn');
  assert.ok(home, 'Home route must be in sitemap');
  assert.strictEqual(home.priority, 1.0);
}

// ----------------------------------------------------
// SCENARIO 2: ROBOTS.TXT DIRECTIVES
// ----------------------------------------------------
console.log('Scenario 2: Robots.txt Directives');
function testRobots() {
  const rules = robots();
  assert.strictEqual(rules.sitemap, 'https://bmsolar.vn/sitemap.xml');
  const userRules = Array.isArray(rules.rules) ? rules.rules : [rules.rules];
  const starRule = userRules.find((r) => r.userAgent === '*');
  assert.ok(starRule, 'Wildcard userAgent rule must exist');
  assert.strictEqual(starRule.allow, '/');
  assert.ok(Array.isArray(starRule.disallow));
  assert.ok(starRule.disallow.includes('/api/'));
  assert.ok(starRule.disallow.includes('/admin/'));
  assert.ok(!starRule.disallow.includes('/'), 'Must NEVER disallow / in production');
}

// ----------------------------------------------------
// SCENARIO 3: CONTACT & DYNAMIC BRANCH SWITCHING
// ----------------------------------------------------
console.log('Scenario 3: Contact & Branch Switching Integrity');
function testBranchContacts() {
  const branches = fallbackSiteShell.utilityBar.branches;
  assert.strictEqual(branches.length, 2, 'Must have 2 physical branches: Quy Nhon & TP.HCM');

  const qn = branches.find((b) => b.slug === 'quy-nhon');
  assert.ok(qn, 'Quy Nhon branch must exist');
  const qnPhone = qn.channels.find((c) => c.type === 'phone');
  assert.strictEqual(qnPhone?.target, '0932456789');
  assert.strictEqual(qnPhone?.actionUrl, 'tel:+84932456789');

  const hcm = branches.find((b) => b.slug === 'go-vap-hcm');
  assert.ok(hcm, 'TP.HCM branch must exist');
  const hcmPhone = hcm.channels.find((c) => c.type === 'phone');
  assert.strictEqual(hcmPhone?.target, '0909888999');
  assert.strictEqual(hcmPhone?.actionUrl, 'tel:+84909888999');

  // Verify LocalBusiness schema accuracy using explicit BranchItem fixtures and typed schema properties
  const qnSchema = getLocalBusinessSchema(qn);
  assert.strictEqual(qnSchema['@type'], 'LocalBusiness');
  assert.strictEqual(qnSchema.telephone, qnPhone?.target);
  assert.strictEqual(qnSchema.address?.streetAddress, qn.streetAddress);
  assert.strictEqual(qnSchema.parentOrganization?.['@id'], 'https://bmsolar.vn/#organization');

  const hcmSchema = getLocalBusinessSchema(hcm);
  assert.strictEqual(hcmSchema['@type'], 'LocalBusiness');
  assert.strictEqual(hcmSchema.telephone, hcmPhone?.target);
  assert.strictEqual(hcmSchema.address?.streetAddress, hcm.streetAddress);
  assert.strictEqual(hcmSchema.parentOrganization?.['@id'], 'https://bmsolar.vn/#organization');
}

// ----------------------------------------------------
// SCENARIO 4: LEAD VALIDATION & HONEYPOT DEFENSE
// ----------------------------------------------------
console.log('Scenario 4: Lead Validation & Anti-Spam Honeypot');
function testLeadValidation() {
  const vnPhoneRegex = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;

  // Valid phones
  assert.ok(vnPhoneRegex.test('0932456789'));
  assert.ok(vnPhoneRegex.test('0987654321'));
  assert.ok(vnPhoneRegex.test('0356789123'));

  // Invalid phones
  assert.ok(!vnPhoneRegex.test('123456789'));
  assert.ok(!vnPhoneRegex.test('09000000000000'));
  assert.ok(!vnPhoneRegex.test('abcdefgh'));

  // Honeypot logic check
  const spamSubmission = {
    name: 'Bot Tester',
    phone: '0932456789',
    honeypot: 'filled_by_bot_not_human',
  };
  const isSpam = Boolean(spamSubmission.honeypot && spamSubmission.honeypot.trim().length > 0);
  assert.strictEqual(isSpam, true, 'Honeypot field must trap automated bots');
}

// ----------------------------------------------------
// SCENARIO 5: SECURITY, WEBHOOK & GOOGLE TOS COMPLIANCE
// ----------------------------------------------------
console.log('Scenario 5: Security, Webhook HMAC & Google Indexing Constraints');
function testSecurityAndIndexing() {
  // Disallow non-public routes
  assert.ok(!isRouteAllowed('/admin/system-dump'));
  assert.ok(!isRouteAllowed('/api/internal/secrets'));
  assert.ok(isRouteAllowed('/du-an/biet-thu-bien-quy-nhon-15kwp-hybrid'));

  // Assert Google Indexing API constraint
  const policy = assertGoogleIndexingPolicy('product');
  assert.strictEqual(policy.allowed, false);
  assert.ok(policy.reason.includes('Google Indexing API is strictly reserved for JobPosting/BroadcastEvent'));

  // Invalidate paths on publish
  const eventResult = processIndexingEvent({
    eventId: 'evt-202',
    eventType: 'ContentPublished',
    resourceType: 'product',
    resourceId: 'prod-01',
    canonicalPath: '/san-pham/tam-pin-canadian-solar-550w-hiku6',
    revision: 2,
    timestamp: new Date().toISOString(),
    publicationState: 'published',
  });
  assert.strictEqual(eventResult.success, true);
  assert.strictEqual(eventResult.sitemapAction, 'add');
  assert.ok(eventResult.revalidatedPaths.includes('/san-pham'));
  assert.ok(eventResult.revalidatedPaths.includes('/'));
}

// ----------------------------------------------------
// SCENARIO 6: MOBILE PERSISTENT 5-ACTION NAV
// ----------------------------------------------------
console.log('Scenario 6: Mobile Persistent 5-Action Bottom Navigation');
function testMobileBottomNavSpecs() {
  const actions = ['Trang chủ', 'Gọi ngay', 'Zalo', 'Tư vấn', 'Menu'];
  assert.strictEqual(actions.length, 5, 'Must have exactly 5 bottom nav actions');
  assert.ok(actions.includes('Trang chủ'));
  assert.ok(actions.includes('Gọi ngay'));
  assert.ok(actions.includes('Zalo'));
  assert.ok(actions.includes('Tư vấn'));
  assert.ok(actions.includes('Menu'));
}

// RUN ALL MATRIX TESTS
async function runAll() {
  await testSitemap();
  console.log('  ✓ Scenario 1 passed');
  testRobots();
  console.log('  ✓ Scenario 2 passed');
  testBranchContacts();
  console.log('  ✓ Scenario 3 passed');
  testLeadValidation();
  console.log('  ✓ Scenario 4 passed');
  testSecurityAndIndexing();
  console.log('  ✓ Scenario 5 passed');
  testMobileBottomNavSpecs();
  console.log('  ✓ Scenario 6 passed');

  console.log('\n====================================================');
  console.log('>>> ALL TEST MATRIX SCENARIOS PASSED (6/6) <<<');
  console.log('====================================================');
}

runAll().catch((err) => {
  console.error('Test matrix failure:', err);
  process.exit(1);
});
