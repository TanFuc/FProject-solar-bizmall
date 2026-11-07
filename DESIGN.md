# Design System — BM SOLAR

<!-- impeccable:design-tokens 1 -->

## Color Palette

- `--color-brand-primary`: `#0D4EA6` (BM Solar Electric Blue)
- `--color-brand-dark`: `#0D2E63` (Deep Navy / Hero Gradient / Topbar / Footer)
- `--color-brand-darker`: `#071B3B` (Footer bottom / Deepest ink)
- `--color-accent-orange`: `#FF6B19` (High-conversion CTA Button / Highlighted phrases)
- `--color-accent-hover`: `#E65A0D` (Active & hover state for CTA buttons)
- `--color-text-ink`: `#12243D` (Primary typography heading color)
- `--color-text-muted`: `#5A6B82` (Secondary / descriptive text color)
- `--color-text-light`: `#8EA2BE` (Footer muted text)
- `--color-surface-light`: `#F5F8FC` (Section backgrounds, card backgrounds)
- `--color-surface-white`: `#FFFFFF` (Base surface color)
- `--color-border-subtle`: `#E2E8F0` (Card borders, dividers)
- `--color-success`: `#10B981` (Online indicators, success badges)

## Typography

- Font Family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)
- Display Scale:
  - Hero Display: `text-3xl md:text-5xl lg:text-6xl` (Font weight 800, leading tight)
  - Section Title: `text-2xl md:text-3xl lg:text-4xl` (Font weight 700, leading snug)
  - Card Title: `text-lg md:text-xl` (Font weight 600)
  - Body: `text-sm md:text-base` (Font weight 400, leading relaxed)
  - Caption / Badge: `text-xs md:text-sm` (Font weight 500)

## Layout & Spacing

- Desktop Max Container: `max-w-7xl` (1280px) / `max-w-[1400px]`
- Topbar Height: `h-10` (40px)
- Header Navbar Height: `h-20` (80px)
- Mobile Header Height: `h-16` (64px)
- Mobile Bottom Navigation Height: `h-16` (64px) with safe-area padding
- Border Radii:
  - Button Radius: `rounded-lg` (8px) / `rounded-full` for pill buttons
  - Card Radius: `rounded-xl` (12px) / `rounded-2xl` (16px)
  - Category Strip: `rounded-t-3xl` (24px curved transition into categories)
- Shadows:
  - Subtle Card: `shadow-sm hover:shadow-md transition-shadow`
  - Floating CTA / Modal: `shadow-xl`

## Component Guidelines

1. **Header & Topbar:**
   - Desktop Topbar: Deep navy `#0D2E63`, displaying Branch selector (Quy Nhơn, TP.HCM), Hotline, Email, Working Hours, Social icons.
   - Desktop Nav: White background with crisp BM SOLAR logo on the left, primary navigation links center (Trang chủ, Giới thiệu, Giải pháp, Sản phẩm, Dự án, Tin tức, Liên hệ), and Orange Consultation Button on the right.
   - Mobile Header: Clean white bar with Logo, Search icon, and Mobile Hamburger Menu button.
2. **Mobile Bottom Navigation (5 Action Bar):**
   - Fixed at bottom with blur backdrop (`backdrop-blur-md bg-white/95`).
   - 5 buttons: **Trang chủ** (Home icon), **Gọi ngay** (Phone icon, direct `tel:` to branch), **Zalo** (Official Zalo OA link), **Tư vấn** (Orange highlighted Form modal trigger), **Menu** (Drawer trigger).
3. **Hero Section:**
   - Cinematic rooftop solar photography with deep navy left gradient overlay for maximum text contrast.
   - Prominent white heading with orange emphasis, dual CTAs ("Nhận Báo Giá Ngay" in orange, "Xem Giải Pháp" in transparent white border).
4. **Curved Category Strip:**
   - 4 equipment category cards: Tấm pin năng lượng mặt trời, Biến tần (Inverter), Pin lưu trữ (BESS), Trạm sạc xe điện (EV Charger).
5. **Solutions Section:**
   - 3 prominent solution cards: Điện mặt trời Hộ Gia Đình, Điện mặt trời Doanh Nghiệp, Điện mặt trời Nhà Xưởng.
6. **Featured Products & Projects:**
   - Card grid with badge (Tier 1, Công suất, Bảo hành), authentic photography, technical specs, and quote request button.
7. **Lead Consultation Form:**
   - High-contrast modal and inline form: Tên, Số điện thoại, Chi nhánh, Loại hệ thống, Địa chỉ lắp đặt, Ghi chú.

