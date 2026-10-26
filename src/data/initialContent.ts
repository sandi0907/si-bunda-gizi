export interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // YouTube embed / video link
  thumbnailUrl: string;
  category: 'gizi-sehat' | 'panduan-kms';
  duration: string;
  speaker: string;
  tags: string[];
  keyPoints?: string[];
}

export interface MpasiRecipe {
  id: string;
  pageNumber: number;
  title: string;
  ageGroup: '6-8 Bulan' | '9-11 Bulan' | '12-23 Bulan' | 'Snack & Kudapan';
  description: string;
  portion: string;
  frequency: string;
  texture: string;
  ingredients: string[];
  steps: string[];
  nutritionalValue: {
    energy: string; // e.g. "175 kkal"
    protein: string; // e.g. "7.5 gram"
    fat: string; // e.g. "6.2 gram"
    iron: string; // e.g. "2.1 mg"
  };
  tipsBunda: string;
  localHighlight?: string; // e.g. "Menggunakan Ikan Tenggiri / Kembung Segar Khas Bangka"
  imageUrl?: string;
}

export interface VisitorRecord {
  id: string;
  name: string;
  subdistrict: string; // Kecamatan
  regency: string; // Kabupaten/Kota
  targetCategory?: string;
  childAgeMonths?: number;
  visitedAt: string; // ISO string
  timestampFormatted: string;
  syncedToGoogleSheets: boolean;
}

export interface SiteSettings {
  headerGifUrl: string;
  whatsappNumber: string; // e.g. 6281234567890
  whatsappConsultantName: string; // e.g. "Ahli Gizi Si Bunda (Nutrisionis)"
  googleSheetsWebhookUrl: string; // URL Google Apps Script Webhook
  siteTitle: string;
  tagline: string;
}

// Initial default settings
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  // Can be a GIF URL (1280x720) or client's own uploaded link
  headerGifUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1280&auto=format&fit=crop',
  whatsappNumber: '6281273919090',
  whatsappConsultantName: 'Konsultan Ahli Gizi Si Bunda',
  googleSheetsWebhookUrl: '',
  siteTitle: 'Si Bunda',
  tagline: 'Platform Edukasi Gizi & Pengasuhan Balita Indonesia',
};

