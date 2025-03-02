import { getSession } from "@/lib/auth/session";
import { getOrganisationList } from "@/services/organisation/organisation.service";
import { redirect } from "next/navigation";
import LandingPage from "./_components/landing-page/landing-page";

export default async function Home() {
  const session = await getSession();

  if (!session) return <LandingPage />;

  const organisations = await getOrganisationList(session.accessToken!);

  if (!organisations || organisations.length === 0) {
    redirect("/organisation/create");
  } else {
    redirect(`/organisation/${organisations[0].public_id}/projects`);
  }

  return null;
}
