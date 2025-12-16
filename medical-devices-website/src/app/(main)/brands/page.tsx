import Link from 'next/link';
import { BrandService } from '@/services/brand.service';
import { generateMetadata as genMeta } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = genMeta({
  title: 'Our Brands - Medical Devices',
  description: 'Explore our portfolio of leading medical device brands',
});

export const dynamic = 'force-dynamic';

export default async function BrandsPage() {
  const brands = await BrandService.getAll(true);

  return (
    <div className="bg-white">
      <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#02445b]  mb-4">
              Our Brands
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We partner with the world's leading medical device manufacturers to bring you the best healthcare solutions.
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
                        {brand.equipmentTypes.length} equipment {brand.equipmentTypes.length === 1 ? 'type' : 'types'}
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