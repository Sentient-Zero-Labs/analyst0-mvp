import { getSession } from "@/lib/auth/session";
import { getOrganisationList } from "@/services/organisation/organisation.service";
import { redirect } from "next/navigation";
import LandingPage from "./_components/landing-page/landing-page";

// Mark this page as dynamic since it uses headers() via getSession()
export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    console.log("[HomePage] Attempting to get session");
    const session = await getSession();
    console.log("[HomePage] Session retrieved", {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken
    });

    if (!session || !session.accessToken) {
      console.log("[HomePage] No valid session, showing landing page");
      return <LandingPage />;
    }

    console.log("[HomePage] Valid session found, fetching organisations");
    try {
      const organisations = await getOrganisationList(session.accessToken);
      console.log("[HomePage] Organisations fetched", { count: organisations?.length });

      if (!organisations || organisations.length === 0) {
        console.log("[HomePage] No organisations found, redirecting to create");
        redirect("/organisation/create");
      } else {
        console.log(`[HomePage] Redirecting to organisation ${organisations[0].public_id}`);
        redirect(`/organisation/${organisations[0].public_id}/projects`);
      }
    } catch (error) {
      console.error("[HomePage] Error fetching organisations:", error);
      return <LandingPage />;
    }
  } catch (error) {
    console.error("[HomePage] Error in Home component:", error);
    return <LandingPage />;
  }
}
