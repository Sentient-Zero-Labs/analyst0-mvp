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
import { useOrganisationUsersQuery, useRemoveUserFromOrganisationMutation } from "@/services/organisation/organisation.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LuTrash2 } from "react-icons/lu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function UsersList({ organisationPublicId }: { organisationPublicId: string }) {
  const { data: users, isLoading, error } = useOrganisationUsersQuery(organisationPublicId);
  const removeUserMutation = useRemoveUserFromOrganisationMutation(organisationPublicId);
  const [userToRemove, setUserToRemove] = useState<number | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRemoveUser = async () => {
    if (!userToRemove) return;

    setIsRemoving(true);
    try {
      await removeUserMutation.mutateAsync(userToRemove);
      queryClient.invalidateQueries({ queryKey: ["organisation-users", organisationPublicId] });
      toast({
        title: "User removed successfully",
        description: "The user has been removed from the organization.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error removing user",
        description: error instanceof Error ? error.message : "An error occurred while removing the user.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
      setUserToRemove(null);
    }
  };

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
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
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
              <TableCell>
                {user.role !== "admin" && (
                  <AlertDialog open={userToRemove === user.user_id} onOpenChange={(open: boolean) => !open && setUserToRemove(null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setUserToRemove(user.user_id)}
                        title="Remove user"
                      >
                        <LuTrash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove this user from the organization? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            handleRemoveUser();
                          }}
                          disabled={isRemoving}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isRemoving ? "Removing..." : "Remove"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
