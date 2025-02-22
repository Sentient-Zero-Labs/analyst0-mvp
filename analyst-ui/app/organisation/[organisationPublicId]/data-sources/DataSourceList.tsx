import Link from "next/link";
import { DataSource } from "@/services/dataSource/dataSource.schema";
import { Button } from "@/components/ui/button";

export default function DataSourceList({
  dataSources,
  organisationPublicId,
}: {
  dataSources?: DataSource[];
  organisationPublicId: string;
}) {
  return (
    <ul className="grid grid-cols-2 gap-4">
      {dataSources?.length ? (
        dataSources?.map((dataSource) => (
          <li
            key={dataSource.id}
            className="bg-muted/50 rounded-md border p-2 flex justify-between gap-0.5 items-center pl-3 col-span-1"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold">{dataSource.name}</span>
              <span className="text-xs text-gray-500">{dataSource.type}</span>
            </div>
            <div className="flex flex-row gap-2">
              <Link
                href={`/organisation/${organisationPublicId}/data-sources/${dataSource.id}/edit`}
                className="rounded flex flex-col justify-between gap-0.5"
              >
                <Button variant="outline">Edit Config</Button>
              </Link>
              <Link
                href={`/organisation/${organisationPublicId}/data-sources/${dataSource.id}/data-entities`}
                className="rounded flex flex-col justify-between gap-0.5"
              >
                <Button>View Entities</Button>
              </Link>
            </div>
          </li>
        ))
      ) : (
        <span className="text-destructive">No data sources found</span>
      )}
    </ul>
  );
}
