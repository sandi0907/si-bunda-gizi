import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  dbAddVisitorLog,
  dbSaveWebhook,
  dbSaveVideo,
  dbDeleteVideo,
  dbSavePdfBook,
  dbDeletePdfBook,
  subscribeToVisitorLogs,
  subscribeToWebhookSettings,
  subscribeToVideos,
  subscribeToPdfBooks,
  sendToGoogleSheet,
} from './services/firebaseSync';
import {
  savePdfBookToIndexedDB,
  getAllPdfBooksFromIndexedDB,
  deletePdfBookFromIndexedDB,
  base64ToBlobUrl,
} from './utils/pdfStorage';

const DEFAULT_LOGO_URL = '/assets/aistudio/logo_eduzi_2507d203.png';

interface UserData {
  nama: string;
  kecamatan: string;
  nomorHp: string;
}

interface VisitorLog {
  id?: string;
  nama: string;
  kecamatan: string;
  nomorHp?: string;
  timestamp: string;
}

interface VideoItem {
  id: number | string;
  category: 'gizi' | 'kms';
  title: string;
  youtubeId: string;
  description: string;
  duration?: string;
  views?: string;
  thumbnail?: string;
}

interface RecipePage {
  recipeTitle: string;
  ageCategory: string;
  image: string;
  ingredients: string[];
  steps: string[];
  nutritionNote: string;
}

interface PdfBook {
  id: string;
  title: string;
  downloadUrl?: string;
  pdfFileUrl?: string; // base64 data URL or direct link
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  ageCategory?: string;
  pages: RecipePage[];
}

const DEFAULT_BABEL_DISTRICTS: Record<string, string[]> = {
  'Kota Pangkalpinang': [
    'Bukit Intan',
    'Gabek',
    'Gerunggang',
    'Girimaya',
    'Pangkal Balam',
    'Rangkui',
    'Taman Sari',
  ],
  'Kab. Bangka': [
    'Sungailiat',
    'Belinyu',
    'Merawang',
    'Mendo Barat',
    'Pemali',
    'Riau Silip',
    'Bakam',
    'Puding Besar',
  ],
  'Kab. Bangka Barat': [
    'Mentok',
    'Jebus',
    'Kelapa',
    'Simpang Teritip',
    'Tempilang',
    'Parittiga',
  ],
  'Kab. Bangka Tengah': [
    'Koba',
    'Pangkalan Baru',
    'Sungai Selan',
    'Simpang Katis',
    'Namang',
    'Lubuk Besar',
  ],
  'Kab. Bangka Selatan': [
    'Toboali',
    'Airgegas',
    'Payung',
    'Simpang Rimba',
    'Lepar Pongok',
    'Tukak Sadai',
    'Pulau Besar',
  ],
  'Kab. Belitung': [
    'Tanjung Pandan',
    'Sijuk',
    'Badau',
    'Membalong',
    'Selat Nasik',
  ],
  'Kab. Belitung Timur': [
    'Manggar',
    'Gantung',
    'Dendang',
    'Kelapa Kampit',
    'Damar',
    'Simpang Rengiang',
    'Simpang Pesak',
  ],
};

const DEFAULT_GIZI_VIDEOS: VideoItem[] = [
  {
    id: 1,
    category: 'gizi',
    title: 'Prinsip Gizi Seimbang & Porsi Makan Isi Piringku Balita',
    youtubeId: 'b_f-M_8264A',
    description: 'Panduan ahli gizi mengenai komposisi karbohidrat, protein hewani, dan serat pada balita.',
    duration: '04:20',
    views: '1.4k',
  },
  {
    id: 2,
    category: 'gizi',
    title: 'Pencegahan Stunting Melalui Protein Hewani Sejak Dini',
    youtubeId: '12G34h56i78',
    description: 'Pentingnya telur, ikan lokal Bangka Belitung, dan daging untuk optimasi tinggi badan anak.',
    duration: '05:15',
    views: '2.1k',
  },
];

const DEFAULT_KMS_VIDEOS: VideoItem[] = [
  {
    id: 101,
    category: 'kms',
    title: 'Cara Membaca Grafik Pertumbuhan KMS Posyandu',
    youtubeId: 'A1B2C3D4E5F',
    description: 'Langkah mudah memahami pita hijau, kuning, dan tanda naik/turun berat badan balita.',
    duration: '03:50',
    views: '980',
  },
  {
    id: 102,
    category: 'kms',
    title: 'Deteksi Dini Tumbuh Kembang & Tanda Bahaya pada Anak',
    youtubeId: 'G6H7I8J9K0L',
    description: 'Kapan harus segera berkonsultasi ke fasilitas kesehatan atau puskesmas terdekat.',
    duration: '06:00',
    views: '1.1k',
  },
];

