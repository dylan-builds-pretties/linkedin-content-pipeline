"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

interface AIActionButtonProps extends Omit<ButtonProps, "onClick" | "onError"> {
  endpoint: string;
  payload?: Record<string, unknown>;
  onSuccess?: (data: { success: boolean; cost?: number }) => void;
  onRequestError?: (error: string) => void;
  children: React.ReactNode;
}

export function AIActionButton({
  endpoint,
  payload = {},
  onSuccess,
  onRequestError,
  children,
  disabled,
  ...buttonProps
}: AIActionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess?.(data);
      } else {
        onRequestError?.(data.error || "An error occurred");
      }
    } catch (error) {
      onRequestError?.(String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading || disabled}
      {...buttonProps}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Sparkles className="h-4 w-4 mr-2" />
      )}
      {children}
    </Button>
  );
}
