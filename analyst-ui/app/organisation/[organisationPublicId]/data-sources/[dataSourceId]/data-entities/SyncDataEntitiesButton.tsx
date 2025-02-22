"use client";

import { Button } from "@/components/ui/button";
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

export default function SyncDataEntitiesButton({ onFetchDataEntities }: { onFetchDataEntities: () => void }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSyncDataEntities = async () => {
    setIsDialogOpen(false);
    onFetchDataEntities();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <span>Sync Data Entities</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sync Data Entities</DialogTitle>
          <DialogDescription>
            This action will only fetch data entities that are not already synced. It will not remove any data entities
            that are not present in your data source. For syncing column changes to data entity click on the edit data
            entity and Refetch schema.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSyncDataEntities}>Yes, Sync</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
