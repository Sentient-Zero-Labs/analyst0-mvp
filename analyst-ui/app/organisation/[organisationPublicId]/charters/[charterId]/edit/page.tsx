import { getSession } from "@/lib/auth/session";
import { CharterForm } from "../../CharterForm";
import { getCharter } from "@/services/charter/charter.service";
import BreadCrumbComponent from "@/app/_components/bread-crumb-component";

export default async function CharterEditPage({
  params: { organisationPublicId, charterId },
}: {
  params: { organisationPublicId: string; charterId: number };
}) {
  const session = await getSession();
  const charter = await getCharter({ organisationPublicId, charterId }, session.accessToken);

  return (
    <div className="container-dashboard mx-auto flex flex-col">
      <BreadCrumbComponent
        items={[
          { name: "Charters", link: `/organisation/${organisationPublicId}/charters` },
          { name: charter?.name ?? "" },
          { name: "Edit Charter" },
        ]}
      />
      <CharterForm charter={charter} organisationPublicId={organisationPublicId} />
    </div>
  );
}
