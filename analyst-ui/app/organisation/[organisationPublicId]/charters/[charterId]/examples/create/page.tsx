import { CardTitle } from "@/components/ui/card";
import BreadCrumbComponent from "@/app/_components/bread-crumb-component";
import { getCharter } from "@/services/charter/charter.service";
import { getSession } from "@/lib/auth/session/server";
import { CharterExampleForm } from "../CharterExampleForm";

export default async function CharterMetricExampleAddPage({
  params,
}: {
  params: { organisationPublicId: string; charterId: string; charterMetricId: number };
}) {
  const organisationPublicId = params.organisationPublicId;
  const charterId = parseInt(params.charterId);

  const session = await getSession();

  const charter = await getCharter({ organisationPublicId, charterId }, session?.accessToken);

  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <BreadCrumbComponent
          items={[
            { name: "Data Agents", link: `/organisation/${organisationPublicId}/charters` },
            { name: charter?.name ?? "" },
            {
              name: "Examples",
              link: `/organisation/${organisationPublicId}/charters/${charterId}/examples`,
            },
            { name: "Create Example" },
          ]}
        />
        <CardTitle>Create Example</CardTitle>
        <p className="text-sm text-muted-foreground">
          Give an example of how the tables of the data agent are used. This will help the AI understand your data
          agent better.
        </p>
      </div>

      <CharterExampleForm organisationPublicId={organisationPublicId} charterId={charterId} />
    </div>
  );
}
