import { Skeleton } from "@/components/ui/skeleton";

export const ProductDetailSkeleton = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <Skeleton className="w-full aspect-square rounded-lg" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-1/4" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
};