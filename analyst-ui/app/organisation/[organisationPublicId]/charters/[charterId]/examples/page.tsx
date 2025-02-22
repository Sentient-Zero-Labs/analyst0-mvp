import { CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCharter } from "@/services/charter/charter.service";
import BreadCrumbComponent from "@/app/_components/bread-crumb-component";
import { getCharterExampleList } from "@/services/charterExample/charterExample.service";
import { getSession } from "@/lib/auth/session/server";
import { CharterExamplesList } from "./CharterExampleList";

export default async function CharterExamplesPage({
  params,
}: {
  params: { organisationPublicId: string; charterId: string };
}) {
  const organisationPublicId = params.organisationPublicId;
  const charterId = parseInt(params.charterId);

  const session = await getSession();

  const charter = await getCharter({ organisationPublicId, charterId }, session?.accessToken);

  const charterExamples = await getCharterExampleList(
    {
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
              { name: "Examples" },
            ]}
          />
          <CardTitle>
            Data Agent Examples <span className="text-sm text-foreground/70">(For: {charter?.name})</span>
          </CardTitle>
          <CardDescription>
            <span>
              Data agent examples are used to describe how a data agent is used. You can add multiple examples for a
              data agent.
            </span>
          </CardDescription>
        </div>
        <Link href={`/organisation/${organisationPublicId}/charters/${charterId}/examples/create`}>
          <Button>New Example</Button>
        </Link>
      </div>
      <CharterExamplesList
        charterExamples={charterExamples}
        charterId={charterId}
        organisationPublicId={organisationPublicId}
      />
    </div>
  );
}
