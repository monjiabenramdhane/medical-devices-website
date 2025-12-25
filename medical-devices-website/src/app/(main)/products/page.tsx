import { prisma } from '@/lib/prisma';
import { generateMetadata as genMeta } from '@/lib/utils';
import { getLocale } from '@/lib/i18n/locale-resolver';
import { getTranslationsByCategory, getTranslation } from '@/lib/i18n/translation-service';
import { getLocalizedProducts } from '@/lib/i18n/localized-product-service';
import { Gamme, Specialty } from '@prisma/client';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { SidebarLoader } from '@/components/products/SidebarLoader';
import { GridLoader } from '@/components/products/GridLoader';
import { ProductsSkeleton } from '@/components/products/ProductSkeletons';
import { cookies } from 'next/headers';

// --- Metadata ---
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const title = await getTranslation(locale, 'products.metaTitle', 'All Products - Medical Devices');
  const description = await getTranslation(locale, 'products.metaDescription', 'Browse our complete catalog of medical devices and equipment');
  return genMeta({ title, description });
}

// ISR + PPR
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
  const cookieStore = await cookies();

  // --- Cookies ---
  const cookieBrand = cookieStore.get('brand')?.value;
  const cookieGamme = cookieStore.get('gamme')?.value;
  const cookieSpecialty = cookieStore.get('specialty')?.value;
  const cookieSearch = cookieStore.get('search')?.value;
  const cookieLocale = cookieStore.get('locale')?.value;

  // --- URL params ---
  const resolvedParams = await searchParams;

  // --- Final selection (URL overrides cookie) ---
  const selectedBrand = resolvedParams.brand !== undefined ? resolvedParams.brand : cookieBrand;
  const selectedGamme = resolvedParams.gamme !== undefined ? resolvedParams.gamme : cookieGamme;
  const selectedSpecialty = resolvedParams.specialty !== undefined ? resolvedParams.specialty : cookieSpecialty;
  const search = resolvedParams.search !== undefined ? resolvedParams.search : cookieSearch;

  // --- Locale ---
  const finalLocale = (cookieLocale || (await getLocale())) as 'en' | 'fr';

  // --- Translations ---
  const uiTranslationsPromise = getTranslationsByCategory(finalLocale, 'ui');
  const productsTranslationsPromise = getTranslationsByCategory(finalLocale, 'products');
  const specialtyTranslationsPromise = getTranslationsByCategory(finalLocale, 'specialty');

  // --- Data fetching (slow) ---
  const brandsPromise = prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  });

  const productsPromise = getLocalizedProducts(finalLocale, {
    brandSlug: selectedBrand,
    gamme: selectedGamme?.toUpperCase() as Gamme,
    specialty: selectedSpecialty?.toUpperCase() as Specialty,
    search,
    limit: 50,
  });

  const countPromise = prisma.product.count({
    where: {
      isActive: true,
      brand: selectedBrand ? { slug: selectedBrand } : undefined,
      gamme: selectedGamme ? (selectedGamme.toUpperCase() as Gamme) : undefined,
      specialty: selectedSpecialty ? (selectedSpecialty.toUpperCase() as Specialty) : undefined,
      OR: search ? [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ] : undefined
    }
  });

  const productsTranslations = await productsTranslationsPromise;

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-[#02445b] mb-4">{productsTranslations['products.allProducts'] || 'All Products'}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{productsTranslations['products.subtitle'] || 'Explore our complete range of medical devices and equipment'}</p>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-lg" />}>
                <SidebarLoader 
                  brandsPromise={brandsPromise}
                  selectedParams={{ brand: selectedBrand, gamme: selectedGamme, specialty: selectedSpecialty }}
                  uiTranslationsPromise={uiTranslationsPromise}
                  specialtyTranslationsPromise={specialtyTranslationsPromise}
                />
              </Suspense>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <Suspense fallback={<ProductsSkeleton />}>
                <GridLoader 
                  productsPromise={productsPromise}
                  countPromise={countPromise}
                  locale={finalLocale}
                  selectedParams={{ brand: selectedBrand, gamme: selectedGamme, specialty: selectedSpecialty, search }}
                  uiTranslationsPromise={uiTranslationsPromise}
                  specialtyTranslationsPromise={specialtyTranslationsPromise}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
