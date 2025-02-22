import { Button } from "@/components/ui/button";
import { CharterListResponse } from "@/services/charter/charter.schema";
import Link from "next/link";

export default function CharterList({
  charters,
  organisationPublicId,
}: {
  charters?: CharterListResponse;
  organisationPublicId: string;
}) {
  return (
    <ul className="grid grid-cols-2 rounded-md gap-4">
      {charters?.length ? (
        charters?.map((charter) => (
          <li
            key={charter.id}
            className="bg-muted/50 border rounded-md p-3 flex justify-between gap-2 items-start pl-3"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold">{charter.name}</span>
              <span className="text-xs text-foreground/70">Data Source: {charter.data_source.name}</span>

              {charter.metrics_count == 0 && (
                <span className="text-2xs text-destructive font-bold mt-1">IMPORTANT NOTE:</span>
              )}
              {/* {(charter.metrics_count == 0 || charter.slack_channel_ids_count == 0) && (
                <span className="text-2xs text-destructive font-bold mt-1">IMPORTANT NOTE:</span>
              )} */}

              {charter.metrics_count == 0 && (
                <span className="text-2xs text-destructive font-semibold">
                  - Provide metrics used by your team for LLM to understand your data better.*
                </span>
              )}

              {/* {charter.slack_channel_ids_count == 0 && (
                <span className="text-2xs text-destructive font-semibold">
                  - Add slack channel ids to answer queries directly in slack.*
                </span>
              )} */}
            </div>
            <div className="flex flex-col gap-2 justify-center h-full">
              <Link
                href={`/organisation/${organisationPublicId}/charters/${charter.id}/edit`}
                className="rounded flex flex-col justify-between gap-0.5"
              >
                <Button className="h-8" variant={"outline"}>
                  Edit Config
                </Button>
              </Link>
              {charter.metrics_count == 0 ? (
                <Link
                  href={`/organisation/${organisationPublicId}/charters/${charter.id}/metrics/create`}
                  className="rounded flex flex-col justify-between gap-0.5"
                >
                  <Button className="h-8" size={"sm"}>
                    Add Metrics
                  </Button>
                </Link>
              ) : (
                <Link
                  href={`/organisation/${organisationPublicId}/charters/${charter.id}/metrics`}
                  className="rounded flex flex-col justify-between gap-0.5"
                >
                  <Button className="h-8" size={"sm"} variant={"secondary"}>
                    View Metrics ({charter.metrics_count})
                  </Button>
                </Link>
              )}
              {charter.examples_count == 0 ? (
                <Link
                  href={`/organisation/${organisationPublicId}/charters/${charter.id}/examples/create`}
                  className="rounded flex flex-col justify-between gap-0.5"
                >
                  <Button className="h-8" size={"sm"}>
                    Add Example
                  </Button>
                </Link>
              ) : (
                <Link
                  href={`/organisation/${organisationPublicId}/charters/${charter.id}/examples`}
                  className="rounded flex flex-col justify-between gap-0.5"
                >
                  <Button className="h-8" size={"sm"} variant={"secondary"}>
                    View Examples ({charter.examples_count})
                  </Button>
                </Link>
              )}
            </div>
          </li>
        ))
      ) : (
        <span className="text-destructive">No charters found</span>
      )}
    </ul>
  );
}
