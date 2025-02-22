import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function CharterMetricExampleFormLoading({ isCreateMode = true }: { isCreateMode?: boolean }) {
  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="w-1/2 h-4" />
        <CardTitle>Create Metric Example</CardTitle>
        <p className="text-sm text-muted-foreground">
          Give an example of how this metric is calculated. This will help the AI understand how to calculate the
          metric.
        </p>
      </div>

      <div>
        <Label className="text-sm text-muted-foreground font-semibold">Query</Label>
        <Skeleton className="w-full h-48" />
      </div>
      <div className="flex space-y-1 flex-col text-muted-foreground">
        <Label className="text-sm text-muted-foreground font-semibold">Explanation</Label>
        <span className="text-xs italic">
          Explain what is calculated by the query and how it is calculated. Include any assumptions or considerations.
          Which data entities are used and how they are used.
        </span>
        <Skeleton className="w-full h-48" />
      </div>

      <div className="flex justify-end mt-9">
        <Button disabled={true}>{isCreateMode ? "Create Example" : "Update Example"}</Button>
      </div>
    </div>
  );
}
