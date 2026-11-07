import crypto from 'crypto';

export type PublicationState = 'draft' | 'review' | 'published' | 'unpublished';
export type SitemapState = 'sitemap_eligible' | 'sitemap_listed' | 'sitemap_removed';
export type GscObservationState =
  | 'gsc_sitemap_submitted'
  | 'gsc_inspection_requested'
  | 'gsc_observed_indexed'
  | 'gsc_observed_not_indexed'
  | 'gsc_unknown';
export type RevalidateState = 'revalidate_queued' | 'revalidate_success' | 'revalidate_failed';

export type ContentEventType =
  | 'ContentPublished'
  | 'ContentUpdated'
  | 'ContentUnpublished'
  | 'ContentMoved';

export interface ContentOutboxEvent {
  eventId: string;
  eventType: ContentEventType;
  resourceType: 'product' | 'post' | 'page' | 'project' | 'solution';
  resourceId: string;
  canonicalPath: string;
  previousPath?: string;
  revision: number;
  timestamp: string;
  publicationState: PublicationState;
}

export interface RevalidationResult {
  success: boolean;
  event: ContentEventType;
  canonicalPath: string;
  revalidatedPaths: string[];
  sitemapAction: 'add' | 'update' | 'remove' | 'none';
  revalidateState: RevalidateState;
  auditMessage: string;
}

/**
 * Allowlisted route patterns that can be revalidated by CMS webhooks.
 * Prevents revalidation of private admin or internal routes.
 */
export const ALLOWED_ROUTE_PATTERNS = [
  /^\/$/,
  /^\/gioi-thieu$/,
  /^\/giai-phap$/,
  /^\/giai-phap\/[a-z0-9-]+$/,
  /^\/san-pham$/,
  /^\/san-pham\/[a-z0-9-]+$/,
  /^\/du-an$/,
  /^\/du-an\/[a-z0-9-]+$/,
  /^\/tin-tuc$/,
  /^\/tin-tuc\/[a-z0-9-]+$/,
  /^\/lien-he$/,
];

/**
 * Validates if a target path matches allowed public website routes.
 */
export function isRouteAllowed(path: string): boolean {
  return ALLOWED_ROUTE_PATTERNS.some((pattern) => pattern.test(path));
}

/**
 * Verifies HMAC-SHA256 signature for incoming webhook payloads.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !secret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  // Constant-time string comparison to prevent timing attacks
  try {
    const bufA = Buffer.from(signatureHeader, 'hex');
    const bufB = Buffer.from(expectedSignature, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Maps content outbox events to affected Next.js routes and sitemap actions.
 */
export function processIndexingEvent(event: ContentOutboxEvent): RevalidationResult {
  const { eventType, canonicalPath, previousPath, resourceType } = event;

  if (!isRouteAllowed(canonicalPath)) {
    return {
      success: false,
      event: eventType,
      canonicalPath,
      revalidatedPaths: [],
      sitemapAction: 'none',
      revalidateState: 'revalidate_failed',
      auditMessage: `Path "${canonicalPath}" is not in allowlisted route patterns`,
    };
  }

  const pathsToRevalidate: string[] = [canonicalPath];

  // Invalidate parent listing pages and homepage when items change
  switch (resourceType) {
    case 'product':
      pathsToRevalidate.push('/san-pham', '/');
      break;
    case 'post':
      pathsToRevalidate.push('/tin-tuc', '/');
      break;
    case 'project':
      pathsToRevalidate.push('/du-an', '/');
      break;
    case 'solution':
      pathsToRevalidate.push('/giai-phap', '/');
      break;
    default:
      pathsToRevalidate.push('/');
  }

  // Handle slug change / move: invalidate previous route as well
  if (eventType === 'ContentMoved' && previousPath && isRouteAllowed(previousPath)) {
    pathsToRevalidate.push(previousPath);
  }

  // Determine sitemap action in accordance with 13_INDEXING_AUTOMATION.md
  let sitemapAction: 'add' | 'update' | 'remove' | 'none' = 'none';
  if (eventType === 'ContentPublished') {
    sitemapAction = 'add';
  } else if (eventType === 'ContentUpdated') {
    sitemapAction = 'update';
  } else if (eventType === 'ContentUnpublished') {
    sitemapAction = 'remove';
  } else if (eventType === 'ContentMoved') {
    sitemapAction = 'update';
  }

  return {
    success: true,
    event: eventType,
    canonicalPath,
    revalidatedPaths: Array.from(new Set(pathsToRevalidate)),
    sitemapAction,
    revalidateState: 'revalidate_success',
    auditMessage: `Successfully mapped event ${eventType} for ${canonicalPath} (Affects ${pathsToRevalidate.length} paths)`,
  };
}

/**
 * Enforces Google Indexing API compliance policy.
 * PER GOOGLE TOS: Google Indexing API MUST ONLY be used for JobPosting or BroadcastEvent.
 * Using it for standard commercial or content pages triggers indexing penalties.
 */
export function assertGoogleIndexingPolicy(resourceType: string): {
  allowed: boolean;
  reason: string;
} {
  // BM Solar has commercial solar equipment, EPC solutions, news articles, and projects.
  // None of these are JobPosting or BroadcastEvent.
  return {
    allowed: false,
    reason:
      'Per Google TOS & 13_INDEXING_AUTOMATION.md, Google Indexing API is strictly reserved for JobPosting/BroadcastEvent. Standard commercial/editorial pages must rely on sitemaps, robots.txt, and Search Console sitemap submission.',
  };
}

