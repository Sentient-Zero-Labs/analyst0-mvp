"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import Link from "next/link";
import { Separator } from "../../../components/ui/separator";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Get Started",
      url: "#",
      items: [
        {
          title: "Setup",
          url: "/docs/get-started/setup",
        },
        {
          title: "Adding Context for Data Agent",
          url: "/docs/get-started/adding-context",
        },
      ],
    },
  ],
};

export default function DocsSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="mt-14">
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item, idx) => (
          <React.Fragment key={item.title}>
            <SidebarGroup>
              <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {item.items.map((item) => (
                    <SidebarMenuItem key={item.title} className="z-10">
                      <SidebarMenuButton
                        className={cn(
                          "h-9 text-base text-foreground/70",
                          pathname === item.url && "bg-foreground/[7%]"
                        )}
                        asChild
                      >
                        <Link href={item.url}>
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
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
