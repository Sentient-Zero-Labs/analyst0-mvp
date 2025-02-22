"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { VscRobot } from "react-icons/vsc";

import { LuChevronRight, LuDatabase, LuLayoutDashboard, LuPlus } from "react-icons/lu";
import Link from "next/link";
import { Separator } from "../../../components/ui/separator";
import { useSelectedCharter, useSelectedOrganisation } from "@/lib/store/global-store";
import { usePathname } from "next/navigation";
import { CustomUser } from "@/lib/auth/custom-auth";
import { useOrganisationListQuery } from "@/services/organisation/organisation.service";
import { GoCodeSquare } from "react-icons/go";
import { useEffect } from "react";
import { TbDatabaseCog } from "react-icons/tb";
import { LuExternalLink } from "react-icons/lu";
import { TbFileTextAi } from "react-icons/tb";
import Image from "next/image";
import { AiOutlineLineChart } from "react-icons/ai";
import { BsFiletypeSql } from "react-icons/bs";
import { CiViewList } from "react-icons/ci";
import { Collapsible } from "@/components/ui/collapsible";
import { CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useChartersListQuery } from "@/services/charter/charter.service";
import { CharterSwitcher } from "./charter-switcher";

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

interface SidebarItem {
  title: string;
  url?: string;
  isActive?: boolean;
  newTab?: boolean;
  icon: React.ReactNode;
  slug?: string;
  regex?: RegExp;
}

// This is sample data.
const data: { navMain: SidebarGroup[] } = {
  navMain: [
    {
      title: "Analyse Data",
      items: [
        {
          title: "Chat with data",
          icon: <VscRobot className="mr-0.5 size-4" strokeWidth={0.1} />,
          slug: "chat",
          regex: /chat/,
        },
        {
          title: "New Query",
          icon: <GoCodeSquare className="mr-0.5 size-4" strokeWidth={0.25} />,
          slug: "playground/new",
          regex: /playground/,
        },
      ],
    },
    {
      title: "Saved",
      items: [
        {
          title: "SQL Queries",
          icon: <CiViewList className="mr-0.5 size-4 scale-105" strokeWidth={0.5} />,
          slug: "sql-queries",
          regex: /sql-queries/,
        },
      ],
    },
    {
      title: "Knowledge",
      items: [
        {
          title: "Metrics",

          icon: <AiOutlineLineChart className="mr-0.5 size-4" strokeWidth={0.5} />,
          slug: "metrics",
          regex: /metrics/,
        },
        {
          title: "Query Examples",

          icon: <BsFiletypeSql className="mr-0.5 size-4" strokeWidth={0.25} />,
          slug: "examples",
          regex: /^(?!.*metrics).*examples.*$/,
        },
      ],
    },
  ],
};

const bottomData: { navMain: SidebarGroup[] } = {
  navMain: [
    {
      title: "Building Your Application",
      items: [
        {
          title: "Data Agents",
          isActive: true,
          icon: <LuLayoutDashboard className="mr-1 size-3.5" />,
          slug: "charters",
          regex: /charters$/,
          // regex: /charters(?!.*(?:playground|chat))/,
        },
        {
          title: "Data Sources",
          icon: <LuDatabase className="mr-1 size-3.5" />,
          slug: "data-sources",
          regex: /data-sources(?!.*(?:data-entity|chat))/,
        },
      ],
    },
    {
      title: "Getting Started (Docs)",
      items: [
        {
          title: "Setup",
          url: "/docs/get-started/setup",
          newTab: true,
          icon: <TbDatabaseCog className="mr-1 size-3.5" />,
          regex: /docs\/get-started\/setup/,
        },
        {
          title: "Context for Agent",
          url: "/docs/get-started/adding-context",
          newTab: true,
          icon: <TbFileTextAi className="mr-1 size-3.5 scale-110" />,
          regex: /docs\/get-started\/adding-context/,
        },
      ],
    },
  ],
};

