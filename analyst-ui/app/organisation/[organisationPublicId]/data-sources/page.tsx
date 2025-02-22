import { getDataSources } from "@/services/dataSource/dataSource.service";
import DataSourceList from "./DataSourceList";
import { CardDescription, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session/server";

export default async function Page({ params: { organisationPublicId } }: { params: { organisationPublicId: string } }) {
  const session = await getSession();

  const dataSources = await getDataSources({ organisationPublicId }, session?.accessToken);

  return (
    <div className="container-dashboard  mx-auto p-4 flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg">Data Sources</CardTitle>
          <CardDescription>Click on an data source to view all its entities</CardDescription>
        </div>
        <Link href={`/organisation/${organisationPublicId}/data-sources/create`}>
          <Button variant={dataSources?.length === 0 ? "default" : "secondary"}>Add Data Source</Button>
        </Link>
      </div>

      <DataSourceList dataSources={dataSources} organisationPublicId={organisationPublicId} />
    </div>
  );
}
