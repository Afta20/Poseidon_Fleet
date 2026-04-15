<div align="center">

# 🔱 POSEIDON FLEET
### *Intelligence in Every Wave*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

**Poseidon Fleet** adalah platform manajemen armada maritim mutakhir yang dirancang untuk memberikan kendali penuh, transparansi, dan efisiensi operasional di lautan luas.

[Fitur Utama](#-fitur-unggulan) • [Teknologi](#-arsitektur-teknologi) • [Pratinjau](#-galeri-antarmuka)

---

</div>

## 🌊 Tentang Proyek
Dunia maritim membutuhkan presisi. **Poseidon Fleet** hadir sebagai solusi *all-in-one* untuk memantau pergerakan kapal secara real-time, mengelola logistik pengiriman, hingga menganalisis konsumsi bahan bakar melalui dashboard yang intuitif dan responsif.

## ✨ Fitur Unggulan

### 📍 Real-Time Vessel Tracking
Pantau posisi armada Anda secara langsung di peta interaktif. Dilengkapi dengan status navigasi dan estimasi waktu kedatangan yang akurat.

### 📊 Advanced Analytics Dashboard
Visualisasi data yang mendalam menggunakan chart interaktif. Pantau tren penggunaan bahan bakar, efisiensi rute, dan performa setiap kapal dalam satu layar.

### 👥 Crew & Resource Management
Kelola data kru kapal, jadwal penugasan, hingga inventaris logistik secara terpusat untuk memastikan operasional berjalan tanpa hambatan.

### 🔐 Secure Intelligence
Sistem otentikasi berlapis dan manajemen peran (Admin, Customer, Crew) untuk memastikan integritas data dan keamanan informasi strategis.

---

## 🛠 Arsitektur Teknologi

Dibuat dengan standar industri modern untuk performa dan skalabilitas tinggi:

* **Frontend:** Next.js (App Router) dengan TypeScript untuk pengembangan yang *type-safe*.
* **Styling:** Tailwind CSS & Lucide Icons untuk antarmuka yang modern dan bersih.
* **Backend:** Next.js API Routes & Prisma ORM.
* **Database:** PostgreSQL (Ready for high-concurrency maritime data).
* **State Management:** React Hooks & Custom Streaming Logic untuk data kapal.

---

## 🎨 Galeri Antarmuka

| Dashboard Utama | Peta Armada | Analisis Bahan Bakar |
| :--- | :--- | :--- |
| ![Dashboard](https://via.placeholder.com/300x180?text=Executive+Overview) | ![Map](https://via.placeholder.com/300x180?text=Live+Vessel+Map) | ![Charts](https://via.placeholder.com/300x180?text=Fuel+Consumption+Chart) |

> *Catatan: Antarmuka menggunakan desain "Maritime Blue" yang memberikan kesan profesional, tenang, dan terpercaya.*

---

## 🏗️ Struktur Proyek

```text
src/
├── app/             # Routing & Server Pages
├── components/      # Reusable UI (Admin, Dashboard, Landing)
├── hooks/           # Custom Logic & Vessel Streams
├── lib/             # Database & Auth Configurations
└── types/           # Type Definitions
