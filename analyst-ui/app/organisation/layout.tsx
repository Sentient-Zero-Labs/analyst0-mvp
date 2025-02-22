import OrganisationAuthCheck from "./OrganisationAuthCheck";

export default async function OrganisationLayout({ children }: { children: React.ReactNode }) {
  return <OrganisationAuthCheck>{children}</OrganisationAuthCheck>;
}
