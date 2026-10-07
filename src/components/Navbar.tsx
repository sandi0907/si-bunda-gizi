import React, { useState } from 'react';
import {
  Heart,
  Menu,
  X,
  User,
  Shield,
  MessageCircle,
  BookOpen,
  Activity,
  Apple,
  Home,
  LogOut,
  MapPin,
} from 'lucide-react';
import { VisitorRecord, SiteSettings } from '../data/initialContent';

export type PageId = 'home' | 'gizi-sehat' | 'panduan-kms' | 'resep-mpasi' | 'admin';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  currentUser: VisitorRecord | null;
  onOpenProfileModal: () => void;
  isAdmin: boolean;
  onAdminLogout: () => void;
  settings: SiteSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onOpenProfileModal,
  isAdmin,
  onAdminLogout,
  settings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // WhatsApp Link generator
  const getWhatsAppUrl = () => {
    const cleanNum = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const userName = currentUser ? currentUser.name : 'Bunda';
    const subdist = currentUser ? currentUser.subdistrict : 'Bangka Belitung';
    const text = encodeURIComponent(
      `Halo Ahli Gizi Si Bunda, saya ${userName} dari Kec. ${subdist}, ingin berkonsultasi mengenai pemenuhan gizi dan tumbuh kembang balita.`
    );
    return `https://wa.me/${cleanNum}?text=${text}`;
  };

  const navItems = [
    { id: 'home' as PageId, label: 'Beranda', icon: Home },
    { id: 'gizi-sehat' as PageId, label: 'Gizi Sehat Si Kecil', icon: Apple },
    { id: 'panduan-kms' as PageId, label: 'Panduan KMS', icon: Activity },
    { id: 'resep-mpasi' as PageId, label: 'Resep MP ASI', icon: BookOpen },
  ];

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-rose-200/60 transform group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 bg-clip-text text-transparent block leading-tight">
                Si Bunda
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-stone-500 -mt-0.5 block">
                Edukasi Gizi Balita Babel
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-50 text-rose-600 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-rose-600 hover:bg-stone-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-500' : 'text-stone-400'}`} />
                  {item.label}
                </button>
              );
            })}

            {isAdmin && (
              <button
                type="button"
                onClick={() => handleNavClick('admin')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ml-1 ${
                  currentPage === 'admin'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Panel Admin
              </button>
            )}
          </nav>

          {/* Right Action: User profile or Admin Badge & WhatsApp button */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* User Profile Chip */}
            {currentUser ? (
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-rose-50/80 border border-rose-200/80 text-xs text-stone-700 hover:bg-rose-100/70 transition-all text-left"
                title="Klik untuk ubah data diri"
              >
                <div className="w-6 h-6 rounded-full bg-rose-400 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="leading-tight">
                  <span className="font-semibold text-rose-900 block text-[11px] truncate max-w-[110px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-stone-500 flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5 text-rose-400" />
                    {currentUser.subdistrict}
                  </span>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200"
              >
                <User className="w-3.5 h-3.5" />
                Daftar Kunjungan
              </button>
            )}

            {/* Direct WhatsApp Consultation */}
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-200 transition-all hover:shadow-md"
              title="Konsultasi langsung via WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-100 text-emerald-600" />
              <span>Tanya Gizi</span>
            </a>

            {/* If Admin logged in */}
            {isAdmin && (
              <button
                type="button"
                onClick={onAdminLogout}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                title="Keluar Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Tanya Gizi</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-rose-100 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
          {/* User info in mobile */}
          <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'B'}
              </div>
              <div>
                <p className="text-xs font-bold text-stone-800">
                  {currentUser ? currentUser.name : 'Tamu Bunda'}
                </p>
                <p className="text-[11px] text-stone-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  {currentUser ? `Kec. ${currentUser.subdistrict}, ${currentUser.regency}` : 'Bangka Belitung'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenProfileModal();
              }}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-white px-2.5 py-1 rounded-lg border border-rose-200"
            >
              Ubah
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-500 text-white font-bold shadow-xs'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Admin navigation in mobile */}
            {isAdmin ? (
              <div className="pt-2 border-t border-stone-100 space-y-1">
                <button
                  type="button"
                  onClick={() => handleNavClick('admin')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    currentPage === 'admin'
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Panel Admin & Rekap Google Sheets</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAdminLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Admin</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfileModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-stone-500 text-xs hover:text-stone-700"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Login Pengelola / Admin</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
