import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocalizedProduct } from '@/lib/i18n/localized-product-service';
import { getLocale } from '@/lib/i18n/locale-resolver';
import { getTranslation, getTranslationsByCategory } from '@/lib/i18n/translation-service';
import { headers } from 'next/headers';
import ProductHeroSection from '@/components/products/ProductSection';

interface ProductSlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductSlugPageProps): Promise<Metadata> {
  const locale = await getLocale();
  const { slug } = await params;
  const product = await getLocalizedProduct(slug, locale);

  if (!product) {
    const notFoundTitle = await getTranslation(locale, 'meta.notFound', 'Page Not Found');
    return {
      title: notFoundTitle,
    };
  }

  // Helper to get base URL
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const currentUrl = `${baseUrl}/products/${slug}`;

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription,
    alternates: {
      canonical: currentUrl,
      languages: {
        'en': currentUrl,
        'fr': currentUrl,
        'x-default': currentUrl,
      },
    },
    openGraph: {
      title: product.metaTitle || product.name,
      description: product.metaDescription || product.shortDescription || '',
      locale: locale,
    },
  };
}

export const revalidate = 30;
export const experimental_ppr = true;

export default async function ProductSlugPage({ params }: ProductSlugPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  
  const [product, uiTranslations, navigationTranslations, specialtyTranslations ] = await Promise.all([
    getLocalizedProduct(slug, locale),
    getTranslationsByCategory(locale, 'ui'),
    getTranslationsByCategory(locale, 'navigation'),
    getTranslationsByCategory(locale, 'specialty'),
  ]);
  if (!product) {
    notFound();
  }

  const t = (key: string, fallback: string) => uiTranslations[key] || fallback;
  const tNav = (key: string, fallback: string) => navigationTranslations[key] || fallback;
   // Compute current URL for SEO and hydration stability
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const currentUrl = `${protocol}://${host}/products/${slug}`;

  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <nav className="bg-gray-50 py-4" aria-label="Breadcrumb">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                {tNav('nav.home', 'Home')}
              </Link>

              
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <Link href="/products" className="text-gray-500 hover:text-gray-700">
                {tNav('nav.products', 'Products')}
              </Link>
            </li>
            {product.brand && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <li>
                  <Link
                    href={`/brands/${product.brand.slug}`}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {product.brand.name}
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
               {t('ui.techSpecs', 'Technical Specifications')}
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

      {/* Related Products or Contact */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#02445b]  mb-4">
             {t('ui.interestedTitle', 'Interested in this product?')}
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
             {t('ui.interestedDesc', 'Contact us for more information, pricing, or to schedule a demonstration')}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#02445b] hover:bg-[#02445b]/95 transition-colors"
            >
              {t('ui.contactUs', 'Contact Us')}
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              {t('ui.viewProducts', 'View All Products')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}