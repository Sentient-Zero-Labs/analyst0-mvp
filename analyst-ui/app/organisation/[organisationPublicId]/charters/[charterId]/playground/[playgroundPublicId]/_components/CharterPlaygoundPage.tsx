"use client";

import Playground from "./Playground";
import { useDataEntitiesForCharterQuery } from "@/services/dataEntity/dataEntity.service";
import { useCallback, useEffect, useState } from "react";
import PlaygroundContext from "./PlaygroundContext";
import { useCharterQuery } from "@/services/charter/charter.service";
import { useCharterMetricListQuery } from "@/services/charterMetric/charterMetric.service";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import {
  useCharterPlaygroundQuery,
  useExecuteCharterPlaygroundQueryMutation,
} from "@/services/charterPlayground/charterPlayground.service";
import PlaygroundHeader from "./PlaygroundHeader";
import { toast } from "@/components/ui/toast";
import { CharterPlaygroundQueryResult } from "@/services/charterPlayground/charterPlayground.schema";

export default function CharterPlaygoundPage({
  organisationPublicId,
  charterId,
  playgroundPublicId,
  isDemo = false,
}: {
  organisationPublicId: string;
  charterId: number;
  playgroundPublicId: string;
  isDemo?: boolean;
}) {
  const [selectedCodeEditorSnippet, setSelectedCodeEditorSnippet] = useState("");
  const [chatContent, setChatContent] = useState("");
  const [query, setQuery] = useState("");
  const [queryResult, setQueryResult] = useState<CharterPlaygroundQueryResult | null>(null);
  const [isExecutingQuery, setIsExecutingQuery] = useState(false);
  const [queryLimit, setQueryLimit] = useState(100);
  const [isSqlEditorFocused, setIsSqlEditorFocused] = useState(false);

  const { data: charter } = useCharterQuery({
    organisationPublicId,
    charterId,
  });

  const { data: dataEntities } = useDataEntitiesForCharterQuery({
    organisationPublicId,
    charterId,
  });

  const { data: charterMetrics } = useCharterMetricListQuery({
    organisationPublicId,
    charterId,
  });

  const { data: charterPlayground } = useCharterPlaygroundQuery({
    organisationPublicId,
    charterId,
    playgroundPublicId,
  });

  const { mutateAsync: executeQuery } = useExecuteCharterPlaygroundQueryMutation({
    organisationPublicId,
    charterId,
    playgroundPublicId,
  });

  useEffect(() => {
    setQuery(charterPlayground?.query || "");
  }, [charterPlayground?.query]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check for CMD+Shift+L (Mac) or Ctrl+Shift+L (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "l" && isSqlEditorFocused) {
        event.preventDefault();
        handleAddSelectedCodeSnippetToChat();
      } else if (event.ctrlKey && event.key === "Enter" && isSqlEditorFocused) {
        event.preventDefault();
        handleExecute();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [selectedCodeEditorSnippet, query, isSqlEditorFocused]); // Add selectedText as dependency

  const handleAddSelectedCodeSnippetToChat = useCallback(() => {
    if (!selectedCodeEditorSnippet) return;
    setChatContent((text) => `User Selected Snippet: \`\`\`\n${selectedCodeEditorSnippet}\n\`\`\`\n\n${text}`);
  }, [setChatContent, selectedCodeEditorSnippet]);

  const handleAddErrorToChat = () => {
    if (!queryResult?.error) return;
    setChatContent(
      (text) => `Query Error: \`\`\`\n${queryResult.error}\n\`\`\`\nGive concise advice on how to fix it.\n\n${text}`
    );
  };

  const handleExecute = async () => {
    setIsExecutingQuery(true);
    try {
      const result = await executeQuery({ query: selectedCodeEditorSnippet || query, limit: queryLimit });
      setQueryResult(result);
    } catch {
      toast.error("Failed to execute query");
    } finally {
      setIsExecutingQuery(false);
    }
  };

  const handleGeneratedCodeAction = (code: string, action: "replace" | "append") => {
    setQuery((text) => {
      if (action === "replace") {
        return code;
      } else {
        return text.trim() ? `${text}\n\n${code}` : code;
      }
    });
  };

  return (
    <div className="size-full">
      <ResizablePanelGroup direction="horizontal">
        {/* Query Section (Scrollable) */}
        <ResizablePanel defaultSize={70} minSize={50}>
          {charterPlayground && (
            <PlaygroundHeader
              organisationPublicId={organisationPublicId}
              playground={charterPlayground}
              query={query}
              selectedCodeEditorSnippet={selectedCodeEditorSnippet}
              handleExecute={handleExecute}
              isExecutingQuery={isExecutingQuery}
              isDemo={isDemo}
            />
          )}

          <Playground
            queryLimit={queryLimit}
            setQueryLimit={setQueryLimit}
            dataEntities={dataEntities || []}
            setSelectedCodeEditorSnippet={setSelectedCodeEditorSnippet}
            handleAddSelectedCodeSnippetToChat={handleAddSelectedCodeSnippetToChat}
            query={query}
            setQuery={setQuery}
            queryResult={queryResult}
            isExecutingQuery={isExecutingQuery}
            handleAddErrorToChat={handleAddErrorToChat}
            setIsSqlEditorFocused={setIsSqlEditorFocused}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Playground Chat Context Section (Sticky) */}
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <div className="h-[94vh] p-2 bg-sidebar">
            <PlaygroundContext
              charterName={charter?.name}
              playgroundPublicId={playgroundPublicId}
              dataEntities={dataEntities || []}
              charterMetrics={charterMetrics || []}
              chatContent={chatContent}
              setChatContent={setChatContent}
              organisationPublicId={organisationPublicId}
              charterId={charterId}
              query={query}
              selectedCodeEditorSnippet={selectedCodeEditorSnippet}
              handleGeneratedCodeAction={handleGeneratedCodeAction}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
