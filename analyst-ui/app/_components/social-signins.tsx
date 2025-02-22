import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function SocialSignIns() {
  const onGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };
  return (
    <div className="w-full">
      <Button
        onClick={onGoogleSignIn}
        type="button"
        className="w-full dark:bg-blue-900 text-white dark:hover:bg-blue-800 bg-blue-800 hover:bg-blue-900"
      >
        Sign In with Google
      </Button>
    </div>
  );
}
