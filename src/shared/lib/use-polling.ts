import { useEffect, useRef } from "react";

/**
 * Calls `callback` every `intervalMs` while `enabled` is true. Stops
 * automatically when `enabled` flips to false (no further network calls).
 */
export function usePolling(
  callback: () => void,
  intervalMs: number,
  enabled: boolean,
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => callbackRef.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
