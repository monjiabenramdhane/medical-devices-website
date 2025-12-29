
import Link from 'next/link';
import { getLocalizedBrands } from '@/lib/i18n/localized-brand-service';
import { getLocale } from '@/lib/i18n/locale-resolver';
import { getTranslationsByCategory } from '@/lib/i18n/translation-service';
import { generateMetadata as genMeta } from '@/lib/utils';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const brands = await getTranslationsByCategory(locale, 'brands');
  return genMeta({
    title: brands['brands.metaTitle'] || 'Our Brands - Medical Devices',
    description:
      brands['brands.metaDescription'] ||
      'Explore our portfolio of leading medical device brands',
  });
}

export const experimental_ppr = true;
export const revalidate = 30;

export default async function BrandsPage() {
  const locale = await getLocale();
  const [brands, brandsUi] = await Promise.all([
    getLocalizedBrands(locale),
    getTranslationsByCategory(locale, 'brands')
  ]);

  const t = (key: string, fallback: string) => brandsUi[key] || fallback;

  return (
    <div className="bg-white">
      <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#02445b]  mb-4">
              {t('brands.title', 'Our Brands')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('brands.subtitle', "We partner with the world's leading medical device manufacturers to bring you the best healthcare solutions.")}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200 hover:border-blue-500"
              >
                <div className="p-8">
                  <div className="flex items-center justify-center h-32 mb-6">
                    <img
                      src={brand.logoUrl}
                      alt={brand.logoAlt}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#02445b]  mb-3 text-center group-hover:text-[#02445b] transition-colors">
                    {brand.name}
                  </h2>
                  {brand.description && (
                    <p className="text-gray-600 text-sm text-center line-clamp-3 mb-4">
                      {brand.description}
                    </p>
                  )}
                  {brand.equipmentTypes && brand.equipmentTypes.length > 0 && (
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 text-xs font-semibold text-[#02445b] bg-blue-100 rounded-full">
                        {brand.equipmentTypes.length} {t('brands.equipmentTypes', 'equipment types')}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}