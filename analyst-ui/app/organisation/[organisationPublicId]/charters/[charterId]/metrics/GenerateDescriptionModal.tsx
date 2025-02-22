import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataEntityListResponseItem } from "@/services/dataEntity/dataEntity.schema";
import { Label } from "@/components/ui/label";
import { LuX } from "react-icons/lu";
import { VscRobot } from "react-icons/vsc";
import { toast } from "sonner";

export default function GenerateDescriptionModal({
  dataEntities,
  metricName,
  metricAbbreviation,
  handleGenerateDescription,
}: {
  dataEntities?: DataEntityListResponseItem[];
  metricName: string;
  metricAbbreviation: string;
  handleGenerateDescription: ({ dataEntityIds }: { dataEntityIds: number[] }) => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEntityIds, setSelectedEntityIds] = useState<number[]>([]);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const handleGenerate = async () => {
    if (selectedEntityIds.length === 0) {
      toast.error("No entities selected");
      return;
    }

    setIsGeneratingDescription(true);
    await handleGenerateDescription({ dataEntityIds: selectedEntityIds });
    setIsGeneratingDescription(false);
    setIsOpen(false);
  };

  const canOpenDialog = metricName && metricAbbreviation;

  const handleButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!canOpenDialog) {
        toast.error("Metric name and abbreviation are required to generate a description.");
        e.stopPropagation();
        e.preventDefault();
      } else {
        setIsOpen(true);
      }
    },
    [canOpenDialog]
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="flex gap-1 text-xs items-center h-6 font-semibold"
          onClick={handleButtonClick}
        >
          <span>Generate AI Description</span>
          <VscRobot className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] gap-3">
        <DialogHeader>
          <DialogTitle>Generate AI Description</DialogTitle>
          <DialogDescription>
            Select the data entities that are relevant to the metric <strong>{metricName}</strong> to generate a
            description.
          </DialogDescription>
        </DialogHeader>
        <hr />
        <div>
          <Label className="text-sm font-semibold opacity-60">Select Data Entities</Label>
          <div className="flex flex-wrap gap-1 mt-2">
            {dataEntities?.map((dataEntity) => (
              <span
                className={`p-1 rounded-md border text-xs cursor-pointer hover:bg-foreground/10 ${
                  selectedEntityIds?.includes(dataEntity.id) ? "bg-foreground/10" : ""
                }`}
                key={dataEntity.id}
                onClick={() => {
                  setSelectedEntityIds((prev) => {
                    if (prev?.includes(dataEntity.id)) {
                      return prev.filter((id) => id !== dataEntity.id);
                    }
                    return [...prev, dataEntity.id];
                  });
                }}
              >
                {dataEntity.name}
              </span>
            ))}
          </div>
        </div>
        <hr />
        <div className="w-ful mb-4">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-semibold opacity-60">Selected Entities</Label>
            {/* Clear button */}
            <Button
              variant="outline"
              className="flex gap-1 text-xs items-center h-6 font-semibold px-2"
              onClick={() => setSelectedEntityIds([])}
            >
              <span>Clear</span>
              <LuX className="size-4 shrink-0" />
            </Button>
          </div>
          <div className="flex gap-1 text-xs mt-2 flex-wrap">
            {selectedEntityIds.length === 0 && <span className="text-xs opacity-60">No entities selected</span>}
            {selectedEntityIds?.map((id) => (
              <div key={id} className="flex gap-1 border p-0.5 rounded-md px-1 shrink-0 items-center">
                <span>{dataEntities?.find((entity) => entity.id === id)?.name}</span>
                <span
                  className="cursor-pointer hover:bg-foreground/10 rounded-md hover:scale-110"
                  onClick={() => {
                    setSelectedEntityIds((prev) => prev?.filter((prevId) => id !== prevId));
                  }}
                >
                  <LuX className="size-3.5" />
                </span>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={selectedEntityIds.length === 0 || isGeneratingDescription}>
          {isGeneratingDescription ? "Generating..." : "Generate AI Description"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
