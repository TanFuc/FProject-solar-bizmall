import {
  SiteShellData,
  CMSPageData,
  ProductCard,
  ProjectItem,
  ArticleItem,
  AudienceItem,
  ProductCategoryItem,
} from '@/types/bmsolar-api';

export const fallbackSiteShell: SiteShellData = {
  brand: {
    name: 'BM SOLAR',
    logo: {
      url: '/images/logo.png',
      alt: 'BM SOLAR — Tổng Thầu EPC Điện Mặt Trời & Lưu Trữ Năng Lượng',
    },
  },
  utilityBar: {
    visible: true,
    showHotline: true,
    showEmail: true,
    announcement: 'BM SOLAR — Khảo sát & Thiết kế 3D hệ thống điện mặt trời mái nhà miễn phí 100%!',
    branches: [
      {
        id: 'br_qn_01',
        code: 'QN-HQ',
        slug: 'quy-nhon',
        name: 'Trụ Sở Chính — TP. Quy Nhơn',
        streetAddress: '01 Lê Duẩn, P. Lý Thường Kiệt, TP. Quy Nhơn, Bình Định',
        hours: { 'T2-T7': '07:30 - 17:30', 'CN': 'Trực hotline 24/7' },
        isActive: true,
        channels: [
          {
            id: 'ch_qn_phone',
            type: 'phone',
            label: 'Hotline Quy Nhơn',
            target: '0932456789',
            actionUrl: 'tel:+84932456789',
            formatted: '0932 456 789',
            sortOrder: 1,
          },
          {
            id: 'ch_qn_zalo',
            type: 'zalo',
            label: 'Zalo BM Solar Quy Nhơn',
            target: '0932456789',
            actionUrl: 'https://zalo.me/0932456789',
            formatted: 'Zalo OA',
            sortOrder: 2,
          },
        ],
      },
      {
        id: 'br_hcm_02',
        code: 'HCM-GV',
        slug: 'go-vap-hcm',
        name: 'Chi Nhánh TP.HCM — Gò Vấp',
        streetAddress: '568 Quang Trung, Phường 11, Quận Gò Vấp, TP. Hồ Chí Minh',
        hours: { 'T2-T7': '08:00 - 18:00', 'CN': 'Trực hotline 24/7' },
        isActive: true,
        channels: [
          {
            id: 'ch_hcm_phone',
            type: 'phone',
            label: 'Hotline TP.HCM',
            target: '0909888999',
            actionUrl: 'tel:+84909888999',
            formatted: '0909 888 999',
            sortOrder: 1,
          },
          {
            id: 'ch_hcm_zalo',
            type: 'zalo',
            label: 'Zalo BM Solar TP.HCM',
            target: '0909888999',
            actionUrl: 'https://zalo.me/0909888999',
            formatted: 'Zalo OA',
            sortOrder: 2,
          },
        ],
      },
    ],
  },
  navigation: [
    {
      id: 'nav_home',
      label: 'Trang chủ',
      targetKind: 'internalRoute',
      targetRef: '/',
      visibility: 'all',
    },
    {
      id: 'nav_about',
      label: 'Giới thiệu',
      targetKind: 'internalRoute',
      targetRef: '/gioi-thieu',
      visibility: 'all',
    },
    {
      id: 'nav_solutions',
      label: 'Giải pháp',
      targetKind: 'internalRoute',
      targetRef: '/giai-phap',
      visibility: 'all',
      children: [
        {
          id: 'nav_sol_res',
          label: 'Điện Mặt Trời Hộ Gia Đình',
          targetKind: 'internalRoute',
          targetRef: '/giai-phap#ho-gia-dinh',
          visibility: 'all',
        },
        {
          id: 'nav_sol_com',
          label: 'Điện Mặt Trời Doanh Nghiệp',
          targetKind: 'internalRoute',
          targetRef: '/giai-phap#doanh-nghiep',
          visibility: 'all',
        },
        {
          id: 'nav_sol_ind',
          label: 'Điện Mặt Trời Nhà Xưởng',
          targetKind: 'internalRoute',
          targetRef: '/giai-phap#nha-xuong',
          visibility: 'all',
        },
      ],
    },
    {
      id: 'nav_products',
      label: 'Sản phẩm',
      targetKind: 'internalRoute',
      targetRef: '/san-pham',
      visibility: 'all',
      children: [
        {
          id: 'nav_prod_panel',
          label: 'Tấm Pin Năng Lượng Mặt Trời',
          targetKind: 'internalRoute',
          targetRef: '/san-pham?category=tam-pin',
          visibility: 'all',
        },
        {
          id: 'nav_prod_inverter',
          label: 'Biến Tần Inverter Hòa Lưới & Hybrid',
          targetKind: 'internalRoute',
          targetRef: '/san-pham?category=inverter',
          visibility: 'all',
        },
        {
          id: 'nav_prod_bess',
          label: 'Hệ Thống Pin Lưu Trữ BESS',
          targetKind: 'internalRoute',
          targetRef: '/san-pham?category=pin-luu-tru',
          visibility: 'all',
        },
        {
          id: 'nav_prod_ev',
          label: 'Trạm Sạc Xe Điện EV',
          targetKind: 'internalRoute',
          targetRef: '/san-pham?category=tram-sac-ev',
          visibility: 'all',
        },
      ],
    },
    {
      id: 'nav_projects',
      label: 'Dự án',
      targetKind: 'internalRoute',
      targetRef: '/du-an',
      visibility: 'all',
    },
    {
      id: 'nav_news',
      label: 'Tin tức',
      targetKind: 'internalRoute',
      targetRef: '/tin-tuc',
      visibility: 'all',
    },
    {
      id: 'nav_contact',
      label: 'Liên hệ',
      targetKind: 'internalRoute',
      targetRef: '/lien-he',
      visibility: 'all',
    },
  ],
  footer: {
    companyName: 'CÔNG TY TNHH NĂNG LƯỢNG BM SOLAR VIỆT NAM',
    taxCode: '4101625899',
    address: '01 Lê Duẩn, P. Lý Thường Kiệt, TP. Quy Nhơn, Tỉnh Bình Định',
    hotline: '0932 456 789',
    email: 'kinhdoanh@bmsolar.vn',
    legalText: '© 2026 BM SOLAR. Bản quyền thuộc về Công ty TNHH Năng Lượng BM SOLAR. Mọi hành vi sao chép không xin phép đều bị nghiêm cấm theo luật sở hữu trí tuệ.',
  },
  globalChannels: {
    channels: [
      {
        id: 'gc_phone',
        type: 'phone',
        label: 'Tổng Đài Toàn Quốc',
        target: '19006888',
        actionUrl: 'tel:19006888',
        formatted: '1900 6888',
        sortOrder: 1,
      },
      {
        id: 'gc_email',
        type: 'email',
        label: 'Hộp Thư Doanh Nghiệp',
        target: 'kinhdoanh@bmsolar.vn',
        actionUrl: 'mailto:kinhdoanh@bmsolar.vn',
        formatted: 'kinhdoanh@bmsolar.vn',
        sortOrder: 2,
      },
      {
        id: 'gc_facebook',
        type: 'facebook',
        label: 'BM Solar Fanpage',
        target: 'https://facebook.com/bmsolar.vietnam',
        actionUrl: 'https://facebook.com/bmsolar.vietnam',
        sortOrder: 3,
      },
      {
        id: 'gc_youtube',
        type: 'youtube',
        label: 'BM Solar Official',
        target: 'https://youtube.com/@bmsolar',
        actionUrl: 'https://youtube.com/@bmsolar',
        sortOrder: 4,
      },
    ],
  },
  mobileActions: [
    {
      key: 'home',
      label: 'Trang chủ',
      icon: 'home',
      target: { kind: 'internalRoute', routeKey: '/' },
    },
    {
      key: 'call',
      label: 'Gọi ngay',
      icon: 'phone',
      target: { kind: 'contactChannel', channelType: 'phone' },
    },
    {
      key: 'zalo',
      label: 'Zalo',
      icon: 'message-circle',
      target: { kind: 'contactChannel', channelType: 'zalo' },
    },
    {
      key: 'consultation',
      label: 'Tư vấn',
      icon: 'sparkles',
      target: { kind: 'leadForm' },
    },
    {
      key: 'menu',
      label: 'Menu',
      icon: 'menu',
      target: { kind: 'menu' },
    },
  ],
  theme: {
    primary: '#0D4EA6',
    navy: '#0D2E63',
    accent: '#FF6B19',
    fonts: 'Inter, system-ui, sans-serif',
    radius: '12px',
  },
};

