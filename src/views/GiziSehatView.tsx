import React, { useState } from 'react';
import {
  Play,
  Clock,
  Sparkles,
  Heart,
  Share2,
  CheckCircle,
  X,
  Plus,
  Edit2,
  Trash2,
  MessageCircle,
  Apple,
} from 'lucide-react';
import { HeaderGifBanner } from '../components/HeaderGifBanner';
import { VideoItem, SiteSettings, VisitorRecord } from '../data/initialContent';

interface GiziSehatViewProps {
  videos: VideoItem[];
  settings: SiteSettings;
  isAdmin: boolean;
  onOpenAdminSettings: () => void;
  currentUser: VisitorRecord | null;
  onAddVideo?: () => void;
  onEditVideo?: (video: VideoItem) => void;
  onDeleteVideo?: (videoId: string) => void;
}

export const GiziSehatView: React.FC<GiziSehatViewProps> = ({
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
  const [filterTag, setFilterTag] = useState<string>('Semua');

  // Filter only gizi-sehat videos
  const giziVideos = videos.filter((v) => v.category === 'gizi-sehat');

  // Collect all unique tags
  const allTags = ['Semua', ...Array.from(new Set(giziVideos.flatMap((v) => v.tags)))];

  const filteredList =
    filterTag === 'Semua'
      ? giziVideos
      : giziVideos.filter((v) => v.tags.includes(filterTag));

  // WhatsApp share / question link
  const getWaQuestionLink = (video: VideoItem) => {
    const cleanNum = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const userText = currentUser ? currentUser.name : 'Bunda';
    const msg = encodeURIComponent(
      `Halo Ahli Gizi Si Bunda, saya ${userText} baru saja menonton video "${video.title}". Saya ingin bertanya lebih lanjut seputar topik ini untuk anak saya.`
    );
    return `https://wa.me/${cleanNum}?text=${msg}`;
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* 1. Header GIF (1280x720 / 720p rounded) */}
      <HeaderGifBanner
        gifUrl={settings.headerGifUrl}
        isAdmin={isAdmin}
        onOpenAdminSettings={onOpenAdminSettings}
        pageTitle="Gizi Sehat Si Kecil"
      />

      {/* 2. Judul Page & Ajakan Edukasi Resmi dari Klien */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
          <Apple className="w-3.5 h-3.5" />
          Edukasi Nutrisi & Pola Makan
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-800 tracking-tight">
          Gizi Sehat untuk Si Kecil
        </h1>

        {/* Teks ajakan persis sesuai permintaan klien */}
        <div className="p-4 sm:p-6 rounded-3xl bg-rose-50/80 border border-rose-200/90 shadow-2xs text-stone-700 leading-relaxed text-xs sm:text-sm md:text-base space-y-2">
          <p className="font-bold text-rose-800 text-sm sm:text-base">
            Yuk Kenali Gizi Sehat untuk Tumbuh Kembang Si Kecil!
          </p>
          <p>
            Pahami pentingnya pemberian makanan yang tepat dan pola pengasuhan saat makan untuk mendukung terpenuhinya kebutuhan gizi anak. Yuk, simak penjelasan video berikut untuk mendapatkan informasi bermanfaat dalam mendukung tumbuh kembang si kecil.
          </p>
        </div>
      </section>

      {/* 3. Filter Tags & Admin Add Button */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-rose-100">
          {/* Tag Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setFilterTag(tag)}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap ${
                  filterTag === tag
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-rose-50 border border-stone-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Admin Fast Action */}
          {isAdmin && onAddVideo && (
            <button
              type="button"
              onClick={onAddVideo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Video Edukasi</span>
            </button>
          )}
        </div>
      </section>

      {/* 4. Video Layout TikTok Style: 2 Kolom Berderet Kesamping dan Berlanjut Kebawah */}
      <section className="max-w-4xl mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {filteredList.map((video) => (
            <div
              key={video.id}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-rose-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
            >
              {/* Thumbnail Container (TikTok Card Style aspect 4:5 or 16:10) */}
              <div
                onClick={() => setActiveVideo(video)}
                className="relative aspect-[4/3] sm:aspect-[16/10] bg-stone-900 cursor-pointer overflow-hidden"
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                />

                {/* Dark gradient overlay for readable text */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />

                {/* Play Button Overlay (TikTok feel) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-md text-[10px] sm:text-xs font-semibold text-white flex items-center gap-1">
                  <Clock className="w-3 h-3 text-rose-400" />
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
                    className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-2 hover:text-rose-600 cursor-pointer transition-colors leading-snug"
                  >
                    {video.title}
                  </h3>
                  <p className="hidden sm:block text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {video.description}
                  </p>
                </div>

                {/* Tags and Admin actions */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] sm:text-xs text-stone-400">
                  <span className="text-rose-600 font-medium truncate">
                    #{video.tags[0] || 'GiziBalita'}
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
                      className="text-stone-500 hover:text-rose-600 font-semibold"
                    >
                      Tonton
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredList.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-200">
            <p className="text-stone-500 text-sm">Belum ada video edukasi untuk kategori ini.</p>
          </div>
        )}
      </section>

      {/* 5. Video Player Modal with Detailed Nutrition Points */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 my-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-500 to-amber-500 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-100 block">
                  Video Edukasi Gizi Si Bunda
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

            {/* Video Embed */}
            <div className="w-full aspect-video bg-black">
              <iframe
                src={`${activeVideo.videoUrl}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Video Details & Action */}
            <div className="p-4 sm:p-6 max-h-[40vh] overflow-y-auto space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 mb-1">
                  <span>Narasumber: {activeVideo.speaker}</span>
                  <span>•</span>
                  <span>Durasi: {activeVideo.duration}</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {activeVideo.description}
                </p>
              </div>

              {/* Key Nutrition Points */}
              {activeVideo.keyPoints && activeVideo.keyPoints.length > 0 && (
                <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-100 space-y-2">
                  <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    Poin Kunci Edukasi untuk Bunda:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-700">
                    {activeVideo.keyPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-stone-100">
                <a
                  href={getWaQuestionLink(activeVideo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Tanyakan Topik Ini ke Ahli Gizi</span>
                </a>

                <button
                  type="button"
                  onClick={() => setActiveVideo(null)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
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
