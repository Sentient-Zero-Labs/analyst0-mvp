import { CardTitle } from "@/components/ui/card";
import BreadCrumbComponent from "@/app/_components/bread-crumb-component";
import { getCharter } from "@/services/charter/charter.service";
import { getSession } from "@/lib/auth/session/server";
import { getCharterExample } from "@/services/charterExample/charterExample.service";
import { CharterExampleForm } from "../../CharterExampleForm";

export default async function CharterExampleEditPage({
  params: { organisationPublicId, charterId, charterExampleId },
}: {
  params: { organisationPublicId: string; charterId: number; charterExampleId: number };
}) {
  const session = await getSession();

  const charter = await getCharter({ organisationPublicId, charterId }, session?.accessToken);
  const charterExample = await getCharterExample(
    { charterExampleId, charterId, organisationPublicId },
    session?.accessToken
  );

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
            { name: "Edit Example" },
          ]}
        />
        <CardTitle>Edit Data Agent Example</CardTitle>
        <p className="text-sm text-muted-foreground">
          Give an example of how this data agent is used. This will help the AI understand how to use the data agent.
        </p>
      </div>
      <CharterExampleForm
        charterExample={charterExample}
        organisationPublicId={organisationPublicId}
        charterId={charterId}
      />
    </div>
  );
}
