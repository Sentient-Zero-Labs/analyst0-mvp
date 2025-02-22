"use client";

import CodeMirror, { ViewUpdate } from "@uiw/react-codemirror";
import { sql, PostgreSQL, SQLNamespace } from "@codemirror/lang-sql";
import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";
import { useTheme } from "next-themes"; // Make sure to install next-themes
import { DataEntityListResponseItem } from "@/services/dataEntity/dataEntity.schema";
import { useMemo, useState, useCallback } from "react";
import { useIsMac } from "@/hooks/use-is-mac";
import { Button } from "@/components/ui/button";

// Light theme
const lightTheme = createTheme({
  theme: "light",
  settings: {
    background: "#ffffff",
    foreground: "#24292e",
    selection: "#b3d4fc",
    selectionMatch: "#d9d9d9",
    lineHighlight: "#f6f8fa",
  },
  styles: [
    { tag: t.keyword, color: "#005cc5" },
    { tag: t.string, color: "#032f62" },
    { tag: t.comment, color: "#6a737d" },
    { tag: t.function(t.variableName), color: "#6f42c1" },
    { tag: t.number, color: "#005cc5" },
    { tag: t.operator, color: "#d73a49" },
    { tag: t.punctuation, color: "#24292e" },
    { tag: [t.definitionKeyword, t.typeOperator], color: "#d73a49" },
    { tag: [t.className, t.definition(t.propertyName)], color: "#6f42c1" },
  ],
});

// Dark theme
const darkTheme = createTheme({
  theme: "dark",
  settings: {
    background: "#0d1117",
    foreground: "#c9d1d9",
    selection: "#003d73",
    selectionMatch: "#003d73",
    lineHighlight: "#171b22",
  },
  styles: [
    { tag: t.keyword, color: "#ff7b72" },
    { tag: t.string, color: "#a5d6ff" },
    { tag: t.comment, color: "#8b949e" },
    { tag: t.function(t.variableName), color: "#d2a8ff" },
    { tag: t.number, color: "#79c0ff" },
    { tag: t.operator, color: "#ff7b72" },
    { tag: t.punctuation, color: "#c9d1d9" },
    { tag: [t.definitionKeyword, t.typeOperator], color: "#ff7b72" },
    { tag: [t.className, t.definition(t.propertyName)], color: "#d2a8ff" },
  ],
});

const createPostgresSchema = (dataEntities?: DataEntityListResponseItem[]) => {
  if (!dataEntities) return {};

  // Group tables by schema_name
  return dataEntities.reduce((schemas: Record<string, Record<string, unknown>>, entity) => {
    const schemaName = entity.schema_name || "public";

    if (!schemas[schemaName]) schemas[schemaName] = {};

    const entityDefinition =
      entity.columns?.map((column) => ({
        label: column.name,
        type: column.type?.toLowerCase() || "unknown",
        details: column.description,
      })) || [];

    // Add table with its columns
    schemas[schemaName][entity.name] = entityDefinition;

    return schemas;
  }, {});
};

interface SQLEditorProps {
  query?: string;
  onQueryChange?: (value: string) => void;
  height?: string;
  dataEntities?: DataEntityListResponseItem[];
  onCodeSnippetSelectionChange?: (selectedCodeSnippet: string) => void;
  handleAddSelectedCodeSnippetToChat: () => void;
  setIsSqlEditorFocused: (isFocused: boolean) => void;
}

const SQLEditor = ({
  query = "",
  onQueryChange,
  dataEntities,
  onCodeSnippetSelectionChange: onCodeSnippetSelectionChange,
  handleAddSelectedCodeSnippetToChat,
  setIsSqlEditorFocused,
}: SQLEditorProps) => {
  const { theme } = useTheme();
  const postgresSchema = useMemo(() => createPostgresSchema(dataEntities), [dataEntities]);

  const isMac = useIsMac();

  // Add state for selection coordinates and text
  const [selection, setSelection] = useState({
    text: "",
    position: { x: 0, y: 0 },
    isVisible: false,
  });

  // Add useCallback to memoize the handler
  const handleUpdate = useCallback((viewUpdate: ViewUpdate) => {
    // Only process if the selection actually changed
    if (!viewUpdate.selectionSet) return;

    const sel = viewUpdate.state.selection.main;
    const selectedText = viewUpdate.state.sliceDoc(sel.from, sel.to);
    onCodeSnippetSelectionChange?.(selectedText);

    // Only update selection state if it's different from current
    if (selectedText) {
      const view = viewUpdate.view;
      const start = view.coordsAtPos(sel.from);

      if (start) {
        setSelection((prev) => {
          // Only update if the selection or position changed
          if (prev.text !== selectedText || prev.position.x !== start.left || prev.position.y !== start.top) {
            return {
              text: selectedText,
              position: { x: start.left, y: start.top },
              isVisible: true,
            };
          }
          return prev;
        });
      }
    } else {
      setSelection((prev) => {
        if (prev.isVisible) {
          return { ...prev, isVisible: false };
        }
        return prev;
      });
    }
  }, []);

  return (
    <div className="relative h-full">
      <CodeMirror
        value={query}
        onFocus={() => {
          setIsSqlEditorFocused(true);
        }}
        onBlur={() => {
          setIsSqlEditorFocused(false);
        }}
        placeholder="Write your query here..."
        height={"100%"}
        theme={theme === "dark" ? darkTheme : lightTheme}
        extensions={[
          sql({
            dialect: PostgreSQL,
            schema: postgresSchema as SQLNamespace,
            // If the schema is not public or main, use the first schema as the default schema
            defaultSchema: Object.keys(postgresSchema).includes("public")
              ? "public"
              : Object.keys(postgresSchema).includes("main")
              ? "main"
              : Object.keys(postgresSchema)[0],
            upperCaseKeywords: false,
          }),
        ]}
        onUpdate={handleUpdate}
        editable={true}
        readOnly={false}
        onChange={onQueryChange}
        className="h-full border-none"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: true,
          drawSelection: false,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
      />

      {/* Add the tooltip/popover */}
      {selection.isVisible && (
        <div
          className="absolute z-50 flex gap-2"
          style={{
            left: selection.position.x - 150,
            top: selection.position.y - 50, // Offset to show above the selection
          }}
        >
          <div className="bg-popover rounded-md shadow-md flex gap-2 z-20">
            <Button className="h-7 px-2 text-sm" onClick={handleAddSelectedCodeSnippetToChat}>
              {isMac ? <span className="text-2xs">⌘⇧L</span> : <span className="text-2xs">Ctrl⇧L</span>}
              <span className="ml-1 text-2xs">Add To Chat</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SQLEditor;
