import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function OrganisationAuthCheck({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session?.accessToken) redirect("/auth/signin");

  return <>{children}</>;
}
