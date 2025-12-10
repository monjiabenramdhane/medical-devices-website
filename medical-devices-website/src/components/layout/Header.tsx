import { getLocale } from '@/lib/i18n/locale-resolver';
import { getTranslationsByCategory } from '@/lib/i18n/translation-service';
import { HeaderClient } from './HeaderClient';

export async function Header() {
  const locale = await getLocale();
  const translations = await getTranslationsByCategory(locale, 'navigation');

  return <HeaderClient translations={translations} />;
}