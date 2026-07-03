export interface GeoCoords {
  lat: number;
  lon: number;
}

export async function geocodeCity(city: string): Promise<GeoCoords | null> {
  if (!city) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Anima/1.0 (anima-flame.vercel.app)" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}
