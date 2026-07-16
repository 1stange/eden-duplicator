import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { Loader2, ImageOff } from "lucide-react";

interface LottieUrlProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  loop?: boolean;
  fallback?: React.ReactNode;
  /** Optional skeleton shown while the JSON is being fetched. Falls back to a subtle spinner. */
  skeleton?: React.ReactNode;
}

// Module-level cache shared across every <LottieUrl> instance.
type CacheEntry = { promise: Promise<unknown>; data?: unknown; failed?: boolean };
const cache = new Map<string, CacheEntry>();

function fetchLottie(src: string): Promise<unknown> {
  const existing = cache.get(src);
  if (existing) return existing.promise;

  const promise = fetch(src)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((j) => {
      if (!j || typeof j !== "object" || !("v" in j)) throw new Error("Invalid Lottie JSON");
      const entry = cache.get(src);
      if (entry) entry.data = j;
      return j;
    })
    .catch((e) => {
      const entry = cache.get(src);
      if (entry) entry.failed = true;
      throw e;
    });

  cache.set(src, { promise });
  return promise;
}

/** Warm the cache for a batch of Lottie URLs. Idempotent + concurrent-safe. */
export function preloadLotties(urls: string[]) {
  if (typeof window === "undefined") return;
  const run = () => urls.forEach((u) => u && fetchLottie(u).catch(() => {}));
  // Use requestIdleCallback when available so preload never fights first paint.
  const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void) => number);
  if (ric) ric(run);
  else setTimeout(run, 0);
}

export function LottieUrl({ src, className, style, loop = true, fallback, skeleton }: LottieUrlProps) {
  const cached = cache.get(src);
  const initialData = cached?.data;
  const initialFailed = cached?.failed;

  const [data, setData] = useState<unknown>(initialData ?? null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    initialData ? "ready" : initialFailed ? "error" : "loading"
  );

  useEffect(() => {
    let cancelled = false;
    const c = cache.get(src);
    if (c?.data) {
      setData(c.data);
      setStatus("ready");
      return;
    }
    if (c?.failed) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    setData(null);

    const timeout = window.setTimeout(() => {
      if (!cancelled) setStatus((s) => (s === "loading" ? "error" : s));
    }, 8000);

    fetchLottie(src)
      .then((j) => {
        if (cancelled) return;
        setData(j);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [src]);

  if (status === "loading") {
    return (
      <div
        className={className}
        style={style}
        data-testid="lottie-loading"
        role="status"
        aria-label="Chargement animation"
      >
        {skeleton ?? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl animate-pulse">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        )}
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div
        className={className}
        style={style}
        data-testid="lottie-fallback"
        role="img"
        aria-label="Animation indisponible"
      >
        {fallback ?? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 rounded-2xl border border-border">
            <ImageOff className="h-8 w-8 text-muted-foreground/60" />
          </div>
        )}
      </div>
    );
  }

  return (
    <Lottie
      animationData={data}
      loop={loop}
      className={className}
      style={style}
      data-testid="lottie-ready"
    />
  );
}
