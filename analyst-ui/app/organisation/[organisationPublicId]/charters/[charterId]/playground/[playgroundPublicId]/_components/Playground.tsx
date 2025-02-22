"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import SQLEditor from "./SqlEditor";
import { DataEntityListResponseItem } from "@/services/dataEntity/dataEntity.schema";
import { CharterPlaygroundQueryResult } from "@/services/charterPlayground/charterPlayground.schema";
import { DynamicDataTable } from "@/components/ui/data-table";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LuDownload } from "react-icons/lu";
import { Parser } from "@json2csv/plainjs";
import { Input } from "@/components/ui/input";
import { BsCopy } from "react-icons/bs";
import { toast } from "@/components/ui/toast";

export default function Playground({
  dataEntities,
  setSelectedCodeEditorSnippet,
  handleAddSelectedCodeSnippetToChat,
  query,
  setQuery,
  queryResult,
  isExecutingQuery,
  handleAddErrorToChat,
  queryLimit,
  setQueryLimit,
  setIsSqlEditorFocused,
}: {
  dataEntities: DataEntityListResponseItem[];
  setSelectedCodeEditorSnippet: (selectedText: string) => void;
  handleAddSelectedCodeSnippetToChat: () => void;
  query: string;
  setQuery: (query: string) => void;
  queryResult: CharterPlaygroundQueryResult | null;
  isExecutingQuery: boolean;
  handleAddErrorToChat: () => void;
  queryLimit: number;
  setQueryLimit: (limit: number) => void;
  setIsSqlEditorFocused: (isFocused: boolean) => void;
}) {
  const tableDivRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTableHeight(entry.contentRect.height - 50);
      }
    });

    if (tableDivRef.current) observer.observe(tableDivRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleSelectionChange = (selectedCodeEditorSnippet: string) => {
    setSelectedCodeEditorSnippet(selectedCodeEditorSnippet);
  };

  return (
    <div className="h-full w-full">
      <ResizablePanelGroup direction="vertical" className="w-full">
        <ResizablePanel defaultSize={53}>
          <div className="size-full overflow-hidden border-b border-foreground/15">
            <SQLEditor
              query={query}
              setIsSqlEditorFocused={setIsSqlEditorFocused}
              onQueryChange={setQuery}
              dataEntities={dataEntities}
              onCodeSnippetSelectionChange={handleSelectionChange}
              handleAddSelectedCodeSnippetToChat={handleAddSelectedCodeSnippetToChat}
            />
          </div>
        </ResizablePanel>
        <div className="mx-auto z-20">
          <ResizableHandle withHandle />
        </div>
        <ResizablePanel
          defaultSize={47}
          className={`!h-full overflow-y-auto ${queryResult?.error ? "" : "!overflow-visible"}`}
        >
          <div className={`size-full relative ${isExecutingQuery ? "blur-[2px]" : ""}`} ref={tableDivRef}>
            {/* Query Result OR Error */}
            {queryResult ? (
              queryResult?.error ? (
                <div className="text-sm pb-2 max-h-full overflow-y-auto p-1 pt-8">
                  <Button
                    size="sm"
                    className="absolute right-1 top-1 text-2xs flex items-center gap-1 font-semibold h-6 border z-10"
                    onClick={handleAddErrorToChat}
                  >
                    <span>Add Error To Chat</span>
                  </Button>
                  <span className="opacity-70 pb-20">{queryResult.error}</span>
                </div>
              ) : queryResult!.data && queryResult!.data.length > 0 ? (
                <>
                  <div className="absolute -top-2 right-4 -translate-y-full flex items-center gap-2">
                    <LimitInput limit={queryLimit} setLimit={setQueryLimit} />
                    <DownloadDataButton data={queryResult!.data!} />
                    <CopyDataToCSVButton data={queryResult!.data!} />
                    <CopyDataToMarkdownButton data={queryResult!.data!} />
                  </div>
                  <DynamicDataTable
                    data={queryResult!.data!}
                    withFilter={false}
                    withColumns={false}
                    tableHeight={tableHeight}
                  />
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center border-t border-foreground/15">
                  <span className="text-3xl opacity-70">No Rows Found!</span>
                </div>
              )
            ) : (
              <div className="h-full w-full flex items-center justify-center border-t border-foreground/15">
                <span className="text-3xl opacity-70">Query Result</span>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

// Select Limit dropdown
function LimitInput({ limit, setLimit }: { limit: number; setLimit: (limit: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs">Limit</span>
      <Input
        className="w-14 h-7 px-1.5 no-spinners"
        type="number"
        placeholder="No Limit"
        value={limit}
        onChange={(e) => setLimit(parseInt(e.target.value))}
      />
    </div>
  );
}

function CopyDataToCSVButton({ data }: { data: Record<string, unknown>[] }) {
  const handleCopy = () => {
    const parser = new Parser();
    const csv = parser.parse(data);
    navigator.clipboard.writeText(csv);
    toast.success("Data copied to clipboard");
  };

  return (
    <Button variant="outline" className="rounded-sm h-7 px-1" onClick={handleCopy}>
      <span className="text-2xs">Copy CSV</span>
      <BsCopy className="size-3.5 ml-1" />
    </Button>
  );
}

// Dropdown with options to download data as CSV, JSON, etc.
function DownloadDataButton({ data }: { data: Record<string, unknown>[] }) {
  const handleDownload = async () => {
    try {
      const parser = new Parser();
      const csv = parser.parse(data);

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `data-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-sm size-7">
          <LuDownload className="size-4" />
          <span className="sr-only">Download</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <span onClick={handleDownload}>Export data to .csv</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CopyDataToMarkdownButton({ data }: { data: Record<string, unknown>[] }) {
  const handleCopy = () => {
    if (data.length === 0) return;

    // Create header row
    const headers = Object.keys(data[0]);
    const markdownTable = [
      // Header row
      `| ${headers.join(" | ")} |`,
      // Separator row
      `| ${headers.map(() => "---").join(" | ")} |`,
      // Data rows
      ...data.map((row) => `| ${headers.map((header) => String(row[header] ?? "")).join(" | ")} |`),
    ].join("\n");

    navigator.clipboard.writeText(markdownTable);
    toast.success("Markdown table copied to clipboard");
  };

  return (
    <Button variant="outline" className="rounded-sm h-7 px-1" onClick={handleCopy}>
      <span className="text-2xs">Copy MD</span>
      <BsCopy className="size-3.5 ml-1" />
    </Button>
  );
}
