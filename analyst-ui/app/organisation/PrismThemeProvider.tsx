"use client";

import { usePrismTheme } from "@/hooks/use-prism-theme";

export function PrismThemeProvider({ children }: { children: React.ReactNode }) {
  usePrismTheme();
  return <>{children}</>;
}
