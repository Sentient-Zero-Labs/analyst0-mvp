import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DataEntityListResponseItem } from "@/services/dataEntity/dataEntity.schema";
import { Dispatch, SetStateAction } from "react";
import { isArrayNotEmpty } from "@/lib/utils/array.utils";
import { LuTable, LuX } from "react-icons/lu";
import { FaRegEdit } from "react-icons/fa";
import Link from "next/link";
import { useSelectedOrganisation } from "@/lib/store/global-store";

export const DataEntityInfoDialog = ({
  dataEntity,
  setSelectedEntityIds,
}: {
  dataEntity: DataEntityListResponseItem;
  setSelectedEntityIds: Dispatch<SetStateAction<number[]>>;
}) => {
  const { selectedOrganisation: selectedOrg } = useSelectedOrganisation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex gap-1 border p-0.5 rounded px-1 shrink-0 items-center hover:bg-foreground/5 cursor-pointer">
          <div className="flex items-center gap-1">
            <LuTable className="size-3.5" strokeWidth={1.5} /> <span className="font-semibold">{dataEntity?.name}</span>
          </div>
          <span
            className="cursor-pointer hover:bg-foreground/10 rounded-md hover:scale-110"
            onClick={() => setSelectedEntityIds((prev) => prev?.filter((prevId) => dataEntity.id !== prevId))}
          >
            <LuX className="size-3.5" />
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[600px] h-[80vh] overflow-y-auto text-sm">
        <div className="flex flex-col gap-3">
          {/* Name and Description */}
          <div>
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Data Entity ({dataEntity.name}) </h3>
              {selectedOrg?.user_role === "admin" && (
                <Link
                  href={`/organisation/${selectedOrg?.public_id}/data-sources/${dataEntity.data_source_id}/data-entities/edit?dataEntityId=${dataEntity.id}`}
                  className="flex items-center gap-1 text-foreground/60 hover:text-foreground/80 hover:scale-105 text-sm"
                  target="_blank"
                >
                  <FaRegEdit className="size-4" /> Edit
                </Link>
              )}
            </div>
            <p className="text-2sm mt-1">{dataEntity.description}</p>
          </div>

          {/* Columns */}
          <div>
            <h3 className="w-full text-base font-semibold">Columns</h3>
            {isArrayNotEmpty(dataEntity.columns) && (
              <div className="flex flex-col gap-2 mt-1">
                {dataEntity.columns?.map((column, index) => (
                  <div key={column.name}>
                    <div>
                      {index + 1}. <span className="font-semibold">{column.name}</span> <span>({column.type})</span>
                    </div>
                    <div className="border1 px-2 py-1 rounded-md text-2sm">{column.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Foreign Keys */}
          <div>
            <h3 className="w-full  text-base font-semibold">Relationships</h3>
            {isArrayNotEmpty(dataEntity.foreign_keys) ? (
              <div className="flex flex-col gap-2 mt-1">
                {dataEntity.foreign_keys?.map((foreignKey, index) => (
                  <div key={foreignKey.column}>
                    <div>
                      {index + 1}. <span className="font-semibold">{foreignKey.column}</span>{" "}
                      <span>({foreignKey.referred_column})</span>
                    </div>
                    <div className="border1 px-2 py-1 rounded-md text-2sm">{foreignKey.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-2sm text-foreground/50">No relationships found.</div>
            )}
          </div>

          {/* Indexes */}
          <div>
            <h3 className="w-full  text-base font-semibold">Indexes</h3>
            {isArrayNotEmpty(dataEntity.indexes) ? (
              <div className="flex flex-col gap-2 mt-1">
                {dataEntity.indexes?.map((entityIndex, index) => (
                  <div key={entityIndex.name}>
                    <div>
                      {index + 1}. <span className="font-semibold">{entityIndex.name}</span>
                    </div>
                    <div className="border1 px-2 py-1 rounded-md text-2sm">{entityIndex.columns.join(", ")}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-2sm text-foreground/50">No indexes found.</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
