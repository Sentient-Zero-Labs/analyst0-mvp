"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { OrganisationUserAdd, OrganisationUserAddSchema } from "@/services/organisation/organisation.schema";
import { useAddUserToOrganisationMutation } from "@/services/organisation/organisation.service";
import { useToast } from "@/components/ui/use-toast";

export default function AddUserForm({ organisationPublicId }: { organisationPublicId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const addUserMutation = useAddUserToOrganisationMutation(organisationPublicId);

  const form = useForm<OrganisationUserAdd>({
    resolver: zodResolver(OrganisationUserAddSchema),
    defaultValues: {
      email: "",
      role: "user",
    },
  });

  const onSubmit = async (data: OrganisationUserAdd) => {
    setIsSubmitting(true);
    try {
      await addUserMutation.mutateAsync(data);
      queryClient.invalidateQueries({ queryKey: ["organisation-users", organisationPublicId] });
      toast({
        title: "User added successfully",
        description: `${data.email} has been added to the organization.`,
      });
      form.reset();
    } catch (error: unknown) {
      toast({
        title: "Error adding user",
        description: error instanceof Error ? error.message : "An error occurred while adding the user.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add User"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
