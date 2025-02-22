"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUp, SignUpSchema } from "@/services/auth/auth.schema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useUserCreateMutation } from "@/services/auth/auth.service";
import Link from "next/link";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const router = useRouter();

  const { mutateAsync: createUser } = useUserCreateMutation();

  const form = useForm<SignUp>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUp) => {
    const result = await createUser({ email: data.email, password: data.password });

    if (!result) {
      toast.error("There was an error creating your account. Please try again.");
      return;
    }

    toast.success("Verification email sent. Please check your email and verify your account.");

    router.push("/auth/signin");
  };

  return (
    <Form {...form}>
      <form className="flex justify-center items-center h-[80vh]" onSubmit={form.handleSubmit(onSubmit)}>
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-1 w-full">
                    <FormControl>
                      <Input {...field} placeholder="Confirm Password" type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <span className="text-sm text-foreground/50">
              Already have an account?{" "}
              <Link href="/auth/signin" className="hover:text-foreground/70">
                Sign in
              </Link>
            </span>
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
