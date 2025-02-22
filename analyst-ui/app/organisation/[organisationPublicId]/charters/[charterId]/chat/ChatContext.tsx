import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CharterMetricList } from "@/services/charterMetric/charterMetric.schema";
import { DataEntityListResponseItem } from "@/services/dataEntity/dataEntity.schema";
import { Dispatch, SetStateAction } from "react";
import { LuX } from "react-icons/lu";
import { DataEntityInfoDialog } from "../playground/[playgroundPublicId]/_components/DataEntityInfoDialog";
import { MetricInfoDialog } from "../playground/[playgroundPublicId]/_components/MetricInfoDialog";

export default function ChatContext({
  dataEntities,
  charterMetrics,
  selectedEntityIds,
  setSelectedEntityIds,
  selectedMetricIds,
  setSelectedMetricIds,
}: {
  dataEntities: DataEntityListResponseItem[];
  charterMetrics: CharterMetricList;
  selectedEntityIds: number[];
  setSelectedEntityIds: Dispatch<SetStateAction<number[]>>;
  selectedMetricIds: number[];
  setSelectedMetricIds: Dispatch<SetStateAction<number[]>>;
}) {
  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <Label className="text-sm font-semibold opacity-60">Data Entities</Label>
        <div className="flex flex-wrap gap-1">
          {/* Data entities */}
          {dataEntities?.map((dataEntity) => (
            <span
              className={`p-0.5 px-1 rounded-sm border text-xs cursor-pointer hover:bg-foreground/10 ${
                selectedEntityIds?.includes(dataEntity.id) ? "bg-foreground/10" : ""
              }`}
              key={dataEntity.id}
              onClick={() => {
                setSelectedEntityIds((prev) => {
                  if (prev?.includes(dataEntity.id)) {
                    return prev.filter((id) => id !== dataEntity.id);
                  }

                  return Array.from(new Set([...(prev || []), dataEntity.id]));
                });
              }}
            >
              {dataEntity.name}
            </span>
          ))}
        </div>
      </div>

      {/* Data agent metrics */}
      <div>
        <Label className="text-sm font-semibold opacity-60">Data Agent Metrics</Label>
        <div className="flex flex-wrap gap-1">
          {charterMetrics?.map((charterMetric) => (
            <span
              className={`p-0.5 px-1 rounded-md border text-xs cursor-pointer hover:bg-foreground/10 ${
                selectedMetricIds?.includes(charterMetric.id) ? "bg-foreground/10" : ""
              }`}
              key={charterMetric.id}
              onClick={() => {
                setSelectedMetricIds((prev) => {
                  if (prev?.includes(charterMetric.id)) return prev.filter((id) => id !== charterMetric.id);

                  return Array.from(new Set([...(prev || []), charterMetric.id]));
                });
              }}
            >
              {charterMetric.name}
            </span>
          ))}
        </div>
      </div>

      {/* Context */}
      <div className="border-t w-full pt-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-semibold opacity-60">Context</Label>
          {(selectedEntityIds?.length > 0 || selectedMetricIds?.length > 0) && (
            <Button
              className="h-6 px-2 text-xs"
              variant="outline"
              onClick={() => {
                setSelectedEntityIds([]);
                setSelectedMetricIds([]);
              }}
            >
              Clear <LuX className="size-4" />
            </Button>
          )}
        </div>
        <div className="flex gap-1 text-xs mt-2 flex-wrap">
          {!selectedEntityIds?.length && !selectedMetricIds?.length && (
            <span className="text-xs opacity-60">
              No context selection required. But if you want more fine-grained control, select data entities and metrics
              related to the question.
            </span>
          )}

          {selectedEntityIds?.map((id) => {
            const dataEntity = dataEntities?.find((entity) => entity.id === id);
            if (!dataEntity) return null;

            return (
              <DataEntityInfoDialog key={id} dataEntity={dataEntity} setSelectedEntityIds={setSelectedEntityIds} />
            );
          })}
        </div>
        <div className="flex gap-1 text-xs mt-2 flex-wrap">
          {selectedMetricIds?.map((id) => {
            const metric = charterMetrics?.find((entity) => entity.id === id);
            return <MetricInfoDialog key={id} metric={metric!} setSelectedMetricIds={setSelectedMetricIds} />;
          })}
        </div>
      </div>
    </div>
  );
}
