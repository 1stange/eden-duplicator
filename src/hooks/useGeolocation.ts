import { useEffect, useState } from "react";
import { CITY_COORDS } from "@/types";

const STORAGE_KEY = "eden_user_pos";
const FALLBACK_KEY = "eden_user_fallback_city";
const DENIED_KEY = "eden_geo_denied";

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

function loadFallback(): { pos: Pos; city: string } | null {
  const city = localStorage.getItem(FALLBACK_KEY);
  if (city && CITY_COORDS[city]) return { pos: CITY_COORDS[city], city };
  return null;
}

export function useGeolocation() {
  const cached = loadCached();
  const fallback = loadFallback();
  const [pos, setPos] = useState<Pos | null>(cached ?? fallback?.pos ?? null);
  const [isFallback, setIsFallback] = useState<boolean>(!cached && !!fallback);
  const [fallbackCity, setFallbackCity] = useState<string | null>(fallback?.city ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState<boolean>(localStorage.getItem(DENIED_KEY) === "1");

  const request = () => {
    if (!("geolocation" in navigator)) {
      setError("Géolocalisation indisponible sur cet appareil");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const next: Pos = [p.coords.latitude, p.coords.longitude];
        setPos(next); setError(null); setLoading(false); setIsFallback(false); setDenied(false);
        localStorage.removeItem(DENIED_KEY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ pos: next, ts: Date.now() }));
      },
      (err) => {
        setError(err.message);
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) { setDenied(true); localStorage.setItem(DENIED_KEY, "1"); }
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  };

  const setFallback = (city: string) => {
    const coords = CITY_COORDS[city];
    if (!coords) return;
    localStorage.setItem(FALLBACK_KEY, city);
    setPos(coords); setFallbackCity(city); setIsFallback(true); setError(null);
  };

  const clearFallback = () => {
    localStorage.removeItem(FALLBACK_KEY);
    setFallbackCity(null);
    if (isFallback) { setPos(null); setIsFallback(false); }
  };

  useEffect(() => {
    // Auto-request only when we have nothing and user hasn't previously denied
    if (!pos && !denied) request();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return { pos, error, loading, denied, isFallback, fallbackCity, request, setFallback, clearFallback };
}
