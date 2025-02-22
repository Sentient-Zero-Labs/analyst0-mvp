import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SignupLoading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-foreground/70 flex flex-col gap-0.5">
            <span>
              Hi, Welcome to <span className="font-semibold">Analyst Zero!</span>
            </span>
            <span className="text-sm text-foreground/60">Your AI data analyst assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form input skeletons */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Button skeletons */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-[240px] mx-auto" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
