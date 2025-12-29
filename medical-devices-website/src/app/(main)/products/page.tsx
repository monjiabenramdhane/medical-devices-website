import { generateMetadata as genMeta } from '@/lib/utils';
import { getLocale } from '@/lib/i18n/locale-resolver';
import { getTranslation } from '@/lib/i18n/translation-service';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { SidebarLoader } from '@/components/products/SidebarLoader';
import { ProductsSkeleton } from '@/components/products/ProductSkeletons';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { ProductHeader } from '@/components/products/ProductHeader';
import { ProductListing } from '@/components/products/ProductListing';
import { getTranslationsByCategory } from '@/lib/i18n/translation-service';

// --- Cached Data Fetchers ---
const getCachedBrands = unstable_cache(
  async () => {
    return prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
  },
  ['brands-list'],
  { tags: ['brands'] }
);

// --- Metadata ---
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const title = await getTranslation(locale, 'products.metaTitle', 'All Products - Medical Devices');
  const description = await getTranslation(locale, 'products.metaDescription', 'Browse our complete catalog of medical devices and equipment');
  return genMeta({ title, description });
}

// --- ISR + PPR ---
export const revalidate = 30;
export const experimental_ppr = true;

interface ProductsPageProps {
  searchParams: Promise<{
    brand?: string;
    gamme?: string;
    specialty?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {

  return (
    <div className="bg-white">
      {/* Header */}
      <Suspense fallback={
        <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="h-10 w-64 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-96 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
        </section>
      }>
        <ProductHeader />
      </Suspense>

      {/* Filters & Products */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-lg" />}>
                <SidebarWrapper searchParams={searchParams} />
              </Suspense>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <Suspense fallback={<ProductsSkeleton />}>
                <ProductListing searchParams={searchParams} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { cookies } from 'next/headers';

async function SidebarWrapper({ searchParams }: { searchParams: Promise<any> }) {
  const cookieStore = await cookies();
  const cookieBrand = cookieStore.get('brand')?.value;
  const cookieGamme = cookieStore.get('gamme')?.value;
  const cookieSpecialty = cookieStore.get('specialty')?.value;
  
  const resolvedParams = await searchParams;
  const selectedBrand = resolvedParams.brand ?? cookieBrand;
  const selectedGamme = resolvedParams.gamme ?? cookieGamme;
  const selectedSpecialty = resolvedParams.specialty ?? cookieSpecialty;
  
  const locale = await getLocale();
  
  const brandsPromise = getCachedBrands();
  const uiTranslationsPromise = getTranslationsByCategory(locale, 'ui');
  const specialtyTranslationsPromise = getTranslationsByCategory(locale, 'specialty');

  return (
    <SidebarLoader 
      brandsPromise={brandsPromise}
      selectedParams={{ brand: selectedBrand, gamme: selectedGamme, specialty: selectedSpecialty }}
      translationsPromise={Promise.all([uiTranslationsPromise, specialtyTranslationsPromise])}
    />
  );
}
