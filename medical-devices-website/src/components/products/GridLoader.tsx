import { ProductGridClient } from '@/components/products/ProductGridClient';
import { type Locale } from '@/lib/i18n/types';

interface GridLoaderProps {
  productsPromise: Promise<any[]>;
  countPromise: Promise<number>;
  locale: Locale;
  selectedParams: any;
  uiTranslationsPromise: Promise<any>;
  specialtyTranslationsPromise: Promise<any>;
}

export async function GridLoader({ 
  productsPromise, 
  countPromise, 
  locale, 
  selectedParams, 
  uiTranslationsPromise, 
  specialtyTranslationsPromise 
}: GridLoaderProps) {
  const [initialProducts, totalCount, uiTranslations, specialtyTranslations] = await Promise.all([
    productsPromise,
    countPromise,
    uiTranslationsPromise,
    specialtyTranslationsPromise
  ]);

  return (
    <ProductGridClient
      initialProducts={initialProducts}
      initialTotal={totalCount}
      locale={locale}
      selectedParams={selectedParams}
      translations={{ ui: uiTranslations, specialty: specialtyTranslations }}
    />
  );
}