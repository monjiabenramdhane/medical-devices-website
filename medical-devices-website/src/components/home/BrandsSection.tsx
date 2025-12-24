import { HomeSectionService } from '@/services/homeSection.service';
import { BrandService } from '@/services/brand.service';
import { getLocale } from '@/lib/i18n/locale-resolver';
import { getTranslationsByCategory } from '@/lib/i18n/translation-service';
import { BrandCarousel } from './BrandCarousel';

export async function BrandsSection() {
  const locale = await getLocale();

  const [
    brandsSection,
    fallbackBrands,
    uiTranslations,
  ] = await Promise.all([
    HomeSectionService.getLocalizedByKey('brands', locale),
    BrandService.getAll(true),
    getTranslationsByCategory(locale, 'ui'),
  ]);

  const displayBrands =
    brandsSection?.brands && brandsSection.brands.length > 0
      ? (brandsSection.brands as any[])
      : fallbackBrands;

  if (displayBrands.length === 0) return null;

  return (
    <BrandCarousel
      brands={displayBrands}
      title={brandsSection?.title}
      description={brandsSection?.subtitle || brandsSection?.content || ''}
      viewAllText={brandsSection?.ctaText || uiTranslations['home.viewAll']}
    />
  );
}
