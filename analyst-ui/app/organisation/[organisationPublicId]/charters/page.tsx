import { CardDescription, CardTitle } from "@/components/ui/card";
import CharterList from "./CharterList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCharterList } from "@/services/charter/charter.service";

import { getSession } from "@/lib/auth/session/server";

export default async function ChartersPage({
  params: { organisationPublicId },
}: {
  params: { organisationPublicId: string };
}) {
  const session = await getSession();

  const charters = await getCharterList({ organisationPublicId }, session!.accessToken!);

  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg">Data Agents</CardTitle>
          <CardDescription>
            <span>Data Agent is used to describe different data domains with their data entities and metrics.</span>
            <br />
            <span>You can chat with your data or use SQL playground at data agent level.</span>
          </CardDescription>
        </div>
        <Link href={`/organisation/${organisationPublicId}/charters/create`}>
          <Button variant={charters?.length === 0 ? "default" : "secondary"}>Create Data Agent</Button>
        </Link>
      </div>

      <CharterList charters={charters} organisationPublicId={organisationPublicId} />
    </div>
  );
}
