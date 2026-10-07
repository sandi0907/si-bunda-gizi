import React, { useState, useMemo } from 'react';
import {
  Shield,
  FileSpreadsheet,
  Film,
  BookOpen,
  Settings,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Users,
  PieChart,
  LogOut,
  Save,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Send,
  Image as ImageIcon,
} from 'lucide-react';
import { HeaderGifBanner } from '../components/HeaderGifBanner';
import {
  VideoItem,
  MpasiRecipe,
  VisitorRecord,
  SiteSettings,
} from '../data/initialContent';
import { BANGKA_BELITUNG_REGENCIES } from '../data/bangkaBelitungData';

interface AdminDashboardViewProps {
  visitors: VisitorRecord[];
  onUpdateVisitors: (visitors: VisitorRecord[]) => void;
  videos: VideoItem[];
  onUpdateVideos: (videos: VideoItem[]) => void;
  recipes: MpasiRecipe[];
  onUpdateRecipes: (recipes: MpasiRecipe[]) => void;
  settings: SiteSettings;
  onUpdateSettings: (settings: SiteSettings) => void;
  onAdminLogout: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  visitors,
  onUpdateVisitors,
  videos,
  onUpdateVideos,
  recipes,
  onUpdateRecipes,
  settings,
  onUpdateSettings,
  onAdminLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'visitors' | 'videos' | 'recipes' | 'settings'>('visitors');
  const [copiedCode, setCopiedCode] = useState(false);
  const [testSyncStatus, setTestSyncStatus] = useState<string | null>(null);
  const [visitorFilterRegency, setVisitorFilterRegency] = useState<string>('Semua');
  const [visitorSearch, setVisitorSearch] = useState<string>('');

  // Settings form
  const [tempSettings, setTempSettings] = useState<SiteSettings>({ ...settings });
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  // Video CRUD modal state
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Recipe CRUD modal state
  const [editingRecipe, setEditingRecipe] = useState<MpasiRecipe | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  // Analytics Calculation
  const totalVisitors = visitors.length;
  const ibuBalitaCount = visitors.filter((v) => !v.targetCategory || v.targetCategory.includes('Ibu Balita')).length;
  const ibuBalitaPct = totalVisitors > 0 ? Math.round((ibuBalitaCount / totalVisitors) * 100) : 0;

