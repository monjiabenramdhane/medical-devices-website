export function HeroSkeleton() {
  return (
    <div className="relative bg-gray-200 animate-pulse h-[500px] lg:h-[600px] w-full" />
  );
}

export function ProductsSkeleton() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="h-8 w-64 bg-gray-200 animate-pulse mx-auto mb-4" />
          <div className="h-4 w-96 bg-gray-200 animate-pulse mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 h-[500px] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function BrandsSkeleton() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="h-8 w-48 bg-gray-200 animate-pulse mx-auto mb-4" />
          <div className="h-4 w-80 bg-gray-200 animate-pulse mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white h-40 rounded-lg shadow animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FacesSkeleton() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <div className="h-10 w-3/4 bg-gray-200 animate-pulse mb-6" />
            <div className="space-y-4 mb-8">
              <div className="h-4 w-full bg-gray-100 animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-100 animate-pulse" />
              <div className="h-4 w-4/6 bg-gray-100 animate-pulse" />
            </div>
            <div className="h-12 w-40 bg-gray-200 animate-pulse rounded-md" />
          </div>
          <div className="mt-10 lg:mt-0">
            <div className="aspect-video bg-gray-100 rounded-lg animate-pulse shadow-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
