import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Peta Armada | Poseidon Fleet',
  description: 'Peta interaktif lokasi armada kapal secara real-time - Poseidon Fleet',
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
