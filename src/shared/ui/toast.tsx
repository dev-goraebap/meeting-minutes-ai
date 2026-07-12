"use client";

import { useCallback, useRef, useState } from "react";

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((text: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMessage(text);
    timeoutRef.current = setTimeout(() => setMessage(null), 2000);
  }, []);

  return { message, showToast };
}

export function ToastViewport({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center">
      <div className="rounded-[var(--radius-pill)] bg-ink px-4 py-2 text-body text-white shadow-[var(--shadow-token-md)]">
        {message}
      </div>
    </div>
  );
}
