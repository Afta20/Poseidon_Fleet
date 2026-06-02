import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard Customer | Poseidon Fleet',
  description: 'Panel manajemen muatan pelanggan - Poseidon Fleet',
};

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
