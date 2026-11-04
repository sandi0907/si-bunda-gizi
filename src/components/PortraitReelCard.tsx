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
  category?: 'gizi' | 'kms';
  isActive: boolean;
  onPlay: () => void;
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  // Optional legacy props
  whatsappNumber?: string;
  isLiked?: boolean;
  likeCount?: number;
  onToggleLike?: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onShare?: () => void;
  onOpenFullscreen?: () => void;
  logoUrl?: string;
}

export const PortraitReelCard: React.FC<PortraitReelCardProps> = ({
  video,
  category = 'gizi',
  isActive,
  onPlay,
  onClose,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const accentBgClass = category === 'gizi' ? 'bg-[#FF7B9C]' : 'bg-[#2EC4B6]';
  const defaultThumb =
    video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

  return (
    <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-3xl overflow-hidden bg-stone-950 shadow-xl border-2 border-stone-800 group flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-stone-700 select-none mx-auto">
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

          {/* Close button during play */}
          <div className="absolute top-3 right-3 z-30 pointer-events-auto">
            <button
              type="button"
              onClick={onClose}
              className="bg-black/85 hover:bg-stone-900 text-white text-xs px-3.5 py-1.5 rounded-full backdrop-blur-md font-bold flex items-center gap-1.5 shadow-lg border border-white/20 transition active:scale-95"
              title="Tutup pemutar video"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
              <span>Tutup</span>
            </button>
          </div>
        </div>
      ) : (
        /* 2. PREVIEW STATE - ONLY PLAY BUTTON AND TITLE */
        <div className="relative w-full h-full flex flex-col justify-between">
          {/* Video Thumbnail */}
          <img
            src={defaultThumb}
            alt={video.title}
            onClick={onPlay}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer"
          />

          {/* Dark gradient overlay for title legibility */}
          <div
            onClick={onPlay}
            className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/35 cursor-pointer"
          />

          {/* TOP RIGHT: ADMIN CONTROLS ONLY IF LOGGED IN */}
          <div className="relative z-20 p-3.5 flex justify-end">
            {isAdmin && (
              <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-md">
                {onEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="w-7 h-7 rounded-lg bg-blue-500/90 hover:bg-blue-600 text-white text-xs flex items-center justify-center transition active:scale-95"
                    title="Edit video ini"
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="w-7 h-7 rounded-lg bg-red-500/90 hover:bg-red-600 text-white text-xs flex items-center justify-center transition active:scale-95"
                    title="Hapus video ini"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* CENTER: PLAY BUTTON */}
          <div
            onClick={onPlay}
            className="relative z-10 flex-grow flex flex-col items-center justify-center cursor-pointer group/center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/50 flex items-center justify-center text-white shadow-2xl group-hover/center:scale-110 group-hover/center:bg-white/35 transition-all duration-300">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${accentBgClass} flex items-center justify-center text-white shadow-lg`}
              >
                <i className="fa-solid fa-play text-xl sm:text-2xl ml-1"></i>
              </div>
            </div>
          </div>

          {/* BOTTOM: VIDEO TITLE ONLY */}
          <div className="relative z-20 p-5 bg-gradient-to-t from-black via-black/85 to-transparent">
            <h4
              onClick={onPlay}
              className="font-black text-sm sm:text-base text-white line-clamp-3 leading-snug drop-shadow-md cursor-pointer hover:underline text-center"
            >
              {video.title}
            </h4>
          </div>
        </div>
      )}
    </div>
  );
};
