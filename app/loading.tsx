// Simple loading indicator for the root route
export default function RootLoading() {
  return (
    <div className="container mx-auto p-8 flex justify-center items-center min-h-[50vh]">
      <div className="flex items-center space-x-2">
        <div className="h-5 w-5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
        <div className="h-5 w-5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
        <div className="h-5 w-5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        <span className="text-gray-500 ml-2">Loading...</span>
      </div>
    </div>
  );
}
