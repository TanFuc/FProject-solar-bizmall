'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SiteShellData } from '@/types/bmsolar-api';
import { useBranch } from '@/lib/contacts/branchContext';
import { useTranslation } from '@/lib/i18n';
import { resolveInternalRoute } from '@/lib/utils/routes';
import { MapPin, Phone, Mail, Facebook, Youtube, Linkedin } from 'lucide-react';

interface FooterProps {
 brand?: SiteShellData['brand'];
  footerData: SiteShellData['footer'];
  branches: SiteShellData['utilityBar']['branches'];
}

export function Footer({ branches, brand }: FooterProps) {
  const { activeHotline, activeZalo } = useBranch();
  const { isEnglish } = useTranslation();

  return (
    <footer className="bg-[#08182E] text-white border-t border-white/10 pt-16 pb-24 lg:pb-10 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Slogan */}
          <div className="space-y-4 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="BM SOLAR"
                width={150}
                height={50}
                className="h-10 w-auto object-contain"
              />
              <span className="sr-only">BM SOLAR</span>
            </Link>
            <p className="text-white/70 leading-relaxed">
              {isEnglish
                ? 'Comprehensive clean energy solutions. Survey - Consultation - Engineering - Turnkey EPC.'
                : 'Giải pháp năng lượng xanh toàn diện. Trải nghiệm - Tư vấn - Thiết kế - Thi công.'}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2 text-white/60">
              <a
                href="https://facebook.com/bmsolar.vn"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-brand-primary hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com/@bmsolar"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://linkedin.com/company/bmsolar"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Về BM SOLAR */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
              {isEnglish ? 'About BM SOLAR' : 'Về BM SOLAR'}
            </h4>
            <ul className="space-y-2 text-white/70">
              <li>
                <Link href="/gioi-thieu" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'About Us' : 'Giới thiệu'}
                </Link>
              </li>
              <li>
                <Link href="/gioi-thieu#tam-nhin" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Vision & Mission' : 'Tầm nhìn & Sứ mệnh'}
                </Link>
              </li>
              <li>
                <Link href="/gioi-thieu#doi-tac" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Strategic Partners' : 'Đối tác'}
                </Link>
              </li>
              <li>
                <Link href="/lien-he#chi-nhanh" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Branch Network' : 'Hệ thống chi nhánh'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Giải pháp */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
              {isEnglish ? 'Solutions' : 'Giải pháp'}
            </h4>
            <ul className="space-y-2 text-white/70">
              <li>
                <Link href="/giai-phap#ho-gia-dinh" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Residential Solar' : 'Hộ gia đình'}
                </Link>
              </li>
              <li>
                <Link href="/giai-phap#doanh-nghiep" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Commercial Solar' : 'Doanh nghiệp'}
                </Link>
              </li>
              <li>
                <Link href="/giai-phap#nha-xuong" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Industrial Rooftop' : 'Nhà xưởng'}
                </Link>
              </li>
              <li>
                <Link href="/san-pham" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'EV Charging Station' : 'Trạm sạc xe điện'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Khám phá */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
              {isEnglish ? 'Discover' : 'Khám phá'}
            </h4>
            <ul className="space-y-2 text-white/70">
              <li>
                <Link href="/san-pham" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Products' : 'Sản phẩm'}
                </Link>
              </li>
              <li>
                <Link href="/du-an" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Projects' : 'Dự án'}
                </Link>
              </li>
              <li>
                <Link href="/tin-tuc" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'News & Editorial' : 'Tin tức'}
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="hover:text-accent-orange transition-colors">
                  {isEnglish ? 'Contact' : 'Liên hệ'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Liên hệ nhanh */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
              {isEnglish ? 'Quick Contact' : 'Liên hệ nhanh'}
            </h4>
            <div className="space-y-2 text-white/70">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-accent-orange shrink-0" />
                <span className="font-semibold text-white">{activeHotline?.formatted || '1900 026 689'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-accent-orange shrink-0" />
                <span>info@bmsolar.vn</span>
              </p>
              <p className="flex items-center gap-2 text-white/60">
                <MapPin className="w-3.5 h-3.5 text-accent-orange shrink-0" />
                <span>Quy Nhơn • Gò Vấp - TP.HCM</span>
              </p>

              <div className="flex items-center gap-2 pt-2">
                <a
                  href={activeHotline?.actionUrl || 'tel:1900026689'}
                  className="px-3.5 py-1.5 rounded-full border border-white/20 hover:border-white text-white font-medium hover:bg-white/10 transition-colors"
                >
                  {isEnglish ? 'Call' : 'Gọi ngay'}
                </a>
                <a
                  href={activeZalo?.actionUrl || 'https://zalo.me/0932456789'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-full border border-blue-400 text-blue-400 font-medium hover:bg-blue-400/10 transition-colors"
                >
                  Zalo
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal / Copyright Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white/50 text-[11px]">
          <p>
            © 2026 BM SOLAR. Bản quyền nội dung và thiết kế thuộc về BM SOLAR. GPKD số 0312345678 do Sở KHĐT TP.HCM cấp.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/chinh-sach-bao-mat" className="hover:text-white transition-colors">
              Chính sách bảo mật
            </Link>
            <span>|</span>
            <Link href="/dieu-khoan" className="hover:text-white transition-colors">
              Điều khoản sử dụng
            </Link>
            <span>|</span>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
