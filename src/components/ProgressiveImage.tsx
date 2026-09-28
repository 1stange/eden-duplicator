import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  wrapperClassName?: string;
  responsiveWidths?: number[];
}

function optimizedUnsplashUrl(src: string, width: number): string | null {
  try {
    const url = new URL(src);
    if (url.hostname !== "images.unsplash.com") return null;

    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("q", "65");
    url.searchParams.set("w", String(width));
    return url.toString();
  } catch {
    return null;
  }
}

export function getResponsiveImageSources(src: string, widths: number[]) {
  const normalizedWidths = [...new Set(widths)]
    .filter((width) => Number.isFinite(width) && width > 0)
    .sort((a, b) => a - b);
  const candidates = normalizedWidths
    .map((width) => {
      const url = optimizedUnsplashUrl(src, width);
      return url ? `${url} ${width}w` : null;
    })
    .filter((candidate): candidate is string => Boolean(candidate));

  return {
    src: optimizedUnsplashUrl(src, normalizedWidths.at(-1) ?? 128) ?? src,
    srcSet: candidates.length > 0 ? candidates.join(", ") : undefined,
  };
}

/**
 * Progressive thumbnail loader:
 * - IntersectionObserver defers `src` assignment until near viewport
 * - Skeleton pulse until decoded
 * - Fades in on load
 */
export function ProgressiveImage({
  src,
  alt,
  className,
  wrapperClassName,
  responsiveWidths = [64, 96, 128],
  sizes,
  ...rest
}: Props) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const responsive = getResponsiveImageSources(src, responsiveWidths);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { setVisible(true); io.disconnect(); }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span className={cn("relative inline-block overflow-hidden bg-muted", !loaded && "animate-pulse", wrapperClassName)}>
      <img
        ref={ref}
        src={visible ? responsive.src : undefined}
        srcSet={visible ? responsive.srcSet : undefined}
        sizes={responsive.srcSet ? sizes : undefined}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        {...rest}
      />
    </span>
  );
}
