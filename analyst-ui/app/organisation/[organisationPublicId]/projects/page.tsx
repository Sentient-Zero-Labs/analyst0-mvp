import { getSession } from "@/lib/auth/session";
import { getOrganisationList } from "@/services/organisation/organisation.service";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { Carousel } from "@/components/ui/carousel";

export default async function PlatformGuidelinesPage({
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

  const projectManagementImages = [
    {
      src: "/platform-guide/Create Project.png",
      alt: "Create new project form"
    },
    {
      src: "/platform-guide/Create Project or Agent 000.png",
      alt: "Project creation options"
    }
  ];

  const dataSourceImages = [
    {
      src: "/platform-guide/Data Source Creation 000.png",
      alt: "Create Data Source"
    },
    {
      src: "/platform-guide/Create DataSource.png",
      alt: "Create data source initial view"
    },
    {
      src: "/platform-guide/Create DataSource Filled.png",
      alt: "Data source form filled"
    },
    {
      src: "/platform-guide/Data Source Sync Entities.png",
      alt: "Sync data source entities"
    },
    {
      src: "/platform-guide/Data Source Synced Entitites.png",
      alt: "Synced entities view"
    }
  ];

  const dataAgentImages = [
    {
      src: "/platform-guide/Create Data Agent.png",
      alt: "Create data agent form"
    },
    {
      src: "/platform-guide/Data Agent Filled.png",
      alt: "Data agent form filled"
    },
    {
      src: "/platform-guide/Data Agent Selected.png",
      alt: "Data agent with selected entities"
    },
    {
      src: "/platform-guide/Select Data Agent.png",
      alt: "Select data agent view"
    }
  ];

  return (
    <div className="container-dashboard mx-auto p-8 flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-2">
        <CardTitle className="text-3xl">Platform Guidelines</CardTitle>
        <CardDescription>Learn how to use Analyst Zero effectively</CardDescription>
      </div>

      {/* Project Management Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Project Management</h2>
        <div className="grid gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Creating a New Project</h3>
            <p className="text-muted-foreground">
              Start by creating a project to organize your data sources and agents.
            </p>
            <div className="border rounded-lg p-4 bg-muted/10">
              <Carousel images={projectManagementImages} />
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Data Source Configuration</h2>
        <div className="grid gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Adding a Data Source</h3>
            <p className="text-muted-foreground">
              Connect your database to enable data analysis and querying.
            </p>
            <div className="border rounded-lg p-4 bg-muted/10">
              <Carousel images={dataSourceImages} />
            </div>
          </div>
        </div>
      </section>

      {/* Data Agents Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Working with Data Agents</h2>
        <div className="grid gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Creating and Configuring Agents</h3>
            <p className="text-muted-foreground">
              Set up data agents to analyze specific aspects of your data.
            </p>
            <div className="border rounded-lg p-4 bg-muted/10">
              <Carousel images={dataAgentImages} />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
} 