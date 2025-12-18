import Link from 'next/link';
import type { Product } from '@/types';

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  description?: string;
  viewAllText?: string;
  learnMoreText?: string;
  uiTranslations?: Record<string, string>; // added to support translations
  specialtyTranslations?: Record<string, string>; // added to support translations
}

export function FeaturedProducts({ 
  products,
  title = 'Featured Products',
  description = 'Discover our most innovative medical devices',
  viewAllText = 'View All Products',
  learnMoreText = 'Learn More',
  uiTranslations = {},
  specialtyTranslations = {}
}: FeaturedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  const getGammeLabel = (gamme: string | undefined) => {
    if (!gamme) return '';
    return uiTranslations[`ui.gamme.${gamme.toLowerCase()}`] || gamme;
  };

  const getSpecialtyLabel = (specialty: string | undefined) => {
    if (!specialty) return '';
    return specialtyTranslations[`specialty.${specialty.toLowerCase()}`] || specialty;
  };

  return (
    <section className="py-16 bg-white" aria-labelledby="featured-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            id="featured-heading"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <article
              key={product.id}
              className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
            >
              <Link
                href={`/brands/${product.brand?.slug}/${product.equipmentType?.slug || (product.subcategory as any)?.equipmentType?.slug}/${product.subcategory?.slug}/${product.slug}`}
                className="block"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={product.heroImageUrl || '/images/placeholder-product.jpg'}
                    alt={product.heroImageAlt || product.name}
                    className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  {product.gamme && (
                    <span className="inline-block px-3 py-1 text-xs mr-2 font-semibold text-[#02445b] bg-blue-100 rounded-full mb-2">
                      {getGammeLabel(product.gamme)}
                    </span>
                  )}
                  {product.specialty && (
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-[#02445b] bg-[#bddbd1]/80 rounded-full mb-2">
                      {getSpecialtyLabel(product.specialty)}
                    </span>
                  )}
                  <h3 className="text-xl font-semibold text-[#02445b] mb-2 group-hover:text-[#02445b] transition-colors">
                    {product.name}
                  </h3>
                  {product.shortDescription && (
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {product.shortDescription}
                    </p>
                  )}
                  <div className="mt-4 flex items-center text-[#02445b] font-medium group-hover:underline">
                    {learnMoreText}
                    <svg
                      className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#02445b] hover:bg-[#02445b]/95 transition-colors"
          >
            {viewAllText}
          </Link>
        </div>
      </div>
    </section>
  );
}
