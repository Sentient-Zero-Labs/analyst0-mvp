"use client";

import { Button } from "@/components/ui/button";
import { CharterListResponseItem } from "@/services/charter/charter.schema";
import { useCreateCharterPlaygroundMutation } from "@/services/charterPlayground/charterPlayground.service";
import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/loader";

interface CharterCardProps {
  charter: CharterListResponseItem;
  organisationPublicId: string;
}

export function CharterCard({ charter, organisationPublicId }: CharterCardProps) {
  const router = useRouter();

  const [isNewChatLoading, setIsNewChatLoading] = useState(false);

  const { mutateAsync: createPlayground } = useCreateCharterPlaygroundMutation({
    organisationPublicId,
    charterId: charter.id,
  });

  const onClick = async () => {
    setIsNewChatLoading(true);
    try {
      const playground = await createPlayground();
      router.push(`/organisation/${organisationPublicId}/charters/${charter.id}/playground/${playground.public_id}`);
    } catch {
      toast.error("LLM high demand error. Please try again in some time.");
    } finally {
      setIsNewChatLoading(false);
    }
  };

  return (
    <div className="border rounded-lg w-48 h-40 p-3 flex flex-col gap-2 justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-500">Charter</span>
        <span className="font-semibold break-all">{charter.name}</span>
      </div>
      <Button
        size={"sm"}
        className="w-full flex items-center justify-center"
        onClick={onClick}
        disabled={isNewChatLoading}
      >
        New {isNewChatLoading && <Loader className="size-4 ml-2" />}
      </Button>
    </div>
  );
}
