import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { generateMetadata as genMeta } from '@/lib/utils';
import { ChevronRight, Package } from 'lucide-react';
import type { Metadata } from 'next';

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

  // Try to find as series first
  const series = await prisma.series.findFirst({
    where: {
      slug: slug,
      subcategory: {
        slug: subcategorySlug,
        equipmentType: {
          slug: equipmentTypeSlug,
          brand: { slug: brandSlug },
        },
      },
    },
    include: {
      subcategory: {
        include: {
          equipmentType: {
            include: { brand: true },
          },
        },
      },
    },
  });

  if (series) {
    return genMeta({
      title: `${series.name} - ${series.subcategory?.equipmentType.brand.name}`,
      description: series.description || `Explore the ${series.name} product series`,
      image: series.imageUrl || undefined,
    });
  }

  // Try to find as product
  const product = await prisma.product.findFirst({
    where: {
      slug: slug,
      subcategory: {
        slug: subcategorySlug,
        equipmentType: {
          slug: equipmentTypeSlug,
          brand: { slug: brandSlug },
        },
      },
    },
    include: {
      brand: true,
      equipmentType: true,
      subcategory: true,
      series: true,
    },
  });

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

export const dynamic = 'force-dynamic';

export default async function DynamicSlugPage({ params }: DynamicSlugPageProps) {
  const { brandSlug, equipmentSlug: equipmentTypeSlug, subcategorySlug, slug } = await params;

  // Try to find as series first
  const series = await prisma.series.findFirst({
    where: {
      slug: slug,
      subcategory: {
        slug: subcategorySlug,
        equipmentType: {
          slug: equipmentTypeSlug,
          brand: { slug: brandSlug },
        },
      },
      isActive: true,
    },
    include: {
      subcategory: {
        include: {
          equipmentType: {
            include: { brand: true },
          },
        },
      },
      products: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          brand: true,
          gallery: {
            orderBy: { order: 'asc' },
            take: 1,
          },
        },
      },
    },
  });

  // If found as series, render series page
  if (series) {
    const brand = series.subcategory!.equipmentType.brand;
    const equipmentType = series.subcategory!.equipmentType;
    const subcategory = series.subcategory!;

    return (
      <div className="bg-white">
        {/* Breadcrumbs */}
        <nav className="bg-gray-50 py-4" aria-label="Breadcrumb">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ol className="flex items-center space-x-2 text-sm flex-wrap">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li>
                <Link href="/brands" className="text-gray-500 hover:text-gray-700">
                  Brands
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li>
                <Link
                  href={`/brands/${brandSlug}`}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {brand.name}
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li>
                <Link
                  href={`/brands/${brandSlug}/${equipmentTypeSlug}`}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {equipmentType.name}
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li>
                <Link
                  href={`/brands/${brandSlug}/${equipmentTypeSlug}/${subcategorySlug}`}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {subcategory.name}
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li className="text-gray-900 font-medium" aria-current="page">
                {series.name}
              </li>
            </ol>
          </div>
        </nav>

        {/* Series Header */}
        <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {series.name}
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  {subcategory.name} •{' '}
                  <Link
                    href={`/brands/${brandSlug}`}
                    className="text-[#193660] hover:underline"
                  >
                    {brand.name}
                  </Link>
                </p>
                {series.description && (
                  <div className="prose prose-lg text-gray-700 mb-8">
                    <p>{series.description}</p>
                  </div>
                )}
                {series.products && series.products.length > 0 && (
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                    <Package className="h-5 w-5 mr-2" />
                    {series.products.length} {series.products.length === 1 ? 'product' : 'products'} in this series
                  </div>
                )}
              </div>
              {series.imageUrl && (
                <div className="mt-8 lg:mt-0">
                  <img
                    src={series.imageUrl}
                    alt={series.imageAlt || series.name}
                    className="rounded-lg shadow-xl"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Products in {series.name}
            </h2>

            {!series.products || series.products.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No products available in this series yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {series.products.map((product) => (
                  <article
                    key={product.id}
                    className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden"
                  >
                    <Link
                      href={`/brands/${brandSlug}/${equipmentTypeSlug}/${subcategorySlug}/${product.slug}`}
                      className="block"
                    >
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                        <img
                          src={product.heroImageUrl}
                          alt={product.heroImageAlt}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          {product.gamme && (
                            <span className="inline-block px-3 py-1 text-xs font-semibold text-[#193660] bg-blue-100 rounded-full">
                              {product.gamme}
                            </span>
                          )}
                          {product.specialty && (
                            <span className="text-xs text-gray-500">
                              {product.specialty}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#193660] transition-colors">
                          {product.name}
                        </h3>
                        {product.shortDescription && (
                          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                            {product.shortDescription}
                          </p>
                        )}
                        <div className="flex items-center text-[#193660] font-medium group-hover:underline">
                          View Details
                          <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // Try to find as product
  const product = await prisma.product.findFirst({
    where: {
      slug: slug,
      subcategory: {
        slug: subcategorySlug,
        equipmentType: {
          slug: equipmentTypeSlug,
          brand: { slug: brandSlug },
        },
      },
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

  // Render product page
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
              <Link href="/brands" className="text-gray-500 hover:text-gray-700">
                Brands
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
              {product.gamme && (
                <span className="inline-block px-3 py-1 text-sm font-semibold text-[#193660] bg-blue-100 rounded-full mb-4">
                  {product.gamme} Range
                </span>
              )}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-lg text-gray-600 mb-6">
                  by{' '}
                  <Link
                    href={`/brands/${brandSlug}`}
                    className="text-[#193660] hover:underline"
                  >
                    {product.brand.name}
                  </Link>
                </p>
              )}
              {product.shortDescription && (
                <p className="text-lg text-gray-700 mb-8">
                  {product.shortDescription}
                </p>
              )}
              <div className="flex flex-wrap gap-4 mb-8">
                <a
                  href="#contact"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#193660] hover:bg-blue-700 transition-colors"
                >
                  Request Quote
                </a>
                <a
                  href="#specifications"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  View Specifications
                </a>
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
    </div>
  );
}