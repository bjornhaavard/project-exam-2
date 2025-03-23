import { Suspense } from "react";
import HomeContent from "./home-content";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Holidaze Venues</h1>
      <Suspense fallback={<div>Loading search and venues...</div>}>
        <HomeContent />
      </Suspense>
    </main>
  );
}
