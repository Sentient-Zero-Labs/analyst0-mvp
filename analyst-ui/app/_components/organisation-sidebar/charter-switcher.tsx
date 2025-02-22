"use client";

import { LuCheck, LuChevronsUpDown } from "react-icons/lu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useSelectedCharter, useSelectedOrganisation } from "@/lib/store/global-store";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CharterListResponseItem } from "@/services/charter/charter.schema";
import { cn } from "@/lib/utils";

export function CharterSwitcher({ charters }: { charters?: CharterListResponseItem[] }) {
  const router = useRouter();
  const { open } = useSidebar();

  const { selectedCharter, setSelectedCharter } = useSelectedCharter();
  const { selectedOrganisation } = useSelectedOrganisation();
  const { charterId } = useParams();
  const charterIdNumber = Number(charterId);

  useEffect(() => {
    if (charters && charters.length > 0 && !selectedCharter) {
      if (charterId) {
        const charter = charters.find((c) => c.id === charterIdNumber);
        if (charter) {
          setSelectedCharter(charter);
        }
      } else {
        setSelectedCharter(charters[0]);
      }
    }
  }, [charters, charterId]);

  useEffect(() => {
    if (charters && charters.length > 0) {
      if (charterId) {
        const charter = charters.find((c) => c.id === charterIdNumber);
        if (charter) {
          setSelectedCharter(charter);
        }
      } else {
        setSelectedCharter(charters[0]);
      }
    } else {
      setSelectedCharter(null);
    }
  }, [charters, selectedOrganisation?.public_id]);

  return (
    <SidebarMenu className={cn(open ? "p-1 pb-0" : "pt-1 px-2")}>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!charters || charters.length === 0} className="disabled:opacity-90">
            <SidebarMenuButton
              size="lg"
              className="h-11 mt-0.5 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground pl-2 pr-1 rounded-md bg-background border"
            >
              {!open && (
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg font-semibold">
                  {selectedCharter?.name.charAt(0)}
                </div>
              )}
              <div className="flex flex-col leading-none">
                <span className="text-2xs font-medium opacity-80">Data Agent</span>
                <span className="line-clamp-1 text-2sm break-all font-semibold">
                  {selectedCharter?.name || "No Data Agent"}
                </span>
              </div>
              <LuChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64 max-h-72 overflow-y-auto" align="start">
            {charters?.map((charter) => (
              <DropdownMenuItem
                key={charter.id}
                onSelect={() => {
                  if (charter.id !== selectedCharter?.id) {
                    router.push(`/organisation/${selectedOrganisation?.public_id}/charters/${charter.id}/chat`);
                    setSelectedCharter(charter);
                  }
                }}
              >
                {charter.name} {charter.id === selectedCharter?.id && <LuCheck className="ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
