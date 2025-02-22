import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChartersLoading() {
  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg">Charters</CardTitle>
          <CardDescription>
            <span>Charter is used to describe different data domains with their data entities and metrics.</span>
            <br />
            <span>You can chat with your data or use SQL playground at charter level.</span>
          </CardDescription>
        </div>
        <Button disabled={true} variant={"secondary"}>
          Create Charter
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  );
}
