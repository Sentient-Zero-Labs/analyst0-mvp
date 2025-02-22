import { CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreateOrganisationLoading() {
  return (
    <div className="flex flex-col items-center w-full justify-center h-[80vh]">
      <div className="container-dashboard mx-auto p-4 flex flex-col gap-4 w-96 border rounded-md bg-card">
        <div className="flex flex-col gap-2">
          <CardTitle>Create Project</CardTitle>
          <CardDescription>Add the name of your project</CardDescription>
        </div>
        <div className="flex flex-col gap-6 mt-1">
          <div className="space-y-2">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
