'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Brand } from '@/types';

interface BrandCarouselProps {
  brands: Brand[];    
  title?: string;
  description?: string;
  viewAllText?: string;
}

export function BrandCarousel({ brands, title, description, viewAllText }: BrandCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!brands || brands.length === 0) {
    return null;
  }

  const itemsPerPage = 4;
  const totalPages = Math.ceil(brands.length / itemsPerPage);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const visibleBrands = brands.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  return (
    <section className="py-16 bg-gray-50" aria-labelledby="brands-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            id="brands-heading"
            className="text-3xl font-bold text-[#02445b] sm:text-4xl"
          >
            {title}
          </h2>
          {description && (
            <p className="mt-4 text-lg text-gray-600">
              {description}
            </p>
          )}
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {visibleBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="flex flex-col items-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow h-full"
              >
                <div className="relative h-20 w-full mb-4">
                  <Image
                    src={brand.logoUrl || '/images/placeholder-brand.jpg'}
                    alt={brand.logoAlt || brand.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <span className="text-sm font-medium text-[#02445b] text-center">
                  {brand.name}
                </span>
                {brand.equipmentTypes && brand.equipmentTypes.length > 0 && (
                  <span className="text-xs text-gray-500 mt-1 text-center">
                    {brand.equipmentTypes.length} equipment types
                  </span>
                )}
                {brand.description && (
                  <p className="text-gray-600 text-sm text-center line-clamp-2 mt-2">
                    {brand.description}
                  </p>
                )}
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors z-10"
                aria-label="Previous brands"
              >
                <ChevronLeft className="h-6 w-6 text-[#02445b] " />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors z-10"
                aria-label="Next brands"
              >
                <ChevronRight className="h-6 w-6 text-[#02445b] " />
              </button>
            </>
          )}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/brands"
            className="inline-flex items-center px-6 py-3 border border-[#193660] text-base font-medium rounded-md text-[#02445b] bg-white hover:bg-blue-50 transition-colors"
          >
            {viewAllText}
          </Link>
        </div>
      </div>
    </section>
  );
}
