import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function CharterMetricLoading({ isCreateMode = true }: { isCreateMode?: boolean }) {
  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <CardTitle>{isCreateMode ? "Create" : "Edit"} Data Agent Metric</CardTitle>
      </div>
      <div className="flex flex-col gap-6">
        <div>
          <Label className="text-sm text-muted-foreground font-semibold">Name</Label>
          <Skeleton className="w-full h-10" />
        </div>

        <div>
          <Label className="text-sm text-muted-foreground font-semibold">Abbreviation</Label>
          <Skeleton className="w-full h-10" />
        </div>

        <div>
          <Label className="text-sm text-muted-foreground font-semibold">Description</Label>
          <Skeleton className="w-full h-32" />
        </div>

        <div className="flex justify-end">
          <Button disabled={true}>{isCreateMode ? "Create Metric" : "Update Metric"}</Button>
        </div>
      </div>
    </div>
  );
}
