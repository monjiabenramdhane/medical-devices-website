import { getLocale } from '@/lib/i18n/locale-resolver';
import { getTranslationsByCategory } from '@/lib/i18n/translation-service';
import { getLocalizedProducts } from '@/lib/i18n/localized-product-service';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { cookies } from 'next/headers';
import { Gamme, Specialty } from '@prisma/client';
import { ProductGridClient } from './ProductGridClient';

// Cache the count query
const getCachedProductCount = unstable_cache(
  async (filters: any) => {
    return prisma.product.count({
      where: {
        isActive: true,
        brand: filters.brand ? { slug: filters.brand } : undefined,
        gamme: filters.gamme ? (filters.gamme.toUpperCase() as Gamme) : undefined,
        specialty: filters.specialty ? (filters.specialty.toUpperCase() as Specialty) : undefined,
        OR: filters.search ? [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { shortDescription: { contains: filters.search, mode: 'insensitive' } },
        ] : undefined,
      },
    });
  },
  ['products-count'],
  { tags: ['products'] }
);

interface ProductListingProps {
  searchParams: Promise<{
    brand?: string;
    gamme?: string;
    specialty?: string;
    search?: string;
  }>;
}

export async function ProductListing({ searchParams }: ProductListingProps) {
  const cookieStore = await cookies();
  const cookieBrand = cookieStore.get('brand')?.value;
  const cookieGamme = cookieStore.get('gamme')?.value;
  const cookieSpecialty = cookieStore.get('specialty')?.value;
  const cookieSearch = cookieStore.get('search')?.value;

  const resolvedParams = await searchParams;
  const selectedBrand = resolvedParams.brand ?? cookieBrand;
  const selectedGamme = resolvedParams.gamme ?? cookieGamme;
  const selectedSpecialty = resolvedParams.specialty ?? cookieSpecialty;
  const search = resolvedParams.search ?? cookieSearch;

  const locale = await getLocale();

  // Fetch data in parallel
  const [products, totalCount, uiTranslations, specialtyTranslations] = await Promise.all([
    getLocalizedProducts(locale, {
      brandSlug: selectedBrand,
      gamme: selectedGamme?.toUpperCase() as Gamme,
      specialty: selectedSpecialty?.toUpperCase() as Specialty,
      search,
      limit: 50,
    }),
    getCachedProductCount({
      brand: selectedBrand,
      gamme: selectedGamme,
      specialty: selectedSpecialty,
      search
    }),
    getTranslationsByCategory(locale, 'ui'),
    getTranslationsByCategory(locale, 'specialty')
  ]);

  return (
    <ProductGridClient
      initialProducts={products}
      initialTotal={totalCount}
      locale={locale}
      selectedParams={{ brand: selectedBrand, gamme: selectedGamme, specialty: selectedSpecialty, search }}
      translations={{ ui: uiTranslations, specialty: specialtyTranslations }}
    />
  );
}
