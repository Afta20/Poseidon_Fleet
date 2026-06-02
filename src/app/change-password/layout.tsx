import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ubah Password | Poseidon Fleet',
  description: 'Ubah password akun Poseidon Fleet Anda',
};

export default function ChangePasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
