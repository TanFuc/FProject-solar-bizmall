'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ArrowUpRight } from 'lucide-react';
import { SiteShellData } from '@/types/bmsolar-api';
import { useBranch } from '@/lib/contacts/branchContext';
import { useTranslation } from '@/lib/i18n';
import { channelUrl } from '@/lib/contacts/channelUrl';

interface Props {
  brand?: SiteShellData['brand'];
  footerData: SiteShellData['footer'];
  branches: SiteShellData['utilityBar']['branches'];
}

export function Footer({ brand, footerData, branches }: Props) {
  const { t } = useTranslation();
  const { activeHotline, activeZalo, activeBranch } = useBranch();
  const email = activeBranch?.channels.find((channel) => channel.type === 'email');
  const logoUrl = '/images/logo-footer.png';
  const logoAlt = brand?.logo.alt || brand?.name || 'BM SOLAR';

  return (
    <footer className="text-white border-t border-white/10 bg-[#082b52]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-8">
          {/* Brand Info & Genuine Logo */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-accent-orange rounded-md p-1"
              aria-label={brand?.name || 'BM SOLAR'}
            >
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={145}
                height={44}
                className="h-10 w-auto object-contain transition-opacity group-hover:opacity-90"
              />
              <span className="sr-only">{brand?.name || 'BM SOLAR'}</span>
            </Link>
            <p className="text-white/70 leading-relaxed text-xs sm:text-sm">
              {brand?.name}
            </p>
            <div className="flex gap-3 flex-wrap">
              {footerData.socialLinks
                ?.filter((channel) => ['facebook', 'youtube'].includes(channel.type))
                .map((channel) => (
                  <a
                    key={channel.id}
                    href={channelUrl(channel)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-white/70 hover:text-white transition-colors text-xs"
                  >
                    {channel.label}
                    <ArrowUpRight size={12} />
                  </a>
                ))}
            </div>
          </div>

          {/* Footer Groups */}
          {footerData.groups?.map((group) => (
            <div key={group.title} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                {group.title}
              </h4>
              <ul className="space-y-2 text-white/70 text-xs">
                {group.links.map((link, index) => (
                  <li key={`${link.url}:${index}`}>
                    <Link
                      href={link.url}
                      className="hover:text-accent-orange transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Branches & Direct Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">{t("nav.contact")}</h4>
            {activeHotline && (
              <a
                href={channelUrl(activeHotline)}
                className="flex items-center gap-2 text-xs text-white/80 hover:text-accent-orange transition-colors"
              >
                <Phone size={14} className="text-accent-orange shrink-0" />
                {activeHotline.formatted || activeHotline.target}
              </a>
            )}
            {email && (
              <a
                href={channelUrl(email)}
                className="flex items-center gap-2 text-xs text-white/80 hover:text-accent-orange transition-colors"
              >
                <Mail size={14} className="text-accent-orange shrink-0" />
                {email.target}
              </a>
            )}
            {branches.map((branch) => (
              <Link
                key={branch.id}
                href="/lien-he#chi-nhanh"
                className="flex items-start gap-2 text-white/70 hover:text-white transition-colors text-xs group"
              >
                <MapPin size={14} className="shrink-0 text-accent-orange mt-0.5" />
                <div>
                  <span className="font-semibold text-white/90 group-hover:text-accent-orange transition-colors">
                    {branch.isHeadquarters ? '⭐ ' : ''}
                    {branch.name}
                  </span>
                  <p className="text-[11px] text-white/50 line-clamp-1">{branch.streetAddress}</p>
                </div>
              </Link>
            ))}
            {activeZalo && (
              <a
                href={channelUrl(activeZalo)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full border border-white/30 px-4 py-1.5 text-xs text-white hover:border-white hover:bg-white/10 transition-colors"
              >
                Zalo
              </a>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}
