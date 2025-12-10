import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { generateMetadata as genMeta } from '@/lib/utils';
import { ChevronRight, Layers } from 'lucide-react';
import type { Metadata } from 'next';

interface EquipmentTypePageProps {
  params: {
    brandSlug: string;
    equipmentTypeSlug: string;
  };
}

export async function generateMetadata({ params }: EquipmentTypePageProps): Promise<Metadata> {
  const equipmentType = await prisma.equipmentType.findFirst({
    where: {
      slug: params.equipmentTypeSlug,
      brand: { slug: params.brandSlug },
    },
    include: { brand: true },
  });
  
  if (!equipmentType) {
    return {};
  }

  return genMeta({
    title: `${equipmentType.name} by ${equipmentType.brand.name}`,
    description: equipmentType.description || `Explore ${equipmentType.name} from ${equipmentType.brand.name}`,
    image: equipmentType.iconUrl || equipmentType.brand.logoUrl,
  });
}

export const dynamic = 'force-dynamic';

export default async function EquipmentTypePage({ params }: EquipmentTypePageProps) {
  const equipmentType = await prisma.equipmentType.findFirst({
    where: {
      slug: params.equipmentTypeSlug,
      brand: { slug: params.brandSlug },
      isActive: true,
    },
    include: {
      brand: true,
      subcategories: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          _count: {
            select: {
              products: true,
              series: true,
            },
          },
        },
      },
    },
  });

  if (!equipmentType) {
    notFound();
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
              <Link href="/brands" className="text-gray-500 hover:text-gray-700">
                Brands
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <Link
                href={`/brands/${equipmentType.brand.slug}`}
                className="text-gray-500 hover:text-gray-700"
              >
                {equipmentType.brand.name}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-gray-900 font-medium" aria-current="page">
              {equipmentType.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* Equipment Type Header */}
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
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {equipmentType.name}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                by{' '}
                <Link
                  href={`/brands/${equipmentType.brand.slug}`}
                  className="text-[#193660] hover:underline font-semibold"
                >
                  {equipmentType.brand.name}
                </Link>
              </p>
              {equipmentType.description && (
                <p className="text-lg text-gray-700 mb-6">
                  {equipmentType.description}
                </p>
              )}
            </div>
            <div className="mt-8 lg:mt-0">
              <img
                src={equipmentType.brand.logoUrl}
                alt={equipmentType.brand.logoAlt}
                className="h-32 w-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Subcategories Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Subcategories & Specialties
          </h2>

          {!equipmentType.subcategories || equipmentType.subcategories.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No subcategories available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {equipmentType.subcategories.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/brands/${params.brandSlug}/${params.equipmentTypeSlug}/${subcategory.slug}`}
                  className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200 hover:border-blue-500"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#193660] transition-colors">
                      {subcategory.name}
                    </h3>
                    {subcategory.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {subcategory.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div>
                        {subcategory._count.products > 0 && (
                          <span className="mr-4">
                            {subcategory._count.products} products
                          </span>
                        )}
                        {subcategory._count.series > 0 && (
                          <span>
                            {subcategory._count.series} series
                          </span>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#193660] group-hover:translate-x-1 transition-transform" />
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