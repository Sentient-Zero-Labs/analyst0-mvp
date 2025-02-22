import { useEffect, useRef } from "react";
import { Textarea } from "./textarea";
import { cn } from "@/lib/utils";

export default function AutoResizeTextarea(
  props: React.ComponentPropsWithoutRef<typeof Textarea> & {
    minHeight: number;
    maxHeight: number;
    text: string;
    onTextChange: (text: string) => void;
    className?: string;
  }
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { maxHeight, minHeight, text, onTextChange, ...restProps } = props;

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight); // min 80px, max 260px
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [text]);

  return (
    <Textarea
      {...restProps}
      ref={textareaRef}
      className={cn("resize-none pb-6 ", restProps.className)}
      value={text}
      onChange={(e) => {
        restProps.onChange?.(e);
        onTextChange?.(e.target.value);
      }}
    />
  );
}
