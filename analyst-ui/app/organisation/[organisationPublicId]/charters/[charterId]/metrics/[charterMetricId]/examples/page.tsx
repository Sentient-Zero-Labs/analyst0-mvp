import { CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCharter } from "@/services/charter/charter.service";
import { getCharterMetric } from "@/services/charterMetric/charterMetric.service";
import BreadCrumbComponent from "@/app/_components/bread-crumb-component";
import { getCharterMetricExampleList } from "@/services/charterMetricExample/charterMetricExample.service";
import { CharterMetricExamplesList } from "./CharterMetricExampleList";
import { getSession } from "@/lib/auth/session/server";

export default async function CharterMetricsExamplesPage({
  params,
}: {
  params: { organisationPublicId: string; charterId: string; charterMetricId: string };
}) {
  const organisationPublicId = params.organisationPublicId;
  const charterId = parseInt(params.charterId);
  const charterMetricId = parseInt(params.charterMetricId);

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

  const charterMetricExamples = await getCharterMetricExampleList(
    {
      charterMetricId,
      charterId,
      organisationPublicId,
    },
    session?.accessToken
  );

  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-2">
          <BreadCrumbComponent
            items={[
              { name: "Data Agents", link: `/organisation/${organisationPublicId}/charters` },
              { name: charter?.name ?? "" },
              { name: "Metrics", link: `/organisation/${organisationPublicId}/charters/${charterId}/metrics` },
              { name: charterMetric?.name ?? "" },
              { name: "Examples" },
            ]}
          />
          <CardTitle>
            Data Agent Metric Examples <span className="text-sm text-foreground/70">(For: {charterMetric?.name})</span>
          </CardTitle>
          <CardDescription>
            <span>
              Data agent metric examples are used to describe how a data agent metric is calculated. You can add
              multiple examples for a data agent metric.
            </span>
          </CardDescription>
        </div>
        <Link
          href={`/organisation/${organisationPublicId}/charters/${charterId}/metrics/${charterMetricId}/examples/create`}
        >
          <Button>New Metric Example</Button>
        </Link>
      </div>
      <CharterMetricExamplesList
        charterMetricExamples={charterMetricExamples}
        charterMetricId={charterMetricId}
        charterId={charterId}
        organisationPublicId={organisationPublicId}
      />
    </div>
  );
}
