import { CharterForm } from "../CharterForm";
import BreadCrumbComponent from "@/app/_components/bread-crumb-component";

export default async function CharterEditPage({
  params: { organisationPublicId },
}: {
  params: { organisationPublicId: string };
}) {
  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-2">
      <BreadCrumbComponent
        items={[
          { name: "Data Agents", link: `/organisation/${organisationPublicId}/charters` },
          { name: "Create Data Agent" },
        ]}
      />
      <CharterForm organisationPublicId={organisationPublicId} />
    </div>
  );
}
