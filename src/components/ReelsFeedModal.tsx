import React, { useEffect } from 'react';
import { VideoItem } from './PortraitReelCard';

interface ReelsFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  videos: VideoItem[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  category: 'gizi' | 'kms';
  whatsappNumber: string;
  likedVideos: Record<string | number, boolean>;
  likeCounts: Record<string | number, number>;
  onToggleLike: (id: string | number) => void;
  savedVideos: Record<string | number, boolean>;
  onToggleSave: (id: string | number) => void;
  onShare: (video: VideoItem) => void;
  logoUrl?: string;
}

export const ReelsFeedModal: React.FC<ReelsFeedModalProps> = ({
  isOpen,
  onClose,
  videos,
  currentIndex,
  onNavigate,
  category,
  whatsappNumber,
  likedVideos,
  likeCounts,
  onToggleLike,
  savedVideos,
  onToggleSave,
  onShare,
  logoUrl = '/assets/aistudio/logo_eduzi_2507d203.png',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      }
      if (e.key === 'ArrowDown' && currentIndex < videos.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, videos.length, onClose, onNavigate]);

  if (!isOpen || !videos || videos.length === 0) return null;

  const currentVideo = videos[currentIndex] || videos[0];
  const isLiked = !!likedVideos[currentVideo.id];
  const likeCount = likeCounts[currentVideo.id] || 120 + ((Number(currentVideo.id) || 1) * 37) % 500;
  const isSaved = !!savedVideos[currentVideo.id];
  const accentBgClass = category === 'gizi' ? 'bg-[#FF7B9C]' : 'bg-[#2EC4B6]';
  const accentTextClass = category === 'gizi' ? 'text-[#FF7B9C]' : 'text-[#2EC4B6]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      {/* Container: Vertical Smartphone Aspect Ratio Frame */}
      <div className="relative w-full max-w-[420px] h-[92vh] max-h-[820px] aspect-[9/16] rounded-3xl overflow-hidden bg-stone-950 shadow-2xl border-2 border-stone-800 flex flex-col justify-between">
        {/* Video Player */}
        <div className="relative w-full h-full bg-black">
          <iframe
            key={currentVideo.youtubeId}
            src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1`}
            title={currentVideo.title}
            className="w-full h-full border-0 object-cover"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* TOP FLOATING OVERLAY BAR */}
        <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between text-white pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className={`${accentBgClass} text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1`}>
              <i className="fa-solid fa-bolt text-[8px]"></i>
              <span>Reels Mode</span>
            </span>
            <span className="bg-black/60 backdrop-blur-md text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-white/10">
              {currentIndex + 1} / {videos.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition active:scale-95"
            title="Tutup Mode Reels"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* NAVIGATION BUTTONS (NEXT & PREVIOUS REEL) */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3 pointer-events-auto">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => onNavigate(currentIndex - 1)}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition ${
              currentIndex === 0
                ? 'bg-black/20 text-white/30 cursor-not-allowed'
                : 'bg-black/60 hover:bg-black/90 text-white active:scale-90'
            }`}
            title="Video Sebelumnya (Arrow Up)"
          >
            <i className="fa-solid fa-chevron-up text-xs"></i>
          </button>
          <button
            type="button"
            disabled={currentIndex === videos.length - 1}
            onClick={() => onNavigate(currentIndex + 1)}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition ${
              currentIndex === videos.length - 1
                ? 'bg-black/20 text-white/30 cursor-not-allowed'
                : 'bg-black/60 hover:bg-black/90 text-white active:scale-90'
            }`}
            title="Video Berikutnya (Arrow Down)"
          >
            <i className="fa-solid fa-chevron-down text-xs"></i>
          </button>
        </div>

        {/* RIGHT ACTION BAR */}
        <div className="absolute right-3 bottom-20 z-30 flex flex-col items-center gap-3.5 text-white pointer-events-auto">
          {/* Like Button */}
          <button
            type="button"
            onClick={() => onToggleLike(currentVideo.id)}
            className="flex flex-col items-center active:scale-125 transition-transform"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition ${
                isLiked
                  ? 'bg-[#FF2D55] text-white shadow-lg shadow-pink-500/50 scale-105'
                  : 'bg-black/50 hover:bg-black/70 text-white'
              }`}
            >
              <i className={`fa-solid fa-heart text-base ${isLiked ? 'animate-bounce' : ''}`}></i>
            </div>
            <span className="text-[10px] font-extrabold mt-0.5 drop-shadow">{likeCount}</span>
          </button>

          {/* WhatsApp Tanya Ahli Gizi */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              `Halo Ahli Gizi Si Bunda, saya sedang menonton VT Reels: "${currentVideo.title}" dan ingin berkonsultasi.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center active:scale-125 transition-transform"
            title="Tanya Ahli Gizi via WA"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition shadow-lg">
              <i className="fa-brands fa-whatsapp text-lg"></i>
            </div>
            <span className="text-[10px] font-extrabold mt-0.5 text-emerald-200 drop-shadow">Tanya</span>
          </a>

          {/* Share */}
          <button
            type="button"
            onClick={() => onShare(currentVideo)}
            className="flex flex-col items-center active:scale-125 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition shadow-md">
              <i className="fa-solid fa-share text-base"></i>
            </div>
            <span className="text-[10px] font-extrabold mt-0.5 drop-shadow">Share</span>
          </button>

          {/* Bookmark */}
          <button
            type="button"
            onClick={() => onToggleSave(currentVideo.id)}
            className="flex flex-col items-center active:scale-125 transition-transform"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition ${
                isSaved ? 'bg-amber-500 text-white shadow-md' : 'bg-black/50 hover:bg-black/70 text-white'
              }`}
            >
              <i className="fa-solid fa-bookmark text-sm"></i>
            </div>
            <span className="text-[10px] font-extrabold mt-0.5 drop-shadow">Simpan</span>
          </button>

          {/* Rotating Music Disc */}
          <div
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-stone-900 to-stone-700 p-1 border-2 border-white/30 flex items-center justify-center shadow-lg animate-spin"
            style={{ animationDuration: '4s' }}
          >
            <div className={`w-3.5 h-3.5 rounded-full ${accentBgClass} flex items-center justify-center`}>
              <i className="fa-solid fa-music text-[7px] text-white"></i>
            </div>
          </div>
        </div>

        {/* BOTTOM METADATA OVERLAY */}
        <div className="absolute inset-x-0 bottom-0 p-4 pt-8 bg-gradient-to-t from-black via-black/80 to-transparent z-20 text-white space-y-1.5 pointer-events-auto max-w-[80%]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white p-0.5 border border-pink-400 overflow-hidden shadow-xs shrink-0">
              <img src={logoUrl} alt="Si Bunda" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-xs">@sibunda.official</span>
            <i className="fa-solid fa-circle-check text-sky-400 text-xs"></i>
          </div>

          <h4 className="font-extrabold text-sm text-white line-clamp-2 leading-snug drop-shadow-md">
            {currentVideo.title}
          </h4>

          <p className="text-[11px] text-stone-300 line-clamp-2 leading-tight">
            {currentVideo.description}
          </p>

          <div className="flex items-center gap-1.5 text-[10px] text-stone-300 pt-1 border-t border-white/10">
            <i className={`fa-solid fa-music ${accentTextClass} text-[9px]`}></i>
            <span className="truncate">Suara Asli • Ahli Gizi Si Bunda Indonesia</span>
          </div>
        </div>
      </div>
    </div>
  );
};
