import assert from 'node:assert/strict';
import { productFromApi, projectFromApi, listFromApi } from '../src/lib/api/public-adapters';
import {
  submitLeadRequest,
  getProducts,
  getProjectBySlug,
  getSiteShell,
  getPageBySlug,
  getProductCategories,
  getAudiences,
  invalidatePublicCache,
} from '../src/lib/api/client';

async function main() {
  // 1. Public DTO Adapters
  assert.equal(
    productFromApi({ id: 'p', sku: 's', slug: 'solar', name: 'Panel', coverUrl: 'https://example.com/p.jpg' })?.coverMediaUrl,
    'https://example.com/p.jpg'
  );
  assert.equal(
    projectFromApi({ id: 'p', slug: 'solar', title: 'Project', projectTypeSlug: 'household', projectTypeName: 'Household' })?.projectType?.name,
    'Household'
  );
  assert.equal(
    listFromApi({ data: [null, { id: 'p', sku: 's', slug: 'solar', name: 'Panel' }], meta: { total: 7, page: 2, pageSize: 1, totalPages: 7 } }, productFromApi).meta.total,
    7
  );

  const originalFetch = globalThis.fetch;
  const payload = { name: 'Local QA', phone: '0900000000', message: 'Test', sourcePage: '/', privacyConsent: true, privacyPolicyVersion: 'v1' };

  try {
    // 2. Truthful failure / NO demo data test:
    // Root layout & CMS errors must be truthful so UI error boundaries trigger real retry.
    globalThis.fetch = async () => {
      throw new Error('offline');
    };

    // getSiteShell must throw on network error, NOT return fake demo site shell
    await assert.rejects(
      async () => {
        await getSiteShell();
      },
      /offline/,
      'getSiteShell must throw real error on offline failure, no fake demo fallback'
    );

    // getPageBySlug must throw on network error, NOT return fake home page
    await assert.rejects(
      async () => {
        await getPageBySlug('home');
      },
      /offline/,
      'getPageBySlug must throw real error on offline failure, no fake demo fallback'
    );

    // Empty list responses must never return hardcoded demo products
    const emptyProducts = await getProducts();
    assert.equal(emptyProducts.data.length, 0);
    assert.equal(emptyProducts.meta.total, 0);

    const emptyProject = await getProjectBySlug('du-an-khong-ton-tai');
    assert.equal(emptyProject, null);

    const offlineLead = await submitLeadRequest(payload);
    assert.equal(offlineLead.success, false);

    // 3. Lead acknowledgement truthfulness: success ONLY with valid referenceCode
    globalThis.fetch = async () => new Response('{}', { status: 200 });
    assert.equal((await submitLeadRequest(payload)).success, false);

    globalThis.fetch = async () => Response.json({ data: { referenceCode: 'BM-2026-QA' } });
    assert.equal((await submitLeadRequest(payload)).success, true);

    // 4. Concurrent GET De-duplication test:
    invalidatePublicCache();
    let fetchCount = 0;
    globalThis.fetch = async () => {
      fetchCount++;
      await new Promise((r) => setTimeout(r, 20));
      return Response.json({
        data: [{ id: 'cat-1', name: 'Pin quang điện', slug: 'pin-quang-dien', sortOrder: 1, status: 'active' }],
      });
    };

    // 3 concurrent fetches for categories must share 1 in-flight HTTP request
    const [c1, c2, c3] = await Promise.all([
      getProductCategories(),
      getProductCategories(),
      getProductCategories(),
    ]);

    assert.equal(c1.length, 1);
    assert.equal(c2.length, 1);
    assert.equal(c3.length, 1);
    assert.equal(fetchCount, 1, 'Concurrent calls to getProductCategories must be de-duplicated into a single HTTP fetch');

    // 5. Query Isolation: Different search/filter queries must not mix up
    const requestedUrls: string[] = [];
    globalThis.fetch = async (input) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
      requestedUrls.push(url);
      return Response.json({ data: [], meta: { page: 1, pageSize: 12, total: 0, totalPages: 1 } });
    };

    await getProducts({ category: 'panels', page: 1 });
    await getProducts({ category: 'inverters', page: 2 });

    assert.equal(requestedUrls.length, 2);
    assert.ok(requestedUrls[0]?.includes('category=panels'), 'Query 1 must target category=panels');
    assert.ok(requestedUrls[1]?.includes('category=inverters'), 'Query 2 must target category=inverters');
    assert.ok(requestedUrls[1]?.includes('page=2'), 'Query 2 must preserve page=2');

    // 6. 429 Retry with Retry-After header:
    let attempt = 0;
    globalThis.fetch = async () => {
      attempt++;
      if (attempt === 1) {
        return new Response(JSON.stringify({ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } }), {
          status: 429,
          headers: { 'Retry-After': '1', 'Content-Type': 'application/json' },
        });
      }
      return Response.json({
        data: [{ id: 'aud-1', code: 'household', label: 'Hộ gia đình', enabled: true }],
      });
    };

    invalidatePublicCache();
    const audiences = await getAudiences();
    assert.equal(audiences.length, 1);
    assert.equal(attempt, 2, 'publicFetch must retry on 429 and succeed on attempt 2');

  } finally {
    globalThis.fetch = originalFetch;
    invalidatePublicCache();
  }

  console.log('PASS: truthful errors (no demo data), lead verification, concurrent de-dup, query isolation, 429 retry');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
