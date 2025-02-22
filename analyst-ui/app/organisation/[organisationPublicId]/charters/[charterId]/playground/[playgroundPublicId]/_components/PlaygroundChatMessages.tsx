import { PlaygroundMessage } from "@/services/charterPlaygroundChat/charterPlaygroundChat.schema";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BsCopy } from "react-icons/bs";
import { CgAddR } from "react-icons/cg";
import { MdOutlineLoop } from "react-icons/md";

import { toast } from "@/components/ui/toast";
import Prism from "prismjs";
import "prismjs/components/prism-sql";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const PlaygroundChatMessages = ({
  messages,
  handleGeneratedCodeAction,
}: {
  messages: PlaygroundMessage[];
  handleGeneratedCodeAction: (code: string, action: "replace" | "append") => void;
}) => {
  return (
    <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 text-sm">
      {messages.map((message, idx) => {
        if (message.role === "user") {
          return <UserMessage key={`message-${idx}`} message={message} />;
        }
        return (
          <AssistantMessage
            key={`message-${idx}`}
            message={message}
            handleGeneratedCodeAction={handleGeneratedCodeAction}
          />
        );
      })}
    </div>
  );
};

const UserMessage = ({ message }: { message: PlaygroundMessage }) => {
  return (
    <div className="flex gap-1 items-center p-1.5 rounded-sm border whitespace-pre-wrap bg-background">
      {message.content}
    </div>
  );
};

const AssistantMessage = ({
  message,
  handleGeneratedCodeAction,
}: {
  message: PlaygroundMessage;
  handleGeneratedCodeAction: (code: string, action: "replace" | "append") => void;
}) => {
  const content = message.content;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const parts = content.split(/(```sql[\s\S]*?```)/);

  return (
    <div className="flex flex-col p-1 shadow-sm">
      {parts.map((part, index) => {
        if (part.startsWith("```sql")) {
          const codeMatch = part.match(/```sql\n([\s\S]*?)```/);
          if (codeMatch) {
            const code = codeMatch[1];
            const highlightedCode = Prism.highlight(code, Prism.languages.sql, "sql");

            return (
              <div key={index} className="relative">
                <div className="flex justify-end mr-2">
                  <div className="flex gap-2 rounded-sm pb-0.5">
                    <CodeActionButton content="Append Query">
                      <button onClick={() => handleGeneratedCodeAction(code, "append")}>
                        <CgAddR className="size-3.5 hover:opacity-70 hover:scale-110" />
                      </button>
                    </CodeActionButton>
                    <CodeActionButton content="Replace Query">
                      <button onClick={() => handleGeneratedCodeAction(code, "replace")}>
                        <MdOutlineLoop className="size-4 hover:opacity-70 hover:scale-110" />
                      </button>
                    </CodeActionButton>

                    <CodeActionButton content="Copy to Clipboard">
                      <button onClick={() => handleCopyCode(code)}>
                        <BsCopy className="size-3 hover:opacity-70 hover:scale-110" strokeWidth={0.7} />
                      </button>
                    </CodeActionButton>
                  </div>
                </div>
                <pre className="language-sql !text-xs rounded !mt-0">
                  <code dangerouslySetInnerHTML={{ __html: highlightedCode }} className="text-xs" />
                </pre>
              </div>
            );
          }
        }

        return (
          part && (
            <ReactMarkdown
              key={index}
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ ...props }) => <p className="whitespace-pre-wrap mb-4 inline" {...props} />,
                h1: ({ ...props }) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                h2: ({ ...props }) => <h2 className="text-xl font-bold mb-3" {...props} />,
                h3: ({ ...props }) => <h3 className="text-lg font-bold mb-2" {...props} />,
                ul: ({ ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                ol: ({ ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
                li: ({ ...props }) => <li className="mb-2" {...props} />,
                code: ({ inline, ...props }: { inline?: boolean } & React.HTMLProps<HTMLElement>) =>
                  inline ? (
                    <code className="bg-foreground/5 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                  ) : (
                    <code className="bg-foreground/5 px-1 rounded text-sm font-mono my-2" {...props} />
                  ),
                blockquote: ({ ...props }) => (
                  <blockquote className="border-l-4 border-muted pl-4 italic my-4" {...props} />
                ),
                a: ({ ...props }) => <a className="text-primary hover:underline" {...props} />,
                strong: ({ ...props }) => <strong className="font-bold" {...props} />,
                em: ({ ...props }) => <em className="italic" {...props} />,
              }}
            >
              {part}
            </ReactMarkdown>
          )
        );
      })}
    </div>
  );
};

const CodeActionButton = ({ children, content }: { children: React.ReactNode; content: React.ReactNode }) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="px-1 py-0.5 rounded">
          <p className="text-2xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
