"use client";

import { LuCheck, LuChevronsUpDown, LuGalleryVerticalEnd } from "react-icons/lu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useSelectedOrganisation } from "@/lib/store/global-store";
import { OrganisationListResponseItem } from "@/services/organisation/organisation.schema";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export function OrganisationSwitcher({ organisations }: { organisations?: OrganisationListResponseItem[] }) {
  const router = useRouter();
  const { selectedOrganisation, setSelectedOrganisation } = useSelectedOrganisation();
  const { organisationPublicId } = useParams();

  useEffect(() => {
    if (organisations && organisations.length > 0 && !selectedOrganisation) {
      if (organisationPublicId) {
        const organisation = organisations.find((o) => o.public_id === organisationPublicId);
        if (organisation) {
          setSelectedOrganisation(organisation);
        }
      } else {
        setSelectedOrganisation(organisations[0]);
      }
    }
  }, [organisations, organisationPublicId]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            disabled={!organisations || organisations.length === 0}
            className="disabled:opacity-90"
          >
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <LuGalleryVerticalEnd className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-xs font-semibold">Organisation</span>
                <span>{selectedOrganisation?.name || "No organisation"}</span>
              </div>
              <LuChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]" align="start">
            {organisations?.map((organisation) => (
              <DropdownMenuItem
                key={organisation.public_id}
                onSelect={() => {
                  if (organisation.public_id !== selectedOrganisation?.public_id) {
                    router.push(`/organisation/${organisation.public_id}/chat`);
                    setSelectedOrganisation(organisation);
                  }
                }}
              >
                {organisation.name}{" "}
                {organisation.public_id === selectedOrganisation?.public_id && <LuCheck className="ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
