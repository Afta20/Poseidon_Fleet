import { Vessel, Log, Route } from '@prisma/client'

export type VesselStatus = 'En Route' | 'In Port' | 'Delayed' | 'Maintenance' | 'Signal Lost';

export interface VesselWithLatestLog extends Omit<Vessel, 'status'> {
  status: VesselStatus; // Override to allow 'Signal Lost' at runtime
  latestLog: Omit<Log, 'timestamp'> & { timestamp: string | Date }; // Adjusted for serialization
  route?: Route | null;
  lastUpdated: number; // to track when the frontend last received an update for blinking effect
}

// Coordinate representing a location
export interface Coordinate {
  lat: number;
  lng: number;
}
