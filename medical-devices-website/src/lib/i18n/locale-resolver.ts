import { cookies, headers } from 'next/headers';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE_NAME, type Locale } from './types';

/**
 * Resolves the user's locale on the server side
 * Priority: Cookie → Accept-Language → Default
 */
export async function getLocale(): Promise<Locale> {
  // 1. Check cookie first
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value as Locale | undefined;
  
  if (localeCookie && SUPPORTED_LOCALES.includes(localeCookie)) {
    return localeCookie;
  }

  // 2. Parse Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  
  if (acceptLanguage) {
    const preferredLocale = parseAcceptLanguage(acceptLanguage);
    if (preferredLocale) {
      return preferredLocale;
    }
  }

  // 3. Fallback to default
  return DEFAULT_LOCALE;
}

/**
 * Parse Accept-Language header to find supported locale
 * Example: "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7" → "fr"
 */
function parseAcceptLanguage(header: string): Locale | null {
  const languages = header
    .split(',')
    .map((lang) => {
      const [locale, qValue] = lang.trim().split(';q=');
      const quality = qValue ? parseFloat(qValue) : 1.0;
      return { locale: locale.split('-')[0].toLowerCase(), quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { locale } of languages) {
    if (SUPPORTED_LOCALES.includes(locale as Locale)) {
      return locale as Locale;
    }
  }

  return null;
}