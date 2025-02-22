import React from "react";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DataSourceCreate, DataSourceUpdate } from "@/services/dataSource/dataSource.schema";

export default function SQLiteConfigForm({ control }: { control: Control<DataSourceCreate | DataSourceUpdate> }) {
  return (
    <FormField
      control={control}
      name="config.database_path"
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel>Database Path*</FormLabel>
          <FormControl>
            <Input {...field} placeholder="database path" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
