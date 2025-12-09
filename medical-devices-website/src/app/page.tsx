import { HeroCarousel } from '@/components/home/HeroCarousel';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BrandCarousel } from '@/components/home/BrandCarousel';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { HeroSlideService } from '@/services/heroSlide.service';
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
  const [heroSlides, featuredProducts, brands] = await Promise.all([
    HeroSlideService.getAll(true),
    ProductService.getFeatured(6),
    BrandService.getAll(true),
    
  ]);
console.log(featuredProducts);
  return (
    <>
      <HeroCarousel slides={heroSlides} />
      <FeaturedProducts products={featuredProducts} />
      <BrandCarousel brands={brands} />
      
      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">
                Faces Behind The Device
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                At Medical Devices Group, we bring together the world's leading medical 
                technology brands to deliver comprehensive healthcare solutions across 
                Africa and beyond.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our commitment extends beyond supplying equipment. We provide complete 
                support including installation, training, maintenance, and ongoing technical 
                assistance to ensure optimal performance and patient outcomes.
              </p>
              <a
                href="/about"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Meet Our Team
              </a>
            </div>
            <div className="mt-10 lg:mt-0">
              <ImageWithFallback
                src="/images/about-building.jpg"
                alt="Medical Devices Group headquarters"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}