import { useEffect, useState } from "react";
import Lottie from "lottie-react";

export function LottieUrl({ src, className, style, loop = true }: { src: string; className?: string; style?: React.CSSProperties; loop?: boolean }) {
  const [data, setData] = useState<unknown>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((r) => r.json())
      .then((j) => { if (!cancelled) setData(j); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [src]);
  if (!data) return <div className={className} style={style} />;
  return <Lottie animationData={data} loop={loop} className={className} style={style} />;
}
