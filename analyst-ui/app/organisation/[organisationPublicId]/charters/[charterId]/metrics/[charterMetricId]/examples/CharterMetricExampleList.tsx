import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CharterMetricExample } from "@/services/charterMetricExample/charterMetricExample.schema";
import Prism from "prismjs";
import "prismjs/components/prism-sql";
import { LuPencil } from "react-icons/lu";

export function CharterMetricExamplesList({
  charterMetricExamples,
  charterMetricId,
  charterId,
  organisationPublicId,
}: {
  charterMetricExamples?: CharterMetricExample[];
  charterMetricId: number;
  charterId: number;
  organisationPublicId: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      {charterMetricExamples && charterMetricExamples.length > 0 ? (
        charterMetricExamples?.map((charterMetricExample, index) => {
          const highlightedCode = Prism.highlight(charterMetricExample.query, Prism.languages.sql, "sql");

          return (
            <div
              key={charterMetricExample.id}
              className="border rounded-sm flex justify-between gap-0.5 items-center overflow-hidden"
            >
              <div className="flex flex-col gap-0.5">
                <div className="bg-muted/70 border-b px-2 py-1 flex flex-row justify-between items-center">
                  <span className="text-sm font-medium italic">Example {index + 1}</span>
                  <div className="flex flex-row gap-2">
                    <Link
                      href={`/organisation/${organisationPublicId}/charters/${charterId}/metrics/${charterMetricId}/examples/${charterMetricExample.id}/edit`}
                      className="rounded flex flex-col justify-between gap-0.5"
                    >
                      <Button variant={"outline"} size="sm">
                        Edit <LuPencil className="ml-1 size-3" strokeWidth={2.5} />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="py-2">
                  <code
                    dangerouslySetInnerHTML={{ __html: highlightedCode }}
                    className="line-clamp-4 break-all px-2 text-sm"
                  ></code>

                  <span className="text-2sm text-foreground/70 line-clamp-3 px-2 break-all mt-1">
                    {charterMetricExample.explanation}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex justify-center items-center h-24 font-semibold">
          <span className="text-sm text-destructive">
            No examples added yet. Please add an metric examples to help the AI understand how to calculate the metric.
          </span>
        </div>
      )}
    </div>
  );
}
