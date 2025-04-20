"use client";

import Chat from "./Chat";
import { useDataEntitiesForCharterQuery } from "@/services/dataEntity/dataEntity.service";
import { useState } from "react";
import ChatContext from "./ChatContext";
import { useCharterQuery } from "@/services/charter/charter.service";
import { useCharterMetricListQuery } from "@/services/charterMetric/charterMetric.service";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import ConversationsList from "./ConversationsList";
import { useConversationQuery } from "@/services/chat/chat.service";
import { useLocalStorage } from "@/hooks/use-local-storage";


export default function ChatPage({
  organisationPublicId,
  charterId,
}: {
  organisationPublicId: string;
  charterId: number;
}) {
  // Store current conversation ID in local storage to persist between page refreshes
  const [currentConversationId, setCurrentConversationId] = useLocalStorage<string | null>(
    `chat-conversation-${charterId}`,
    null
  );

  const { data: conversationMessages, isLoading } = useConversationQuery({
    organisationPublicId,
    charterId,
    conversationId: currentConversationId || "",
    enabled: !!currentConversationId,
  });

  const [selectedEntityIds, setSelectedEntityIds] = useState<number[]>([]);
  const [selectedMetricIds, setSelectedMetricIds] = useState<number[]>([]);

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

  const handleSelectConversation = (conversationId: string | null) => {
    setCurrentConversationId(conversationId);
  };

  return (
    <div className="h-[calc(100vh-var(--height-header))] w-full">
      <ResizablePanelGroup direction="horizontal">
        {/* Conversations List Panel */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="h-full bg-sidebar">
            <ConversationsList
              organisationPublicId={organisationPublicId}
              charterId={charterId}
              onSelectConversation={handleSelectConversation}
              currentConversationId={currentConversationId}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Chat Section (Scrollable) */}
        <ResizablePanel defaultSize={55} minSize={40}>
          <div className="flex h-full items-center justify-center">
            <ScrollArea className="h-full w-full">
              <div>
                <Chat
                  organisationPublicId={organisationPublicId}
                  charterId={charterId}
                  selectedEntityIds={selectedEntityIds}
                  selectedCharterMetricIds={selectedMetricIds}
                  sampleQuestions={charter?.example_questions}
                  conversationId={currentConversationId}
                  initialMessages={conversationMessages || []}
                  isLoadingConversation={isLoading && !!currentConversationId}
                />
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Chat Context Section (Sticky) */}
        <ResizablePanel className="hidden md:block" defaultSize={25} minSize={20} maxSize={35}>
          <div className="flex h-full items-center justify-center bg-sidebar sticky top-0">
            <div className="sticky top-0 h-full w-full p-3">
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold">Data Agent ({charter?.name})</h2>
                <span className="text-xs opacity-60">You can chat and ask questions about your data</span>
              </div>
              <ChatContext
                dataEntities={dataEntities || []}
                charterMetrics={charterMetrics || []}
                selectedEntityIds={selectedEntityIds || []}
                setSelectedEntityIds={setSelectedEntityIds}
                selectedMetricIds={selectedMetricIds || []}
                setSelectedMetricIds={setSelectedMetricIds}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