  // Regency breakdown
  const regencyDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    BANGKA_BELITUNG_REGENCIES.forEach((r) => {
      counts[r.name] = 0;
    });
    visitors.forEach((v) => {
      if (counts[v.regency] !== undefined) {
        counts[v.regency] += 1;
      } else {
        counts[v.regency] = (counts[v.regency] || 0) + 1;
      }
    });
    return counts;
  }, [visitors]);

  // Filtered visitors
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const matchSearch =
        v.name.toLowerCase().includes(visitorSearch.toLowerCase()) ||
        v.subdistrict.toLowerCase().includes(visitorSearch.toLowerCase());
      const matchReg = visitorFilterRegency === 'Semua' || v.regency === visitorFilterRegency;
      return matchSearch && matchReg;
    });
  }, [visitors, visitorSearch, visitorFilterRegency]);

  // Export to CSV for Google Spreadsheet
  const handleExportCsv = () => {
    const headers = [
      'No',
      'Nama Pengunjung',
      'Kecamatan',
      'Kabupaten/Kota',
      'Provinsi',
      'Waktu Kunjungan',
      'Timestamp ISO',
    ];

    const rows = visitors.map((v, index) => [
      index + 1,
      `"${v.name.replace(/"/g, '""')}"`,
      `"${v.subdistrict}"`,
      `"${v.regency}"`,
      'Kepulauan Bangka Belitung',
      `"${v.timestampFormatted}"`,
      v.visitedAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Kunjungan_SiBunda_Babel_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Google Apps Script template snippet for 1-click automatic Google Sheet sync
  const appsScriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Tambah baris header jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Nama Bunda", "Kecamatan", "Kabupaten", "Waktu Kunjungan"]);
    }
    
    // Tulis baris data pengunjung baru
    sheet.appendRow([
      new Date(),
      data.nama || "-",
      data.kecamatan || "-",
      data.kabupaten || "-",
      data.waktu || "-"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyAppsScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleTestWebhook = async () => {
    if (!tempSettings.googleSheetsWebhookUrl) {
      setTestSyncStatus('Harap masukkan URL Webhook Google Sheets terlebih dahulu.');
      return;
    }
    setTestSyncStatus('Mengirim data uji coba...');
    try {
      await fetch(tempSettings.googleSheetsWebhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_connection',
          nama: 'Bunda Pengujian (Tes)',
          kecamatan: 'Sungailiat',
          kabupaten: 'Kabupaten Bangka',
          sasaran: 'Ibu Balita (6-23 Bulan)',
          usiaAnakBulan: 10,
          waktu: 'Tes Sistem Admin',
          timestamp: new Date().toISOString(),
        }),
      });
      setTestSyncStatus('Berhasil mengirim payload uji coba ke Google Sheets!');
    } catch (e: any) {
      setTestSyncStatus(`Gagal mengirim: ${e.message}`);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(tempSettings);
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 3000);
  };

  // Video Handlers
  const handleOpenAddVideo = () => {
    setEditingVideo({
      id: `vid-${Date.now()}`,
      title: '',
      description: '',
      videoUrl: 'https://www.youtube.com/embed/',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=640&auto=format&fit=crop',
      category: 'gizi-sehat',
      duration: '05:00',
      speaker: 'Konsultan Ahli Gizi Si Bunda',
      tags: ['Gizi Balita', 'Bangka Belitung'],
      keyPoints: ['Pahami pemenuhan nutrisi balita', 'Pola makan teratur'],
    });
    setIsVideoModalOpen(true);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    const exists = videos.find((v) => v.id === editingVideo.id);
    if (exists) {
      onUpdateVideos(videos.map((v) => (v.id === editingVideo.id ? editingVideo : v)));
    } else {
      onUpdateVideos([editingVideo, ...videos]);
    }
    setIsVideoModalOpen(false);
    setEditingVideo(null);
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm('Yakin ingin menghapus video ini?')) {
      onUpdateVideos(videos.filter((v) => v.id !== id));
    }
  };

  // Recipe Handlers
  const handleOpenAddRecipe = () => {
    const nextPage = recipes.length + 1;
    setEditingRecipe({
      id: `mpasi-${Date.now()}`,
      pageNumber: nextPage,
      title: '',
      ageGroup: '6-8 Bulan',
      description: '',
      portion: '2-3 sdm dewasa',
      frequency: '2-3 kali sehari',
      texture: 'Bubur lumat saring',
      ingredients: ['Beras putih', 'Ikan tenggiri', 'Sayur bayam'],
      steps: ['Masak bubur hingga lunak.', 'Tambahkan lauk dan sayur.', 'Saring halus.'],
      nutritionalValue: {
        energy: '170 kkal',
        protein: '7.5 gram',
        fat: '6.0 gram',
        iron: '2.0 mg',
      },
      tipsBunda: 'Gunakan bahan lokal segar Bangka Belitung.',
    });
    setIsRecipeModalOpen(true);
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecipe) return;
    const exists = recipes.find((r) => r.id === editingRecipe.id);
    if (exists) {
      onUpdateRecipes(recipes.map((r) => (r.id === editingRecipe.id ? editingRecipe : r)));
    } else {
      onUpdateRecipes([...recipes, editingRecipe]);
    }
    setIsRecipeModalOpen(false);
    setEditingRecipe(null);
  };

  const handleDeleteRecipe = (id: string) => {
    if (confirm('Yakin ingin menghapus halaman resep ini?')) {
      onUpdateRecipes(recipes.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* 1. Header GIF (1280x720 rounded) - Consistent across all pages */}
      <HeaderGifBanner
        gifUrl={settings.headerGifUrl}
        isAdmin={true}
        onOpenAdminSettings={() => setActiveTab('settings')}
        pageTitle="Panel Pengelola & Admin"
      />

      {/* 2. Admin Header Title & Quick Actions */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-amber-200/80 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-200">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                  Mode Admin Aktif
                </span>
                <span className="text-xs text-stone-400">• Sandi: dinda0909</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight">
                Panel Kontrol & Analisis Kunjungan Si Bunda
              </h1>
              <p className="text-xs text-stone-500">
                Akses CRUD Konten (Video, Resep MP-ASI, Header GIF) dan Rekap Analisis Sasaran Ibu Balita se-Bangka Belitung.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onAdminLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 text-xs font-bold transition-all border border-stone-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Admin</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold border-b border-stone-200">
          <button
            type="button"
            onClick={() => setActiveTab('visitors')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'visitors'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Analisis Kunjungan & Spreadsheet ({visitors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'videos'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Kelola Video Edukasi ({videos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recipes')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'recipes'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Kelola Buku Resep MP-ASI ({recipes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'settings'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Header GIF & WhatsApp</span>
          </button>
        </div>
      </section>

      {/* TAB 1: ANALISIS KUNJUNGAN & GOOGLE SPREADSHEET */}
      {activeTab === 'visitors' && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-2xs">
              <span className="text-xs font-semibold text-stone-500 block">Total Pengunjung Terdata</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-stone-900">{totalVisitors}</span>
                <span className="text-xs text-rose-600 font-bold">Orang</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Mengisi pop-up selamat datang</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-2xs">
              <span className="text-xs font-semibold text-stone-500 block">Kesesuaian Sasaran Utama</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-emerald-600">{ibuBalitaPct}%</span>
                <span className="text-xs text-stone-500 font-medium">({ibuBalitaCount} Ibu Balita)</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">Target sasaran: Ibu dari bayi & balita</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-teal-100 shadow-2xs">
              <span className="text-xs font-semibold text-stone-500 block">Cakupan Wilayah Babel</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-teal-700">7</span>
                <span className="text-xs text-stone-500 font-medium">Kabupaten & Kota</span>
              </div>
              <p className="text-[11px] text-teal-700 mt-1">Total 47 Kecamatan se-Babel</p>
            </div>
          </div>

          {/* Sebaran Kabupaten */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200">
            <h3 className="font-bold text-sm text-stone-800 mb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-rose-500" />
              Sebaran Pengunjung per Kabupaten / Kota (Kepulauan Bangka Belitung):
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {Object.entries(regencyDistribution).map(([reg, count]) => (
                <div key={reg} className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="font-bold text-stone-800 block text-[11px] truncate">
                    {reg.replace('Kabupaten ', 'Kab. ')}
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-extrabold text-rose-600">{count} Kunjungan</span>
                    <span className="text-[10px] text-stone-400">
                      {totalVisitors > 0 ? Math.round((count / totalVisitors) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integrasi Google Spreadsheet */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-3xl p-5 sm:p-7 border border-emerald-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  Sinkronisasi Data Otomatis
                </span>
                <h3 className="text-base sm:text-lg font-black text-stone-900 mt-1">
                  Integrasi Otomatis ke Google Spreadsheet
                </h3>
                <p className="text-xs text-stone-600 max-w-xl">
                  Klien meminta data pengunjung tersusun rapi di Google Sheets untuk memantau apakah sasarannya tepat (ibu balita). Gunakan fitur download CSV instan atau hubungkan Google Apps Script Webhook.
                </p>
              </div>

              {/* Download CSV */}
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-all shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Rekap Google Sheets (.CSV)</span>
              </button>
            </div>

            {/* Google Apps Script Box */}
            <div className="bg-white rounded-2xl p-4 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Script Google Spreadsheet (Google Apps Script - Salin 1-Klik):
                </span>
                <button
                  type="button"
                  onClick={copyAppsScript}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Script'}</span>
                </button>
              </div>

              <pre className="text-[11px] font-mono bg-stone-900 text-emerald-300 p-3 rounded-xl overflow-x-auto max-h-36">
                {appsScriptCode}
              </pre>

              {/* Webhook Input Field */}
              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={tempSettings.googleSheetsWebhookUrl}
                  onChange={(e) =>
                    setTempSettings({ ...tempSettings, googleSheetsWebhookUrl: e.target.value })
                  }
                  placeholder="Tempel URL Webhook Google Apps Script di sini (https://script.google.com/macros/s/.../exec)"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Uji Kirim</span>
                </button>
              </div>

              {testSyncStatus && (
                <p className="text-xs font-medium text-stone-600 bg-stone-100 p-2 rounded-lg">
                  {testSyncStatus}
                </p>
              )}
            </div>
          </div>

          {/* Visitor Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-stone-800">
                  Daftar Data Pengunjung Terdata ({filteredVisitors.length} baris)
                </h3>
                <p className="text-[11px] text-stone-500">
                  Data otomatis terisi saat pengunjung mengisi pop-up selamat datang.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={visitorSearch}
                  onChange={(e) => setVisitorSearch(e.target.value)}
                  placeholder="Cari nama/kecamatan..."
                  className="px-3 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-rose-400 w-full sm:w-44"
                />

                <select
                  value={visitorFilterRegency}
                  onChange={(e) => setVisitorFilterRegency(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-stone-300 bg-white"
                >
                  <option value="Semua">Semua Kab/Kota</option>
                  {BANGKA_BELITUNG_REGENCIES.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name.replace('Kabupaten ', '')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Nama Bunda</th>
                    <th className="py-3 px-4">Kecamatan</th>
                    <th className="py-3 px-4">Kabupaten/Kota</th>
                    <th className="py-3 px-4">Provinsi</th>
                    <th className="py-3 px-4">Waktu Kunjungan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {filteredVisitors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400">
                        Belum ada data pengunjung yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredVisitors.map((vis, idx) => (
                      <tr key={vis.id} className="hover:bg-rose-50/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-stone-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-stone-900">{vis.name}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-rose-700">{vis.subdistrict}</span>
                        </td>
                        <td className="py-3 px-4 text-stone-600 font-medium">{vis.regency}</td>
                        <td className="py-3 px-4 text-stone-500">Kepulauan Bangka Belitung</td>
                        <td className="py-3 px-4 text-stone-500 text-[11px]">
                          {vis.timestampFormatted}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: KELOLA VIDEO EDUKASI (CRUD) */}
      {activeTab === 'videos' && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-800">
                Kelola Video Edukasi (Gizi Sehat & Panduan KMS)
              </h2>
              <p className="text-xs text-stone-500">
                Tambah video baru, ubah judul, ganti link YouTube, atau hapus video dari website.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddVideo}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Video Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((vid) => (
              <div
                key={vid.id}
                className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs hover:shadow-md transition-shadow flex gap-3"
              >
                <div className="w-24 h-20 rounded-xl bg-stone-900 overflow-hidden shrink-0 relative">
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 rounded">
                    {vid.duration}
                  </span>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          vid.category === 'gizi-sehat'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-teal-100 text-teal-700'
                        }`}
                      >
                        {vid.category === 'gizi-sehat' ? 'Gizi Sehat' : 'Panduan KMS'}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-stone-800 truncate" title={vid.title}>
                      {vid.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 line-clamp-1">{vid.speaker}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingVideo(vid);
                        setIsVideoModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(vid.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-1 rounded-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: KELOLA BUKU RESEP MP-ASI (CRUD) */}
      {activeTab === 'recipes' && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-800">
                Kelola Modul Buku Resep MP-ASI (Format Scribd-Style)
              </h2>
              <p className="text-xs text-stone-500">
                Update resep bergizi, bahan-bahan lokal, estimasi kalori, dan urutan halaman PDF.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddRecipe}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Halaman Resep</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full">
                    Halaman {rec.pageNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                    {rec.ageGroup}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900 text-sm leading-snug">{rec.title}</h4>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">{rec.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                  <div>
                    <span className="text-stone-400 block">Kalori:</span>
                    <span className="font-bold text-stone-700">{rec.nutritionalValue.energy}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Protein:</span>
                    <span className="font-bold text-rose-600">{rec.nutritionalValue.protein}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRecipe(rec);
                      setIsRecipeModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Resep</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRecipe(rec.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 4: PENGATURAN HEADER GIF & WHATSAPP */}
      {activeTab === 'settings' && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6">
          <form
            onSubmit={handleSaveSettings}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6"
          >
            <div>
              <h2 className="text-lg font-bold text-stone-800">
                Pengaturan Header Animasi GIF (1280 x 720 / 720p) & Kontak
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Klien dapat memasukkan link animasi GIF kustom di sini. GIF ini otomatis ditampilkan di bagian atas semua halaman.
              </p>
            </div>

            {savedSettingsNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Pengaturan berhasil disimpan dan aktif di seluruh halaman!</span>
              </div>
            )}

            {/* Input URL GIF */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 flex items-center justify-between">
                <span>URL Animasi GIF Header (Ukuran 1280 x 720 / 720p)</span>
                <span className="text-[11px] text-rose-600 font-normal">
                  Rasio 16:9 • Sudut Tumpul
                </span>
              </label>
              <input
                type="url"
                required
                value={tempSettings.headerGifUrl}
                onChange={(e) =>
                  setTempSettings({ ...tempSettings, headerGifUrl: e.target.value })
                }
                placeholder="https://...link-animasi-gif-anda.gif"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              <p className="text-[11px] text-stone-400">
                Tips: Tempelkan link gambar GIF animasi dari hosting Anda, Imgur, Giphy, atau server sendiri.
              </p>

              {/* Preview Container */}
              <div className="mt-3">
                <span className="text-xs font-semibold text-stone-600 block mb-1.5">
                  Pratinjau Langsung Header GIF:
                </span>
                <div className="w-full aspect-[16/9] max-h-56 rounded-2xl overflow-hidden border border-stone-300 bg-stone-900 flex items-center justify-center">
                  <img
                    src={tempSettings.headerGifUrl}
                    alt="Pratinjau GIF"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('style', 'display:none');
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Nomor WhatsApp Kontak */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nomor WhatsApp Ahli Gizi (Format: 628xxxxxxxxxx)
                </label>
                <input
                  type="text"
                  required
                  value={tempSettings.whatsappNumber}
                  onChange={(e) =>
                    setTempSettings({ ...tempSettings, whatsappNumber: e.target.value })
                  }
                  placeholder="Contoh: 6281273919090"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-stone-50 focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nama Tampilan Konsultan Gizi
                </label>
                <input
                  type="text"
                  required
                  value={tempSettings.whatsappConsultantName}
                  onChange={(e) =>
                    setTempSettings({ ...tempSettings, whatsappConsultantName: e.target.value })
                  }
                  placeholder="Contoh: Ahli Gizi Si Bunda Babel"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-stone-50 focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Pengaturan</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* MODAL EDIT / TAMBAH VIDEO */}
      {isVideoModalOpen && editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl border border-stone-200 my-auto animate-in fade-in">
            <h3 className="text-base font-bold text-stone-800 mb-4">
              {videos.some((v) => v.id === editingVideo.id) ? 'Edit Video Edukasi' : 'Tambah Video Edukasi Baru'}
            </h3>

            <form onSubmit={handleSaveVideo} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Judul Video</label>
                <input
                  type="text"
                  required
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  placeholder="Judul video edukasi..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={editingVideo.category}
                    onChange={(e) =>
                      setEditingVideo({
                        ...editingVideo,
                        category: e.target.value as 'gizi-sehat' | 'panduan-kms',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  >
                    <option value="gizi-sehat">Gizi Sehat untuk Si Kecil</option>
                    <option value="panduan-kms">Panduan KMS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Durasi</label>
                  <input
                    type="text"
                    value={editingVideo.duration}
                    onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                    placeholder="04:30"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">URL Video YouTube Embed</label>
                <input
                  type="url"
                  required
                  value={editingVideo.videoUrl}
                  onChange={(e) => setEditingVideo({ ...editingVideo, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">URL Thumbnail Gambar</label>
                <input
                  type="url"
                  required
                  value={editingVideo.thumbnailUrl}
                  onChange={(e) => setEditingVideo({ ...editingVideo, thumbnailUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Narasumber / Pembicara</label>
                <input
                  type="text"
                  value={editingVideo.speaker}
                  onChange={(e) => setEditingVideo({ ...editingVideo, speaker: e.target.value })}
                  placeholder="dr. Tiara Annisa, Sp.A"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={editingVideo.description}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Simpan Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH RESEP */}
      {isRecipeModalOpen && editingRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl border border-stone-200 my-auto animate-in fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-stone-800 mb-4">
              {recipes.some((r) => r.id === editingRecipe.id) ? 'Edit Halaman Resep MP-ASI' : 'Tambah Resep MP-ASI Baru'}
            </h3>

            <form onSubmit={handleSaveRecipe} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nomor Halaman</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingRecipe.pageNumber}
                    onChange={(e) =>
                      setEditingRecipe({
                        ...editingRecipe,
                        pageNumber: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kelompok Usia</label>
                  <select
                    value={editingRecipe.ageGroup}
                    onChange={(e) =>
                      setEditingRecipe({
                        ...editingRecipe,
                        ageGroup: e.target.value as MpasiRecipe['ageGroup'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  >
                    <option value="6-8 Bulan">6-8 Bulan</option>
                    <option value="9-11 Bulan">9-11 Bulan</option>
                    <option value="12-23 Bulan">12-23 Bulan</option>
                    <option value="Snack & Kudapan">Snack & Kudapan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama / Judul Menu Resep</label>
                <input
                  type="text"
                  required
                  value={editingRecipe.title}
                  onChange={(e) => setEditingRecipe({ ...editingRecipe, title: e.target.value })}
                  placeholder="Contoh: Bubur Tim Ikan Tenggiri Sayur Bayam"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Deskripsi Singkat</label>
                <input
                  type="text"
                  value={editingRecipe.description}
                  onChange={(e) => setEditingRecipe({ ...editingRecipe, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tekstur</label>
                  <input
                    type="text"
                    value={editingRecipe.texture}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, texture: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-stone-300 text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Porsi</label>
                  <input
                    type="text"
                    value={editingRecipe.portion}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, portion: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-stone-300 text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Frekuensi</label>
                  <input
                    type="text"
                    value={editingRecipe.frequency}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, frequency: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-stone-300 text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Bahan-Bahan (Pisahkan dengan baris baru / Enter)
                </label>
                <textarea
                  rows={3}
                  value={editingRecipe.ingredients.join('\n')}
                  onChange={(e) =>
                    setEditingRecipe({
                      ...editingRecipe,
                      ingredients: e.target.value.split('\n').filter((l) => l.trim()),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Langkah Pembuatan (Pisahkan dengan baris baru / Enter)
                </label>
                <textarea
                  rows={3}
                  value={editingRecipe.steps.join('\n')}
                  onChange={(e) =>
                    setEditingRecipe({
                      ...editingRecipe,
                      steps: e.target.value.split('\n').filter((l) => l.trim()),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-0.5">Energi</label>
                  <input
                    type="text"
                    value={editingRecipe.nutritionalValue.energy}
                    onChange={(e) =>
                      setEditingRecipe({
                        ...editingRecipe,
                        nutritionalValue: { ...editingRecipe.nutritionalValue, energy: e.target.value },
                      })
                    }
                    className="w-full px-2 py-1 rounded-lg border border-stone-300 text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-0.5">Protein</label>
                  <input
                    type="text"
                    value={editingRecipe.nutritionalValue.protein}
                    onChange={(e) =>
                      setEditingRecipe({
                        ...editingRecipe,
                        nutritionalValue: { ...editingRecipe.nutritionalValue, protein: e.target.value },
                      })
                    }
                    className="w-full px-2 py-1 rounded-lg border border-stone-300 text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-0.5">Lemak</label>
                  <input
                    type="text"
                    value={editingRecipe.nutritionalValue.fat}
                    onChange={(e) =>
                      setEditingRecipe({
                        ...editingRecipe,
                        nutritionalValue: { ...editingRecipe.nutritionalValue, fat: e.target.value },
                      })
                    }
                    className="w-full px-2 py-1 rounded-lg border border-stone-300 text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-0.5">Zat Besi</label>
                  <input
                    type="text"
                    value={editingRecipe.nutritionalValue.iron}
                    onChange={(e) =>
                      setEditingRecipe({
                        ...editingRecipe,
                        nutritionalValue: { ...editingRecipe.nutritionalValue, iron: e.target.value },
                      })
                    }
                    className="w-full px-2 py-1 rounded-lg border border-stone-300 text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecipeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Simpan Halaman Resep
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
