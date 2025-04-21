import { CardDescription, CardTitle } from "@/components/ui/card";
import BreadCrumbComponent from "@/app/_components/bread-crumb-component";
import AddUserForm from "./AddUserForm";
import UsersList from "./UsersList";

export default function OrganisationUsersPage({
  params: { organisationPublicId },
}: {
  params: { organisationPublicId: string };
}) {
  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <BreadCrumbComponent
          items={[
            { name: "Projects", link: `/organisation/${organisationPublicId}/projects` },
            { name: "Users" },
          ]}
        />
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg">Organization Users</CardTitle>
          <CardDescription>Manage users in your organization</CardDescription>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Current Users</h2>
            <UsersList organisationPublicId={organisationPublicId} />
          </div>
        </div>
        <div>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Add New User</h2>
            <p className="text-sm text-muted-foreground">
              Add a new user to your organization. The user must have an account before they can be added.
            </p>
            <AddUserForm organisationPublicId={organisationPublicId} />
          </div>
        </div>
      </div>
    </div>
  );
}
