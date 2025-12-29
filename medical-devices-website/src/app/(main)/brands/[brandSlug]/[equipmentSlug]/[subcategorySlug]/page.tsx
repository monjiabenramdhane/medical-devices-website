
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLocalizedSubcategory } from '@/lib/i18n/localized-brand-service';
import { getLocale } from '@/lib/i18n/locale-resolver';
import { getTranslationsByCategory } from '@/lib/i18n/translation-service';
import { generateMetadata as genMeta } from '@/lib/utils';
import { ChevronRight, Package } from 'lucide-react';
import type { Metadata } from 'next';

interface SubcategoryPageProps {
  params: Promise<{
    brandSlug: string;
    equipmentSlug: string;
    subcategorySlug: string;
  }>;
}

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const { brandSlug, equipmentSlug: equipmentTypeSlug, subcategorySlug } = await params;
  const locale = await getLocale();
  const subcategory = await getLocalizedSubcategory(brandSlug, equipmentTypeSlug, subcategorySlug, locale);
  
  if (!subcategory) return {};

  return genMeta({
    title: `${subcategory.name} - ${subcategory.equipmentType?.name}`,
    description: subcategory.description || `Explore ${subcategory.name} solutions`,
    image: subcategory.heroImageUrl || subcategory.equipmentType?.brand?.logoUrl, // Fallback chain
  });
}

export const experimental_ppr = true;
export const revalidate = 30;

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { brandSlug, equipmentSlug: equipmentTypeSlug, subcategorySlug } = await params;
  const locale = await getLocale();
  const [subcategory, ui, nav, notFoundUi] = await Promise.all([
    getLocalizedSubcategory(brandSlug, equipmentTypeSlug, subcategorySlug, locale),
    getTranslationsByCategory(locale, 'ui'),
    getTranslationsByCategory(locale, 'navigation'),
    getTranslationsByCategory(locale, 'notFound'), 

  ]);

  if (!subcategory) notFound();

  const t = (key: string, fallback: string) => ui[key] || fallback;
  const tNav = (key: string, fallback: string) => nav[key] || fallback;
  const nfT = (key: string, fallback: string) => notFoundUi[key] || fallback;

  // const hasSeries = subcategory.series && subcategory.series.length > 0;
  const hasProducts = subcategory.products && subcategory.products.length > 0;

  return (
    <div className="bg-white">
      {/* Subcategory Header / Hero */}
      {subcategory.heroImageUrl ? (
          <section className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 z-0">
                  <img src={subcategory.heroImageUrl} alt={subcategory.heroImageAlt || subcategory.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50" />
             </div>
             <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                  {subcategory.name}
                </h1>
                <p className="text-xl mb-4 font-light">
                  {subcategory.equipmentType?.name} •{' '}
                  <Link
                    href={`/brands/${brandSlug}`}
                    className="hover:underline font-semibold"
                  >
                    {subcategory.equipmentType?.brand?.name}
                  </Link>
                </p>
                {subcategory.description && (
                  <p className="text-lg max-w-2xl mx-auto drop-shadow-md">
                    {subcategory.description}
                  </p>
                )}
             </div>
          </section>
      ) : (
        <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-[#02445b]  mb-4">
                {subcategory.name}
            </h1>
            <p className="text-lg text-gray-600 mb-4">
                {subcategory.equipmentType?.name} •{' '}
                <Link
                href={`/brands/${brandSlug}`}
                className="text-[#02445b] hover:underline"
                >
                {subcategory.equipmentType?.brand?.name}
                </Link>
            </p>
            {subcategory.description && (
                <p className="text-lg text-gray-700 max-w-3xl">
                {subcategory.description}
                </p>
            )}
            </div>
        </section>
      )}
      {/* Breadcrumbs */}
      <nav className="bg-gray-50 py-4" aria-label="Breadcrumb">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center space-x-2 text-sm flex-wrap">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                {tNav('nav.home', 'Home')}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <Link href="/brands" className="text-gray-500 hover:text-gray-700">
                {tNav('nav.brands', 'Brands')}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <Link
                href={`/brands/${brandSlug}`}
                className="text-gray-500 hover:text-gray-700"
              >
                {subcategory.equipmentType?.brand?.name}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <Link
                href={`/brands/${brandSlug}/${equipmentTypeSlug}`}
                className="text-gray-500 hover:text-gray-700"
              >
                {subcategory.equipmentType?.name}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-[#02445b]  font-medium" aria-current="page">
              {subcategory.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* Series Section */}
      {/* {hasSeries && (
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#02445b]  mb-8">
              {t('ui.productSeries', 'Product Series')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subcategory.series.map((series) => (
                <Link
                  key={series.id}
                  href={`/brands/${brandSlug}/${equipmentTypeSlug}/${subcategorySlug}/${series.slug}`}
                  className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden"
                >
                  {series.imageUrl && (
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      <img
                        src={series.imageUrl}
                        alt={series.imageAlt || series.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-[#02445b]  mb-2 group-hover:text-[#02445b] transition-colors">
                      {series.name}
                    </h3>
                    {series.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {series.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {series.productCount} {t('ui.products', 'products')}
                      </span>
                      <ChevronRight className="h-5 w-5 text-[#02445b] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )} */}

      {/* Products Section */}
      {hasProducts && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#02445b]  mb-8">
              {/* {hasSeries ? t('ui.allProducts', 'All Products') : t('ui.products', 'Products')} */}
             {t('ui.allProducts', 'All Products')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subcategory.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/brands/${brandSlug}/${equipmentTypeSlug}/${subcategorySlug}/${product.slug}`} // Note: changed to absolute product link as that's usually preferred for canonical
                  className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img
                      src={product.heroImageUrl}
                      alt={product.heroImageAlt || product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    {product.gamme && (
                      <span className="inline-block px-3 py-1 text-xs font-semibold text-[#02445b] bg-blue-100 rounded-full mb-2">
                         {t(`ui.gamme.${product.gamme.toLowerCase()}`, product.gamme)}
                      </span>
                    )}
                    <h3 className="text-xl font-semibold text-[#02445b]  mb-2 group-hover:text-[#02445b] transition-colors">
                      {product.name}
                    </h3>
                    {product.shortDescription && (
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {product.shortDescription}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {/* {!hasSeries && !hasProducts && (*/}
      { !hasProducts && ( 
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{nfT('notFound.noProductsOrSeries', 'No products or series available yet.')}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}