import React, { useState } from 'react';
import {
  Play,
  Clock,
  Activity,
  Heart,
  Sparkles,
  Calculator,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  X,
  Plus,
  Edit2,
  Trash2,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { HeaderGifBanner } from '../components/HeaderGifBanner';
import { VideoItem, SiteSettings, VisitorRecord } from '../data/initialContent';

interface PanduanKmsViewProps {
  videos: VideoItem[];
  settings: SiteSettings;
  isAdmin: boolean;
  onOpenAdminSettings: () => void;
  currentUser: VisitorRecord | null;
  onAddVideo?: () => void;
  onEditVideo?: (video: VideoItem) => void;
  onDeleteVideo?: (videoId: string) => void;
}

export const PanduanKmsView: React.FC<PanduanKmsViewProps> = ({
  videos,
  settings,
  isAdmin,
  onOpenAdminSettings,
  currentUser,
  onAddVideo,
  onEditVideo,
  onDeleteVideo,
}) => {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // KMS Interactive Calculator State
  const [gender, setGender] = useState<'boy' | 'girl'>('boy');
  const [ageMonths, setAgeMonths] = useState<number>(currentUser?.childAgeMonths || 9);
  const [weightKg, setWeightKg] = useState<number>(8.5);
  const [calcResult, setCalcResult] = useState<{
    status: 'Gizi Baik (Hijau Ideal)' | 'Waspada (Pita Kuning)' | 'Perhatian Khusus (Garis Merah)' | 'Gizi Lebih';
    color: string;
    advice: string;
    kbmStandard: string;
  } | null>(null);

  // Filter only KMS videos
  const kmsVideos = videos.filter((v) => v.category === 'panduan-kms');

  // Simple WHO-based weight for age reference lookup (0-24 mo median & limits)
  const handleCalculateKms = (e: React.FormEvent) => {
    e.preventDefault();
    // Median approximation WHO growth standard
    const baseWeight = gender === 'boy' ? 3.3 + ageMonths * 0.55 : 3.2 + ageMonths * 0.52;
    const lowerGreen = baseWeight * 0.85;
    const lowerYellow = baseWeight * 0.75;
    const upperGreen = baseWeight * 1.2;

    let status: 'Gizi Baik (Hijau Ideal)' | 'Waspada (Pita Kuning)' | 'Perhatian Khusus (Garis Merah)' | 'Gizi Lebih' = 'Gizi Baik (Hijau Ideal)';
    let color = 'emerald';
    let advice = 'Pertumbuhan si kecil berada di jalur pita hijau yang ideal. Pertahankan pemberian ASI/MP-ASI bergizi seimbang dan tetap rutin timbang setiap bulan di Posyandu!';

    if (weightKg < lowerYellow) {
      status = 'Perhatian Khusus (Garis Merah)';
      color = 'red';
      advice = 'Berat badan si kecil berada di bawah atau mendekati Garis Merah (BGM). Segera bawa si kecil ke Puskesmas atau dokter anak untuk konfirmasi dan evaluasi asupan makanan.';
    } else if (weightKg < lowerGreen) {
      status = 'Waspada (Pita Kuning)';
      color = 'amber';
      advice = 'Berat badan berada di pita kuning (waspada gagal tumbuh). Tingkatkan asupan makanan kaya protein hewani ganda dan lemak sehat, pastikan waktu makan teratur.';
    } else if (weightKg > upperGreen) {
      status = 'Gizi Lebih';
      color = 'purple';
      advice = 'Berat badan berada di atas rata-rata. Konsultasikan dengan tenaga kesehatan untuk evaluasi asupan makanan selingan dan pola aktivitas anak.';
    }

    // KBM lookup
    let kbm = 'Minimal naik 500 - 800 gram/bulan';
    if (ageMonths <= 3) kbm = 'Minimal 800 - 900 gram/bulan';
    else if (ageMonths <= 6) kbm = 'Minimal 400 - 600 gram/bulan';
    else if (ageMonths <= 12) kbm = 'Minimal 300 - 400 gram/bulan';
    else kbm = 'Minimal 200 - 300 gram/bulan';

    setCalcResult({
      status,
      color,
      advice,
      kbmStandard: kbm,
    });
  };

  const getWaConsultUrl = () => {
    const cleanNum = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const user = currentUser ? currentUser.name : 'Bunda';
    const subdist = currentUser ? currentUser.subdistrict : 'Bangka Belitung';
    const text = encodeURIComponent(
      `Halo Ahli Gizi Si Bunda, saya ${user} dari Kec. ${subdist}. Saya ingin bertanya mengenai grafik KMS balita saya (usia ${ageMonths} bulan, BB ${weightKg} kg).`
    );
    return `https://wa.me/${cleanNum}?text=${text}`;
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* 1. Header GIF (1280x720 / 720p rounded) */}
      <HeaderGifBanner
        gifUrl={settings.headerGifUrl}
        isAdmin={isAdmin}
        onOpenAdminSettings={onOpenAdminSettings}
        pageTitle="Panduan KMS"
      />

      {/* 2. Judul Page & Ajakan Edukasi KMS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
          <Activity className="w-3.5 h-3.5" />
          Pemantauan Tumbuh Kembang & Kartu Menuju Sehat
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-800 tracking-tight">
          Panduan KMS (Kartu Menuju Sehat)
        </h1>

        <div className="p-4 sm:p-6 rounded-3xl bg-teal-50/70 border border-teal-200/80 shadow-2xs text-stone-700 leading-relaxed text-xs sm:text-sm md:text-base space-y-2">
          <p className="font-bold text-teal-900 text-sm sm:text-base">
            Pantau Kurva Berat Badan Si Kecil Setiap Bulan di Posyandu!
          </p>
          <p>
            KMS bukan sekadar catatan timbangan, melainkan alat deteksi dini paling akurat untuk mencegah stunting dan gagal tumbuh. Simak video edukasi berikut untuk memahami arti garis kurva pertumbuhan, standar KBM (Kenaikan Berat Minimal), dan langkah tepat saat anak tidak naik berat badan.
          </p>
        </div>
      </section>

      {/* 3. Interactive KMS Checker / Kalkulator Status Gizi Sederhana */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-teal-100 shadow-md">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-sm sm:text-base">
                Simulasi Plotting Cek Kurva KMS Balita Bunda
              </h3>
              <p className="text-xs text-stone-500">
                Masukkan umur dan berat badan si kecil untuk melihat perkiraan status pertumbuhan berdasarkan standar WHO/Kemenkes RI.
              </p>
            </div>
          </div>

          <form onSubmit={handleCalculateKms} className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Jenis Kelamin
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'boy' | 'girl')}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-teal-400"
              >
                <option value="boy">Laki-laki (KMS Biru)</option>
                <option value="girl">Perempuan (KMS Merah Muda)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Usia Anak (Bulan)
              </label>
              <input
                type="number"
                min="0"
                max="24"
                required
                value={ageMonths}
                onChange={(e) => setAgeMonths(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Berat Badan (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="30"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
            >
              Cek Status KMS
            </button>
          </form>

          {/* Calculator Output */}
          {calcResult && (
            <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 animate-in fade-in space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Hasil Analisis Plotting KMS:
                  </span>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                      calcResult.color === 'emerald'
                        ? 'bg-emerald-100 text-emerald-800'
                        : calcResult.color === 'amber'
                        ? 'bg-amber-100 text-amber-800'
                        : calcResult.color === 'red'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {calcResult.status}
                  </span>
                </div>

                <div className="text-xs text-stone-600">
                  <span className="font-semibold">Standar KBM Usia Ini: </span>
                  <span className="text-teal-700 font-bold">{calcResult.kbmStandard}</span>
                </div>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed bg-white p-3 rounded-xl border border-stone-100">
                {calcResult.advice}
              </p>

              <div className="flex justify-end">
                <a
                  href={getWaConsultUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Konsultasikan Hasil Ini dengan Ahli Gizi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Video Layout TikTok Style: 2 Kolom Berderet Kesamping dan Berlanjut Kebawah */}
      <section className="max-w-4xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-stone-800 flex items-center gap-2">
            <span>Video Panduan Praktis KMS</span>
            <span className="text-xs font-normal text-stone-500">({kmsVideos.length} Video)</span>
          </h2>

          {isAdmin && onAddVideo && (
            <button
              type="button"
              onClick={onAddVideo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Video KMS</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {kmsVideos.map((video) => (
            <div
              key={video.id}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-teal-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
            >
              {/* Thumbnail Container (TikTok Card Style aspect 4:3 or 16:10) */}
              <div
                onClick={() => setActiveVideo(video)}
                className="relative aspect-[4/3] sm:aspect-[16/10] bg-stone-900 cursor-pointer overflow-hidden"
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-teal-500/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-md text-[10px] sm:text-xs font-semibold text-white flex items-center gap-1">
                  <Clock className="w-3 h-3 text-teal-300" />
                  {video.duration}
                </div>

                {/* Speaker Pill */}
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[9px] sm:text-[11px] font-bold text-stone-800 shadow-2xs truncate max-w-[85%]">
                  {video.speaker.split('(')[0]}
                </div>
              </div>

              {/* Video Info Content */}
              <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3
                    onClick={() => setActiveVideo(video)}
                    className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-2 hover:text-teal-600 cursor-pointer transition-colors leading-snug"
                  >
                    {video.title}
                  </h3>
                  <p className="hidden sm:block text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {video.description}
                  </p>
                </div>

                {/* Tags and Admin actions */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] sm:text-xs text-stone-400">
                  <span className="text-teal-600 font-medium truncate">
                    #{video.tags[0] || 'KMSBalita'}
                  </span>

                  {isAdmin ? (
                    <div className="flex items-center gap-1">
                      {onEditVideo && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditVideo(video);
                          }}
                          className="p-1 text-stone-400 hover:text-amber-600 rounded"
                          title="Edit video"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteVideo && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Hapus video "${video.title}"?`)) {
                              onDeleteVideo(video.id);
                            }
                          }}
                          className="p-1 text-stone-400 hover:text-red-600 rounded"
                          title="Hapus video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveVideo(video)}
                      className="text-stone-500 hover:text-teal-600 font-semibold"
                    >
                      Tonton
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 5 Langkah Mengukur & Membaca KMS di Posyandu */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200">
          <h3 className="font-extrabold text-sm sm:text-base text-stone-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            5 Hal Wajib Diperhatikan Bunda Saat Membaca Buku KIA / KMS:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-600">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
              <span className="w-6 h-6 rounded-full bg-teal-500 text-white font-bold text-[11px] inline-flex items-center justify-center mb-1.5">
                1
              </span>
              <p className="font-bold text-stone-800 mb-0.5">Arah Garis Grafik</p>
              <p className="text-[11px] text-stone-500">
                Grafik harus menanjak (N = Naik). Jika mendatar (T) atau turun (T), segera konsultasikan.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
              <span className="w-6 h-6 rounded-full bg-teal-500 text-white font-bold text-[11px] inline-flex items-center justify-center mb-1.5">
                2
              </span>
              <p className="font-bold text-stone-800 mb-0.5">Cek KBM Bulanan</p>
              <p className="text-[11px] text-stone-500">
                Pastikan kenaikan gramnya memenuhi Kenaikan Berat Minimal (KBM) sesuai tabel di halaman KMS.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
              <span className="w-6 h-6 rounded-full bg-teal-500 text-white font-bold text-[11px] inline-flex items-center justify-center mb-1.5">
                3
              </span>
              <p className="font-bold text-stone-800 mb-0.5">Jangan Lewatkan 2T</p>
              <p className="text-[11px] text-stone-500">
                Jika anak dua bulan berturut-turut tidak naik (2T), segera dirujuk ke Puskesmas untuk intervensi gizi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-teal-100 my-auto animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-100 block">
                  Video Edukasi KMS Si Bunda
                </span>
                <h3 className="text-sm sm:text-base font-bold truncate max-w-md sm:max-w-xl">
                  {activeVideo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full aspect-video bg-black">
              <iframe
                src={`${activeVideo.videoUrl}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="p-4 sm:p-6 max-h-[40vh] overflow-y-auto space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1">
                  <span>Narasumber: {activeVideo.speaker}</span>
                  <span>•</span>
                  <span>Durasi: {activeVideo.duration}</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {activeVideo.description}
                </p>
              </div>

              {activeVideo.keyPoints && (
                <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-100 space-y-2">
                  <h4 className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    Poin Penting untuk Bunda:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-700">
                    {activeVideo.keyPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setActiveVideo(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
                >
                  Tutup Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