// Initial Educational Videos for "Gizi Sehat untuk Si Kecil"
export const INITIAL_GIZI_VIDEOS: VideoItem[] = [
  {
    id: 'gz-1',
    title: 'Isi Piringku Kaya Protein Hewani untuk Balita',
    description: 'Pahami proporsi gizi seimbang karbohidrat, protein hewani ganda (ikan, telur, ayam), lemak sehat, dan serat sayur untuk memacu pertumbuhan tinggi badan anak.',
    videoUrl: 'https://www.youtube.com/embed/g2J-H8-Q3kU',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=640&auto=format&fit=crop',
    category: 'gizi-sehat',
    duration: '04:15',
    speaker: 'Ns. Linda Permata, S.Gz (Ahli Gizi Anak)',
    tags: ['Protein Hewani', 'Isi Piringku', 'Cegah Stunting'],
    keyPoints: [
      'Utamakan 2 jenis protein hewani di setiap porsi makan (contoh: telur + ikan)',
      'Protein hewani mengandung asam amino esensial lengkap pemicu hormon pertumbuhan (mTORC1)',
      'Lemak tambahan (santan/minyak/mentega) sangat diperlukan untuk densitas energi otak balita',
    ],
  },
  {
    id: 'gz-2',
    title: 'Pola Asuh Responsive Feeding: Atasi Balita GTM',
    description: 'Strategi praktis menghadapi anak Gerakan Tutup Mulut (GTM) tanpa paksaan, menciptakan suasana makan menyenangkan, dan jadwal makan teratur.',
    videoUrl: 'https://www.youtube.com/embed/5F_C1XoV_4A',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=640&auto=format&fit=crop',
    category: 'gizi-sehat',
    duration: '05:40',
    speaker: 'dr. Tiara Annisa, Sp.A (Dokter Spesialis Anak)',
    tags: ['Responsive Feeding', 'Atasi GTM', 'Pola Asuh Makan'],
    keyPoints: [
      'Terapkan feeding rules: waktu makan maksimal 30 menit',
      'Hindari distraksi seperti gawai/layar HP saat waktu makan',
      'Berikan respon peka terhadap sinyal lapar dan kenyang si kecil',
    ],
  },
  {
    id: 'gz-3',
    title: 'Pemanfaatan Pangan Lokal Ikan Bangka Belitung untuk Gizi Anak',
    description: 'Kekayaan ikan laut & air tawar di Kepulauan Bangka Belitung (tenggiri, kembung, dencis) yang kaya DHA dan Omega-3 untuk kecerdasan otak balita.',
    videoUrl: 'https://www.youtube.com/embed/YpD1b4m0sB0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?q=80&w=640&auto=format&fit=crop',
    category: 'gizi-sehat',
    duration: '03:50',
    speaker: 'Ahmad Fauzi, S.Tr.Gz (Nutrisionis Daerah Babel)',
    tags: ['Pangan Lokal Babel', 'Ikan Laut Segar', 'Omega 3'],
    keyPoints: [
      'Ikan kembung lokal memiliki kandungan Omega-3 dan DHA setara bahkan lebih tinggi dari salmon',
      'Mudah didapat di pasar lokal se-Bangka Belitung dengan harga terjangkau',
      'Teknik pengolahan tepat agar gizinya tidak rusak (kukus, tim, atau kuah kuning tanpa pengawet)',
    ],
  },
  {
    id: 'gz-4',
    title: 'Zat Besi & Mikronutrien: Tameng Utama Anemia Balita',
    description: 'Kekurangan zat besi dapat menghambat perkembangan kognitif permanen. Kenali tanda anemia pada anak dan makanan kaya zat besi heme.',
    videoUrl: 'https://www.youtube.com/embed/9No-FiEInLA',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=640&auto=format&fit=crop',
    category: 'gizi-sehat',
    duration: '04:45',
    speaker: 'Dinda Rahmawati, S.Gz (Konsultan Gizi Si Bunda)',
    tags: ['Zat Besi', 'Cegah Anemia', 'Kognitif Anak'],
    keyPoints: [
      'Hati ayam dan daging sapi merupakan sumber zat besi heme tertinggi yang paling cepat diserap tubuh',
      'Kombinasikan dengan vitamin C (buah jeruk/pepaya) untuk meningkatkan penyerapan',
      'Hindari memberi teh atau susu sapi berlebih berdekatan dengan jam makan utama',
    ],
  },
];