export const fallbackCategories: ProductCategoryItem[] = [
  {
    id: 'cat_panels',
    slug: 'tam-pin-nang-luong',
    name: 'Tấm Pin Năng Lượng Mặt Trời',
    description: 'Canadian Solar, Jinko Solar, Longi Solar chuẩn Tier 1 công suất 550W - 670W',
    sortOrder: 1,
    status: 'published',
    imageUrl: '/images/designs/cat-panel.png',
  },
  {
    id: 'cat_inverter',
    slug: 'bien-tan-inverter',
    name: 'Biến Tần Inverter Hòa Lưới & Hybrid',
    description: 'Deye Hybrid, Huawei, Solis, Growatt hiệu suất 98.8%, bảo hành 5 - 10 năm',
    sortOrder: 2,
    status: 'published',
    imageUrl: '/images/designs/cat-inverter.png',
  },
  {
    id: 'cat_bess',
    slug: 'pin-luu-tru-bess',
    name: 'Hệ Thống Pin Lưu Trữ BESS',
    description: 'Pin lithium LiFePO4 lưu trữ điện thông minh, cấp điện tức thì khi mất lưới',
    sortOrder: 3,
    status: 'published',
    imageUrl: '/images/designs/cat-battery.png',
  },
  {
    id: 'cat_ev',
    slug: 'tram-sac-xe-dien-ev',
    name: 'Trạm Sạc Xe Điện EV Charger',
    description: 'Bộ sạc thông minh AC 7kW - 22kW và trạm sạc nhanh DC cho gia đình và doanh nghiệp',
    sortOrder: 4,
    status: 'published',
    imageUrl: '/images/designs/cat-charger.png',
  },
];

