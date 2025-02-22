import { CardTitle } from "@/components/ui/card";
import { CharterMetricExampleForm } from "../../CharterMetricExampleForm";
import BreadCrumbComponent from "@/app/_components/bread-crumb-component";
import { getCharter } from "@/services/charter/charter.service";
import { getCharterMetric } from "@/services/charterMetric/charterMetric.service";
import { getCharterMetricExample } from "@/services/charterMetricExample/charterMetricExample.service";
import { getSession } from "@/lib/auth/session/server";

export default async function CharterMetricExampleEditPage({
  params: { organisationPublicId, charterId, charterMetricId, charterMetricExampleId },
}: {
  params: { organisationPublicId: string; charterId: number; charterMetricId: number; charterMetricExampleId: number };
}) {
  const session = await getSession();

  const charter = await getCharter({ organisationPublicId, charterId }, session?.accessToken);
  const charterMetric = await getCharterMetric(
    { charterMetricId, organisationPublicId, charterId },
    session?.accessToken
  );

  const charterMetricExample = await getCharterMetricExample(
    { charterMetricExampleId, charterMetricId, charterId, organisationPublicId },
    session?.accessToken
  );

  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <BreadCrumbComponent
          items={[
            { name: "Charters", link: `/organisation/${organisationPublicId}/charters` },
            { name: charter?.name ?? "" },
            { name: "Metrics", link: `/organisation/${organisationPublicId}/charters/${charterId}/metrics` },
            { name: charterMetric?.name ?? "" },
            {
              name: "Examples",
              link: `/organisation/${organisationPublicId}/charters/${charterId}/metrics/${charterMetricId}/examples`,
            },
            { name: "Edit Example" },
          ]}
        />
        <CardTitle>Create Metric Example</CardTitle>
        <p className="text-sm text-muted-foreground">
          Give an example of how this metric is calculated. This will help the AI understand how to calculate the
          metric.
        </p>
      </div>
      <CharterMetricExampleForm
        charterMetricExample={charterMetricExample}
        organisationPublicId={organisationPublicId}
        charterId={charterId}
        charterMetricId={charterMetricId}
      />
    </div>
  );
}
