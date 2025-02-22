import BreadCrumbComponent from "@/app/_components/bread-crumb-component";
import DataSourceForm from "../_components/DataSourceForm";

export default async function CreateDataSourcePage({
  params: { organisationPublicId },
}: {
  params: { organisationPublicId: string };
}) {
  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col">
      <BreadCrumbComponent
        items={[
          { name: "Data Sources", link: `/organisation/${organisationPublicId}/data-sources` },
          { name: "Create Data Source" },
        ]}
      />
      <DataSourceForm organisationPublicId={organisationPublicId} />
    </div>
  );
}