export const fallbackAudiences: AudienceItem[] = [
  {
    id: 'aud_household',
    code: 'household',
    label: 'Hộ Gia Đình & Biệt Thự',
    description: 'Hệ thống 3kWp - 15kWp hòa lưới có lưu trữ, tiết kiệm đến 90% hóa đơn tiền điện và an tâm khi mất điện lưới.',
    enabled: true,
    capacityRange: '3 - 15 kWp',
    imageUrl: '/images/designs/giai-phap-card-1.png',
  },
  {
    id: 'aud_business',
    code: 'business',
    label: 'Doanh Nghiệp & Khách Sạn',
    description: 'Hệ thống 20kWp - 100kWp cắt giảm chi phí điện giờ cao điểm, thời gian hoàn vốn nhanh 3-4 năm.',
    enabled: true,
    capacityRange: '20 - 100 kWp',
    imageUrl: '/images/designs/giai-phap-card-2.png',
  },
  {
    id: 'aud_industrial',
    code: 'industrial',
    label: 'Nhà Xưởng & Khu Công Nghiệp',
    description: 'Quy mô 100kWp - 2MWp giải pháp Zero-Export, đạt chứng chỉ xanh xuất khẩu RECs và giảm nhiệt mái 3 - 5°C.',
    enabled: true,
    capacityRange: '100 kWp - 2 MWp',
    imageUrl: '/images/designs/giai-phap-card-3.png',
  },
];

export const fallbackProducts: ProductCard[] = [
  {
    id: 'prod_deye_5kw',
    sku: 'DEYE-SUN-5K-SG03LP1',
    slug: 'inverter-hybrid-deye-5kw-1-pha',
    name: 'Biến Tần Inverter Hybrid Deye 5kW 1 Pha (SUN-5K-SG03LP1)',
    summary: 'Biến tần thông minh hòa lưới có lưu trữ, tích hợp 2 cổng MPPT độc lập, chống bụi nước IP65.',
    status: 'published',
    coverMediaUrl: '/images/designs/san-pham-2.png',
    capacityW: 5000,
    warrantyYears: 5,
    tier: 'Tier 1 Top Hybrid',
    priceEstimate: 'Liên hệ báo giá tốt nhất',
    category: {
      id: 'cat_inverter',
      name: 'Biến Tần Inverter',
      slug: 'bien-tan-inverter',
    },
    brand: {
      id: 'brand_deye',
      name: 'Deye',
      slug: 'deye',
    },
  },
  {
    id: 'prod_cs_550w',
    sku: 'CS6W-550MS',
    slug: 'tam-pin-canadian-solar-550w-hiku6',
    name: 'Tấm Pin Canadian Solar 550W Mono HiKu6 (CS6W-550MS)',
    summary: 'Công nghệ tế bào 144 Half-cut cells, hiệu suất quang năng 21.5%, bảo hành hiệu suất 25 năm.',
    status: 'published',
    coverMediaUrl: '/images/designs/san-pham-1.png',
    capacityW: 550,
    warrantyYears: 25,
    tier: 'Tier 1 Bloomberg',
    priceEstimate: 'Liên hệ báo giá tốt nhất',
    category: {
      id: 'cat_panels',
      name: 'Tấm Pin Năng Lượng',
      slug: 'tam-pin-nang-luong',
    },
    brand: {
      id: 'brand_cs',
      name: 'Canadian Solar',
      slug: 'canadian-solar',
    },
  },
  {
    id: 'prod_dyness_5kwh',
    sku: 'DYNESS-A48100',
    slug: 'pin-lithium-luu-tru-dyness-5-12kwh',
    name: 'Module Pin Lưu Trữ Lithium LiFePO4 Dyness 5.12kWh (A48100)',
    summary: 'Pin lưu trữ chuẩn an toàn cao, tuổi thọ trên 6000 chu kỳ nạp xả, tương thích hoàn hảo với Inverter Deye.',
    status: 'published',
    coverMediaUrl: '/images/designs/san-pham-3.png',
    capacityW: 5120,
    warrantyYears: 10,
    tier: 'LiFePO4 Grade A',
    priceEstimate: 'Liên hệ báo giá tốt nhất',
    category: {
      id: 'cat_bess',
      name: 'Pin Lưu Trữ BESS',
      slug: 'pin-luu-tru-bess',
    },
    brand: {
      id: 'brand_dyness',
      name: 'Dyness',
      slug: 'dyness',
    },
  },
  {
    id: 'prod_ev_7kw',
    sku: 'BM-EV-AC07',
    slug: 'tram-sac-xe-dien-thong-minh-7kw-ac',
    name: 'Bộ Sạc Xe Điện Gia Đình Thông Minh BM Solar 7kW AC',
    summary: 'Chuẩn sạc Type 2 tương thích VinFast và các dòng EV quốc tế, điều khiển sạc qua ứng dụng điện thoại.',
    status: 'published',
    coverMediaUrl: '/images/designs/san-pham-4.png',
    capacityW: 7000,
    warrantyYears: 3,
    tier: 'Chính Hãng Chuẩn IP65',
    priceEstimate: 'Liên hệ báo giá tốt nhất',
    category: {
      id: 'cat_ev',
      name: 'Trạm Sạc Xe Điện',
      slug: 'tram-sac-xe-dien-ev',
    },
    brand: {
      id: 'brand_bmsolar',
      name: 'BM SOLAR',
      slug: 'bm-solar',
    },
  },
];

