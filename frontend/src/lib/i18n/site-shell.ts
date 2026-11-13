import type { BranchItem, SiteShellData, NavigationItemTree, ContactChannelItem } from '@/types/bmsolar-api';

const defaults: Record<string, string> = {
  "BM SOLAR — Giải Pháp Điện Mặt Trời Áp Mái": "BM SOLAR — Rooftop Solar Solutions",
  "Hồ sơ năng lực": "Company profile",
  "Chứng nhận & Đối tác": "Certifications and partners",
  "Điện mặt trời hộ gia đình": "Residential solar",
  "Điện mặt trời doanh nghiệp": "Commercial solar",
  "Điện mặt trời nhà xưởng": "Industrial solar",
  "Hỗ trợ khách hàng": "Customer support",
  "Chính sách bảo hành": "Warranty policy",
  "Quy trình lắp đặt": "Installation process",
  "Liên hệ báo giá": "Request a quote",
  'Biến tần Inverter': 'Inverters', 'Tấm pin năng lượng mặt trời': 'Solar panels', 'Pin lưu trữ Lithium (ESS)': 'Lithium battery storage', 'Phụ kiện & Khung giá đỡ': 'Accessories and mounting',
  'Áp mái hộ gia đình': 'Residential rooftop', 'Áp mái tòa nhà thương mại': 'Commercial rooftop', 'Áp mái nhà xưởng công nghiệp': 'Industrial rooftop',
  'Kiến thức điện mặt trời': 'Solar energy guides', 'Tiết kiệm điện': 'Energy savings',
  'Trụ Sở Chính — Gò Vấp, TP.HCM': 'Go Vap head office — Ho Chi Minh City', 'Chi Nhánh Miền Trung — TP. Quy Nhơn': 'Central Vietnam branch — Quy Nhon',
  'Chi Nhánh Đà Nẵng — Hải Châu': 'Da Nang branch — Hai Chau', 'Văn Phòng Đại Diện — TP. Hà Nội': 'Hanoi representative office',
  'Tỉnh Bình Định': 'Binh Dinh Province', 'Điện Mặt Trời Áp Mái Gia Đình': 'Residential rooftop solar',
  'Trạm sạc xe điện': 'EV charging stations', 'TP. Hồ Chí Minh': 'Ho Chi Minh City', 'Tỉnh Bình Dương': 'Binh Duong Province', 'Tỉnh Long An': 'Long An Province',
  'Bình Định': 'Binh Dinh', 'Đà Nẵng': 'Da Nang', 'Hà Nội': 'Hanoi', 'Chủ Nhật': 'Sunday', 'Trực hotline 24/7': '24/7 hotline',
  '568 Quang Trung, Phường 11, Quận Gò Vấp, TP. Hồ Chí Minh': '568 Quang Trung Street, Ward 11, Go Vap District, Ho Chi Minh City',
  '01 Lê Duẩn, Phường Lý Thường Kiệt, TP. Quy Nhơn, Tỉnh Bình Định': '01 Le Duan Street, Ly Thuong Kiet Ward, Quy Nhon, Binh Dinh Province',
  '120 Nguyễn Hữu Thọ, Phường Hòa Thuận Tây, Quận Hải Châu, TP. Đà Nẵng': '120 Nguyen Huu Tho Street, Hoa Thuan Tay Ward, Hai Chau District, Da Nang',
  'Số 88 Phố Vọng, Phường Phương Mai, Quận Đống Đa, TP. Hà Nội': '88 Pho Vong Street, Phuong Mai Ward, Dong Da District, Hanoi',
  'Hệ thống điện mặt trời áp mái 3kW - 10kW tiết kiệm hóa đơn tiền điện': 'Rooftop solar for households, typically 3–10 kW',
  'Giải pháp tối ưu chi phí vận hành cho văn phòng, khách sạn, cửa hàng': 'Solar power for offices, hotels and shops',
  'Quy mô công suất lớn 100kWp - 1MWp+, đạt chứng chỉ xanh ESG': 'Industrial-scale solar from 100 kWp to over 1 MWp',
  'Trang chủ': 'Home', 'Giới thiệu': 'About us', 'Giải pháp': 'Solutions', 'Sản phẩm': 'Products',
  'Dự án': 'Projects', 'Tin tức': 'News', 'Liên hệ': 'Contact', 'Hộ gia đình': 'Households',
  'Doanh nghiệp & Thương mại': 'Business and commercial', 'Nhà xưởng & Công nghiệp': 'Industrial facilities',
  'Chính sách bảo mật': 'Privacy policy', 'Điều khoản dịch vụ': 'Terms of service',
  'Tổng đài toàn quốc': 'National hotline', 'Chat Zalo tư vấn': 'Chat on Zalo', 'Email hỗ trợ': 'Support email',
  'Về BM SOLAR': 'About BM SOLAR', 'Giải pháp năng lượng': 'Energy solutions', 'Hỗ trợ & Chính sách': 'Support and policies',
  'Gọi ngay': 'Call now', 'Tư vấn': 'Consultation', 'Nghỉ': 'Closed', 'Thứ 2 - Thứ 7': 'Monday–Saturday',
  'Trụ sở chính Gò Vấp - TP.HCM': 'Go Vap head office – Ho Chi Minh City',
  'Chi nhánh Quy Nhơn - Bình Định': 'Quy Nhon branch – Binh Dinh',
};

