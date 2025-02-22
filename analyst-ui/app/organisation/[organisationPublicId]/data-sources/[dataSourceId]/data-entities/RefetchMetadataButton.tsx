"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useFetchDataEntityMetadataMutation } from "@/services/dataEntity/dataEntity.service";
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
import { VscRobot } from "react-icons/vsc";
import { DataEntityResponse } from "@/services/dataEntity/dataEntity.schema";

export default function RefetchMetadataButton({
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
  const [isRefetchingMetadata, setIsRefetchingMetadata] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { mutateAsync: fetchDataEntityMetadata } = useFetchDataEntityMetadataMutation({
    organisationPublicId: organisationPublicId,
    dataSourceId: dataSourceId,
    dataEntityId: dataEntityId,
  });

  const handleRefetchMetadata = async () => {
    try {
      setIsRefetchingMetadata(true);
      const dataEntity = await fetchDataEntityMetadata();
      toast.success("Metadata refetched successfully");
      setIsRefetchingMetadata(false);

      location.reload();
      resetForm?.(dataEntity);
    } catch (error) {
      toast.error("Failed to refetch metadata");
      setIsRefetchingMetadata(false);
      console.error(error);
    } finally {
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <span>Generate AI Metadata</span>
          <VscRobot className="ml-1 size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refetch Metadata</DialogTitle>
          <DialogDescription>
            Are you sure you want to refetch metadata? This action will refetch description of table, columns and
            foreign keys using AI. Only empty descriptions will be refetched.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isRefetchingMetadata}>
            Cancel
          </Button>
          <Button onClick={handleRefetchMetadata} disabled={isRefetchingMetadata}>
            {isRefetchingMetadata ? "Refetching..." : "Yes, Refetch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
