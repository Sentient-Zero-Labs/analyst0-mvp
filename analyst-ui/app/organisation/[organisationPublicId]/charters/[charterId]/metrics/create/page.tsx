import { CharterMetricForm } from "../CharterMetricForm";

export default async function AddCharterMetricPage({
  params: { organisationPublicId, charterId },
}: {
  params: { organisationPublicId: string; charterId: number };
}) {
  return <CharterMetricForm organisationPublicId={organisationPublicId} charterId={charterId} />;
}
