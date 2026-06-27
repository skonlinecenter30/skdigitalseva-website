import React from 'react';
import { FileText, Phone, Mail, Globe, MapPin, Shield, ExternalLink, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FooterProps { onNavigate: (page: string) => void; }

export default function Footer({ onNavigate }: FooterProps) {
  const { language } = useAuth();
  const kn = language === 'kn';

  const services = [
    { label: kn ? 'ಗ್ರಾಮ ಠಾಣಾ ಆಸ್ತಿ' : 'Gram Thana Asti' },
    { label: kn ? '11B ಆಸ್ತಿ' : '11B Asti' },
    { label: kn ? '94C ಆಸ್ತಿ' : '94C Asti' },
    { label: kn ? 'NA ಆಸ್ತಿ' : 'NA Property' },
    { label: kn ? 'Rehabilitation ಆಸ್ತಿ' : 'Rehabilitation Asti' },
    { label: kn ? 'EC ಪ್ರಮಾಣ ಪತ್ರ' : 'EC Certificate' },
  ];

  return (
    <footer className="bg-gov-dark text-white">
      {/* Gold top border */}
      <div className="h-1 bg-gold" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg leading-tight text-white">SK Digital Seva</div>
                <div className={`text-xs text-gold ${kn ? 'font-kn' : ''}`}>
                  {kn ? 'ಇ-ಸ್ವತ್ತು 2.0 ಸಹಾಯ' : 'e-Swathu 2.0 Assistance'}
                </div>
              </div>
            </div>
            <p className={`text-sm text-white/70 leading-relaxed mb-5 ${kn ? 'font-kn' : ''}`}>
              {kn
                ? 'ಕರ್ನಾಟಕ ಗ್ರಾಮ ಪಂಚಾಯತ್ ಆಸ್ತಿ ದಾಖಲೆಗಳ ಇ-ಸ್ವತ್ತು 2.0 ಅರ್ಜಿಗಳಿಗೆ ಸಂಪೂರ್ಣ ಸಹಾಯ ಕೇಂದ್ರ.'
                : 'Complete assistance center for Karnataka Gram Panchayat property e-Swathu 2.0 applications.'}
            </p>
            {/* WhatsApp Button */}
            <a href="https://wa.me/916360248020" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2.5 rounded-lg transition-all text-sm shadow-md hover:shadow-lg">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              <span className={kn ? 'font-kn' : ''}>{kn ? 'WhatsApp' : 'WhatsApp Us'}</span>
            </a>
          </div>

          {/* Services */}
          <div>
            <h3 className={`font-bold text-base mb-5 text-gold ${kn ? 'font-kn' : ''}`}>
              {kn ? 'ನಮ್ಮ ಸೇವೆಗಳು' : 'Our Services'}
            </h3>
            <ul className="space-y-2.5">
              {services.map((s, i) => (
                <li key={i}>
                  <button onClick={() => onNavigate('apply')} className={`text-sm text-white/70 hover:text-gold transition-colors text-left ${kn ? 'font-kn' : ''}`}>
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className={`font-bold text-base mb-5 text-gold ${kn ? 'font-kn' : ''}`}>
              {kn ? 'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು' : 'Quick Links'}
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: kn ? 'ಮುಖಪುಟ' : 'Home', page: 'home' },
                { label: kn ? 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿ' : 'Apply Now', page: 'apply' },
                { label: kn ? 'ಅರ್ಜಿ ಸ್ಥಿತಿ' : 'Track Status', page: 'track' },
                { label: kn ? 'ನಮ್ಮ ಬಗ್ಗೆ' : 'About Us', page: 'about' },
                { label: kn ? 'ಪ್ರಕ್ರಿಯೆ' : 'Process', page: 'process' },
                { label: kn ? 'ಸಂಪರ್ಕ' : 'Contact', page: 'home' },
              ].map((l, i) => (
                <li key={i}>
                  <button onClick={() => onNavigate(l.page)} className={`text-sm text-white/70 hover:text-gold transition-colors ${kn ? 'font-kn' : ''}`}>
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className={`font-bold text-base mb-5 text-gold ${kn ? 'font-kn' : ''}`}>
              {kn ? 'ಸಂಪರ್ಕ ವಿವರ' : 'Contact Us'}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a href="tel:6360248020" className="hover:text-white transition-colors">6360248020</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <a href="mailto:info@skdigitalseva.in" className="hover:text-white transition-colors">info@skdigitalseva.in</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Globe className="w-4 h-4 text-gold shrink-0" />
                <span className={kn ? 'font-kn' : ''}>www.skdigitalseva.in</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-gold/20">
              <p className={`text-xs text-white/60 ${kn ? 'font-kn' : ''}`}>
                {kn ? 'ಕಾರ್ಯ ಸಮಯ: ಸೋಮ-ಶನಿ, ಬೆ.9 - ರಾ.6' : 'Working Hours: Mon-Sat, 9AM-6PM'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-gold/20 bg-gov-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <p className={`text-xs text-white/60 text-center leading-relaxed ${kn ? 'font-kn' : ''}`}>
            <strong className="text-gold">{kn ? 'ಸೂಚನೆ:' : 'Disclaimer:'}</strong>
            {kn
              ? ' SK Digital Seva ಒಂದು ಸ್ವತಂತ್ರ ಸೇವಾ ಪೂರೈಕೆದಾರವಾಗಿದೆ. ನಾವು ಕರ್ನಾಟಕ ಸರ್ಕಾರದೊಂದಿಗೆ ಸಂಬಂಧ ಹೊಂದಿಲ್ಲ.'
              : ' SK Digital Seva is an independent service provider helping citizens with online documentation. We are not affiliated with Karnataka Government.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-3">
            <p className="text-xs text-white/40">
              &copy; 2024 SK Digital Seva | SKDigitalSeva.in | All rights reserved.
            </p>
            {/* Subtle Admin Link */}
            <button
              onClick={() => onNavigate('admin-login')}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors group"
            >
              <Lock className="w-3 h-3 group-hover:text-gold transition-colors" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
