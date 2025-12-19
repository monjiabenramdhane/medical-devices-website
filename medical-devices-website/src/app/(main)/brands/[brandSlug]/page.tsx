
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLocalizedBrand } from '@/lib/i18n/localized-brand-service';
import { getLocale } from '@/lib/i18n/locale-resolver';
import { getTranslationsByCategory } from '@/lib/i18n/translation-service';
import { generateMetadata as genMeta } from '@/lib/utils';
import { ChevronRight, Package } from 'lucide-react';
import type { Metadata } from 'next';

interface BrandPageProps {
  params: Promise<{
    brandSlug: string;
  }>;
}

export async function generateMetadata(props: BrandPageProps): Promise<Metadata> {
  const params = await props.params;
  const locale = await getLocale();
  const brand = await getLocalizedBrand(params.brandSlug, locale);
  
  if (!brand) return {};

  return genMeta({
    title: brand.metaTitle || `${brand.name}`,
    description: brand.metaDescription || brand.description || '',
    image: brand.heroImageUrl || brand.logoUrl,
  });
}

export const dynamic = 'force-dynamic';

export default async function BrandPage(props: BrandPageProps) {
  const params = await props.params;
  const locale = await getLocale();
  const [brand, ui, navUi, brandUi, notFoundUi] = await Promise.all([
    getLocalizedBrand(params.brandSlug, locale),
    getTranslationsByCategory(locale, 'ui'),
    getTranslationsByCategory(locale, 'navigation'),
    getTranslationsByCategory(locale, 'brands'),
    getTranslationsByCategory(locale, 'notFound')

  ]);

  if (!brand) notFound();

  const t = (key: string, fallback: string) => ui[key] || fallback;
  const b = (key: string, fallback: string) => brandUi[key] || fallback;
  const n = (key: string, fallback: string) => navUi[key] || fallback;
  const nfT = (key: string, fallback: string) => notFoundUi[key] || fallback;

  return (
    <div className="bg-white">
      {/* Brand Hero */}
      {brand.heroImageUrl ? (
          <section className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 z-0">
                  <img src={brand.heroImageUrl} alt={brand.heroImageAlt || brand.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50" />
             </div>
             <div className="relative mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 z-10">
                {/* <img
                  src={brand.logoUrl}
                  alt={brand.logoAlt}
                  className="h-24 w-auto mb-6 bg-white/90 p-4 rounded-lg shadow-lg"
                /> */}
                <h1 className="text-5xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                  {brand.name}
                </h1>
                {brand.description && (
                  <p className="text-2xl text-white/90 max-w-2xl drop-shadow-md">
                    {brand.description}
                  </p>
                )}
                {brand.websiteUrl && (
                  <a
                    href={brand.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-6 px-6 py-3 border border-[#193660] text-base font-medium rounded-md text-[#02445b] bg-white hover:bg-blue-50 transition-colors"
                  >
                    {b('brands.visitWebsite', 'Visit Official Website')}
                    <svg
                      className="ml-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
             </div>
          </section>
      ) : (
        <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <img
                src={brand.logoUrl}
                alt={brand.logoAlt}
                className="h-24 w-auto mx-auto mb-6"
              />
              <h1 className="text-4xl font-bold text-[#02445b]  mb-4">
                {brand.name}
              </h1>
              {brand.description && (
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  {brand.description}
                </p>
              )}
              {brand.websiteUrl && (
                  <a
                    href={brand.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-6 px-6 py-3 border border-[#193660] text-base font-medium rounded-md text-[#02445b] bg-white hover:bg-blue-50 transition-colors"
                  >
                    {b('brands.visitWebsite', 'Visit Official Website')}
                    <svg
                      className="ml-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
              )}
            </div>
          </div>
        </section>
      )}
{/* Breadcrumbs */}
      <nav className="bg-gray-50 py-4" aria-label="Breadcrumb">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                {n('nav.home', 'Home')}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <Link href="/brands" className="text-gray-500 hover:text-gray-700">
                {n('nav.brands', 'Brands')}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-[#02445b] font-medium" aria-current="page">
              {brand.name}
            </li>
          </ol>
        </div>
      </nav>
      {/* Equipment Types Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#02445b]  mb-8">
             {b('brands.equipmentCategories', 'Equipment Categories')}
          </h2>

          {!brand.equipmentTypes || brand.equipmentTypes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{nfT('notFound.noEquipment', 'No equipment categories available yet.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {brand.equipmentTypes.map((equipmentType) => {
                const isHeroOrIcon = equipmentType.heroImageUrl || equipmentType.iconUrl;
                return (
                  <Link
                    key={equipmentType.id}
                    href={`/brands/${brand.slug}/${equipmentType.slug}`}
                    className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden"
                  >
                    {/* Image ou fallback logo */}
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 flex items-center justify-center">
                      <img
                        src={
                          equipmentType.heroImageUrl ||
                          equipmentType.iconUrl ||
                          brand.logoUrl // fallback au logo de la marque
                        }
                        alt={equipmentType.heroImageAlt || equipmentType.name || brand.name}
                        className={`w-full h-48 transition-transform duration-300 ${
                          isHeroOrIcon ? 'object-cover group-hover:scale-105' : 'object-contain'
                        }`}
                      />
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-[#02445b] mb-2 group-hover:text-[#02445b] transition-colors">
                        {equipmentType.name}
                      </h3>
                      {equipmentType.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {equipmentType.description}
                        </p>
                      )}
                      {equipmentType.subcategories && equipmentType.subcategories.length > 0 && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Package className="h-4 w-4 mr-2" />
                          {equipmentType.subcategories.length} {b('brands.subcategories', 'subcategories')} 
                        </div>
                      )}
                      <div className="mt-4 flex items-center text-[#02445b] font-medium group-hover:underline">
                        {t('ui.explore', 'Explore')}
                        <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}