function sourceStrings(shell: SiteShellData) {
  const nav = (items: NavigationItemTree[]): string[] => items.flatMap(item => [item.label, item.description || '', ...nav(item.children || [])]);
  const branches = shell.utilityBar.branches.flatMap(item => [item.name, item.provinceName || '', item.streetAddress,
    ...Object.entries(item.hours || {}).flat(), ...(item.channels || []).map(channel => channel.label)]);
  return [shell.brand.name, ...nav(shell.navigation), ...branches, ...(shell.footer.groups || []).flatMap(item => [item.title, ...item.links.map(link => link.label)]),
    ...(shell.footer.socialLinks || []).map(channel => channel.label), shell.footer.legalText || '', ...shell.mobileActions.map(item => item.label)];
}

export function siteTranslationFields(shell: SiteShellData) {
  return [...new Set(sourceStrings(shell).filter(Boolean))].map(source => ({ source, defaultValue: defaults[source] || '' }));
}

export function englishLabel(value: string, overrides?: Record<string, string>) {
  const direct = overrides && Object.hasOwn(overrides, value) ? overrides[value] : undefined;
  return direct?.trim() || (Object.hasOwn(defaults, value) ? defaults[value] : undefined) || value;
}

export function localizeSiteShell(shell: SiteShellData): SiteShellData {
  const translate = (value: string) => englishLabel(value, shell.englishLabels);
  const channel = (item: ContactChannelItem): ContactChannelItem => ({ ...item, label: translate(item.label) });
  const branch = (item: BranchItem): BranchItem => ({ ...item, name: translate(item.name), streetAddress: translate(item.streetAddress),
    provinceName: item.provinceName && translate(item.provinceName), channels: (item.channels || []).map(channel),
    hours: item.hours && Object.fromEntries(Object.entries(item.hours).map(([key, value]) => [translate(key), translate(value)])),
  });
  const nav = (items: NavigationItemTree[]): NavigationItemTree[] => items.map(item => ({
    ...item, label: translate(item.label), description: item.description && translate(item.description),
    children: item.children && nav(item.children),
  }));
  return { ...shell, brand: { ...shell.brand, name: translate(shell.brand.name), logo: { ...shell.brand.logo, alt: translate(shell.brand.logo.alt) } }, navigation: nav(shell.navigation), utilityBar: { ...shell.utilityBar, branches: shell.utilityBar.branches.map(branch) },
    footer: { ...shell.footer, legalText: shell.footer.legalText && translate(shell.footer.legalText), socialLinks: shell.footer.socialLinks?.map(channel),
      groups: shell.footer.groups?.map(group => ({ ...group, title: translate(group.title), links: group.links.map(link => ({ ...link, label: translate(link.label) })) })),
    }, socialDock: shell.socialDock?.map(channel), mobileActions: shell.mobileActions.map(item => ({ ...item, label: translate(item.label) })),
  };
}
