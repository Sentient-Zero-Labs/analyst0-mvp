import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import SignInForm from "./SignInForm";
import Footer from "@/app/_components/landing-page/footer";

export default async function SignInPage() {
  const session = await getSession();

  // If we have a valid session (which means either the token is valid
  // or was successfully refreshed), redirect to home
  if (session?.accessToken) {
    redirect("/");
  }

  return (
    <>
      <SignInForm />
      <Footer />
    </>
  );
}
