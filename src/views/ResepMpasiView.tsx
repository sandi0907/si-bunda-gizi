import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  Sparkles,
  Heart,
  Flame,
  Award,
  Layers,
  Search,
  CheckCircle2,
  Info,
  Clock,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { HeaderGifBanner } from '../components/HeaderGifBanner';
import { MpasiRecipe, SiteSettings, VisitorRecord } from '../data/initialContent';

interface ResepMpasiViewProps {
  recipes: MpasiRecipe[];
  settings: SiteSettings;
  isAdmin: boolean;
  onOpenAdminSettings: () => void;
  currentUser: VisitorRecord | null;
  onAddRecipe?: () => void;
  onEditRecipe?: (recipe: MpasiRecipe) => void;
  onDeleteRecipe?: (recipeId: string) => void;
}

export const ResepMpasiView: React.FC<ResepMpasiViewProps> = ({
  recipes,
  settings,
  isAdmin,
  onOpenAdminSettings,
  currentUser,
  onAddRecipe,
  onEditRecipe,
  onDeleteRecipe,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activePageFilter, setActivePageFilter] = useState<number | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const documentContainerRef = useRef<HTMLDivElement>(null);

  // Filter recipes based on search
  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      r.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      r.ageGroup.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      r.ingredients.some((ing) => ing.toLowerCase().includes(searchKeyword.toLowerCase()));
    const matchesPage = activePageFilter === 'all' || r.pageNumber === activePageFilter;
    return matchesSearch && matchesPage;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdfNotice = () => {
    // Generate print or notice
    window.print();
  };

  const scrollToRecipePage = (pageNumber: number) => {
    const el = document.getElementById(`recipe-page-${pageNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* 1. Header GIF (1280x720 / 720p rounded) */}
      <HeaderGifBanner
        gifUrl={settings.headerGifUrl}
        isAdmin={isAdmin}
        onOpenAdminSettings={onOpenAdminSettings}
        pageTitle="Buku Resep MP ASI"
      />

      {/* 2. Judul Page & Ajakan Edukasi MP-ASI */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
          <BookOpen className="w-3.5 h-3.5" />
          Buku Panduan & Resep MP-ASI Digital
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-800 tracking-tight">
          Resep MP ASI Kaya Gizi Si Bunda
        </h1>

        <div className="p-4 sm:p-6 rounded-3xl bg-amber-50/80 border border-amber-200/90 shadow-2xs text-stone-700 leading-relaxed text-xs sm:text-sm md:text-base space-y-2">
          <p className="font-bold text-amber-900 text-sm sm:text-base">
            Penuhi Nutrisi Otak & Cegah Stunting dengan Resep Pangan Lokal Bergizi Seimbang!
          </p>
          <p>
            Berikut adalah buku resep resmi MP-ASI Si Bunda dalam format dokumen interaktif Scribd-style. Tiap halaman disajikan berlanjut ke bawah, lengkap dengan panduan tekstur sesuai usia (6–23 bulan), porsi makan, serta kandungan energi, protein, lemak, dan zat besi.
          </p>
        </div>
      </section>

      {/* 3. Scribd-Style PDF Viewer Wrapper */}
      <section className="max-w-4xl mx-auto px-2 sm:px-6">
        <div className="bg-stone-100/90 rounded-3xl border border-stone-300 shadow-xl overflow-hidden">
          {/* SCRIBD VIEWER TOOLBAR */}
          <div className="sticky top-16 z-30 bg-stone-900 text-stone-200 px-4 py-3 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 shadow-md backdrop-blur-md">
            {/* Left: Document info */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs">
                PDF
              </div>
              <div>
                <span className="text-xs font-bold text-white block truncate max-w-[200px] sm:max-w-xs">
                  Buku_Resep_MPASI_SiBunda_Babel.pdf
                </span>
                <span className="text-[10px] text-stone-400 block -mt-0.5">
                  Scribd Continuous Reader • {recipes.length} Halaman Resep
                </span>
              </div>
            </div>

            {/* Center: Table of contents fast jumper */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-stone-400 hidden sm:inline text-[11px]">Loncat ke:</span>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'all') {
                    setActivePageFilter('all');
                  } else {
                    scrollToRecipePage(parseInt(val, 10));
                  }
                }}
                className="bg-stone-800 border border-stone-700 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="all">Daftar Isi (Semua Halaman)</option>
                {recipes.map((r) => (
                  <option key={r.id} value={r.pageNumber}>
                    Hal {r.pageNumber}: {r.ageGroup} - {r.title.substring(0, 28)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Right: Zoom & Download & Print actions */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700">
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(80, prev - 10))}
                  className="p-1.5 text-stone-300 hover:text-white rounded"
                  title="Perkecil (Zoom Out)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] font-mono text-stone-300">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.min(125, prev + 10))}
                  className="p-1.5 text-stone-300 hover:text-white rounded"
                  title="Perbesar (Zoom In)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium border border-stone-700 transition-colors"
                title="Cetak Halaman Resep"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cetak</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdfNotice}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow-xs transition-colors"
                title="Unduh format PDF buku"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh PDF</span>
              </button>

              {isAdmin && onAddRecipe && (
                <button
                  type="button"
                  onClick={onAddRecipe}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors ml-1"
                  title="Tambah Halaman Resep Baru"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Tambah Resep</span>
                </button>
              )}
            </div>
          </div>

          {/* Search bar inside document */}
          <div className="bg-stone-200/90 px-4 py-2 border-b border-stone-300 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <Search className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Cari bahan (contoh: ikan kembung, telur, hati ayam)..."
                className="w-full bg-white px-3 py-1 rounded-md text-xs border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <span className="text-[11px] text-stone-500 shrink-0 ml-2">
              Menampilkan {filteredRecipes.length} dari {recipes.length} halaman
            </span>
          </div>

          {/* SCRIBD VERTICAL CONTINUOUS DOCUMENT SCROLL CANVAS */}
          <div
            ref={documentContainerRef}
            className="p-3 sm:p-8 space-y-8 bg-stone-300/40 overflow-x-auto min-h-[600px]"
          >
            {/* COVER PAGE (HALAMAN 0 / PENGANTAR BUKU SCRIBD) */}
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="mx-auto w-full max-w-2xl bg-white rounded-xl shadow-lg border border-stone-300/70 p-6 sm:p-10 space-y-6 relative transition-transform"
            >
              {/* Document Header Line */}
              <div className="flex items-center justify-between border-b border-amber-200 pb-3 text-xs text-stone-400">
                <span className="font-semibold text-rose-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Si Bunda • Pedoman Gizi Balita Babel
                </span>
                <span>Dokumen Resmi Edukasi Gizi</span>
              </div>

              {/* Cover Banner Title */}
              <div className="text-center py-4 space-y-3 bg-gradient-to-br from-amber-50 via-rose-50 to-amber-50/30 rounded-2xl p-6 border border-amber-100">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  PANDUAN & KUMPULAN RESEP MP-ASI BERGIZI SEIMBANG
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                  Berbasis Pangan Lokal Kepulauan Bangka Belitung untuk Pencegahan Stunting dan Peningkatan Kecerdasan Balita
                </p>
                <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-amber-800">
                  <span>✓ 6-23 Bulan</span>
                  <span>•</span>
                  <span>✓ Tekstur Bertahap</span>
                  <span>•</span>
                  <span>✓ Kaya Zat Besi & Omega 3</span>
                </div>
              </div>

              {/* Quick Principle Table */}
              <div className="space-y-3 text-xs text-stone-700">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] text-amber-900">
                  Prinsip 4 Bintang MP-ASI Kemenkes RI:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-center">
                    <span className="font-bold text-rose-700 block">Karbohidrat</span>
                    <span className="text-[10px] text-stone-500">Beras, kentang, labu</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-center">
                    <span className="font-bold text-amber-700 block">Protein Hewani</span>
                    <span className="text-[10px] text-stone-500">Ikan laut, telur, hati</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 text-center">
                    <span className="font-bold text-teal-700 block">Protein Nabati</span>
                    <span className="text-[10px] text-stone-500">Tempe, tahu, kacang</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                    <span className="font-bold text-emerald-700 block">Sayur & Buah</span>
                    <span className="text-[10px] text-stone-500">Bayam, kelor, pepaya</span>
                  </div>
                </div>
              </div>

              {/* Page Number Footer */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-400">
                <span>Platform Edukasi Gizi Si Bunda</span>
                <span className="font-mono font-bold text-stone-600">Pengantar Buku • Hal. i</span>
              </div>
            </div>

            {/* RECIPE PAGES (BERDERET KE BAWAH SECARA VERTIKAL SEPERTI SCRIBD) */}
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                id={`recipe-page-${recipe.pageNumber}`}
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="mx-auto w-full max-w-2xl bg-white rounded-xl shadow-lg border border-stone-300/70 p-6 sm:p-10 space-y-6 relative transition-transform"
              >
                {/* Header Document Page Bar */}
                <div className="flex items-center justify-between border-b border-stone-200 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                      {recipe.ageGroup}
                    </span>
                    {recipe.localHighlight && (
                      <span className="hidden sm:inline-block text-[11px] text-teal-700 font-semibold">
                        ★ {recipe.localHighlight}
                      </span>
                    )}
                  </div>

                  {/* Admin controls for page */}
                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      {onEditRecipe && (
                        <button
                          type="button"
                          onClick={() => onEditRecipe(recipe)}
                          className="p-1 text-stone-400 hover:text-amber-600 rounded"
                          title="Edit resep ini"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteRecipe && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus halaman resep "${recipe.title}"?`)) {
                              onDeleteRecipe(recipe.id);
                            }
                          }}
                          className="p-1 text-stone-400 hover:text-red-600 rounded"
                          title="Hapus resep"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Recipe Main Title */}
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight leading-snug">
                    {recipe.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>

                {/* Feeding Specs Grid: Tekstur, Porsi, Frekuensi */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">
                      Tekstur Makanan
                    </span>
                    <span className="font-semibold text-stone-800 block mt-0.5">
                      {recipe.texture}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">
                      Porsi Sekali Makan
                    </span>
                    <span className="font-semibold text-stone-800 block mt-0.5">
                      {recipe.portion}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">
                      Frekuensi Makan
                    </span>
                    <span className="font-semibold text-stone-800 block mt-0.5">
                      {recipe.frequency}
                    </span>
                  </div>
                </div>

                {/* Bahan-Bahan (Ingredients) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Bahan-Bahan Bergizi:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700 bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                    {recipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cara Membuat Step-by-Step */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Langkah Pengolahan Sehat:
                  </h4>
                  <ol className="space-y-2 text-xs text-stone-700">
                    {recipe.steps.map((st, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-stone-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{st}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Nilai Gizi Takaran & Tips Ahli Gizi */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      Estimasi Kandungan Gizi per Porsi:
                    </span>
                    <span className="text-[10px] text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full font-semibold">
                      Pedoman Gizi Seimbang
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded-xl border border-amber-200">
                      <span className="text-[10px] text-stone-500 block">Energi</span>
                      <span className="font-extrabold text-stone-800">{recipe.nutritionalValue.energy}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-amber-200">
                      <span className="text-[10px] text-stone-500 block">Protein</span>
                      <span className="font-extrabold text-rose-600">{recipe.nutritionalValue.protein}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-amber-200">
                      <span className="text-[10px] text-stone-500 block">Lemak</span>
                      <span className="font-extrabold text-amber-600">{recipe.nutritionalValue.fat}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-amber-200">
                      <span className="text-[10px] text-stone-500 block">Zat Besi</span>
                      <span className="font-extrabold text-teal-600">{recipe.nutritionalValue.iron}</span>
                    </div>
                  </div>

                  {recipe.tipsBunda && (
                    <div className="text-[11px] text-amber-900 flex items-start gap-1.5 pt-1">
                      <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Tips Bunda:</strong> {recipe.tipsBunda}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Page Number Badge Scribd Style */}
                <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Si Bunda • Modul Resep MP-ASI Bangka Belitung</span>
                  <span className="font-mono font-bold text-stone-700">
                    Halaman {recipe.pageNumber} dari {recipes.length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
