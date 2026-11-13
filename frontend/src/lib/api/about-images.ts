export const aboutImages = {
  story: { label: 'Ảnh câu chuyện thương hiệu', fallback: 'home' },
  benefitHome: { label: 'Ảnh năng lực · Tiết kiệm chi phí', fallback: 'home' },
  benefitFactory: { label: 'Ảnh năng lực · Bền vững', fallback: 'factory' },
  benefitEv: { label: 'Ảnh năng lực · Tự chủ năng lượng', fallback: 'ev' },
  galleryEv: { label: 'Ảnh thư viện 1', fallback: 'ev' },
  galleryHome: { label: 'Ảnh thư viện 2', fallback: 'home' },
  galleryFactory: { label: 'Ảnh thư viện 3', fallback: 'factory' },
  journey: { label: 'Ảnh nền phần liên hệ', fallback: 'factory' },
} as const;

export function aboutImageKey(slot: keyof typeof aboutImages) { return 'about_' + slot; }
