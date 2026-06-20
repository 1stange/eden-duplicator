import { useEffect, useState } from "react";

const STORAGE_KEY = "eden_user_pos";

export type Pos = [number, number];

function loadCached(): Pos | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { pos, ts } = JSON.parse(raw);
    if (Date.now() - ts < 24 * 3600 * 1000) return pos as Pos;
  } catch {}
  return null;
}

export function useGeolocation() {
  const [pos, setPos] = useState<Pos | null>(loadCached());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const request = () => {
    if (!("geolocation" in navigator)) {
      setError("Géolocalisation indisponible");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const next: Pos = [p.coords.latitude, p.coords.longitude];
        setPos(next);
        setError(null);
        setLoading(false);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ pos: next, ts: Date.now() }));
      },
      (err) => { setError(err.message); setLoading(false); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  };

  useEffect(() => { if (!pos) request(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return { pos, error, loading, request };
}
