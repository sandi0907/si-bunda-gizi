export interface Subdistrict {
  id: string;
  name: string;
  regency: string; // Kabupaten / Kota
  postalCode?: string;
}

export interface Regency {
  name: string;
  type: 'Kabupaten' | 'Kota';
  subdistricts: string[];
}

export const BANGKA_BELITUNG_REGENCIES: Regency[] = [
  {
    name: 'Kota Pangkalpinang',
    type: 'Kota',
    subdistricts: [
      'Bukit Intan',
      'Gabek',
      'Gerunggang',
      'Girimaya',
      'Pangkal Balam',
      'Rangkui',
      'Taman Sari',
    ],
  },
  {
    name: 'Kabupaten Bangka',
    type: 'Kabupaten',
    subdistricts: [
      'Bakam',
      'Belinyu',
      'Mendo Barat',
      'Merawang',
      'Pemali',
      'Puding Besar',
      'Riau Silip',
      'Sungailiat',
    ],
  },
  {
    name: 'Kabupaten Bangka Barat',
    type: 'Kabupaten',
    subdistricts: [
      'Jebus',
      'Kelapa',
      'Mentok (Muntok)',
      'Parittiga',
      'Simpang Teritip',
      'Tempilang',
    ],
  },
  {
    name: 'Kabupaten Bangka Tengah',
    type: 'Kabupaten',
    subdistricts: [
      'Koba',
      'Lubuk Besar',
      'Namang',
      'Pangkalan Baru',
      'Simpang Katis',
      'Sungai Selan',
    ],
  },
  {
    name: 'Kabupaten Bangka Selatan',
    type: 'Kabupaten',
    subdistricts: [
      'Airgegas',
      'Kepulauan Pongok',
      'Lepar Pongok',
      'Payung',
      'Pulau Besar',
      'Simpang Rimba',
      'Toboali',
      'Tukak Sadai',
    ],
  },
  {
    name: 'Kabupaten Belitung',
    type: 'Kabupaten',
    subdistricts: [
      'Badau',
      'Membalong',
      'Selat Nasik',
      'Sijuk',
      'Tanjung Pandan',
    ],
  },
  {
    name: 'Kabupaten Belitung Timur',
    type: 'Kabupaten',
    subdistricts: [
      'Damar',
      'Dendang',
      'Gantung',
      'Kelapa Kampit',
      'Manggar',
      'Renggiang (Simpang Renggiang)',
      'Simpang Pesak',
    ],
  },
];

// Flat list for fast searching and selection
export const ALL_SUBDISTRICTS: Subdistrict[] = BANGKA_BELITUNG_REGENCIES.flatMap((reg) =>
  reg.subdistricts.map((sub) => ({
    id: `${reg.name}-${sub}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: sub,
    regency: reg.name,
  }))
);
