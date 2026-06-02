import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pembayaran | Poseidon Fleet',
  description: 'Halaman pembayaran pesanan kargo Poseidon Fleet',
};

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
