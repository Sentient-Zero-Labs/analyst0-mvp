import React from "react";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DataSourceCreate, DataSourceUpdate } from "@/services/dataSource/dataSource.schema";

export default function SnowflakeConfigForm({ control }: { control: Control<DataSourceCreate | DataSourceUpdate> }) {
  return (
    <>
      <FormField
        control={control}
        name="config.account_identifier"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>Account Identifier*</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Snowflake Account Identifier" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="config.warehouse"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>Warehouse*</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Warehouse" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="config.username"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>Username*</FormLabel>
            <FormControl>
              <Input {...field} placeholder="user" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="config.password"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>Password*</FormLabel>
            <FormControl>
              <Input {...field} type="password" placeholder="••••••••" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="config.database"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>Database*</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Database" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="config.schema"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>
              Schema <span className="text-2xs text-foreground/60 font-medium">(Optional)</span>
            </FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ""} placeholder="Schema" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="config.role"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>
              Role <span className="text-2xs text-foreground/60 font-medium">(Optional)</span>
            </FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ""} placeholder="Role" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
