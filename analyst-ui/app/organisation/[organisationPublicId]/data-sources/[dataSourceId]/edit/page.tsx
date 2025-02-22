import { getDataSource } from "@/services/dataSource/dataSource.service";
import DataSourceForm from "../../_components/DataSourceForm";
import { getSession } from "@/lib/auth/session";
import BreadCrumbComponent from "@/app/_components/bread-crumb-component";

export default async function DataSourceEditPage({
  params,
}: {
  params: { organisationPublicId: string; dataSourceId: number };
}) {
  const session = await getSession();

  const dataSource = await getDataSource(
    {
      organisationPublicId: params.organisationPublicId,
      dataSourceId: params.dataSourceId,
    },
    session.accessToken!
  );

  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col">
      <BreadCrumbComponent
        items={[
          { name: "Data Sources", link: `/organisation/${params.organisationPublicId}/data-sources` },
          { name: dataSource?.name ?? "" },
          { name: "Edit Data Source" },
        ]}
      />
      <DataSourceForm organisationPublicId={params.organisationPublicId} dataSource={dataSource} />
    </div>
  );
}
