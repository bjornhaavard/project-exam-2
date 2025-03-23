import { use } from "react";
import EditVenueContent from "./edit-venue-content";

interface EditVenuePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditVenuePage({ params }: EditVenuePageProps) {
  // Unwrap the params Promise using React.use() in a non-async component
  const resolvedParams = use(params);

  // Pass the unwrapped id to the content component
  return <EditVenueContent id={resolvedParams.id} />;
}
