import { CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Label } from "@/components/ui/label";

export default async function AccountPage() {
  const session = await getSession();

  if (!session) return redirect("/auth/signin");

  const user = session.user;

  return (
    <div className="container-dashboard  mx-auto p-3 flex flex-col gap-4">
      <CardTitle>Your Account</CardTitle>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Label className="text-base font-semibold text-muted-foreground">Your Email: </Label>
          <span>{user?.email}</span>
        </div>
      </div>
    </div>
  );
}
