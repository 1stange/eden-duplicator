import { CITY_COORDS } from "@/types";

export function haversineKm(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function distanceFromUserToCity(userPos: [number, number] | null, city: string): number | null {
  if (!userPos) return null;
  const coords = CITY_COORDS[city];
  if (!coords) return null;
  return Math.round(haversineKm(userPos, coords));
}

export function distanceFromUserToAd(userPos: [number, number] | null, ad: { lat?: number; lng?: number; city: string }): number | null {
  if (!userPos) return null;
  if (typeof ad.lat === "number" && typeof ad.lng === "number") {
    return Math.round(haversineKm(userPos, [ad.lat, ad.lng]));
  }
  return distanceFromUserToCity(userPos, ad.city);
}
