import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Poseidon Fleet',
  description: 'Login ke sistem Poseidon Fleet - Maritime Logistics Platform',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
