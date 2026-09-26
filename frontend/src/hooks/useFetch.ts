import { useCallback, useEffect, useState } from "react";
import { api, apiErrorMessage } from "../api/client";

export function useFetch<T>(
  url: string | null,
  deps: any[] = [],
  pollIntervalMs?: number,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialize deps to a stable string so useCallback has a primitive dep
  // instead of requiring an eslint-disable for the spread pattern.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const depsKey = JSON.stringify(deps);

  const load = useCallback(
    async (isBackground = false, signal?: AbortSignal) => {
      if (!url) return;
      if (!isBackground) {
        setLoading(true);
        setError(null); // Only clear errors on foreground loads to avoid flashing
      }
      try {
        const res = await api.get(url, { signal });
        setData(res.data);
      } catch (err: any) {
        if (err.name === "CanceledError" || err.message === "canceled") return;
        setError(apiErrorMessage(err));
      } finally {
        if (!isBackground) setLoading(false);
      }
    },
    // depsKey covers the dynamic deps; url is the primary trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url, depsKey],
  );

  useEffect(() => {
    const controller = new AbortController();
    load(false, controller.signal);

    let interval: ReturnType<typeof setInterval>;
    if (pollIntervalMs) {
      interval = setInterval(
        () => load(true, controller.signal),
        pollIntervalMs,
      );
    }
    return () => {
      controller.abort();
      if (interval) clearInterval(interval);
    };
  }, [load, pollIntervalMs]);

  return { data, loading, error, reload: () => load(false) };
}
