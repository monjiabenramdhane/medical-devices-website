import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { generateMetadata as genMeta } from '@/lib/utils';
import { ChevronRight, FolderTree, Package } from 'lucide-react';
import type { Metadata } from 'next';

interface SubcategoryPageProps {
  params: {
    brandSlug: string;
    equipmentTypeSlug: string;
    subcategorySlug: string;
  };
}

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const subcategory = await prisma.subcategory.findFirst({
    where: {
      slug: params.subcategorySlug,
      equipmentType: {
        slug: params.equipmentTypeSlug,
        brand: { slug: params.brandSlug },
      },
    },
    include: {
      equipmentType: {
        include: { brand: true },
      },
    },
  });
  
  if (!subcategory) {
    return {};
  }

  return genMeta({
    title: `${subcategory.name} - ${subcategory.equipmentType.name} by ${subcategory.equipmentType.brand.name}`,
    description: subcategory.description || `Explore ${subcategory.name} solutions`,
  });
}

export const dynamic = 'force-dynamic';

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const subcategory = await prisma.subcategory.findFirst({
    where: {
      slug: params.subcategorySlug,
      equipmentType: {
        slug: params.equipmentTypeSlug,
        brand: { slug: params.brandSlug },
      },
      isActive: true,
    },
    include: {
      equipmentType: {
        include: { brand: true },
      },
      series: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          _count: {
            select: { products: true },
          },
        },
      },
      products: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          brand: true,
        },
        take: 50,
      },
    },
  });

  if (!subcategory) {
    notFound();
  }

  const hasSeries = subcategory.series && subcategory.series.length > 0;
  const hasProducts = subcategory.products && subcategory.products.length > 0;

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
                href={`/brands/${params.brandSlug}`}
                className="text-gray-500 hover:text-gray-700"
              >
                {subcategory.equipmentType.brand.name}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <Link
                href={`/brands/${params.brandSlug}/${params.equipmentTypeSlug}`}
                className="text-gray-500 hover:text-gray-700"
              >
                {subcategory.equipmentType.name}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-gray-900 font-medium" aria-current="page">
              {subcategory.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* Subcategory Header */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {subcategory.name}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {subcategory.equipmentType.name} •{' '}
            <Link
              href={`/brands/${params.brandSlug}`}
              className="text-[#193660] hover:underline"
            >
              {subcategory.equipmentType.brand.name}
            </Link>
          </p>
          {subcategory.description && (
            <p className="text-lg text-gray-700 max-w-3xl">
              {subcategory.description}
            </p>
          )}
        </div>
      </section>

      {/* Series Section */}
      {hasSeries && (
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Product Series
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subcategory.series.map((series) => (
                <Link
                  key={series.id}
                  href={`/brands/${params.brandSlug}/${params.equipmentTypeSlug}/${params.subcategorySlug}/${series.slug}`}
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#193660] transition-colors">
                      {series.name}
                    </h3>
                    {series.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {series.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {series._count.products} products
                      </span>
                      <ChevronRight className="h-5 w-5 text-[#193660] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      {hasProducts && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {hasSeries ? 'All Products' : 'Products'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subcategory.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/brands/${params.brandSlug}/${params.equipmentTypeSlug}/${params.subcategorySlug}/${product.slug}`}
                  className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img
                      src={product.heroImageUrl}
                      alt={product.heroImageAlt}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    {product.gamme && (
                      <span className="inline-block px-3 py-1 text-xs font-semibold text-[#193660] bg-blue-100 rounded-full mb-2">
                        {product.gamme}
                      </span>
                    )}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#193660] transition-colors">
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
      {!hasSeries && !hasProducts && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No products or series available yet.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}