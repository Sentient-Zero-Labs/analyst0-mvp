"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useRefetchDataEntitySchemaMutation } from "@/services/dataEntity/dataEntity.service";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { LuDatabaseBackup } from "react-icons/lu";
import { DataEntityResponse } from "@/services/dataEntity/dataEntity.schema";

export default function RefetchSchemaButton({
  organisationPublicId,
  dataSourceId,
  dataEntityId,
  resetForm,
}: {
  organisationPublicId: string;
  dataSourceId: number;
  dataEntityId: number;
  resetForm?: (dataEntity: DataEntityResponse) => void;
}) {
  const [isRefetchingSchema, setIsRefetchingSchema] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { mutateAsync: fetchDataEntitySchema } = useRefetchDataEntitySchemaMutation({
    organisationPublicId: organisationPublicId,
    dataSourceId: dataSourceId,
    dataEntityId: dataEntityId,
  });

  const handleRefetchSchema = async () => {
    try {
      setIsRefetchingSchema(true);
      const dataEntity = await fetchDataEntitySchema();

      toast.success("Schema refetched successfully");
      setIsRefetchingSchema(false);

      location.reload();
      resetForm?.(dataEntity);
    } catch (error) {
      toast.error("Failed to refetch schema");
      setIsRefetchingSchema(false);
      console.error(error);
    } finally {
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <span>Refetch Schema</span>
          <LuDatabaseBackup className="ml-1 size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refetch Schema</DialogTitle>
          <DialogDescription>
            Are you sure you want to refetch schema from your data source? This action will add/remove columns, foreign
            keys and indexes for the data entity depending on the changes in your data source.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRefetchSchema} disabled={isRefetchingSchema}>
            {isRefetchingSchema ? "Refetching..." : "Yes, Refetch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
