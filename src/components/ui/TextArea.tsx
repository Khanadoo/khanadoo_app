import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function TextArea({
  label,
  error,
  className,
  ...props
}: TextAreaProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium">
          {label}
        </label>
      )}

      <textarea
        className={cn(
          "w-full rounded-lg border border-gray-300 px-3 py-2 outline-none",
          "focus:ring-2 focus:ring-blue-500",
          error && "border-red-500",
          className
        )}
        {...props}
      />

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}