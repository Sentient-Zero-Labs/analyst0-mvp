import { Dispatch, SetStateAction } from "react";
import AutoResizeTextarea from "@/components/ui/auto-resize-textarea";
import { BiSend } from "react-icons/bi";
import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from "@/components/ui/select";
import { ModelNameMapping, ModelNames } from "@/services/charterPlaygroundChat/charterPlaygroundChat.schema";
// import { useIsMac } from "@/hooks/use-is-mac";

interface ChatInputProps {
  chatContent: string;
  setChatContent: Dispatch<SetStateAction<string>>;
  handlePlaygroundChat: () => void;
  setIsChatInputFocused: Dispatch<SetStateAction<boolean>>;
  selectedModelName: ModelNames;
  setSelectedModelName: Dispatch<SetStateAction<ModelNames>>;
}

export const ChatInput = ({
  chatContent,
  setChatContent,
  handlePlaygroundChat,
  setIsChatInputFocused,
  selectedModelName,
  setSelectedModelName,
}: ChatInputProps) => {
  // const isMac = useIsMac();

  return (
    <div className="relative">
      <AutoResizeTextarea
        minHeight={80}
        maxHeight={300}
        onFocus={() => setIsChatInputFocused(true)}
        onBlur={() => setIsChatInputFocused(false)}
        text={chatContent}
        className="pb-7"
        onTextChange={setChatContent}
        placeholder="Ask any question related to the data agent..."
      />
      <div className="absolute bottom-1 right-2 text-foreground/70 flex items-center gap-3 justify-between w-full pl-4">
        <ModelSelectDropdown selectedModelName={selectedModelName} setSelectedModelName={setSelectedModelName} />
        <div className="flex items-center gap-3">
          <span className="text-3xs flex items-center gap-1 flex-nowrap">
            <span className="bg-foreground/10 px-1 rounded text-nowrap">⇧ + ⏎</span>{" "}
            <span className="line-clamp-1">new line</span>
          </span>
          <span className="text-3xs flex items-center gap-1 flex-nowrap">
            <span className="bg-foreground/10 px-1 rounded text-nowrap">⏎</span>{" "}
            <span className="line-clamp-1">chat</span>
          </span>
          {/* {isMac ? <span className="text-3xs">(⏎ to chat)</span> : <span className="text-3xs">(⏎ to chat)</span>}{" "} */}
          {/* {isMac ? <span className="text-3xs">(⌘+⏎ to chat)</span> : <span className="text-3xs">(Ctrl+⏎ to chat)</span>}{" "} */}
          <BiSend
            className="size-5 cursor-pointer hover:opacity-60 hover:scale-105 text-foreground/80"
            onClick={handlePlaygroundChat}
          />
        </div>
      </div>
    </div>
  );
};

const ModelSelectDropdown = ({
  selectedModelName,
  setSelectedModelName,
}: {
  selectedModelName: ModelNames;
  setSelectedModelName: Dispatch<SetStateAction<ModelNames>>;
}) => {
  const models = Object.keys(ModelNameMapping);

  return (
    <Select value={selectedModelName} onValueChange={(value) => setSelectedModelName(value as ModelNames)}>
      <SelectTrigger className="w-36 h-3 rounded-sm text-3xs focus:ring-0">
        <SelectValue placeholder="Select model" />
      </SelectTrigger>
      <SelectContent className="text-3xs">
        {models.map((model) => (
          <SelectItem className="text-3xs cursor-pointer" key={model} value={model}>
            {model}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
