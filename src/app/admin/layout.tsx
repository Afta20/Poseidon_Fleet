import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Center | Poseidon Fleet',
  description: 'Panel administrasi Poseidon Fleet - Kelola user, armada, dan pengiriman',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
