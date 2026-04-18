import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Loading from '../components/Loading';
import DailyPopup from '../components/DailyPopup';
import { Menu } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import './MainLayout.css';

const MainLayout = () => {
  const { perfil, isLoggedIn, loading, initAuth } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Initialize auth state from existing session on first mount
  useEffect(() => {
    initAuth();
  }, []);

  // Close mobile sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading while checking session
  if (loading) {
    return <Loading />;
  }

  // Guardian Interceptor
  if (!isLoggedIn) {
     return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout-container">
      {isMobileOpen && <div className="mobile-overlay animate-fade-in" onClick={() => setIsMobileOpen(false)}></div>}
      
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      <div className={`layout-content ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="mobile-header-toggle">
          <button className="icon-btn-small" onClick={() => setIsMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <h2 className="mobile-title">{perfil.tituloDaPlataforma} {perfil.cargo} {perfil.nome} {perfil.emoji}</h2>
        </div>
        <div className="desktop-header-wrapper">
          <Header />
        </div>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <DailyPopup />
    </div>
  );
};

export default MainLayout;
