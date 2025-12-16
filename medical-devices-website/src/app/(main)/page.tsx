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
import { getTranslation } from '@/lib/i18n/translation-service';

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
    translationTitles
  ] = await Promise.all([
    getLocalizedHeroSlides(locale), 
    ProductService.getFeatured(6),
    BrandService.getAll(true),
    HomeSectionService.getLocalizedByKey('about', locale),
    HomeSectionService.getLocalizedByKey('featuredProducts', locale),
    HomeSectionService.getLocalizedByKey('brands', locale),
    // Fetch fallback translations in one go or individually
    Promise.all([
      getTranslation(locale, 'ui.learnMore'),
      getTranslation(locale, 'home.viewAll'),
    ])
  ]);

  const [ tLearnMore, tViewAll] = translationTitles;

  // PRODUCT SECTION LOGIC
  // Use manually selected products if available, else fallback to auto-featured
  const displayProducts = featuredSection?.products && featuredSection.products.length > 0 
    ? (featuredSection.products as any[]) // Type assertion needed due to simple Service return type
    : fallbackFeaturedProducts;

  const prodTitle = featuredSection?.title;
  const prodDesc = featuredSection?.subtitle || featuredSection?.content;
  const prodCta = featuredSection?.ctaText || tViewAll;


  // BRAND SECTION LOGIC
  // Use manually selected brands if available, else fallback to all active
  const displayBrands = brandsSection?.brands && brandsSection.brands.length > 0
    ? (brandsSection.brands as any[]) 
    : fallbackBrands;

    const brandTitle = brandsSection?.title;
    const brandDesc = brandsSection?.subtitle || brandsSection?.content;
    const brandCta = brandsSection?.ctaText || tViewAll;

  return (
    <>
      <HeroCarousel slides={heroSlides} />
      <FeaturedProducts 
        products={displayProducts} 
        title={prodTitle}
        description={prodDesc}
        viewAllText={prodCta}
        learnMoreText={tLearnMore}
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