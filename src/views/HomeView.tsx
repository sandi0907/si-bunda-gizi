import React from 'react';
import {
  ArrowRight,
  Sparkles,
  Heart,
  Baby,
  Activity,
  BookOpen,
  CheckCircle2,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  MapPin,
  Smile,
} from 'lucide-react';
import { PageId } from '../components/Navbar';
import { HeaderGifBanner } from '../components/HeaderGifBanner';
import { ASSETS } from '../assets/images';
import { SiteSettings, VisitorRecord } from '../data/initialContent';

interface HomeViewProps {
  onNavigate: (page: PageId) => void;
  currentUser: VisitorRecord | null;
  settings: SiteSettings;
  isAdmin: boolean;
  onOpenAdminSettings: () => void;
  onOpenProfileModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  currentUser,
  settings,
  isAdmin,
  onOpenAdminSettings,
  onOpenProfileModal,
}) => {
  const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Halo ${settings.whatsappConsultantName}, saya ${
      currentUser ? currentUser.name : 'Bunda'
    } dari Kec. ${
      currentUser ? currentUser.subdistrict : 'Bangka Belitung'
    }. Saya ingin berkonsultasi seputar pemenuhan gizi dan pengasuhan balita di Si Bunda.`
  )}`;

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* 1. Header GIF (1280x720 / 720p rounded) - Present across all pages */}
      <HeaderGifBanner
        gifUrl={settings.headerGifUrl}
        isAdmin={isAdmin}
        onOpenAdminSettings={onOpenAdminSettings}
        pageTitle="Beranda Utama"
      />

      {/* 2. Personalized Welcome Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/5 border border-rose-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-200">
              <Smile className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">
                  Selamat Datang Bunda Hebat!
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-800">
                {currentUser ? (
                  <>
                    Halo, Bunda <span className="text-rose-600">{currentUser.name}</span> dari Kec.{' '}
                    <span className="text-rose-600">{currentUser.subdistrict}</span>!
                  </>
                ) : (
                  'Halo, Bunda Tersayang!'
                )}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {currentUser
                  ? `Terdata di ${currentUser.regency}. Siap mendampingi tumbuh kembang si kecil setiap hari.`
                  : 'Mari belajar bersama demi pemenuhan nutrisi terbaik si kecil tercinta.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{currentUser ? 'Ganti Lokasi/Nama' : 'Isi Data Kunjungan'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Tujuan Platform Si Bunda (Website Purpose) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            Tujuan Platform Si Bunda
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-800 tracking-tight">
            Mendampingi Ibu, Mewujudkan Balita Sehat & Bebas Stunting
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Platform edukasi gizi berbasis web yang dirancang khusus untuk membantu ibu dalam pemenuhan gizi dan pengasuhan balita melalui informasi yang menarik, mudah dipahami, dan berbasis bukti ilmiah untuk mendukung tumbuh kembang anak secara optimal.
          </p>
        </div>

        {/* 4 Pilar Tujuan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Baby className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-800 mb-1">
              Edukasi 1000 HPK
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Memaksimalkan masa emas pertumbuhan otak dan fisik anak sejak masa kehamilan hingga usia 2 tahun.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-800 mb-1">
              Pangan Lokal Bangka Belitung
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Memanfaatkan ikan laut segar, telur, dan sayur lokal yang terjangkau namun kaya akan protein hewani dan zat besi.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-800 mb-1">
              Pemantauan KMS Rutin
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Memudahkan Bunda membaca kurva KMS dan standar kenaikan berat badan minimal (KBM) untuk deteksi dini gagal tumbuh.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-800 mb-1">
              Pola Asuh Responsive
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Membimbing ibu mengatasi anak susah makan (GTM) tanpa kekerasan atau paksaan dengan cara makan menyenangkan.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Tiga Kartu Navigasi Utama Sesuai Spesifikasi Klien */}
      {/* (Gambar animasi sesuai di atas, tombol di tengah yang direct ke page, lalu definisi/penjelasan singkat di bawahnya) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="border-t border-rose-100 pt-8 sm:pt-10 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                Jelajahi Konten Edukasi
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-800">
                Menu Edukasi Utama Si Bunda
              </h2>
            </div>
            <p className="text-xs text-stone-500 max-w-sm">
              Klik tombol pada masing-masing topik untuk langsung membuka video dan materi panduan lengkap.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* KARTU 1: Gizi Sehat untuk Si Kecil */}
          <div className="bg-white rounded-3xl border border-rose-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
            {/* Gambar Animasi Sesuai */}
            <div className="relative aspect-[16/10] overflow-hidden bg-rose-50">
              <img
                src={ASSETS.giziSehatCard}
                alt="Animasi Edukasi Gizi Sehat untuk Si Kecil"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-rose-700 text-[11px] font-bold shadow-2xs">
                Modul Video Edukasi
              </div>
            </div>

            {/* Bagian Tombol & Definisi Singkat */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* Tombol yang langsung mengarah ke page Gizi Sehat */}
                <button
                  type="button"
                  onClick={() => onNavigate('gizi-sehat')}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-md shadow-rose-200 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <span>Gizi Sehat untuk Si Kecil</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Definisi / Penjelasan Singkat Mengenai Tentang Apa Page Tersebut */}
                <div className="mt-4 pt-3 border-t border-rose-100/70 text-xs text-stone-600 space-y-2 leading-relaxed">
                  <p className="font-semibold text-rose-800">
                    Tentang Halaman Ini:
                  </p>
                  <p>
                    Halaman ini berisi kumpulan video edukasi menarik seputar pentingnya pemberian makanan bergizi seimbang, konsep Isi Piringku kaya protein hewani ganda, strategi mengatasi anak GTM (Gerakan Tutup Mulut), serta pola pengasuhan makan (responsive feeding) yang tepat untuk mendukung tumbuh kembang anak.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2 text-[11px] font-medium text-rose-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Layout video berderet 2 ala TikTok yang nyaman dipandang</span>
              </div>
            </div>
          </div>

          {/* KARTU 2: Panduan KMS */}
          <div className="bg-white rounded-3xl border border-rose-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
            {/* Gambar Animasi Sesuai */}
            <div className="relative aspect-[16/10] overflow-hidden bg-teal-50">
              <img
                src={ASSETS.kmsGuideCard}
                alt="Animasi Panduan Membaca Kartu Menuju Sehat (KMS)"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-teal-700 text-[11px] font-bold shadow-2xs">
                Panduan Tumbuh Kembang
              </div>
            </div>

            {/* Bagian Tombol & Definisi Singkat */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* Tombol yang langsung mengarah ke page Panduan KMS */}
                <button
                  type="button"
                  onClick={() => onNavigate('panduan-kms')}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm shadow-md shadow-teal-200 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <span>Panduan KMS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Definisi / Penjelasan Singkat Mengenai Tentang Apa Page Tersebut */}
                <div className="mt-4 pt-3 border-t border-teal-100/70 text-xs text-stone-600 space-y-2 leading-relaxed">
                  <p className="font-semibold text-teal-800">
                    Tentang Halaman Ini:
                  </p>
                  <p>
                    Halaman ini mengupas tuntas cara membaca grafik Kartu Menuju Sehat (KMS), memahami arti kurva pertumbuhan pita hijau, kuning, hingga garis merah, mengetahui standar kenaikan berat badan minimal (KBM) bulanan, serta deteksi dini risiko stunting sebelum terlambat.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2 text-[11px] font-medium text-teal-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Disertai kalkulator simulasi plotting kurva KMS balita</span>
              </div>
            </div>
          </div>

          {/* KARTU 3: Resep MP ASI */}
          <div className="bg-white rounded-3xl border border-rose-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
            {/* Gambar Animasi Sesuai */}
            <div className="relative aspect-[16/10] overflow-hidden bg-amber-50">
              <img
                src={ASSETS.mpasiRecipeCard}
                alt="Animasi Resep Makanan Pendamping ASI MP-ASI"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-amber-800 text-[11px] font-bold shadow-2xs">
                Buku Digital Scribd-Style
              </div>
            </div>

            {/* Bagian Tombol & Definisi Singkat */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* Tombol yang langsung mengarah ke page Resep MP ASI */}
                <button
                  type="button"
                  onClick={() => onNavigate('resep-mpasi')}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-amber-200 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <span>Resep MP ASI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Definisi / Penjelasan Singkat Mengenai Tentang Apa Page Tersebut */}
                <div className="mt-4 pt-3 border-t border-amber-100/70 text-xs text-stone-600 space-y-2 leading-relaxed">
                  <p className="font-semibold text-amber-800">
                    Tentang Halaman Ini:
                  </p>
                  <p>
                    Halaman ini menyajikan kumpulan resep MP-ASI bergizi seimbang dalam format dokumen PDF interaktif bergaya Scribd dengan halaman yang berderet ke bawah. Dilengkapi takaran zat gizi mikro/makro, tekstur sesuai tahapan usia balita, serta olahan ikan khas Bangka Belitung.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2 text-[11px] font-medium text-amber-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Tampilan vertikal continuous scroll seperti membaca buku PDF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Highlight Pangan Lokal Bangka Belitung untuk Gizi Balita */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 inline-block">
                Kearifan Pangan Lokal Babel
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-stone-800">
                Ikan Segar Bangka Belitung: Kunci Cerdas & Tangkal Stunting
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Provinsi Kepulauan Bangka Belitung dikaruniai kekayaan hayati laut yang luar biasa. Ikan kembung, dencis, tongkol, dan tenggiri lokal memiliki kandungan asam lemak omega-3, DHA, dan protein hewani yang sangat tinggi dengan harga yang ramah di kantong keluarga.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
                  🐟 Ikan Kembung (Tinggi DHA)
                </span>
                <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
                  🥚 Telur Ayam / Bebek Lokal
                </span>
                <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
                  🌿 Daun Kelor Pekarangan
                </span>
              </div>
            </div>

            <div className="w-full md:w-64 bg-rose-50/70 p-5 rounded-2xl border border-rose-100 text-center shrink-0">
              <span className="text-3xl font-extrabold text-rose-600 block">
                2x
              </span>
              <span className="text-xs font-bold text-stone-700 block mt-1">
                Protein Hewani Berbeda
              </span>
              <p className="text-[11px] text-stone-500 mt-2">
                Saran Kemenkes: Usahakan ada minimal 2 sumber protein hewani di piring makan balita Bunda (misal: telur + ikan).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contact Us direct to WhatsApp (Sesuai Permintaan di Home Page) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md">
                <MessageCircle className="w-4 h-4 fill-white" />
                Contact Us • Konsultasi Gizi Langsung
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Hubungi Konsultan Ahli Gizi Si Bunda
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm max-w-xl leading-relaxed">
                Bingung menentukan tekstur MP-ASI anak, berat badan di KMS belum naik, atau si kecil sedang mogok makan (GTM)? Konsultasikan langsung melalui WhatsApp dengan pesan yang telah kami siapkan untuk Bunda.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-emerald-100">
                <span>✓ Respons Ramah</span>
                <span>✓ Berbasis Pedoman Kemenkes</span>
                <span>✓ Khusus Warga Babel</span>
              </div>
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-4 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 font-extrabold text-sm sm:text-base shadow-xl flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 shrink-0"
            >
              <MessageCircle className="w-5 h-5 fill-emerald-600 text-emerald-600" />
              <span>Kirim Pesan WhatsApp Sekarang</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
