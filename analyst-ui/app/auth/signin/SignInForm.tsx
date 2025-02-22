"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { signIn } from "@/lib/auth/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ResendEmailVerification,
  ResendEmailVerificationSchema,
  SignIn,
  SignInSchema,
} from "@/services/auth/auth.schema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useResendEmailVerificationMutation } from "@/services/auth/auth.service";
import { toast } from "sonner";

export default function SignInForm() {
  const router = useRouter();
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [verificationEmailResendStatus, setVerificationEmailResendStatus] = useState<
    "idle" | "success" | "error" | "sending"
  >("idle");

  const form = useForm({
    resolver: zodResolver(isEmailVerified ? SignInSchema : ResendEmailVerificationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutateAsync: resendEmailVerification } = useResendEmailVerificationMutation();

  const onSubmit = async (data: SignIn) => {
    setIsLoggingIn(true);
    try {
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      router.push("/");

      setTimeout(() => {
        location.reload();
      }, 500);
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes("not verified")) {
        setIsEmailVerified(false);
      } else if (error instanceof Error && error.message.toLowerCase().includes("incorrect")) {
        toast.error("Invalid email or password.");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const onResendEmailVerification = async (data: ResendEmailVerification) => {
    setVerificationEmailResendStatus("sending");
    try {
      await resendEmailVerification(data);
      form.reset();
      setVerificationEmailResendStatus("success");
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes("validation")) {
        toast.error("Please enter a valid email address.");
      } else {
        toast.error("Something went wrong");
      }
      setVerificationEmailResendStatus("error");
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex justify-center items-center h-[80vh]"
        onSubmit={form.handleSubmit(isEmailVerified ? onSubmit : onResendEmailVerification)}
      >
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground/70 flex flex-col gap-0.5">
              <span>
                Hi, Welcome to <span className="font-semibold">Analyst Zero!</span>
              </span>
              <span className="text-sm text-foreground/60">Your AI data analyst assistant</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1 w-full">
                    <FormControl>
                      <Input {...field} placeholder="Email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEmailVerified ? (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1 w-full">
                      <FormControl>
                        <Input {...field} placeholder="Password" type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <span className="text-sm text-blue-500 -mt-3">
                  {verificationEmailResendStatus === "success"
                    ? "Verification Email sent successfully! Please check your inbox."
                    : "Please verify your email to sign in."}
                </span>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <span className="text-sm text-foreground/50">
              Want to onboard your company?{" "}
              <Link href="/contact-us" className="hover:text-foreground/70">
                Contact Us
              </Link>
            </span>
            <Button
              type="submit"
              className="w-full"
              disabled={verificationEmailResendStatus === "sending" || isLoggingIn}
            >
              {isEmailVerified
                ? isLoggingIn
                  ? "Signing in..."
                  : "Sign In"
                : verificationEmailResendStatus === "sending"
                ? "Sending..."
                : "Resend Email Verification"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
