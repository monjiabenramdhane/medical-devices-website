import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BrandService } from '@/services/brand.service';
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
  const brand = await BrandService.getBySlug(params.brandSlug);
  
  if (!brand) {
    return {};
  }

  return genMeta({
    title: brand.metaTitle || `${brand.name} Medical Devices`,
    description: brand.metaDescription || brand.description || '',
    image: brand.logoUrl,
  });
}

export const dynamic = 'force-dynamic'; // Enable SSR

export default async function BrandPage(props: BrandPageProps) {
  const params = await props.params;
  const brand = await BrandService.getBySlug(params.brandSlug);

  if (!brand) {
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
            <li className="text-gray-900 font-medium" aria-current="page">
              {brand.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* Brand Header */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img
              src={brand.logoUrl}
              alt={brand.logoAlt}
              className="h-24 w-auto mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
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
                className="inline-flex items-center mt-6 px-6 py-3 border border-[#193660] text-base font-medium rounded-md text-[#193660] bg-white hover:bg-blue-50 transition-colors"
              >
                Visit Official Website
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

      {/* Equipment Types Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Equipment Categories
          </h2>

          {!brand.equipmentTypes || brand.equipmentTypes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No equipment categories available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {brand.equipmentTypes.map((equipmentType) => (
                <Link
                  key={equipmentType.id}
                  href={`/brands/${brand.slug}/${equipmentType.slug}`}
                  className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden"
                >
                  <div className="p-6">
                    {equipmentType.iconUrl && (
                      <div className="mb-4">
                        <img
                          src={equipmentType.iconUrl}
                          alt=""
                          className="h-16 w-16 object-contain"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#193660] transition-colors">
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
                        {equipmentType.subcategories.length} subcategories
                      </div>
                    )}
                    <div className="mt-4 flex items-center text-[#193660] font-medium group-hover:underline">
                      Explore
                      <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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