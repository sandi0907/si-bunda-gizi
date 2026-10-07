import React, { useState, useEffect } from 'react';
import { Navbar, PageId } from './components/Navbar';
import { Footer } from './components/Footer';
import { WelcomePopup } from './components/WelcomePopup';
import { HomeView } from './views/HomeView';
import { GiziSehatView } from './views/GiziSehatView';
import { PanduanKmsView } from './views/PanduanKmsView';
import { ResepMpasiView } from './views/ResepMpasiView';
import { AdminDashboardView } from './views/AdminDashboardView';
import {
  getCurrentUser,
  getRecipes,
  getSiteSettings,
  getVideos,
  getVisitors,
  isAdminAuthenticated,
  saveRecipes,
  saveSiteSettings,
  saveVideos,
  setAdminAuthenticated,
  setCurrentUser,
} from './utils/storage';
import {
  MpasiRecipe,
  SiteSettings,
  VideoItem,
  VisitorRecord,
} from './data/initialContent';

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<PageId>('home');

  // User & Admin Auth State
  const [currentUser, setCurrentUserState] = useState<VisitorRecord | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isWelcomePopupOpen, setIsWelcomePopupOpen] = useState<boolean>(false);

  // App Content State
  const [settings, setSettings] = useState<SiteSettings>(getSiteSettings());
  const [videos, setVideos] = useState<VideoItem[]>(getVideos());
  const [recipes, setRecipes] = useState<MpasiRecipe[]>(getRecipes());
  const [visitors, setVisitors] = useState<VisitorRecord[]>(getVisitors());

  // Initialization
  useEffect(() => {
    const existingUser = getCurrentUser();
    const adminAuth = isAdminAuthenticated();

    if (existingUser) {
      setCurrentUserState(existingUser);
    }
    if (adminAuth) {
      setIsAdmin(true);
    }

    // If visitor is neither registered nor admin, show the welcome pop-up automatically
    if (!existingUser && !adminAuth) {
      setIsWelcomePopupOpen(true);
    }
  }, []);

  // Handlers for State Updates
  const handleUpdateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    saveSiteSettings(newSettings);
  };

  const handleUpdateVideos = (newVideos: VideoItem[]) => {
    setVideos(newVideos);
    saveVideos(newVideos);
  };

  const handleUpdateRecipes = (newRecipes: MpasiRecipe[]) => {
    setRecipes(newRecipes);
    saveRecipes(newRecipes);
  };

  const handleUserRegistered = (newUser: VisitorRecord) => {
    setCurrentUserState(newUser);
    setVisitors(getVisitors());
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setAdminAuthenticated(true);
    setCurrentPage('admin');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminAuthenticated(false);
    if (currentPage === 'admin') {
      setCurrentPage('home');
    }
  };

  const handleOpenProfileModal = () => {
    setIsWelcomePopupOpen(true);
  };

  const handleOpenAdminLogin = () => {
    if (isAdmin) {
      setCurrentPage('admin');
    } else {
      setIsWelcomePopupOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/60 text-stone-800 font-sans selection:bg-rose-200 selection:text-rose-900">
      {/* Welcome & District Registration Pop-up */}
      <WelcomePopup
        isOpen={isWelcomePopupOpen}
        onClose={() => setIsWelcomePopupOpen(false)}
        onAdminLoginSuccess={handleAdminLoginSuccess}
        onUserRegistered={handleUserRegistered}
      />

      {/* Main Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onOpenProfileModal={handleOpenProfileModal}
        isAdmin={isAdmin}
        onAdminLogout={handleAdminLogout}
        settings={settings}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-12">
        {currentPage === 'home' && (
          <HomeView
            onNavigate={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentUser={currentUser}
            settings={settings}
            isAdmin={isAdmin}
            onOpenAdminSettings={() => setCurrentPage('admin')}
            onOpenProfileModal={handleOpenProfileModal}
          />
        )}

        {currentPage === 'gizi-sehat' && (
          <GiziSehatView
            videos={videos}
            settings={settings}
            isAdmin={isAdmin}
            onOpenAdminSettings={() => setCurrentPage('admin')}
            currentUser={currentUser}
            onAddVideo={() => setCurrentPage('admin')}
            onEditVideo={() => setCurrentPage('admin')}
            onDeleteVideo={(id) => handleUpdateVideos(videos.filter((v) => v.id !== id))}
          />
        )}

        {currentPage === 'panduan-kms' && (
          <PanduanKmsView
            videos={videos}
            settings={settings}
            isAdmin={isAdmin}
            onOpenAdminSettings={() => setCurrentPage('admin')}
            currentUser={currentUser}
            onAddVideo={() => setCurrentPage('admin')}
            onEditVideo={() => setCurrentPage('admin')}
            onDeleteVideo={(id) => handleUpdateVideos(videos.filter((v) => v.id !== id))}
          />
        )}

        {currentPage === 'resep-mpasi' && (
          <ResepMpasiView
            recipes={recipes}
            settings={settings}
            isAdmin={isAdmin}
            onOpenAdminSettings={() => setCurrentPage('admin')}
            currentUser={currentUser}
            onAddRecipe={() => setCurrentPage('admin')}
            onEditRecipe={() => setCurrentPage('admin')}
            onDeleteRecipe={(id) => handleUpdateRecipes(recipes.filter((r) => r.id !== id))}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboardView
            visitors={visitors}
            onUpdateVisitors={(newVisitors) => setVisitors(newVisitors)}
            videos={videos}
            onUpdateVideos={handleUpdateVideos}
            recipes={recipes}
            onUpdateRecipes={handleUpdateRecipes}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onAdminLogout={handleAdminLogout}
          />
        )}
      </main>

      {/* Global Footer with Direct WhatsApp Contact */}
      <Footer
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdminLogin={handleOpenAdminLogin}
        settings={settings}
        currentUser={currentUser}
      />
    </div>
  );
}
