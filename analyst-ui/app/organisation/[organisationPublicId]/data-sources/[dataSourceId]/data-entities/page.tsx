import { getDataEntitiesList } from "@/services/dataEntity/dataEntity.service";
import { getDataSource } from "@/services/dataSource/dataSource.service";
import { getSession } from "@/lib/auth/session/server";
import BreadCrumbComponent from "@/app/_components/bread-crumb-component";
import DataEntityListPage from "./DataEntityListPage";

export default async function Page({ params }: { params: { organisationPublicId: string; dataSourceId: number } }) {
  const session = await getSession();

  const dataEntities = await getDataEntitiesList(
    {
      organisationPublicId: params.organisationPublicId,
      dataSourceId: params.dataSourceId,
    },
    session!.accessToken!
  );

  const dataSource = await getDataSource(
    {
      organisationPublicId: params.organisationPublicId,
      dataSourceId: params.dataSourceId,
    },
    session!.accessToken!
  );

  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-2">
      <BreadCrumbComponent
        items={[
          { name: "Data Sources", link: `/organisation/${params.organisationPublicId}/data-sources` },
          { name: dataSource.name },
          { name: "Data Entities" },
        ]}
      />
      <DataEntityListPage
        dataEntities={dataEntities}
        organisationPublicId={params.organisationPublicId}
        dataSourceId={params.dataSourceId}
        dataSource={dataSource}
      />
    </div>
  );
}
