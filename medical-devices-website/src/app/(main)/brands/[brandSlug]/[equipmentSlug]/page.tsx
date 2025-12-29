
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLocalizedEquipmentType } from '@/lib/i18n/localized-brand-service';
import { getLocale } from '@/lib/i18n/locale-resolver';
import { getTranslationsByCategory } from '@/lib/i18n/translation-service';
import { generateMetadata as genMeta } from '@/lib/utils';
import { ChevronRight, Layers } from 'lucide-react';
import type { Metadata } from 'next';

interface EquipmentTypePageProps {
  params: Promise<{
    brandSlug: string;
    equipmentSlug: string;
  }>;
}

export async function generateMetadata({ params }: EquipmentTypePageProps): Promise<Metadata> {
  const { brandSlug, equipmentSlug: equipmentTypeSlug } = await params;
  const locale = await getLocale();
  const equipmentType = await getLocalizedEquipmentType(brandSlug, equipmentTypeSlug, locale);
  
  if (!equipmentType) return {};

  return genMeta({
    title: `${equipmentType.name} - ${equipmentType.brand?.name}`,
    description: equipmentType.description || `Explore ${equipmentType.name} from ${equipmentType.brand?.name}`,
    image: equipmentType.heroImageUrl || equipmentType.iconUrl || equipmentType.brand?.logoUrl,
  });
}

export const experimental_ppr = true;
export const revalidate = 30;

export default async function EquipmentTypePage({ params }: EquipmentTypePageProps) {
  const { brandSlug, equipmentSlug: equipmentTypeSlug } = await params;
  const locale = await getLocale();
  const [equipmentType, ui, navUi, eqTypeUi, notFoundUi] = await Promise.all([
    getLocalizedEquipmentType(brandSlug, equipmentTypeSlug, locale),
    getTranslationsByCategory(locale, 'ui'),
    getTranslationsByCategory(locale, 'navigation'),
    getTranslationsByCategory(locale, 'equipementType'),
    getTranslationsByCategory(locale, 'notFound'),
  ]);

  if (!equipmentType) notFound();

  const t = (key: string, fallback: string) => ui[key] || fallback;
  const navT = (key: string, fallback: string) => navUi[key] || fallback;
  const eqTypeT = (key: string, fallback: string) => eqTypeUi[key] || fallback;
  const nfT = (key: string, fallback: string) => notFoundUi[key] || fallback;

  return (
    <div className="bg-white">
      {/* Equipment Type Header / Hero */}
      {equipmentType.heroImageUrl ? (
          <section className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 z-0">
                  <img src={equipmentType.heroImageUrl} alt={equipmentType.heroImageAlt || equipmentType.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50" />
             </div>
             <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white">
                {equipmentType.iconUrl && (
                  <img
                    src={equipmentType.iconUrl}
                    alt=""
                    className="h-20 w-20 mb-6 mx-auto bg-white/10 p-2 rounded-full backdrop-blur-sm"
                  />
                )}
                <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                  {equipmentType.name}
                </h1>
                <p className="text-xl mb-6 font-light">
                  {t('ui.by', 'by')}{' '}
                  <Link
                    href={`/brands/${brandSlug}`}
                    className="hover:underline font-semibold"
                  >
                    {equipmentType.brand?.name}
                  </Link>
                </p>
                {equipmentType.description && (
                  <p className="text-lg max-w-2xl mx-auto drop-shadow-md">
                    {equipmentType.description}
                  </p>
                )}
             </div>
          </section>
      ) : (
        <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
                <div>
                {equipmentType.iconUrl && (
                    <img
                    src={equipmentType.iconUrl}
                    alt=""
                    className="h-20 w-20 mb-6"
                    />
                )}
                <h1 className="text-4xl font-bold text-[#02445b]  mb-4">
                    {equipmentType.name}
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                    {t('ui.by', 'by')}{' '}
                    <Link
                    href={`/brands/${brandSlug}`}
                    className="text-[#02445b] hover:underline font-semibold"
                    >
                    {equipmentType.brand?.name}
                    </Link>
                </p>
                {equipmentType.description && (
                    <p className="text-lg text-gray-700 mb-6">
                    {equipmentType.description}
                    </p>
                )}
                </div>
                <div className="mt-8 lg:mt-0">
                  {equipmentType.brand?.logoUrl && (
                    <img
                        src={equipmentType.brand.logoUrl}
                        alt={equipmentType.brand.logoAlt}
                        className="h-32 w-auto"
                    />
                  )}
                </div>
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
                {navT('nav.home', 'Home')}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <Link href="/brands" className="text-gray-500 hover:text-gray-700">
                {navT('nav.brands', 'Brands')}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <Link
                href={`/brands/${equipmentType.brand?.slug}`}
                className="text-gray-500 hover:text-gray-700"
              >
                {navT('nav.brand', 'Brand')}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-[#02445b]  font-medium" aria-current="page">
              {equipmentType.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* Subcategories Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#02445b]  mb-8">
            {eqTypeT('equipementType.subcategoriesAndSpecialties', 'Subcategories & Specialties')}
          </h2>

          {!equipmentType.subcategories || equipmentType.subcategories.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{nfT('notFound.noSubcategories', 'No subcategories available yet.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {equipmentType.subcategories.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/brands/${brandSlug}/${equipmentTypeSlug}/${subcategory.slug}`}
                  className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200 hover:border-blue-500"
                >
                  {subcategory.heroImageUrl && (
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                          <img src={subcategory.heroImageUrl} alt={subcategory.heroImageAlt || ''} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"/>
                      </div>
                   )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-[#02445b]  mb-2 group-hover:text-[#02445b] transition-colors">
                      {subcategory.name}
                    </h3>
                    {subcategory.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {subcategory.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div>
                        {subcategory.productCount !== undefined && subcategory.productCount > 0 && (
                          <span className="mr-4">
                            {subcategory.productCount} {t('ui.products', 'products')}
                          </span>
                        )}
                        {/* {subcategory.seriesCount !== undefined && subcategory.seriesCount > 0 && (
                          <span>
                            {subcategory.seriesCount} {t('ui.series', 'series')}
                          </span>
                        )} */}
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#02445b] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}