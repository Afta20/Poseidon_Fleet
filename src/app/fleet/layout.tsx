import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fleet Overview | Poseidon Fleet',
  description: 'Overview seluruh armada kapal aktif - Poseidon Fleet',
};

export default function FleetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
