import { CardDescription, CardTitle } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-4">
      <div className="flex flex-col">
        <CardTitle className="text-lg">Billing</CardTitle>
        <CardDescription>
          <span>Manage your billing and subscription.</span>
        </CardDescription>
      </div>
      <div className="flex flex-col gap-4 w-full items-center h-[50vh] justify-center">
        <p className="text-3xl">Your organisation is currently on a free pilot plan.</p>
      </div>
    </div>
  );
}
