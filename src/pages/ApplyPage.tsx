import React, { useState, useRef } from 'react';
import {
  ArrowLeft, CheckCircle, AlertCircle, Upload, X, FileText,
  ChevronRight, User, Home, Edit, FileDown, Download
} from 'lucide-react';
import { supabase, SERVICE_INFO, ServiceType, DISTRICTS_KA } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ApplyPageProps {
  defaultService?: string;
  onNavigate: (page: string) => void;
}

type Step = 'select' | 'form' | 'documents' | 'success';

export default function ApplyPage({ defaultService, onNavigate }: ApplyPageProps) {
  const { isCustomer, customerSession, language } = useAuth();
  const kn = language === 'kn';
  const serviceKeys = Object.keys(SERVICE_INFO) as ServiceType[];

  const [step, setStep] = useState<Step>(defaultService ? 'form' : 'select');
  const [svcType, setSvcType] = useState<ServiceType>((defaultService as ServiceType) || 'gram_thana');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appId, setAppId] = useState('');
  const [appNumber, setAppNumber] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    applicant_name:   customerSession?.full_name || '',
    applicant_phone:  customerSession?.phone || '',
    applicant_email:  '',
    whatsapp_number:  customerSession?.phone || '',
    district:         '',
    taluk:            '',
    gram_panchayat:   '',
    village_name:     '',
    survey_number:    '',
    property_number:  '',
    remarks:          '',
  });

  // Require customer login
  if (!isCustomer) {
    return (
      <div className="min-h-screen bg-cream pt-10 flex items-center justify-center px-4">
        <div className="text-center max-w-sm card p-8">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className={`text-xl font-bold text-slate-900 mb-2 ${kn?'font-kn':''}`}>
            {kn?'ಲಾಗಿನ್ ಅಗತ್ಯ':'Login Required'}
          </h2>
          <p className={`text-slate-500 mb-6 text-sm ${kn?'font-kn':''}`}>
            {kn?'ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಅಥವಾ ನೋಂದಣಿ ಮಾಡಿ.':'Please login or register to submit an application.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={()=>onNavigate('login')} className="btn-primary">{kn?'ಲಾಗಿನ್':'Login'}</button>
            <button onClick={()=>onNavigate('register')} className="btn-secondary">{kn?'ನೋಂದಣಿ':'Register'}</button>
          </div>
        </div>
      </div>
    );
  }

  const selectedInfo = SERVICE_INFO[svcType];

  const steps: Step[] = ['select','form','documents','success'];
  const stepLabels = kn
    ? ['ಸೇವೆ','ವಿವರ','ದಾಖಲೆ','ಪೂರ್ಣ']
    : ['Service','Details','Documents','Done'];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const {data, error: err} = await supabase.from('applications').insert({
      ...form, service_type: svcType,
      payment_amount: selectedInfo.fee,
      status: 'submitted',
    }).select().single();
    setLoading(false);
    if(err){ setError(err.message); return; }
    setAppId(data.id); setAppNumber(data.application_number);
    setStep('documents');
  };

  const handleDocUpload = async () => {
    if(files.length === 0){ setStep('success'); return; }
    setUploading(true);
    for(const f of files){
      const path = `customer/${customerSession?.phone || 'anon'}/${appId}/${Date.now()}_${f.name}`;
      const {error: upErr} = await supabase.storage.from('documents').upload(path, f, {upsert:false});
      if(!upErr){
        await supabase.from('documents').insert({
          application_id: appId, document_type:'uploaded',
          file_name: f.name, file_path: path, file_size: f.size, mime_type: f.type,
        });
      }
    }
    setUploading(false);
    setStep('success');
  };

  const stepIdx = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <button onClick={()=>onNavigate('home')} className="flex items-center gap-2 text-slate-500 hover:text-gov-main mb-6 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {kn?'ಹೋಮ್‌ಗೆ ಹಿಂದಿರುಗಿ':'Back to Home'}
        </button>

        {/* Progress */}
        {step !== 'select' && step !== 'success' && (
          <div className="flex items-center gap-1 mb-8">
            {(['form','documents'] as Step[]).map((s,i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 ${step===s?'text-gov-main':'text-slate-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step===s?'bg-gov-main text-white shadow-md':
                    (['form','documents'] as Step[]).indexOf(step)>i?'bg-success-500 text-white':'bg-slate-200 text-slate-500'
                  }`}>
                    {(['form','documents'] as Step[]).indexOf(step)>i ? <CheckCircle className="w-4 h-4"/> : i+1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${kn?'font-kn':''}`}>
                    {i===0?(kn?'ಅರ್ಜಿ ವಿವರ':'Application Details'):(kn?'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್':'Upload Documents')}
                  </span>
                </div>
                {i<1 && <div className={`flex-1 h-px mx-2 ${(['form','documents'] as Step[]).indexOf(step)>i?'bg-success-400':'bg-slate-200'}`}/>}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* SELECT SERVICE */}
        {step==='select' && (
          <div>
            <div className="text-center mb-8">
              <h1 className={`text-3xl font-bold text-slate-900 mb-2 ${kn?'font-kn':''}`}>
                {kn?'ಸೇವೆ ಆಯ್ಕೆ ಮಾಡಿ':'Select Service'}
              </h1>
              <p className={`text-slate-500 ${kn?'font-kn':''}`}>
                {kn?'ನಿಮ್ಮ ಆಸ್ತಿ ಸೇವೆ ಆಯ್ಕೆ ಮಾಡಿ ಮತ್ತು ಅರ್ಜಿ ಸಲ್ಲಿಸಿ':'Choose your property service and proceed'}
              </p>
            </div>
            <div className="space-y-3">
              {serviceKeys.map(key => {
                const s = SERVICE_INFO[key];
                return (
                  <button key={key} onClick={()=>{setSvcType(key);setStep('form');}}
                    className="card w-full text-left p-5 hover:border-gov-main border-2 border-transparent group transition-all">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl shrink-0">{s.emoji}</span>
                      <div className="flex-1">
                        <div className={`font-bold text-slate-900 group-hover:text-gov-main transition-colors ${kn?'font-kn':''}`}>
                          {kn?s.labelKn:s.labelEn}
                        </div>
                        <div className="text-sm text-slate-400 mt-0.5">
                          {kn?'ಸೇವಾ ಶುಲ್ಕ':'Service Charge'}: <span className="font-bold text-gov-main">{s.feeLabel}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-extrabold text-gov-main">{s.feeLabel}</span>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-gov-main group-hover:translate-x-0.5 transition-all"/>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* APPLICATION FORM */}
        {step==='form' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{selectedInfo.emoji}</span>
              <div>
                <h1 className={`text-2xl font-bold text-slate-900 ${kn?'font-kn':''}`}>
                  {kn?selectedInfo.labelKn:selectedInfo.labelEn}
                </h1>
                <p className="text-slate-500 text-sm">{kn?'ಸೇವಾ ಶುಲ್ಕ':'Service Charge'}: <span className="font-bold text-gov-main">{selectedInfo.feeLabel}</span></p>
              </div>
            </div>

            {/* Docs required card */}
            <div className="card p-5 mb-6 border-l-4 border-gov-main bg-gov-pale/50">
              <h3 className={`font-bold text-gov-dark mb-3 text-sm ${kn?'font-kn':''}`}>
                {kn?'ಅಗತ್ಯ ದಾಖಲೆಗಳು (ಮೊದಲೇ ಸಿದ್ಧಪಡಿಸಿ)':'Required Documents (Prepare in advance)'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {(kn?selectedInfo.docsKn:selectedInfo.docsEn).map((d,i) => (
                  <span key={i} className={`bg-white border border-gov-main/20 text-gov-dark text-xs px-3 py-1.5 rounded-full font-medium ${kn?'font-kn':''}`}>
                    ✓ {d}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="card p-7 space-y-5">
              {/* Applicant */}
              <div>
                <h2 className={`font-bold text-slate-700 text-base mb-4 pb-2 border-b ${kn?'font-kn':''}`}>
                  {kn?'ಅರ್ಜಿದಾರ ವಿವರ':'Applicant Details'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`label ${kn?'font-kn':''}`}>{kn?'ಪೂರ್ಣ ಹೆಸರು':'Full Name'} *</label>
                    <input type="text" required className="input-field" value={form.applicant_name} onChange={e=>setForm({...form,applicant_name:e.target.value})} />
                  </div>
                  <div>
                    <label className={`label ${kn?'font-kn':''}`}>{kn?'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ':'Mobile Number'} *</label>
                    <input type="tel" required className="input-field" placeholder="10-digit mobile" value={form.applicant_phone} onChange={e=>setForm({...form,applicant_phone:e.target.value})} />
                  </div>
                  <div>
                    <label className={`label ${kn?'font-kn':''}`}>{kn?'WhatsApp ಸಂಖ್ಯೆ':'WhatsApp Number'}</label>
                    <input type="tel" className="input-field" placeholder="WhatsApp number" value={form.whatsapp_number} onChange={e=>setForm({...form,whatsapp_number:e.target.value})} />
                  </div>
                  <div>
                    <label className={`label ${kn?'font-kn':''}`}>{kn?'ಇಮೇಲ್':'Email Address'}</label>
                    <input type="email" className="input-field" value={form.applicant_email} onChange={e=>setForm({...form,applicant_email:e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h2 className={`font-bold text-slate-700 text-base mb-4 pb-2 border-b ${kn?'font-kn':''}`}>
                  {kn?'ಆಸ್ತಿ ವಿಳಾಸ ವಿವರ':'Property Location Details'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`label ${kn?'font-kn':''}`}>{kn?'ಜಿಲ್ಲೆ':'District'} *</label>
                    <select required className="select-field" value={form.district} onChange={e=>setForm({...form,district:e.target.value})}>
                      <option value="">{kn?'ಜಿಲ್ಲೆ ಆಯ್ಕೆ ಮಾಡಿ':'Select District'}</option>
                      {DISTRICTS_KA.map(d=><option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`label ${kn?'font-kn':''}`}>{kn?'ತಾಲ್ಲೂಕು':'Taluk'} *</label>
                    <input type="text" required className="input-field" value={form.taluk} onChange={e=>setForm({...form,taluk:e.target.value})} />
                  </div>
                  <div>
                    <label className={`label ${kn?'font-kn':''}`}>{kn?'ಗ್ರಾಮ ಪಂಚಾಯತ್':'Gram Panchayat'} *</label>
                    <input type="text" required className="input-field" value={form.gram_panchayat} onChange={e=>setForm({...form,gram_panchayat:e.target.value})} />
                  </div>
                  <div>
                    <label className={`label ${kn?'font-kn':''}`}>{kn?'ಗ್ರಾಮ':'Village'} *</label>
                    <input type="text" required className="input-field" value={form.village_name} onChange={e=>setForm({...form,village_name:e.target.value})} />
                  </div>
                  <div>
                    <label className={`label ${kn?'font-kn':''}`}>{kn?'ಸರ್ವೆ ಸಂಖ್ಯೆ':'Survey Number'} *</label>
                    <input type="text" required className="input-field" value={form.survey_number} onChange={e=>setForm({...form,survey_number:e.target.value})} />
                  </div>
                  <div>
                    <label className={`label ${kn?'font-kn':''}`}>{kn?'ಆಸ್ತಿ ಸಂಖ್ಯೆ':'Property Number'}</label>
                    <input type="text" className="input-field" value={form.property_number} onChange={e=>setForm({...form,property_number:e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`label ${kn?'font-kn':''}`}>{kn?'ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿ':'Remarks'}</label>
                    <textarea rows={2} className="input-field resize-none" value={form.remarks} onChange={e=>setForm({...form,remarks:e.target.value})} />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4"/>{error}
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={()=>setStep('select')} className="btn-secondary flex-1">
                  {kn?'ಹಿಂದೆ':'Back'}
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading?(kn?'ಉಳಿಸಲಾಗುತ್ತಿದೆ...':'Saving...'):(kn?'ಮುಂದೆ: ದಾಖಲೆ ಅಪ್‌ಲೋಡ್':'Next: Upload Documents')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* DOCUMENTS */}
        {step==='documents' && (
          <div>
            <div className="text-center mb-6">
              <h1 className={`text-2xl font-bold text-slate-900 mb-2 ${kn?'font-kn':''}`}>
                {kn?'ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ':'Upload Documents'}
              </h1>
              <p className={`text-slate-500 text-sm ${kn?'font-kn':''}`}>
                {kn?'PDF, JPG, PNG ಫಾರ್ಮ್ಯಾಟ್ | ಗರಿಷ್ಠ 5MB ಪ್ರತಿ ಫೈಲ್':'PDF, JPG, PNG | Max 5MB each'}
              </p>
            </div>

            {/* Required docs reminder */}
            <div className="card p-4 mb-5 bg-gov-pale/60 border border-gov-main/20">
              <p className={`text-sm font-semibold text-gov-dark mb-2 ${kn?'font-kn':''}`}>
                {kn?`${selectedInfo.labelKn} ಗಾಗಿ ಅಗತ್ಯ ದಾಖಲೆಗಳು:`:`Documents required for ${selectedInfo.labelEn}:`}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(kn?selectedInfo.docsKn:selectedInfo.docsEn).map((d,i)=>(
                  <span key={i} className={`text-xs bg-white border border-gov-main/20 text-gov-dark px-2.5 py-1 rounded-full ${kn?'font-kn':''}`}>
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="card p-7">
              <div onClick={()=>fileRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-gov-main rounded-2xl p-10 text-center cursor-pointer transition-colors group">
                <Upload className="w-10 h-10 text-slate-300 group-hover:text-gov-main mx-auto mb-3 transition-colors" />
                <p className={`text-slate-600 font-medium ${kn?'font-kn':''}`}>
                  {kn?'ಫೈಲ್ ಡ್ರಾಪ್ ಮಾಡಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ':'Drop files or click to browse'}
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (max 5MB each)</p>
              </div>
              <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e=>setFiles(prev=>[...prev,...Array.from(e.target.files||[])])} />

              {files.length>0 && (
                <div className="mt-4 space-y-2">
                  {files.map((f,i)=>(
                    <div key={i} className="flex items-center justify-between bg-gov-pale px-4 py-3 rounded-xl">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gov-main" />
                        <div>
                          <div className="text-sm font-medium text-slate-800">{f.name}</div>
                          <div className="text-xs text-slate-400">{(f.size/1024/1024).toFixed(2)} MB</div>
                        </div>
                      </div>
                      <button onClick={()=>setFiles(prev=>prev.filter((_,j)=>j!==i))} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4"/>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={handleDocUpload} disabled={uploading} className="btn-secondary flex-1">
                  {kn?'ನಂತರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ':'Upload Later'}
                </button>
                <button onClick={handleDocUpload} disabled={uploading} className="btn-primary flex-1">
                  {uploading?(kn?'ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...':'Uploading...'):(kn?'ಸಲ್ಲಿಸಿ':'Submit Application')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {step==='success' && (
          <div className="text-center">
            <div className="card p-10 max-w-md mx-auto">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-gov-main" />
              </div>
              <h1 className={`text-2xl font-bold text-slate-900 mb-3 ${kn?'font-kn':''}`}>
                {kn?'ಅರ್ಜಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!':'Application Submitted Successfully!'}
              </h1>
              <p className={`text-slate-500 mb-5 text-sm ${kn?'font-kn':''}`}>
                {kn
                  ?'WhatsApp ಮೂಲಕ ಅರ್ಜಿ ನವೀಕರಣ ಸ್ವೀಕರಿಸುತ್ತೀರಿ. 7 ಕಾರ್ಯದಿನಗಳಲ್ಲಿ ಪ್ರಕ್ರಿಯೆ ಮಾಡಲಾಗುತ್ತದೆ.'
                  :'You will receive updates on WhatsApp. Processing within 7 working days.'}
              </p>
              <div className="bg-gov-pale rounded-2xl p-4 mb-6">
                <div className="text-xs text-slate-500 mb-1">{kn?'ಅರ್ಜಿ ಸಂಖ್ಯೆ':'Application Number'}</div>
                <div className="text-2xl font-extrabold text-gov-dark">{appNumber}</div>
              </div>
              <p className={`text-xs text-slate-400 mb-5 ${kn?'font-kn':''}`}>
                {kn?'ಈ ಸಂಖ್ಯೆ ಉಳಿಸಿಕೊಳ್ಳಿ - ಅರ್ಜಿ ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಬಳಸಿ':'Save this number to track your application status'}
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={()=>onNavigate('dashboard')} className="btn-primary">
                  {kn?'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್':'Dashboard'}
                </button>
                <button onClick={()=>onNavigate('track')} className="btn-secondary">
                  {kn?'ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕ್':'Track Status'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
