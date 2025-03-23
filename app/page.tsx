import { Suspense } from "react";
import HomeContent from "./home-content";
import HomeLoadingSkeleton from "./home-loading-skeleton";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Holidaze Venues</h1>

      {/* Wrap the client component in Suspense with a clear fallback */}
      <Suspense fallback={<HomeLoadingSkeleton />}>
        <HomeContent />
      </Suspense>
    </main>
  );
}
