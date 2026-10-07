import {
  DEFAULT_SITE_SETTINGS,
  INITIAL_GIZI_VIDEOS,
  INITIAL_KMS_VIDEOS,
  INITIAL_MPASI_RECIPES,
  MpasiRecipe,
  SiteSettings,
  VideoItem,
  VisitorRecord,
} from '../data/initialContent';

const KEYS = {
  VISITORS: 'si_bunda_visitors_data',
  CURRENT_USER: 'si_bunda_active_user',
  SETTINGS: 'si_bunda_settings_data',
  VIDEOS: 'si_bunda_videos_data',
  RECIPES: 'si_bunda_recipes_data',
  ADMIN_AUTH: 'si_bunda_admin_authenticated',
};

// Seed initial visitor demo data if empty to show representative Babel statistics
const INITIAL_DEMO_VISITORS: VisitorRecord[] = [
  {
    id: 'vis-1',
    name: 'Bunda Fitri',
    subdistrict: 'Sungailiat',
    regency: 'Kabupaten Bangka',
    targetCategory: 'Ibu Balita (6-23 Bulan)',
    childAgeMonths: 9,
    visitedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    timestampFormatted: 'Hari ini, 10:15 WIB',
    syncedToGoogleSheets: true,
  },
  {
    id: 'vis-2',
    name: 'Bunda Rini',
    subdistrict: 'Gerunggang',
    regency: 'Kota Pangkalpinang',
    targetCategory: 'Ibu Balita (0-6 Bulan)',
    childAgeMonths: 4,
    visitedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    timestampFormatted: 'Hari ini, 07:40 WIB',
    syncedToGoogleSheets: true,
  },
  {
    id: 'vis-3',
    name: 'Bunda Nurul',
    subdistrict: 'Koba',
    regency: 'Kabupaten Bangka Tengah',
    targetCategory: 'Ibu Balita (6-23 Bulan)',
    childAgeMonths: 14,
    visitedAt: new Date(Date.now() - 86400000).toISOString(),
    timestampFormatted: 'Kemarin, 14:20 WIB',
    syncedToGoogleSheets: true,
  },
  {
    id: 'vis-4',
    name: 'Bunda Septi',
    subdistrict: 'Toboali',
    regency: 'Kabupaten Bangka Selatan',
    targetCategory: 'Ibu Balita (24-59 Bulan)',
    childAgeMonths: 30,
    visitedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    timestampFormatted: '2 hari lalu, 09:10 WIB',
    syncedToGoogleSheets: true,
  },
  {
    id: 'vis-5',
    name: 'Bunda Ayu Lestari',
    subdistrict: 'Tanjung Pandan',
    regency: 'Kabupaten Belitung',
    targetCategory: 'Ibu Hamil',
    visitedAt: new Date(Date.now() - 86400000 * 2.5).toISOString(),
    timestampFormatted: '2 hari lalu, 16:30 WIB',
    syncedToGoogleSheets: true,
  },
  {
    id: 'vis-6',
    name: 'Bunda Wahyuni',
    subdistrict: 'Manggar',
    regency: 'Kabupaten Belitung Timur',
    targetCategory: 'Ibu Balita (6-23 Bulan)',
    childAgeMonths: 11,
    visitedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    timestampFormatted: '3 hari lalu, 11:05 WIB',
    syncedToGoogleSheets: true,
  },
];

export const getSiteSettings = (): SiteSettings => {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) return DEFAULT_SITE_SETTINGS;
    return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
};

export const saveSiteSettings = (settings: SiteSettings): void => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
};

export const getVideos = (): VideoItem[] => {
  try {
    const raw = localStorage.getItem(KEYS.VIDEOS);
    if (!raw) {
      const initial = [...INITIAL_GIZI_VIDEOS, ...INITIAL_KMS_VIDEOS];
      localStorage.setItem(KEYS.VIDEOS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [...INITIAL_GIZI_VIDEOS, ...INITIAL_KMS_VIDEOS];
  }
};

export const saveVideos = (videos: VideoItem[]): void => {
  try {
    localStorage.setItem(KEYS.VIDEOS, JSON.stringify(videos));
  } catch (err) {
    console.error('Failed to save videos:', err);
  }
};

export const getRecipes = (): MpasiRecipe[] => {
  try {
    const raw = localStorage.getItem(KEYS.RECIPES);
    if (!raw) {
      localStorage.setItem(KEYS.RECIPES, JSON.stringify(INITIAL_MPASI_RECIPES));
      return INITIAL_MPASI_RECIPES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MPASI_RECIPES;
  }
};

export const saveRecipes = (recipes: MpasiRecipe[]): void => {
  try {
    localStorage.setItem(KEYS.RECIPES, JSON.stringify(recipes));
  } catch (err) {
    console.error('Failed to save recipes:', err);
  }
};

export const getVisitors = (): VisitorRecord[] => {
  try {
    const raw = localStorage.getItem(KEYS.VISITORS);
    if (!raw) {
      localStorage.setItem(KEYS.VISITORS, JSON.stringify(INITIAL_DEMO_VISITORS));
      return INITIAL_DEMO_VISITORS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_VISITORS;
  }
};

export const addVisitor = async (
  record: Omit<VisitorRecord, 'id' | 'visitedAt' | 'timestampFormatted' | 'syncedToGoogleSheets'>
): Promise<VisitorRecord> => {
  const current = getVisitors();
  const now = new Date();
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(now);

  const newVisitor: VisitorRecord = {
    ...record,
    id: `vis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    visitedAt: now.toISOString(),
    timestampFormatted: `${formattedDate} WIB`,
    syncedToGoogleSheets: false,
  };

  // Attempt sync to Google Sheets webhook if configured
  const settings = getSiteSettings();
  if (settings.googleSheetsWebhookUrl && settings.googleSheetsWebhookUrl.trim().startsWith('http')) {
    try {
      await fetch(settings.googleSheetsWebhookUrl, {
        method: 'POST',
        mode: 'no-cors', // standard for Google Apps Script Webhook
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add_visitor',
          nama: newVisitor.name,
          kecamatan: newVisitor.subdistrict,
          kabupaten: newVisitor.regency,
          provinsi: 'Kepulauan Bangka Belitung',
          waktu: newVisitor.timestampFormatted,
          timestamp: newVisitor.visitedAt,
        }),
      });
      newVisitor.syncedToGoogleSheets = true;
    } catch (e) {
      console.warn('Webhook sync error (silent):', e);
    }
  }

  const updated = [newVisitor, ...current];
  localStorage.setItem(KEYS.VISITORS, JSON.stringify(updated));
  return newVisitor;
};

export const getCurrentUser = (): VisitorRecord | null => {
  try {
    const raw = localStorage.getItem(KEYS.CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: VisitorRecord | null): void => {
  try {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  } catch (err) {
    console.error('Failed to set current user:', err);
  }
};

export const isAdminAuthenticated = (): boolean => {
  return localStorage.getItem(KEYS.ADMIN_AUTH) === 'true';
};

export const setAdminAuthenticated = (val: boolean): void => {
  if (val) {
    localStorage.setItem(KEYS.ADMIN_AUTH, 'true');
  } else {
    localStorage.removeItem(KEYS.ADMIN_AUTH);
  }
};
