import { Skeleton } from "@/components/ui/skeleton";

export default function PlatformGuidelinesLoading() {
  return (
    <div className="container-dashboard mx-auto p-8 flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Project Management Section */}
      <section className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        </div>
      </section>

      {/* Data Agents Section */}
      <section className="space-y-4">
        <Skeleton className="h-8 w-52" />
        <div className="grid gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-96" />
              <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
          ))}
        </div>
      </section>

      {/* Metrics Section Loading */}
      <section className="space-y-4">
        <Skeleton className="h-8 w-52" />
        <div className="grid gap-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </section>

      {/* Query Examples Section Loading */}
      <section className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
            <div className="space-y-4 mt-4">
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Chat Interface Section Loading */}
      <section className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="space-y-4 bg-muted/20 p-6 rounded-lg">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          <Skeleton className="h-4 w-72" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-4 w-32" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 