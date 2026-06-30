import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import HomePage from './pages/HomePage';
import CustomerLogin from './pages/CustomerLogin';
import AdminLogin from './pages/AdminLogin';
import ApplyPage from './pages/ApplyPage';
import TrackPage from './pages/TrackPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AboutPage from './pages/AboutPage';
import ProcessPage from './pages/ProcessPage';

// Detect URL path
function getInitialPage(): string {
  const path = window.location.pathname;
  if (path === '/admin' || path === '/admin/') return 'admin-login';
  if (path === '/admin/dashboard') return 'admin';
  if (path === '/dashboard') return 'dashboard';
  if (path === '/login') return 'login';
  if (path === '/apply') return 'apply';
  if (path === '/track') return 'track';
  if (path === '/about') return 'about';
  if (path === '/process') return 'process';
  return 'home';
}

function AppContent() {
  const { loading, isAdmin, isCustomer } = useAuth();
  const [page, setPage] = useState(getInitialPage);
  const [selectedService, setSelectedService] = useState<string | undefined>();

  // Keep /admin URL in sync
  useEffect(() => {
    if (page === 'admin-login' || page === 'admin') {
      window.history.replaceState(null, '', '/admin');
    } else if (window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/');
    }
  }, [page]);

  // After admin logs in, redirect to admin dashboard
  useEffect(() => {
    if (isAdmin && page === 'admin-login') {
      setPage('admin');
    }
  }, [isAdmin]);

  // After customer logs in, redirect to dashboard
  useEffect(() => {
    if (isCustomer && page === 'login') {
      setPage('dashboard');
    }
  }, [isCustomer]);

  const navigate = (p: string, svc?: string) => {
    setPage(p);
    setSelectedService(svc);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-gov-pale border-t-gov-main rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-medium">SK Digital Seva</p>
        </div>
      </div>
    );
  }

  // Admin-only pages: full-screen, no public navbar/footer
  if (page === 'admin-login') {
    return <AdminLogin onNavigate={navigate} />;
  }
  if (page === 'admin') {
    return <AdminDashboard onNavigate={navigate} />;
  }

  const renderPage = () => {
    switch (page) {
      case 'login':     return <CustomerLogin onNavigate={navigate} />;
      case 'apply':     return <ApplyPage defaultService={selectedService} onNavigate={navigate} />;
      case 'track':     return <TrackPage onNavigate={navigate} />;
      case 'dashboard': return <Dashboard onNavigate={navigate} />;
      case 'about':     return <AboutPage onNavigate={navigate} />;
      case 'process':   return <ProcessPage onNavigate={navigate} />;
      default:          return <HomePage onNavigate={navigate} />;
    }
  };

  const noFooter = page === 'login';

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Navbar currentPage={page} onNavigate={navigate} />
      <main className="flex-1">{renderPage()}</main>
      {!noFooter && <Footer onNavigate={navigate} />}
      <WhatsAppFloat />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
