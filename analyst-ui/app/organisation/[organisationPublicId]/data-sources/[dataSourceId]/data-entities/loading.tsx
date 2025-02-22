import { CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function DataEntitiesLoading() {
  return (
    <div className="container-dashboard mx-auto p-4">
      <div className="flex flex-col gap-4 pb-20">
        <div className="flex flex-row justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">Data Entities </CardTitle>
            <CardDescription>Click on an data entity to view all its data.</CardDescription>
          </div>

          <div className="flex gap-2">
            <Input disabled={true} className="w-56" placeholder="Search data entity (comma separated)" />
          </div>
        </div>
        <ul className="flex flex-col rounded-md border overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="border-b last:border-b-0 flex justify-between gap-0.5 items-center col-span-1">
              <Skeleton className="rounded-none w-full h-16 bg-muted/50" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
