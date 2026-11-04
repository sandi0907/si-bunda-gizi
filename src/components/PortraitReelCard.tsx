import React from 'react';

export interface VideoItem {
  id: number | string;
  category: 'gizi' | 'kms';
  title: string;
  youtubeId: string;
  description: string;
  duration?: string;
  views?: string;
  thumbnail?: string;
}

interface PortraitReelCardProps {
  video: VideoItem;
  category: 'gizi' | 'kms';
  isActive: boolean;
  onPlay: () => void;
  onClose: () => void;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  whatsappNumber: string;
  isLiked: boolean;
  likeCount: number;
  onToggleLike: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
  onOpenFullscreen: () => void;
  logoUrl?: string;
}

export const PortraitReelCard: React.FC<PortraitReelCardProps> = ({
  video,
  category,
  isActive,
  onPlay,
  onClose,
  isAdmin,
  onEdit,
  onDelete,
  whatsappNumber,
  isLiked,
  likeCount,
  onToggleLike,
  isSaved,
  onToggleSave,
  onShare,
  onOpenFullscreen,
  logoUrl = '/assets/aistudio/logo_eduzi_2507d203.png',
}) => {
  const accentColor = category === 'gizi' ? '#FF7B9C' : '#2EC4B6';
  const accentBgClass = category === 'gizi' ? 'bg-[#FF7B9C]' : 'bg-[#2EC4B6]';
  const accentTextClass = category === 'gizi' ? 'text-[#FF7B9C]' : 'text-[#2EC4B6]';

  const defaultThumb =
    video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

  return (
    <div className="relative w-full max-w-[340px] aspect-[9/16] rounded-3xl overflow-hidden bg-stone-950 shadow-2xl border-2 border-stone-800/90 group flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-stone-700 select-none mx-auto">
      {/* 1. ACTIVE PLAYING STATE */}
      {isActive ? (
        <div className="relative w-full h-full bg-black flex flex-col">
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1`}
            title={video.title}
            className="w-full h-full border-0 object-cover"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

          {/* Floating Top Bar during play */}
          <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between pointer-events-auto">
            <span className="bg-black/75 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>Memutar VT</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="bg-black/85 hover:bg-stone-900 text-white text-xs px-3.5 py-1.5 rounded-full backdrop-blur-md font-bold flex items-center gap-1.5 shadow-lg border border-white/20 transition active:scale-95"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
              <span>Tutup VT</span>
            </button>
          </div>
        </div>
      ) : (
        /* 2. VT / REELS PORTRAIT PREVIEW STATE */
        <div className="relative w-full h-full flex flex-col justify-between">
          {/* Vertical Thumbnail with Ken Burns hover effect */}
          <img
            src={defaultThumb}
            alt={video.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />

          {/* High-Contrast Gradient Scrim for TikTok / Reels typography */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/60 pointer-events-none" />

          {/* TOP HEADER BAR */}
          <div className="relative z-20 p-3.5 flex items-center justify-between text-white">
            <div className="flex items-center gap-1.5">
              <span
                className={`${accentBgClass} text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 tracking-wide`}
              >
                <i className="fa-solid fa-play text-[8px]"></i>
                <span>VT {category === 'gizi' ? 'Gizi' : 'KMS'}</span>
              </span>
              <span className="bg-black/50 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-full text-stone-300 border border-white/10">
                {video.duration || '03:45'}
              </span>
            </div>

            {/* Admin Quick Action Controls */}
            {isAdmin ? (
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="w-6 h-6 rounded-lg bg-blue-500/80 hover:bg-blue-600 text-white text-[10px] flex items-center justify-center transition"
                  title="Edit VT ini"
                >
                  <i className="fa-solid fa-pen"></i>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="w-6 h-6 rounded-lg bg-red-500/80 hover:bg-red-600 text-white text-[10px] flex items-center justify-center transition"
                  title="Hapus VT ini"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenFullscreen}
                className="bg-black/50 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/15 flex items-center gap-1 transition active:scale-95"
                title="Buka Mode Feed Reels Layar Penuh"
              >
                <i className="fa-solid fa-expand text-[10px]"></i>
                <span className="hidden sm:inline">Layar Penuh</span>
              </button>
            )}
          </div>

          {/* CENTER TAP-TO-PLAY BUTTON */}
          <div
            onClick={onPlay}
            className="relative z-10 flex-grow flex flex-col items-center justify-center cursor-pointer group/center"
          >
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl group-hover/center:scale-110 group-hover/center:bg-white/30 transition-all duration-300">
              <div
                className={`w-12 h-12 rounded-full ${accentBgClass} flex items-center justify-center text-white shadow-lg`}
              >
                <i className="fa-solid fa-play text-xl ml-1"></i>
              </div>
            </div>
            <span className="mt-2.5 text-[11px] font-extrabold text-white/90 bg-black/40 backdrop-blur-sm px-3 py-0.5 rounded-full border border-white/10 tracking-wide">
              Putar Video VT
            </span>
          </div>

          {/* RIGHT-SIDE TIKTOK / REELS VERTICAL ACTION BAR */}
          <div className="absolute right-2.5 bottom-24 z-20 flex flex-col items-center gap-3.5 text-white pointer-events-auto">
            {/* Heart / Suka */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike();
              }}
              className="flex flex-col items-center group/btn active:scale-125 transition-transform"
              title={isLiked ? 'Batal Suka' : 'Suka VT ini'}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-all ${
                  isLiked
                    ? 'bg-[#FF2D55] text-white shadow-lg shadow-pink-500/50 scale-105'
                    : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
              >
                <i
                  className={`fa-solid fa-heart text-base ${
                    isLiked ? 'animate-bounce' : ''
                  }`}
                ></i>
              </div>
              <span className="text-[10px] font-extrabold mt-0.5 drop-shadow-md">
                {likeCount}
              </span>
            </button>

            {/* Tanya Ahli Gizi / Konsultasi WA */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                `Halo Ahli Gizi Si Bunda, saya ingin berkonsultasi mengenai video edukasi VT: "${video.title}"`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col items-center group/btn active:scale-125 transition-transform"
              title="Konsultasi Ahli Gizi tentang topik ini"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center backdrop-blur-md shadow-lg border border-white/20 transition">
                <i className="fa-brands fa-whatsapp text-lg"></i>
              </div>
              <span className="text-[10px] font-extrabold mt-0.5 drop-shadow-md text-emerald-200">
                Tanya
              </span>
            </a>

            {/* Bagikan / Share */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="flex flex-col items-center group/btn active:scale-125 transition-transform"
              title="Bagikan VT ini"
            >
              <div className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition shadow-md">
                <i className="fa-solid fa-share text-base"></i>
              </div>
              <span className="text-[10px] font-extrabold mt-0.5 drop-shadow-md">
                Share
              </span>
            </button>

            {/* Simpan / Bookmark */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              className="flex flex-col items-center group/btn active:scale-125 transition-transform"
              title={isSaved ? 'Hapus Simpanan' : 'Simpan VT'}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition ${
                  isSaved
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
              >
                <i className="fa-solid fa-bookmark text-sm"></i>
              </div>
              <span className="text-[10px] font-extrabold mt-0.5 drop-shadow-md">
                Simpan
              </span>
            </button>

            {/* Spinning Music Vinyl Disc */}
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-stone-900 to-stone-700 p-1 border-2 border-white/30 flex items-center justify-center shadow-lg animate-spin"
              style={{ animationDuration: '4s' }}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full ${accentBgClass} flex items-center justify-center`}
              >
                <i className="fa-solid fa-music text-[7px] text-white"></i>
              </div>
            </div>
          </div>

          {/* BOTTOM CAPTION & CREATOR OVERLAY */}
          <div className="relative z-20 p-4 pt-2 text-white space-y-1.5 pointer-events-auto max-w-[82%]">
            {/* Creator Row */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white p-0.5 border border-pink-400 overflow-hidden shadow-xs shrink-0">
                <img
                  src={logoUrl}
                  alt="Si Bunda"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold text-xs tracking-tight truncate">
                @sibunda.official
              </span>
              <i className="fa-solid fa-circle-check text-sky-400 text-xs shrink-0"></i>
              <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded text-pink-200 font-bold shrink-0">
                Ahli Gizi
              </span>
            </div>

            {/* Title */}
            <h4
              onClick={onPlay}
              className="font-black text-sm text-white line-clamp-2 leading-snug drop-shadow-md cursor-pointer hover:underline"
            >
              {video.title}
            </h4>

            {/* Description */}
            <p className="text-[11px] text-stone-300 line-clamp-2 leading-tight drop-shadow-sm font-normal">
              {video.description}
            </p>

            {/* Dynamic Hashtags */}
            <div className="flex flex-wrap gap-1 text-[10px] font-bold">
              <span className={accentTextClass}>
                #{category === 'gizi' ? 'GiziBalita' : 'PanduanKMS'}
              </span>
              <span className="text-pink-300">#CegahStunting</span>
              <span className="text-teal-300">#IsiPiringku</span>
            </div>

            {/* Audio Ticker Marquee */}
            <div className="flex items-center gap-1.5 text-[10px] text-stone-300 pt-1 border-t border-white/10">
              <i className={`fa-solid fa-music ${accentTextClass} text-[9px]`}></i>
              <span className="truncate max-w-[190px]">
                Suara Asli • Ahli Gizi Si Bunda Indonesia
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
