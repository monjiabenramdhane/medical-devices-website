import { HeroCarousel } from '@/components/home/HeroCarousel';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BrandCarousel } from '@/components/home/BrandCarousel';
import { FacesBehindDevice } from '@/components/home/FacesBehindDevice';
import { HeroSlideService } from '@/services/heroSlide.service';
import { HomeSectionService } from '@/services/homeSection.service';
import { ProductService } from '@/services/product.service';
import { BrandService } from '@/services/brand.service';
import { generateMetadata as genMeta } from '@/lib/utils';

export const metadata = genMeta({
  title: 'Medical Devices Group - Leading Healthcare Solutions',
  description: 'Premier provider of medical devices and healthcare solutions across Africa',
  keywords: 'medical devices, healthcare, ultrasound, cardiology, imaging',
});

// Enable PPR for this page
export const experimental_ppr = true;

export default async function HomePage() {
  // Fetch data in parallel
  const [heroSlides, featuredProducts, brands, facesBehindDeviceSection] = await Promise.all([
    HeroSlideService.getAll(true),
    ProductService.getFeatured(6),
    BrandService.getAll(true),
    HomeSectionService.getByKey('about'),
  ]);
console.log(featuredProducts);
  return (
    <>
      <HeroCarousel slides={heroSlides} />
      <FeaturedProducts products={featuredProducts} />
      <BrandCarousel brands={brands} />
      <FacesBehindDevice data={facesBehindDeviceSection} />
    </>
  );
}