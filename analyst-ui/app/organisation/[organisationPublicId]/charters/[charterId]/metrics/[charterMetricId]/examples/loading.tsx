import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CharterMetricsExamplesLoading() {
  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="w-48 h-3" />

          <CardTitle>Data Agent Metrics Examples</CardTitle>
          <CardDescription>
            <span>
              Data agent metric examples are used to describe how a data agent metric is calculated. You can add multiple
              examples for a data agent metric.
            </span>
          </CardDescription>
        </div>
        <Button disabled={true}>Add Metric</Button>
      </div>

      <div className="flex flex-col gap-4 rounded-md overflow-hidden">
        <Skeleton className="w-full h-32 border border-foreground/10 flex justify-between items-center p-3 gap-3">
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="w-32 h-3 bg-foreground/5" />
            <Skeleton className="w-96 h-4 bg-foreground/5" />
            <Skeleton className="w-full h-2 bg-foreground/5" />
            <Skeleton className="w-full h-2 bg-foreground/5" />
          </div>
          <Skeleton className="w-24 h-10 bg-foreground/5" />
        </Skeleton>
        <Skeleton className="w-full h-32 border border-foreground/10 flex justify-between items-center p-3 gap-3">
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="w-32 h-3 bg-foreground/5" />
            <Skeleton className="w-96 h-4 bg-foreground/5" />
            <Skeleton className="w-full h-2 bg-foreground/5" />
            <Skeleton className="w-full h-2 bg-foreground/5" />
          </div>
          <Skeleton className="w-24 h-10 bg-foreground/5" />
        </Skeleton>
      </div>
    </div>
  );
}
