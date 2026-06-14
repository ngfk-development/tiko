import { createStore } from '@tanstack/react-store';

import { en, type Messages } from '#/i18n/en.ts';

export type Locale = 'en' | 'nl';

const STORAGE_KEY = 'locale';

const loaders: Record<Locale, () => Promise<Messages>> = {
  en: () => Promise.resolve(en),
  nl: () => import('#/i18n/nl.ts').then((module) => module.default),
};

export const localeStore = createStore(
  { locale: 'en' as Locale, messages: en },
  ({ setState, get }) => ({
    async setLocale(locale: Locale) {
      const messages = await loaders[locale]();
      localStorage.setItem(STORAGE_KEY, locale);
      setState((state) => ({ ...state, locale, messages }));
    },
    async initialize() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if ((stored === 'en' || stored === 'nl') && stored !== get().locale) {
        await this.setLocale(stored);
      }
    },
  }),
);
