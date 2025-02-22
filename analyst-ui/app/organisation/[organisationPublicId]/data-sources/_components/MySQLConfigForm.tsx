import React from "react";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DataSourceCreate, DataSourceUpdate } from "@/services/dataSource/dataSource.schema";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function MySQLConfigForm({ control }: { control: Control<DataSourceCreate | DataSourceUpdate> }) {
  return (
    <>
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
        name="config.host"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>Host*</FormLabel>
            <FormControl>
              <Input {...field} placeholder="localhost" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="config.port"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>Port*</FormLabel>
            <FormControl>
              <Input {...field} type="number" placeholder="Port" />
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
              <Input {...field} placeholder="mydatabase" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <br />

      <FormField
        control={control}
        name="config.ssl_mode"
        defaultValue="require"
        render={({}) => (
          <FormItem className="space-y-1">
            <FormLabel>SSL Mode*</FormLabel>

            <div className="flex items-center space-x-3 pt-3">
              <FormControl>
                <Checkbox
                  onClick={(e) => {
                    toast.info("SSL connection is required and cannot be disabled");
                    e.stopPropagation();
                  }}
                  className="data-[state=checked]:bg-green-500 size-5"
                  checked={true}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Require SSL connection</FormLabel>
              </div>
            </div>
          </FormItem>
        )}
      />
    </>
  );
}
