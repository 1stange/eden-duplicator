import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { Loader2, ImageOff } from "lucide-react";

interface LottieUrlProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  loop?: boolean;
  fallback?: React.ReactNode;
}

export function LottieUrl({ src, className, style, loop = true, fallback }: LottieUrlProps) {
  const [data, setData] = useState<unknown>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setData(null);

    const timeout = setTimeout(() => {
      if (!cancelled && !data) setStatus("error");
    }, 8000);

    fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => {
        if (cancelled) return;
        if (!j || typeof j !== "object" || !("v" in j)) throw new Error("Invalid Lottie JSON");
        setData(j);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [src]);

  if (status === "loading") {
    return (
      <div className={className} style={style} data-testid="lottie-loading" role="status" aria-label="Chargement animation">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div className={className} style={style} data-testid="lottie-fallback" role="img" aria-label="Animation indisponible">
        {fallback ?? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 rounded-2xl border border-border">
            <ImageOff className="h-8 w-8 text-muted-foreground/60" />
          </div>
        )}
      </div>
    );
  }

  return <Lottie animationData={data} loop={loop} className={className} style={style} data-testid="lottie-ready" />;
}
