"use client";

import { cn } from "@/lib/utils";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function RobotLoader({ className }: { className?: string }) {
  return (
    <div className={"flex h-full w-full justify-center items-center"}>
      <div className={cn("size-20", className)}>
        <DotLottieReact src="/robot-thinking.lottie" loop={true} speed={1} autoplay={true} className="size-full" />
      </div>
    </div>
  );
}
