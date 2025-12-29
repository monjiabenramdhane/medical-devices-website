import { getLocale } from '@/lib/i18n/locale-resolver';
import { getTranslationsByCategory } from '@/lib/i18n/translation-service';

export async function ProductHeader() {
  const locale = await getLocale();
  const productsTranslations = await getTranslationsByCategory(locale, 'products');

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold text-[#02445b] mb-4">
          {productsTranslations['products.allProducts'] || 'All Products'}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {productsTranslations['products.subtitle'] || 'Explore our complete range of medical devices and equipment'}
        </p>
      </div>
    </section>
  );
}