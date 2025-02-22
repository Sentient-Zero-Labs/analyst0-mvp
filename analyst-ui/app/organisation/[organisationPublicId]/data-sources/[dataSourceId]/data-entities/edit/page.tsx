import { getSession } from "@/lib/auth/session";
import { getDataEntitiesList } from "@/services/dataEntity/dataEntity.service";
import DataEntitiesEditPage from "./DataEntitiesEditPage";

// Add this line to force dynamic rendering
export const dynamic = "force-dynamic";

export default async function DataEntityPage({
  params,
  searchParams,
}: {
  params: { organisationPublicId: string; dataSourceId: string };
  searchParams: { dataEntityId: string };
}) {
  const organisationPublicId = params.organisationPublicId;
  const dataSourceId = parseInt(params.dataSourceId);
  const dataEntityId = parseInt(searchParams.dataEntityId);

  const session = await getSession();

  const dataEntities = await getDataEntitiesList(
    {
      organisationPublicId: organisationPublicId,
      dataSourceId: dataSourceId,
    },
    session.accessToken!
  );

  return (
    <DataEntitiesEditPage
      dataEntities={dataEntities}
      organisationPublicId={organisationPublicId}
      dataSourceId={dataSourceId}
      dataEntityId={dataEntityId}
    />
  );
}
