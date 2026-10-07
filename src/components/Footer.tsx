import React from 'react';
import { Heart, MessageCircle, Shield, MapPin, Phone, CheckCircle, Sparkles } from 'lucide-react';
import { PageId } from './Navbar';
import { SiteSettings, VisitorRecord } from '../data/initialContent';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  onOpenAdminLogin: () => void;
  settings: SiteSettings;
  currentUser: VisitorRecord | null;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenAdminLogin,
  settings,
  currentUser,
}) => {
  const cleanNum = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const userName = currentUser ? currentUser.name : 'Bunda';
  const subdist = currentUser ? currentUser.subdistrict : 'Bangka Belitung';
  const waUrl = `https://wa.me/${cleanNum}?text=${encodeURIComponent(
    `Halo ${settings.whatsappConsultantName}, saya ${userName} dari Kec. ${subdist}. Saya ingin berkonsultasi seputar gizi balita, MP-ASI, dan pemantauan KMS.`
  )}`;

  return (
    <footer className="bg-stone-900 text-stone-300 mt-16 border-t border-rose-950/40">
      {/* WhatsApp Consultation Callout */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              Layanan Konsultasi Gizi Gratis Bunda
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Punya Pertanyaan Seputar Gizi & Pola Makan Si Kecil?
            </h3>
            <p className="text-rose-100 text-xs sm:text-sm max-w-xl">
              Hubungi langsung konsultan ahli gizi Si Bunda via WhatsApp untuk solusi terpercaya seputar MP-ASI, anak susah makan (GTM), dan grafik KMS.
            </p>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-rose-700 hover:bg-rose-50 font-bold text-sm shadow-lg shadow-black/15 transition-all transform hover:scale-[1.02] shrink-0"
          >
            <MessageCircle className="w-5 h-5 fill-emerald-500 text-emerald-500" />
            <span>Chat WhatsApp Ahli Gizi</span>
          </a>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Si Bunda</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-md">
              Platform edukasi gizi berbasis web yang membantu para ibu di Kepulauan Bangka Belitung dalam pemenuhan nutrisi tepat, pola pengasuhan makan positif, serta pemantauan tumbuh kembang balita demi mewujudkan generasi sehat bebas stunting.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-rose-300">
              <MapPin className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Provinsi Kepulauan Bangka Belitung, Indonesia</span>
            </div>
          </div>

          {/* Quick Nav Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Halaman Edukasi
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Beranda Si Bunda
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('gizi-sehat')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Gizi Sehat untuk Si Kecil
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('panduan-kms')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Panduan Kartu Menuju Sehat (KMS)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('resep-mpasi')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Buku Resep MP ASI (PDF Scribd)
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Admin Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Kontak & Pengelola
            </h4>
            <div className="space-y-2 text-xs text-stone-400">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp: +{cleanNum}</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>{settings.whatsappConsultantName}</span>
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Akses Admin (dinda0909)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-10 pt-6 border-t border-stone-800 text-center sm:flex sm:justify-between sm:items-center text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Si Bunda. Didedikasikan untuk Kesehatan Balita Indonesia.</p>
          <p className="mt-2 sm:mt-0">Dukungan Penuh Pemenuhan Gizi & Pencegahan Stunting</p>
        </div>
      </div>
    </footer>
  );
};
