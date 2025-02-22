import { CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DataSourceFormLoading() {
  return (
    <div className="flex flex-col w-full h-full p-4 pb-20 gap-4">
      <div className="flex flex-col gap-1">
        <CardTitle>Create Data Source</CardTitle>
        <CardDescription>Add a data source to your organisation</CardDescription>
      </div>

      <div className="grid grid-cols-2 gap-9">
        {/* Name field */}
        <div className="space-y-1">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Database Type field */}
        <div className="flex space-y-1 flex-col">
          <Skeleton className="h-3 w-24" />
          <div className="flex flex-row gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>

        {/* Database config fields (6 fields for postgres/mysql/snowflake) */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>

      {/* Submit button */}
      <div className="flex justify-end mt-10">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
