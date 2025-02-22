"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LuMenu } from "react-icons/lu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LuChevronDown } from "react-icons/lu";

export default function LandingPageHeader() {
  const pathname = usePathname();

  const isTrySuprAnalyst = pathname.startsWith("/try-supr-analyst");
  const isDocs = pathname.startsWith("/docs");

  return (
    <div
      className={cn(
        "sticky top-0 border-b bg-background w-full flex items-center justify-between px-2 z-20",
        isTrySuprAnalyst ? "static h-12" : isDocs ? "h-12" : "md:px-10 h-14"
      )}
    >
      <Link href={`/`} className="flex items-center shrink-0">
        <div className={`relative object-contain ${isTrySuprAnalyst ? "size-7" : "size-8"}`}>
          <Image src="/logo.svg" alt="Analyst Zero" className="object-contain" fill />
        </div>
        <span className={`${isTrySuprAnalyst ? "md:text-xl" : !isDocs && "md:text-2xl"} text-xl font-semibold`}>
          Analyst Zero
        </span>
      </Link>

      <div className="hidden md:flex items-center space-x-2">
        <div className="space-x-2 mr-10 flex items-center">
          {/* Products */}
          {false && <ProductsDropdown />}

          {/* Get Started */}
          <Button variant="ghost" className="text-base text-foreground/80">
            <Link href="/docs/get-started/setup">Get Started</Link>
          </Button>

          {/* Pricing */}
          <Button variant="ghost" className="text-base text-foreground/80">
            <Link href="/pricing">Pricing</Link>
          </Button>
        </div>
        <Button variant={"outline"}>
          <Link href="/auth/signin">Sign in</Link>
        </Button>
        <Button>
          <Link href="/contact-us">Contact Sales</Link>
        </Button>
      </div>

      <MobileMenu />
    </div>
  );
}

const ProductsDropdown = () => (
  <div className="relative">
    <Button variant="ghost" className="group dropdown-menu-trigger flex items-center text-base">
      Products{" "}
      <LuChevronDown className="ml-1 h-4 w-4 transition duration-200 group-hover:rotate-180 text-foreground/80" />
    </Button>
    <div className="absolute -right-full top-full dropdown-menu-hover z-50">
      <div className="pt-2">
        <div className="w-[400px] rounded-sm border bg-popover p-2 text-popover-foreground shadow-md">
          <div className="flex flex-col gap-1">
            <div className="p-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="font-medium">For Data Teams</span>
                <div className="size-6 relative">
                  <Image src="/landing-page/data-team.svg" alt="Analyst Zero" className="object-contain" fill />
                </div>
              </div>
              <span className="block text-2sm text-muted-foreground">
                Check how Analyst Zero can help data teams write complex SQL in minutes using Smart AI Editor
              </span>
            </div>
            <div className="p-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="font-medium">For Sales and Marketing Teams</span>
                <div className="size-6 relative">
                  <Image src="/landing-page/marketing-team.svg" alt="Analyst Zero" className="object-contain" fill />
                </div>
              </div>
              <span className="block text-2sm text-muted-foreground">
                Check how Analyst Zero can help empower sales and marketing teams by asking questions in plain English
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MobileMenu = () => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon" className="md:hidden">
        <LuMenu className="h-5 w-5" />
      </Button>
    </SheetTrigger>
    <SheetContent side="right" className="w-[300px] py-3 px-4">
      <SheetTitle>
        <Link href={`/`} className="flex items-center">
          <div className="relative size-7 object-contain">
            <Image src="/logo.svg" alt="Analyst Zero" className="object-contain" fill />
          </div>
          <span className="md:text-xl text-xl font-semibold">Analyst Zero</span>
        </Link>
      </SheetTitle>
      <div className="flex flex-col gap-6 mt-8 h-full">
        {/* Products */}
        {false && (
          <Accordion type="single" collapsible>
            <AccordionItem className="border-none" value="products">
              <AccordionTrigger className="text-lg py-0">Products</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4 pl-1 mt-2">
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">For Data Teams</span>
                      <div className="size-6 relative">
                        <Image src="/landing-page/data-team.svg" alt="Analyst Zero" className="object-contain" fill />
                      </div>
                    </div>{" "}
                    <p className="text-2sm text-muted-foreground">
                      Check how Analyst Zero can help data teams write complex SQL in minutes using Smart AI Editor
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">For Sales and Marketing Teams</span>
                      <div className="size-6 relative">
                        <Image
                          src="/landing-page/marketing-team.svg"
                          alt="Analyst Zero"
                          className="object-contain"
                          fill
                        />
                      </div>
                    </div>{" "}
                    <p className="text-2sm text-muted-foreground">
                      Check how Analyst Zero can help empower sales and marketing teams by asking questions in plain
                      English
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Get Started */}
        <SheetClose asChild>
          <Link href="/docs/get-started/setup" className="font-medium">
            <span className="mr-2 text-lg">Get Started</span>
          </Link>
        </SheetClose>

        {/* Pricing */}
        <SheetClose asChild>
          <Link href="/pricing" className="font-medium">
            <span className="mr-2 text-lg">Pricing</span>
          </Link>
        </SheetClose>
        <div className="h-full flex flex-col justify-end pb-14 gap-3">
          <Link href="/auth/signin" className="mt-auto">
            <Button variant="outline" className="w-full justify-start">
              Sign in
            </Button>
          </Link>
          <Link href="/contact-us">
            <Button className="w-full justify-start">Contact Sales</Button>
          </Link>
        </div>
      </div>
    </SheetContent>
  </Sheet>
);
