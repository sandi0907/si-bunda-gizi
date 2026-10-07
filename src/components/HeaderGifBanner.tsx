import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Settings } from 'lucide-react';
import { ASSETS } from '../assets/images';

interface HeaderGifBannerProps {
  gifUrl?: string;
  isAdmin?: boolean;
  onOpenAdminSettings?: () => void;
  pageTitle?: string;
}

export const HeaderGifBanner: React.FC<HeaderGifBannerProps> = ({
  gifUrl,
  isAdmin,
  onOpenAdminSettings,
  pageTitle,
}) => {
  const [imgError, setImgError] = useState(false);
  const effectiveSrc = !imgError && gifUrl ? gifUrl : ASSETS.headerBanner;

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-2">
      <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl shadow-md border border-rose-100/80 bg-stone-900 transition-all">
        {/* 16:9 Aspect Ratio Container for 1280x720 GIF */}
        <div className="w-full aspect-[16/9] max-h-[280px] sm:max-h-[340px] md:max-h-[380px] relative overflow-hidden flex items-center justify-center">
          <img
            src={effectiveSrc}
            alt="Si Bunda Banner Animasi 1280x720"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center transform group-hover:scale-[1.01] transition-transform duration-500"
          />

          {/* Gentle gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/10 to-transparent pointer-events-none" />

          {/* Decorative Corner Tag */}
          <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 flex items-center gap-2 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-rose-700 shadow-sm border border-rose-100">
              <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              Si Bunda • Edukasi Gizi Balita Babel
            </span>
            {pageTitle && (
              <span className="hidden md:inline-flex px-3 py-1 rounded-full text-xs font-medium bg-stone-900/70 text-rose-100 backdrop-blur-md">
                {pageTitle}
              </span>
            )}
          </div>

          {/* Ratio indicator & Admin Quick-Action */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-white/80 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full">
              <ImageIcon className="w-3 h-3" />
              1280 × 720 (720p)
            </span>

            {isAdmin && (
              <button
                type="button"
                onClick={onOpenAdminSettings}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-rose-600/90 text-white hover:bg-rose-600 shadow-md backdrop-blur-sm transition-all"
                title="Ganti Animasi GIF Header"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Ganti GIF</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
