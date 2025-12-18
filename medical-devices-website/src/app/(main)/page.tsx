import { HeroCarousel } from '@/components/home/HeroCarousel';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BrandCarousel } from '@/components/home/BrandCarousel';
import { FacesBehindDevice } from '@/components/home/FacesBehindDevice';
import { HomeSectionService } from '@/services/homeSection.service';
import { ProductService } from '@/services/product.service';
import { BrandService } from '@/services/brand.service';
import { generateMetadata as genMeta } from '@/lib/utils';
import { getLocale } from '@/lib/i18n/locale-resolver';
import { getLocalizedHeroSlides } from '@/lib/i18n/localized-hero-service';
import { getTranslationsByCategory } from '@/lib/i18n/translation-service';

export const metadata = genMeta({
  title: 'Medical Devices Group - Leading Healthcare Solutions',
  description: 'Premier provider of medical devices and healthcare solutions across Africa',
  keywords: 'medical devices, healthcare, ultrasound, cardiology, imaging',
});

// Enable PPR for this page
export const experimental_ppr = true;

export default async function HomePage() {
  const locale = await getLocale();

  // Fetch data in parallel
  const [
    heroSlides,
    fallbackFeaturedProducts,
    fallbackBrands,
    facesBehindDeviceSection,
    featuredSection,
    brandsSection,
    uiTranslations,
    specialtyTranslations,
  ] = await Promise.all([
    getLocalizedHeroSlides(locale),
    ProductService.getFeatured(6),
    BrandService.getAll(true),
    HomeSectionService.getLocalizedByKey('about', locale),
    HomeSectionService.getLocalizedByKey('featuredProducts', locale),
    HomeSectionService.getLocalizedByKey('brands', locale),
    getTranslationsByCategory(locale, 'ui'),
    getTranslationsByCategory(locale, 'specialty'),
  ]);

  // Build subset for gamme labels
  const gammeTranslations = {
    'ui.gamme.high': uiTranslations['ui.gamme.high'],
    'ui.gamme.medium': uiTranslations['ui.gamme.medium'],
    'ui.gamme.low': uiTranslations['ui.gamme.low'],
  };

  // PRODUCT SECTION LOGIC
  const displayProducts =
    featuredSection?.products && featuredSection.products.length > 0
      ? (featuredSection.products as any[])
      : fallbackFeaturedProducts;

  const prodTitle = featuredSection?.title;
  const prodDesc = featuredSection?.subtitle || featuredSection?.content || '';
  const prodCta = featuredSection?.ctaText || uiTranslations['home.viewAll'];

  // BRAND SECTION LOGIC
  const displayBrands =
    brandsSection?.brands && brandsSection.brands.length > 0
      ? (brandsSection.brands as any[])
      : fallbackBrands;

  const brandTitle = brandsSection?.title;
  const brandDesc = brandsSection?.subtitle || brandsSection?.content || '';
  const brandCta = brandsSection?.ctaText || uiTranslations['home.viewAll'];

  return (
    <>
      <HeroCarousel slides={heroSlides} />
      <FeaturedProducts
        products={displayProducts}
        title={prodTitle}
        description={prodDesc}
        viewAllText={prodCta}
        learnMoreText={uiTranslations['ui.learnMore']}
        uiTranslations={gammeTranslations}
        specialtyTranslations={specialtyTranslations}
      />
      <BrandCarousel
        brands={displayBrands}
        title={brandTitle}
        description={brandDesc}
        viewAllText={brandCta}
      />
      <FacesBehindDevice data={facesBehindDeviceSection} />
    </>
  );
}
