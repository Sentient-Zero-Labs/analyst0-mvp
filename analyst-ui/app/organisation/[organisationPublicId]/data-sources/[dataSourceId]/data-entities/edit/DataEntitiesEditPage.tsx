"use client";
import { useDataEntityQuery } from "@/services/dataEntity/dataEntity.service";
import { DataEntityForm } from "./DataEntityForm";
import { DataEntityListSidebar } from "./DataEntityListSidebar";
import { DataEntityListResponseItem } from "@/services/dataEntity/dataEntity.schema";
import RobotLoader from "@/components/ui/robot-loader";
import BreadCrumbComponent from "@/app/_components/bread-crumb-component";
import { capitalize } from "@/lib/utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function DataEntitiesEditPage({
  dataEntities,
  organisationPublicId,
  dataSourceId,
  dataEntityId,
}: {
  dataEntities: DataEntityListResponseItem[];
  organisationPublicId: string;
  dataSourceId: number;
  dataEntityId: number;
}) {
  const { data: dataEntity, isLoading: isLoadingDataEntity } = useDataEntityQuery({
    organisationPublicId,
    dataSourceId,
    dataEntityId: dataEntityId!,
  });

  return (
    <div className="container-dashboard !pr-0 mx-auto flex flex-col">
      <BreadCrumbComponent
        items={[
          { name: "Data Sources", link: `/organisation/${organisationPublicId}/data-sources` },
          { name: dataEntities[0]?.data_source_name },
          {
            name: "Data Entities",
            link: `/organisation/${organisationPublicId}/data-sources/${dataSourceId}/data-entities`,
          },
          { name: dataEntity ? capitalize(dataEntity.name) : "Data Entity" },
          { name: "Edit" },
        ]}
      />
      <div className="w-full flex flex-row pt-3">
        <ResizablePanelGroup direction="horizontal" className="w-full">
          <ResizablePanel defaultSize={18}>
            {" "}
            <div className="w-full ">
              <h3 className="text-2base font-medium">Data Entities</h3>
              <div className="w-full h-[calc(85vh)] overflow-y-auto pr-4">
                <DataEntityListSidebar
                  dataEntities={dataEntities}
                  dataEntityId={dataEntityId}
                  organisationPublicId={organisationPublicId}
                  dataSourceId={dataSourceId}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={82} className={`w-full`}>
            {" "}
            <div className="pl-3 pr-3 h-[calc(100vh-100px)] overflow-y-auto">
              {isLoadingDataEntity ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <RobotLoader className="size-20" />
                </div>
              ) : (
                dataEntity && (
                  <DataEntityForm
                    key={dataEntity.id}
                    dataEntity={dataEntity}
                    organisationPublicId={organisationPublicId}
                  />
                )
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* <div className="w-1/5 mt-4 border-r">
          <h3 className="text-2base font-medium">Data Entities</h3>
          <div className="w-full h-[calc(85vh)] overflow-y-auto pr-4">
            <DataEntityListSidebar
              dataEntities={dataEntities}
              dataEntityId={dataEntityId}
              organisationPublicId={organisationPublicId}
              dataSourceId={dataSourceId}
            />
          </div>
        </div>
        <div className="pl-3 pr-3 w-4/5 h-[calc(100vh-100px)] overflow-y-auto">
          {isLoadingDataEntity ? (
            <div className="flex flex-col items-center justify-center h-full">
              <RobotLoader className="size-20" />
            </div>
          ) : (
            dataEntity && (
              <DataEntityForm key={dataEntity.id} dataEntity={dataEntity} organisationPublicId={organisationPublicId} />
            )
          )}
        </div> */}
      </div>
    </div>
  );
}
