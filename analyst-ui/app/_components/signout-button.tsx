import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function SignoutButton() {
  return <Button onClick={() => signOut()}>Sign Out</Button>;
}