const DEFAULT_PDF_BOOKS: PdfBook[] = [
  {
    id: 'mpasi-6-8',
    title: 'Buku Resep MP ASI Usia 6-8 Bulan (Tekstur Saring)',
    ageCategory: '6 - 8 Bulan',
    downloadUrl: '#',
    fileName: 'Buku_Resep_MPASI_6-8_Bulan.pdf',
    pages: [
      {
        recipeTitle: 'Bubur Lumat Puree Ikan Tenggiri & Labu Kuning',
        ageCategory: '6 - 8 Bulan',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        ingredients: [
          '20g Ikan Tenggiri segar tanpa duri',
          '30g Labu kuning dikukus',
          '2 sendok makan beras putih matang',
          '1 sdt minyak kelapa / butter',
        ],
        steps: [
          'Kukus ikan tenggiri dan labu kuning hingga lembut.',
          'Lumatkan bersama nasi putih matang menggunakan saringan kawat.',
          'Tambahkan minyak kelapa sebagai lemak tambahan gizi seimbang.',
          'Sajikan hangat dalam keadaan segar.',
        ],
        nutritionNote: 'Ikan tenggiri kaya akan Omega-3 dan protein hewani murni untuk perkembangan otak balita.',
      },
      {
        recipeTitle: 'Puree Hati Ayam Kaya Zat Besi',
        ageCategory: '6 - 8 Bulan',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
        ingredients: [
          '25g Hati ayam segar',
          '1/2 potong wortel lokal',
          '2 sdm bubur beras halus',
          '1 sdt santan matang',
        ],
        steps: [
          'Cincang hati ayam lalu tumis sebentar dengan santan.',
          'Kukus wortel hingga sangat lembut.',
          'Saring semua bahan hingga mencapai konsistensi bubur kental lembut.',
          'Siap disajikan 2 kali sehari.',
        ],
        nutritionNote: 'Hati ayam sangat efektif mencegah anemia defisiensi besi pada bayi usia 6 bulan keatas.',
      },
    ],
  },
  {
    id: 'mpasi-9-11',
    title: 'Buku Resep MP ASI Usia 9-11 Bulan (Tekstur Cincang)',
    ageCategory: '9 - 11 Bulan',
    downloadUrl: '#',
    fileName: 'Buku_Resep_MPASI_9-11_Bulan.pdf',
    pages: [
      {
        recipeTitle: 'Nasi Tim Cincang Daging Sapi & Bayam',
        ageCategory: '9 - 11 Bulan',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
        ingredients: [
          '30g Daging sapi giling',
          '1 genggam bayam cincang halus',
          '3 sdm nasi tim',
          'Kaldu ayam kampung',
        ],
        steps: [
          'Rebus daging sapi giling dalam kaldu hingga matang dan empuk.',
          'Masukkan bayam cincang menjelang diangkat.',
          'Campurkan dengan nasi tim agak kasar untuk melatih ketrampilan mengunyah.',
          'Sajikan dalam porsi hangat.',
        ],
        nutritionNote: 'Melatih kemampuan stimulasi oromotor anak dengan peningkatan tekstur makanan cincang halus.',
      },
    ],
  },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'gizi' | 'kms' | 'mpasi' | 'admin'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showVideoFormModal, setShowVideoFormModal] = useState(false);
  const [showPdfFormModal, setShowPdfFormModal] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [welcomeTab, setWelcomeTab] = useState<'user' | 'admin'>('user');

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<'analytics' | 'videos' | 'pdfs' | 'branding'>('analytics');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeVideoId, setActiveVideoId] = useState<string | number | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('6281234567890');

  // Custom Logo and Header GIF
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(DEFAULT_LOGO_URL);
  const [customHeaderGif, setCustomHeaderGif] = useState<string>(
    'https://6ac6859d70fa33769150f041.imgix.net/Biru%20Hijau%20dan%20Merah%20Muda%20Belajar%20Bersama%20Anak-Anak%20Youtube%20Intro-2.gif?ixembed=1791395370108&auto=format,compress'
  );

  const [pdfZoom, setPdfZoom] = useState(100);
  const [pdfViewMode, setPdfViewMode] = useState<'scribd' | 'embed'>('scribd');
  const [searchLog, setSearchLog] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [deletingVideoTarget, setDeletingVideoTarget] = useState<{ id: string | number; category: 'gizi' | 'kms' } | null>(null);
  const [deletingPdfTarget, setDeletingPdfTarget] = useState<string | null>(null);

  const [googleSheetWebhook, setGoogleSheetWebhook] = useState('');

  // Form input
  const [inputNama, setInputNama] = useState('');
  const [inputKecamatan, setInputKecamatan] = useState('');
  const [inputNomorHp, setInputNomorHp] = useState('');
  const [userData, setUserData] = useState<UserData>({ nama: '', kecamatan: '', nomorHp: '' });

  // Data collections
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [giziVideos, setGiziVideos] = useState<VideoItem[]>(DEFAULT_GIZI_VIDEOS);
  const [kmsVideos, setKmsVideos] = useState<VideoItem[]>(DEFAULT_KMS_VIDEOS);
  const [pdfBooks, setPdfBooks] = useState<PdfBook[]>(DEFAULT_PDF_BOOKS);
  const [selectedPdf, setSelectedPdf] = useState<PdfBook>(DEFAULT_PDF_BOOKS[0]);

  // Video Form
  const [editingVideo, setEditingVideo] = useState<VideoItem>({
    id: '',
    category: 'gizi',
    title: '',
    youtubeId: '',
    description: '',
  });

  // PDF Book Form
  const [editingPdfBook, setEditingPdfBook] = useState<{
    id: string;
    title: string;
    ageCategory: string;
    fileName: string;
    fileSize?: string;
    pdfFileUrl: string;
    description: string;
    jumpToMpasiPage?: boolean;
  }>({
    id: '',
    title: '',
    ageCategory: '6 - 8 Bulan',
    fileName: '',
    fileSize: '',
    pdfFileUrl: '',
    description: '',
    jumpToMpasiPage: true,
  });

  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const changePage = (page: 'home' | 'gizi' | 'kms' | 'mpasi' | 'admin') => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initialization
  useEffect(() => {
    // 1. Saved Webhook & Admin Session
    const savedWebhook = localStorage.getItem('si_bunda_webhook');
    if (savedWebhook) {
      setGoogleSheetWebhook(savedWebhook);
    }

    if (localStorage.getItem('si_bunda_admin_session') === 'true') {
      setIsAdmin(true);
    }

    // 2. Custom Logo & Header GIF
    const savedLogo = localStorage.getItem('si_bunda_custom_logo');
    if (savedLogo) {
      setCustomLogoUrl(savedLogo);
    } else {
      setCustomLogoUrl(DEFAULT_LOGO_URL);
      localStorage.setItem('si_bunda_custom_logo', DEFAULT_LOGO_URL);
    }

    const savedGif = localStorage.getItem('si_bunda_header_gif');
    if (savedGif) {
      setCustomHeaderGif(savedGif);
    }

    const savedWa = localStorage.getItem('si_bunda_wa');
    if (savedWa) {
      setWhatsappNumber(savedWa);
    }

    // 3. Saved PDF Books (Priority: IndexedDB for high capacity, fallback to localStorage)
    const loadSavedPdfBooks = async () => {
      try {
        const idbBooks = await getAllPdfBooksFromIndexedDB();
        if (idbBooks && Array.isArray(idbBooks) && idbBooks.length > 0) {
          setPdfBooks(idbBooks);
          setSelectedPdf(idbBooks[0]);
          return;
        }
      } catch (err) {
        console.warn('Error reading from IndexedDB:', err);
      }

      const savedPdfBooks = localStorage.getItem('si_bunda_pdf_books');
      if (savedPdfBooks) {
        try {
          const parsed = JSON.parse(savedPdfBooks);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPdfBooks(parsed);
            setSelectedPdf(parsed[0]);
          }
        } catch {
          // use default
        }
      }
    };
    loadSavedPdfBooks();

    // 4. Saved Logs
    const savedLogs = localStorage.getItem('si_bunda_logs');
    if (savedLogs) {
      try {
        setVisitorLogs(JSON.parse(savedLogs));
      } catch {
        setVisitorLogs([]);
      }
    } else {
      const initialDemoLogs: VisitorLog[] = [
        { nama: 'Ibu Anita', kecamatan: 'Sungailiat (Kab. Bangka)', nomorHp: '081271234567', timestamp: '2026-10-06 09:15' },
        { nama: 'Ibu Maya', kecamatan: 'Tanjung Pandan (Kab. Belitung)', nomorHp: '081987654321', timestamp: '2026-10-06 10:40' },
        { nama: 'Ibu Dewi', kecamatan: 'Bukit Intan (Kota Pangkalpinang)', nomorHp: '082156789012', timestamp: '2026-10-07 08:20' },
      ];
      setVisitorLogs(initialDemoLogs);
      localStorage.setItem('si_bunda_logs', JSON.stringify(initialDemoLogs));
    }

    // 5. Saved User
    const savedUser = localStorage.getItem('si_bunda_user');
    let hasUser = false;
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.nama && parsed.nomorHp) {
          setUserData(parsed);
          setInputNama(parsed.nama || '');
          setInputKecamatan(parsed.kecamatan || '');
          setInputNomorHp(parsed.nomorHp || '');
          hasUser = true;
        } else if (parsed.nama) {
          setInputNama(parsed.nama || '');
          setInputKecamatan(parsed.kecamatan || '');
          hasUser = false;
        }
      } catch {
        // ignore
      }
    }

    const adminLoggedIn = localStorage.getItem('si_bunda_admin_session') === 'true';
    if (!adminLoggedIn && !hasUser) {
      setShowWelcomeModal(true);
    }

    // 6. Firebase Real-time listeners
    const unsubLogs = subscribeToVisitorLogs((logs) => {
      if (Array.isArray(logs) && logs.length > 0) {
        setVisitorLogs(logs);
        localStorage.setItem('si_bunda_logs', JSON.stringify(logs));
      }
    });

    const unsubWebhook = subscribeToWebhookSettings((url) => {
      if (url) {
        setGoogleSheetWebhook(url);
        localStorage.setItem('si_bunda_webhook', url);
      }
    });

    const unsubVideos = subscribeToVideos((videoList) => {
      if (Array.isArray(videoList) && videoList.length > 0) {
        const gizi = videoList.filter((v) => v.category === 'gizi');
        const kms = videoList.filter((v) => v.category === 'kms');
        if (gizi.length > 0) setGiziVideos(gizi);
        if (kms.length > 0) setKmsVideos(kms);
      }
    });

    const unsubPdfBooks = subscribeToPdfBooks((books) => {
      if (Array.isArray(books) && books.length > 0) {
        setPdfBooks((prev) => {
          const merged = [...prev];
          books.forEach((b) => {
            const idx = merged.findIndex((m) => m.id === b.id);
            if (idx === -1) {
              merged.push(b);
            } else if (!merged[idx].pdfFileUrl && b.pdfFileUrl) {
              merged[idx] = { ...merged[idx], ...b };
            }
          });
          return merged;
        });
      }
    });

    return () => {
      unsubLogs();
      unsubWebhook();
      unsubVideos();
      unsubPdfBooks();
    };
  }, []);

  // Filtered visitor logs
  const filteredLogs = useMemo(() => {
    if (!searchLog.trim()) return visitorLogs;
    const q = searchLog.toLowerCase();
    return visitorLogs.filter(
      (l) =>
        l.nama.toLowerCase().includes(q) ||
        l.kecamatan.toLowerCase().includes(q) ||
        (l.nomorHp && l.nomorHp.toLowerCase().includes(q))
    );
  }, [visitorLogs, searchLog]);

  // Submit User Data
  const submitUserData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNama.trim() || !inputKecamatan.trim() || !inputNomorHp.trim()) return;

    const newUserData: UserData = {
      nama: inputNama.trim(),
      kecamatan: inputKecamatan.trim(),
      nomorHp: inputNomorHp.trim(),
    };
    setUserData(newUserData);
    localStorage.setItem('si_bunda_user', JSON.stringify(newUserData));

    const now = new Date();
    const timestampStr =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0') +
      ' ' +
      String(now.getHours()).padStart(2, '0') +
      ':' +
      String(now.getMinutes()).padStart(2, '0');

    const newLog: VisitorLog = {
      nama: newUserData.nama,
      kecamatan: newUserData.kecamatan,
      nomorHp: newUserData.nomorHp,
      timestamp: timestampStr,
    };

    setVisitorLogs((prev) => {
      const updated = [newLog, ...prev.filter((l) => !(l.nama === newLog.nama && l.timestamp === newLog.timestamp))];
      localStorage.setItem('si_bunda_logs', JSON.stringify(updated));
      return updated;
    });

    dbAddVisitorLog(newLog, googleSheetWebhook);
    setShowWelcomeModal(false);
    showToast(`Selamat datang Ibu ${newUserData.nama}! Selamat menjelajahi platform Si Bunda.`);
  };

  // Verify Admin Login
  const verifyAdminLogin = (source: 'popup' | 'modal') => {
    if (adminPasswordInput.trim() === 'dinda0909') {
      setIsAdmin(true);
      localStorage.setItem('si_bunda_admin_session', 'true');
      setShowWelcomeModal(false);
      setShowAdminLoginModal(false);
      setCurrentPage('admin');
      setAdminPasswordInput('');
      setLoginError('');
      showToast('Berhasil masuk sebagai Admin Ahli Gizi.');
    } else {
      setLoginError('Kata sandi admin salah! Silakan coba lagi.');
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('si_bunda_admin_session');
    setCurrentPage('home');
    showToast('Anda telah keluar dari mode Admin.');
  };

  // Logo Upload & Management
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap unggah file gambar (PNG, JPG, SVG, WebP)!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file logo maksimal 5 MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCustomLogoUrl(base64);
      localStorage.setItem('si_bunda_custom_logo', base64);
      showToast('Logo website berhasil diperbarui!');
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    if (confirm('Kembalikan logo ke logo standar Eduzi?')) {
      setCustomLogoUrl(DEFAULT_LOGO_URL);
      localStorage.setItem('si_bunda_custom_logo', DEFAULT_LOGO_URL);
      showToast('Logo dikembalikan ke logo standar Eduzi.');
    }
  };

  // Header GIF Management
  const handleSaveHeaderGif = (newGif: string) => {
    setCustomHeaderGif(newGif);
    localStorage.setItem('si_bunda_header_gif', newGif);
    showToast('Header GIF berhasil diperbarui!');
  };

  const editHeaderGif = () => {
    const newGif = prompt('Masukkan URL Gambar / Animated GIF Header Baru (1280x720):', customHeaderGif);
    if (newGif !== null && newGif.trim()) {
      handleSaveHeaderGif(newGif.trim());
    }
  };

  // Video Management
  const openVideoModal = () => {
    setEditingVideo({ id: '', category: 'gizi', title: '', youtubeId: '', description: '' });
    setShowVideoFormModal(true);
  };

  const editVideo = (video: VideoItem, category: 'gizi' | 'kms') => {
    setEditingVideo({ ...video, category });
    setShowVideoFormModal(true);
  };

  const saveVideoForm = (e: React.FormEvent) => {
    e.preventDefault();
    const vidId = editingVideo.id || Date.now().toString();
    const newVid: VideoItem = {
      ...editingVideo,
      id: vidId,
      views: editingVideo.views || '1',
      duration: editingVideo.duration || '03:30',
    };

    if (editingVideo.category === 'gizi') {
      setGiziVideos((prev) => {
        const idx = prev.findIndex((v) => String(v.id) === String(vidId));
        return idx !== -1 ? prev.map((v) => (String(v.id) === String(vidId) ? newVid : v)) : [...prev, newVid];
      });
    } else {
      setKmsVideos((prev) => {
        const idx = prev.findIndex((v) => String(v.id) === String(vidId));
        return idx !== -1 ? prev.map((v) => (String(v.id) === String(vidId) ? newVid : v)) : [...prev, newVid];
      });
    }

    dbSaveVideo(newVid);
    setShowVideoFormModal(false);
    showToast('Konten video berhasil disimpan!');
  };

  const executeDeleteVideo = () => {
    if (!deletingVideoTarget) return;
    const { id, category } = deletingVideoTarget;

    if (category === 'gizi') {
      setGiziVideos((prev) => prev.filter((v) => String(v.id) !== String(id)));
    } else {
      setKmsVideos((prev) => prev.filter((v) => String(v.id) !== String(id)));
    }

    dbDeleteVideo(id);
    setDeletingVideoTarget(null);
    showToast('Video berhasil dihapus.');
  };

  // PDF Book & File Management
  const openPdfModal = (bookToEdit?: PdfBook) => {
    if (bookToEdit) {
      setEditingPdfBook({
        id: bookToEdit.id,
        title: bookToEdit.title,
        ageCategory: bookToEdit.ageCategory || '6 - 8 Bulan',
        fileName: bookToEdit.fileName || '',
        fileSize: bookToEdit.fileSize || '',
        pdfFileUrl: bookToEdit.pdfFileUrl || '',
        description: bookToEdit.pages?.[0]?.nutritionNote || '',
        jumpToMpasiPage: true,
      });
    } else {
      setEditingPdfBook({
        id: '',
        title: '',
        ageCategory: '6 - 8 Bulan',
        fileName: '',
        fileSize: '',
        pdfFileUrl: '',
        description: '',
        jumpToMpasiPage: true,
      });
    }
    setShowPdfFormModal(true);
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('File harus berformat PDF (.pdf)!');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('Ukuran file PDF terlalu besar (maksimal 25 MB). Anda juga dapat memasukkan tautan Google Drive / Cloud.');
      return;
    }

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setEditingPdfBook((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: sizeFormatted,
        pdfFileUrl: base64,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      }));
      showToast(`File ${file.name} (${sizeFormatted}) siap disimpan!`);
    };
    reader.readAsDataURL(file);
  };

  const savePdfBookForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPdfBook.title.trim()) return;

    const bookId = editingPdfBook.id || `pdf-${Date.now()}`;
    const newBook: PdfBook = {
      id: bookId,
      title: editingPdfBook.title.trim(),
      ageCategory: editingPdfBook.ageCategory,
      fileName: editingPdfBook.fileName || `${editingPdfBook.title}.pdf`,
      fileSize: editingPdfBook.fileSize || 'Dokumen PDF',
      pdfFileUrl: editingPdfBook.pdfFileUrl,
      downloadUrl: editingPdfBook.pdfFileUrl || '#',
      uploadedAt: new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' }),
      pages: [
        {
          recipeTitle: editingPdfBook.title,
          ageCategory: editingPdfBook.ageCategory,
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
          ingredients: [
            'Bahan pangan lokal berkualitas tinggi khas Kepulauan Bangka Belitung',
            'Sumber protein hewani pilihan (ikan tenggiri / kembung, telur, ayam, hati sapi)',
            'Sayur segar kaya serat dan vitamin (bayam, wortel, kelor, labu kuning)',
            'Lemak sehat tambahan penunjang energi (minyak kelapa, santan, mentega)',
          ],
          steps: [
            'Siapkan bahan-bahan segar sesuai porsi makan balita.',
            'Olah dengan cara higienis sesuai panduan di dalam dokumen buku PDF ini.',
            'Sesuaikan tekstur masakan dengan tahapan usia si kecil.',
            'Sajikan dalam keadaan hangat dengan jadwal makan yang teratur.',
          ],
          nutritionNote:
            editingPdfBook.description ||
            'Buku panduan resep resmi MP-ASI bergizi seimbang untuk mendukung kecerdasan otak & pencegahan stunting balita.',
        },
      ],
    };

    // 1. Save to high-capacity IndexedDB (handles files up to 100MB+)
    await savePdfBookToIndexedDB(newBook);

    // 2. Sync to Firebase Firestore
    dbSavePdfBook(newBook);

    // 3. Update React state
    setPdfBooks((prev) => {
      const idx = prev.findIndex((b) => b.id === bookId);
      const updated = idx !== -1 ? prev.map((b) => (b.id === bookId ? newBook : b)) : [newBook, ...prev];

      // Safely write metadata to localStorage without crashing on quota
      try {
        const forStorage = updated.map((b) => {
          if (b.pdfFileUrl && b.pdfFileUrl.length > 200000) {
            const { pdfFileUrl, ...rest } = b;
            return { ...rest, pdfFileUrl: '' };
          }
          return b;
        });
        localStorage.setItem('si_bunda_pdf_books', JSON.stringify(forStorage));
      } catch (err) {
        console.warn('LocalStorage quota warning (saved in IndexedDB):', err);
      }
      return updated;
    });

    // 4. Immediately select the newly uploaded PDF and activate the reader
    setSelectedPdf(newBook);
    if (newBook.pdfFileUrl) {
      setPdfViewMode('embed');
    }

    setShowPdfFormModal(false);

    // 5. Navigate to MPASI page so user/admin immediately sees the new recipe addition
    if (editingPdfBook.jumpToMpasiPage !== false) {
      setCurrentPage('mpasi');
    }

    showToast(`Buku "${newBook.title}" berhasil diunggah! Koleksi resep di Halaman Resep MP-ASI kini telah bertambah.`);
  };

  const executeDeletePdf = async () => {
    if (!deletingPdfTarget) return;
    const targetId = deletingPdfTarget;

    await deletePdfBookFromIndexedDB(targetId);
    dbDeletePdfBook(targetId);

    setPdfBooks((prev) => {
      const updated = prev.filter((b) => b.id !== targetId);
      try {
        localStorage.setItem('si_bunda_pdf_books', JSON.stringify(updated));
      } catch {}
      if (selectedPdf.id === targetId && updated.length > 0) {
        setSelectedPdf(updated[0]);
      }
      return updated;
    });
    setDeletingPdfTarget(null);
    showToast('Buku PDF berhasil dihapus.');
  };

  // Download PDF File Helper
  const downloadPdfFile = (book: PdfBook) => {
    if (book.pdfFileUrl && book.pdfFileUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = book.pdfFileUrl;
      a.download = book.fileName || `${book.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Mengunduh file ${book.fileName || book.title}...`);
    } else if (book.downloadUrl && book.downloadUrl !== '#') {
      window.open(book.downloadUrl, '_blank');
    } else {
      window.print();
    }
  };

  // Webhook and CSV Helpers
  const saveWebhookUrl = () => {
    localStorage.setItem('si_bunda_webhook', googleSheetWebhook);
    dbSaveWebhook(googleSheetWebhook);
    showToast('URL Google Sheets Webhook berhasil disimpan ke Cloud!');
  };

  const testWebhook = () => {
    if (!googleSheetWebhook) return;
    const sampleLog = {
      nama: 'Ibu Contoh (Uji Coba Webhook)',
      kecamatan: 'Sungailiat (Kab. Bangka)',
      nomorHp: '081234567890',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    sendToGoogleSheet(sampleLog, googleSheetWebhook);
    showToast('Data uji coba dikirim! Silakan periksa Google Sheet Anda.');
  };

  const copyAppsScript = () => {
    const text = appsScriptCode;
    navigator.clipboard.writeText(text);
    showToast('Kode Apps Script berhasil disalin ke clipboard!');
  };

  const exportToCSV = () => {
    let csv = 'Waktu Kunjungan,Nama Ibu,Kecamatan,Nomor HP\n';
    visitorLogs.forEach((l) => {
      csv += `"${l.timestamp}","${l.nama}","${l.kecamatan}","${l.nomorHp || '-'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'Data_Kunjungan_SiBunda.csv');
    a.click();
    showToast('File CSV berhasil diunduh!');
  };

  const appsScriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch(err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    var timestamp = data.timestamp || Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm");
    var nama = data.nama || "Tanpa Nama";
    var kecamatan = data.kecamatan || "Tanpa Kecamatan";
    var nomorHp = data.nomorHp || "-";
    
    sheet.appendRow([timestamp, nama, kecamatan, nomorHp]);
    return ContentService.createTextOutput(JSON.stringify({"status":"success"})).setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({"status":"error", "message": error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  return (
    <div className="min-h-screen flex flex-col justify-between antialiased selection:bg-[#FF7B9C] selection:text-white bg-[#FFFBF9] font-['Nunito',sans-serif] text-[#2D3748]">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo Brand with Upload Support */}
            <div className="flex items-center gap-2">
              <div
                onClick={() => changePage('home')}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white text-[#FF7B9C] flex items-center justify-center group-hover:scale-105 transition-transform text-xl shadow-xs overflow-hidden border border-pink-100 p-1">
                  <img
                    src={customLogoUrl || DEFAULT_LOGO_URL}
                    alt="Logo Eduzi Si Bunda"
                    className="w-full h-full object-contain"
                    onError={() => setCustomLogoUrl(DEFAULT_LOGO_URL)}
                  />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#FF7B9C] tracking-tight leading-none">Si Bunda</h1>
                  <p className="text-xs text-gray-500 font-semibold tracking-wide">Edukasi Gizi & Balita</p>
                </div>
              </div>

              {/* Quick Admin Logo Edit Button */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage('admin');
                    setAdminTab('branding');
                  }}
                  className="p-1.5 text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition"
                  title="Ganti / Upload Logo Website"
                >
                  <i className="fa-solid fa-camera"></i>
                </button>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <button
                onClick={() => changePage('home')}
                className={`px-3.5 py-2 rounded-xl text-sm transition-all ${
                  currentPage === 'home'
                    ? 'bg-[#FFF0F4] text-[#FF7B9C] font-extrabold shadow-sm'
                    : 'text-gray-600 hover:text-[#FF7B9C] font-bold'
                }`}
              >
                <i className="fa-solid fa-house mr-1.5"></i> Home
              </button>
              <button
                onClick={() => changePage('gizi')}
                className={`px-3.5 py-2 rounded-xl text-sm transition-all ${
                  currentPage === 'gizi'
                    ? 'bg-[#FFF0F4] text-[#FF7B9C] font-extrabold shadow-sm'
                    : 'text-gray-600 hover:text-[#FF7B9C] font-bold'
                }`}
              >
                <i className="fa-solid fa-bowl-food mr-1.5"></i> Gizi Sehat
              </button>
              <button
                onClick={() => changePage('kms')}
                className={`px-3.5 py-2 rounded-xl text-sm transition-all ${
                  currentPage === 'kms'
                    ? 'bg-[#E6F9F7] text-[#2EC4B6] font-extrabold shadow-sm'
                    : 'text-gray-600 hover:text-[#2EC4B6] font-bold'
                }`}
              >
                <i className="fa-solid fa-chart-line mr-1.5"></i> Panduan KMS
              </button>
              <button
                onClick={() => changePage('mpasi')}
                className={`px-3.5 py-2 rounded-xl text-sm transition-all ${
                  currentPage === 'mpasi'
                    ? 'bg-amber-100 text-amber-700 font-extrabold shadow-sm'
                    : 'text-gray-600 hover:text-amber-600 font-bold'
                }`}
              >
                <i className="fa-solid fa-book-open-reader mr-1.5"></i> Resep MP ASI
              </button>
            </nav>

            {/* User Profile & Admin Toggle Actions */}
            <div className="flex items-center gap-2">
              {userData.nama && (
                <div className="hidden sm:flex items-center gap-2 bg-[#E6F9F7] text-[#2EC4B6] px-3 py-1.5 rounded-full text-xs font-bold border border-[#2EC4B6]/20 shadow-sm">
                  <i className="fa-solid fa-user-circle text-base text-[#2EC4B6]"></i>
                  <span className="max-w-[120px] truncate">{'Ibu ' + userData.nama}</span>
                  <button
                    onClick={() => {
                      setWelcomeTab('user');
                      setShowWelcomeModal(true);
                    }}
                    title="Ubah Data Diri"
                    className="hover:text-[#FF7B9C] ml-1"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </div>
              )}

              {isAdmin ? (
                <button
                  onClick={() => changePage('admin')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <i className="fa-solid fa-user-shield"></i>
                  <span>Admin Dashboard</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAdminLoginModal(true)}
                  className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600 px-2 py-1 rounded-lg"
                  title="Login Admin"
                >
                  <i className="fa-solid fa-lock text-[11px]"></i>
                  <span>Admin</span>
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-[#FF7B9C] focus:outline-none"
              >
                <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark text-2xl' : 'fa-bars text-2xl'}`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-pink-100 bg-white px-4 pt-2 pb-4 space-y-2">
            {userData.nama && (
              <div className="flex items-center justify-between p-3 bg-[#E6F9F7] rounded-xl text-[#2EC4B6] text-xs font-bold mb-3">
                <span className="truncate">
                  <i className="fa-solid fa-user mr-2"></i> Ibu {userData.nama} ({userData.kecamatan})
                </span>
                <button
                  onClick={() => {
                    setShowWelcomeModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="underline text-[#FF7B9C]"
                >
                  Ubah
                </button>
              </div>
            )}
            <button
              onClick={() => {
                changePage('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 ${
                currentPage === 'home' ? 'bg-[#FFF0F4] text-[#FF7B9C] font-bold' : 'text-gray-700'
              }`}
            >
              <i className="fa-solid fa-house w-5 text-center"></i> Home
            </button>
            <button
              onClick={() => {
                changePage('gizi');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 ${
                currentPage === 'gizi' ? 'bg-[#FFF0F4] text-[#FF7B9C] font-bold' : 'text-gray-700'
              }`}
            >
              <i className="fa-solid fa-bowl-food w-5 text-center"></i> Gizi Sehat untuk Si Kecil
            </button>
            <button
              onClick={() => {
                changePage('kms');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 ${
                currentPage === 'kms' ? 'bg-[#FFF0F4] text-[#FF7B9C] font-bold' : 'text-gray-700'
              }`}
            >
              <i className="fa-solid fa-chart-line w-5 text-center"></i> Panduan KMS
            </button>
            <button
              onClick={() => {
                changePage('mpasi');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 ${
                currentPage === 'mpasi' ? 'bg-[#FFF0F4] text-[#FF7B9C] font-bold' : 'text-gray-700'
              }`}
            >
              <i className="fa-solid fa-book-open-reader w-5 text-center"></i> Resep MP ASI
            </button>

            {isAdmin ? (
              <button
                onClick={() => {
                  changePage('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold bg-purple-600 text-white flex items-center gap-3"
              >
                <i className="fa-solid fa-user-shield w-5 text-center"></i> Admin Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowAdminLoginModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-purple-600"
              >
                <i className="fa-solid fa-lock mr-2"></i> Login Admin
              </button>
            )}
          </div>
        )}
      </header>

      {/* HEADER BANNER GIF (1280x720 / 720p) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative w-full bg-gradient-to-r from-pink-200 via-purple-100 to-teal-100 rounded-3xl overflow-hidden shadow-md border-4 border-white aspect-[16/9] max-h-[220px] sm:max-h-[320px] md:max-h-[380px] flex items-center justify-center group">
          <img
            className="w-full h-full object-cover"
            loading="lazy"
            alt="Si Bunda Banner Animasi"
            src={customHeaderGif}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://6ac6859d70fa33769150f041.imgix.net/Biru%20Hijau%20dan%20Merah%20Muda%20Belajar%20Bersama%20Anak-Anak%20Youtube%20Intro-2.gif?ixembed=1791395370108&auto=format,compress';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 sm:p-8">
            <div className="text-white">
              <span className="bg-[#FF7B9C] text-white text-[10px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-full shadow-sm mb-1 inline-block">
                Provinsi Kepulauan Bangka Belitung
              </span>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-md">
                Mendampingi Ibu, Menjaga Gizi Si Kecil 👶
              </h2>
              <p className="text-xs sm:text-sm text-pink-100 hidden sm:block">
                Informasi praktis, terpercaya, dan mudah dipahami untuk tumbuh kembang optimal.
              </p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={editHeaderGif}
              className="absolute top-3 right-3 bg-white/90 text-gray-800 text-xs px-3 py-1.5 rounded-xl font-bold shadow-md hover:bg-[#FF7B9C] hover:text-white transition"
            >
              <i className="fa-solid fa-image mr-1"></i> Ganti GIF Header
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {/* PAGE 1: HOME PAGE */}
        {currentPage === 'home' && (
          <section className="space-y-12 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-pink-100/80 text-center relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#FFF0F4] rounded-full blur-2xl opacity-60"></div>
              <div className="absolute -left-10 -top-10 w-40 h-40 bg-[#E6F9F7] rounded-full blur-2xl opacity-60"></div>
              <div className="relative z-10 max-w-3xl mx-auto">
                <span className="text-[#2EC4B6] font-extrabold text-xs sm:text-sm uppercase tracking-widest bg-[#E6F9F7] px-4 py-1.5 rounded-full inline-block mb-3">
                  Tujuan Utama Platform
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-800 mb-4 leading-tight">
                  Platform Edukasi Gizi Berbasis Web untuk Pengasuhan Balita
                </h2>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                  Website <strong>Si Bunda</strong> hadir khusus membantu para Ibu di wilayah{' '}
                  <strong>Kepulauan Bangka Belitung</strong> dalam pemenuhan gizi seimbang, pemantauan pertumbuhan
                  melalui KMS, serta ragam inspirasi resep MP ASI sehat demi mencegah stunting dan mendukung tumbuh
                  kembang optimal anak.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm font-bold text-gray-700">
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                    <i className="fa-solid fa-circle-check text-[#2EC4B6]"></i> Mudah Dipahami
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                    <i className="fa-solid fa-circle-check text-[#2EC4B6]"></i> Praktis & Ringkas
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                    <i className="fa-solid fa-circle-check text-[#2EC4B6]"></i> Sesuai Ahli Gizi
                  </span>
                </div>
              </div>
            </div>

            {/* Features Cards Grid */}
            <div className="space-y-8">
              <div className="text-center max-w-xl mx-auto">
                <h3 className="text-xl sm:text-2xl font-black text-gray-800">Menu & Fitur Utama</h3>
                <p className="text-gray-500 text-xs sm:text-sm">Pilih topik edukasi gizi dan pengasuhan yang Ibu butuhkan hari ini</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {/* Feature Card 1 */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="w-full h-44 bg-[#FFF0F4] rounded-2xl mb-5 flex items-center justify-center p-4 overflow-hidden relative">
                      <img
                        src="https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80"
                        alt="Gizi Sehat Ilustrasi"
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-[#FF7B9C] text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                        Video Edukasi
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-gray-800 mb-2 group-hover:text-[#FF7B9C] transition-colors">
                      Gizi Sehat untuk Si Kecil
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6">
                      Penjelasan lengkap video mengenai pentingnya gizi seimbang, zat gizi makro & mikro, porsi makan balita, serta tips pola pengasuhan makan yang menyenangkan agar anak tidak picky eater.
                    </p>
                  </div>
                  <button
                    onClick={() => changePage('gizi')}
                    className="w-full bg-[#FF7B9C] hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <span>Gizi Sehat untuk Si Kecil</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>

                {/* Feature Card 2 */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-teal-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="w-full h-44 bg-[#E6F9F7] rounded-2xl mb-5 flex items-center justify-center p-4 overflow-hidden relative">
                      <img
                        src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80"
                        alt="Panduan KMS Ilustrasi"
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-[#2EC4B6] text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                        Panduan Tumbuh Kembang
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-gray-800 mb-2 group-hover:text-[#2EC4B6] transition-colors">
                      Panduan KMS (Kartu Menuju Sehat)
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6">
                      Panduan visual dan video mudah membaca grafik pertumbuhan anak di KMS Posyandu, mengenali pita warna berat badan, serta deteksi dini gangguan tumbuh kembang balita.
                    </p>
                  </div>
                  <button
                    onClick={() => changePage('kms')}
                    className="w-full bg-[#2EC4B6] hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <span>Panduan KMS</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>

                {/* Feature Card 3 */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="w-full h-44 bg-amber-50 rounded-2xl mb-5 flex items-center justify-center p-4 overflow-hidden relative">
                      <img
                        src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80"
                        alt="Resep MP ASI Ilustrasi"
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-[#FF9F1C] text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                        Dokumen PDF Resep
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-gray-800 mb-2 group-hover:text-[#FF9F1C] transition-colors">
                      Resep MP ASI Sehat
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6">
                      Kumpulan resep Makanan Pendamping ASI bergizi tinggi berbasis bahan lokal yang mudah diolah, tersusun rapi dalam tampilan e-book PDF interaktif gaya Scribd.
                    </p>
                  </div>
                  <button
                    onClick={() => changePage('mpasi')}
                    className="w-full bg-[#FF9F1C] hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <span>Resep MP ASI</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* WhatsApp Contact Section */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 sm:p-10 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <span className="bg-white/20 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Konsultasi Ahli Gizi
                </span>
                <h3 className="text-xl sm:text-3xl font-black">Butuh Konsultasi Gizi Langsung?</h3>
                <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
                  Ibu memiliki pertanyaan khusus mengenai tumbuh kembang atau pola makan si kecil? Klik tombol WhatsApp berikut untuk terhubung langsung dengan Ahli Gizi kami.
                </p>
              </div>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  `Halo Ahli Gizi Si Bunda, saya Ibu ${userData.nama || ''} dari Kecamatan ${
                    userData.kecamatan || ''
                  } ingin berkonsultasi mengenai gizi balita saya.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-white text-emerald-600 hover:bg-emerald-50 px-6 py-3.5 rounded-2xl font-black text-sm shadow-md hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap group"
              >
                <i className="fa-brands fa-whatsapp text-2xl text-emerald-500 group-hover:scale-110 transition-transform"></i>
                <span>Hubungi via WhatsApp</span>
              </a>
            </div>
          </section>
        )}

        {/* PAGE 2: GIZI SEHAT PAGE */}
        {currentPage === 'gizi' && (
          <section className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-pink-100">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF7B9C] mb-2">
                <button onClick={() => changePage('home')} className="hover:underline">
                  Home
                </button>
                <span>/</span>
                <span>Gizi Sehat</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#FF7B9C] mb-3 flex items-center gap-2">
                <i className="fa-solid fa-bowl-food"></i> Gizi Sehat untuk Si Kecil
              </h2>
              <div className="bg-[#FFF0F4] p-4 sm:p-6 rounded-2xl border-l-4 border-[#FF7B9C] text-gray-700 space-y-2">
                <h3 className="font-extrabold text-base sm:text-lg text-pink-700">
                  Yuk Kenali Gizi Sehat untuk Tumbuh Kembang Si Kecil!
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed">
                  Pahami pentingnya pemberian makanan yang tepat dan pola pengasuhan saat makan untuk mendukung terpenuhinya kebutuhan gizi anak. Yuk, simak penjelasan video berikut untuk mendapatkan informasi bermanfaat dalam mendukung tumbuh kembang si kecil.
                </p>
              </div>
            </div>

            {/* TikTok 2-Column Grid Layout */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                  <i className="fa-solid fa-circle-play text-[#FF7B9C]"></i> Galeri Video Edukasi Gizi
                </h3>
                <span className="text-xs text-gray-500 font-semibold">{giziVideos.length} Video Tersedia</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-6">
                {giziVideos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 flex flex-col justify-between group transition"
                  >
                    <div className="relative w-full bg-black aspect-video sm:aspect-[16/10] overflow-hidden">
                      {activeVideoId === video.id ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                          title={video.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div
                          onClick={() => setActiveVideoId(video.id)}
                          className="w-full h-full cursor-pointer relative group/thumb"
                        >
                          <img
                            src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#FF7B9C]/90 text-white rounded-full flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
                              <i className="fa-solid fa-play text-lg sm:text-2xl ml-1"></i>
                            </div>
                          </div>
                          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {video.duration || '03:45'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 sm:p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs sm:text-base text-gray-800 line-clamp-2 mb-1 group-hover:text-[#FF7B9C] transition">
                          {video.title}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 leading-snug mb-3">
                          {video.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-400 font-semibold pt-2 border-t border-gray-50">
                        <span>
                          <i className="fa-solid fa-eye mr-1"></i> {video.views || '1.2k'} tontonan
                        </span>
                        {isAdmin && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => editVideo(video, 'gizi')}
                              className="text-blue-500 hover:underline font-bold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeletingVideoTarget({ id: video.id, category: 'gizi' })}
                              className="text-red-500 hover:underline font-bold"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* PAGE 3: PANDUAN KMS PAGE */}
        {currentPage === 'kms' && (
          <section className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-teal-100">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2EC4B6] mb-2">
                <button onClick={() => changePage('home')} className="hover:underline">
                  Home
                </button>
                <span>/</span>
                <span>Panduan KMS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2EC4B6] mb-3 flex items-center gap-2">
                <i className="fa-solid fa-chart-line"></i> Panduan Kartu Menuju Sehat (KMS)
              </h2>
              <div className="bg-[#E6F9F7] p-4 sm:p-6 rounded-2xl border-l-4 border-[#2EC4B6] text-gray-700 space-y-2">
                <h3 className="font-extrabold text-base sm:text-lg text-teal-800">
                  Pantau Grafik Tumbuh Kembang Anak dengan Benar!
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed">
                  Kartu Menuju Sehat (KMS) adalah alat penting untuk memantau pertumbuhan balita setiap bulan. Pelajari cara membaca grafik berat badan anak, memahami sinyal penimbangan (N1/N2/T), serta tindakan tepat yang perlu dilakukan Ibu melalui video panduan berikut.
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                  <i className="fa-solid fa-circle-play text-[#2EC4B6]"></i> Video Tutorial & Pemantauan KMS
                </h3>
                <span className="text-xs text-gray-500 font-semibold">{kmsVideos.length} Video Tersedia</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-6">
                {kmsVideos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 flex flex-col justify-between group transition"
                  >
                    <div className="relative w-full bg-black aspect-video sm:aspect-[16/10] overflow-hidden">
                      {activeVideoId === video.id ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                          title={video.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div
                          onClick={() => setActiveVideoId(video.id)}
                          className="w-full h-full cursor-pointer relative group/thumb"
                        >
                          <img
                            src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#2EC4B6]/90 text-white rounded-full flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
                              <i className="fa-solid fa-play text-lg sm:text-2xl ml-1"></i>
                            </div>
                          </div>
                          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {video.duration || '04:10'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 sm:p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs sm:text-base text-gray-800 line-clamp-2 mb-1 group-hover:text-[#2EC4B6] transition">
                          {video.title}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 leading-snug mb-3">
                          {video.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-400 font-semibold pt-2 border-t border-gray-50">
                        <span>
                          <i className="fa-solid fa-eye mr-1"></i> {video.views || '850'} tontonan
                        </span>
                        {isAdmin && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => editVideo(video, 'kms')}
                              className="text-blue-500 hover:underline font-bold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeletingVideoTarget({ id: video.id, category: 'kms' })}
                              className="text-red-500 hover:underline font-bold"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* PAGE 4: RESEP MP ASI PAGE WITH PDF VIEWER & EMBED */}
        {currentPage === 'mpasi' && (
          <section className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-100">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-2">
                <button onClick={() => changePage('home')} className="hover:underline">
                  Home
                </button>
                <span>/</span>
                <span>Resep MP ASI</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h2 className="text-2xl sm:text-3xl font-black text-[#FF9F1C] flex items-center gap-2">
                  <i className="fa-solid fa-book-open-reader"></i> Resep MP ASI Bergizi
                </h2>
                {isAdmin && (
                  <button
                    onClick={() => openPdfModal()}
                    className="bg-[#FF9F1C] hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow flex items-center gap-1.5 transition"
                  >
                    <i className="fa-solid fa-file-arrow-up"></i>
                    <span>Unggah / Tambah Buku PDF</span>
                  </button>
                )}
              </div>
              <div className="bg-amber-50 p-4 sm:p-6 rounded-2xl border-l-4 border-[#FF9F1C] text-gray-700 space-y-2">
                <h3 className="font-extrabold text-base sm:text-lg text-amber-800">
                  Kumpulan Resep Pilihan MP ASI Sehat & Lezat
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed">
                  Temukan berbagai variasi resep Makanan Pendamping ASI yang disesuaikan dengan tahapan usia balita (6–24 bulan). Buku resep disajikan dalam format buku dokumen interaktif di bawah ini yang dapat dibaca per halaman secara berurutan atau diunduh langsung dalam bentuk file PDF.
                </p>
              </div>
            </div>

            {/* 1. KOLEKSI BUKU & PANDUAN RESEP MP-ASI (BERSIFAT DINAMIS DARI UPLOAD ADMIN) */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                    <i className="fa-solid fa-layer-group text-[#FF9F1C]"></i>
                    <span>Koleksi Buku & Panduan Resep MP-ASI</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Klik buku resep di bawah untuk membuka dan membaca panduan, atau unduh langsung file PDF resminya.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-amber-100 text-amber-900 font-extrabold px-3 py-1 rounded-full">
                    {pdfBooks.length} Dokumen Resep Tersedia
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => openPdfModal()}
                      className="bg-[#FF9F1C] hover:bg-amber-600 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow flex items-center gap-1.5 transition"
                    >
                      <i className="fa-solid fa-file-circle-plus"></i>
                      <span>+ Upload PDF Baru</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Grid of Books & Uploaded PDFs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pdfBooks.map((book) => {
                  const isSelected = selectedPdf.id === book.id;
                  return (
                    <div
                      key={book.id}
                      className={`bg-white rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between space-y-4 relative ${
                        isSelected
                          ? 'border-2 border-[#FF9F1C] shadow-lg ring-4 ring-amber-100/60'
                          : 'border-gray-200 shadow-2xs hover:shadow-md hover:border-amber-300'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                            {book.ageCategory || 'MP-ASI'}
                          </span>
                          {book.pdfFileUrl ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <i className="fa-solid fa-file-pdf text-emerald-600"></i> File PDF Aktif ({book.fileSize || 'Tersedia'})
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Resep Digital
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2">
                            {book.title}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-gray-500 mt-1 line-clamp-2">
                            {book.pages?.[0]?.nutritionNote || 'Buku resep panduan ahli gizi dengan bahan pangan lokal bergizi seimbang.'}
                          </p>
                        </div>

                        {book.fileName && (
                          <div className="text-[10px] font-mono text-gray-500 bg-gray-50 p-1.5 rounded-lg truncate flex items-center gap-1.5 border border-gray-100">
                            <i className="fa-solid fa-file-arrow-down text-amber-600"></i>
                            <span className="truncate">{book.fileName}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPdf(book);
                            if (book.pdfFileUrl) {
                              setPdfViewMode('embed');
                            }
                            const readerElem = document.getElementById('mpasi-reader');
                            if (readerElem) {
                              readerElem.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          className={`text-xs font-extrabold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                          }`}
                        >
                          <i className="fa-solid fa-book-open"></i>
                          <span>{isSelected ? 'Sedang Dibaca' : 'Buka Resep'}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => downloadPdfFile(book)}
                            className="text-xs font-bold text-gray-600 hover:text-amber-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
                            title="Unduh File PDF ini"
                          >
                            <i className="fa-solid fa-download"></i>
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => openPdfModal(book)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition"
                                title="Edit buku PDF ini"
                              >
                                <i className="fa-solid fa-pen-to-square"></i>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingPdfTarget(book.id)}
                                className="text-xs font-bold text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition"
                                title="Hapus buku PDF ini"
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Admin Quick Card to Upload PDF */}
                {isAdmin && (
                  <div
                    onClick={() => openPdfModal()}
                    className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition group min-h-[170px]"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-file-arrow-up text-xl"></i>
                    </div>
                    <span className="font-extrabold text-sm text-gray-800 block">Unggah Buku & File PDF Baru</span>
                    <span className="text-[11px] text-gray-500 mt-1">
                      Tambahkan dokumen PDF resep baru agar muncul di daftar koleksi ini
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Switcher Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar pt-2">
              <span className="text-xs font-bold text-gray-400 shrink-0">Pilihan Cepat:</span>
              {pdfBooks.map((book) => (
                <button
                  key={book.id}
                  onClick={() => {
                    setSelectedPdf(book);
                    setPdfZoom(100);
                    if (book.pdfFileUrl) {
                      setPdfViewMode('embed');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedPdf.id === book.id
                      ? 'bg-[#FF9F1C] text-white font-extrabold shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-amber-50'
                  }`}
                >
                  <i className="fa-solid fa-file-pdf"></i>
                  <span>{book.title}</span>
                </button>
              ))}
            </div>

            {/* 2. SCRIBD & PDF DOCUMENT VIEWER */}
            <div id="mpasi-reader" className="bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-700">
              <div className="bg-gray-900 text-white px-4 py-3 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-book-open text-[#FF9F1C]"></i>
                  <span className="font-bold text-xs sm:text-sm truncate max-w-[200px] sm:max-w-md">
                    {selectedPdf.title}
                  </span>
                  {selectedPdf.fileName && (
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-mono hidden md:inline">
                      {selectedPdf.fileName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-xs">
                  {/* View mode toggle if PDF file exists */}
                  {selectedPdf.pdfFileUrl && (
                    <div className="flex bg-gray-800 rounded-xl p-0.5 border border-gray-700">
                      <button
                        type="button"
                        onClick={() => setPdfViewMode('embed')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                          pdfViewMode === 'embed' ? 'bg-[#FF9F1C] text-white shadow' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        File PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setPdfViewMode('scribd')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                          pdfViewMode === 'scribd' ? 'bg-[#FF9F1C] text-white shadow' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Scribd
                      </button>
                    </div>
                  )}

                  {pdfViewMode === 'scribd' && (
                    <div className="flex items-center bg-gray-800 rounded-xl px-2 py-1 border border-gray-700">
                      <button
                        type="button"
                        onClick={() => setPdfZoom((prev) => (prev > 70 ? prev - 10 : prev))}
                        className="hover:text-[#FF9F1C] px-1"
                        title="Zoom Out"
                      >
                        <i className="fa-solid fa-minus"></i>
                      </button>
                      <span className="px-2 font-mono text-gray-300">{pdfZoom}%</span>
                      <button
                        type="button"
                        onClick={() => setPdfZoom((prev) => (prev < 150 ? prev + 10 : prev))}
                        className="hover:text-[#FF9F1C] px-1"
                        title="Zoom In"
                      >
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => downloadPdfFile(selectedPdf)}
                    className="bg-[#FF9F1C] hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition"
                    title="Unduh File PDF Resep"
                  >
                    <i className="fa-solid fa-download"></i>
                    <span className="hidden sm:inline">Unduh PDF</span>
                  </button>
                </div>
              </div>

              {/* View Mode: Embedded PDF Viewer */}
              {pdfViewMode === 'embed' && selectedPdf.pdfFileUrl ? (
                <div className="w-full bg-gray-900 flex flex-col">
                  {/* Top Bar for File PDF Mode */}
                  <div className="bg-gray-800/90 px-4 py-2 border-b border-gray-700/80 flex flex-wrap items-center justify-between text-xs text-gray-300 gap-2">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-file-pdf text-[#FF9F1C]"></i>
                      <span className="font-mono text-[11px] text-amber-200 truncate max-w-xs">
                        {selectedPdf.fileName || `${selectedPdf.title}.pdf`}
                      </span>
                      {selectedPdf.fileSize && (
                        <span className="text-[10px] text-gray-400">({selectedPdf.fileSize})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const url = base64ToBlobUrl(selectedPdf.pdfFileUrl!);
                          window.open(url, '_blank');
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        <span>Buka Layar Penuh</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadPdfFile(selectedPdf)}
                        className="bg-amber-500 hover:bg-amber-600 text-gray-900 px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition"
                      >
                        <i className="fa-solid fa-download"></i>
                        <span>Unduh File</span>
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-[650px] sm:h-[800px] relative bg-gray-950">
                    <object
                      data={base64ToBlobUrl(selectedPdf.pdfFileUrl)}
                      type="application/pdf"
                      className="w-full h-full border-0"
                    >
                      <iframe
                        src={base64ToBlobUrl(selectedPdf.pdfFileUrl)}
                        title={selectedPdf.title}
                        className="w-full h-full border-0"
                      >
                        <div className="p-8 text-center text-white space-y-4">
                          <p>File PDF berhasil dimuat.</p>
                          <button
                            type="button"
                            onClick={() => downloadPdfFile(selectedPdf)}
                            className="bg-amber-500 text-black px-4 py-2 rounded-xl font-bold"
                          >
                            Unduh File PDF Sekarang
                          </button>
                        </div>
                      </iframe>
                    </object>
                  </div>
                </div>
              ) : (
                /* View Mode: Scribd Multi-Page Vertical Continuous Scroll */
                <div className="p-4 sm:p-8 max-h-[650px] overflow-y-auto bg-gray-700/60 flex flex-col items-center space-y-6">
                  {selectedPdf.pages.map((page, pageIdx) => (
                    <div
                      key={pageIdx}
                      className="bg-white rounded-xl scribd-shadow transition-all duration-300 relative overflow-hidden"
                      style={{
                        width: `${600 * (pdfZoom / 100)}px`,
                        minHeight: `${780 * (pdfZoom / 100)}px`,
                        maxWidth: '100%',
                      }}
                    >
                      <div className="border-b border-gray-100 p-4 sm:p-6 bg-amber-50/40 flex justify-between items-center text-xs text-gray-400">
                        <span className="font-bold text-[#FF9F1C]">Si Bunda MP-ASI Cookbook</span>
                        <span className="font-mono">Hal. {pageIdx + 1}</span>
                      </div>

                      <div className="p-6 sm:p-8 space-y-4">
                        <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                          <h3 className="text-base sm:text-xl font-black text-gray-800">{page.recipeTitle}</h3>
                          <span className="bg-[#FFF0F4] text-[#FF7B9C] font-bold text-[10px] sm:text-xs px-2.5 py-1 rounded-full">
                            {page.ageCategory}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                          <img
                            src={page.image}
                            alt={page.recipeTitle}
                            className="w-full h-40 sm:h-48 object-cover rounded-xl border border-gray-100"
                          />
                          <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-2">
                            <h4 className="font-extrabold text-gray-700 border-b pb-1">Bahan-Bahan Utama:</h4>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                              {page.ingredients.map((ing, i) => (
                                <li key={i}>{ing}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs text-gray-700">
                          <h4 className="font-extrabold text-gray-800">Langkah Pembuatan:</h4>
                          <ol className="list-decimal list-inside space-y-1.5 text-gray-600 leading-relaxed">
                            {page.steps.map((step, s) => (
                              <li key={s}>{step}</li>
                            ))}
                          </ol>
                        </div>

                        <div className="mt-4 p-3 bg-teal-50 rounded-xl text-[11px] text-teal-800 border border-teal-100 flex items-start gap-2">
                          <i className="fa-solid fa-lightbulb text-[#2EC4B6] text-sm mt-0.5"></i>
                          <div>
                            <span className="font-bold">Catatan Gizi Ahli: </span>
                            <span>{page.nutritionNote}</span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-0 inset-x-0 p-3 bg-gray-50 border-t border-gray-100 text-center text-[10px] text-gray-400 font-semibold">
                        Platform Edukasi Gizi Si Bunda - Kepulauan Bangka Belitung
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* PAGE 5: ADMIN DASHBOARD PAGE */}
        {isAdmin && currentPage === 'admin' && (
          <section className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-purple-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap justify-between items-center gap-4">
              <div>
                <span className="bg-purple-700 text-purple-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Hak Akses Penuh Admin Ahli Gizi
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-1">Dashboard Kelola Konten & Data Kunjungan</h2>
                <p className="text-purple-200 text-xs sm:text-sm">
                  Kelola video, upload logo & buku PDF MP-ASI, serta pantau Google Spreadsheet secara terpusat
                </p>
              </div>
              <button
                onClick={logoutAdmin}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition shadow-md"
              >
                <i className="fa-solid fa-right-from-bracket mr-1"></i> Keluar Admin
              </button>
            </div>

            {/* Admin Navigation Tabs (4 TABS) */}
            <div className="flex border-b border-gray-200 gap-2 sm:gap-4 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setAdminTab('analytics')}
                className={`pb-3 text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
                  adminTab === 'analytics'
                    ? 'border-b-4 border-purple-600 text-purple-700 font-extrabold'
                    : 'text-gray-500 font-bold'
                }`}
              >
                <i className="fa-solid fa-table-cells text-emerald-600"></i>
                <span>Data Kunjungan ({visitorLogs.length})</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Cloud Realtime Sync Active"></span>
              </button>

              <button
                onClick={() => setAdminTab('videos')}
                className={`pb-3 text-xs sm:text-sm transition whitespace-nowrap flex items-center gap-1.5 ${
                  adminTab === 'videos'
                    ? 'border-b-4 border-purple-600 text-purple-700 font-extrabold'
                    : 'text-gray-500 font-bold'
                }`}
              >
                <i className="fa-solid fa-video text-purple-600"></i>
                <span>Video Edukasi ({giziVideos.length + kmsVideos.length})</span>
              </button>

              <button
                onClick={() => setAdminTab('pdfs')}
                className={`pb-3 text-xs sm:text-sm transition whitespace-nowrap flex items-center gap-1.5 ${
                  adminTab === 'pdfs'
                    ? 'border-b-4 border-purple-600 text-purple-700 font-extrabold'
                    : 'text-gray-500 font-bold'
                }`}
              >
                <i className="fa-solid fa-file-pdf text-[#FF9F1C]"></i>
                <span>Buku & File PDF ({pdfBooks.length})</span>
              </button>

              <button
                onClick={() => setAdminTab('branding')}
                className={`pb-3 text-xs sm:text-sm transition whitespace-nowrap flex items-center gap-1.5 ${
                  adminTab === 'branding'
                    ? 'border-b-4 border-purple-600 text-purple-700 font-extrabold'
                    : 'text-gray-500 font-bold'
                }`}
              >
                <i className="fa-solid fa-palette text-[#FF7B9C]"></i>
                <span>Logo & Tampilan Web</span>
              </button>
            </div>

            {/* TAB 1: DATA KUNJUNGAN IBU & GOOGLE SPREADSHEET INTEGRATION */}
            {adminTab === 'analytics' && (
              <div className="space-y-6">
                {/* Google Sheets Sync Configuration Banner */}
                <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-sm space-y-4">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-gray-800 text-base flex items-center gap-2">
                        <i className="fa-solid fa-file-excel text-emerald-600 text-xl"></i> Integrasi Otomatis ke Google Spreadsheet
                      </h4>
                      <p className="text-xs text-gray-600">
                        Setiap data nama & kecamatan yang diisi oleh pengunjung dari device mana pun akan otomatis terkirim & tersusun rapi sebagai baris baru di file Google Spreadsheet Anda.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowScriptModal(true)}
                      className="bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-code"></i>
                      <span>Lihat Kode Google Apps Script</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={googleSheetWebhook}
                      onChange={(e) => setGoogleSheetWebhook(e.target.value)}
                      placeholder="Tempel URL Webhook Google Apps Script di sini (https://script.google.com/macros/s/.../exec)"
                      className="flex-grow text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      onClick={saveWebhookUrl}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-xs whitespace-nowrap shadow transition"
                    >
                      <i className="fa-solid fa-floppy-disk mr-1"></i> Simpan Webhook
                    </button>
                  </div>

                  {googleSheetWebhook && (
                    <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 flex items-center justify-between border border-emerald-200">
                      <span className="flex items-center gap-1.5 font-bold">
                        <i className="fa-solid fa-circle-check text-emerald-600"></i> Webhook Google Sheets Terhubung & Aktif!
                      </span>
                      <button onClick={testWebhook} className="underline font-bold hover:text-emerald-900 text-[11px]">
                        Uji Kirim Data Sampel
                      </button>
                    </div>
                  )}
                </div>

                {/* Visitor Log Data Table with Search and CSV Download */}
                <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-4 sm:p-6 bg-gray-50 border-b flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-gray-800 text-base">Tabel Data Kunjungan Ibu Balita</h4>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span> Realtime Sync
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Hasil rekap formulir selamat datang pengunjung Si Bunda secara live dari semua perangkat
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={searchLog}
                        onChange={(e) => setSearchLog(e.target.value)}
                        placeholder="Cari nama / nomor HP / kecamatan..."
                        className="text-xs p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none w-52 sm:w-72"
                      />
                      <button
                        onClick={exportToCSV}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow flex items-center gap-1.5 transition"
                      >
                        <i className="fa-solid fa-file-csv text-base"></i> Unduh Excel / CSV
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-gray-100 text-gray-700 font-extrabold sticky top-0 z-10">
                        <tr>
                          <th className="p-3.5">Waktu Kunjungan</th>
                          <th className="p-3.5">Nama Ibu</th>
                          <th className="p-3.5">Nomor HP / WA</th>
                          <th className="p-3.5">Kecamatan (Kep. Bangka Belitung)</th>
                          <th className="p-3.5 text-center">Status Cloud Sync</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredLogs.map((log, idx) => (
                          <tr key={log.id || idx} className="hover:bg-purple-50/50 transition">
                            <td className="p-3.5 text-gray-500 text-xs font-mono">{log.timestamp}</td>
                            <td className="p-3.5 font-bold text-gray-800">{log.nama}</td>
                            <td className="p-3.5 font-mono text-gray-700">
                              {log.nomorHp ? (
                                <a
                                  href={`https://wa.me/${log.nomorHp.replace(/^0/, '62').replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 font-bold"
                                  title="Hubungi via WhatsApp"
                                >
                                  <i className="fa-brands fa-whatsapp text-emerald-500 text-sm"></i>
                                  <span>{log.nomorHp}</span>
                                </a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-3.5 text-[#2EC4B6] font-extrabold">{log.kecamatan}</td>
                            <td className="p-3.5 text-center">
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                                <i className="fa-solid fa-cloud-check text-emerald-600"></i> Tersimpan Cloud
                              </span>
                            </td>
                          </tr>
                        ))}
                        {filteredLogs.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-400">
                              Belum ada data kunjungan yang cocok.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: KELOLA VIDEO (CRUD) */}
            {adminTab === 'videos' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-gray-800 text-lg">Daftar Konten Video Edukasi</h3>
                  <button
                    onClick={openVideoModal}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow"
                  >
                    <i className="fa-solid fa-plus mr-1"></i> Tambah Video Baru
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                      <tr>
                        <th className="p-3">Kategori</th>
                        <th className="p-3">Judul Video</th>
                        <th className="p-3">YouTube ID</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[...giziVideos, ...kmsVideos].map((v) => (
                        <tr key={v.id} className="hover:bg-gray-50">
                          <td
                            className={`p-3 font-bold uppercase text-[10px] ${
                              v.category === 'gizi' ? 'text-[#FF7B9C]' : 'text-[#2EC4B6]'
                            }`}
                          >
                            {v.category}
                          </td>
                          <td className="p-3 font-semibold text-gray-800">{v.title}</td>
                          <td className="p-3 font-mono text-gray-500">{v.youtubeId}</td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => editVideo(v, v.category)}
                              className="text-blue-600 font-bold hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeletingVideoTarget({ id: v.id, category: v.category })}
                              className="text-red-600 font-bold hover:underline"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: KELOLA BUKU & FILE PDF RESEP MP-ASI */}
            {adminTab === 'pdfs' && (
              <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <h3 className="font-extrabold text-gray-800 text-lg">Kelola Buku & File PDF Resep MP-ASI</h3>
                    <p className="text-xs text-gray-500">
                      Unggah file PDF resep dari komputer Anda agar ibu-ibu balita dapat membaca dan mengunduhnya secara langsung.
                    </p>
                  </div>
                  <button
                    onClick={() => openPdfModal()}
                    className="bg-[#FF9F1C] hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-file-arrow-up"></i>
                    <span>Unggah / Tambah Buku PDF Baru</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pdfBooks.map((book) => (
                    <div
                      key={book.id}
                      className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-300 transition"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                            {book.ageCategory || 'MP-ASI'}
                          </span>
                          {book.pdfFileUrl ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <i className="fa-solid fa-file-circle-check text-emerald-600"></i> File PDF Aktif
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Resep Digital
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-gray-800 text-base">{book.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {book.fileName ? `Nama File: ${book.fileName}` : 'Buku digital interaktif dengan resep panduan ahli gizi.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPdf(book);
                              if (book.pdfFileUrl) {
                                setPdfViewMode('embed');
                              }
                              changePage('mpasi');
                            }}
                            className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition border border-amber-200"
                            title="Buka buku ini di Halaman Resep MP-ASI"
                          >
                            <i className="fa-solid fa-book-open"></i> Buka di Halaman Resep
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadPdfFile(book)}
                            className="text-xs font-bold text-gray-500 hover:text-amber-700 p-1.5 rounded-lg hover:bg-gray-100 transition"
                            title="Uji Unduh File PDF"
                          >
                            <i className="fa-solid fa-download"></i>
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openPdfModal(book)}
                            className="text-blue-600 hover:underline text-xs font-bold"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingPdfTarget(book.id)}
                            className="text-red-500 hover:underline text-xs font-bold"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: KELOLA LOGO & TAMPILAN HEADER */}
            {adminTab === 'branding' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. KELOLA LOGO WEBSITE */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-[#FF7B9C] font-bold text-base">
                    <i className="fa-solid fa-image"></i>
                    <h4>Logo Website Si Bunda</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Unggah file gambar logo baru (format PNG, JPG, atau SVG) untuk menggantikan logo bawaan di bagian navigasi atas dan footer.
                  </p>

                  {/* Logo Preview */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-pink-100 flex items-center justify-center p-2 shadow-inner overflow-hidden">
                      <img
                        src={customLogoUrl || DEFAULT_LOGO_URL}
                        alt="Pratinjau Logo Eduzi"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-800 block">
                        {customLogoUrl === DEFAULT_LOGO_URL ? 'Logo Standar Eduzi Aktif' : 'Logo Kustom Terpasang'}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {customLogoUrl === DEFAULT_LOGO_URL
                          ? 'Logo resmi Eduzi (Tampil di Header & Footer)'
                          : 'Logo kustom baru (Tampil di Header & Footer)'}
                      </span>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={logoFileInputRef}
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                  />

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="bg-[#FF7B9C] hover:bg-pink-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow"
                    >
                      <i className="fa-solid fa-cloud-arrow-up"></i>
                      <span>Unggah File Logo Baru</span>
                    </button>

                    {customLogoUrl !== DEFAULT_LOGO_URL && (
                      <button
                        type="button"
                        onClick={handleResetLogo}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-4 py-2.5 rounded-xl text-xs transition"
                      >
                        Reset ke Standar Eduzi
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. KELOLA HEADER GIF & KONTAK WA */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-base">
                    <i className="fa-solid fa-photo-film"></i>
                    <h4>Banner Animasi GIF Header (1280x720)</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Masukkan URL animasi GIF edukasi (1280x720 / 720p) yang ingin ditampilkan di banner atas seluruh halaman.
                  </p>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">URL Gambar / GIF Banner</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={customHeaderGif}
                        onChange={(e) => setCustomHeaderGif(e.target.value)}
                        placeholder="https://...link-gif-anda.gif"
                        className="flex-grow text-xs p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveHeaderGif(customHeaderGif)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition whitespace-nowrap shadow"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <label className="block text-xs font-bold text-gray-700">Nomor WhatsApp Ahli Gizi</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="6281234567890"
                        className="flex-grow text-xs p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.setItem('si_bunda_wa', whatsappNumber);
                          showToast('Nomor WhatsApp berhasil diperbarui!');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition whitespace-nowrap shadow"
                      >
                        Simpan WA
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-pink-100 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-pink-100 p-0.5 shadow-2xs">
                <img
                  src={customLogoUrl || DEFAULT_LOGO_URL}
                  alt="Logo Eduzi Si Bunda"
                  className="w-full h-full object-contain"
                  onError={() => setCustomLogoUrl(DEFAULT_LOGO_URL)}
                />
              </div>
              <span className="font-extrabold text-[#FF7B9C] text-lg">Si Bunda</span>
            </div>
            <p className="text-xs text-gray-500">Platform Edukasi Gizi & Pengasuhan Balita Kepulauan Bangka Belitung</p>
          </div>
          <div className="text-xs text-gray-400">
            &copy; 2026 Si Bunda. Dikembangkan untuk Ahli Gizi & Ibu Cerdas Indonesia.
          </div>
        </div>
      </footer>

      {/* 1. POP-UP SELAMAT DATANG */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-pink-100 relative overflow-hidden">
            {/* Tab Switcher: Pengunjung vs Admin */}
            <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setWelcomeTab('user')}
                className={`w-1/2 py-2 rounded-xl text-xs transition ${
                  welcomeTab === 'user' ? 'bg-white text-[#FF7B9C] font-extrabold shadow-sm' : 'text-gray-500 font-bold'
                }`}
              >
                <i className="fa-solid fa-user-heart mr-1"></i> Pengunjung / Ibu
              </button>
              <button
                type="button"
                onClick={() => setWelcomeTab('admin')}
                className={`w-1/2 py-2 rounded-xl text-xs transition ${
                  welcomeTab === 'admin' ? 'bg-purple-600 text-white font-extrabold shadow-sm' : 'text-gray-500 font-bold'
                }`}
              >
                <i className="fa-solid fa-user-shield mr-1"></i> Login Admin
              </button>
            </div>

            {/* TAB 1: FORM PENGUNJUNG IBU */}
            {welcomeTab === 'user' && (
              <div>
                <div className="text-center space-y-2 mb-6">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-md p-1 border-2 border-pink-100 overflow-hidden">
                    <img
                      src={customLogoUrl || DEFAULT_LOGO_URL}
                      alt="Logo Eduzi Si Bunda"
                      className="w-full h-full object-contain"
                      onError={() => setCustomLogoUrl(DEFAULT_LOGO_URL)}
                    />
                  </div>
                  <h3 className="text-2xl font-black text-gray-800">Selamat Datang di Si Bunda!</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Platform edukasi gizi & tumbuh kembang anak untuk Ibu di Provinsi Kepulauan Bangka Belitung.
                  </p>
                </div>

                <form onSubmit={submitUserData} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nama Ibu / Orang Tua <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={inputNama}
                      onChange={(e) => setInputNama(e.target.value)}
                      placeholder="Contoh: Ibu Rahma"
                      className="w-full text-sm p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FF7B9C] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Kecamatan Tempat Tinggal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      list="babel-kecamatan-list"
                      value={inputKecamatan}
                      onChange={(e) => setInputKecamatan(e.target.value)}
                      placeholder="Contoh: Sungailiat / Koba / Tanjung Pandan"
                      className="w-full text-sm p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FF7B9C] outline-none"
                    />
                    <datalist id="babel-kecamatan-list">
                      {Object.entries(DEFAULT_BABEL_DISTRICTS).flatMap(([kabKota, districts]) =>
                        districts.map((kec) => (
                          <option key={`${kec}-${kabKota}`} value={`${kec} (${kabKota})`}>
                            {kec} - {kabKota}
                          </option>
                        ))
                      )}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nomor HP / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <i className="fa-solid fa-phone text-xs"></i>
                      </div>
                      <input
                        type="tel"
                        required
                        value={inputNomorHp}
                        onChange={(e) => setInputNomorHp(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="w-full text-sm p-3 pl-9 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FF7B9C] outline-none font-medium"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Digunakan untuk konfirmasi & konsultasi tumbuh kembang anak</p>
                  </div>

                  <div className="p-3 bg-teal-50 rounded-xl text-[11px] text-teal-800 flex items-start gap-2 border border-teal-100">
                    <i className="fa-solid fa-shield-halved text-[#2EC4B6] text-base mt-0.5"></i>
                    <span>Data Anda tersimpan rapi & aman untuk pemetaan sasaran edukasi gizi di Bangka Belitung.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#FF7B9C] hover:bg-pink-600 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-all text-sm"
                  >
                    Mulai Jelajahi Si Bunda <i className="fa-solid fa-arrow-right ml-1"></i>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: FORM LOGIN ADMIN LANGSUNG DARI POP-UP */}
            {welcomeTab === 'admin' && (
              <div>
                <div className="text-center space-y-2 mb-6">
                  <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                    <i className="fa-solid fa-user-lock"></i>
                  </div>
                  <h3 className="text-2xl font-black text-purple-900">Login Admin Content</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Masuk tanpa mengisi nama pengunjung untuk mengelola konten & melihat data spreadsheet.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    verifyAdminLogin('popup');
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Kata Sandi Admin</label>
                    <input
                      type="password"
                      required
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      className="w-full text-sm p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  {loginError && <p className="text-xs font-bold text-red-500">{loginError}</p>}
                  <button
                    type="submit"
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-all text-sm"
                  >
                    Masuk Dashboard Admin <i className="fa-solid fa-right-to-bracket ml-1"></i>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. GOOGLE APPS SCRIPT TUTORIAL MODAL */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto border border-emerald-100 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-file-code text-emerald-600"></i> Cara Menghubungkan ke Google Spreadsheet
              </h3>
              <button onClick={() => setShowScriptModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <ol className="list-decimal list-inside text-xs text-gray-700 space-y-3 leading-relaxed">
              <li>Buka file <strong>Google Sheets</strong> Anda (atau buat sheet baru).</li>
              <li>Klik menu <strong>Extensions (Ekstensi)</strong> &rarr; <strong>Apps Script</strong>.</li>
              <li>Hapus kode yang ada, lalu <strong>salin (copy) kode di bawah ini</strong>:</li>
            </ol>

            <div className="relative bg-gray-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-gray-800">
              <button
                type="button"
                onClick={copyAppsScript}
                className="absolute top-3 right-3 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] px-2.5 py-1 rounded-lg font-bold"
              >
                <i className="fa-solid fa-copy mr-1"></i> Salin Kode
              </button>
              <pre>{appsScriptCode}</pre>
            </div>

            <ol start={4} className="list-decimal list-inside text-xs text-gray-700 space-y-3 leading-relaxed">
              <li>Klik tombol <strong>Deploy (Terapkan)</strong> &rarr; <strong>New Deployment</strong>.</li>
              <li>Pilih jenis deployment: <strong>Web App</strong>.</li>
              <li>Pada opsi <em>Who has access (Siapa yang memiliki akses)</em>, pilih: <strong>Anyone (Siapa saja)</strong>.</li>
              <li>Klik <strong>Deploy</strong>, lalu salin <strong>Web App URL</strong> yang dihasilkan.</li>
              <li>Tempelkan URL tersebut ke dalam kolom <strong>Webhook Google Apps Script</strong> di Admin Panel ini, lalu klik <strong>Simpan Webhook</strong>. Selesai!</li>
            </ol>

            <div className="text-right pt-2">
              <button
                type="button"
                onClick={() => setShowScriptModal(false)}
                className="bg-gray-800 text-white px-5 py-2 rounded-xl text-xs font-bold"
              >
                Paham, Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ADMIN LOGIN MODAL */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-purple-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-black text-purple-900 flex items-center gap-2">
                <i className="fa-solid fa-user-shield"></i> Login Admin Content
              </h3>
              <button onClick={() => setShowAdminLoginModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">Masukkan kata sandi admin untuk mengelola konten website</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyAdminLogin('modal');
              }}
              className="space-y-4"
            >
              <div>
                <input
                  type="password"
                  required
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full text-sm p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              {loginError && <p className="text-xs font-bold text-red-500">{loginError}</p>}
              <button
                type="submit"
                className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-xl text-sm transition"
              >
                Masuk Panel Admin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL EDIT/ADD VIDEO */}
      {showVideoFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-gray-800">
              {editingVideo.id ? 'Edit Video Edukasi' : 'Tambah Video Baru'}
            </h3>
            <form onSubmit={saveVideoForm} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700">Kategori Halaman Target</label>
                <select
                  value={editingVideo.category}
                  onChange={(e) =>
                    setEditingVideo({ ...editingVideo, category: e.target.value as 'gizi' | 'kms' })
                  }
                  className="w-full p-2.5 rounded-xl border mt-1"
                >
                  <option value="gizi">Gizi Sehat untuk Si Kecil</option>
                  <option value="kms">Panduan KMS</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-gray-700">Judul Video</label>
                <input
                  type="text"
                  required
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700">YouTube Video ID (misal: b_f-M_8264A)</label>
                <input
                  type="text"
                  required
                  value={editingVideo.youtubeId}
                  onChange={(e) => setEditingVideo({ ...editingVideo, youtubeId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border mt-1 font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700">Deskripsi Singkat</label>
                <textarea
                  value={editingVideo.description}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border mt-1"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVideoFormModal(false)}
                  className="w-1/2 bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl"
                >
                  Batal
                </button>
                <button type="submit" className="w-1/2 bg-purple-600 text-white font-bold py-2.5 rounded-xl">
                  Simpan Konten
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL UPLOAD / EDIT BUKU RESEP PDF */}
      {showPdfFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-file-pdf text-[#FF9F1C]"></i>
                <span>{editingPdfBook.id ? 'Edit Buku / File PDF' : 'Unggah Buku & File PDF Baru'}</span>
              </h3>
              <button onClick={() => setShowPdfFormModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={savePdfBookForm} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Judul Buku / Kumpulan Resep *</label>
                <input
                  type="text"
                  required
                  value={editingPdfBook.title}
                  onChange={(e) => setEditingPdfBook({ ...editingPdfBook, title: e.target.value })}
                  placeholder="Contoh: Buku Resep MP-ASI Usia 12-23 Bulan Bergizi Tinggi"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FF9F1C] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Kategori Usia Balita</label>
                <select
                  value={editingPdfBook.ageCategory}
                  onChange={(e) => setEditingPdfBook({ ...editingPdfBook, ageCategory: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FF9F1C] outline-none bg-white"
                >
                  <option value="6 - 8 Bulan">6 - 8 Bulan (Tekstur Saring)</option>
                  <option value="9 - 11 Bulan">9 - 11 Bulan (Tekstur Cincang)</option>
                  <option value="12 - 23 Bulan">12 - 23 Bulan (Makanan Keluarga)</option>
                  <option value="Kudapan & Snack">Kudapan & Snack Bergizi</option>
                  <option value="Semua Usia">Panduan MP-ASI Umum</option>
                </select>
              </div>

              {/* Upload File PDF Picker */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border-2 border-dashed border-amber-300 space-y-3">
                <div className="text-center">
                  <i className="fa-solid fa-file-arrow-up text-3xl text-[#FF9F1C] mb-2 block"></i>
                  <span className="font-bold text-gray-800 text-xs block">Pilih File PDF dari Komputer / HP</span>
                  <span className="text-[11px] text-gray-500">Mendukung file dokumen .pdf resmi (maksimal 15 MB)</span>
                </div>

                <input
                  type="file"
                  ref={pdfFileInputRef}
                  accept="application/pdf,.pdf"
                  onChange={handlePdfFileChange}
                  className="hidden"
                />

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => pdfFileInputRef.current?.click()}
                    className="bg-[#FF9F1C] hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
                  >
                    <i className="fa-solid fa-folder-open"></i>
                    <span>Cari File PDF</span>
                  </button>
                </div>

                {editingPdfBook.fileName && (
                  <div className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-gray-800 truncate max-w-[240px]">
                      <i className="fa-solid fa-file-pdf text-[#FF9F1C] mr-1.5"></i>
                      {editingPdfBook.fileName}
                    </span>
                    <span className="text-emerald-600 font-bold">Siap Disimpan</span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Atau Masukkan Tautan PDF Eksternal (Opsional)
                </label>
                <input
                  type="url"
                  value={editingPdfBook.pdfFileUrl.startsWith('data:') ? '' : editingPdfBook.pdfFileUrl}
                  onChange={(e) =>
                    setEditingPdfBook({
                      ...editingPdfBook,
                      pdfFileUrl: e.target.value,
                      fileName: editingPdfBook.fileName || 'Dokumen_Resep_MPASI.pdf',
                    })
                  }
                  placeholder="https://drive.google.com/.../view atau link PDF langsung"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#FF9F1C] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Catatan Gizi / Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={editingPdfBook.description}
                  onChange={(e) => setEditingPdfBook({ ...editingPdfBook, description: e.target.value })}
                  placeholder="Keterangan singkat tentang resep-resep di dalam buku ini..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FF9F1C] outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="jumpToMpasiCheck"
                  checked={editingPdfBook.jumpToMpasiPage !== false}
                  onChange={(e) => setEditingPdfBook({ ...editingPdfBook, jumpToMpasiPage: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="jumpToMpasiCheck" className="cursor-pointer font-semibold">
                  Langsung buka Halaman Resep MP-ASI dan aktifkan buku ini setelah disimpan
                </label>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowPdfFormModal(false)}
                  className="w-1/2 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#FF9F1C] hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs shadow flex items-center justify-center gap-1.5"
                >
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>Simpan & Tambahkan ke Resep</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION MODALS */}
      {deletingVideoTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl">
              <i className="fa-solid fa-trash"></i>
            </div>
            <h4 className="font-black text-gray-800 text-base">Hapus Video Ini?</h4>
            <p className="text-xs text-gray-500">Tindakan ini akan menghapus konten video dari daftar.</p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingVideoTarget(null)}
                className="w-1/2 bg-gray-200 text-gray-700 font-bold py-2 rounded-xl text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteVideo}
                className="w-1/2 bg-red-600 text-white font-bold py-2 rounded-xl text-xs"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingPdfTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl">
              <i className="fa-solid fa-trash"></i>
            </div>
            <h4 className="font-black text-gray-800 text-base">Hapus Buku PDF Ini?</h4>
            <p className="text-xs text-gray-500">Tindakan ini akan menghapus buku dan file PDF dari tab resep MP-ASI.</p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPdfTarget(null)}
                className="w-1/2 bg-gray-200 text-gray-700 font-bold py-2 rounded-xl text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeletePdf}
                className="w-1/2 bg-red-600 text-white font-bold py-2 rounded-xl text-xs"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-gray-700 animate-in slide-in-from-bottom-2">
          <i className="fa-solid fa-circle-info text-[#FF7B9C] text-base"></i>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
