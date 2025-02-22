"use client";

import { Button } from "@/components/ui/button";
import { useSelectedOrganisation } from "@/lib/store/global-store";
import Link from "next/link";

export function EmptyState() {
  const { selectedOrganisation: selectedOrg } = useSelectedOrganisation();

  const organisationPublicId = selectedOrg?.public_id;
  const hasDataSources = selectedOrg?.data_source_count && selectedOrg?.data_source_count > 0;

  const message = hasDataSources
    ? "You don't have any agents yet. Create a new agent to use SQL playground."
    : "You don't have any data sources yet. Add a data source and create a agent to use SQL playground.";

  const buttonText = hasDataSources ? "Create New Agent" : "Add Data Source";
  const href = hasDataSources
    ? `/organisation/${organisationPublicId}/charters/create`
    : `/organisation/${organisationPublicId}/data-sources/create`;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-sm text-center text-destructive">{message}</span>
      <Link href={href}>
        <Button>{buttonText}</Button>
      </Link>
    </div>
  );
}
