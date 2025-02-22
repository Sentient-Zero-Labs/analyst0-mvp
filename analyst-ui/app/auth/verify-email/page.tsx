"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResendEmailVerificationSchema } from "@/services/auth/auth.schema";
import { useResendEmailVerificationMutation, useVerifyEmailMutation } from "@/services/auth/auth.service";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function VerifyEmailToken({ searchParams }: { searchParams: { token: string } }) {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const { mutateAsync: verifyEmailToken } = useVerifyEmailMutation();
  const { mutateAsync: resendEmailVerification } = useResendEmailVerificationMutation();

  const [emailVerificationStatus, setEmailVerificationStatus] = useState<
    "verifying" | "success" | "expired" | "error" | "resending" | "sent" | "resendError"
  >("verifying");

  const verifyEmail = async (token: string) => {
    try {
      await verifyEmailToken(token);
      setEmailVerificationStatus("success");
      setTimeout(() => {
        router.push("/auth/signin");
      }, 1000);
    } catch (error) {
      if (error instanceof Error && error.message.includes("expired")) {
        setEmailVerificationStatus("expired");
      } else {
        setEmailVerificationStatus("error");
      }
    }
  };

  const handleResendEmailVerification = async () => {
    setEmailVerificationStatus("resending");
    try {
      ResendEmailVerificationSchema.parse({ email });
      await resendEmailVerification({ email });
      setEmailVerificationStatus("sent");
      setEmail("");
    } catch (error) {
      if (error instanceof Error && error.message.includes("Validation")) {
        toast.error("Please enter a valid email address.");
      } else {
        setEmailVerificationStatus("resendError");
      }
    }
  };

  useEffect(() => {
    if (searchParams.token) verifyEmail(searchParams.token);
  }, [verifyEmailToken, searchParams.token]);

  return (
    <div className="container-dashboard flex h-[80vh] items-center justify-center">
      {emailVerificationStatus === "verifying" && "Verifying your email...Please wait."}
      {emailVerificationStatus === "success" && "Your email has been verified successfully."}
      {emailVerificationStatus === "error" && "An error occurred while verifying your email."}

      {["resending", "expired", "sent", "resendError"].includes(emailVerificationStatus) && (
        <div>
          <span>
            Your email verification link has <span className="font-bold">expired</span>. Please enter your email below
            to resend the verification email.
          </span>
          <div className="flex md:flex-row items-center justify-center gap-2 flex-col mt-1">
            <Input
              placeholder="Enter your email"
              className="md:w-72 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={["resending", "sent"].includes(emailVerificationStatus)}
            />

            <Button onClick={handleResendEmailVerification} disabled={email?.length === 0}>
              {emailVerificationStatus === "resending" ? "Resending Email..." : "Resend Verification"}
            </Button>
          </div>
          {emailVerificationStatus === "sent" && (
            <div className="font-semibold text-center w-full text-green-700">
              A verification email has been sent to your email address. Please check your inbox.
            </div>
          )}
          {emailVerificationStatus === "resendError" && (
            <div className="font-semibold text-center w-full text-red-700">
              There was an error resending your verification email.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
