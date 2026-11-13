import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { object } from "@/lib/api/blocks";
import {API_BASE_URL,invalidatePublicCache} from '@/lib/api/client';
import {
  isRouteAllowed,
  verifyWebhookSignature,
  processIndexingEvent,
  ContentOutboxEvent,
} from '@/lib/seo/indexingEvents';

const REVALIDATE_SECRET =
  process.env.CMS_REVALIDATE_SECRET;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const signatureHeader = req.headers.get('x-bmsolar-signature');
    const rawBody = await req.text();

    // Check authorization via Bearer token OR HMAC signature
    const isBearerValid = !!REVALIDATE_SECRET && authHeader === `Bearer ${REVALIDATE_SECRET}`;
    const isHmacValid = REVALIDATE_SECRET && signatureHeader
      ? verifyWebhookSignature(rawBody, signatureHeader, REVALIDATE_SECRET)
      : false;

    let isAdmin = false;
    if (!isBearerValid && !isHmacValid && authHeader?.startsWith("Bearer ")) {
      const profile = await fetch(API_BASE_URL + "/admin/auth/me", { headers: { Authorization: authHeader }, cache: "no-store" });
      if (profile.ok) {
        const body: unknown = await profile.json();
        const account = object(body) && object(body.data) ? body.data : null;
        isAdmin = !!account && ((Array.isArray(account.roles) && account.roles.includes("super_admin")) ||
          (Array.isArray(account.permissions) && account.permissions.includes("cms.page.publish")));
      }
    }
    if (!isBearerValid && !isHmacValid && !isAdmin) {
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

      invalidatePublicCache();
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

    invalidatePublicCache();
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
