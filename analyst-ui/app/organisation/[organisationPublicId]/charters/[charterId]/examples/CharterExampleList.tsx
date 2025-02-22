import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CharterExample } from "@/services/charterExample/charterExample.schema";
import Prism from "prismjs";
import "prismjs/components/prism-sql";
import { LuPencil } from "react-icons/lu";

export function CharterExamplesList({
  charterExamples,
  charterId,
  organisationPublicId,
}: {
  charterExamples?: CharterExample[];
  charterId: number;
  organisationPublicId: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      {charterExamples && charterExamples.length > 0 ? (
        charterExamples?.map((charterExample, index) => {
          const highlightedCode = Prism.highlight(charterExample.query!, Prism.languages.sql, "sql");

          return (
            <div
              key={charterExample.id}
              className="border rounded-sm flex justify-between gap-0.5 items-center overflow-hidden"
            >
              <div className="flex flex-col gap-0.5">
                <div className="bg-muted/70 border-b px-2 py-1 flex flex-row justify-between items-center">
                  <span className="text-sm font-medium italic ">Example {index + 1}</span>
                  <div className="flex flex-row gap-2">
                    <Link
                      href={`/organisation/${organisationPublicId}/charters/${charterId}/examples/${charterExample.id}/edit`}
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
                    {charterExample.explanation}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex justify-center items-center h-24 font-semibold">
          <span className="text-sm text-destructive">
            No examples added yet. Please add an query examples to help the AI understand your charter better.
          </span>
        </div>
      )}
    </div>
  );
}
