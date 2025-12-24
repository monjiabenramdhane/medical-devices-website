import { Suspense } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { ProductsSection } from '@/components/home/ProductsSection';
import { BrandsSection } from '@/components/home/BrandsSection';
import { FacesSection } from '@/components/home/FacesSection';
import { 
  HeroSkeleton, 
  ProductsSkeleton, 
  BrandsSkeleton, 
  FacesSkeleton 
} from '@/components/home/HomeSkeletons';
import { generateMetadata as genMeta } from '@/lib/utils';

export const metadata = genMeta({
  title: 'Medical Devices Group - Leading Healthcare Solutions',
  description: 'Premier provider of medical devices and healthcare solutions across Africa',
  keywords: 'medical devices, healthcare, ultrasound, cardiology, imaging',
});

// Enable PPR for this page
export const experimental_ppr = true;

// Enable ISR (Incremental Static Regeneration) with 5-minute revalidation for home page
// Longer window = more cache hits (97%+), fewer cold starts
export const revalidate = 30;


export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsSection />
      </Suspense>

      <Suspense fallback={<BrandsSkeleton />}>
        <BrandsSection />
      </Suspense>

      <Suspense fallback={<FacesSkeleton />}>
        <FacesSection />
      </Suspense>
    </main>
  );
}
