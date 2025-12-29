import { prisma } from '@/lib/prisma';
import { type Locale, type TranslationCache } from './types';
import { unstable_cache } from 'next/cache';

/**
 * Fetch all translations for a locale (cached)
 */
export const getTranslations = unstable_cache(
  async (locale: Locale): Promise<TranslationCache> => {
    const translations = await prisma.translation.findMany({
      where: { locale },
      select: { key: true, value: true },
    });

    return translations.reduce((acc, t) => {
      acc[t.key] = t.value;
      return acc;
    }, {} as TranslationCache);
  },
  ['translations-all'],
  { tags: ['translations'] }
);

/**
 * Get a single translation value
 */
export async function getTranslation(
  locale: Locale,
  key: string,
  fallback?: string
): Promise<string> {
  const translations = await getTranslations(locale);
  return translations[key] || fallback || key;
}

/**
 * Fetch translations by category (for partial loading)
 */
export const getTranslationsByCategory = unstable_cache(
  async (locale: Locale, category: string): Promise<TranslationCache> => {
    const translations = await prisma.translation.findMany({
      where: { locale, category },
      select: { key: true, value: true },
    });

    return translations.reduce((acc: TranslationCache, t: any) => {
      acc[t.key] = t.value;
      return acc;
    }, {} as TranslationCache);
  },
  ['translations-category'],
  { tags: ['translations'] }
);