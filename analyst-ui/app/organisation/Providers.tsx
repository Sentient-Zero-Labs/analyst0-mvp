"use client";

import { ThemeProvider } from "@/components/ui/theme";
import { SidebarProvider } from "@/components/ui/sidebar";
import ReactQueryProvider from "../_components/react-query-provider";
import { SessionProvider } from "@/lib/auth/session/react";
import { PrismThemeProvider } from "./PrismThemeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <SidebarProvider>
        <ReactQueryProvider>
          <PrismThemeProvider>
            <SessionProvider>{children}</SessionProvider>
          </PrismThemeProvider>
        </ReactQueryProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
