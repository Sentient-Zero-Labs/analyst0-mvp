"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DataEntityListResponseItem,
  DataEntityResponse,
  DataEntityResponseSchema,
} from "@/services/dataEntity/dataEntity.schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { CardTitle } from "@/components/ui/card";
import RefetchMetadataButton from "../RefetchMetadataButton";
import { useUpdateDataEntityMutation } from "@/services/dataEntity/dataEntity.service";
import { toast } from "@/components/ui/toast";
import RefetchSchemaButton from "../RefetchSchemaButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LuPencilLine, LuCheck, LuX } from "react-icons/lu";
import { AddForeignKeyDialog } from "./AddForeignKeyDialog";
import Link from "next/link";

interface DataEntityFormProps {
  dataEntity: DataEntityResponse;
  organisationPublicId: string;
  isInSheet?: boolean;
}

export function DataEntityForm({ dataEntity, organisationPublicId, isInSheet = false }: DataEntityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingColumnIndex, setEditingColumnIndex] = useState<number | null>(null);
  const [editingForeignKeyIndex, setEditingForeignKeyIndex] = useState<number | null>(null);

  const form = useForm<DataEntityResponse>({
    resolver: zodResolver(DataEntityResponseSchema),
    defaultValues: { ...dataEntity, description: dataEntity.description || "" },
  });

  const { fields: columnFields } = useFieldArray({
    control: form.control,
    name: "columns",
  });

  const {
    fields: foreignKeyFields,
    append: appendForeignKey,
    remove: removeForeignKey,
  } = useFieldArray({
    control: form.control,
    name: "foreign_keys",
  });

  const { mutateAsync: updateDataEntity } = useUpdateDataEntityMutation({
    organisationPublicId: organisationPublicId,
    dataSourceId: dataEntity.data_source_id,
    dataEntityId: dataEntity.id,
  });

  const handleAddForeignKey = (foreignKey: {
    column: string;
    referred_table_name: string;
    referred_column: string;
  }) => {
    appendForeignKey({
      ...foreignKey,
      description: "",
    });
    form.setFocus(`foreign_keys.${foreignKeyFields.length}.description`);
  };

  const onSubmit = async (data: DataEntityResponse) => {
    setIsSubmitting(true);

    try {
      const newDataEntity = await updateDataEntity(data);
      toast.success("Data entity updated successfully");
      // router.refresh();
      location.reload();
      form.reset(newDataEntity);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update data entity");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col pr-2 pb-20 w-full">
        <div className="flex items-center justify-between gap-2 sticky top-0 bg-background py-2 z-10">
          <CardTitle className={isInSheet ? "text-lg" : ""}>
            Data Entity <span className="text-foreground/70 text-base">({dataEntity.name})</span>
          </CardTitle>
          <div className="flex flex-row gap-2">
            <RefetchSchemaButton
              organisationPublicId={organisationPublicId}
              dataSourceId={dataEntity.data_source_id}
              dataEntityId={dataEntity.id}
              resetForm={form.reset}
            />
            <RefetchMetadataButton
              organisationPublicId={organisationPublicId}
              dataSourceId={dataEntity.data_source_id}
              dataEntityId={dataEntity.id}
              resetForm={form.reset}
            />
            <Button disabled={!form.formState.isDirty || isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div>
          <div className="space-y-4">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-base font-semibold opacity-80">Description</Label>
                    <FormControl>
                      <Textarea className="min-h-32" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <hr className="mt-10 border-foreground/10" />

            {/* Columns */}
            <div>
              <Label className="text-base font-semibold opacity-80">Columns</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Name</TableHead>
                    <TableHead className="w-[150px]">Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columnFields.map((field, index) => {
                    const isEditing = editingColumnIndex === index;

                    return (
                      <TableRow className="h-12" key={field.id}>
                        <TableCell className={`font-medium ${isEditing && "align-top pt-3.5"}`}>{field.name}</TableCell>
                        <TableCell className={`${isEditing && "align-top pt-3.5"}`}>
                          {field.type}
                          {field.enum_values ? ` (${field.enum_values.join(", ")})` : ""}
                        </TableCell>{" "}
                        <TableCell className="py-1">
                          <FormField
                            control={form.control}
                            name={`columns.${index}.description`}
                            render={({ field: formField }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  {editingColumnIndex === index ? (
                                    <Textarea
                                      {...formField}
                                      placeholder="Description"
                                      className="h-28 rounded-sm focus-visible:ring-offset-0 focus-visible:ring-1"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === "Escape") setEditingColumnIndex(null);
                                      }}
                                    />
                                  ) : (
                                    <div className="flex items-center gap-2 w-full">
                                      {formField.value ? (
                                        <span className="line-clamp-3">{formField.value}</span>
                                      ) : (
                                        <span className="text-red-500">
                                          No description. Please add description for AI to understand data better.
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          {editingColumnIndex === index ? (
                            <div className="flex gap-3 items-center justify-center ">
                              <div
                                className="cursor-pointer hover:text-foreground/70 hover:scale-125 flex items-center justify-center"
                                onClick={() => setEditingColumnIndex(null)}
                              >
                                <LuCheck className="size-5 text-green-500" strokeWidth={2.5} />
                              </div>
                              <div
                                className="cursor-pointer hover:text-foreground/70 hover:scale-125 flex items-center justify-center"
                                onClick={() => setEditingColumnIndex(null)}
                              >
                                <LuX className="size-5 text-red-500" strokeWidth={2.5} />
                              </div>
                            </div>
                          ) : (
                            <div
                              className="cursor-pointer hover:text-foreground/70 hover:scale-125  flex items-center justify-center"
                              onClick={() => setEditingColumnIndex(index)}
                            >
                              <LuPencilLine className="size-4" />
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <hr className="mt-10 border-foreground/10" />

            {/* Relationships */}
            <div>
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold opacity-80">Relationships</Label>
                <AddForeignKeyDialog
                  organisationPublicId={organisationPublicId}
                  dataSourceId={dataEntity.data_source_id}
                  currentDataEntity={dataEntity}
                  onAddForeignKey={handleAddForeignKey}
                />
              </div>
              <Table>
                {foreignKeyFields.length > 0 && (
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Column</TableHead>
                      <TableHead className="w-[150px]">Referenced Table</TableHead>
                      <TableHead className="w-[150px]">Referenced Column</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px] text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                )}
                <TableBody>
                  {foreignKeyFields.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-foreground/50">
                        No relationships defined. Click &apos;Add Relationship&apos; to add one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    foreignKeyFields.map((field, index) => (
                      <TableRow className="h-12" key={field.id}>
                        <TableCell className="font-medium">{field.column}</TableCell>
                        <TableCell>{field.referred_table_name}</TableCell>
                        <TableCell>{field.referred_column}</TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`foreign_keys.${index}.description`}
                            render={({ field: formField }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  {editingForeignKeyIndex === index ? (
                                    <Input
                                      {...formField}
                                      placeholder="Description"
                                      className="h-9 rounded-sm focus-visible:ring-offset-0 focus-visible:ring-1"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === "Escape") setEditingForeignKeyIndex(null);
                                        if (e.key === "Enter") setEditingForeignKeyIndex(null);
                                      }}
                                    />
                                  ) : (
                                    <div className="flex items-center gap-2 w-full">
                                      {formField.value ? (
                                        <span>{formField.value}</span>
                                      ) : (
                                        <span className="text-red-500">
                                          No description. Please add description for AI to understand data better.
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          {editingForeignKeyIndex === index ? (
                            <div className="flex gap-3 items-center justify-center">
                              <div
                                className="cursor-pointer hover:text-foreground/70 hover:scale-125 flex items-center justify-center"
                                onClick={() => setEditingForeignKeyIndex(null)}
                              >
                                <LuCheck className="size-5 text-green-500" strokeWidth={2.5} />
                              </div>
                              <div
                                className="cursor-pointer hover:text-foreground/70 hover:scale-125 flex items-center justify-center"
                                onClick={() => setEditingForeignKeyIndex(null)}
                              >
                                <LuX className="size-5 text-red-500" strokeWidth={2.5} />
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-3 justify-center">
                              <div
                                className="cursor-pointer hover:text-foreground/70 hover:scale-125 flex items-center justify-center"
                                onClick={() => setEditingForeignKeyIndex(index)}
                              >
                                <LuPencilLine className="size-4" />
                              </div>
                              <div
                                className="cursor-pointer hover:text-foreground/70 hover:scale-125 flex items-center justify-center text-red-500 hover:text-red-600"
                                onClick={() => removeForeignKey(index)}
                              >
                                <LuX className="size-5" strokeWidth={2.5} />
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

export function DataEntityList({
  dataEntities,
  organisationPublicId,
  dataSourceId,
}: {
  dataEntities?: DataEntityListResponseItem[];
  organisationPublicId: string;
  dataSourceId: number;
}) {
  return (
    <ul className="flex flex-col rounded-md ">
      {dataEntities?.map((dataEntiy) => (
        <li
          key={dataEntiy.id}
          className="py-1 bg-muted/50 border border-b-0 last:border-b last:rounded-b-md first:rounded-t-md"
        >
          <Link
            href={`/organisation/${organisationPublicId}/data-sources/${dataSourceId}/data-entities/${dataEntiy.id}`}
            className="px-2 py-1.5 flex flex-row justify-between items-center gap-1"
          >
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs font-normal">Schema: {dataEntiy.schema_name}</span>
              <span className="font-semibold">{dataEntiy.name}</span>
              <span className="text-gray-500 text-sm line-clamp-1">
                {dataEntiy.description || <span className="text-destructive">No description</span>}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
