"use client";

import Image from "next/image";
import { type KeyboardEvent, useCallback, useEffect, useState } from "react";
import { Messages } from "@/services/chat/chat.schema";
import { useChatMutation } from "@/services/chat/chat.service";
import { formatText } from "@/lib/utils/string.utils";
import { DynamicDataTable } from "@/components/ui/data-table";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { toast } from "sonner";
import Prism from "prismjs";
import { BsCopy } from "react-icons/bs";
import "prismjs/components/prism-sql";
import AutoResizeTextarea from "@/components/ui/auto-resize-textarea";
import { HttpException } from "@/lib/errors/HttpException";
import { LuDownload } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Parser } from "@json2csv/plainjs/index.js";
import { useParams } from "next/navigation";
import {
  useCreateCharterPlaygroundMutation,
  updateCharterPlayground,
} from "@/services/charterPlayground/charterPlayground.service";
import { GoCodeSquare } from "react-icons/go";
import { useCurrentSession } from "@/lib/auth/session/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Chat({
  organisationPublicId,
  charterId,
  selectedEntityIds,
  selectedCharterMetricIds,
  sampleQuestions,
}: {
  organisationPublicId: string;
  charterId: number;
  selectedEntityIds: number[];
  selectedCharterMetricIds: number[];
  sampleQuestions?: string[] | null;
}) {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Messages>([]);
  const [isThinking, setIsThinking] = useState(false);

  const chatMutation = useChatMutation({ organisationPublicId, charterId });

  const onEnter = useCallback(
    async (text: string) => {
      if (!text) return;

      messages.push({ role: "user", content: text });
      setMessages(() => [...messages]);
      setIsThinking(true);
      setInputText("");

      try {
        const messagesResponse = await chatMutation.mutateAsync({
          messages,
          selectedEntityIds,
          selectedCharterMetricIds,
        });

        setIsThinking(false);

        if (!messagesResponse) return;

        setMessages(messagesResponse as Messages);
      } catch (error) {
        const httpError = error as HttpException;
        setIsThinking(false);

        const lastMessage = messages.pop();

        setMessages(messages);
        setInputText(lastMessage?.content ?? "");
        if (httpError.status === 429) {
          toast.error(
            "You have reached your free tier daily limit. Please contact support@supranalyst.com to increase your limit."
          );
        } else {
          toast.error("Something went wrong and we are looking into it. Please try again later.");
        }
      }
    },
    [messages, selectedEntityIds, selectedCharterMetricIds]
  );

  return (
    <div className="flex w-full flex-col items-center relative min-h-screen">
      <h3 className="text-sm  italic mt-3 px-2 text-center">
        Hi, I am your <span className="font-semibold">AI data assistant</span>. I will help you find answers to your
        data related questions.
      </h3>
      {(!messages || messages?.length === 0) && sampleQuestions && sampleQuestions?.length > 0 && (
        <div className="px-10 mt-4">
          <h3 className="text-base font-semibold text-center">Sample Questions</h3>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {sampleQuestions?.map((question, idx) => (
              <span
                key={idx}
                className="border rounded-md p-2 cursor-pointer hover:bg-foreground/10 bg-muted text-sm"
                onClick={() => onEnter(question)}
              >
                {question}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="h-full w-full overflow-auto pb-44">
        <DisplayMessages messages={messages} isThinking={isThinking} />
      </div>
      <div className="fixed bottom-3 flex w-full justify-center">
        <div className="px-4 w-full md:w-3/5 md:px-20 mx-auto">
          <ChatInput inputText={inputText} setInputText={setInputText} onEnter={onEnter} isThinking={isThinking} />
        </div>
      </div>
    </div>
  );
}

const DisplayMessages = ({ messages, isThinking }: { messages: Messages; isThinking: boolean }) => {
  return (
    <div className="mt-5 flex w-full flex-col gap-4 text-sm md:text-base px-5">
      {messages?.map((message, index) => {
        const isUser = message.role === "user";
        const isAssistant = message.role === "assistant" && !message.data_call;
        const isDataCall = !!message.data_call;

        if (isUser) {
          return (
            <div key={index} className="w-full">
              <div className="rounded-lg p-2 bg-muted  flex flex-col gap-2">
                <div className="text-sm font-bold italic">User</div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          );
        }

        if (isAssistant) {
          return (
            <div key={index} className="w-full">
              <div className="rounded-lg p-2 border-foreground/20 flex flex-col gap-2">
                <div className="text-sm font-bold italic">Assistant</div>
                <div
                  className="whitespace-pre-wrap leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: formatText(message.content!),
                  }}
                />
              </div>
            </div>
          );
        }

        // Data Call
        if (isDataCall) {
          const query = message.data_call!.query!;
          const dataEntityNames = message.data_call!.data_entity_names;
          const explanation = message.data_call!.explanation;
          const data = message.data_call!.data;

          const highlightedCode = Prism.highlight(query, Prism.languages.sql, "sql");

          return (
            <div
              key={index}
              className="w-full overflow-auto rounded-lg border border-foreground/20 p-2 flex flex-col gap-2"
            >
              <div className="text-sm font-bold italic">Assistant</div>

              <div className="flex flex-col gap-2 text-sm">
                {/* Query */}
                <DisplayQuery query={query} highlightedCode={highlightedCode} />

                {dataEntityNames && dataEntityNames.length > 0 && (
                  <div className="w-full flex gap-1">
                    <span className="font-semibold shrink-0">Data Entities:</span>{" "}
                    <div className="flex flex-wrap gap-1">
                      {dataEntityNames?.map((entity) => (
                        <span key={entity} className="bg-foreground/5 px-1 py-0.5 rounded">
                          {entity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="w-full">
                  <span className="font-semibold">Explanation:</span> {explanation}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">Data: </span>
                    <DownloadDataButton data={data ?? []} />
                    <CopyDataToCSVButton data={data ?? []} />
                  </div>
                  {data && data.length > 0 ? (
                    <div className="w-min max-w-full bg-background border rounded-sm overflow-hidden">
                      <DynamicDataTable data={data ?? []} tableHeight={400} />
                    </div>
                  ) : (
                    <span className="italic">No data found</span>
                  )}
                </div>
              </div>
            </div>
          );
        }
      })}

      {isThinking && <DisplayAssistantThinking />}
    </div>
  );
};

function CopyDataToCSVButton({ data }: { data: Record<string, unknown>[] }) {
  const handleCopy = () => {
    const parser = new Parser();
    const csv = parser.parse(data);
    navigator.clipboard.writeText(csv);
    toast.success("Data copied to clipboard");
  };

  return (
    <Button variant="outline" className="rounded h-5 px-1" onClick={handleCopy}>
      <span className="text-2xs">Copy CSV</span>
      <BsCopy className="size-3.5 ml-1" />
    </Button>
  );
}

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
        <Button variant="outline" className="rounded h-5 px-1">
          <span className="text-2xs">Download</span>
          <LuDownload className="size-3.5 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="rounded-sm">
        <DropdownMenuItem className="text-xs" asChild>
          <span onClick={handleDownload}>Export data to .csv</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const DisplayAssistantThinking = () => {
  const processMessages = [
    "Understanding your question",
    "Analyzing data context",
    "Formulating SQL query",
    "Executing query",
    "Preparing response",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);

  useEffect(() => {
    const timer = Math.random() * 3000 + 1000;
    const timeout = setTimeout(() => {
      setCurrentMessageIndex((prevIndex) => {
        if (prevIndex === processMessages.length - 1) {
          clearTimeout(timeout);
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, timer); // Random interval between 1-4 seconds

    return () => clearTimeout(timeout);
  }, [currentMessageIndex]);

  return (
    <div className="w-full">
      <div className="rounded-lg border border-foreground/20 p-2">
        <div className="text-sm font-bold italic">Assistant</div>
        <div className="flex h-16 w-full justify-center">
          <DotLottieReact src="/robot-thinking.lottie" loop={true} speed={1} autoplay={true} className="scale-150" />
        </div>
        <div className="text-center text-sm text-muted-foreground">{processMessages[currentMessageIndex]}</div>
      </div>
    </div>
  );
};

const DisplayQuery = ({ query, highlightedCode }: { query: string; highlightedCode: string }) => {
  const [showMore, setShowMore] = useState(false);
  const [isOpeningInPlayground, setIsOpeningInPlayground] = useState(false);
  const params = useParams();
  const { session } = useCurrentSession();

  const { mutateAsync: createPlayground } = useCreateCharterPlaygroundMutation({
    organisationPublicId: params.organisationPublicId as string,
    charterId: Number(params.charterId),
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const handleOpenInPlayground = async () => {
    setIsOpeningInPlayground(true);
    try {
      const playground = await createPlayground();
      await updateCharterPlayground(
        {
          organisationPublicId: params.organisationPublicId as string,
          charterId: Number(params.charterId),
          playgroundPublicId: playground.public_id,
          playground: {
            query: query,
            name: "Query from Chat",
          },
        },
        session!.accessToken!
      );
      window.open(
        `/organisation/${params.organisationPublicId}/charters/${params.charterId}/playground/${playground.public_id}`,
        "_blank"
      );
    } catch {
      toast.error("Failed to open in playground. Please try again.");
    } finally {
      setIsOpeningInPlayground(false);
    }
  };

  return (
    <div className="w-full font-semibold">
      <span className="font-semibold">Query:</span>

      <div className="relative">
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {/* Copy Sql Query */}
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button onClick={() => handleCopyCode(query)} className="p-1 hover:bg-muted rounded">
                  <BsCopy className="size-3.5 hover:opacity-70 hover:scale-110" strokeWidth={0.5} />
                  <span className="sr-only">Copy</span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="px-1 py-0.5 rounded flex items-center gap-1">
                <p className="text-2xs">Copy Query</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Open in Playground */}
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={handleOpenInPlayground}
                  className="p-1 hover:bg-muted rounded group relative"
                  disabled={isOpeningInPlayground}
                >
                  <GoCodeSquare className="size-4 hover:opacity-70 hover:scale-110" strokeWidth={0.25} />
                </button>
              </TooltipTrigger>
              <TooltipContent className="px-1 py-0.5 rounded flex items-center gap-1">
                <p className="text-2xs">Open in playground</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <pre className={`language-sql !pr-20 !bg-background border rounded-md !pb-6`}>
          <code
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
            className={`text-sm ${showMore ? "" : "line-clamp-6"}`}
          />
        </pre>

        <span
          onClick={() => setShowMore((prev) => !prev)}
          className="text-xs absolute bottom-0 right-1/2 translate-x-1/2 hover:underline cursor-pointer bg-foreground/10 px-1 rounded-t border-b"
        >
          {showMore ? "Show less" : "Show more"}
        </span>
      </div>
    </div>
  );
};

// Chat Input
const ChatInput = ({
  inputText,
  setInputText,
  onEnter,
  isThinking,
}: {
  inputText: string;
  setInputText: (text: string) => void;
  onEnter: (text: string, imageUrl?: string) => void;
  isThinking: boolean;
}) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      if (inputText) {
        onEnter(inputText);
      } else {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  };

  return (
    <div className="relative">
      <AutoResizeTextarea
        placeholder="Ask any question related to the data agent..."
        text={inputText}
        disabled={isThinking}
        onTextChange={setInputText}
        onKeyDown={handleKeyDown}
        minHeight={80}
        maxHeight={300}
        className="pb-7 pr-10 !text-base min-h-[40px]"
      />

      <div className={`absolute bottom-0 right-2 flex h-full gap-2 pt-1`}>
        <div className="relative h-8 w-8">
          <Image
            onClick={() => onEnter(inputText)}
            src={"/right-arrow.svg"}
            alt=""
            fill
            className={`cursor-pointer object-contain ${inputText ? "opacity-80 hover:opacity-100" : "opacity-50"} `}
          />
        </div>
      </div>

      <div className="absolute bottom-2 right-2 text-2xs flex items-center gap-3">
        <span className="text-3xs flex items-center gap-1 flex-nowrap">
          <span className="bg-foreground/10 px-1 rounded text-nowrap">⇧ + ⏎</span>{" "}
          <span className="line-clamp-1">new line</span>
        </span>
        <span className="text-3xs flex items-center gap-1 flex-nowrap">
          <span className="bg-foreground/10 px-1 rounded text-nowrap">⏎</span>{" "}
          <span className="line-clamp-1">chat</span>
        </span>
      </div>
    </div>
  );
};
