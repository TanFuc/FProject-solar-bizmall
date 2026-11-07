'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SiteShellData } from '@/types/bmsolar-api';
import { useTranslation } from '@/lib/i18n';
import { MapPin, Phone, Mail, ShieldCheck, Zap } from 'lucide-react';

interface FooterProps {
  footerData: SiteShellData['footer'];
  branches: SiteShellData['utilityBar']['branches'];
}

export function Footer({ footerData, branches }: FooterProps) {
  const { t, isEnglish } = useTranslation();

  return (
    <footer className="bg-brand-darker text-white border-t border-white/10 pt-16 pb-24 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo.png"
                alt="BM SOLAR"
                width={170}
                height={55}
                className="h-12 w-auto object-contain brightness-110"
              />
            </Link>
            <p className="text-xs text-white/70 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="pt-2 space-y-1.5 text-xs text-white/60">
              <p>
                <strong>MST / Tax ID:</strong> {footerData.taxCode || '4101625899'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] bg-white/10 px-2.5 py-1 rounded-md text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Tier 1 Bloomberg
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] bg-white/10 px-2.5 py-1 rounded-md text-accent-orange font-medium">
                  <Zap className="w-3.5 h-3.5" /> {isEnglish ? '25-Yr Warranty' : 'Bảo hành 25 năm'}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Solutions */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase border-l-2 border-accent-orange pl-2.5">
              {t('footer.colSolutions')}
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link href="/giai-phap#ho-gia-dinh" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Residential Solar PV (3 - 15 kWp)' : 'Điện mặt trời Hộ gia đình (3kWp - 15kWp)'}
                </Link>
              </li>
              <li>
                <Link href="/giai-phap#doanh-nghiep" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Commercial & Hotel Solar (20 - 100 kWp)' : 'Điện mặt trời Doanh nghiệp & Khách sạn (20kWp - 100kWp)'}
                </Link>
              </li>
              <li>
                <Link href="/giai-phap#nha-xuong" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Industrial Zero-Export Solar (100kWp - 2MWp)' : 'Điện mặt trời Nhà xưởng Zero-Export (100kWp - 2MWp)'}
                </Link>
              </li>
              <li>
                <Link href="/san-pham" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Lithium BESS Energy Storage Systems' : 'Hệ thống lưu trữ pin Lithium BESS'}
                </Link>
              </li>
              <li>
                <Link href="/san-pham" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Smart Electric Vehicle (EV) Chargers' : 'Trạm sạc xe điện thông minh EV Charger'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Products & Resources */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase border-l-2 border-accent-orange pl-2.5">
              {isEnglish ? 'Products & Resources' : 'Thiết Bị & Tài Nguyên'}
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link href="/san-pham" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Solar Inverters Deye, Huawei, Growatt' : 'Biến tần Inverter Deye, Huawei, Growatt'}
                </Link>
              </li>
              <li>
                <Link href="/san-pham" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Solar Panels Canadian Solar, Jinko 550W+' : 'Tấm pin Canadian Solar, Jinko, Longi 550W+'}
                </Link>
              </li>
              <li>
                <Link href="/du-an" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Completed Reference Projects' : 'Dự án thực tế đã hoàn thành'}
                </Link>
              </li>
              <li>
                <Link href="/tin-tuc" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Technical Guides & Energy Policy' : 'Cẩm nang kỹ thuật & Chính sách điện lực'}
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Contact & 24/7 Engineering Support' : 'Liên hệ & Hỗ trợ kỹ thuật 24/7'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Branch Offices */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase border-l-2 border-accent-orange pl-2.5">
              {t('footer.colBranches')}
            </h4>
            <div className="space-y-4 text-xs text-white/75">
              {branches.map((b) => (
                <div key={b.id} className="space-y-1">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent-orange shrink-0" />
                    {b.name}
                  </p>
                  <p className="text-white/60 pl-5 leading-relaxed">{b.streetAddress}</p>
                  {b.channels.find((c) => c.type === 'phone') && (
                    <p className="pl-5 text-accent-orange font-bold flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {b.channels.find((c) => c.type === 'phone')?.formatted || '0932 456 789'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Contact channels */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p className="text-center md:text-left leading-relaxed">
            {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-white/70">
              <Mail className="w-3.5 h-3.5 text-accent-orange" />
              kinhdoanh@bmsolar.vn
            </span>
            <span className="flex items-center gap-1 text-white/70">
              <Phone className="w-3.5 h-3.5 text-accent-orange" />
              1900 6888
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

