import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { getSiteShell } from '@/lib/api/client';
import { BranchProvider } from '@/lib/contacts/branchContext';
import { I18nProvider } from '@/lib/i18n';
import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ConsultationModal } from '@/components/layout/ConsultationModal';
import { constructMetadata } from '@/lib/seo/metadata';
import {
  getOrganizationSchema,
  getWebSiteSchema,
  getLocalBusinessSchema,
} from '@/lib/seo/structuredData';
import { JsonLd } from '@/components/seo/JsonLd';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = constructMetadata();

export const viewport: Viewport = {
  themeColor: '#0D4EA6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteShell = await getSiteShell();
  const orgSchema = getOrganizationSchema();
  const webSiteSchema = getWebSiteSchema();
  const hqSchema = getLocalBusinessSchema('quynhon');
  const hcmSchema = getLocalBusinessSchema('tphcm');

  return (
    <html lang="vi" className={inter.variable}>
      <head>
        <JsonLd data={[orgSchema, webSiteSchema, hqSchema, hcmSchema]} />
      </head>
      <body className="min-h-screen flex flex-col bg-surface-white text-ink antialiased">
        <I18nProvider>
          <BranchProvider initialBranches={siteShell.utilityBar.branches}>
            {/* Desktop Topbar */}
            <TopBar />

            {/* Main Navigation Header */}
            <Header navigation={siteShell.navigation} />

            {/* Main Content Area */}
            <main className="flex-1 w-full">{children}</main>

            {/* Global Footer */}
            <Footer
              footerData={siteShell.footer}
              branches={siteShell.utilityBar.branches}
            />

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

