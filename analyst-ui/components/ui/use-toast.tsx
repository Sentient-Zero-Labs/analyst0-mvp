import { toast as sonnerToast } from "sonner";

export function useToast() {
  return {
    toast: (props: { title?: string; description?: string; variant?: string }) => {
      return sonnerToast(props.title, {
        description: props.description,
        className: props.variant === "destructive" ? "bg-destructive text-destructive-foreground" : "",
      });
    },
    dismiss: sonnerToast.dismiss,
  };
}

export { sonnerToast as toast }; 