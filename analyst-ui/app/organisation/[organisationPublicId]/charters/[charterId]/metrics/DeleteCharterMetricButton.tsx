"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { useDeleteMetricMutation } from "@/services/charterMetric/charterMetric.service";

export default function DeleteCharterMetricButton({
  organisationPublicId,
  charterId,
  charterMetricId,
  charterMetricName,
}: {
  organisationPublicId: string;
  charterId: number;
  charterMetricId: number;
  charterMetricName: string;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  const { mutateAsync: deleteCharterMetric } = useDeleteMetricMutation(organisationPublicId, charterId);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <p className="text-xs font-medium text-destructive shadow-none">Delete</p>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-2 rounded-xl">
        <span className="text-lg">
          Are you sure you want to delete <span className="font-bold">{charterMetricName}</span>?
        </span>
        <div className="flex w-full items-center gap-2">
          <Button
            disabled={isDeleting}
            onClick={async () => {
              setIsDeleting(true);
              try {
                await deleteCharterMetric(charterMetricId);
              } catch {
                toast.error(
                  "Failed to delete metric. Please try again after deleting any associated metric examples first."
                );
              } finally {
                setIsDeleting(false);
                setOpen(false);

                setTimeout(() => {
                  router.push(`/organisation/${organisationPublicId}/charters/${charterId}/metrics`);
                  router.refresh();
                }, 500);
              }
            }}
            variant="destructive"
            className="flex w-1/2 items-center gap-1"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
          <DialogClose disabled={isDeleting} asChild className="!md:w-fit !w-1/2">
            <Button className="w-full">Cancel</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
