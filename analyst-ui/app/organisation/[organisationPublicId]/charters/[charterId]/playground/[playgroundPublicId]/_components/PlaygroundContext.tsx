"use client";

import {
  ModelNameMapping,
  ModelNames,
  PlaygroundChatInput,
} from "@/services/charterPlaygroundChat/charterPlaygroundChat.schema";
import { usePlaygroundChatMutation } from "@/services/charterPlaygroundChat/charterPlaygroundChat.service";
import { toast } from "@/components/ui/toast";
import RobotLoader from "@/components/ui/robot-loader";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { PlaygroundChatMessages } from "./PlaygroundChatMessages";
import { CharterMetricList } from "@/services/charterMetric/charterMetric.schema";
import { DataEntityListResponseItem } from "@/services/dataEntity/dataEntity.schema";
import { ContextSection } from "./ContextSection";
import { ChatInput } from "./PlaygroundChatInput";
import { Button } from "@/components/ui/button";
import { LuPlus } from "react-icons/lu";
import { HttpException } from "@/lib/errors/HttpException";
import { isArrayNotEmpty } from "@/lib/utils/array.utils";

interface PlaygroundContextProps {
  charterName?: string;
  playgroundPublicId: string;
  dataEntities: DataEntityListResponseItem[];
  charterMetrics: CharterMetricList;
  chatContent: string;
  setChatContent: Dispatch<SetStateAction<string>>;
  organisationPublicId: string;
  charterId: number;
  query: string;
  selectedCodeEditorSnippet: string;
  handleGeneratedCodeAction: (code: string, action: "replace" | "append") => void;
}

export default function PlaygroundContext({
  charterName,
  playgroundPublicId,
  dataEntities,
  charterMetrics,
  chatContent,
  setChatContent,
  organisationPublicId,
  charterId,
  query,
  selectedCodeEditorSnippet,
  handleGeneratedCodeAction,
}: PlaygroundContextProps) {
  // This will be used to scroll to the loader when a new message is sent
  const loaderRef = useRef<HTMLDivElement>(null);

  const [selectedModelName, setSelectedModelName] = useState<ModelNames>("claude-3.5-sonnet");

  const [selectedEntityIds, setSelectedEntityIds] = useState<number[]>([]);
  const [selectedMetricIds, setSelectedMetricIds] = useState<number[]>([]);
  const [isQueryInContext, setIsQueryInContext] = useState(true);
  const [isChatInputFocused, setIsChatInputFocused] = useState(false);

  const [isSendingChatMessage, setIsSendingChatMessage] = useState(false);
  const [playgroundChatInput, setPlaygroundChatInput] = useState<PlaygroundChatInput>({
    messages: [],
    model_type: "large",
    client_name: "claude",
  });

  const { mutateAsync: playgroundChatMutation } = usePlaygroundChatMutation({
    playgroundPublicId,
    organisationPublicId,
    charterId,
  });

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && !event.shiftKey) {
      if (event.key === "Enter" && !event.shiftKey && isChatInputFocused) {
        event.preventDefault();
        handlePlaygroundChat();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [chatContent, selectedEntityIds, selectedMetricIds, selectedCodeEditorSnippet, query, isChatInputFocused]);

  const handlePlaygroundChat = async () => {
    if (!chatContent) return;

    playgroundChatInput.model_type = ModelNameMapping[selectedModelName as ModelNames].model_type;
    playgroundChatInput.client_name = ModelNameMapping[selectedModelName as ModelNames].client_name;

    playgroundChatInput.messages.push({
      role: "user",
      content: chatContent,
      context: {
        data_entity_ids: selectedEntityIds,
        charter_metric_ids: selectedMetricIds,
        selected_texts: [selectedCodeEditorSnippet],
        query: isQueryInContext ? query : undefined,
      },
    });

    setPlaygroundChatInput({
      ...playgroundChatInput,
    });

    setIsSendingChatMessage(true);
    setChatContent("");

    loaderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
      const response = await playgroundChatMutation({ playgroundChatInput });
      setPlaygroundChatInput({ ...response });
    } catch (error) {
      const httpError = error as HttpException;

      // Remove the last message from the array
      const lastMessage = playgroundChatInput.messages.pop();

      setPlaygroundChatInput({
        ...playgroundChatInput,
      });

      setChatContent(lastMessage?.content || "");

      if (httpError.status === 429) {
        toast.error(httpError.message);
      } else {
        toast.error("There was an error generating a response. Please try again in a moment or try a different model.");
      }
    } finally {
      setIsSendingChatMessage(false);
    }
  };

  const handleNewChat = () => {
    setPlaygroundChatInput({ messages: [], ...ModelNameMapping[selectedModelName as ModelNames] });
    setSelectedEntityIds([]);
    setSelectedMetricIds([]);
  };

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold line-clamp-1">Data Agent ({charterName})</h2>
          <Button onClick={handleNewChat} className="h-6 text-2xs px-2 rounded-sm" variant="outline">
            New Chat <LuPlus className="ml-1" strokeWidth={3} />
          </Button>
        </div>
        <span className="text-xs opacity-60">You can chat to generate, correct and refine your SQL queries.</span>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        {isArrayNotEmpty(playgroundChatInput.messages) ? (
          <PlaygroundChatMessages
            messages={playgroundChatInput.messages}
            handleGeneratedCodeAction={handleGeneratedCodeAction}
          />
        ) : (
          <div className="flex flex-col justify-center flex-1 h-full px-4">
            <span className="text-sm text-center opacity-40">
              Select data entities or metrics <br /> below, and start chatting to
              <br /> generate, correct and refine
              <br /> your SQL queries.
            </span>
          </div>
        )}
        <div ref={loaderRef} className="flex justify-center items-center pb-28">
          {isSendingChatMessage && <RobotLoader className="size-20" />}
        </div>
      </div>

      <div className="space-y-2">
        <ContextSection
          selectedEntityIds={selectedEntityIds}
          selectedMetricIds={selectedMetricIds}
          setSelectedEntityIds={setSelectedEntityIds}
          setSelectedMetricIds={setSelectedMetricIds}
          dataEntities={dataEntities}
          charterMetrics={charterMetrics}
          isQueryInContext={isQueryInContext}
          setIsQueryInContext={setIsQueryInContext}
        />
        <ChatInput
          chatContent={chatContent}
          setChatContent={setChatContent}
          handlePlaygroundChat={handlePlaygroundChat}
          setIsChatInputFocused={setIsChatInputFocused}
          selectedModelName={selectedModelName}
          setSelectedModelName={setSelectedModelName}
        />
      </div>
    </div>
  );
}
