import { getSession } from "@/lib/auth/session";
import SignUpForm from "./SignUpForm";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const session = await getSession();

  if (session?.accessToken) redirect("/");

  return <SignUpForm />;
}
