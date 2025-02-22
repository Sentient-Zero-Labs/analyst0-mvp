import { getSession } from "@/lib/auth/session";
import { CharterMetricForm } from "../../CharterMetricForm";
import { getCharterMetric } from "@/services/charterMetric/charterMetric.service";

export default async function EditMetricPage({
  params: { organisationPublicId, charterId, charterMetricId },
}: {
  params: { organisationPublicId: string; charterId: number; charterMetricId: number };
}) {
  const session = await getSession();
  const charterMetric = await getCharterMetric(
    { organisationPublicId, charterId, charterMetricId },
    session?.accessToken
  );

  return (
    <CharterMetricForm
      organisationPublicId={organisationPublicId}
      charterId={charterId}
      charterMetric={charterMetric}
    />
  );
}
