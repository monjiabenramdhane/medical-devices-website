import { ProductSidebar } from './ProductSidebar';
import { TranslationCache } from '@/lib/i18n/types';

interface SidebarLoaderProps {
  brandsPromise: Promise<{ id: string; name: string; slug: string }[]>;
  selectedParams: { brand?: string; gamme?: string; specialty?: string };
  translationsPromise: Promise<[TranslationCache, TranslationCache]>;
}

export async function SidebarLoader({
  brandsPromise,
  selectedParams,
  translationsPromise,
}: SidebarLoaderProps) {
  // Wait for all promises together
  const [brands, [uiTranslations, specialtyTranslations]] = await Promise.all([
    brandsPromise,
    translationsPromise,
  ]);

  return (
    <ProductSidebar
      brands={brands}
      selectedParams={selectedParams}
      translations={{ ui: uiTranslations, specialty: specialtyTranslations }}
    />
  );
}
