export function ProductHeader({ translations }: { translations: any }) {
  const title = translations?.['products.allProducts'] || 'All Products';
  const subtitle = translations?.['products.subtitle'] || 'Explore our complete range of medical devices and equipment';

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold text-[#02445b] mb-4">{title}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
      </div>
    </section>
  );
}