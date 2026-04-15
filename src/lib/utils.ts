import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTrackingId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'PF'; // 2 digits
  for (let i = 0; i < 6; i++) { // + 6 digits = 8 digits total
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
