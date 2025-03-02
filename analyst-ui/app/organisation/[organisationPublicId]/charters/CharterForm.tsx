"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CharterResponse,
  CharterCreate,
  CharterCreateSchema,
  CharterUpdateSchema,
  CharterUpdate,
} from "@/services/charter/charter.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUpdateCharterMutation, useCreateCharterMutation } from "@/services/charter/charter.service";
import { useDataSourcesQuery } from "@/services/dataSource/dataSource.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataEntitiesQuery } from "@/services/dataEntity/dataEntity.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { LuExternalLink } from "react-icons/lu";
import { Badge } from "@/components/ui/badge";

interface CharterFormProps {
  charter?: CharterResponse;
  organisationPublicId: string;
}

export function CharterForm({ charter, organisationPublicId }: CharterFormProps) {
  const router = useRouter();

  const isCreateMode = !charter;

  const form = useForm<CharterCreate | CharterResponse>({
    resolver: zodResolver(isCreateMode ? CharterCreateSchema : CharterUpdateSchema),
    defaultValues: charter || {
      name: "",
      data_source_id: undefined,
      data_entity_ids: [],
      slack_channel_ids: [],
    },
  });

  useEffect(() => {
    form.reset(charter);
  }, [charter, form]);

  const { data: dataSources } = useDataSourcesQuery({ organisationPublicId });
  const [search, setSearch] = useState("");
  const [selectedSchemas, setSelectedSchemas] = useState<string[]>([]);

  const updateCharterMutation = useUpdateCharterMutation({
    organisationPublicId,
    charterId: charter?.id || 0,
  });

  const { data: dataEntities } = useDataEntitiesQuery({
    organisationPublicId: organisationPublicId,
    dataSourceId: form.watch("data_source_id"),
  });

  const uniqueSchemas = Array.from(new Set(dataEntities?.map((de) => de.schema_name) || [])).sort();

  const searchTerms = search.split(",").map((s) => s.trim());

  // Sort dataEntities so that all items that are already in form.watch("data_entity_ids") are at the top of the list
  const sortedDataEntities = form.formState.isDirty
    ? dataEntities
    : dataEntities?.sort((a, b) => {
        const aIsSelected = form.watch("data_entity_ids")?.includes(a.id);
        const bIsSelected = form.watch("data_entity_ids")?.includes(b.id);
        if (aIsSelected && !bIsSelected) {
          return -1;
        } else if (!aIsSelected && bIsSelected) {
          return 1;
        } else {
          return 0;
        }
      });

  const toggleSchema = (schema: string) => {
    setSelectedSchemas((prev) => (prev.includes(schema) ? prev.filter((s) => s !== schema) : [...prev, schema]));
  };

  const createCharterMutation = useCreateCharterMutation({ organisationPublicId });

  const onSubmit = (data: CharterCreate | CharterResponse) => {
    if (data.data_entity_ids?.length == 0) {
      toast.error("Please select at least one data entity to continue.");
      return;
    }

    if (isCreateMode) {
      createCharterMutation.mutate(data as CharterCreate, {
        onSuccess: () => {
          // Handle success (e.g., show a success message, reset form)
          form.reset();
          toast.success("Agent created successfully");
          router.refresh();
          setTimeout(() => router.push(`/organisation/${organisationPublicId}/charters`), 500);
        },
        onError: (error) => {
          // Handle error (e.g., show an error message)
          console.error("Error creating charter:", error);
          toast.error("Error creating charter");
        },
      });
    } else {
      updateCharterMutation.mutate(data as CharterUpdate, {
        onSuccess: () => {
          toast.success("Charter updated successfully");
          router.refresh();

          setTimeout(() => router.push(`/organisation/${organisationPublicId}/charters`), 500);
        },
        onError: (error) => {
          // Handle error (e.g., show an error message)
          console.error("Error updating charter:", error);
          toast.error("Error updating charter");
        },
      });
    }
  };

  const isPending = isCreateMode ? createCharterMutation.isPending : updateCharterMutation.isPending;

  return (
    <Form {...form}>
      <form className="flex flex-col" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex justify-between items-center sticky top-0 bg-background z-10 py-2">
          <div>
            <CardTitle>{isCreateMode ? "Create Data Agent" : "Edit Data Agent"}</CardTitle>
            <span className="text-sm text-foreground/60 italic">
              Data Agent is used to describe different data domains with their data entities and metrics.
            </span>
          </div>
          <div>
            <Button type="submit" disabled={isPending || !form.formState.isDirty}>
              {isPending ? "Saving..." : isCreateMode ? "Create Data Agent" : "Update Data Agent"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-8 mt-2">
          <div className="grid grid-cols-2 gap-8 items-end">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1 w-full">
                  <FormLabel>Name*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Data Agent Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_source_id"
              render={({ field }) => (
                <FormItem className="space-y-1 w-full">
                  <FormLabel>Data Source*</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? field.value.toString() : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a data source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dataSources?.map((dataSource) => (
                        <SelectItem className="cursor-pointer" key={dataSource.id} value={dataSource.id.toString()}>
                          {dataSource.name} ({dataSource.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="slack_channel_ids"
              render={({ field }) => (
                <FormItem className="space-y-1 w-full">
                  <FormLabel>Slack Channel IDs</FormLabel>
                  <FormDescription>
                    The Slack channel IDs where our slack bot will listen to mentions and replies.
                  </FormDescription>
                  <FormControl>
                    <Input
                      value={field.value?.join(",")}
                      onChange={(e) => {
                        const value = e.target.value;

                        const slackChannelIds = !!value ? value.split(",").map((id) => id.trim()) : [];
                        field.onChange(slackChannelIds);
                      }}
                      placeholder="Slack Channel IDs (comma separated)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
          </div>

          {/* Data Entities */}
          <FormField
            control={form.control}
            name="data_entity_ids"
            render={({ field }) => {
              return (
                <FormItem className="space-y-1 w-full">
                  <div className="flex justify-between items-center">
                    <FormLabel className="font-semibold">
                      Data Entities{" "}
                      <span className="text-sm font-medium text-foreground/60 italic">
                        (Select all data entities that you want to include in this charter)*
                      </span>
                    </FormLabel>
                    <Input
                      className="w-96 mb-1"
                      placeholder="Search data entity or schema (comma separated)"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  {/* Filter Schema */}
                  {sortedDataEntities && (
                    <div className="flex flex-row gap-2 flex-wrap pt-2 pb-1">
                      <span className="text-sm">Filter Schemas:</span>
                      {uniqueSchemas.map((schema: string) => (
                        <Badge
                          key={schema}
                          variant={selectedSchemas.includes(schema) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleSchema(schema)}
                        >
                          {schema}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <FormControl>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Select</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Schema</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-nowrap">View Entity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedDataEntities
                            ?.filter(
                              (dataEntiy) =>
                                (!selectedSchemas?.length || selectedSchemas.includes(dataEntiy.schema_name)) &&
                                (searchTerms.some((term) =>
                                  dataEntiy.name.toLowerCase().includes(term.toLowerCase())
                                ) ||
                                  searchTerms.some((term) =>
                                    dataEntiy.schema_name.toLowerCase().includes(term.toLowerCase())
                                  ))
                            )
                            .map((dataEntiy) => {
                              const isChecked = field.value?.includes(dataEntiy.id);

                              return (
                                <TableRow
                                  className="h-16 cursor-pointer"
                                  key={dataEntiy.id}
                                  onClick={() => {
                                    const checked = !isChecked;
                                    const updatedIds = checked
                                      ? [...(field.value || []), dataEntiy.id]
                                      : field.value?.filter((id) => id !== dataEntiy.id);
                                    field.onChange(updatedIds);
                                  }}
                                >
                                  <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={(checked) => {
                                        const updatedIds = checked
                                          ? [...(field.value || []), dataEntiy.id]
                                          : field.value?.filter((id) => id !== dataEntiy.id);
                                        field.onChange(updatedIds);
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>{dataEntiy.name}</TableCell>
                                  <TableCell>{dataEntiy.schema_name}</TableCell>

                                  <TableCell>
                                    <span className="line-clamp-2 break-all">
                                      {dataEntiy.description || (
                                        <span className="text-destructive">
                                          No description! Please add description for AI to understand data entity
                                          better.
                                        </span>
                                      )}
                                    </span>
                                  </TableCell>
                                  <TableCell className="w-16" onClick={(e) => e.stopPropagation()}>
                                    <Link
                                      href={`/organisation/${organisationPublicId}/data-sources/${dataEntiy.data_source_id}/data-entities/edit?dataEntityId=${dataEntiy.id}`}
                                      target="_blank"
                                      className="flex items-center gap-1 hover:underline cursor-pointer"
                                    >
                                      <span>View</span>
                                      <LuExternalLink className="w-3.5 h-3.5" />
                                    </Link>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
      </form>
    </Form>
  );
}
