import { EntitySearchDropdown } from "./EntitySearchDropdown";
import { MetricSearchDropdown } from "./MetricSearchDropdown";
import { Dispatch, SetStateAction } from "react";
import { CharterMetricList } from "@/services/charterMetric/charterMetric.schema";
import { DataEntityListResponseItem } from "@/services/dataEntity/dataEntity.schema";
import { Checkbox } from "@/components/ui/checkbox";
import { isArrayNotEmpty } from "@/lib/utils/array.utils";
import { DataEntityInfoDialog } from "./DataEntityInfoDialog";
import { MetricInfoDialog } from "./MetricInfoDialog";
import { Button } from "@/components/ui/button";
import { LuX } from "react-icons/lu";

interface ContextSectionProps {
  selectedEntityIds: number[];
  selectedMetricIds: number[];
  setSelectedEntityIds: Dispatch<SetStateAction<number[]>>;
  setSelectedMetricIds: Dispatch<SetStateAction<number[]>>;
  isQueryInContext: boolean;
  setIsQueryInContext: (checked: boolean) => void;
  dataEntities: DataEntityListResponseItem[];
  charterMetrics: CharterMetricList;
}

export const ContextSection = ({
  selectedEntityIds,
  selectedMetricIds,
  setSelectedEntityIds,
  setSelectedMetricIds,
  isQueryInContext,
  setIsQueryInContext,
  dataEntities,
  charterMetrics,
}: ContextSectionProps) => {
  return (
    <div className="w-full shadow-sm border p-2 rounded-md flex flex-col gap-2 bg-background">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          {/* <Label className="text-xs font-semibold opacity-60">Add Context:</Label> */}
          <ContextDropdowns
            dataEntities={dataEntities}
            charterMetrics={charterMetrics}
            selectedEntityIds={selectedEntityIds}
            selectedMetricIds={selectedMetricIds}
            setSelectedEntityIds={setSelectedEntityIds}
            setSelectedMetricIds={setSelectedMetricIds}
            isQueryInContext={isQueryInContext}
            setIsQueryInContext={setIsQueryInContext}
          />
        </div>
      </div>
      <SelectedContext
        selectedEntityIds={selectedEntityIds}
        selectedMetricIds={selectedMetricIds}
        setSelectedEntityIds={setSelectedEntityIds}
        setSelectedMetricIds={setSelectedMetricIds}
        dataEntities={dataEntities}
        charterMetrics={charterMetrics}
        isQueryInContext={isQueryInContext}
        setIsQueryInContext={setIsQueryInContext}
      />
    </div>
  );
};

const SelectedContext = ({
  selectedEntityIds,
  selectedMetricIds,
  setSelectedEntityIds,
  setSelectedMetricIds,
  isQueryInContext,
  setIsQueryInContext,
  dataEntities,
  charterMetrics,
}: ContextSectionProps) => {
  return (
    <div className="text-2xs flex flex-col gap-2">
      {isArrayNotEmpty(selectedEntityIds) && (
        <div className="flex gap-1 flex-wrap">
          {selectedEntityIds?.map((id) => {
            const dataEntity = dataEntities?.find((entity) => entity.id === id);
            return (
              <DataEntityInfoDialog key={id} dataEntity={dataEntity!} setSelectedEntityIds={setSelectedEntityIds} />
            );
          })}
        </div>
      )}
      {isArrayNotEmpty(selectedMetricIds) && (
        <div className="flex gap-1 flex-wrap">
          {selectedMetricIds?.map((id) => {
            const metric = charterMetrics?.find((entity) => entity.id === id);
            return <MetricInfoDialog key={id} metric={metric!} setSelectedMetricIds={setSelectedMetricIds} />;
          })}
        </div>
      )}
      <div className="flex justify-between items-center mt-1">
        <div className="flex items-center space-x-1 hover:opacity-80">
          <Checkbox
            id="query-context"
            className="scale-90"
            checked={isQueryInContext}
            onCheckedChange={setIsQueryInContext}
          />
          <label
            htmlFor="query-context"
            className="text-xs opacity-80 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer font-medium"
          >
            Query in context
          </label>
        </div>
        {(selectedEntityIds?.length > 0 || selectedMetricIds?.length > 0) && (
          <Button
            className="px-1.5 text-2xs h-5"
            variant="outline"
            onClick={() => {
              setSelectedEntityIds([]);
              setSelectedMetricIds([]);
            }}
          >
            <span>Clear</span> <LuX className="size-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

const ContextDropdowns = ({
  dataEntities,
  charterMetrics,
  selectedEntityIds,
  selectedMetricIds,
  setSelectedEntityIds,
  setSelectedMetricIds,
}: ContextSectionProps) => {
  return (
    <div className="flex gap-1 items-center flex-wrap">
      <EntitySearchDropdown
        dataEntities={dataEntities}
        onSelect={(entityId) => {
          setSelectedEntityIds((prev) => {
            if (prev?.includes(entityId)) return prev.filter((id) => id !== entityId);
            return Array.from(new Set([...(prev || []), entityId]));
          });
        }}
        selectedEntityIds={selectedEntityIds}
      />
      <MetricSearchDropdown
        charterMetrics={charterMetrics}
        onSelect={(charterId) => {
          setSelectedMetricIds((prev) => {
            if (prev?.includes(charterId)) return prev.filter((id) => id !== charterId);
            return Array.from(new Set([...(prev || []), charterId]));
          });
        }}
        selectedMetricIds={selectedMetricIds}
      />
    </div>
  );
};