export const fallbackProjects: ProjectItem[] = [
  {
    id: 'proj_qn_res_01',
    slug: 'biet-thu-bien-quy-nhon-15kwp-hybrid',
    title: 'Hệ Thống Điện Mặt Trời Biệt Thự Biển Quy Nhơn 15kWp Hybrid',
    summary: 'Lắp đặt áp mái ngói cao cấp sử dụng 28 tấm pin Canadian 550W cùng hệ thống Inverter Deye & Pin lưu trữ 15kWh.',
    coverMediaUrl: '/images/designs/du-an-1.png',
    completedAt: '2026-02-15',
    capacityKwp: 15.4,
    projectType: {
      id: 'pt_hybrid',
      name: 'Điện Mặt Trời Có Lưu Trữ',
      slug: 'dien-mat-troi-hybrid',
    },
    province: {
      id: 'prov_bd',
      name: 'Bình Định',
      code: '77',
    },
  },
  {
    id: 'proj_hcm_ind_02',
    slug: 'nha-may-may-xuat-khau-go-vap-250kwp',
    title: 'Hệ Thống Điện Mặt Trời Áp Mái Nhà Máy May Gò Vấp 250kWp',
    summary: 'Giải pháp Zero-Export không phát ngược lưới, giúp doanh nghiệp tiết kiệm hơn 85 triệu đồng tiền điện mỗi tháng.',
    coverMediaUrl: '/images/designs/du-an-2.png',
    completedAt: '2026-01-20',
    capacityKwp: 250.0,
    projectType: {
      id: 'pt_industrial',
      name: 'Nhà Xưởng Công Nghiệp',
      slug: 'nha-xuong-cong-nghiep',
    },
    province: {
      id: 'prov_hcm',
      name: 'TP. Hồ Chí Minh',
      code: '79',
    },
  },
  {
    id: 'proj_gl_hotel_03',
    slug: 'khach-san-sinh-thai-pleiku-50kwp',
    title: 'Hệ Thống Khách Sạn Sinh Thái TP. Pleiku 50kWp Hybrid',
    summary: 'Cung cấp 100% điện năng sạch ban ngày cho dịch vụ nghỉ dưỡng cao cấp, vận hành êm ái thân thiện môi trường.',
    coverMediaUrl: '/images/designs/du-an-3.png',
    completedAt: '2025-12-10',
    capacityKwp: 50.0,
    projectType: {
      id: 'pt_commercial',
      name: 'Thương Mại & Khách Sạn',
      slug: 'thuong-mai-khach-san',
    },
    province: {
      id: 'prov_gl',
      name: 'Gia Lai',
      code: '64',
    },
  },
];

export const fallbackArticles: ArticleItem[] = [
  {
    id: 'art_policy_01',
    slug: 'chinh-sach-dien-mat-troi-mai-nha-tu-san-tu-tieu-moi-nhat-2026',
    title: 'Quy Định & Cơ Chế Khuyến Khích Điện Mặt Trời Tự Sản Tự Tiêu Mới Nhất 2026',
    excerpt: 'Tổng hợp chi tiết Nghị định phát triển điện mặt trời áp mái nhà, thủ tục nghiệm thu an toàn và hỗ trợ hòa lưới điện lực EVN.',
    coverMediaUrl: '/images/designs/tin-tuc-featured.png',
    publishedAt: '2026-03-01T08:00:00Z',
    category: 'Chính Sách Năng Lượng',
    readTimeMinutes: 5,
  },
  {
    id: 'art_tech_02',
    slug: 'vi-sao-nen-lap-he-thong-dien-mat-troi-hybrid-co-pin-luu-tru-bess',
    title: 'Vì Sao Hệ Thống Điện Mặt Trời Hybrid Có Lưu Trữ Là Xu Thế Tất Yếu?',
    excerpt: 'So sánh hiệu quả kinh tế và độ an toàn giữa điện mặt trời hòa lưới thuần túy và hệ thống Hybrid có tích hợp pin Lithium BESS.',
    coverMediaUrl: '/images/designs/tin-tuc-1.png',
    publishedAt: '2026-02-25T14:30:00Z',
    category: 'Giải Pháp & Kỹ Thuật',
    readTimeMinutes: 6,
  },
  {
    id: 'art_guide_03',
    slug: 'huong-dan-tinh-toan-cong-suat-lap-dat-dien-mat-troi-theo-hoa-don-tien-dien',
    title: 'Cách Tính Toán Công Suất Điện Mặt Trời Phù Hợp Với Hóa Đơn Tiền Điện Hàng Tháng',
    excerpt: 'Công thức đo đạc diện tích mái, số lượng tấm pin cần lắp đặt và bài toán hoàn vốn cụ thể cho hộ gia đình và chủ nhà xưởng.',
    coverMediaUrl: '/images/designs/tin-tuc-2.png',
    publishedAt: '2026-02-18T09:15:00Z',
    category: 'Cẩm Nang Tư Vấn',
    readTimeMinutes: 4,
  },
];

