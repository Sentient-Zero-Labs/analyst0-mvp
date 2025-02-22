import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import SignInForm from "./SignInForm";
import Footer from "@/app/_components/landing-page/footer";

export default async function SignInPage() {
  const session = await getSession();

  if (session?.accessToken) redirect("/");

  return (
    <>
      <SignInForm />
      <Footer />
    </>
  );
}
