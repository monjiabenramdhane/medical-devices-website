import { HomeSectionService } from '@/services/homeSection.service';
import { ProductService } from '@/services/product.service';
import { getLocale } from '@/lib/i18n/locale-resolver';
import { getTranslationsByCategory } from '@/lib/i18n/translation-service';
import { FeaturedProducts } from './FeaturedProducts';

export async function ProductsSection() {
  const locale = await getLocale();

  const [
    featuredSection,
    fallbackFeaturedProducts,
    uiTranslations,
    specialtyTranslations,
  ] = await Promise.all([
    HomeSectionService.getLocalizedByKey('featuredProducts', locale),
    ProductService.getFeatured(6),
    getTranslationsByCategory(locale, 'ui'),
    getTranslationsByCategory(locale, 'specialty'),
  ]);

  const gammeTranslations = {
    'ui.gamme.high': uiTranslations['ui.gamme.high'],
    'ui.gamme.medium': uiTranslations['ui.gamme.medium'],
    'ui.gamme.low': uiTranslations['ui.gamme.low'],
  };

  const displayProducts =
    featuredSection?.products && featuredSection.products.length > 0
      ? (featuredSection.products as any[])
      : fallbackFeaturedProducts;

  if (displayProducts.length === 0) return null;

  return (
    <FeaturedProducts
      products={displayProducts}
      title={featuredSection?.title}
      description={featuredSection?.subtitle || featuredSection?.content || ''}
      viewAllText={featuredSection?.ctaText || uiTranslations['home.viewAll']}
      learnMoreText={uiTranslations['ui.learnMore']}
      uiTranslations={gammeTranslations}
      specialtyTranslations={specialtyTranslations}
    />
  );
}
