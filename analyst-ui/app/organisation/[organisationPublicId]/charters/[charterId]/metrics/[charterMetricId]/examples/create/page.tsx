import { CardTitle } from "@/components/ui/card";
import { CharterMetricExampleForm } from "../CharterMetricExampleForm";
import BreadCrumbComponent from "@/app/_components/bread-crumb-component";
import { getCharter } from "@/services/charter/charter.service";
import { getCharterMetric } from "@/services/charterMetric/charterMetric.service";
import { getSession } from "@/lib/auth/session/server";

export default async function CharterMetricExampleAddPage({
  params: { organisationPublicId, charterId, charterMetricId },
}: {
  params: { organisationPublicId: string; charterId: number; charterMetricId: number };
}) {
  const session = await getSession();

  const charter = await getCharter({ organisationPublicId, charterId }, session?.accessToken);
  const charterMetric = await getCharterMetric(
    {
      charterMetricId,
      organisationPublicId,
      charterId,
    },
    session?.accessToken
  );

  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <BreadCrumbComponent
          items={[
            { name: "Data Agents", link: `/organisation/${organisationPublicId}/charters` },
            { name: charter?.name ?? "" },
            { name: "Metrics", link: `/organisation/${organisationPublicId}/charters/${charterId}/metrics` },
            { name: charterMetric?.name ?? "" },
            {
              name: "Examples",
              link: `/organisation/${organisationPublicId}/charters/${charterId}/metrics/${charterMetricId}/examples`,
            },
            { name: "Create Example" },
          ]}
        />
        <CardTitle>Create Data Agent Metric Example</CardTitle>
        <p className="text-sm text-muted-foreground">
          Give an example of how this data agent metric is calculated. This will help the AI understand how to
          calculate the metric.
        </p>
      </div>
      <CharterMetricExampleForm
        organisationPublicId={organisationPublicId}
        charterId={charterId}
        charterMetricId={charterMetricId}
      />
    </div>
  );
}
