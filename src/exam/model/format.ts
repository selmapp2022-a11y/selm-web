import type { Localised, LanguageCode, Scale } from './types';

export function t(text: Localised, lang: LanguageCode): string {
  return text[lang] ?? text.en;
}

export function formatScale(value: number, scale: Scale, lang: LanguageCode): string {
  const n = value.toFixed(scale.display.decimals);
  const p = scale.display.prefix ? t(scale.display.prefix, lang) + ' ' : '';
  const s = scale.display.suffix ? ' ' + t(scale.display.suffix, lang) : '';
  return `${p}${n}${s}`;
}
