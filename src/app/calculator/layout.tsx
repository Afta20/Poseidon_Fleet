import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalkulator Ongkir | Poseidon Fleet',
  description: 'Kalkulator estimasi biaya pengiriman kargo laut - Poseidon Fleet',
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
