import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tracking Pengiriman | Poseidon Fleet',
  description: 'Lacak status pengiriman kargo Anda secara real-time - Poseidon Fleet',
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
