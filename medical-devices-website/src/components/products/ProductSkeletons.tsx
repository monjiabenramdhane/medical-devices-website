export function ProductsSkeleton({ totalCount = 6 }: { totalCount?: number }) {
  return (
    <div className="bg-white">
      {/* Results count placeholder */}
      <div className="max-w-7xl flex items-center justify-between mb-6">
        <div className="h-4 w-60 bg-gray-200 animate-pulse" />
      </div>

      {/* Products grid */}
      <div className="max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(totalCount)].map((_, i) => (
            <div key={i} className="group relative bg-gray-100 rounded-lg overflow-hidden animate-pulse h-[500px]">
              {/* Image placeholder */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-200" />
              {/* Content placeholders */}
              <div className="p-6">
                <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-full mt-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
