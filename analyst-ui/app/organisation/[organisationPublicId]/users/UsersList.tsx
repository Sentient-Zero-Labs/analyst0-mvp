"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useOrganisationUsersQuery } from "@/services/organisation/organisation.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersList({ organisationPublicId }: { organisationPublicId: string }) {
  const { data: users, isLoading, error } = useOrganisationUsersQuery(organisationPublicId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading users: {error.message}</div>;
  }

  if (!users || users.length === 0) {
    return <div className="text-muted-foreground">No users found in this organization.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.user_email}</TableCell>
            <TableCell>
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role === "admin" ? "Admin" : "User"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
