import VenueList from "./components/VenueList"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Holidaze Venues</h1>
      <VenueList />
    </main>
  )
}