export function OrganisationSidebar({ user }: { user?: CustomUser }) {
  const pathname = usePathname();
  const { selectedOrganisation } = useSelectedOrganisation();
  const { selectedCharter } = useSelectedCharter();

  const { data: organisations, isPending } = useOrganisationListQuery();

  const { data: charters, isPending: isChartersPending } = useChartersListQuery({
    organisationPublicId: selectedOrganisation?.public_id,
  });
  const [isLoadedOnce, setIsLoadedOnce] = React.useState(false);

  useEffect(() => {
    setIsLoadedOnce(true);
  }, []);

  if (pathname.startsWith("/try-supr-analyst")) return null;

  if (!user) return null;

  const hasNoOrganisations =
    isLoadedOnce && !isPending && (!organisations || (organisations && organisations.length === 0));

  const hasNoCharters = isLoadedOnce && !isChartersPending && (!charters || (charters && charters.length === 0));

  return (
    <Sidebar className="z-50" collapsible="icon">
      <Link
        href={
          selectedOrganisation?.public_id
            ? `/organisation/${selectedOrganisation?.public_id}/chat`
            : "/organisation/create"
        }
        className="flex items-center overflow-hidden py-2 px-2 h-[45px] border-b space-x-1"
      >
        <div className="relative size-8 object-contain shrink-0">
          <Image src="/logo.svg" alt="Analyst Zero" className="object-contain" fill />
        </div>
        <span className="text-lg font-semibold truncate">Analyst Zero</span>
      </Link>

      <CharterSwitcher charters={charters} />

      <SidebarContent className="gap-0">
        {/* We create a SidebarGroup for each parent. */}
        {selectedOrganisation?.public_id && selectedCharter?.id ? (
          <React.Fragment>
            {data.navMain.map((item, idx) => (
              <React.Fragment key={item.title}>
                <SidebarGroup>
                  <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {item.items.map((item) => (
                        <SidebarMenuItem key={item.title} className="z-10">
                          <SidebarMenuButton className="h-10" asChild isActive={item.regex?.test(pathname)}>
                            <Link
                              href={`/organisation/${selectedOrganisation?.public_id}/charters/${selectedCharter?.id}/${item.slug}`}
                            >
                              <span>{item.icon}</span>
                              <span className="font-medium">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
                {idx !== data.navMain.length - 1 && (
                  <div className="px-4">
                    <Separator orientation="horizontal" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </React.Fragment>
        ) : hasNoOrganisations ? (
          <SidebarGroup>
            <SidebarGroupLabel>Set Up</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className="z-10">
                  <SidebarMenuButton className="h-10" asChild isActive={pathname.startsWith("/organisation/create")}>
                    <Link href={`/organisation/create`}>
                      <span>
                        <LuPlus className="mr-1 size-4" />
                      </span>
                      <span className="font-medium">Create Project</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : hasNoCharters ? (
          <SidebarGroup>
            <SidebarGroupLabel>Set Up</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className="z-10">
                  <SidebarMenuButton className="h-10" asChild isActive={pathname.startsWith("/organisation/create")}>
                    <Link href={`/organisation/create`}>
                      <span>
                        <LuPlus className="mr-1 size-4" />
                      </span>
                      <span className="font-medium">Create Data Agent</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}

        {selectedOrganisation?.public_id && <Separator orientation="horizontal" className="mt-auto" />}

        {/* Bottom Navigation */}
        <div className="border-b">
          {bottomData.navMain.map((item, idx) => (
            <Collapsible key={item.title} title={item.title} className="group/collapsible">
              <React.Fragment key={`docs-${item.title}-${idx}`}>
                <SidebarGroup className="py-1">
                  <SidebarGroupLabel className="p-0">
                    <CollapsibleTrigger className="flex items-center justify-between w-full data-[state=closed]:hover:bg-foreground/5 px-1.5 py-2 rounded-sm">
                      {item.title}{" "}
                      <LuChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90 size-4" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent
                    className={
                      "text-popover-foreground outline-none duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                    }
                  >
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {item.items.map((item) => (
                          <SidebarMenuItem key={item.title} className="z-10">
                            <SidebarMenuButton className="h-8" asChild isActive={item.regex?.test(pathname)}>
                              {item.slug ? (
                                <Link href={`/organisation/${selectedOrganisation?.public_id}/${item.slug}`}>
                                  <span>{item.icon}</span>
                                  <span className="font-medium text-2sm">{item.title}</span>
                                </Link>
                              ) : (
                                <Link
                                  target={item.newTab && !pathname.startsWith("/docs") ? "_blank" : undefined}
                                  href={item.url!}
                                >
                                  <span>{item.icon}</span>
                                  <span className="font-medium text-2sm">{item.title}</span>
                                  {item.newTab && !pathname.startsWith("/docs") && (
                                    <LuExternalLink className="size-3.5" />
                                  )}
                                </Link>
                              )}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </React.Fragment>
            </Collapsible>
          ))}
        </div>
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <NavUser user={user} organisationPublicId={selectedOrganisation?.public_id} />
      </SidebarFooter>
    </Sidebar>
  );
}