export const fallbackHomePage: CMSPageData = {
  id: 'page_home',
  slug: 'home',
  title: 'Trang Chủ BM SOLAR',
  publishedAt: '2026-03-01T00:00:00Z',
  revision: 1,
  seo: {
    metaTitle: 'BM SOLAR — Tổng Thầu EPC Điện Mặt Trời & Lưu Trữ Năng Lượng',
    metaDescription: 'BM SOLAR cung cấp giải pháp điện mặt trời mái nhà hòa lưới & lưu trữ pin BESS cho hộ gia đình, doanh nghiệp, nhà xưởng tại Quy Nhơn, TP.HCM.',
    canonicalUrl: 'https://bmsolar.vn',
    ogImageUrl: 'https://bmsolar.vn/images/logo.png',
    keywords: ['điện mặt trời BM Solar', 'inverter deye', 'tấm pin canadian solar', 'pin lưu trữ BESS', 'điện mặt trời Quy Nhơn', 'điện mặt trời Gò Vấp'],
  },
  blocks: [
    {
      id: 'blk_hero',
      type: 'heroCarousel',
      version: 1,
      enabled: true,
      sortOrder: 1,
      visibility: 'all',
      data: {
        slides: [
          {
            title: 'GIẢI PHÁP ĐIỆN MẶT TRỜI & LƯU TRỮ NĂNG LƯỢNG CAO CẤP',
            accentPhrase: 'TIẾT KIỆM ĐẾN 90% CHI PHÍ ĐIỆN',
            subtitle: 'Tổng thầu EPC uy tín hàng đầu miền Trung và Nam Bộ. Cam kết thiết bị Tier 1 chính hãng, bảo hành hiệu suất 25 năm, kỹ sư khảo sát 3D tận nơi miễn phí.',
            desktopMediaUrl: '/images/designs/hero-home.png',
            mobileMediaUrl: '/images/designs/hero-home.png',
            primaryCtaText: 'Khảo Sát & Báo Giá Miễn Phí',
            secondaryCtaText: 'Xem Giải Pháp Toàn Diện',
          },
        ],
      },
    },
    {
      id: 'blk_categories',
      type: 'categoryShowcase',
      version: 1,
      enabled: true,
      sortOrder: 2,
      visibility: 'all',
      data: {
        categories: fallbackCategories,
      },
    },
    {
      id: 'blk_audiences',
      type: 'audienceShowcase',
      version: 1,
      enabled: true,
      sortOrder: 3,
      visibility: 'all',
      data: {
        audiences: fallbackAudiences,
      },
    },
    {
      id: 'blk_features',
      type: 'featureHighlights',
      version: 1,
      enabled: true,
      sortOrder: 4,
      visibility: 'all',
      data: {
        items: [
          {
            iconToken: 'shield-check',
            label: '100% Thiết Bị Chính Hãng',
            description: 'Phân phối chính thức từ các tập đoàn Tier 1 thế giới (Canadian Solar, Deye, Huawei, Dyness). Đầy đủ CO/CQ.',
          },
          {
            iconToken: 'award',
            label: 'Bảo Hành Hiệu Suất 25 Năm',
            description: 'Cam kết chất lượng thiết bị và hiệu suất phát điện lâu dài, gói dịch vụ O&M bảo dưỡng kỹ thuật trọn đời.',
          },
          {
            iconToken: 'map-pin',
            label: 'Khảo Sát & Thiết Kế 3D Tận Nơi',
            description: 'Kỹ sư chuyên môn đo đạc kết cấu mái, mô phỏng bức xạ mặt trời chi tiết trước khi ký hợp đồng hoàn toàn miễn phí.',
          },
          {
            iconToken: 'zap',
            label: 'Thi Công Nhanh Chuẩn Kỹ Thuật',
            description: 'Đội ngũ thi công được đào tạo an toàn điện lực EVN, lắp đặt thẩm mỹ cao, an toàn tuyệt đối và hòa lưới trong 48h.',
          },
        ],
      },
    },
    {
      id: 'blk_products',
      type: 'featuredProducts',
      version: 1,
      enabled: true,
      sortOrder: 5,
      visibility: 'all',
      data: {
        products: fallbackProducts,
      },
    },
    {
      id: 'blk_projects',
      type: 'projectShowcase',
      version: 1,
      enabled: true,
      sortOrder: 6,
      visibility: 'all',
      data: {
        projects: fallbackProjects,
      },
    },
    {
      id: 'blk_news',
      type: 'newsSection',
      version: 1,
      enabled: true,
      sortOrder: 7,
      visibility: 'all',
      data: {
        articles: fallbackArticles,
      },
    },
    {
      id: 'blk_lead_form',
      type: 'leadForm',
      version: 1,
      enabled: true,
      sortOrder: 8,
      visibility: 'all',
      data: {
        headline: 'Đăng Ký Khảo Sát & Nhận Báo Giá Nhanh',
        subheading: 'Đội ngũ kỹ sư BM SOLAR tại Quy Nhơn và TP.HCM sẽ liên hệ tư vấn giải pháp tối ưu nhất cho quý khách trong vòng 15 phút.',
        consentText: 'Tôi đồng ý cho BM SOLAR liên hệ tư vấn báo giá theo Chính sách bảo mật thông tin.',
      },
    },
  ],
};

import { DetailedSolution } from '@/types/bmsolar-api';
export type { DetailedSolution };

