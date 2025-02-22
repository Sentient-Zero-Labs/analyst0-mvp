"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  OrganisationCreate,
  OrganisationCreateSchema,
  OrganisationUpdate,
  OrganisationUpdateSchema,
} from "@/services/organisation/organisation.schema";
import {
  useCreateOrganisationMutation,
  useUpdateOrganisationMutation,
} from "@/services/organisation/organisation.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { Organisation } from "@/services/organisation/organisation.schema";
import { useQueryClient } from "@tanstack/react-query";
import { useSelectedOrganisation } from "@/lib/store/global-store";

export default function OrganisationForm({ organisation }: { organisation?: Organisation }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setSelectedOrganisation } = useSelectedOrganisation();
  const isCreateMode = !organisation;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrganisationCreate | OrganisationUpdate>({
    resolver: zodResolver(isCreateMode ? OrganisationCreateSchema : OrganisationUpdateSchema),
    defaultValues: organisation || {
      name: "",
    },
  });

  const { mutateAsync: createOrganisation } = useCreateOrganisationMutation();
  const { mutateAsync: updateOrganisation } = useUpdateOrganisationMutation();

  const onSubmit = async (data: OrganisationCreate | OrganisationUpdate) => {
    setIsSubmitting(true);
    try {
      if (isCreateMode) {
        const createdOrg = await createOrganisation(data as OrganisationCreate);
        queryClient.invalidateQueries({ queryKey: ["organisations"] });

        setSelectedOrganisation({
          ...createdOrg,
          is_slack_bot_enabled: false,
          data_source_count: 0,
          user_role: "admin",
        });

        toast.success("Project created successfully");
        router.push(`/organisation/${createdOrg.public_id}/data-sources/create`);
      } else {
        await updateOrganisation({ ...data, id: organisation!.id } as OrganisationUpdate);
        queryClient.invalidateQueries({ queryKey: ["organisations"] });
        toast.success("Project updated successfully");
      }
    } catch (error) {
      console.error("Error handling project:", error);
      toast.error(isCreateMode ? "Error creating project" : "Error updating project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full justify-center h-[80vh]">
      <div className="mx-auto p-4 flex flex-col gap-4 w-96 border rounded-md bg-card">
        <div className="flex flex-col gap-2">
          <CardTitle>{isCreateMode ? "Create" : "Edit"} Project</CardTitle>
          <CardDescription>Add the name of your project</CardDescription>
        </div>
        <Form {...form}>
          <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Project Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                {isSubmitting ? "Saving..." : isCreateMode ? "Create Project" : "Update Project"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
