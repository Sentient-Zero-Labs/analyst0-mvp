"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CharterMetric,
  CharterMetricCreate,
  CharterMetricCreateSchema,
  CharterMetricUpdateSchema,
} from "@/services/charterMetric/charterMetric.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  useUpdateMetricMutation,
  useCreateMetricMutation,
  useDescribeMetricMutation,
} from "@/services/charterMetric/charterMetric.service";
import { CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import GenerateDescriptionModal from "./GenerateDescriptionModal";
import { useDataEntitiesForCharterQuery } from "@/services/dataEntity/dataEntity.service";
import DeleteCharterMetricButton from "./DeleteCharterMetricButton";

interface MetricFormProps {
  charterMetric?: CharterMetric;
  charterId: number;
  organisationPublicId: string;
}

export function CharterMetricForm({ charterMetric, charterId, organisationPublicId }: MetricFormProps) {
  const router = useRouter();
  const isCreateMode = !charterMetric;

  const form = useForm<CharterMetricCreate | CharterMetric>({
    resolver: zodResolver(isCreateMode ? CharterMetricCreateSchema : CharterMetricUpdateSchema),
    defaultValues: charterMetric || {
      name: "",
      abbreviation: "",
      description: "",
    },
  });

  const { data: dataEntities } = useDataEntitiesForCharterQuery({
    organisationPublicId,
    charterId,
  });

  useEffect(() => {
    form.reset(charterMetric);
  }, [charterMetric, form]);

  const createMetricMutation = useCreateMetricMutation(organisationPublicId, charterId);
  const updateMetricMutation = useUpdateMetricMutation(organisationPublicId, charterId);

  const { mutateAsync: describeMetricMutation } = useDescribeMetricMutation(organisationPublicId, charterId);

  const onClickGenerateDescription = async ({ dataEntityIds }: { dataEntityIds: number[] }) => {
    try {
      const description = await describeMetricMutation({
        name: form.getValues("name"),
        abbreviation: form.getValues("abbreviation"),
        data_entity_ids: dataEntityIds,
      });
      form.setValue("description", description.description, { shouldDirty: true });
    } catch (error) {
      console.error("Error generating description:", error);
      toast.error("Error generating description");
    }
  };

  const onSubmit = (data: CharterMetricCreate | CharterMetric) => {
    if (isCreateMode) {
      createMetricMutation.mutate(data as CharterMetricCreate, {
        onSuccess: (createdMetric) => {
          form.reset();
          toast.success("Metric created successfully");
          router.refresh();
          router.push(
            `/organisation/${organisationPublicId}/charters/${charterId}/metrics/${createdMetric.id}/examples/create`
          );
        },
        onError: (error) => {
          console.error("Error creating metric:", error);
          toast.error("Error creating metric");
        },
      });
    } else {
      updateMetricMutation.mutate(data as CharterMetric, {
        onSuccess: () => {
          toast.success("Metric updated successfully");
          router.refresh();
          router.push(`/organisation/${organisationPublicId}/charters/${charterId}/metrics`);
        },
        onError: (error) => {
          console.error("Error updating metric:", error);
          toast.error("Error updating metric");
        },
      });
    }
  };

  const isPending = isCreateMode ? createMetricMutation.isPending : updateMetricMutation.isPending;

  return (
    <div className="container-dashboard mx-auto p-4 flex flex-col gap-4">
      <div>
        <CardTitle>{isCreateMode ? "Create" : "Edit"} Data Agent Metric</CardTitle>
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
                  <Input {...field} placeholder="Metric Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="abbreviation"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Abbreviation</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Metric Abbreviation" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <div className="flex gap-2 items-center">
                  <FormLabel>Description</FormLabel>
                </div>
                <FormControl>
                  <Textarea {...field} placeholder="Metric Description" className="min-h-48" />
                </FormControl>
                <div className="pt-1">
                  <GenerateDescriptionModal
                    dataEntities={dataEntities}
                    metricName={form.getValues("name")}
                    metricAbbreviation={form.getValues("abbreviation")}
                    handleGenerateDescription={onClickGenerateDescription}
                  />
                </div>

                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3">
            {!isCreateMode && (
              <DeleteCharterMetricButton
                organisationPublicId={organisationPublicId}
                charterId={charterId}
                charterMetricId={charterMetric.id}
                charterMetricName={charterMetric.name}
              />
            )}
            <Button type="submit" disabled={isPending || !form.formState.isDirty}>
              {isPending ? "Saving..." : isCreateMode ? "Create Metric" : "Update Metric"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
