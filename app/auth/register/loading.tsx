export default function RegisterLoading() {
  return (
    <div className="container mx-auto p-8 flex justify-center items-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading registration form...</p>
      </div>
    </div>
  );
}
