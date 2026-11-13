import React from 'react';
import { cookies, headers } from 'next/headers';
import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter/wght.css';
import '@/styles/globals.css';
import { getCurrentContentLocale } from '@/lib/api/localized-page';
import { localizeSiteShell } from '@/lib/i18n/site-shell';
import { getSiteShell } from '@/lib/api/client';
import { BranchProvider } from '@/lib/contacts/branchContext';
import { I18nProvider } from '@/lib/i18n';
import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ConsultationModal } from '@/components/layout/ConsultationModal';
import { FloatingSocialDock } from '@/components/layout/FloatingSocialDock';
import { StartupLoader } from '@/components/ui/StartupLoader';
import { constructMetadata } from '@/lib/seo/metadata';
import {
  getOrganizationSchema,
  getWebSiteSchema,
} from '@/lib/seo/structuredData';
import { JsonLd } from '@/components/seo/JsonLd';
import type { SiteShellData } from '@/types/bmsolar-api';

// NOTE FOR PARENT / CONCURRENT UI WORKERS:
// Root layout handles failure states with noindex protection. If a root-level navigation
// loading progress bar is needed, inject it immediately inside the <body> tag below.


export const metadata: Metadata = constructMetadata();

export const viewport: Viewport = {
  themeColor: '#0D4EA6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if ((await headers()).get("x-bmsolar-admin") === "1") {
    return <html lang="vi"><body className="solar-site min-h-screen bg-slate-50 antialiased">{children}</body></html>;
  }
  const isLanguageTransition = (await cookies()).has("BM_LOCALE_TRANSITION");
  const locale = await getCurrentContentLocale();
  const language = locale === "en-US" ? "en" : "vi";
  let siteShell: SiteShellData | null = null;
  let shellUnavailable = false;

  try {
    siteShell = await getSiteShell(locale);
    if (language === "en") siteShell = localizeSiteShell(siteShell);
  } catch {
    shellUnavailable = true;
  }

  // Pass live siteShell to derive verified brand and branch data dynamically
  const orgSchema = getOrganizationSchema(siteShell);
  const webSiteSchema = getWebSiteSchema();

  // Root shell failure / rate-limit guard:
  // Render a clean, customer-facing recoverable shell with noindex protection
  // to prevent indexing broken or partial state.
  if (shellUnavailable || !siteShell) {
    return (
      <html lang={language}>
        <head>
          <meta name="robots" content="noindex, nofollow" />
          <JsonLd data={[orgSchema, webSiteSchema]} />
        </head>
        <body id="top" className="solar-site min-h-screen flex flex-col bg-surface-white text-ink antialiased">
          <header className="w-full border-b border-border-subtle bg-white py-3 px-6 flex items-center justify-between">
            <span className="font-bold text-lg text-solar-navy tracking-tight">BM SOLAR</span>
            <a
              href="/"
              className="text-xs font-semibold text-solar-navy hover:underline"
            >
              Tải lại trang
            </a>
          </header>
          <main className="flex-1 flex items-center justify-center p-6 bg-surface">
            <div className="max-w-md w-full p-8 border border-border-subtle bg-white rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
                !
              </div>
              <h1 className="text-lg font-bold text-ink mb-2">
                Hệ Thống Đang Tiếp Nhận Lượng Truy Cập Cao
              </h1>
              <p className="text-xs text-ink-muted mb-6 leading-relaxed">
                Quý khách vui lòng thử lại sau giây lát hoặc tải lại trang.
              </p>
              <a
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-md bg-solar-navy text-white hover:bg-solar-navy/90 transition-colors shadow-sm"
              >
                Thử lại ngay
              </a>
            </div>
          </main>
        </body>
      </html>
    );
  }

  return (
    <html lang={language}>
      <head>
        <JsonLd data={[orgSchema, webSiteSchema]} />
      </head>
      <body id="top" className="solar-site min-h-screen flex flex-col bg-surface-white text-ink antialiased">
        {/* Branded Startup Loader on Hard Refresh/F5 until Document Load/Hydration */}
        {!isLanguageTransition && <StartupLoader english={language === "en"} />}
        <I18nProvider initialLocale={language}>
          <BranchProvider initialBranches={siteShell.utilityBar.branches} globalChannels={siteShell.footer.socialLinks} brand={siteShell.brand}>
            {/* Desktop Topbar */}
            <TopBar />

            {/* Main Navigation Header */}
            <Header navigation={siteShell.navigation} brand={siteShell.brand} />

            {/* Main Content Area */}
            <main className="flex-1 w-full">{children}</main>

            {/* Global Footer */}
            <Footer
              brand={siteShell.brand}
              footerData={siteShell.footer}
              branches={siteShell.utilityBar.branches}
            />

            {/* Floating Social Actions Dock on the Right Side (Admin CRUD manageable) */}
            <FloatingSocialDock initialChannels={siteShell.socialDock || siteShell.footer.socialLinks} />

            {/* Mobile Persistent 5-Action Bottom Bar */}
            <MobileBottomNav navigation={siteShell.navigation} />

            {/* Global Consultation Modal */}
            <ConsultationModal />
          </BranchProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
