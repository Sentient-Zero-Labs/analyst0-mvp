import { CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LuPlus } from "react-icons/lu";

export default function ProjectsLoading() {
  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <CardTitle>Projects</CardTitle>
          <CardDescription>Manage your projects and their data agents</CardDescription>
        </div>
        <Button disabled className="flex items-center gap-2">
          <LuPlus className="size-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 