import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard Kru | Poseidon Fleet',
  description: 'Panel kru kapal Poseidon Fleet - Laporan harian dan sinyal darurat',
};

export default function CrewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