// Initial Educational Videos for "Panduan KMS"
export const INITIAL_KMS_VIDEOS: VideoItem[] = [
  {
    id: 'kms-1',
    title: 'Cara Benar Membaca Grafik Pertumbuhan Kartu Menuju Sehat (KMS)',
    description: 'Panduan langkah demi langkah memahami kurva pertumbuhan KMS: apa arti pita hijau, kuning, pita merah, serta garis persentil WHO.',
    videoUrl: 'https://www.youtube.com/embed/0BhpKj_U5Wk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=640&auto=format&fit=crop',
    category: 'panduan-kms',
    duration: '06:15',
    speaker: 'Bidan Ratna Sari, S.Tr.Keb (Koordinator Posyandu)',
    tags: ['Baca Grafik KMS', 'Pita Hijau', 'Posyandu'],
    keyPoints: [
      'Garis hijau menunjukkan pertumbuhan berat badan sesuai usia yang ideal',
      'Pita kuning dan merah memerlukan evaluasi asupan makan dan konfirmasi tenaga kesehatan',
      'Perhatikan arah grafik: mendatar (T) atau menurun (T) adalah sinyal waspada gagal tumbuh (weight faltering)',
    ],
  },
  {
    id: 'kms-2',
    title: 'Mengenal KBM (Kenaikan Berat Minimal) Setiap Bulan',
    description: 'Anak naik berat badan belum tentu cukup! Ketahui standar KBM gram per bulan dari umur 1 hingga 24 bulan untuk mencegah stunting sejak dini.',
    videoUrl: 'https://www.youtube.com/embed/4yW5K38_KqM',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=640&auto=format&fit=crop',
    category: 'panduan-kms',
    duration: '04:30',
    speaker: 'dr. Hendra Wijaya, Sp.A (Spesialis Tumbuh Kembang)',
    tags: ['Standar KBM', 'Cegah Gagal Tumbuh', 'Evaluasi Posyandu'],
    keyPoints: [
      'Bulan ke-1 KBM: minimal 800 gr | Bulan ke-2: 900 gr | Bulan ke-3: 800 gr',
      'Bulan ke-4: 600 gr | Bulan ke-5: 500 gr | Bulan ke-6: 400 gr',
      'Jika KBM tidak tercapai 2 bulan berturut-turut (2T), segera bawa ke Puskesmas!',
    ],
  },
  {
    id: 'kms-3',
    title: 'Tanda Bahaya Stunting & Kapan Balita Wajib Dirujuk',
    description: 'Ketahui perbedaan anak berperawakan pendek akibat genetik versus stunting akibat malnutrisi kronis berulang, dan alur rujukan Puskesmas.',
    videoUrl: 'https://www.youtube.com/embed/sZ5q4_rXwMo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=640&auto=format&fit=crop',
    category: 'panduan-kms',
    duration: '05:10',
    speaker: 'Dinda Rahmawati, S.Gz (Ahli Gizi Puskesmas Babel)',
    tags: ['Tanda Bahaya', 'Alur Rujukan', 'Stunting'],
    keyPoints: [
      'Stunting diawali dari kenaikan berat badan yang tidak memadai (weight faltering), lalu tinggi badan melambat',
      'Perkembangan motorik dan bicara anak yang terlambat dibanding usia sebayanya',
      'Pemberian Makanan Tambahan (PMT) Pemulihan lokal kaya protein hewani',
    ],
  },
  {
    id: 'kms-4',
    title: 'Tips Membawa Balita ke Posyandu: Pengukuran Akurat',
    description: 'Cara menimbang yang benar (lepaskan jaket/popok tebal) dan pengukuran panjang/tinggi badan balita agar plotting di KMS tidak keliru.',
    videoUrl: 'https://www.youtube.com/embed/8-W7zR6H0u8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=640&auto=format&fit=crop',
    category: 'panduan-kms',
    duration: '03:45',
    speaker: 'Kader Gizi Melati Bangka Belitung',
    tags: ['Timbangan Posyandu', 'Infantometer', 'Tips Bunda'],
    keyPoints: [
      'Timbangan dacin atau digital harus dikalibrasi di titik nol sebelum anak naik',
      'Balita di bawah 2 tahun diukur terlentang (panjang badan), di atas 2 tahun diukur berdiri (tinggi badan)',
      'Catat di buku KIA dan konsultasikan dengan petugas gizi saat posyandu',
    ],
  },
];

