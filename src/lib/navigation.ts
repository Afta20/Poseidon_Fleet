import { PORT_DATABASE } from './ports';

/**
 * Calculate the Haversine distance (in km) between two lat/lng coordinate pairs.
 * Uses the Earth's mean radius of 6371 km.
 */
export function getHaversineDistance(
  coords1: [number, number],
  coords2: [number, number]
): number {
  const R = 6371;
  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Resolve a port name (exact or alias match) to its coordinates.
 */
export function resolvePortCoords(name: string): [number, number] | null {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  for (const port of PORT_DATABASE) {
    if (port.name.toLowerCase() === lower) return port.coords;
    if (port.alias.some((a) => lower.includes(a))) return port.coords;
  }
  return null;
}

/**
 * Get the region of a port by name.
 */
export function getPortRegion(name: string): string | null {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  for (const port of PORT_DATABASE) {
    if (port.name.toLowerCase() === lower) return port.region;
    if (port.alias.some((a) => lower.includes(a))) return port.region;
  }
  return null;
}

/**
 * Determine the distance multiplier based on distance in km.
 */
export function getDistanceMultiplier(distanceKm: number): { multiplier: number; label: string } {
  if (distanceKm <= 300)
    return { multiplier: 1.0, label: 'Jarak Dekat (≤300 km)' };
  if (distanceKm <= 1000)
    return { multiplier: 1.2, label: 'Jarak Menengah (300–1000 km)' };
  return { multiplier: 1.5, label: 'Jarak Jauh (>1000 km)' };
}

// Mapping well-known sea lanes/straits based on origin and destination regions
const SEA_LANES: Record<string, string> = {
  'DKI Jakarta|Jawa Timur': 'Laut Jawa',
  'DKI Jakarta|Jawa Tengah': 'Laut Jawa',
  'Jawa Timur|Jawa Tengah': 'Laut Jawa',
  'DKI Jakarta|Bali': 'Laut Jawa dan Selat Bali',
  'DKI Jakarta|Kalimantan Timur': 'Laut Jawa dan Selat Makassar',
  'DKI Jakarta|Kalimantan Selatan': 'Laut Jawa',
  'DKI Jakarta|Sulawesi Selatan': 'Laut Jawa dan Selat Makassar',
  'DKI Jakarta|Sumatra Utara': 'Laut Jawa, Selat Sunda, dan perairan barat Sumatra',
  'DKI Jakarta|Kepulauan Riau': 'Laut Jawa dan Selat Karimata',
  'DKI Jakarta|Singapore': 'Selat Malaka dan Selat Singapura',
  'Jawa Timur|Kalimantan Timur': 'Selat Makassar',
  'Jawa Timur|Sulawesi Selatan': 'Selat Makassar',
  'Jawa Timur|Bali': 'Selat Bali',
  'Jawa Timur|NTB': 'Selat Lombok',
  'Jawa Timur|NTT': 'Selat Lombok dan Laut Sawu',
  'Sulawesi Selatan|Maluku': 'Laut Banda',
  'Sulawesi Selatan|Papua': 'Laut Banda dan Laut Arafura',
  'Kepulauan Riau|Singapore': 'Selat Singapura',
  'Sumatra Utara|Singapore': 'Selat Malaka',
};

function lookupSeaLane(regionA: string, regionB: string): string | null {
  return (
    SEA_LANES[`${regionA}|${regionB}`] ||
    SEA_LANES[`${regionB}|${regionA}`] ||
    null
  );
}

/**
 * Build a dynamic, human-readable route description based on the selected ports.
 */
export function getRouteDescription(
  originName: string,
  destName: string,
  distanceKm: number
): string {
  const originRegion = getPortRegion(originName);
  const destRegion = getPortRegion(destName);

  const isInternational =
    originRegion &&
    destRegion &&
    !['DKI Jakarta','Jawa Timur','Jawa Tengah','Banten','Sumatra Utara','Riau','Sumatra Barat','Sumatra Selatan','Lampung','Kepulauan Riau','Aceh','Kalimantan Timur','Kalimantan Selatan','Kalimantan Barat','Kalimantan Utara','Sulawesi Selatan','Sulawesi Utara','Sulawesi Tenggara','Sulawesi Tengah','Gorontalo','Bali','NTB','NTT','Maluku','Maluku Utara','Papua Barat','Papua'].includes(destRegion);

  // Estimate travel duration based on average cargo ship speed of ~20 knots ≈ 37 km/h
  const daysLow = Math.max(1, Math.floor(distanceKm / (37 * 24)));
  const daysHigh = Math.max(daysLow + 1, Math.ceil((distanceKm / (37 * 24)) * 1.5));

  let seaLane = '';
  if (originRegion && destRegion) {
    const lane = lookupSeaLane(originRegion, destRegion);
    if (lane) seaLane = ` melintasi ${lane}`;
  }

  if (isInternational) {
    return `Rute internasional dari ${originName} menuju ${destName} (${destRegion}) menempuh jarak laut ~${distanceKm.toLocaleString('id-ID')} km${seaLane}. Perkiraan durasi pelayaran ${daysLow}–${daysHigh} hari. Tarif regional luar negeri telah disesuaikan.`;
  }

  if (originRegion && destRegion && originRegion === destRegion) {
    return `Rute pelayaran lokal dari ${originName} ke ${destName} menempuh jarak laut ~${distanceKm.toLocaleString('id-ID')} km di wilayah ${originRegion}. Perkiraan durasi pelayaran ${daysLow}–${daysHigh} hari.`;
  }

  return `Rute pelayaran dari ${originName} ke ${destName} menempuh jarak laut ~${distanceKm.toLocaleString('id-ID')} km${seaLane}. Perkiraan durasi pelayaran ${daysLow}–${daysHigh} hari.`;
}
