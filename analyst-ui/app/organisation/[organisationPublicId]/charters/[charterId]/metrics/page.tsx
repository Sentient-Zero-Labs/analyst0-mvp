import { CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCharter } from "@/services/charter/charter.service";
import { getCharterMetricsList } from "@/services/charterMetric/charterMetric.service";
import { CharterMetricsList } from "./CharterMetricsList";
import BreadCrumbComponent from "@/app/_components/bread-crumb-component";
import { getSession } from "@/lib/auth/session/server";

export const revalidate = 0;

export default async function CharterMetricsPage({
  params: { organisationPublicId, charterId },
}: {
  params: { organisationPublicId: string; charterId: number };
}) {
  const session = await getSession();

  const charter = await getCharter({ organisationPublicId, charterId }, session!.accessToken!);
  const charterMetrics = await getCharterMetricsList({ organisationPublicId, charterId }, session!.accessToken!);

  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-2">
          <BreadCrumbComponent
            items={[
              { name: "Data Agents", link: `/organisation/${organisationPublicId}/charters` },
              { name: charter?.name ?? "" },
              { name: "Metrics" },
            ]}
          />
          <CardTitle>
            Data Agent Metrics <span className="text-sm text-foreground/70">(For: {charter?.name})</span>
          </CardTitle>
          <CardDescription>
            <span>Data agent metrics are used to describe the metrics of a data agent.</span>
          </CardDescription>
        </div>
        <Link href={`/organisation/${organisationPublicId}/charters/${charterId}/metrics/create`}>
          <Button>Add Metric</Button>
        </Link>
      </div>
      <CharterMetricsList
        charterMetrics={charterMetrics}
        organisationPublicId={organisationPublicId}
        charterId={charterId}
      />
    </div>
  );
}
