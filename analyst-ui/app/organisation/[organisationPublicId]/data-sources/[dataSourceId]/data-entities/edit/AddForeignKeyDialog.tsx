"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataEntityListResponseItem, DataEntityResponse } from "@/services/dataEntity/dataEntity.schema";
import { useDataEntitiesQuery, useDataEntityQuery } from "@/services/dataEntity/dataEntity.service";
import { Label } from "@/components/ui/label";
import { LuPlus } from "react-icons/lu";
import Loader from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";

interface AddForeignKeyDialogProps {
  organisationPublicId: string;
  dataSourceId: number;
  currentDataEntity: DataEntityResponse;
  onAddForeignKey: (foreignKey: { column: string; referred_column: string; referred_table_name: string }) => void;
}

export function AddForeignKeyDialog({
  organisationPublicId,
  dataSourceId,
  currentDataEntity,
  onAddForeignKey,
}: AddForeignKeyDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDataEntity, setSelectedDataEntity] = useState<DataEntityListResponseItem | null>(null);

  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [selectedReferredColumn, setSelectedReferredColumn] = useState<string | null>(null);

  const { data: dataEntities } = useDataEntitiesQuery({
    organisationPublicId,
    dataSourceId,
  });

  const { data: selectedDataEntityDetails, isLoading: selectedDataEntityDetailsLoading } = useDataEntityQuery({
    organisationPublicId,
    dataSourceId,
    dataEntityId: selectedDataEntity?.id,
  });

  const handleSaveForeignKey = () => {
    if (selectedDataEntity && selectedColumn && selectedReferredColumn) {
      onAddForeignKey({
        column: selectedColumn,
        referred_column: selectedReferredColumn,
        referred_table_name: selectedDataEntity.name,
      });
      setIsOpen(false);
      setSelectedDataEntity(null);
      setSelectedColumn(null);
      setSelectedReferredColumn(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-1">
          <LuPlus className="h-4 w-4" /> Add Relationship{" "}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[900px] max-h-[80vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Add Relationship{" "}
            <span className="text-base text-foreground/70 font-medium">(Data Entity: {currentDataEntity.name})</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 flex-1">
          {/* Current Entity Columns (Left) */}
          <div className="flex-1 flex flex-col h-[60vh]">
            <Label className="text-base font-semibold opacity-80 sticky top-0 bg-background py-2">Table Columns</Label>
            <div className="flex flex-col gap-1 mt-2 overflow-y-auto">
              {currentDataEntity.columns?.map((column) => (
                <div
                  key={column.name}
                  className={`py-1 px-2 border rounded-sm cursor-pointer hover:bg-foreground/5 ${
                    selectedColumn === column.name ? "bg-foreground/10" : ""
                  }`}
                  onClick={() => setSelectedColumn(column.name)}
                >
                  <div className="font-medium text-sm">{column.name}</div>
                  <div className="text-xs text-foreground/70">{column.type}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Separator */}
          <Separator orientation="vertical" className="h-[60vh]" />

          {/* Data Entities List (Middle) */}
          <div className="flex-1 flex flex-col h-[60vh]">
            <Label className="text-base font-semibold opacity-80 sticky top-0 bg-background py-2">
              Referenced Tables
            </Label>
            <div className="flex flex-col gap-1 mt-2 overflow-y-auto">
              {dataEntities
                ?.filter((entity) => entity.id !== currentDataEntity.id)
                .map((entity) => (
                  <div
                    key={entity.id}
                    className={`py-1 px-2 border rounded-sm cursor-pointer hover:bg-foreground/5 ${
                      selectedDataEntity?.id === entity.id ? "bg-foreground/10" : ""
                    }`}
                    onClick={() => {
                      setSelectedDataEntity(entity);
                      setSelectedReferredColumn(null);
                    }}
                  >
                    <div className="font-medium text-sm">{entity.name}</div>
                    <div className="text-xs text-foreground/70">{entity.schema_name}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Referenced Entity Columns (Right) */}
          <div className="flex-1 flex flex-col h-[60vh]">
            <Label className="text-base font-semibold opacity-80 sticky top-0 bg-background py-2">
              Referenced Columns
            </Label>
            <div className="flex flex-col gap-1 mt-2 overflow-y-auto">
              {selectedDataEntityDetailsLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader className="h-4 w-4" />
                </div>
              ) : (
                selectedDataEntityDetails?.columns?.map((column) => (
                  <div
                    key={column.name}
                    className={`py-1 px-2 border rounded-sm cursor-pointer hover:bg-foreground/5 ${
                      selectedReferredColumn === column.name ? "bg-foreground/10" : ""
                    }`}
                    onClick={() => setSelectedReferredColumn(column.name)}
                  >
                    <div className="font-medium text-sm">{column.name}</div>
                    <div className="text-xs text-foreground/70">{column.type}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Save Button - now sticky */}
        <DialogFooter className="sticky bottom-0 bg-background pt-4">
          <Button
            disabled={!selectedDataEntity || !selectedColumn || !selectedReferredColumn}
            onClick={handleSaveForeignKey}
          >
            Add Relationship
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
