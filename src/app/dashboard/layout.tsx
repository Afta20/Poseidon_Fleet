import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard Monitoring | Poseidon Fleet',
  description: 'Dashboard monitoring armada kapal secara real-time - Poseidon Fleet',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
