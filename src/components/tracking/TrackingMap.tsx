"use client"
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Known port coordinates for demo routing
const PORT_COORDS: Record<string, [number, number]> = {
  'tanjung priok': [-6.1, 106.88],
  'jakarta': [-6.1, 106.88],
  'tanjung perak': [-7.2, 112.73],
  'surabaya': [-7.2, 112.73],
  'makassar': [-5.14, 119.43],
  'belawan': [3.77, 98.69],
  'medan': [3.77, 98.69],
  'balikpapan': [-1.27, 116.83],
  'banjarmasin': [-3.33, 114.59],
  'pontianak': [-0.03, 109.32],
  'semarang': [-6.97, 110.42],
  'bitung': [1.44, 125.19],
  'sorong': [-0.87, 131.25],
  'jayapura': [-2.54, 140.72],
  'ambon': [-3.69, 128.17],
  'kupang': [-10.17, 123.61],
  'singapore': [1.29, 103.85],
  'hong kong': [22.32, 114.17],
  'rotterdam': [51.92, 4.48],
  'los angeles': [34.05, -118.24],
  'tokyo': [35.68, 139.65],
  'shanghai': [31.23, 121.47],
  'busan': [35.18, 129.08],
};

function findPortCoords(name: string): [number, number] | null {
  const lower = name.toLowerCase();
  for (const [key, coords] of Object.entries(PORT_COORDS)) {
    if (lower.includes(key)) return coords;
  }
  return null;
}

// Ship icon
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

// Port icon
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

const originIcon = createPortIcon('#4ade80');
const destIcon = createPortIcon('#ef4444');

// Auto-fit bounds
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

interface TrackingMapProps {
  origin: string;
  destination: string;
  vesselName?: string | null;
  vesselType?: string | null;
  vesselLat?: number | null;
  vesselLng?: number | null;
  status: string;
}

function TrackingMapComponent({
  origin,
  destination,
  vesselName,
  vesselType,
  vesselLat,
  vesselLng,
  status,
}: TrackingMapProps) {
  const originCoords = findPortCoords(origin);
  const destCoords = findPortCoords(destination);

  // Determine ship position
  let shipPosition: [number, number] | null = null;
  if (vesselLat && vesselLng) {
    shipPosition = [vesselLat, vesselLng];
  } else if (status === 'ARRIVED' && destCoords) {
    shipPosition = destCoords;
  } else if ((status === 'PENDING' || status === 'APPROVED') && originCoords) {
    shipPosition = originCoords;
  }

  // Build route line
  const routePoints: [number, number][] = [];
  if (originCoords) routePoints.push(originCoords);
  if (shipPosition && originCoords && destCoords) {
    // Only add ship position to route if it's different from origin/dest
    const isDiffFromOrigin = Math.abs(shipPosition[0] - originCoords[0]) > 0.01 || Math.abs(shipPosition[1] - originCoords[1]) > 0.01;
    const isDiffFromDest = Math.abs(shipPosition[0] - destCoords[0]) > 0.01 || Math.abs(shipPosition[1] - destCoords[1]) > 0.01;
    if (isDiffFromOrigin && isDiffFromDest) routePoints.push(shipPosition);
  }
  if (destCoords) routePoints.push(destCoords);

  // Points for fitting bounds
  const allPoints: [number, number][] = [];
  if (originCoords) allPoints.push(originCoords);
  if (destCoords) allPoints.push(destCoords);
  if (shipPosition) allPoints.push(shipPosition);

  const hasMapData = allPoints.length > 0;

  if (!hasMapData) {
    return (
      <div className="w-full h-[300px] rounded-xl border border-white/10 bg-[#121217] flex flex-col items-center justify-center">
        <p className="text-zinc-500 font-mono text-sm">Lokasi pelabuhan tidak tersedia di peta.</p>
        <p className="text-zinc-600 text-xs mt-1">{origin} → {destination}</p>
      </div>
    );
  }

  const center: [number, number] = allPoints.length > 0 ? allPoints[0] : [0, 0];

  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden border border-white/10 glow-border relative">
      {/* Status overlay */}
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
          <span className="text-[10px] text-zinc-300 font-mono">Asal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          <span className="text-[10px] text-zinc-300 font-mono">Tujuan</span>
        </div>
        {shipPosition && (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
            <span className="text-[10px] text-zinc-300 font-mono">Kapal</span>
          </div>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={4}
        style={{ height: '100%', width: '100%', background: '#0a0a0c' }}
        attributionControl={false}
      >
        <FitBounds points={allPoints} />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {/* Route line (dashed for planned, solid for traveled) */}
        {routePoints.length >= 2 && (
          <>
            {/* Full planned route (dashed) */}
            {originCoords && destCoords && (
              <Polyline
                positions={[originCoords, destCoords]}
                pathOptions={{
                  color: '#a855f7',
                  weight: 2,
                  opacity: 0.3,
                  dashArray: '8, 8',
                }}
              />
            )}
            {/* Traveled route (solid) */}
            {shipPosition && originCoords && (
              <Polyline
                positions={[originCoords, shipPosition]}
                pathOptions={{
                  color: '#a855f7',
                  weight: 3,
                  opacity: 0.8,
                }}
              />
            )}
          </>
        )}

        {/* Origin marker */}
        {originCoords && (
          <Marker position={originCoords} icon={originIcon}>
            <Popup>
              <div className="bg-[#121217] text-white p-2 rounded font-sans min-w-[150px]">
                <p className="text-green-400 font-bold text-xs uppercase">Pelabuhan Asal</p>
                <p className="text-white text-sm font-semibold mt-1">{origin}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destCoords && (
          <Marker position={destCoords} icon={destIcon}>
            <Popup>
              <div className="bg-[#121217] text-white p-2 rounded font-sans min-w-[150px]">
                <p className="text-red-400 font-bold text-xs uppercase">Pelabuhan Tujuan</p>
                <p className="text-white text-sm font-semibold mt-1">{destination}</p>
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
        .leaflet-popup-tip {
          background: #121217;
          border: 1px solid rgba(168, 85, 247, 0.4);
        }
      `}</style>
    </div>
  );
}

export default TrackingMapComponent;
