"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CharterPlaygroundListResponseItem } from "@/services/charterPlayground/charterPlayground.schema";
import { useUpdateCharterPlaygroundMutation } from "@/services/charterPlayground/charterPlayground.service";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "@/components/ui/toast";
import { useIsMac } from "@/hooks/use-is-mac";
import { FaPlay } from "react-icons/fa";

export default function PlaygroundHeader({
  organisationPublicId,
  playground,
  query,
  selectedCodeEditorSnippet,
  handleExecute,
  isExecutingQuery,
  isDemo = false,
}: {
  organisationPublicId: string;
  playground: CharterPlaygroundListResponseItem;
  query: string;
  selectedCodeEditorSnippet: string;
  handleExecute: () => void;
  isExecutingQuery: boolean;
  isDemo?: boolean;
}) {
  const queryClient = useQueryClient();

  const [isEditingName, setIsEditingName] = useState(false);
  const [playgroundName, setPlaygroundName] = useState(playground?.name);

  const isMac = useIsMac();

  const isDirty = useMemo(() => {
    return playgroundName !== playground?.name || query !== playground?.query;
  }, [playgroundName, playground?.name, query, playground?.query]);

  useEffect(() => {
    setPlaygroundName(playground?.name);
  }, [playground?.name]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check for CMD+S (Mac) or Ctrl+S (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault(); // Prevent browser save dialog
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [query, playgroundName]);

  const { mutateAsync: updatePlayground } = useUpdateCharterPlaygroundMutation({
    organisationPublicId,
    charterId: playground?.charter_id,
    playgroundPublicId: playground?.public_id,
  });

  // Automatically save the query after 1 second of inactivity
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query) {
        // Only call API if query isn't empty
        try {
          await handleSave();
        } catch {
          toast.error("Failed to automatically save query");
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSave = async () => {
    if (isDemo) return;

    setIsEditingName(false);
    try {
      await updatePlayground({
        playground: {
          query: query,
          name: playgroundName,
        },
      });
    } catch {
      toast.error("Failed to save playground");
    } finally {
      setIsEditingName(false);
      await queryClient.invalidateQueries({
        queryKey: ["playground", organisationPublicId, playground?.charter_id, playground?.public_id],
      });
    }
  };

  return (
    <div className="px-3 py-1 border-b flex flex-row justify-between items-center">
      <div className="flex flex-row items-center gap-2">
        <div>
          {!isDemo && isEditingName ? (
            <Input
              className="w-min h-6 px-1.5 rounded"
              value={playgroundName}
              onBlur={handleSave}
              onChange={(e) => setPlaygroundName(e.target.value)}
            />
          ) : (
            <span onClick={() => setIsEditingName(true)} className="text-sm">
              {playgroundName}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-row items-center gap-2">
        <div className="flex flex-row items-center gap-2">
          {isDirty && !isDemo && (
            <>
              <span className="text-xs text-foreground">{isMac ? "(⌘+S) to save" : "(Ctrl+S) to save"}</span>
              <Button
                size="sm"
                className="h-6 relative group"
                onClick={handleSave}
                disabled={!isDirty}
                variant="secondary"
              >
                Save
              </Button>
            </>
          )}
        </div>
        <Button
          size="sm"
          className="h-6 relative group border-foreground/20 px-2"
          onClick={handleExecute}
          disabled={isExecutingQuery}
        >
          {isExecutingQuery ? (
            "Executing..."
          ) : selectedCodeEditorSnippet ? (
            <span className="text-xs flex flex-row items-center gap-1">
              <span className="text-3xs rounded-full mr-0.5">{isMac ? "(⌃+⏎)" : "(Ctrl+⏎)"}</span> Execute Selection{" "}
              <FaPlay className="size-2.5" />
            </span>
          ) : (
            <span className="text-xs flex flex-row items-center gap-1">
              <span className="text-3xs rounded-full mr-0.5">{isMac ? "(⌃+⏎)" : "(Ctrl+⏎)"}</span> Execute{" "}
              <FaPlay className="size-2.5 ml-1" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
