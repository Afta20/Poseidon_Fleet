import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics | Poseidon Fleet',
  description: 'Analisis performa dan statistik armada - Poseidon Fleet',
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
