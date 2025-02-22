import { cn } from "../../lib/utils";

export default function Loader({ className, flexible }: { className?: string; flexible?: boolean }) {
  return !flexible ? (
    <div className={cn("h-10 w-10 animate-spin rounded-full border-[3px] border-t-white ", className)}></div>
  ) : (
    <div
      className="mx-auto h-full
        w-full animate-spin rounded-full border-4 border-t-white "
    ></div>
  );
}
