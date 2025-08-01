
# Digicomp Admin Dashboard

Admin dashboard berbasis React, Vite, dan Flowbite untuk manajemen penilaian kinerja pegawai.

## Tech Stack

- [React](https://react.dev/) - Library UI utama
- [Vite](https://vitejs.dev/) - Build tool super cepat
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Flowbite React](https://flowbite-react.com/) - Komponen UI siap pakai berbasis Tailwind
- [Lucide React](https://lucide.dev/) - Ikon modern untuk React
- [React Router](https://reactrouter.com/) - Routing SPA

## Dokumentasi

- [React](https://react.dev/learn)
- [Vite](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Flowbite React](https://flowbite-react.com/docs/getting-started/)
- [Lucide React](https://lucide.dev/docs/usage/react/)
- [React Router](https://reactrouter.com/en/main/start/overview)

## Cara Clone & Setup

```bash
git clone https://github.com/ikramattamimi/digicomp.git
cd digicomp
npm install
npm run dev
```

## Fitur Utama

- Sidebar & Navbar responsif dengan dark mode
- Menu dan sub-menu dinamis
- Komponen Table, Card, Form, dan lainnya dari Flowbite
- Routing antar halaman (Dashboard, Penilaian, Master Data, Settings, dll)
- Dummy data & struktur siap integrasi API

## Struktur Folder

- `src/pages/` - Halaman utama aplikasi
- `src/components/` - Komponen UI, dipisah per modul:
  - `assessment/` - Komponen modul penilaian
  - `directorate/` - Komponen modul sub-direktorat
  - `competency/` - Komponen modul kompetensi
  - `indicator/` - Komponen modul indikator
  - `staff/` - Komponen modul staff (atasan/bawahan)
  - `settings/` - Komponen modul pengaturan
  - `products/` - Komponen modul produk
  - `common/` - Komponen bersama (spinner, alert, dll)
  - `layouts/` - Komponen layout (Sidebar, Navbar, dll)
- `src/assets/` - Gambar/icon
- `public/` - Berkas statis
