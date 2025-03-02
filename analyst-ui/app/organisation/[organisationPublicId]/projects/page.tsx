import { getSession } from "@/lib/auth/session";
import { getOrganisationList } from "@/services/organisation/organisation.service";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LuPlus } from "react-icons/lu";
import { redirect } from "next/navigation";

export default async function ProjectsPage({
  params: { organisationPublicId },
}: {
  params: { organisationPublicId: string };
}) {
  const session = await getSession();
  
  if (!session?.accessToken) {
    redirect("/auth/signin");
  }

  const organisations = await getOrganisationList(session.accessToken);
  const organisation = organisations?.find(org => org.public_id === organisationPublicId);

  if (!organisation) {
    return <div>Project not found</div>;
  }

  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <CardTitle>Projects</CardTitle>
          <CardDescription>Manage your projects and their data agents</CardDescription>
        </div>
        <Link href="/organisation/create">
          <Button className="flex items-center gap-2">
            <LuPlus className="size-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organisations.map(org => (
          <Link
            key={org.public_id}
            href={`/organisation/${org.public_id}/charters`}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-lg">{org.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 