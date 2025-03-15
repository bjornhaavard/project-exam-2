import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Image Skeleton */}
          <Skeleton className="w-full h-[400px] rounded-lg" />

          {/* Additional Images Skeleton */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-md" />
            ))}
          </div>

          {/* Details Skeleton */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-7 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />

              <div className="space-y-2 mt-4">
                <Skeleton className="h-6 w-1/4" />
                <div className="flex gap-4">
                  {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} className="h-6 w-20" />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          </div>

          {/* Booking Calendar Skeleton */}
          <div className="mt-8">
            <Skeleton className="h-7 w-1/4 mb-4" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-96 rounded-lg" />
              <Skeleton className="h-96 rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
