import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Dispatch, SetStateAction } from "react";
import { LuX } from "react-icons/lu";
import { CharterMetric } from "@/services/charterMetric/charterMetric.schema";
import { TbChartInfographic } from "react-icons/tb";

export const MetricInfoDialog = ({
  metric,
  setSelectedMetricIds,
}: {
  metric: CharterMetric;
  setSelectedMetricIds: Dispatch<SetStateAction<number[]>>;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex gap-1 border p-0.5 rounded px-1 shrink-0 items-center hover:bg-foreground/5 cursor-pointer">
          <div className="flex items-center gap-1">
            <TbChartInfographic className="size-3.5" strokeWidth={1.8} />{" "}
            <span className="font-semibold">{metric?.name}</span>
          </div>
          <span
            className="cursor-pointer hover:bg-foreground/10 rounded-md hover:scale-110"
            onClick={() => setSelectedMetricIds((prev) => prev?.filter((prevId) => metric.id !== prevId))}
          >
            <LuX className="size-3.5" />
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[400px] h-[40vh] overflow-y-auto text-sm">
        <div className="flex flex-col gap-3">
          {/* Name and Description */}
          <div>
            <h3 className="w-full text-lg font-semibold">Metric ({metric.name})</h3>
            <p className="text-2sm mt-1">{metric.description}</p>
          </div>

          {/* Columns */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
