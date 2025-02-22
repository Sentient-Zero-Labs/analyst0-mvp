import { CardDescription, CardTitle } from "@/components/ui/card";
import { getOrganisationUsage } from "@/services/organisationUsage/organisationUsage.service";
import { getSession } from "@/lib/auth/session";

export default async function BillingPage({ params }: { params: { organisationPublicId: string } }) {
  const session = await getSession();
  const accessToken = session?.accessToken;

  const organisationUsage = await getOrganisationUsage(params.organisationPublicId, accessToken!);

  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-4">
      <div className="flex flex-col">
        <CardTitle className="text-lg">Account</CardTitle>
        <CardDescription>
          <span>Manage your organisation</span>
        </CardDescription>
      </div>
      <div className="flex flex-col gap-4 w-full items-center h-[50vh] justify-center">
        <p className="text-3xl">Organisation Account Details (Free Tier)</p>
        <div className="flex gap-4">
          <div className="rounded-md p-4 bg-muted">
            <p className="text-lg">Daily Small Model Credit Usage</p>
            <p className="text-xl text-center mt-2 font-semibold">
              {organisationUsage.daily_small_credit_count}/{organisationUsage.daily_small_credit_limit}
            </p>
          </div>

          <div className="rounded-md p-4 bg-muted">
            <p className="text-lg">Daily Large/Premium Model Credit Usage</p>
            <p className="text-xl text-center mt-2 font-semibold">
              {organisationUsage.daily_large_credit_count}/{organisationUsage.daily_large_credit_limit}
            </p>
          </div>
        </div>
        <p>
          To increase your credit limit, please mail us at{" "}
          <span className="font-semibold">support@supranalyst.com</span>
        </p>
      </div>
    </div>
  );
}
