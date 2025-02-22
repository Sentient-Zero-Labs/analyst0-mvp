import { Button } from "@/components/ui/button";

import { CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@radix-ui/react-dropdown-menu";
import { VscRobot } from "react-icons/vsc";

export default function DataEntityLoading() {
  return (
    <div className="flex flex-col px-5 pr-8">
      <div className="flex items-center justify-between gap-2 sticky top-0 bg-background py-2 z-10">
        <CardTitle>Data Entity</CardTitle>
        <div className="flex flex-row gap-2">
          <Button variant="outline" disabled={true}>
            <span>Generate AI Metadata</span>
            <VscRobot className="ml-1 size-4" />
          </Button>
          <Button disabled={true}>Save Changes</Button>
        </div>
      </div>

      <div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <Label className="text-sm font-semibold text-muted-foreground">Name:</Label>
              <Skeleton className="w-32 h-6" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Description:</Label>
              <Skeleton className="w-full h-32" />
            </div>
          </div>

          <hr className="mt-10 border-foreground/10" />

          <div>
            <Label className="text-base font-semibold opacity-80">Columns</Label>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="grid grid-cols-12 space-x-2 mb-2 items-center mt-2 text-sm">
                <span className="col-span-2 font-bold">
                  <Skeleton className="w-full h-6" />
                </span>
                <span className="col-span-2">
                  <Skeleton className="w-full h-6" />
                </span>
                <Skeleton className="col-span-8 w-full h-10" />
              </div>
            ))}
          </div>

          <hr className="mt-10 border" />

          <div>
            <Label className="text-base font-semibold opacity-80">Foreign Keys</Label>
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="grid grid-cols-12 space-x-2 mb-2 items-center mt-2 text-sm">
                <span className="col-span-2 font-bold">
                  <Skeleton className="w-full h-6" />
                </span>
                <span className="col-span-2">
                  <Skeleton className="w-full h-6" />
                </span>
                <Skeleton className="col-span-8 w-full h-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
