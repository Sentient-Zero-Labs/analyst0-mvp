import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReactNode } from "react";
import { FaCheck } from "react-icons/fa6";
import Footer from "../_components/landing-page/footer";

export default function PricingPage() {
  return (
    <div>
      <section className="container-section text-center bg-muted">
        <h1 className="text-4xl lg:text-5xl font-semibold">Analyst Zero Pricing</h1>
        <p className="text-base lg:text-lg text-muted-foreground">
          We are currently in the beta phase. We are offering a free plan to all users.
        </p>
      </section>
      <section className="container-section flex gap-2 justify-center md:flex-row flex-col">
        <PricingCard
          subTitle="Free"
          title="Free Plan"
          features={[
            "Unlimited projects",
            "Connect to your database",
            "20 Daily Credits (Claude Sonnet 3.5 Class)",
            "100 Daily Credits (GPT-4o Mini Class)",
            "Approx. 10 chat questions",
            "Approx. 120 SQL playground questions",
            "AI-powered context generation (Small Model)",
          ]}
          footer={
            <Link href="/auth/signup" className="mt-4 w-full">
              <Button className="w-full">Get Started</Button>
            </Link>
          }
        />

        <div className="flex flex-col gap-2 border rounded-lg p-4 w-full md:w-96">
          <div className="flex items-center justify-center flex-col">
            <span className="text-sm text-muted-foreground">Coming Soon</span>
            <h2 className="text-3xl lg:text-4xl font-semibold">Premium Plan</h2>
          </div>
          <div className="text-3xl text-foreground/70 space-y-3 text-center h-full mt-28">Coming Soon</div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

const PricingCard = ({
  subTitle,
  title,
  features,
  footer,
}: {
  subTitle: string;
  title: string;
  features: string[];
  footer: ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-2 border rounded-lg p-4 w-full md:w-96">
      <div className="flex items-center justify-center flex-col">
        <span className="text-sm text-muted-foreground">{subTitle}</span>
        <h2 className="text-3xl lg:text-4xl font-semibold">{title}</h2>
      </div>
      <ul className="text-base text-foreground/70 space-y-3 mt-4">
        {features.map((feature, index) => (
          <li className="flex items-start gap-2" key={index}>
            <FaCheck className="size-6 text-green-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {footer}
    </div>
  );
};
