export const SUPPORTED_LOCALES = ['en', 'fr'] as const;
export const DEFAULT_LOCALE = 'en' as const;
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export interface TranslationCache {
  [key: string]: string;
}

export interface LocalizedMetadata {
  title: string;
  description: string;
}
