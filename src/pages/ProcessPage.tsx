import React from 'react';
import { ArrowLeft, FileText, Upload, Shield, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SERVICE_INFO, ServiceType } from '../lib/supabase';

interface ProcessPageProps { onNavigate: (page: string) => void; }

export default function ProcessPage({ onNavigate }: ProcessPageProps) {
  const { language } = useAuth();
  const kn = language === 'kn';

  const steps = [
    {
      num: '01',
      icon: FileText,
      titleKn: 'ಆನ್‌ಲೈನ್ ಅರ್ಜಿ ಫಾರ್ಮ್ ಭರ್ತಿ',
      titleEn: 'Fill Online Application Form',
      descKn: 'ನಿಮ್ಮ ಹೆಸರು, ಮೊಬೈಲ್, ಜಿಲ್ಲೆ, ತಾಲ್ಲೂಕು, ಗ್ರಾಮ ಪಂಚಾಯತ್, ಸರ್ವೆ ಸಂಖ್ಯೆ ಮತ್ತು ಆಸ್ತಿ ವಿವರ ನಮೂದಿಸಿ.',
      descEn: 'Enter your name, mobile, district, taluk, gram panchayat, survey number and property details.',
      color: 'from-blue-500 to-blue-700',
    },
    {
      num: '02',
      icon: Upload,
      titleKn: 'ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      titleEn: 'Upload Required Documents',
      descKn: 'ಆಧಾರ್ ಕಾರ್ಡ್, ಆಸ್ತಿ ಫೋಟೋ, ಮತ್ತು ಆಯ್ಕೆ ಮಾಡಿದ ಸೇವೆಗೆ ಅಗತ್ಯವಾದ ದಾಖಲೆಗಳನ್ನು PDF/JPG ರೂಪದಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
      descEn: 'Upload Aadhaar card, property photo and other required documents in PDF/JPG format.',
      color: 'from-green-500 to-green-700',
    },
    {
      num: '03',
      icon: Shield,
      titleKn: 'SK Digital Seva ಪರಿಶೀಲನೆ',
      titleEn: 'Verification by SK Digital Seva',
      descKn: 'ನಮ್ಮ ತಂಡ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಕೊರತೆ ಇದ್ದರೆ WhatsApp ಮೂಲಕ ತಿಳಿಸುತ್ತೇವೆ.',
      descEn: 'Our team verifies the documents and notifies you via WhatsApp if anything is missing.',
      color: 'from-gov-main to-gov-dark',
    },
    {
      num: '04',
      icon: MessageSquare,
      titleKn: 'ಪ್ರಕ್ರಿಯೆ ಮತ್ತು WhatsApp ಮಾಹಿತಿ',
      titleEn: 'Processing & WhatsApp Updates',
      descKn: 'ಅರ್ಜಿ ಇ-ಸ್ವತ್ತು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಸಲ್ಲಿಸಲಾಗುತ್ತದೆ. ಪ್ರತಿ ಹಂತದ ಮಾಹಿತಿ WhatsApp ನಲ್ಲಿ ಸ್ವೀಕರಿಸುತ್ತೀರಿ.',
      descEn: 'Application is submitted on the e-Swathu portal. You receive updates at every step on WhatsApp.',
      color: 'from-teal-500 to-teal-700',
    },
  ];

  const serviceKeys = Object.keys(SERVICE_INFO) as ServiceType[];

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <button onClick={()=>onNavigate('home')} className="flex items-center gap-2 text-slate-500 hover:text-gov-main mb-8 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4"/>
          {kn?'ಹೋಮ್‌ಗೆ ಹಿಂದಿರುಗಿ':'Back to Home'}
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="section-tag mx-auto w-fit">e-Swathu 2.0</div>
          <h1 className={`section-heading ${kn?'font-kn':''}`}>
            {kn?'ಇ-ಸ್ವತ್ತು ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆ':'e-Swathu Application Process'}
          </h1>
          <p className={`section-sub ${kn?'font-kn':''}`}>
            {kn?'4 ಸರಳ ಹಂತಗಳಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ ಮತ್ತು ದಾಖಲೆ ಪಡೆಯಿರಿ':'Submit application and receive documents in 4 simple steps'}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-12">
          {steps.map((step,i)=>(
            <div key={i} className="card p-6 flex gap-5 items-start">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0 shadow-lg`}>
                <step.icon className="w-7 h-7 text-white"/>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-slate-400 font-mono">STEP {step.num}</span>
                  <div className="h-px flex-1 bg-slate-100"/>
                </div>
                <h3 className={`font-bold text-slate-900 text-lg mb-2 ${kn?'font-kn':''}`}>
                  {kn?step.titleKn:step.titleEn}
                </h3>
                <p className={`text-slate-500 text-sm leading-relaxed ${kn?'font-kn':''}`}>
                  {kn?step.descKn:step.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Documents required per service */}
        <div className="mb-12">
          <h2 className={`text-2xl font-bold text-slate-900 mb-6 text-center ${kn?'font-kn':''}`}>
            {kn?'ಸೇವೆ ಅನುಸಾರ ಅಗತ್ಯ ದಾಖಲೆಗಳು':'Required Documents by Service'}
          </h2>
          <div className="space-y-4">
            {serviceKeys.map(key=>{
              const s = SERVICE_INFO[key];
              return (
                <div key={key} className="card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{s.emoji}</span>
                    <div>
                      <h3 className={`font-bold text-slate-900 ${kn?'font-kn':''}`}>{kn?s.labelKn:s.labelEn}</h3>
                      <span className="text-gov-main font-bold text-sm">{s.feeLabel}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(kn?s.docsKn:s.docsEn).map((d,i)=>(
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle className="w-4 h-4 text-gov-main shrink-0"/>
                        <span className={kn?'font-kn':''}>{d}</span>
                      </div>
                    ))}
                  </div>
                  {(kn?s.notesKn:[]).length>0 && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      {(kn?s.notesKn:[]).map((n,i)=>(
                        <div key={i} className={`text-xs text-amber-700 flex items-start gap-1 ${kn?'font-kn':''}`}>
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5"/>
                          <span>{n}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ / Tips */}
        <div className="bg-gov-pale border border-gov-main/20 rounded-2xl p-6 mb-8">
          <h3 className={`font-bold text-gov-dark mb-4 ${kn?'font-kn':''}`}>
            {kn?'ಮಹತ್ವದ ಮಾಹಿತಿ':'Important Tips'}
          </h3>
          <ul className="space-y-2">
            {[
              {kn:'GPS ಆಸ್ತಿ ಫೋಟೋ ಕಡ್ಡಾಯ - Google Maps ತೆರೆದು ಆಸ್ತಿ ಇರುವ ಜಾಗದ ಫೋಟೋ ತೆಗೆಯಿರಿ.', en:'GPS property photo is mandatory - take a photo with location enabled on your phone.'},
              {kn:'ಕಟ್ಟಡ ಇದ್ದರೆ ವಿದ್ಯುತ್ ಬಿಲ್ ಕಡ್ಡಾಯ. ಖಾಲಿ ನಿವೇಶನ ಇದ್ದರೆ ಅಗತ್ಯವಿಲ್ಲ.', en:'Electricity bill is mandatory if there is a building. Not required for vacant plots.'},
              {kn:'ದಾಖಲೆಗಳ ಸ್ಪಷ್ಟತೆ - ಫೋಟೋ ಸ್ಪಷ್ಟವಾಗಿ ಮತ್ತು ಓದಬಹುದಾಗಿರಬೇಕು.', en:'Document clarity - photos should be clear and readable.'},
              {kn:'WhatsApp: 6360248020 ಗೆ ದಾಖಲೆ ಕಳುಹಿಸಬಹುದು.', en:'You can also send documents to WhatsApp: 6360248020.'},
            ].map((t,i)=>(
              <li key={i} className={`flex items-start gap-2 text-sm text-gov-dark ${kn?'font-kn':''}`}>
                <CheckCircle className="w-4 h-4 text-gov-main shrink-0 mt-0.5"/>
                <span>{kn?t.kn:t.en}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center">
          <button onClick={()=>onNavigate('apply')} className="btn-primary px-8 py-3.5 text-base">
            {kn?'ಅರ್ಜಿ ಸಲ್ಲಿಸಿ':'Apply Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
