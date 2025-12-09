import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { generateMetadata as genMeta } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

interface ProductSlugPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductSlugPageProps): Promise<Metadata> {
  const product = await prisma.product.findFirst({
    where: { slug: params.slug, isActive: true },
    include: { brand: true },
  });
  
  if (!product) {
    return {};
  }

  return genMeta({
    title: product.metaTitle || `${product.name} | ${product.brand.name}`,
    description: product.metaDescription || product.shortDescription || '',
    keywords: product.metaKeywords || '',
    image: product.heroImageUrl,
  });
}

export const dynamic = 'force-dynamic';

export default async function ProductSlugPage({ params }: ProductSlugPageProps) {
  const product = await prisma.product.findFirst({
    where: {
      slug: params.slug,
      isActive: true,
    },
    include: {
      brand: true,
      equipmentType: true,
      subcategory: true,
      series: true,
      gallery: {
        orderBy: { order: 'asc' },
      },
      sections: {
        orderBy: { order: 'asc' },
      },
      specifications: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Redirect to proper hierarchy URL if all parts exist
  if (product.brand && product.equipmentType && product.subcategory) {
    const properUrl = `/brands/${product.brand.slug}/${product.equipmentType.slug}/${product.subcategory.slug}/${product.slug}`;
    // In a real implementation, you'd use Next.js redirect here
    // For now, we'll just display the product
  }

  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <nav className="bg-gray-50 py-4" aria-label="Breadcrumb">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <Link href="/products" className="text-gray-500 hover:text-gray-700">
                Products
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
            <li className="text-gray-900 font-medium" aria-current="page">
              {product.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* Product Hero */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-start">
            {/* Image Gallery */}
            <div>
              <div className="aspect-w-4 aspect-h-3 bg-gray-200 rounded-lg overflow-hidden mb-4">
                <img
                  src={product.heroImageUrl}
                  alt={product.heroImageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.gallery && product.gallery.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.gallery.map((image) => (
                    <button
                      key={image.id}
                      className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden hover:opacity-75 transition-opacity"
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                {product.gamme && (
                  <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                    {product.gamme} Range
                  </span>
                )}
                {product.specialty && (
                  <span className="inline-block px-3 py-1 text-sm font-semibold text-green-600 bg-green-100 rounded-full">
                    {product.specialty}
                  </span>
                )}
                {product.isFeatured && (
                  <span className="inline-block px-3 py-1 text-sm font-semibold text-yellow-600 bg-yellow-100 rounded-full">
                    Featured
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Brand & Series */}
              <div className="mb-6">
                {product.brand && (
                  <p className="text-lg text-gray-600 mb-2">
                    by{' '}
                    <Link
                      href={`/brands/${product.brand.slug}`}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      {product.brand.name}
                    </Link>
                  </p>
                )}
                {product.series && (
                  <p className="text-sm text-gray-500">
                    Part of {product.series.name} Series
                  </p>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-lg text-gray-700 mb-6">
                  {product.shortDescription}
                </p>
              )}

              {/* Full Description */}
              {product.fullDescription && (
                <div className="prose prose-lg text-gray-700 mb-8">
                  <p>{product.fullDescription}</p>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mb-8">
                <a
                  href="#contact"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Request Quote
                </a>
                {product.specifications && product.specifications.length > 0 && (
                  <a
                    href="#specifications"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    View Specifications
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

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
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Technical Specifications
            </h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <dl className="divide-y divide-gray-200">
                {product.specifications.map((spec) => (
                  <div
                    key={spec.id}
                    className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                  >
                    <dt className="text-sm font-medium text-gray-900">
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Interested in this product?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Contact us for more information, pricing, or to schedule a demonstration
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}