import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DataSourcesLoading() {
  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg">Data Sources</CardTitle>
          <CardDescription>Click on an data source to view all its entities</CardDescription>
        </div>
        <Button variant={"secondary"} disabled={true}>
          Add Data Source
        </Button>
      </div>

      <ul className="grid grid-cols-2 gap-4">
        <Skeleton className="w-full h-16 flex justify-between items-center px-2 gap-2">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-24 bg-foreground/10" />
            <Skeleton className="h-2 w-16 bg-foreground/10" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-16 bg-foreground/10" />
            <Skeleton className="h-10 w-28 bg-foreground/10" />
          </div>
        </Skeleton>
        <Skeleton className="w-full h-16 flex justify-between items-center px-2 gap-2">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-24 bg-foreground/10" />
            <Skeleton className="h-2 w-16 bg-foreground/10" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-16 bg-foreground/10" />
            <Skeleton className="h-10 w-28 bg-foreground/10" />
          </div>
        </Skeleton>
      </ul>
    </div>
  );
}
