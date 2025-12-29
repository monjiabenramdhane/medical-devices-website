import { cookies, headers } from 'next/headers';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE_NAME, type Locale } from './types';

/**
 * Resolve the user's locale on the server
 * Priority: Cookie → Accept-Language → Default
 */
export async function getLocale(): Promise<Locale> {
  // 1. Check cookie first
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (localeCookie && SUPPORTED_LOCALES.includes(localeCookie as Locale)) {
    return localeCookie as Locale;
  }

  // 2. Check Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');

  if (acceptLanguage) {
    const preferred = parseAcceptLanguage(acceptLanguage);
    if (preferred) return preferred;
  }

  // 3. Fallback to default
  return DEFAULT_LOCALE;
}

/**
 * Parse Accept-Language header and find first supported locale
 */
function parseAcceptLanguage(header: string): Locale | null {
  const languages = header
    .split(',')
    .map((lang) => {
      const [code, q] = lang.trim().split(';q=');
      const quality = q ? parseFloat(q) : 1.0;
      return { code: code.split('-')[0].toLowerCase(), quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { code } of languages) {
    if (SUPPORTED_LOCALES.includes(code as Locale)) {
      return code as Locale;
    }
  }
  return null;
}
