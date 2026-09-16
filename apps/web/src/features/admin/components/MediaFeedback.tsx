import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";

export type MediaFeedbackState = "idle" | "uploading" | "success" | "error";

export function MediaFeedback({
  state,
  message,
}: {
  state: MediaFeedbackState;
  message: string;
}) {
  if (state === "idle" || !message) return null;

  return (
    <p
      className={`cms-media-feedback ${state}`}
      role={state === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      {state === "uploading" && <LoaderCircle className="spin" size={16} />}
      {state === "success" && <CheckCircle2 size={16} />}
      {state === "error" && <AlertCircle size={16} />}
      <span>{message}</span>
    </p>
  );
}
