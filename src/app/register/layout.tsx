import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register | Poseidon Fleet',
  description: 'Daftar akun baru di Poseidon Fleet - Maritime Logistics Platform',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
