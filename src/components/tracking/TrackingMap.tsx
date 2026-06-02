"use client"
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { PORT_DATABASE } from '@/lib/ports';
import { getSeaRoute } from '@/lib/routing';

// ─── Port Lookup: exact match → nearest fallback ─────────────────────
function findPortCoords(name: string): { coords: [number, number]; portName: string; isFallback: boolean } | null {
  const lower = name.toLowerCase().trim();

  // 1. Exact / alias match
  for (const port of PORT_DATABASE) {
    if (port.alias.some(a => lower.includes(a))) {
      return { coords: port.coords, portName: port.name, isFallback: false };
    }
  }

  // 2. Nearest port — rough heuristic by keyword geography
  // Indonesia island regions
  const isJawa = /\b(jawa|java|jogja|yogyakarta|bandung|bogor|bekasi|tangerang|depok|blitar|malang|kediri|mojokerto|jember|banyuwangi|madiun|tuban|lamongan|pasuruan)\b/.test(lower);
  const isSumatra = /\b(sumatra|sumatera|medan|riau|jambi|bengkulu|aceh|palembang|pekanbaru|padang)\b/.test(lower);
  const isKalimantan = /\b(kalimantan|borneo|banjarbaru|martapura|sangatta|bontang)\b/.test(lower);
  const isSulawesi = /\b(sulawesi|celebes|poso|luwu|bone|wajo|pinrang|kolaka|muna|buton)\b/.test(lower);
  const isPapua = /\b(papua|irian|biak|nabire|wamena|timika|fakfak)\b/.test(lower);
  const isNTT = /\b(ntt|nusa tenggara timur|flores|ende|maumere|larantuka|ruteng)\b/.test(lower);
  const isNTB = /\b(ntb|nusa tenggara barat|sumbawa|dompu)\b/.test(lower);
  const isMaluku = /\b(maluku|halmahera|tidore|banda|tual|saumlaki)\b/.test(lower);
  const isBali = /\b(bali|ubud|kuta|badung|gianyar|tabanan|singaraja|jembrana)\b/.test(lower);

  let nearestPortName: string | null = null;
  if (isJawa) nearestPortName = 'Tanjung Priok'; // Default Jawa → Jakarta
  else if (isSumatra) nearestPortName = 'Belawan';
  else if (isKalimantan) nearestPortName = 'Balikpapan';
  else if (isSulawesi) nearestPortName = 'Makassar';
  else if (isPapua) nearestPortName = 'Jayapura';
  else if (isNTT) nearestPortName = 'Kupang';
  else if (isNTB) nearestPortName = 'Lembar';
  else if (isMaluku) nearestPortName = 'Ambon';
  else if (isBali) nearestPortName = 'Benoa';

  if (nearestPortName) {
    const port = PORT_DATABASE.find(p => p.name === nearestPortName);
    if (port) return { coords: port.coords, portName: port.name, isFallback: true };
  }

  return null;
}

