import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { generateMetadata as genMeta } from '@/lib/utils';
import { Package, Filter } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale } from '@/lib/i18n/locale-resolver';
import { getTranslationsByCategory, getTranslation } from '@/lib/i18n/translation-service';
import { getLocalizedProducts } from '@/lib/i18n/localized-product-service';
import { Gamme, Specialty } from '@prisma/client';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const title = await getTranslation(locale, 'products.metaTitle', 'All Products - Medical Devices');
  const description = await getTranslation(locale, 'products.metaDescription', 'Browse our complete catalog of medical devices and equipment');
  
  return genMeta({
    title,
    description,
  });
}

export const dynamic = 'force-dynamic';

interface ProductsPageProps {
  searchParams: Promise<{
    brand?: string;
    gamme?: string;
    specialty?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { brand: selectedBrand, gamme, specialty, search } = await searchParams;
  const locale = await getLocale();
  const SPECIALTIES = Object.values(Specialty).filter(
    (s) => s !== Specialty.OTHER
  );
  // Fetch translations and data in parallel
  const [products, brands, uiTranslations, totalCount, specialtyTranslations, productsTranslations] = await Promise.all([
    getLocalizedProducts(locale, {
       brandSlug: selectedBrand,
       gamme: gamme?.toUpperCase() as Gamme,
       specialty: specialty?.toUpperCase() as Specialty,
       search,
       limit: 50,
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
    getTranslationsByCategory(locale, 'ui'), 
    // We still need a raw count for the total if we want it perfect, for now we can rely on products.length or do a raw count query
    // To match original logic exactly:
    prisma.product.count({
        where: {
            isActive: true,
            brand: selectedBrand ? { slug: selectedBrand } : undefined,
            gamme: gamme ? (gamme.toUpperCase() as Gamme) : undefined,
            specialty: specialty ? (specialty.toUpperCase() as Specialty) : undefined,
            OR: search ? [
                { name: { contains: search, mode: 'insensitive' } },
                { shortDescription: { contains: search, mode: 'insensitive' } },
            ] : undefined
        }
    }),
    getTranslationsByCategory(locale, 'specialty'),
    getTranslationsByCategory(locale, 'products'),
  ]);

  const t = (key: string, fallback: string) => uiTranslations[key] || fallback;
  const tSpec = (key: string, fallback: string) => specialtyTranslations[key] || fallback;
  const tProduct = (key: string, fallback: string) => productsTranslations[key] || fallback;

  // Helper to get ranges and specialties localization
  const tGamme = (val: Gamme) => t(`ui.gamme.${val.toLowerCase()}`, val);
  const tSpecialty = (val: Specialty) => tSpec(`specialty.${val.toLowerCase()}`, val);

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#02445b] mb-4">
                {tProduct('products.allProducts', 'All Products')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {tProduct('products.subtitle', 'Explore our complete range of medical devices and equipment')}
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Sidebar Filters */}
            <aside className="hidden lg:block">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <div className="flex items-center mb-6">
                  <Filter className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-semibold text-[#02445b] ">{t('ui.filters', 'Filters')}</h2>
                </div>

                {/* Brand Filter */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-[#466c65] bg-[#ebf6f2] p-2 rounded-lg mb-3">{t('ui.brand', 'Brand')}</h3>
                  <div className="space-y-2 px-2">
                    <Link
                      href="/products"
                      className={`block text-sm ${
                        !selectedBrand
                          ? 'text-[#02445b] font-semibold'
                          : 'text-gray-600 hover:text-[#02445b] '
                      }`}
                    >
                      {t('ui.allBrands', 'All Brands')}
                    </Link>
                    {brands.map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/products?brand=${brand.slug}`}
                        className={`block text-sm ${
                          selectedBrand === brand.slug
                            ? 'text-[#02445b] font-semibold'
                            : 'text-gray-600 hover:text-[#02445b] '
                        }`}
                      >
                        {brand.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Gamme Filter */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-[#466c65] bg-[#ebf6f2] p-2 rounded-lg mb-3">{t('ui.range', 'Range')}</h3>
                  <div className="space-y-2 px-2">
                    <Link
                      href="/products"
                      className={`block text-sm ${
                        !gamme
                          ? 'text-[#02445b] font-semibold'
                          : 'text-gray-600 hover:text-[#02445b] '
                      }`}
                    >
                      {t('ui.allRanges', 'All Ranges')}
                    </Link>
                    <Link
                      href="/products?gamme=high"
                      className={`block text-sm ${
                        gamme === 'high'
                          ? 'text-[#02445b] font-semibold'
                          : 'text-gray-600 hover:text-[#02445b] '
                      }`}
                    >
                      {t('ui.gamme.high', 'High Range')}
                    </Link>
                    <Link
                      href="/products?gamme=medium"
                      className={`block text-sm ${
                        gamme === 'medium'
                          ? 'text-[#02445b] font-semibold'
                          : 'text-gray-600 hover:text-[#02445b] '
                      }`}
                    >
                      {t('ui.gamme.medium', 'Medium Range')}
                    </Link>
                    <Link
                      href="/products?gamme=low"
                      className={`block text-sm ${
                        gamme === 'low'
                          ? 'text-[#02445b] font-semibold'
                          : 'text-gray-600 hover:text-[#02445b] '
                      }`}
                    >
                      {t('ui.gamme.low', 'Entry level')}
                    </Link>
                  </div>
                </div>

                {/* Specialty Filter */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-[#466C65] bg-[#ebf6f2] p-2 rounded-lg mb-3">{t('ui.specialty', 'Specialty')}</h3>
                  <div className="space-y-2 px-2">
                    <Link
                      href="/products"
                      className={`block text-sm ${
                        !specialty
                          ? 'text-[#02445b] font-semibold'
                          : 'text-gray-600 hover:text-[#02445b] '
                      }`}
                    >
                      {t('ui.allSpecialties', 'All Specialties')}
                    </Link>
                     {SPECIALTIES.map((spec) => {
                      const value = spec.toLowerCase();

                      return (
                        <Link
                          key={spec}
                          href={`/products?specialty=${value}`}
                          className={`block text-sm ${
                            specialty === value
                              ? 'text-[#02445b] font-semibold'
                              : 'text-gray-600 hover:text-[#02445b]'
                          }`}
                        >
                          {tSpecialty(spec)}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Results Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-600">
                  {t('ui.showing', 'Showing')} <span className="font-semibold">{products.length}</span> {t('ui.of', 'of')}{' '}
                  <span className="font-semibold">{totalCount}</span> {t('ui.products', 'products')}
                </p>
              </div>

              {/* Products */}
              {products.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#02445b]  mb-2">
                    {t('ui.noProductsFound', 'No products found')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t('ui.adjustFilters', 'Try adjusting your filters or search criteria')}
                  </p>
                  <Link
                    href="/products"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    {t('ui.clearFilters', 'Clear Filters')}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <article
                      key={product.id}
                      className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden"
                    >
                      <Link
                        href={
                          product.brand && (product.equipmentType || (product.subcategory as any)?.equipmentType) && product.subcategory
                            ? `/brands/${product.brand.slug}/${product.equipmentType?.slug || (product.subcategory as any)?.equipmentType?.slug}/${product.subcategory.slug}/${product.slug}`
                            : `/products/${product.slug}`
                        }
                        className="block"
                      >
                        {/* Image */}
                        <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative">
                          <img
                            src={product.heroImageUrl}
                            alt={product.heroImageAlt}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* {product.isFeatured && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                              {t('ui.featured', 'Featured')}
                            </div>
                          )} */}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          {/* Brand */}
                          <p className="text-xs text-gray-500 mb-2">{product.brand.name}</p>

                          {/* Badges */}
                          <div className="flex items-center gap-2 mb-2">
                            {product.gamme && (
                              <span className="inline-block px-2 py-1 text-xs font-semibold text-[#02445b] bg-blue-100 rounded-full">
                                {tGamme(product.gamme)}
                              </span>
                            )}
                            {product.specialty && (
                              <span className="inline-block px-2 py-1 text-xs font-semibold text-[#02445b] bg-[#bdddd1] rounded-full">
                                {tSpecialty(product.specialty)}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-semibold text-[#02445b]  mb-2 group-hover:text-[#02445b] transition-colors">
                            {product.name}
                          </h3>

                          {/* Description */}
                          {product.shortDescription && (
                            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                              {product.shortDescription}
                            </p>
                          )}

                          {/* Series */}
                          {product.series && (
                            <p className="text-xs text-gray-500">
                              {t('ui.series', 'Series')}: {product.series.name}
                            </p>
                          )}

                          {/* CTA */}
                          <div className="mt-4 flex items-center text-[#02445b] font-medium group-hover:underline">
                            {t('ui.viewDetails', 'View Details')}
                            <svg
                              className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}