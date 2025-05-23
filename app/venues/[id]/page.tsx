import { use } from "react";
import VenuePageContent from "./venue-page-content";

interface VenuePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VenuePage({ params }: VenuePageProps) {
  // Unwrap the params Promise using React.use() in a non-async component
  const resolvedParams = use(params);

  // Pass the unwrapped id to the content component
  return <VenuePageContent id={resolvedParams.id} />;
}
