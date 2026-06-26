import React, { useState } from 'react';
import { Menu, X, Phone, Shield, LogOut, User, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { language, setLanguage, isCustomer, customerSession, customerSignOut } = useAuth();
  const kn = language === 'kn';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', labelKn: 'ಮುಖಪುಟ', labelEn: 'Home' },
    { id: 'about', labelKn: 'ನಮ್ಮ ಬಗ್ಗೆ', labelEn: 'About' },
    { id: 'process', labelKn: 'ಪ್ರಕ್ರಿಯೆ', labelEn: 'Process' },
    { id: 'track', labelKn: 'ಅರ್ಜಿ ಟ್ರ್ಯಾಕ್', labelEn: 'Track' },
    { id: 'apply', labelKn: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿ', labelEn: 'Apply' },
  ];

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    customerSignOut();
    onNavigate('home');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gov-main shadow-lg">
      {/* Top gold accent bar */}
      <div className="h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => handleNav('home')} className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Shield className="w-6 h-6 text-gov-main" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg text-white tracking-tight">SK Digital Seva</div>
              <div className={`text-xs text-gold ${kn ? 'font-kn' : ''}`}>
                {kn ? 'ಗ್ರಾಮ ಠಾಣಾ ಆಸ್ತಿ ಸೇವೆಗಳು' : 'Gram Thana Asti Services'}
              </div>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? 'bg-white/15 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                } ${kn ? 'font-kn' : ''}`}
              >
                {kn ? item.labelKn : item.labelEn}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'kn' ? 'en' : 'kn')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all border border-white/20"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'kn' ? 'EN' : 'ಕನ್'}</span>
            </button>

            {/* Customer Auth Section */}
            {isCustomer ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => handleNav('dashboard')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === 'dashboard'
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{customerSession?.full_name || 'Dashboard'}</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-red-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className={kn ? 'font-kn' : ''}>{kn ? 'ಲಾಗ್ ಔಟ್' : 'Logout'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('login')}
                className={`hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  currentPage === 'login'
                    ? 'bg-gold-dark text-white'
                    : 'bg-gold hover:bg-gold-dark text-white shadow-md hover:shadow-lg'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span className={kn ? 'font-kn' : ''}>{kn ? 'ಲಾಗಿನ್' : 'Login'}</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-3 bg-gov-main animate-in fade-in slide-in-from-top-2 duration-200">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? 'bg-white/15 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                } ${kn ? 'font-kn' : ''}`}
              >
                {kn ? item.labelKn : item.labelEn}
              </button>
            ))}

            <div className="px-4 pt-3 mt-3 border-t border-white/10">
              {isCustomer ? (
                <>
                  <button
                    onClick={() => handleNav('dashboard')}
                    className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium ${
                      currentPage === 'dashboard' ? 'bg-white/15 text-white' : 'text-white/80'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className={kn ? 'font-kn' : ''}>{kn ? 'ನನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : 'My Dashboard'}</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-red-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className={kn ? 'font-kn' : ''}>{kn ? 'ಲಾಗ್ ಔಟ್' : 'Logout'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleNav('login')}
                  className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold ${
                    currentPage === 'login'
                      ? 'bg-gold-dark text-white'
                      : 'bg-gold text-white'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span className={kn ? 'font-kn' : ''}>{kn ? 'ಲಾಗಿನ್' : 'Customer Login'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
