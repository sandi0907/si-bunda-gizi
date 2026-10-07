import React, { useState, useMemo } from 'react';
import {
  Heart,
  MapPin,
  User,
  Search,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  X,
} from 'lucide-react';
import {
  ALL_SUBDISTRICTS,
  BANGKA_BELITUNG_REGENCIES,
  Subdistrict,
} from '../data/bangkaBelitungData';
import { addVisitor, setAdminAuthenticated, setCurrentUser } from '../utils/storage';
import { VisitorRecord } from '../data/initialContent';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess: () => void;
  onUserRegistered: (user: VisitorRecord) => void;
}

export const WelcomePopup: React.FC<WelcomePopupProps> = ({
  isOpen,
  onClose,
  onAdminLoginSuccess,
  onUserRegistered,
}) => {
  // Modes: 'visitor' | 'admin'
  const [mode, setMode] = useState<'visitor' | 'admin'>('visitor');

  // Visitor form state - Only Name and Subdistrict/Regency
  const [name, setName] = useState('');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<Subdistrict | null>(null);
  const [subdistrictSearch, setSubdistrictSearch] = useState('');
  const [selectedRegencyFilter, setSelectedRegencyFilter] = useState<string>('Semua');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin login state
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Filtered subdistricts
  const filteredSubdistricts = useMemo(() => {
    return ALL_SUBDISTRICTS.filter((sub) => {
      const matchSearch =
        sub.name.toLowerCase().includes(subdistrictSearch.toLowerCase()) ||
        sub.regency.toLowerCase().includes(subdistrictSearch.toLowerCase());
      const matchRegency =
        selectedRegencyFilter === 'Semua' || sub.regency === selectedRegencyFilter;
      return matchSearch && matchRegency;
    });
  }, [subdistrictSearch, selectedRegencyFilter]);

  if (!isOpen) return null;

  const handleVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Mohon isi nama lengkap atau panggilan Bunda.');
      return;
    }
    if (!selectedSubdistrict) {
      setErrorMsg('Mohon pilih kecamatan dan kabupaten tempat tinggal Bunda dari daftar di bawah.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newVisitor = await addVisitor({
        name: name.trim(),
        subdistrict: selectedSubdistrict.name,
        regency: selectedSubdistrict.regency,
        targetCategory: 'Ibu Balita',
      });

      setCurrentUser(newVisitor);
      onUserRegistered(newVisitor);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kendala saat menyimpan. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    if (adminPassword.trim() === 'dinda0909') {
      setAdminAuthenticated(true);
      onAdminLoginSuccess();
      onClose();
    } else {
      setAdminError('Password admin salah. Silakan periksa kembali kata sandi Anda.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Decor */}
        <div className="relative bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400 p-5 sm:p-6 text-white text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md mb-2 shadow-inner">
            <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Selamat Datang di Si Bunda!
          </h2>
          <p className="text-rose-50 text-xs sm:text-sm mt-1 max-w-md mx-auto leading-relaxed">
            Platform Edukasi Gizi & Pengasuhan Balita untuk Tumbuh Kembang Optimal Anak di Kepulauan Bangka Belitung
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-4 inline-flex p-1 rounded-xl bg-black/15 backdrop-blur-sm text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('visitor');
                setErrorMsg('');
              }}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                mode === 'visitor'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Bunda & Pengunjung
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('admin');
                setAdminError('');
              }}
              className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                mode === 'admin'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Masuk Admin
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {mode === 'visitor' ? (
            <form onSubmit={handleVisitorSubmit} className="space-y-4">
              <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-100/80 text-xs text-rose-800 leading-relaxed">
                <span className="font-semibold block mb-0.5">🌸 Salam Hangat Bunda!</span>
                Silakan masukkan nama Bunda serta pilih kecamatan dan kabupaten tempat tinggal di Kepulauan Bangka Belitung untuk melanjutkan.
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {errorMsg}
                </div>
              )}

              {/* 1. Input Nama */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-rose-500" />
                  Nama Bunda / Pengunjung <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Bunda Dinda / Siti Rahma"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 text-sm bg-stone-50/40 text-stone-800 placeholder-stone-400"
                />
              </div>

              {/* 2. Pilihan Kecamatan & Kabupaten di Bangka Belitung */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    Kecamatan & Kabupaten Tempat Tinggal <span className="text-rose-500">*</span>
                  </label>
                  {selectedSubdistrict && (
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Terpilih: Kec. {selectedSubdistrict.name} ({selectedSubdistrict.regency})
                    </span>
                  )}
                </div>

                {/* Filter Kabupaten / Kota Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-2 scrollbar-none text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSelectedRegencyFilter('Semua')}
                    className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                      selectedRegencyFilter === 'Semua'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Semua ({ALL_SUBDISTRICTS.length})
                  </button>
                  {BANGKA_BELITUNG_REGENCIES.map((reg) => (
                    <button
                      key={reg.name}
                      type="button"
                      onClick={() => setSelectedRegencyFilter(reg.name)}
                      className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                        selectedRegencyFilter === reg.name
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {reg.name.replace('Kabupaten ', 'Kab. ')} ({reg.subdistricts.length})
                    </button>
                  ))}
                </div>

                {/* Search Bar for Kecamatan */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={subdistrictSearch}
                    onChange={(e) => setSubdistrictSearch(e.target.value)}
                    placeholder="Cari kecamatan... (contoh: Sungailiat, Koba, Mentok, Toboali)"
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50/80 focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                  {subdistrictSearch && (
                    <button
                      type="button"
                      onClick={() => setSubdistrictSearch('')}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* List Kecamatan & Kabupaten Klik Langsung */}
                <div className="h-48 sm:h-52 overflow-y-auto rounded-xl border border-stone-200 p-1.5 bg-stone-50/50 space-y-1">
                  {filteredSubdistricts.length === 0 ? (
                    <div className="text-center py-6 text-stone-400 text-xs">
                      Tidak ditemukan kecamatan dengan kata kunci &quot;{subdistrictSearch}&quot;.
                    </div>
                  ) : (
                    filteredSubdistricts.map((sub) => {
                      const isSelected = selectedSubdistrict?.id === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            setSelectedSubdistrict(sub);
                            setErrorMsg('');
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-rose-500 text-white font-semibold shadow-sm'
                              : 'bg-white hover:bg-rose-50/80 text-stone-700 border border-stone-100'
                          }`}
                        >
                          <div>
                            <span className="font-semibold">{sub.name}</span>
                            <span
                              className={`ml-2 text-[10px] ${
                                isSelected ? 'text-rose-100 font-medium' : 'text-stone-500'
                              }`}
                            >
                              • {sub.regency}
                            </span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 shadow-md shadow-rose-200/50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span>Menyimpan data...</span>
                ) : (
                  <>
                    <span>Mulai Belajar Bersama Si Bunda</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Admin Login Mode */
            <form onSubmit={handleAdminSubmit} className="space-y-4 py-2">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-stone-800 text-base">
                  Login Admin Si Bunda
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Khusus pengelola / nutrisionis untuk mengupdate isi konten edukasi, resep, video, dan rekap Google Spreadsheet.
                </p>
              </div>

              {adminError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {adminError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Kata Sandi Admin
                </label>
                <div className="relative">
                  <input
                    type="password"
                    autoFocus
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Masukkan password admin..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-stone-50/50 text-stone-800"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Petunjuk sandi pengelola: <span className="font-mono text-stone-600">dinda0909</span>
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setMode('visitor')}
                  className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all text-center"
                >
                  Kembali ke Bunda
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Masuk Panel Admin</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