export const fallbackSolutions: DetailedSolution[] = [
  {
    slug: 'ho-gia-dinh',
    title: 'Giải Pháp Điện Mặt Trời Hộ Gia Đình & Biệt Thự',
    subtitle: 'Hệ thống điện mặt trời hòa lưới có lưu trữ (Hybrid) cao cấp từ 3kWp đến 15kWp, giúp gia đình làm chủ nguồn năng lượng xanh, tiết kiệm đến 90% hóa đơn tiền điện và duy trì điện liên tục khi mất lưới.',
    audienceCode: 'household',
    capacityRange: '3 - 15 kWp',
    heroImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85',
    monthlySavings: 'Từ 1.5 - 6 triệu đồng/tháng',
    roiYears: '4 - 5 năm',
    warrantyPeriod: '25 năm hiệu suất tấm pin',
    overview: 'Hệ thống điện mặt trời mái nhà dành cho gia đình được BM SOLAR thiết kế chuẩn hóa thẩm mỹ cao, phù hợp với mọi kiến trúc mái ngói, mái tôn hoặc sân thượng bê tông. Hệ thống ưu tiên cấp điện trực tiếp cho thiết bị ban ngày, nạp đầy pin lưu trữ Lithium BESS, và tự động xả điện phục vụ nhu cầu ban đêm.',
    benefits: [
      {
        title: 'Giảm 80 - 90% Hóa Đơn Điện',
        desc: 'Sử dụng điện năng lượng mặt trời tự sản tự tiêu cho điều hòa, tủ lạnh, bếp từ vào các khung giờ nắng cao điểm.',
      },
      {
        title: 'Cấp Điện Liên Tục Khi Mất Điện Lưới',
        desc: 'Hệ thống chuyển mạch UPS siêu tốc < 10ms, giữ các thiết bị quan trọng (quạt, chiếu sáng, tủ lạnh, wifi) hoạt động bình thường.',
      },
      {
        title: 'Làm Mát Mái Nhà 3 - 5°C',
        desc: 'Các tấm pin quang điện hấp thụ bức xạ trực tiếp, hoạt động như một lớp cách nhiệt tự nhiên giúp nhà mát mẻ hơn.',
      },
      {
        title: 'Giám Sát Thông Minh Qua Ứng Dụng',
        desc: 'Theo dõi sản lượng điện, lượng pin lưu trữ và tiền điện tiết kiệm mỗi ngày trực tiếp trên điện thoại thông minh.',
      },
    ],
    equipmentList: [
      { name: 'Tấm pin Canadian Solar 550W Mono Half-Cell', brand: 'Canadian Solar (Tier 1)', warranty: '25 năm' },
      { name: 'Biến tần Inverter Deye Hybrid 1 Pha / 3 Pha', brand: 'Deye Energy', warranty: '5 năm' },
      { name: 'Pin lưu trữ Lithium LiFePO4 Dyness 5.12kWh - 15kWh', brand: 'Dyness', warranty: '10 năm' },
      { name: 'Tủ điện đóng cắt bảo vệ chuẩn IP65 (Schneider / Chint)', brand: 'Châu Âu / Tier 1', warranty: '2 năm' },
      { name: 'Khung giàn nhôm anodize và kẹp pin chuyên dụng inox 304', brand: 'BM SOLAR Standard', warranty: '10 năm' },
    ],
    processSteps: [
      { step: 1, title: 'Tiếp nhận & Tư vấn sơ bộ', desc: 'Đánh giá hóa đơn tiền điện hiện tại và nhu cầu sử dụng của gia đình.' },
      { step: 2, title: 'Khảo sát 3D thực tế tận nơi', desc: 'Kỹ sư đo đạc hướng nắng, góc nghiêng mái và kết cấu chịu lực hoàn toàn miễn phí.' },
      { step: 3, title: 'Thiết kế kỹ thuật & Dự toán chi phí', desc: 'Xuất bản vẽ 3D mô phỏng vị trí lắp đặt và bảng tính toán thời gian thu hồi vốn.' },
      { step: 4, title: 'Thi công & Nghiệm thu an toàn', desc: 'Đội ngũ kỹ sư BM SOLAR thi công nhanh trong 2 - 3 ngày, đấu nối thẩm mỹ.' },
      { step: 5, title: 'Hỗ trợ thủ tục EVN & Bảo trì trọn đời', desc: 'Bàn giao tài khoản giám sát từ xa và bảo dưỡng định kỳ hàng năm.' },
    ],
    recommendedProductSlugs: ['inverter-hybrid-deye-5kw-1-pha', 'tam-pin-canadian-solar-550w-hiku6', 'pin-lithium-luu-tru-dyness-5-12kwh'],
    relatedProjectSlugs: ['biet-thu-bien-quy-nhon-15kwp-hybrid'],
  },
  {
    slug: 'doanh-nghiep',
    title: 'Giải Pháp Điện Mặt Trời Doanh Nghiệp & Thương Mại',
    subtitle: 'Tối ưu hóa chi phí vận hành cho văn phòng, khách sạn, trung tâm thương mại và resort từ 20kWp đến 100kWp, cắt giảm mạnh biểu giá điện giờ cao điểm.',
    audienceCode: 'business',
    capacityRange: '20 - 100 kWp',
    heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85',
    monthlySavings: 'Từ 15 - 80 triệu đồng/tháng',
    roiYears: '3.5 - 4.5 năm',
    warrantyPeriod: '25 năm hiệu suất',
    overview: 'Đối với các doanh nghiệp dịch vụ, tòa nhà văn phòng và khách sạn, chi phí điện năng vào giờ cao điểm (từ 9h30 - 11h30 và 17h00 - 20h00) có đơn giá rất cao (trên 3.200 đ/kWh). Điện mặt trời thương mại sản xuất điện đúng vào thời điểm biểu giá cao nhất, giúp khấu hao chi phí và gia tăng tỷ suất lợi nhuận trực tiếp.',
    benefits: [
      {
        title: 'Cắt Giảm Điện Giờ Cao Điểm',
        desc: 'Giảm phụ tải từ lưới điện quốc gia trong các khung giờ có đơn giá điện kinh doanh đắt đỏ nhất.',
      },
      {
        title: 'Khấu Hao & Hoàn Vốn Cực Nhanh',
        desc: 'Thời gian hoàn vốn chỉ từ 3.5 đến 4.5 năm, sau đó hệ thống tiếp tục sinh lời trong hơn 20 năm tiếp theo.',
      },
      {
        title: 'Nâng Tầm Thương Hiệu Doanh Nghiệp Xanh',
        desc: 'Đạt các chứng nhận ESG, tiêu chuẩn công trình xanh, thu hút khách hàng quốc tế ưu tiên phát triển bền vững.',
      },
      {
        title: 'Vận Hành Hoàn Toàn Tự Động',
        desc: 'Hệ thống vận hành êm ái, giám sát từ xa qua đám mây, cảnh báo sự cố tức thời và không phát sinh chi phí nhân sự.',
      },
    ],
    equipmentList: [
      { name: 'Tấm pin Canadian Solar / Jinko 550W - 670W', brand: 'Tier 1 Top Bloomberg', warranty: '25 năm' },
      { name: 'Biến tần Inverter hòa lưới 3 Pha Deye / Huawei / Sungrow 20kW - 100kW', brand: 'Tier 1', warranty: '5 - 10 năm' },
      { name: 'Hệ thống chống phát ngược lưới Zero-Export thông minh', brand: 'BM Smart Grid', warranty: '3 năm' },
      { name: 'Tủ điện tổng đóng cắt MCCB tiêu chuẩn công nghiệp', brand: 'Schneider Electric', warranty: '2 năm' },
    ],
    processSteps: [
      { step: 1, title: 'Phân tích biểu đồ phụ tải', desc: 'Thu thập dữ liệu tiêu thụ điện 12 tháng gần nhất để tính toán công suất tối ưu.' },
      { step: 2, title: 'Khảo sát kết cấu & an toàn PCCC', desc: 'Đảm bảo tải trọng mái và phương án an toàn phòng cháy chữa cháy đạt chuẩn.' },
      { step: 3, title: 'Ký kết hợp đồng EPC trọn gói', desc: 'Cam kết tiến độ, sản lượng phát điện và chính sách bảo hành bằng văn bản pháp lý.' },
      { step: 4, title: 'Thi công & Nghiệm thu đo đạc', desc: 'Lắp đặt chuyên nghiệp không ảnh hưởng đến hoạt động kinh doanh của doanh nghiệp.' },
      { step: 5, title: 'Bàn giao & Bảo trì O&M', desc: 'Kiểm tra bảo dưỡng định kỳ và hỗ trợ kỹ thuật 24/7.' },
    ],
    recommendedProductSlugs: ['inverter-hybrid-deye-5kw-1-pha', 'tam-pin-canadian-solar-550w-hiku6'],
    relatedProjectSlugs: ['khach-san-sinh-thai-pleiku-50kwp'],
  },
  {
    slug: 'nha-xuong',
    title: 'Giải Pháp Điện Mặt Trời Nhà Xưởng & Khu Công Nghiệp',
    subtitle: 'Tổng thầu EPC quy mô lớn từ 100kWp đến hàng MWp với công nghệ Zero-Export, chứng chỉ năng lượng tái tạo I-REC phục vụ xuất khẩu Châu Âu & Mỹ.',
    audienceCode: 'industrial',
    capacityRange: '100 kWp - 2 MWp',
    heroImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=85',
    monthlySavings: 'Từ 80 triệu - hàng tỷ đồng/tháng',
    roiYears: '3.5 - 4 năm',
    warrantyPeriod: '25 năm hiệu suất',
    overview: 'Nhà máy sản xuất sở hữu diện tích mái tôn rộng lớn là tài sản đắc địa để biến thành nhà máy phát điện xanh. Giải pháp điện mặt trời công nghiệp của BM SOLAR áp dụng thuật toán kiểm soát bám tải Zero-Export, không bán điện ngược lên lưới, tuân thủ 100% Nghị định của Chính phủ và an toàn hệ thống điện quốc gia.',
    benefits: [
      {
        title: 'Chứng Chỉ Xanh I-REC / CBAM',
        desc: 'Hỗ trợ các nhà máy dệt may, da giày, chế biến gỗ và cơ khí đạt chứng chỉ giảm phát thải carbon để xuất khẩu sang EU và Mỹ.',
      },
      {
        title: 'Giảm Nhiệt Nhà Xưởng 3 - 5°C',
        desc: 'Bảo vệ mái tôn khỏi ăn mòn thời tiết và giảm nhiệt độ bên trong khu vực sản xuất, tăng năng suất cho công nhân.',
      },
      {
        title: 'Tiết Kiệm Chi Phí Sản Xuất Khổng Lồ',
        desc: 'Cắt giảm hàng trăm triệu đến hàng tỷ đồng tiền điện mỗi tháng, tăng sức cạnh tranh về giá thành sản phẩm.',
      },
      {
        title: 'Thiết Kế Chống Cháy Lan & Chống Sét',
        desc: 'Hệ thống chống sét lan truyền Type 1+2, dây cáp DC chuyên dụng và công tắc ngắt khẩn cấp Rapid Shutdown an toàn PCCC.',
      },
    ],
    equipmentList: [
      { name: 'Tấm pin N-Type TOPCon 580W - 670W hiệu suất 22.5%+', brand: 'Jinko Solar / Canadian Solar', warranty: '25 - 30 năm' },
      { name: 'Biến tần String Inverter 100kW - 125kW Deye / Huawei Smart PV', brand: 'Huawei / Deye', warranty: '5 - 10 năm' },
      { name: 'Hệ thống đo đếm năng lượng và điều khiển công suất bám tải Zero-Export', brand: 'BM Industrial Controller', warranty: '5 năm' },
      { name: 'Trạm biến áp nâng thế và hệ thống đóng cắt trung thế (nếu cần)', brand: 'ABB / Schneider', warranty: '3 năm' },
    ],
    processSteps: [
      { step: 1, title: 'Thẩm định hồ sơ & Giấy phép', desc: 'Đánh giá giấy phép xây dựng, kết cấu xưởng và phê duyệt hồ sơ PCCC.' },
      { step: 2, title: 'Khảo sát tải trọng tĩnh & động của mái', desc: 'Kỹ sư kết cấu tính toán tải trọng đảm bảo mái nhà xưởng an toàn tuyệt đối.' },
      { step: 3, title: 'Mô phỏng bức xạ PVSyst', desc: 'Xuất báo cáo tài chính PVSyst đạt tiêu chuẩn ngân hàng tài trợ vốn.' },
      { step: 4, title: 'Thi công chuẩn an toàn công nghiệp', desc: 'Biện pháp thi công an toàn trên cao, lưới an toàn và giám sát an toàn lao động 100%.' },
      { step: 5, title: 'Đấu nối hòa lưới & Nghiệm thu EVN', desc: 'Phối hợp với điện lực địa phương hoàn tất thủ tục thỏa thuận đấu nối.' },
    ],
    recommendedProductSlugs: ['tam-pin-canadian-solar-550w-hiku6'],
    relatedProjectSlugs: ['nha-may-may-xuat-khau-go-vap-250kwp'],
  },
];

