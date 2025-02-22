import { CharterMetric } from "@/services/charterMetric/charterMetric.schema";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CharterMetricsList({
  charterMetrics,
  organisationPublicId,
  charterId,
}: {
  charterMetrics?: CharterMetric[];
  organisationPublicId: string;
  charterId: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      {charterMetrics && charterMetrics.length > 0 ? (
        charterMetrics.map((charterMetric) => (
          <div
            key={charterMetric.id}
            className="border flex justify-between gap-0.5 items-center rounded-sm overflow-hidden"
          >
            <div className="flex flex-col gap-0.5">
              <div className="flex flex-row gap-2 items-center justify-between bg-muted/70 px-3 py-1 border-b">
                <span className="font-medium">
                  {charterMetric.name} ({charterMetric.abbreviation})
                </span>
                <div className="flex flex-row gap-2">
                  <Link
                    href={`/organisation/${organisationPublicId}/charters/${charterId}/metrics/${charterMetric.id}/edit`}
                    className="rounded flex flex-col justify-between gap-0.5"
                  >
                    <Button size={"sm"} variant={"outline"}>
                      Edit Metric
                    </Button>
                  </Link>
                  {charterMetric.example_count == 0 ? (
                    <Link
                      href={`/organisation/${organisationPublicId}/charters/${charterId}/metrics/${charterMetric.id}/examples/create`}
                      className="rounded flex flex-col justify-between gap-0.5"
                    >
                      <Button size={"sm"}>Add Example</Button>
                    </Link>
                  ) : (
                    <Link
                      href={`/organisation/${organisationPublicId}/charters/${charterId}/metrics/${charterMetric.id}/examples`}
                      className="rounded flex flex-col justify-between gap-0.5"
                    >
                      <Button size={"sm"} variant={"outline"}>
                        View Examples ({charterMetric.example_count})
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              <span className="text-sm text-foreground/70 line-clamp-3 px-3 my-2 break-all">
                {charterMetric.description}
              </span>
              {charterMetric.example_count == 0 && (
                <span className="text-xs text-destructive font-semibold px-2 py-1">
                  You have no examples for this metric. Please provide at least 2-3 examples for AI to understand how to
                  calculate the metric.
                </span>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="flex justify-center items-center h-24 font-semibold">
          <span className="text-sm text-destructive">
            No metrics added yet. Please add metrics to help the AI understand your charter better.
          </span>
        </div>
      )}
    </div>
  );
}
