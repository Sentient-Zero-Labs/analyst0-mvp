"use client";

import Link from "next/link";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { DataEntityListResponseItem } from "@/services/dataEntity/dataEntity.schema";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DataSource } from "@/services/dataSource/dataSource.schema";
import { Button } from "@/components/ui/button";
import { useFetchDataEntitiesMutation } from "@/services/dataEntity/dataEntity.service";
import { Badge } from "@/components/ui/badge";
import SyncDataEntitiesButton from "./SyncDataEntitiesButton";
import { toast } from "@/components/ui/toast";
import { TbDatabaseCog } from "react-icons/tb";

export default function DataEntityListPage({
  dataEntities,
  organisationPublicId,
  dataSourceId,
  dataSource,
}: {
  dataEntities?: DataEntityListResponseItem[];
  organisationPublicId: string;
  dataSourceId: number;
  dataSource?: DataSource;
}) {
  // search data entity by name
  const [search, setSearch] = useState("");
  const [selectedSchemas, setSelectedSchemas] = useState<string[]>([]);
  const [isFetchingDataEntities, setIsFetchingDataEntities] = useState(false);

  const fetchDataEntitiesMutation = useFetchDataEntitiesMutation({
    organisationPublicId,
    dataSourceId,
  });

  const uniqueSchemas = Array.from(new Set(dataEntities?.map((de) => de.schema_name) || [])).sort();

  const searchTerms = search.split(",").map((s) => s.trim());

  const filteredEntities = dataEntities?.filter(
    (dataEntity) =>
      (selectedSchemas.length === 0 || selectedSchemas.includes(dataEntity.schema_name)) &&
      (searchTerms.some((term) => dataEntity.name.toLowerCase().includes(term.toLowerCase())) ||
        searchTerms.some((term) => dataEntity.schema_name.toLowerCase().includes(term.toLowerCase())))
  );

  const onFetchDataEntities = async () => {
    try {
      setIsFetchingDataEntities(true);
      await fetchDataEntitiesMutation.mutateAsync();
      location.reload();
    } catch {
      toast.error("Failed to fetch data entities. Please try again later.");
    } finally {
      setIsFetchingDataEntities(false);
    }
  };

  const toggleSchema = (schema: string) => {
    setSelectedSchemas((prev) => (prev.includes(schema) ? prev.filter((s) => s !== schema) : [...prev, schema]));
  };

  return (
    <div className="flex flex-col gap-2 pb-20">
      <div className="flex flex-row justify-between gap-1">
        <div className="flex flex-col">
          <CardTitle className="text-lg">
            Data Entities{" "}
            <span className="text-base">
              ({dataSource?.name} - {dataSource?.type})
            </span>
          </CardTitle>
          <CardDescription>Click on an data entity to view all its data.</CardDescription>
        </div>

        <div className="flex gap-2">
          {!dataEntities || dataEntities.length == 0 || isFetchingDataEntities ? (
            <Button onClick={onFetchDataEntities} disabled={isFetchingDataEntities}>
              {isFetchingDataEntities ? "Syncing...Please Wait" : "Sync Data Entities"}
            </Button>
          ) : (
            <>
              <SyncDataEntitiesButton onFetchDataEntities={onFetchDataEntities} />
              <Link href={`/organisation/${organisationPublicId}/data-sources/${dataSourceId}/modeling`}>
                <Button>
                  <TbDatabaseCog className="mr-1 size-4" />
                  <span>Data Modeling</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {filteredEntities?.length === 0 ? (
        isFetchingDataEntities ? (
          <div className="w-full text-center mt-6">
            Syncing data entities...Please Wait. This might take a few minutes.
          </div>
        ) : (
          <div className="text-red-700 w-full text-center mt-6">
            It seems there are no data entities synced for this data source. Click{" "}
            <span className="font-bold italic">Sync Data Entities</span> above.
          </div>
        )
      ) : (
        <>
          <div className="flex flex-row items-end justify-between">
            {/* Filter Schema */}
            <div className="flex flex-row gap-2 flex-wrap">
              <span className="text-sm">Filter Schemas:</span>
              {uniqueSchemas.map((schema: string) => (
                <Badge
                  key={schema}
                  variant={selectedSchemas.includes(schema) ? "default" : "outline"}
                  className="cursor-pointer h-5"
                  onClick={() => toggleSchema(schema)}
                >
                  {schema}
                </Badge>
              ))}
            </div>
            <Input
              className="w-96"
              placeholder="Search data entity or schema (comma separated)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <DataEntityList
            dataEntities={filteredEntities}
            organisationPublicId={organisationPublicId}
            dataSourceId={dataSourceId}
          />
        </>
      )}
    </div>
  );
}

function DataEntityList({
  dataEntities,
  organisationPublicId,
  dataSourceId,
}: {
  dataEntities?: DataEntityListResponseItem[];
  organisationPublicId: string;
  dataSourceId: number;
}) {
  return (
    <ul className="flex flex-col rounded-md ">
      {dataEntities?.map((dataEntiy) => (
        <li
          key={dataEntiy.id}
          className="py-1 bg-muted/50 border border-b-0 last:border-b last:rounded-b-md first:rounded-t-md"
        >
          <div className="px-2 py-1.5 flex flex-row justify-between items-center gap-1">
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs font-normal">Schema: {dataEntiy.schema_name}</span>
              <span className="font-semibold">{dataEntiy.name}</span>
              <span className="text-gray-500 text-sm line-clamp-1 break-all">
                {dataEntiy.description || <span className="text-destructive">No description</span>}
              </span>
            </div>
            <Link
              href={`/organisation/${organisationPublicId}/data-sources/${dataSourceId}/data-entities/edit?dataEntityId=${dataEntiy.id}`}
            >
              <Button variant={"outline"}>Edit</Button>
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
