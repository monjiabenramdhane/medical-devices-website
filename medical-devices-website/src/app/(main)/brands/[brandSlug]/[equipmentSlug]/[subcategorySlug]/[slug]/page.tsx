
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLocalizedSeries } from '@/lib/i18n/localized-brand-service';
import { getLocalizedProduct } from '@/lib/i18n/localized-product-service';
import { getLocale } from '@/lib/i18n/locale-resolver';
import { getTranslationsByCategory } from '@/lib/i18n/translation-service';
import { generateMetadata as genMeta } from '@/lib/utils';
import { ChevronRight, Package } from 'lucide-react';
import type { Metadata } from 'next';
import ProductHeroSection from '@/components/products/ProductSection';
import { headers } from 'next/headers';

interface DynamicSlugPageProps {
  params: Promise<{
    brandSlug: string;
    equipmentSlug: string;
    subcategorySlug: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: DynamicSlugPageProps): Promise<Metadata> {
  const { brandSlug, equipmentSlug: equipmentTypeSlug, subcategorySlug, slug } = await params;
  const locale = await getLocale();

  // Try to find as series first
  const series = await getLocalizedSeries(brandSlug, equipmentTypeSlug, subcategorySlug, slug, locale);

  if (series) {
    return genMeta({
      title: `${series.name} - ${series.subcategory?.equipmentType?.brand?.name}`,
      description: series.description || `Explore the ${series.name} product series`,
      image: series.imageUrl || undefined,
    });
  }

  // Try to find as product using localized service
  const product = await getLocalizedProduct(slug, locale);

  if (product) {
    return genMeta({
      title: product.metaTitle || `${product.name} | ${product.brand.name}`,
      description: product.metaDescription || product.shortDescription || '',
      keywords: product.metaKeywords || '',
      image: product.heroImageUrl,
    });
  }

  return {};
}

export const experimental_ppr = true;
export const revalidate = 30;

export default async function DynamicSlugPage({ params }: DynamicSlugPageProps) {
  const { brandSlug, equipmentSlug: equipmentTypeSlug, subcategorySlug, slug } = await params;
  const locale = await getLocale();
  const uiTranslations = await getTranslationsByCategory(locale, 'ui');
  const specialtyTranslations = await getTranslationsByCategory(locale, 'specialty');

  const t = (key: string, fallback: string) => uiTranslations[key] || fallback;

  // const getGammeLabel = (gamme: string | undefined) => {
  //   if (!gamme) return '';
  //   return uiTranslations[`ui.gamme.${gamme.toLowerCase()}`] || gamme;
  // };

  // const getSpecialtyLabel = (specialty: string | undefined) => {
  //   if (!specialty) return '';
  //   return specialtyTranslations[`specialty.${specialty.toLowerCase()}`] || specialty;
  // };

  // Try to find as series first
  // const series = await getLocalizedSeries(brandSlug, equipmentTypeSlug, subcategorySlug, slug, locale);

  // If found as series, render series page
  // if (series) {
  //   const brand = series.subcategory.equipmentType.brand;
  //   const equipmentType = series.subcategory.equipmentType;
  //   const subcategory = series.subcategory;
  //   const localizedSeriesProducts = series.products;

  //   console.log(series);

  //   return (
  //     <div className="bg-white">
  //       {/* Series Header */}
  //       <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
  //         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  //           <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
  //             <div>
  //               <h1 className="text-4xl font-bold text-[#02445b]  mb-4">
  //                 {series.name}
  //               </h1>
  //               <p className="text-lg text-gray-600 mb-6">
  //                 {subcategory.name} •{' '}
  //                 <Link
  //                   href={`/brands/${brandSlug}`}
  //                   className="text-[#02445b] hover:underline"
  //                 >
  //                   {brand.name}
  //                 </Link>
  //               </p>
  //               {series.description && (
  //                 <div className="prose prose-lg text-gray-700 mb-8">
  //                   <p>{series.description}</p>
  //                 </div>
  //               )}
  //               {localizedSeriesProducts.length > 0 && (
  //                 <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
  //                   <Package className="h-5 w-5 mr-2" />
  //                   {localizedSeriesProducts.length} {localizedSeriesProducts.length === 1 ? t('ui.product', 'product') : t('ui.products', 'products')} {t('ui.inThisSeries', 'in this series')}
  //                 </div>
  //               )}
  //             </div>
  //             {series.imageUrl && (
  //               <div className="mt-8 lg:mt-0">
  //                 <img
  //                   src={series.imageUrl}
  //                   alt={series.imageAlt || series.name}
  //                   className="rounded-lg shadow-xl"
  //                 />
  //               </div>
  //             )}
  //           </div>
  //         </div>
  //       </section>
  //       {/* Breadcrumbs */}
  //       <nav className="bg-gray-50 py-4" aria-label="Breadcrumb">
  //         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  //           <ol className="flex items-center space-x-2 text-sm flex-wrap">
  //             <li>
  //               <Link href="/" className="text-gray-500 hover:text-gray-700">
  //                 {t('nav.home', 'Home')}
  //               </Link>
  //             </li>
  //             <ChevronRight className="h-4 w-4 text-gray-400" />
  //             <li>
  //               <Link href="/brands" className="text-gray-500 hover:text-gray-700">
  //                 {t('nav.brands', 'Brands')}
  //               </Link>
  //             </li>
  //             <ChevronRight className="h-4 w-4 text-gray-400" />
  //             <li>
  //               <Link
  //                 href={`/brands/${brandSlug}`}
  //                 className="text-gray-500 hover:text-gray-700"
  //               >
  //                 {brand.name}
  //               </Link>
  //             </li>
  //             <ChevronRight className="h-4 w-4 text-gray-400" />
  //             <li>
  //               <Link
  //                 href={`/brands/${brandSlug}/${equipmentTypeSlug}`}
  //                 className="text-gray-500 hover:text-gray-700"
  //               >
  //                 {equipmentType.name}
  //               </Link>
  //             </li>
  //             <ChevronRight className="h-4 w-4 text-gray-400" />
  //             <li>
  //               <Link
  //                 href={`/brands/${brandSlug}/${equipmentTypeSlug}/${subcategorySlug}`}
  //                 className="text-gray-500 hover:text-gray-700"
  //               >
  //                 {subcategory.name}
  //               </Link>
  //             </li>
  //             <ChevronRight className="h-4 w-4 text-gray-400" />
  //             <li className="text-[#02445b]  font-medium" aria-current="page">
  //               {series.name}
  //             </li>
  //           </ol>
  //         </div>
  //       </nav>

  //       {/* Products Grid */}
  //       <section className="py-16">
  //         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  //           <h2 className="text-3xl font-bold text-[#02445b]  mb-8">
  //             {t('ui.productsIn', 'Products in')} {series.name}
  //           </h2>

  //           {localizedSeriesProducts.length === 0 ? (
  //             <div className="text-center py-12 bg-gray-50 rounded-lg">
  //               <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
  //               <p className="text-gray-500">{t('ui.noProductsInSeries', 'No products available in this series yet.')}</p>
  //             </div>
  //           ) : (
  //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  //               {localizedSeriesProducts.map((product: any) => (
  //                 <article
  //                   key={product.id}
  //                   className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden"
  //                 >
  //                   <Link
  //                     href={`/products/${product.slug}`} // Canonical
  //                     className="block"
  //                   >
  //                     <div className="aspect-w-16 aspect-h-9 bg-gray-200">
  //                       <img
  //                         src={product.heroImageUrl}
  //                         alt={product.heroImageAlt || product.name}
  //                         className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
  //                       />
  //                     </div>
  //                     <div className="p-6">
  //                       <div className="flex items-center justify-between mb-2">
  //                         {product.gamme && (
  //                           <span className="inline-block px-3 py-1 text-xs font-semibold text-[#02445b] bg-blue-100 rounded-full">
  //                             {getGammeLabel(product.gamme)}
  //                           </span>
  //                         )}
  //                         {product.specialty && (
  //                           <span className="text-xs text-gray-500">
  //                             {getSpecialtyLabel(product.specialty)}
  //                           </span>
  //                         )}
  //                       </div>
  //                       <h3 className="text-xl font-semibold text-[#02445b]  mb-2 group-hover:text-[#02445b] transition-colors">
  //                         {product.name}
  //                       </h3>
  //                       {product.shortDescription && (
  //                         <p className="text-gray-600 text-sm line-clamp-3 mb-4">
  //                           {product.shortDescription}
  //                         </p>
  //                       )}
  //                       <div className="flex items-center text-[#02445b] font-medium group-hover:underline">
  //                         {t('ui.viewDetails', 'View Details')}
  //                         <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
  //                       </div>
  //                     </div>
  //                   </Link>
  //                 </article>
  //               ))}
  //             </div>
  //           )}
  //         </div>
  //       </section>
  //     </div>
  //   );
  // }

  // Try to find as product using service
  const product = await getLocalizedProduct(slug, locale);
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const currentUrl = `${baseUrl}/products/${slug}`;
  if (!product) {
    notFound();
  }

  // Render product page (same design as main product page)
  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <nav className="bg-gray-50 py-4" aria-label="Breadcrumb">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center space-x-2 text-sm flex-wrap">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                {t('nav.home', 'Home')}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <Link href="/brands" className="text-gray-500 hover:text-gray-700">
                {t('nav.brands', 'Brands')}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <Link
                href={`/brands/${brandSlug}`}
                className="text-gray-500 hover:text-gray-700"
              >
                {product.brand.name}
              </Link>
            </li>
            {product.equipmentType && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <li>
                  <Link
                    href={`/brands/${brandSlug}/${equipmentTypeSlug}`}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {product.equipmentType.name}
                  </Link>
                </li>
              </>
            )}
            {product.subcategory && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <li>
                  <Link
                    href={`/brands/${brandSlug}/${equipmentTypeSlug}/${subcategorySlug}`}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {product.subcategory.name}
                  </Link>
                </li>
              </>
            )}
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-[#02445b]  font-medium" aria-current="page">
              {product.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* Product Hero */}
     <ProductHeroSection
        product={product}
        uiTranslations={uiTranslations}
        specialtyTranslations={specialtyTranslations}
        currentUrl={currentUrl}
      />

      {/* Product Sections */}
      {product.sections && product.sections.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {product.sections.map((section, index) => (
              <div
                key={section.id}
                className={`${
                  index !== 0 ? 'mt-16' : ''
                } lg:grid lg:grid-cols-2 lg:gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <h2 className="text-3xl font-bold text-[#02445b]  mb-4">
                    {section.title}
                  </h2>
                  <div
                    className="prose prose-lg text-gray-700"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
                {section.imageUrl && (
                  <div
                    className={`mt-8 lg:mt-0 ${
                      index % 2 === 1 ? 'lg:col-start-1' : ''
                    }`}
                  >
                    <img
                      src={section.imageUrl}
                      alt={section.imageAlt || ''}
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Specifications */}
      {product.specifications && product.specifications.length > 0 && (
        <section id="specifications" className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#02445b]  mb-8">
              {t('ui.specifications', 'Technical Specifications')}
            </h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <dl className="divide-y divide-gray-200">
                {product.specifications.map((spec) => (
                  <div
                    key={spec.id}
                    className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                  >
                    <dt className="text-sm font-medium text-[#02445b] ">
                      {spec.name}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}