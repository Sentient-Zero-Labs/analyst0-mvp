"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DataSourceCreate,
  DataSourceCreateSchema,
  DataSourceUpdate,
  DataSourceUpdateSchema,
  DataSourceTypeSchema,
  DataSource,
  DataSourceType,
} from "@/services/dataSource/dataSource.schema";
import { useCreateDataSourceMutation, useUpdateDataSourceMutation } from "@/services/dataSource/dataSource.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import PostgresConfigForm from "./PostgresConfigForm";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import MySQLConfigForm from "./MySQLConfigForm";
import { capitalize } from "@/lib/utils";
import SQLiteConfigForm from "./SQLiteConfigForm";
import SnowflakeConfigForm from "./SnowflakeConfigForm";

export default function DataSourceForm({
  organisationPublicId,
  dataSource,
}: {
  organisationPublicId: string;
  dataSource?: DataSource;
}) {
  const router = useRouter();
  const isCreateMode = !dataSource;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DataSourceCreate | DataSourceUpdate>({
    resolver: zodResolver(isCreateMode ? DataSourceCreateSchema : DataSourceUpdateSchema),
    defaultValues: dataSource || {
      name: "",
      type: "postgres",
      config: {},
    },
  });

  const createDataSourceMutation = useCreateDataSourceMutation({ organisationPublicId });
  const updateDataSourceMutation = useUpdateDataSourceMutation({
    organisationPublicId,
    dataSourceId: dataSource?.id,
  });

  const onSubmit = async (data: DataSourceCreate | DataSourceUpdate) => {
    setIsSubmitting(true);
    try {
      if (isCreateMode) {
        const dataSource = await createDataSourceMutation.mutateAsync(data as DataSourceCreate);
        form.reset();
        toast.success("Data source created successfully");
        router.refresh();
        router.push(`/organisation/${organisationPublicId}/data-sources/${dataSource.id}/data-entities`);
      } else {
        await updateDataSourceMutation.mutateAsync(data as DataSourceUpdate);
        form.reset();
        toast.success("Data source updated successfully");
        router.refresh();
        router.push(`/organisation/${organisationPublicId}/data-sources`);
      }
    } catch (error) {
      console.error("Error handling data source:", error);
      toast.error(
        isCreateMode
          ? "Error creating data source. Please verify your data source credentials and try again."
          : "Error updating data source. Please verify your data source credentials and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const dataSourceType = form.watch("type");

  return (
    <div className="flex flex-col w-full h-full pb-10 gap-2">
      <Form {...form}>
        <form className="flex flex-col gap-2" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex justify-between items-center sticky top-0 bg-background z-10 py-2">
            <div className="flex flex-col gap-1">
              <CardTitle>{isCreateMode ? "Create" : "Edit"} Data Source</CardTitle>
              <CardDescription>Add a data source to your organisation</CardDescription>
            </div>
            <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
              {isSubmitting
                ? "Saving..."
                : isCreateMode
                ? `Add ${capitalize(dataSourceType)} Connection`
                : `Update ${capitalize(dataSourceType)} Connection`}
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-1">Data Source Details</h3>
            <div className="p-4 pb-5 border rounded-md shadow-sm bg-muted/50 space-y-3">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Database Type*</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          form.setValue("type", value as DataSourceType);
                          field.onChange(value);
                        }}
                        value={field.value}
                        className="flex flex-row items-center gap-3"
                      >
                        {DataSourceTypeSchema.options
                          // Only show SQLite if benchmarking is enabled. SQLite is not supported if not benchmarking.
                          .filter((type) => type !== "sqlite" || process.env.NEXT_PUBLIC_IS_BENCHMARKING_ENABLED)
                          .map((type) => (
                            <FormItem key={type} className="space-y-0">
                              <FormControl>
                                <RadioGroupItem value={type} className="peer hidden" />
                              </FormControl>
                              <FormLabel
                                className={`flex h-9 cursor-pointer items-center gap-1 rounded-md border p-2 font-normal ${
                                  field.value === type ? "bg-foreground/15" : "hover:bg-foreground/5"
                                }`}
                              >
                                <div className="flex flex-row items-center gap-1">
                                  <Image src={`/data-sources/${type}-icon.svg`} alt={type} width={20} height={20} />
                                  <span className="whitespace-nowrap capitalize">{type}</span>
                                </div>
                              </FormLabel>
                            </FormItem>
                          ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Name*</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Data Source Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-1">{capitalize(dataSourceType)} Configuration</h3>
            <div className="grid grid-cols-2 gap-6 border rounded-md shadow-sm p-4 pb-5 bg-muted/50">
              {dataSourceType === "postgres" && <PostgresConfigForm control={form.control} />}
              {dataSourceType === "mysql" && <MySQLConfigForm control={form.control} />}
              {dataSourceType === "sqlite" && <SQLiteConfigForm control={form.control} />}
              {dataSourceType === "snowflake" && <SnowflakeConfigForm control={form.control} />}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
