import { ProductSidebar } from '@/components/products/ProductSidebar';

interface SidebarLoaderProps {
  brandsPromise: Promise<any[]>;
  selectedParams: any;
  uiTranslationsPromise: Promise<any>;
  specialtyTranslationsPromise: Promise<any>;
}

export async function SidebarLoader({ 
  brandsPromise, 
  selectedParams, 
  uiTranslationsPromise, 
  specialtyTranslationsPromise 
}: SidebarLoaderProps) {
  const [brands, uiTranslations, specialtyTranslations] = await Promise.all([
    brandsPromise,
    uiTranslationsPromise,
    specialtyTranslationsPromise
  ]);

  return (
    <ProductSidebar 
      brands={brands}
      selectedParams={selectedParams}
      translations={{ ui: uiTranslations, specialty: specialtyTranslations }}
    />
  );
}
