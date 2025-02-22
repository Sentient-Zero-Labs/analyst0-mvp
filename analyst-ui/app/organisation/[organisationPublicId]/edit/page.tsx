import { getOrganisationByPublicId } from "@/services/organisation/organisation.service";
import OrganisationForm from "../../OrganisationForm";

export default async function EditOrganisationPage({
  params: { organisationPublicId },
}: {
  params: { organisationPublicId: string };
}) {
  const organisation = await getOrganisationByPublicId({ publicId: organisationPublicId });

  return <OrganisationForm organisation={organisation} />;
}
