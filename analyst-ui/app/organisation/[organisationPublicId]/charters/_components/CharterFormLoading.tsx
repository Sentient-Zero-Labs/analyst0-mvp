import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CharterFormLoading({ isCreateMode }: { isCreateMode: boolean }) {
  return (
    <div className="container-dashboard mx-auto p-4  flex flex-col">
      <div className="flex justify-between items-center sticky top-0 bg-background z-10 py-2">
        <CardTitle>{isCreateMode ? "Create Charter" : "Edit Charter"}</CardTitle>
        <div>
          <Button type="button" disabled={true}>
            {isCreateMode ? "Create Charter" : "Update Charter"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-2 gap-8 items-end">
          <div className="space-y-2">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-full h-10" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-full h-10" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-full h-10" />
          </div>
        </div>
        {/* Data Entities */}
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">
            Data Entities{" "}
            <span className="text-sm font-medium text-foreground/60 italic">
              (Select all data entities that you want to include in this charter)*
            </span>
          </div>
          <Skeleton className="w-72 mb-1" />
        </div>
        <div className="border rounded-md overflow-hidden">
          <Skeleton className="w-full h-16 border-b rounded-none" />
          <Skeleton className="w-full h-16 border-b rounded-none" />
          <Skeleton className="w-full h-16 border-b rounded-none" />
        </div>
      </div>
    </div>
  );
}
