export default function HomeLoadingSkeleton() {
  return (
    <div>
      {/* Search bar skeleton */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="h-10 w-full rounded-md bg-gray-200 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 w-24 rounded-md bg-gray-200 animate-pulse"></div>
            <div className="h-10 w-20 rounded-md bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Loading message */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="h-5 w-5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="h-5 w-5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          <span className="text-gray-500 ml-2">Loading venues...</span>
        </div>
      </div>

      {/* Venue cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Image skeleton */}
              <div className="h-48 w-full bg-gray-200 animate-pulse"></div>

              {/* Content skeleton */}
              <div className="p-4">
                <div className="h-6 w-3/4 mb-2 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-4 w-1/2 mb-4 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-24 w-full mb-4 bg-gray-200 animate-pulse rounded"></div>

                <div className="flex justify-between items-center mb-4">
                  <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
                </div>

                <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
