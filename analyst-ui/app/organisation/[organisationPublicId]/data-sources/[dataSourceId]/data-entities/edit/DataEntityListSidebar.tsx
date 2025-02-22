import { cn } from "@/lib/utils";
import { DataEntityListResponseItem } from "@/services/dataEntity/dataEntity.schema";
import Link from "next/link";

export function DataEntityListSidebar({
  dataEntities,
  dataEntityId,
  organisationPublicId,
  dataSourceId,
}: {
  dataEntities?: DataEntityListResponseItem[];
  dataEntityId: number | null;
  organisationPublicId: string;
  dataSourceId: number;
}) {
  return (
    <ul className="flex flex-col pb-4">
      {dataEntities?.map((dataEntiy) => (
        <li key={dataEntiy.id} className="py-1">
          <Link
            href={`/organisation/${organisationPublicId}/data-sources/${dataSourceId}/data-entities/edit?dataEntityId=${dataEntiy.id}`}
            className={cn(
              "px-1 py-1.5 flex flex-row justify-between items-center gap-1 hover:bg-muted rounded cursor-pointer",
              dataEntityId === dataEntiy.id && "bg-foreground/[7%]"
            )}
          >
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs font-normal">Schema: {dataEntiy.schema_name}</span>
              <span className="font-semibold text-sm break-all">{dataEntiy.name}</span>
              <span className="text-gray-500 text-xs line-clamp-1 break-all">
                {dataEntiy.description || <span className="text-destructive">No description</span>}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
