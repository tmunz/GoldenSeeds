import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createTranslator, isLocale, Locale, translate, Translator } from './translate';

const STORAGE_KEY = 'golden-seeds.locale';
interface TranslationContext {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translator;
}
const I18nContext = createContext<TranslationContext>({ locale: 'en', setLocale: () => undefined, t: translate });

function savedLocale(): Locale {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isLocale(value) ? value : 'en';
  } catch { return 'en'; }
}

export function I18nProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale?: Locale }) {
  const [locale, updateLocale] = useState<Locale>(() => initialLocale ?? savedLocale());
  useEffect(() => {
    document.documentElement.lang = locale;
    try { localStorage.setItem(STORAGE_KEY, locale); } catch { /* Language switching also works without storage. */ }
  }, [locale]);
  const value = useMemo<TranslationContext>(() => ({
    locale, t: createTranslator(locale),
    setLocale: next => { if (isLocale(next)) { updateLocale(next); } },
  }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): TranslationContext {
  return useContext(I18nContext);
}
