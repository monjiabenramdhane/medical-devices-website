'use client';
import { ProductsSkeleton } from './ProductSkeletons';
import { Gamme, Specialty } from '@prisma/client';
import { type Locale } from '@/lib/i18n/types';
import Link from 'next/link';
import Image from 'next/image';
import { Package } from 'lucide-react';

interface ProductGridClientProps {
  initialProducts: any[];
  initialTotal: number;
  locale: Locale;
  selectedParams: { brand?: string; gamme?: string; specialty?: string; search?: string };
  translations: { ui: Record<string, string>; specialty: Record<string, string> };
}

export function ProductGridClient({
  initialProducts: products,
  initialTotal: totalCount,
  locale,
  selectedParams,
  translations
}: ProductGridClientProps) {
  const { ui: uiTranslations, specialty: specialtyTranslations } = translations;
  const t = (key: string, fallback: string) => uiTranslations[key] || fallback;
  const tSpec = (key: string, fallback: string) => specialtyTranslations[key] || fallback;
  const tGamme = (val: Gamme) => t(`ui.gamme.${val.toLowerCase()}`, val);
  const tSpecialty = (val: Specialty) => tSpec(`specialty.${val.toLowerCase()}`, val);

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[#02445b]">{t('ui.noProductsFound', 'No products found')}</h3>
        <p className="text-gray-600 mb-4">{t('ui.adjustFilters', 'Try adjusting your filters or search criteria')}</p>
        <Link
          href="/products"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          {t('ui.clearFilters', 'Clear Filters')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Products count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-600">
          {t('ui.showing', 'Showing')} <span className="font-semibold">{products.length}</span> {t('ui.of', 'of')}{' '}
          <span className="font-semibold">{totalCount}</span> {t('ui.products', 'products')}
        </p>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map(product => {
          const productUrl =
            product.brand && (product.equipmentType || product.subcategory?.equipmentType) && product.subcategory
              ? `/brands/${product.brand.slug}/${product.equipmentType?.slug || product.subcategory.equipmentType?.slug}/${product.subcategory.slug}/${product.slug}`
              : `/products/${product.slug}`;

          return (
            <article key={product.id} className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden">
              <Link href={productUrl}>
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative">
                  <Image
                    src={product.heroImageUrl}
                    alt={product.heroImageAlt || 'Product image'}
                    width={800}
                    height={450}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs text-gray-500 mb-2">{product.brand.name}</p>
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
                  <h3 className="text-lg font-semibold text-[#02445b] mb-2">{product.name}</h3>
                  {product.shortDescription && (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{product.shortDescription}</p>
                  )}
                  {/* {product.series && <p className="text-xs text-gray-500">Series: {product.series.name}</p>}
                  <div className="mt-4 flex items-center text-[#02445b] font-medium group-hover:underline">
                    {t('ui.viewDetails', 'View Details')}
                  </div> */}
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
