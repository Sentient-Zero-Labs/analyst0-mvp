"use client";

import { useConversationsListQuery, useDeleteConversationMutation } from "@/services/chat/chat.service";
import { Conversation } from "@/services/chat/chat.schema";
import { formatDistanceToNow } from "date-fns";
import { LuTrash2 } from "react-icons/lu";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ConversationsList({
  organisationPublicId,
  charterId,
  onSelectConversation,
  currentConversationId,
}: {
  organisationPublicId: string;
  charterId: number;
  onSelectConversation: (conversationId: string | null) => void;
  currentConversationId: string | null;
}) {
  const { data: conversations, isLoading, error } = useConversationsListQuery({ organisationPublicId, charterId });
  const deleteConversationMutation = useDeleteConversationMutation({ organisationPublicId, charterId });

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversationMutation.mutateAsync({ conversationId });
      toast.success("Conversation deleted");
      if (currentConversationId === conversationId) {
        onSelectConversation(null);
      }
    } catch (error) {
      toast.error("Failed to delete conversation", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading conversations...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading conversations</div>;
  }

  if (!conversations || conversations.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No previous conversations</div>;
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Conversations</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectConversation(null)}
          className="text-xs"
        >
          New Chat
        </Button>
      </div>
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.conversation_id}
          conversation={conversation}
          isActive={currentConversationId === conversation.conversation_id}
          onSelect={() => onSelectConversation(conversation.conversation_id)}
          onDelete={(e) => handleDeleteConversation(conversation.conversation_id, e)}
        />
      ))}
    </div>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const timeAgo = formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true });
  
  return (
    <div
      className={`p-2 rounded cursor-pointer hover:bg-muted flex justify-between items-start ${
        isActive ? "bg-muted border border-border" : ""
      }`}
      onClick={onSelect}
    >
      <div className="flex-1 overflow-hidden">
        <div className="font-medium text-sm truncate">{conversation.title || "Untitled conversation"}</div>
        <div className="text-xs text-muted-foreground truncate">
          {conversation.last_message?.content || "No messages"}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{timeAgo}</div>
      </div>
      <button
        className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-muted-foreground/10"
        onClick={onDelete}
        aria-label="Delete conversation"
      >
        <LuTrash2 size={16} />
      </button>
    </div>
  );
}