// ==================== FAQS ====================
export interface FAQItem {
  question: string;
  answer: string;
  category: 'chinh-sach' | 'ky-thuat' | 'chi-phi';
}

export const fallbackFaqs: FAQItem[] = [
  {
    category: 'chinh-sach',
    question: 'Lắp đặt điện mặt trời mái nhà hiện nay có cần xin giấy phép không?',
    answer: 'Theo Nghị định mới nhất năm 2026 về phát triển điện mặt trời mái nhà tự sản tự tiêu, các hệ thống lắp đặt cho hộ gia đình và công sở có công suất dưới 100kWp chỉ cần đăng ký thông báo với Sở Công Thương và Điện lực địa phương (EVN). BM SOLAR hỗ trợ hoàn tất trọn gói mọi thủ tục pháp lý cho khách hàng.',
  },
  {
    category: 'ky-thuat',
    question: 'Khi mất điện lưới, hệ thống điện mặt trời có tiếp tục hoạt động không?',
    answer: 'Đối với hệ thống hòa lưới thuần túy (On-grid), inverter sẽ tự động ngắt để bảo vệ an toàn cho nhân viên sửa chữa điện lưới (chống phát ngược). Tuy nhiên, nếu lắp đặt hệ thống có lưu trữ Hybrid tích hợp pin Lithium BESS, hệ thống sẽ tự động chuyển mạch trong vòng 10ms để tiếp tục cung cấp điện cho các thiết bị trong nhà mà không hề bị gián đoạn.',
  },
  {
    category: 'chi-phi',
    question: 'Thời gian thu hồi vốn của một hệ thống điện mặt trời là bao lâu?',
    answer: 'Thời gian hoàn vốn trung bình hiện nay dao động từ 3.5 đến 4.5 năm tùy thuộc vào mức độ sử dụng điện ban ngày và biểu giá điện của khách hàng. Tuổi thọ của tấm pin lên tới 25 - 30 năm, nghĩa là quý khách sẽ có hơn 20 năm sử dụng điện hoàn toàn miễn phí sau khi đã hoàn vốn.',
  },
  {
    category: 'ky-thuat',
    question: 'Tấm pin mặt trời có bị giảm hiệu suất khi trời mưa hoặc âm u không?',
    answer: 'Tấm pin quang điện hoạt động dựa trên bức xạ ánh sáng mặt trời chứ không chỉ dựa vào ánh nắng trực tiếp. Khi trời nhiều mây hoặc mưa nhẹ, hệ thống vẫn sản xuất được khoảng 15 - 30% công suất danh định, đủ để duy trì các thiết bị tiêu thụ cơ bản.',
  },
  {
    category: 'chi-phi',
    question: 'BM SOLAR có chính sách bảo hành và bảo trì như thế nào?',
    answer: 'BM SOLAR cam kết: Bảo hành hiệu suất tấm pin 25 năm (cam kết suy hao dưới 15% sau 25 năm); Bảo hành biến tần Inverter từ 5 đến 10 năm; Bảo hành pin lưu trữ Lithium 10 năm; Miễn phí kiểm tra, vệ sinh tấm pin và bảo trì hệ thống trong 2 năm đầu tiên.',
  },
];