// ─── Icons ──────────────────────────────────────────────────────────
const shipIcon = new L.DivIcon({
  className: 'tracking-ship-icon',
  html: `<div style="
    background: #a855f7;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    box-shadow: 0 0 12px 3px rgba(168,85,247,0.8), 0 0 24px rgba(168,85,247,0.4);
    border: 3px solid white;
    animation: pulse-glow 2s infinite;
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function createPortIcon(color: string) {
  return new L.DivIcon({
    className: 'tracking-port-icon',
    html: `<div style="
      background: ${color};
      width: 12px;
      height: 12px;
      border-radius: 50%;
      box-shadow: 0 0 8px 2px ${color}80;
      border: 2px solid white;
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

function createFallbackIcon(color: string) {
  return new L.DivIcon({
    className: 'tracking-port-icon',
    html: `<div style="
      background: ${color};
      width: 12px;
      height: 12px;
      border-radius: 50%;
      box-shadow: 0 0 8px 2px ${color}80;
      border: 2px dashed white;
      opacity: 0.8;
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

const originIcon = createPortIcon('#4ade80');
const destIcon = createPortIcon('#ef4444');
const originFallbackIcon = createFallbackIcon('#4ade80');
const destFallbackIcon = createFallbackIcon('#ef4444');

// ─── FitBounds helper ────────────────────────────────────────────────
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) {
      const bounds = L.latLngBounds(points.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
    } else if (points.length === 1) {
      map.setView(points[0], 5);
    }
  }, [points, map]);
  return null;
}

// ─── Main Component ──────────────────────────────────────────────────
interface TrackingMapProps {
  origin: string;
  destination: string;
  vesselName?: string | null;
  vesselType?: string | null;
  vesselLat?: number | null;
  vesselLng?: number | null;
  status: string;
}

function TrackingMapComponent({ origin, destination, vesselName, vesselType, vesselLat, vesselLng, status }: TrackingMapProps) {
  const originResult = findPortCoords(origin);
  const destResult = findPortCoords(destination);

  const originCoords = originResult?.coords ?? null;
  const destCoords = destResult?.coords ?? null;

  // Ship position
  let shipPosition: [number, number] | null = null;
  if (vesselLat && vesselLng) {
    shipPosition = [vesselLat, vesselLng];
  } else if (status === 'ARRIVED' && destCoords) {
    shipPosition = destCoords;
  } else if ((status === 'PENDING' || status === 'APPROVED') && originCoords) {
    shipPosition = originCoords;
  }

  // Route points
  const allPoints: [number, number][] = [];
  if (originCoords) allPoints.push(originCoords);
  if (destCoords) allPoints.push(destCoords);
  if (shipPosition) allPoints.push(shipPosition);

  const hasMapData = allPoints.length > 0;

  if (!hasMapData) {
    return (
      <div className="w-full h-[300px] rounded-xl border border-white/10 bg-[#0d0d12] flex flex-col items-center justify-center text-center px-6">
        <div className="text-3xl mb-3">🌊</div>
        <p className="text-zinc-500 font-mono text-sm">Koordinat pelabuhan tidak tersedia.</p>
        <p className="text-zinc-600 text-xs mt-1 font-mono">{origin} → {destination}</p>
        <p className="text-zinc-700 text-[10px] mt-3">Gunakan nama pelabuhan resmi — lihat daftar di halaman Booking.</p>
      </div>
    );
  }

  const center: [number, number] = allPoints[0];

  return (
    <div className="w-full h-[340px] rounded-xl overflow-hidden border border-white/10 relative">
      {/* Fallback notices */}
      {(originResult?.isFallback || destResult?.isFallback) && (
        <div className="absolute top-3 left-3 z-[400] bg-amber-500/20 border border-amber-500/40 backdrop-blur-md rounded-lg px-3 py-2 max-w-xs">
          <p className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-widest mb-1">⚠ Pelabuhan Terdekat</p>
          {originResult?.isFallback && (
            <p className="text-[10px] text-amber-200/80">Asal: menampilkan <span className="font-bold">{originResult.portName}</span></p>
          )}
          {destResult?.isFallback && (
            <p className="text-[10px] text-amber-200/80">Tujuan: menampilkan <span className="font-bold">{destResult.portName}</span></p>
          )}
        </div>
      )}

      {/* Status badge */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col items-end gap-1">
        {status === 'IN_TRANSIT' && (
          <div className="bg-blue-500/20 border border-blue-500/50 backdrop-blur-md px-2 py-1 rounded-lg">
            <span className="text-[10px] font-mono text-blue-300 font-bold tracking-widest">⚓ BERLAYAR</span>
          </div>
        )}
        {status === 'ARRIVED' && (
          <div className="bg-green-500/20 border border-green-500/50 backdrop-blur-md px-2 py-1 rounded-lg">
            <span className="text-[10px] font-mono text-green-300 font-bold tracking-widest">✓ TIBA</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-black/70 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
          <span className="text-[10px] text-zinc-300 font-mono">
            Asal{originResult?.isFallback ? ` (≈ ${originResult.portName})` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          <span className="text-[10px] text-zinc-300 font-mono">
            Tujuan{destResult?.isFallback ? ` (≈ ${destResult.portName})` : ''}
          </span>
        </div>
        {shipPosition && (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
            <span className="text-[10px] text-zinc-300 font-mono">Kapal</span>
          </div>
        )}
      </div>

      <MapContainer center={center} zoom={4} style={{ height: '100%', width: '100%', background: '#0a0a0c' }} attributionControl={false}>
        <FitBounds points={allPoints} />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {/* Planned route (dashed) */}
        {originCoords && destCoords && (
          <Polyline positions={getSeaRoute(originCoords, destCoords)} pathOptions={{ color: '#a855f7', weight: 2, opacity: 0.3, dashArray: '8, 8' }} />
        )}
        {/* Traveled route (solid) - simplified to just connect origin to ship for now, or just show ship marker over planned route */}
        {shipPosition && originCoords && (
          <Polyline positions={[originCoords, shipPosition]} pathOptions={{ color: '#a855f7', weight: 3, opacity: 0.8 }} />
        )}

        {/* Origin marker */}
        {originCoords && (
          <Marker position={originCoords} icon={originResult?.isFallback ? originFallbackIcon : originIcon}>
            <Popup>
              <div className="bg-[#121217] text-white p-2 rounded font-sans min-w-[160px]">
                <p className="text-green-400 font-bold text-xs uppercase">Pelabuhan Asal</p>
                {originResult?.isFallback && <p className="text-amber-400 text-[10px] mt-0.5">⚠ Terdekat dari "{origin}"</p>}
                <p className="text-white text-sm font-semibold mt-1">{originResult?.portName}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destCoords && (
          <Marker position={destCoords} icon={destResult?.isFallback ? destFallbackIcon : destIcon}>
            <Popup>
              <div className="bg-[#121217] text-white p-2 rounded font-sans min-w-[160px]">
                <p className="text-red-400 font-bold text-xs uppercase">Pelabuhan Tujuan</p>
                {destResult?.isFallback && <p className="text-amber-400 text-[10px] mt-0.5">⚠ Terdekat dari "{destination}"</p>}
                <p className="text-white text-sm font-semibold mt-1">{destResult?.portName}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Ship marker */}
        {shipPosition && (
          <Marker position={shipPosition} icon={shipIcon}>
            <Popup>
              <div className="bg-[#121217] text-white p-2 rounded font-sans min-w-[180px]">
                <p className="text-primary font-bold text-sm">{vesselName || 'Kapal'}</p>
                {vesselType && <p className="text-zinc-400 text-xs font-mono mt-0.5">{vesselType}</p>}
                <div className="mt-2 pt-2 border-t border-white/20 space-y-1">
                  <p className="text-zinc-300 text-xs">📍 {shipPosition[0].toFixed(4)}, {shipPosition[1].toFixed(4)}</p>
                  <p className="text-zinc-300 text-xs">📦 {origin} → {destination}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 12px 3px rgba(168,85,247,0.8), 0 0 24px rgba(168,85,247,0.4); }
          50% { box-shadow: 0 0 20px 6px rgba(168,85,247,1), 0 0 40px rgba(168,85,247,0.6); }
        }
        .leaflet-popup-content-wrapper {
          background: #121217;
          color: white;
          border: 1px solid rgba(168, 85, 247, 0.4);
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.2);
        }
        .leaflet-popup-tip { background: #121217; }
      `}</style>
    </div>
  );
}

export default TrackingMapComponent;
