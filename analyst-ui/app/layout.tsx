import "./globals.css";
import OrganisationHeader from "./_components/organisation-header";
import { Toaster } from "@/components/ui/toast";
import { OrganisationSidebar } from "./_components/organisation-sidebar/organisation-sidebar";
import { getSession } from "@/lib/auth/session";
import Providers from "./organisation/Providers";
import LandingPageHeader from "./_components/landing-page-header";
import { Analytics } from "@vercel/analytics/react";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export const metadata = {
  title: "Analyst Zero - Chat with your data, directly on Slack",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Analyst Zero - Chat with your data, directly on Slack",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Analyst Zero Logo",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const user = session?.user;

  const layoutContent = user ? (
    <>
      <OrganisationSidebar user={user} />
      <div className={` flex flex-col flex-1 w-[calc(100vw-var(--sidebar-width))]`}>
        <OrganisationHeader user={user} />
        <main className="flex-1">{children}</main>
      </div>
    </>
  ) : (
    <div className="size-full">
      <LandingPageHeader />
      <main className="size-full">{children}</main>
    </div>
  );

  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-background font-sans`}>
        <Analytics />
        <Providers>
          {layoutContent}
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  );
}
