import React, { useState } from 'react';
import { Search, CheckCircle, Clock, XCircle, ArrowLeft, AlertCircle, Phone } from 'lucide-react';
import { supabase, Application, SERVICE_INFO, STATUS_META, AppStatus, ServiceType } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface TrackPageProps { onNavigate: (page: string) => void; }

export default function TrackPage({ onNavigate }: TrackPageProps) {
  const { language } = useAuth();
  const kn = language === 'kn';

  const [searchBy, setSearchBy] = useState<'app_number'|'phone'>('app_number');
  const [query, setQuery] = useState('');
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!query.trim()) return;
    setLoading(true); setNotFound(false); setError(''); setApps([]);

    let queryBuilder = supabase.from('applications').select('*');
    if(searchBy==='app_number'){
      queryBuilder = queryBuilder.eq('application_number', query.trim().toUpperCase());
    } else {
      queryBuilder = queryBuilder.eq('applicant_phone', query.trim());
    }

    const {data, error: fetchErr} = await queryBuilder.order('created_at',{ascending:false});
    setLoading(false);
    if(fetchErr){ setError(fetchErr.message); return; }
    if(!data || data.length===0){ setNotFound(true); return; }
    setApps(data);
  };

  const timelineSteps = [
    { key:'submitted',         labelKn:'ಅರ್ಜಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ',  labelEn:'Application Received' },
    { key:'documents_pending', labelKn:'ದಾಖಲೆ ಪರಿಶೀಲನೆ ಬಾಕಿ',   labelEn:'Documents Pending' },
    { key:'under_review',      labelKn:'ದಾಖಲೆ ಪರಿಶೀಲನೆ ನಡೆಯುತ್ತಿದೆ', labelEn:'Under Verification' },
    { key:'processing',        labelKn:'ಸರ್ಕಾರ ಪ್ರಕ್ರಿಯೆ',        labelEn:'Government Processing' },
    { key:'completed',         labelKn:'ಪ್ರಮಾಣ ಪತ್ರ ತಯಾರು',       labelEn:'Certificate Ready' },
  ];

  const getTimelineStep = (status: AppStatus) => STATUS_META[status]?.step || 0;

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <button onClick={()=>onNavigate('home')} className="flex items-center gap-2 text-slate-500 hover:text-gov-main mb-6 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4"/>
          {kn?'ಹೋಮ್‌ಗೆ ಹಿಂದಿರುಗಿ':'Back to Home'}
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-gradient-to-br from-gov-main to-gov-dark rounded-2xl items-center justify-center shadow-lg mb-4">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-3xl font-bold text-slate-900 mb-2 ${kn?'font-kn':''}`}>
            {kn?'ಅರ್ಜಿ ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕ್':'Track Application Status'}
          </h1>
          <p className={`text-slate-500 ${kn?'font-kn':''}`}>
            {kn?'ನಿಮ್ಮ ಇ-ಸ್ವತ್ತು ಅರ್ಜಿ ಪ್ರಗತಿ ಪರಿಶೀಲಿಸಿ':'Check your e-Swathu application progress'}
          </p>
        </div>

        {/* Search card */}
        <div className="card p-6 mb-6">
          {/* Search by toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={()=>setSearchBy('app_number')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${searchBy==='app_number'?'bg-gov-main text-white shadow-md':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {kn?'ಅರ್ಜಿ ಸಂಖ್ಯೆ':'Application ID'}
            </button>
            <button
              onClick={()=>setSearchBy('phone')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${searchBy==='phone'?'bg-gov-main text-white shadow-md':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {kn?'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ':'Mobile Number'}
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type={searchBy==='phone'?'tel':'text'}
              className="input-field flex-1"
              placeholder={searchBy==='app_number'?'SKDS-2024-001234':(kn?'10 ಅಂಕಿ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ':'10-digit mobile number')}
              value={query}
              onChange={e=>setQuery(e.target.value)}
            />
            <button type="submit" disabled={loading} className="btn-primary px-5 whitespace-nowrap">
              <Search className="w-4 h-4" />
              {loading?(kn?'ಹುಡುಕಲಾಗುತ್ತಿದೆ...':'Searching...'):(kn?'ಟ್ರ್ಯಾಕ್':'Track')}
            </button>
          </form>

          {/* Status legend */}
          <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-2">
            {timelineSteps.map((s,i)=>(
              <div key={i} className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                  i===0?'bg-blue-500':i===1?'bg-yellow-500':i===2?'bg-purple-500':i===3?'bg-orange-500':'bg-green-500'
                }`} />
                <div className={`text-xs text-slate-500 ${kn?'font-kn':''}`}>{kn?s.labelKn:s.labelEn}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl mb-4 text-sm"><AlertCircle className="w-4 h-4"/>{error}</div>}

        {/* Not found */}
        {notFound && (
          <div className="card p-8 text-center">
            <XCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className={`font-bold text-slate-700 mb-1 ${kn?'font-kn':''}`}>
              {kn?'ಅರ್ಜಿ ಕಂಡುಬಂದಿಲ್ಲ':'No Application Found'}
            </h3>
            <p className={`text-slate-500 text-sm mb-4 ${kn?'font-kn':''}`}>
              {kn?'ದಯವಿಟ್ಟು ಸರಿಯಾದ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ ಅಥವಾ SK Digital Seva ಸಂಪರ್ಕಿಸಿ.':'Please enter the correct number or contact SK Digital Seva.'}
            </p>
            <a href="tel:6360248020" className="btn-primary justify-center">
              <Phone className="w-4 h-4"/>
              {kn?'ಸಹಾಯಕ್ಕೆ ಕರೆ ಮಾಡಿ':'Call for Help'}
            </a>
          </div>
        )}

        {/* Results */}
        {apps.map(app => {
          const meta = STATUS_META[app.status as AppStatus];
          const svcInfo = SERVICE_INFO[app.service_type as ServiceType];
          const currentStep = getTimelineStep(app.status as AppStatus);
          return (
            <div key={app.id} className="card p-7 mb-4 animate-fade-in">
              {/* Status banner */}
              <div className={`flex items-center gap-3 p-4 rounded-xl mb-5 ${
                app.status==='completed'?'bg-green-50 border border-green-200':
                app.status==='rejected'?'bg-red-50 border border-red-200':
                'bg-gov-pale border border-gov-main/20'
              }`}>
                {app.status==='completed'
                  ? <CheckCircle className="w-6 h-6 text-gov-main"/>
                  : app.status==='rejected'
                  ? <XCircle className="w-6 h-6 text-red-500"/>
                  : <Clock className="w-6 h-6 text-gov-main"/>}
                <div>
                  <div className={`font-bold ${app.status==='completed'?'text-gov-main':app.status==='rejected'?'text-red-600':'text-gov-dark'} ${kn?'font-kn':''}`}>
                    {kn?meta?.labelKn:meta?.labelEn}
                  </div>
                  <div className="text-xs text-slate-500">{kn?'ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ':'Current Status'}</div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-5">
                {[
                  { l: kn?'ಅರ್ಜಿ ಸಂಖ್ಯೆ':'Application No', v: app.application_number, bold: true },
                  { l: kn?'ಸೇವೆ':'Service',        v: svcInfo?(kn?svcInfo.labelKn:svcInfo.labelEn):'—' },
                  { l: kn?'ಅರ್ಜಿದಾರ':'Applicant',  v: app.applicant_name },
                  { l: kn?'ಜಿಲ್ಲೆ':'District',     v: app.district||'—' },
                  { l: kn?'ಗ್ರಾಮ ಪಂಚಾಯತ್':'Gram Panchayat', v: app.gram_panchayat||'—' },
                  { l: kn?'ಸರ್ವೆ ಸಂಖ್ಯೆ':'Survey Number', v: app.survey_number||'—' },
                  { l: kn?'ಸಲ್ಲಿಸಿದ ದಿನಾಂಕ':'Submitted', v: new Date(app.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) },
                ].map((row,i)=>(
                  <div key={i} className="flex justify-between items-start py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-500">{row.l}</span>
                    <span className={`text-sm font-semibold text-slate-800 text-right ml-4 ${row.bold?'text-gov-main font-extrabold':''} ${kn&&row.l!=='Application No'?'font-kn':''}`}>{row.v}</span>
                  </div>
                ))}
              </div>

              {/* Admin notes */}
              {app.admin_notes && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                  <div className="text-sm font-semibold text-blue-800 mb-1">{kn?'ಸಂದೇಶ':'Message from SK Digital Seva'}</div>
                  <p className="text-sm text-blue-700">{app.admin_notes}</p>
                </div>
              )}

              {/* Timeline */}
              {app.status!=='rejected' && (
                <div>
                  <h3 className={`font-semibold text-slate-700 mb-3 text-sm ${kn?'font-kn':''}`}>
                    {kn?'ಅರ್ಜಿ ಪ್ರಗತಿ':'Application Progress'}
                  </h3>
                  <div className="space-y-2">
                    {timelineSteps.map((ts,i)=>(
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          i<currentStep?'bg-gov-main':i===currentStep-1?'bg-gov-mid ring-2 ring-gov-main ring-offset-2':'bg-slate-200'
                        }`}>
                          {i<currentStep&&<CheckCircle className="w-3.5 h-3.5 text-white"/>}
                        </div>
                        <span className={`text-sm ${i<currentStep?'text-slate-800 font-medium':i===currentStep-1?'text-gov-main font-semibold':'text-slate-400'} ${kn?'font-kn':''}`}>
                          {kn?ts.labelKn:ts.labelEn}
                        </span>
                        {i===currentStep-1 && <span className="text-xs text-gov-main font-semibold bg-gov-pale px-2 py-0.5 rounded-full">{kn?'ಈಗ':'Now'}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Help */}
        <div className="mt-4 card p-5 flex items-start gap-4">
          <Phone className="w-5 h-5 text-gov-main shrink-0 mt-0.5" />
          <div>
            <p className={`font-semibold text-slate-800 text-sm mb-0.5 ${kn?'font-kn':''}`}>
              {kn?'ಸಹಾಯ ಬೇಕೇ?':'Need Help?'}
            </p>
            <p className={`text-sm text-slate-500 ${kn?'font-kn':''}`}>
              {kn?'WhatsApp / ಕರೆ: 6360248020':'WhatsApp / Call: 6360248020'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
