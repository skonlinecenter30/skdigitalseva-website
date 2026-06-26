import React from 'react';
import { ArrowLeft, Shield, Award, Users, Phone, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AboutPageProps { onNavigate: (page: string) => void; }

export default function AboutPage({ onNavigate }: AboutPageProps) {
  const { language } = useAuth();
  const kn = language === 'kn';

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <button onClick={()=>onNavigate('home')} className="flex items-center gap-2 text-slate-500 hover:text-gov-main mb-8 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4"/>
          {kn?'ಹೋಮ್‌ಗೆ ಹಿಂದಿರುಗಿ':'Back to Home'}
        </button>

        {/* Hero */}
        <div className="bg-gradient-to-br from-gov-main to-gov-dark rounded-3xl p-8 md:p-12 text-white mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"/>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
              <Shield className="w-4 h-4 text-green-300"/>
              SK Digital Seva
            </div>
            <h1 className={`text-3xl md:text-4xl font-extrabold mb-4 ${kn?'font-kn':''}`}>
              {kn?'ನಮ್ಮ ಬಗ್ಗೆ':'About Us'}
            </h1>
            <p className={`text-green-100 text-lg leading-relaxed max-w-2xl ${kn?'font-kn':''}`}>
              {kn
                ?'SK Digital Seva ಕರ್ನಾಟಕ ಗ್ರಾಮ ಪಂಚಾಯತ್ ಆಸ್ತಿ ದಾಖಲೆಗಳ ಇ-ಸ್ವತ್ತು 2.0 ಅರ್ಜಿಗಳಿಗೆ ಸಹಾಯ ಮಾಡುವ ಸ್ವತಂತ್ರ ಸೇವಾ ಕೇಂದ್ರ.'
                :'SK Digital Seva is an independent service center helping citizens with e-Swathu 2.0 applications for Karnataka Gram Panchayat property documents.'}
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="card p-7 mb-6">
          <h2 className={`text-xl font-bold text-slate-900 mb-4 ${kn?'font-kn':''}`}>
            {kn?'ನಮ್ಮ ಉದ್ದೇಶ':'Our Mission'}
          </h2>
          <p className={`text-slate-600 leading-relaxed ${kn?'font-kn':''}`}>
            {kn
              ?'ಗ್ರಾಮ ಪಂಚಾಯತ್ ವ್ಯಾಪ್ತಿಯ ಆಸ್ತಿ ಮಾಲೀಕರಿಗೆ ಇ-ಸ್ವತ್ತು 2.0 ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಸರಳ, ವೇಗ ಮತ್ತು ಪ್ರಾಮಾಣಿಕವಾಗಿ ಮಾಡುವುದು ನಮ್ಮ ಉದ್ದೇಶ. ಪ್ರತಿ ಗ್ರಾಹಕನೂ ಸರ್ಕಾರ ಕಚೇರಿ ಅಲೆದಾಡದೆ ಮನೆಯಿಂದಲೇ ಸೇವೆ ಪಡೆಯಬೇಕು ಎಂದು ನಾವು ನಂಬುತ್ತೇವೆ.'
              :'Our mission is to make the e-Swathu 2.0 application process simple, fast and transparent for property owners in Gram Panchayat areas. We believe every citizen should be able to access government services from home without running to offices.'}
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {[
            { icon: Shield, titleKn:'ವಿಶ್ವಾಸಾರ್ಹತೆ', titleEn:'Trustworthy', descKn:'ನಾವು ಪ್ರಾಮಾಣಿಕ ಮತ್ತು ಪಾರದರ್ಶಕ ಸೇವೆ ನೀಡುತ್ತೇವೆ.', descEn:'We provide honest and transparent service at all times.' },
            { icon: Award, titleKn:'ಗುಣಮಟ್ಟ', titleEn:'Quality', descKn:'170+ ಯಶಸ್ವಿ ಅರ್ಜಿಗಳ ಅನುಭವ ಹೊಂದಿದ್ದೇವೆ.', descEn:'We have experience of 170+ successful applications.' },
            { icon: Users, titleKn:'ಗ್ರಾಹಕ ಸೇವೆ', titleEn:'Customer Service', descKn:'WhatsApp ಮೂಲಕ ಸದಾ ಸಹಾಯಕ್ಕೆ ಸಿದ್ಧ.', descEn:'Always ready to help via WhatsApp support.' },
          ].map((v,i)=>(
            <div key={i} className="card p-6 text-center">
              <div className="w-12 h-12 bg-gov-pale rounded-2xl flex items-center justify-center mx-auto mb-4">
                <v.icon className="w-6 h-6 text-gov-main"/>
              </div>
              <h3 className={`font-bold text-slate-900 mb-2 ${kn?'font-kn':''}`}>{kn?v.titleKn:v.titleEn}</h3>
              <p className={`text-slate-500 text-sm ${kn?'font-kn':''}`}>{kn?v.descKn:v.descEn}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-gov-main to-gov-mid rounded-2xl p-6 text-white mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              {v:'170+', l:kn?'ಯಶಸ್ವಿ ಅರ್ಜಿ':'Applications'},
              {v:'99%',  l:kn?'ಯಶಸ್ಸಿನ ದರ':'Success Rate'},
              {v:'6',    l:kn?'ಸೇವೆ ವಿಧ':'Services'},
              {v:'24/7', l:'WhatsApp'},
            ].map((s,i)=>(
              <div key={i}>
                <div className="text-3xl font-extrabold">{s.v}</div>
                <div className={`text-green-200 text-sm mt-1 ${kn?'font-kn':''}`}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-amber-800 mb-2">Disclaimer</h3>
          <p className="text-amber-700 text-sm leading-relaxed">
            SK Digital Seva is an independent service provider helping citizens with online documentation and application assistance services. <strong>We are not affiliated with Karnataka Government.</strong> All government fees are separate from our service charges.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button onClick={()=>onNavigate('apply')} className="btn-primary px-8 py-3.5 text-base">
            {kn?'ಅರ್ಜಿ ಸಲ್ಲಿಸಿ':'Apply Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
