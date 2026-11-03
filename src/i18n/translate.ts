import { en } from './en';
import { de } from './de';

export const SUPPORTED_LOCALES = ['en', 'de'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];
export type TranslationValues = Record<string, string | number>;
export type Translator = (key: string, values?: TranslationValues, fallback?: string) => string;
const catalogs: Record<Locale, Record<string, string>> = { en, de };

export function isLocale(value: unknown): value is Locale {
  return SUPPORTED_LOCALES.some(locale => locale === value);
}

/** Catalog keys never depend on persisted node names, port IDs, or option values. */
export function createTranslator(locale: Locale): Translator {
  return (key, values = {}, fallback = key) => {
    const pluralKey = typeof values.count === 'number'
      ? `${key}.${new Intl.PluralRules(locale).select(values.count)}` : key;
    const message = catalogs[locale][pluralKey] ?? catalogs[locale][key] ?? catalogs.en[pluralKey] ?? catalogs.en[key] ?? fallback;
    return message.replace(/\{\{(\w+)\}\}/g, (placeholder, name: string) => String(values[name] ?? placeholder));
  };
}

export const translate = createTranslator('en');
