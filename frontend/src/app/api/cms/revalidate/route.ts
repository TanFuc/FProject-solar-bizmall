import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  isRouteAllowed,
  verifyWebhookSignature,
  processIndexingEvent,
  ContentOutboxEvent,
} from '@/lib/seo/indexingEvents';

const REVALIDATE_SECRET =
  process.env.CMS_REVALIDATE_SECRET || 'bmsolar_cms_revalidate_secret_key_2026!';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const signatureHeader = req.headers.get('x-bmsolar-signature');
    const rawBody = await req.text();

    // Check authorization via Bearer token OR HMAC signature
    const isBearerValid = authHeader === `Bearer ${REVALIDATE_SECRET}`;
    const isHmacValid = signatureHeader
      ? verifyWebhookSignature(rawBody, signatureHeader, REVALIDATE_SECRET)
      : false;

    if (!isBearerValid && !isHmacValid) {
      return NextResponse.json(
        {
          error: 'Unauthorized revalidation',
          message: 'Valid Bearer token or x-bmsolar-signature header required.',
        },
        { status: 401 }
      );
    }

    let payload: Record<string, unknown> = {};
    if (rawBody.trim()) {
      payload = JSON.parse(rawBody);
    }

    // Branch A: Structured ContentOutboxEvent
    if (payload.eventType && payload.canonicalPath) {
      const event = payload as unknown as ContentOutboxEvent;
      const result = processIndexingEvent(event);

      if (!result.success) {
        return NextResponse.json(
          { error: 'Invalid revalidation event', details: result.auditMessage },
          { status: 400 }
        );
      }

      // Revalidate all affected routes
      for (const p of result.revalidatedPaths) {
        revalidatePath(p);
      }

      return NextResponse.json({
        revalidated: true,
        eventType: result.event,
        canonicalPath: result.canonicalPath,
        revalidatedPaths: result.revalidatedPaths,
        sitemapAction: result.sitemapAction,
        timestamp: new Date().toISOString(),
      });
    }

    // Branch B: Direct path revalidation
    const targetPath = (payload.path as string) || '/';
    if (!isRouteAllowed(targetPath)) {
      return NextResponse.json(
        { error: 'Path not allowed', message: `Route "${targetPath}" is not in public allowlist.` },
        { status: 400 }
      );
    }

    revalidatePath(targetPath);

    return NextResponse.json({
      revalidated: true,
      path: targetPath,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to process revalidation', message: String(err) },
      { status: 500 }
    );
  }
}