// Initial Scribd-style PDF Recipes for "Resep MP ASI"
export const INITIAL_MPASI_RECIPES: MpasiRecipe[] = [
  {
    id: 'mpasi-1',
    pageNumber: 1,
    title: 'Bubur Tim Ikan Tenggiri Sayur Bayam Labu Kuning',
    ageGroup: '6-8 Bulan',
    description: 'Menu MP-ASI awal kaya asam lemak Omega-3 dan zat besi dengan tekstur lumat halus (puree saring) yang ramah pencernaan bayi.',
    portion: '2-3 sendok makan dewasa bertahap hingga 1/2 mangkuk kecil (125 ml)',
    frequency: '2-3 kali makan utama sehari + 1 kali snack buah',
    texture: 'Bubur kental lumat disaring halus (tidak tumpah saat sendok dimiringkan)',
    ingredients: [
      '30 gram Beras putih pulen lokal Bangka (3 sdm)',
      '35 gram Fillet ikan tenggiri segar tanpa duri, cincang halus',
      '1 butir Kuning telur ayam kampung',
      '15 gram Labu kuning, parut halus',
      '10 gram Daun bayam hijau muda, iris tipis',
      '1 sdt Minyak kelapa / margarin (sebagai sumber lemak tambahan)',
      '250 ml Kaldu ayam kampung atau air bersih',
      '1 siung Bawang putih & 1 lembar daun salam (aromatik)',
    ],
    steps: [
      'Rebus beras putih dengan air kaldu ayam, masukkan daun salam dan bawang putih geprek hingga menjadi bubur lunak.',
      'Masukkan cincangan ikan tenggiri segar, kuning telur, dan parutan labu kuning. Aduk rata hingga matang merata.',
      'Menjelang diangkat, tambahkan irisan daun bayam dan 1 sendok teh minyak kelapa/margarin. Masak 2 menit lagi hingga bayam layu.',
      'Buang daun salam dan bawang putih. Saring bubur di atas saringan kawat (jangan gunakan blender agar tekstur melatih oromotor tidak terlalu cair).',
      'Sajikan hangat untuk si kecil dengan penuh kesabaran dan senyuman.',
    ],
    nutritionalValue: {
      energy: '165 kkal per porsi',
      protein: '7.8 gram',
      fat: '6.4 gram',
      iron: '2.3 mg',
    },
    tipsBunda: 'Ikan tenggiri segar dari nelayan Bangka memiliki aroma gurih alami tanpa perlu tambahan garam atau penyedap rasa.',
    localHighlight: 'Kaya Omega-3 & DHA Pangan Laut Bangka Belitung',
  },
  {
    id: 'mpasi-2',
    pageNumber: 2,
    title: 'Nasi Tim Hati Ayam Telur Puyuh & Wortel Manis',
    ageGroup: '9-11 Bulan',
    description: 'Menu padat zat besi pencegah utama stunting dan anemia. Tekstur mulai dicincang halus (minced) untuk merangsang gigi dan rahang balita.',
    portion: '1/2 mangkuk ukuran 250 ml (sekitar 125 ml)',
    frequency: '3-4 kali makan utama + 1-2 kali snack bergizi',
    texture: 'Nasi tim lembek cincang halus kasar (tidak perlu disaring lagi)',
    ingredients: [
      '40 gram Beras putih (4 sdm)',
      '35 gram Hati ayam segar, cuci bersih peras jeruk nipis, cincang kecil',
      '2 butir Telur puyuh rebus, kupas lalu cincang',
      '20 gram Wortel serut halus',
      '15 gram Tahu putih lembut, potong dadu mikro',
      '1 sdt Santan kental atau minyak jagung/kelapa',
      '300 ml Air kaldu sapi atau ayam',
      'Bumbu aromatik: bawang merah, bawang putih, jahe seiris tipis.',
    ],
    steps: [
      'Tumis bumbu aromatik halus dengan 1 sdt minyak kelapa hingga harum, masukkan cincangan hati ayam hingga berubah warna.',
      'Masukkan beras dan tuang air kaldu. Aduk perlahan dengan api sedang.',
      'Tambahkan cincangan telur puyuh, tahu putih, dan serutan wortel.',
      'Beri 1 sdm santan kental agar gurih berkalori tinggi. Masak hingga nasi menjadi tim lembek dan air menyusut.',
      'Koreksi tekstur sesuai kemampuan mengunyah anak usia 9 bulan.',
    ],
    nutritionalValue: {
      energy: '195 kkal per porsi',
      protein: '9.2 gram',
      fat: '7.8 gram',
      iron: '3.6 mg (Kaya Zat Besi Heme)',
    },
    tipsBunda: 'Hati ayam adalah superfood lokal dengan bioavailability zat besi tertinggi. Sangat disarankan dikonsumsi 2-3 kali seminggu.',
    localHighlight: 'Juara Anti-Anemia untuk Kognitif Cerdas Balita',
  },
  {
    id: 'mpasi-3',
    pageNumber: 3,
    title: 'Nasi Ikan Kembung Kuah Bening Daun Kelor & Tempe Bacem Gurih',
    ageGroup: '12-23 Bulan',
    description: 'Menu keluarga yang disesuaikan untuk batita. Mengombinasikan ikan kembung tinggi kalsium dan daun kelor super antioksidan khas kebun pekarangan.',
    portion: '3/4 mangkuk ukuran 250 ml hingga sepiring kecil',
    frequency: '3 kali makan keluarga + 2 kali kudapan sehat',
    texture: 'Makanan keluarga: nasi pulen agak lembek, lauk dipotong kecil mudah digigit balita',
    ingredients: [
      '50 gram Nasi putih pulen hangat',
      '50 gram Ikan kembung banyar/kuring lokal, kukus dan suwir buang duri bersih',
      '20 gram Tempe kedelai, potong dadu goreng dengan sedikit minyak',
      '15 gram Daun kelor segar (ambil daun mudanya saja)',
      '20 gram Labu siam muda, potong dadu',
      '300 ml Air kaldu ikan/sayur bening',
      'Bumbu kuah: bawang merah iris, bawang putih iris, kunci/temu kunci, sedikit garam beriodium.',
    ],
    steps: [
      'Didihkan kaldu bersama irisan bawang merah, bawang putih, dan sedikit temu kunci.',
      'Masukkan labu siam hingga empuk. Masukkan suwiran ikan kembung dan tempe.',
      'Terakhir masukkan daun kelor muda, masak sebentar saja (1 menit) agar vitamin C dan antioksidannya tetap terjaga.',
      'Angkat dan sajikan kuah bening bersama nasi hangat.',
      'Ajak anak makan bersama keluarga di meja makan untuk melatih sosialisasi.',
    ],
    nutritionalValue: {
      energy: '230 kkal per porsi',
      protein: '11.4 gram',
      fat: '8.5 gram',
      iron: '2.8 mg',
    },
    tipsBunda: 'Ikan kembung mengandung lemak tak jenuh ganda DHA lebih banyak daripada ikan salmon impor, harganya sangat terjangkau di pasar Bangka Belitung!',
    localHighlight: 'Pangan Lokal Ikan Kembung & Daun Kelor Pekarangan',
  },
  {
    id: 'mpasi-4',
    pageNumber: 4,
    title: 'Kudapan Puding Santan Pisang Ambon & Telur Kukus (Tinggi Kalori)',
    ageGroup: 'Snack & Kudapan',
    description: 'Snack selingan padat gizi untuk mengejar berat badan balita (weight booster). Lembut, manis alami buah, dan harum santan.',
    portion: '1 cup kecil (sekitar 80-100 ml)',
    frequency: '1-2 kali sehari di antara jam makan utama',
    texture: 'Puding lembut lumer di lidah',
    ingredients: [
      '1 buah Pisang ambon matang, lumatkan dengan garpu',
      '1 butir Telur ayam kocok lepas',
      '65 ml Santan kelapa perasan pertama segar',
      '1 sdm Tepung maizena / hunkwe',
      '50 ml Air matang',
      'Sejumput vanili bubuk alami (opsional)',
    ],
    steps: [
      'Campurkan pisang ambon lumat, telur ayam kocok, dan santan kelapa dalam mangkuk tahan panas.',
      'Larutkan tepung maizena dengan 50 ml air, lalu tuangkan ke adonan pisang. Aduk rata.',
      'Tuangkan ke dalam cetakan kecil atau cup kaca tahan panas.',
      'Kukus selama 15-20 menit hingga matang dan set.',
      'Bisa disajikan hangat atau didinginkan di lemari es.',
    ],
    nutritionalValue: {
      energy: '145 kkal per porsi',
      protein: '4.5 gram',
      fat: '7.2 gram (Lemak Sehat Santan)',
      iron: '1.1 mg',
    },
    tipsBunda: 'Santan kelapa mengandung Medium Chain Triglycerides (MCT) yang sangat mudah dicerna menjadi energi cepat bagi balita aktif.',
    localHighlight: 'Snack Booster Berat Badan Alami Tanpa Gula Tambahan',
  },
];
