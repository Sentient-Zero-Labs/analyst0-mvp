import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CharterMetricsLoading() {
  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="w-48 h-3" />

          <CardTitle>Data Agent Metrics</CardTitle>
          <CardDescription>
            <span>Data Agent metrics are used to describe the metrics of a data agent.</span>
          </CardDescription>
        </div>
        <Button disabled={true}>Add Metric</Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Skeleton className="w-full h-24 border-b border-foreground/10 rounded-none flex justify-between items-center">
          <div className="flex flex-col gap-2 w-full p-3">
            <Skeleton className="w-52 h-4 bg-foreground/5" />
            <Skeleton className="w-full h-3 bg-foreground/5" />
            <Skeleton className="w-full h-3 bg-foreground/5" />
          </div>
          <div className="flex gap-2 px-3">
            <Skeleton className="w-24 h-10 bg-foreground/5" />
            <Skeleton className="w-32 h-10 bg-foreground/5" />
          </div>
        </Skeleton>
        <Skeleton className="w-full h-24 border-b border-foreground/10 rounded-none flex justify-between items-center">
          <div className="flex flex-col gap-2 w-full p-3">
            <Skeleton className="w-52 h-4 bg-foreground/5" />
            <Skeleton className="w-full h-3 bg-foreground/5" />
            <Skeleton className="w-full h-3 bg-foreground/5" />
          </div>
          <div className="flex gap-2 px-3">
            <Skeleton className="w-24 h-10 bg-foreground/5" />
            <Skeleton className="w-32 h-10 bg-foreground/5" />
          </div>
        </Skeleton>
        <Skeleton className="w-full h-24 border-b border-foreground/10 rounded-none flex justify-between items-center">
          <div className="flex flex-col gap-2 w-full p-3">
            <Skeleton className="w-52 h-4 bg-foreground/5" />
            <Skeleton className="w-full h-3 bg-foreground/5" />
            <Skeleton className="w-full h-3 bg-foreground/5" />
          </div>
          <div className="flex gap-2 px-3">
            <Skeleton className="w-24 h-10 bg-foreground/5" />
            <Skeleton className="w-32 h-10 bg-foreground/5" />
          </div>
        </Skeleton>
      </div>
    </div>
  );
}
