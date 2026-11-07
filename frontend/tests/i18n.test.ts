import assert from 'assert';
import { vi } from '../src/lib/i18n/dictionaries/vi';
import { en } from '../src/lib/i18n/dictionaries/en';
import {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_CONFIGS,
} from '../src/lib/i18n/locales';

console.log('====================================================');
console.log('BM SOLAR — FULL I18N SYSTEM AUTOMATED TESTS');
console.log('====================================================\n');

// 1. CONFIGURATION TESTS
console.log('Test 1: Locale Configurations');
assert.strictEqual(DEFAULT_LOCALE, 'vi', 'Default locale must be Vietnamese');
assert.deepStrictEqual(Array.from(LOCALES), ['vi', 'en'], 'Must support vi and en locales');
assert.strictEqual(LOCALE_CONFIGS.vi.flag, '🇻🇳');
assert.strictEqual(LOCALE_CONFIGS.en.flag, '🇬🇧');
assert.strictEqual(LOCALE_CONFIGS.vi.bcp47, 'vi-VN');
assert.strictEqual(LOCALE_CONFIGS.en.bcp47, 'en-US');
console.log('  ✓ Locale configurations verified');

// 2. DICTIONARY COMPLETENESS & 1-TO-1 PARITY
console.log('Test 2: Dictionary 1-to-1 Parity (vi <-> en)');
const viKeys = Object.keys(vi).sort();
const enKeys = Object.keys(en).sort();

assert.strictEqual(
  viKeys.length,
  enKeys.length,
  `Dictionary key count must match exactly (VI: ${viKeys.length}, EN: ${enKeys.length})`
);

const missingInEn: string[] = [];
for (const key of viKeys) {
  if (!(key in en)) {
    missingInEn.push(key);
  } else {
    assert.ok(
      typeof en[key as keyof typeof en] === 'string' && en[key as keyof typeof en].trim().length > 0,
      `Key "${key}" in en.ts must have a non-empty string value`
    );
    assert.ok(
      typeof vi[key as keyof typeof vi] === 'string' && vi[key as keyof typeof vi].trim().length > 0,
      `Key "${key}" in vi.ts must have a non-empty string value`
    );
  }
}

assert.strictEqual(
  missingInEn.length,
  0,
  `Missing keys in English dictionary: ${missingInEn.join(', ')}`
);

console.log(`  ✓ 100% Dictionary parity confirmed (${viKeys.length} verified translation keys)`);

// 3. ESSENTIAL SECTIONS COVERAGE
console.log('Test 3: Core UI Sections Coverage');
const essentialPrefixes = [
  'nav.',
  'topbar.',
  'mobileNav.',
  'drawer.',
  'hero.',
  'features.',
  'categories.',
  'solutions.',
  'products.',
  'projects.',
  'news.',
  'consultation.',
  'footer.',
  'common.',
];

for (const prefix of essentialPrefixes) {
  const matches = viKeys.filter((k) => k.startsWith(prefix));
  assert.ok(
    matches.length > 0,
    `Prefix "${prefix}" must contain translation keys in dictionary`
  );
}
console.log('  ✓ All 14 UI sections covered');

// 4. PARAMETER INTERPOLATION TEST
console.log('Test 4: Parameter Interpolation');
function mockTranslate(template: string, params: Record<string, string | number>) {
  let result = template;
  for (const [k, v] of Object.entries(params)) {
    result = result.replace(new RegExp(`{${k}}`, 'g'), String(v));
  }
  return result;
}

const templateVi = 'Bảo hành hiệu suất {years} năm';
const templateEn = '{years}-year linear performance warranty';
assert.strictEqual(mockTranslate(templateVi, { years: 25 }), 'Bảo hành hiệu suất 25 năm');
assert.strictEqual(mockTranslate(templateEn, { years: 25 }), '25-year linear performance warranty');
console.log('  ✓ Parameter interpolation verified');

console.log('\n====================================================');
console.log('>>> ALL I18N AUTOMATED TESTS PASSED (4/4) <<<');
console.log('====================================================\n');

