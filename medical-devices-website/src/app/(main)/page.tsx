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
  const [heroSlides, featuredProducts, brands, facesBehindDeviceSection] = await Promise.all([
    getLocalizedHeroSlides(locale), 
    ProductService.getFeatured(6),
    BrandService.getAll(true),
    HomeSectionService.getLocalizedByKey('about', locale),
  ]);
  return (
    <>
      <HeroCarousel slides={heroSlides} />
      <FeaturedProducts products={featuredProducts} />
      <BrandCarousel brands={brands} />
      <FacesBehindDevice data={facesBehindDeviceSection} />
    </>
  );
}