"use client";

import Link from "next/link";
import { LuCheck, LuLogOut } from "react-icons/lu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSelectedOrganisation } from "@/lib/store/global-store";
import { CustomUser } from "@/lib/auth/custom-auth";
import { signOut } from "next-auth/react";
import { RiAccountCircleLine } from "react-icons/ri";
import { ThemeToggle } from "@/components/ui/theme";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useOrganisationListQuery } from "@/services/organisation/organisation.service";
import { useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { isArrayNotEmpty } from "@/lib/utils/array.utils";
import { OrganisationListResponseItem } from "@/services/organisation/organisation.schema";

// function AddNewDropdown({ selectedOrganisation }: { selectedOrganisation: OrganisationListResponseItem | null }) {
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="outline" size="icon" className="size-8">
//           <LuPlus className="size-5" />
//           <span className="sr-only">Add new</span>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end">
//         <DropdownMenuItem asChild>
//           <Link href={`/organisation/create`}>New Project</Link>
//         </DropdownMenuItem>
//         {selectedOrganisation && (
//           <DropdownMenuItem asChild>
//             <Link href={`/organisation/${selectedOrganisation?.public_id}/charters/create`}>New Agent</Link>
//           </DropdownMenuItem>
//         )}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

function UserDropdown({
  user,
  organisations,
  selectedOrganisation,
  setSelectedOrganisation,
}: {
  user: CustomUser;
  organisations: OrganisationListResponseItem[];
  selectedOrganisation: OrganisationListResponseItem | null;
  setSelectedOrganisation: (org: OrganisationListResponseItem) => void;
}) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer size-9">
          <AvatarFallback className="hover:bg-foreground/10">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/account`} className="h-9">
            <RiAccountCircleLine />
            <span>Your Account</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <div className="flex flex-col gap-0.5 pt-1 px-2 w-56">
          <span className="text-xs font-semibold">Projects</span>
          {isArrayNotEmpty(organisations) ? (
            organisations?.map((organisation) => (
              <DropdownMenuItem
                key={organisation.public_id}
                className="px-1"
                onSelect={() => {
                  if (organisation.public_id !== selectedOrganisation?.public_id) {
                    router.push(`/organisation/${organisation.public_id}/chat`);
                    setSelectedOrganisation(organisation);
                  }
                }}
              >
                {organisation.name}
                {organisation.public_id === selectedOrganisation?.public_id && <LuCheck className="ml-auto" />}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem>
              <span>No projects found</span>
            </DropdownMenuItem>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="p-0 h-9">
          <ThemeToggle />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="h-9">
          <div
            onClick={() => {
              signOut({ redirectTo: "/" });
            }}
          >
            <LuLogOut />
            <span>Log out</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function OrganisationHeader({ user }: { user?: CustomUser }) {
  const { selectedOrganisation, setSelectedOrganisation } = useSelectedOrganisation();
  // const { selectedCharter, setSelectedCharter } = useSelectedCharter();

  // const { data: charters } = useChartersListQuery({ organisationPublicId: selectedOrganisation?.public_id });

  const { data: organisations } = useOrganisationListQuery();

  const { organisationPublicId } = useParams();

  useEffect(() => {
    if (organisations && organisations.length > 0 && !selectedOrganisation) {
      if (organisationPublicId) {
        const organisation = organisations.find((o) => o.public_id === organisationPublicId);
        if (organisation) {
          setSelectedOrganisation(organisation);
        }
      } else {
        setSelectedOrganisation(organisations[0]);
      }
    }
  }, [organisations, organisationPublicId]);

  // useEffect(() => {
  //   if (charters && charters.length > 0 && !selectedCharter) {
  //     console.log("setting charter header", charters[0].id);
  //     setSelectedCharter(charters[0]);
  //   }
  // }, [charters]);

  return (
    <div className="sticky top-0 z-50">
      <header className="h-[var(--height-header)] border-b z-10 w-full flex py-1 items-center justify-between px-2 bg-background">
        <SidebarTrigger />
        {user ? (
          <div className="flex items-center space-x-4">
            {/* <AddNewDropdown selectedOrganisation={selectedOrganisation} /> */}
            <UserDropdown
              user={user}
              organisations={organisations || []}
              selectedOrganisation={selectedOrganisation}
              setSelectedOrganisation={setSelectedOrganisation}
            />
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Button variant={"outline"}>
              <Link href="/auth/signin">Sign in</Link>
            </Button>
            <Button>
              <Link href="/auth/signup">Sign up</Link>
            </Button>
          </div>
        )}
      </header>
    </div>
  );
}
