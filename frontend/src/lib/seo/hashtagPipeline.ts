import {
  SeoResourceType,
  SeoSuggestInput,
  SeoSuggestion,
  SeoMetadataUpdate,
} from '@/types/bmsolar-api';

const VIETNAMESE_STOPWORDS = new Set([
  'va', 'cua', 'cho', 'tai', 'la', 'de', 'voi', 'nhung', 'cac', 'mot', 'trong',
  'tren', 'duoi', 'ra', 'vao', 'den', 'tu', 'theo', 'boi', 've', 'khi', 'ma',
  'neu', 'thi', 'hay', 'hoac', 'vi', 'do', 'nen', 'rat', 'qua', 'da', 'dang',
  'se', 'duoc', 'bi', 'khong', 'chua', 'cung', 'lai', 'co', 'nay', 'kia', 'do',
]);

/**
 * Normalizes Vietnamese diacritics to plain ASCII characters while preserving words.
 */
export function removeVietnameseDiacritics(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (match) => (match === 'đ' ? 'd' : 'D'))
    .trim();
}

/**
 * Converts a Vietnamese phrase into a clean PascalCase social hashtag.
 * Example: "Điện mặt trời mái nhà" -> "#DienMatTroiMaiNha"
 */
export function phraseToHashtag(phrase: string): string {
  const clean = removeVietnameseDiacritics(phrase)
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim();

  if (!clean) return '';

  const words = clean.split(/\s+/).filter(Boolean);
  const capitalized = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');

  return `#${capitalized}`;
}

/**
 * Extracts and de-duplicates high-value hashtags from title, summary and tags.
 */
export function generateHashtags(
  title: string,
  summary: string,
  tags: string[] = [],
  maxCount: number = 7
): string[] {
  const candidates: string[] = [];

  // 1. Mandatory brand tag
  candidates.push('#BMSOLAR');

  // 2. Add explicit tags
  for (const tag of tags) {
    const ht = phraseToHashtag(tag);
    if (ht && ht.length > 2) candidates.push(ht);
  }

  // 3. Extract meaningful phrases from title
  const cleanTitle = removeVietnameseDiacritics(title)
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim();

  const titleWords = cleanTitle.split(/\s+/).filter((w) => {
    return w.length > 1 && !VIETNAMESE_STOPWORDS.has(w.toLowerCase());
  });

  // Combine adjacent high-frequency bigrams if relevant
  if (titleWords.length >= 2) {
    for (let i = 0; i < Math.min(titleWords.length - 1, 3); i++) {
      const w1 = titleWords[i];
      const w2 = titleWords[i + 1];
      if (w1 && w2) {
        const bigram = `${w1} ${w2}`;
        candidates.push(phraseToHashtag(bigram));
      }
    }
  }

  // 4. Case-insensitive & symbol-insensitive deduplication
  const seen = new Set<string>();
  const results: string[] = [];

  for (const c of candidates) {
    const key = c.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      results.push(c);
      if (results.length >= maxCount) break;
    }
  }

  return results;
}

/**
 * Generates SEO keyword and hashtag suggestions based on input resource.
 */
export function buildLocalSeoSuggestion(
  resourceType: SeoResourceType,
  title: string,
  summary: string,
  categoryName?: string
): SeoSuggestion {
  const hashtags = generateHashtags(title, summary, [
    categoryName || 'Điện Mặt Trời',
    'Năng Lượng Xanh',
  ]);

  const cleanTitle = removeVietnameseDiacritics(title).toLowerCase();
  const slug = cleanTitle
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  return {
    slugSuggestion: slug,
    metaTitleSuggestion: `${title} | BM SOLAR`,
    metaDescriptionSuggestion:
      summary || `${title} chất lượng cao, bảo hành dài hạn từ BM SOLAR.`,
    primaryKeyword: categoryName || 'Điện mặt trời',
    secondaryKeywords: [
      'điện mặt trời BM Solar',
      'lắp điện mặt trời hòa lưới',
      'pin lưu trữ BESS',
    ],
    tagSuggestions: [
      categoryName || 'Điện Mặt Trời',
      'Tiết Kiệm Điện',
      'Bảo Hành 25 Năm',
    ],
    socialHashtags: hashtags,
    warnings: [],
  };
}
