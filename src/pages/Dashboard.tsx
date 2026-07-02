import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Clock, CheckCircle, Plus, ArrowRight, RefreshCw,
  Search, MapPin, Phone, Upload, X, LogOut, ChevronDown, ChevronUp,
  Download, ExternalLink, AlertCircle, Calendar, Eye
} from 'lucide-react';
import { supabase, Application, SERVICE_INFO, STATUS_META, AppStatus, ServiceType } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Doc {
  id: string;
  document_name: string | null;
  document_type: string;
  file_name: string;
  file_path: string;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

interface DashboardProps { onNavigate: (page: string, svc?: string) => void; }

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { customerSession, isCustomer, customerSignOut, language } = useAuth();
  const kn = language === 'kn';

  const [apps, setApps] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<Record<string, Doc[]>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [viewingDocs, setViewingDocs] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadApps = async () => {
    if (!customerSession) return;
    setLoading(true);
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('applicant_phone', customerSession.phone)
      .order('created_at', { ascending: false });
    setApps(data || []);
    setLoading(false);
  };

  const loadDocuments = async (appId: string) => {
    const { data, error } = await supabase
      .from('documents')
      .select('id, document_name, document_type, file_name, file_path, file_url, file_size, mime_type, created_at')
      .eq('application_id', appId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error loading documents:', error.message);
      return;
    }
    if (data) {
      setDocuments(prev => ({ ...prev, [appId]: data }));
    }
  };

  useEffect(() => { loadApps(); }, [customerSession]);

  useEffect(() => {
    if (expandedApp) {
      loadDocuments(expandedApp);
    }
  }, [expandedApp]);

  if (!isCustomer) return (
    <div className="min-h-screen bg-cream pt-20 flex items-center justify-center">
      <div className="text-center card p-8">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className={`text-slate-500 mb-4 ${kn ? 'font-kn' : ''}`}>
          {kn ? 'ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ' : 'Please login to continue'}
        </p>
        <button onClick={() => onNavigate('login')} className="btn-primary">
          {kn ? 'ಲಾಗಿನ್' : 'Login'}
        </button>
      </div>
    </div>
  );

  const handleSignOut = () => {
    customerSignOut();
    onNavigate('home');
  };

  const handleUploadDocs = async (appId: string) => {
    if (uploadFiles.length === 0) return;
    setUploading(true);
    let successCount = 0;
    const errors: string[] = [];
    for (const f of uploadFiles) {
      const path = `customer/${customerSession!.phone}/${appId}/${Date.now()}_${f.name}`;
      const { error: upErr } = await supabase.storage.from('documents').upload(path, f, { upsert: false });
      if (upErr) {
        errors.push(`${f.name}: ${upErr.message}`);
        continue;
      }
      const { data: pubData } = supabase.storage.from('documents').getPublicUrl(path);
      const fileUrl = pubData?.publicUrl || '';
      const { error: dbErr } = await supabase.from('documents').insert({
        application_id: appId,
        document_name: f.name.replace(/\.[^.]+$/, ''),
        document_type: 'customer_upload',
        file_name: f.name,
        file_path: path,
        file_url: fileUrl,
        file_size: f.size,
        mime_type: f.type,
        user_id: null,
      });
      if (dbErr) {
        errors.push(`${f.name}: ${dbErr.message}`);
        continue;
      }
      successCount++;
    }
    setUploading(false);
    setUploadFiles([]);
    setUploadingFor(null);
    if (errors.length > 0) {
      alert(`Upload errors: ${errors.join('; ')}`);
    }
    if (successCount > 0) {
      loadApps();
      loadDocuments(appId);
    }
  };

  const getDownloadUrl = async (path: string): Promise<string | null> => {
    // The documents bucket is public, so getPublicUrl works without RLS.
    const { data: pubData } = supabase.storage.from('documents').getPublicUrl(path);
    if (pubData?.publicUrl) {
      return pubData.publicUrl;
    }

    // Fallback: try createSignedUrl
    try {
      const { data, error } = await supabase.storage.from('documents').createSignedUrl(path, 3600);
      if (error) {
        console.error('[getDownloadUrl] createSignedUrl error:', error.message, '| path:', path);
        return null;
      }
      if (!data?.signedUrl) {
        console.error('[getDownloadUrl] createSignedUrl returned no URL for path:', path);
        return null;
      }
      return data.signedUrl;
    } catch (err: any) {
      console.error('[getDownloadUrl] createSignedUrl exception:', err?.message || err, '| path:', path);
      return null;
    }
  };

  const handleViewDoc = async (path: string) => {
    const url = await getDownloadUrl(path);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Could not generate a view link for this document. Check the browser console for the exact error.');
    }
  };

  const handleDownloadDoc = async (path: string, fileName: string) => {
    const url = await getDownloadUrl(path);
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.target = '_blank';
      a.rel = 'noopener,noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert('Could not generate a download link for this document. Check the browser console for the exact error.');
    }
  };

  const stats = [
    { l: kn ? 'ಒಟ್ಟು ಅರ್ಜಿ' : 'Total', v: apps.length, icon: FileText, bg: 'bg-gov-pale', cl: 'text-gov-main' },
    { l: kn ? 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ' : 'Submitted', v: apps.filter(a => a.status === 'submitted').length, icon: Clock, bg: 'bg-blue-50', cl: 'text-blue-600' },
    { l: kn ? 'ಪ್ರಕ್ರಿಯೆ' : 'Processing', v: apps.filter(a => ['under_review', 'processing', 'documents_pending'].includes(a.status)).length, icon: RefreshCw, bg: 'bg-gold-pale', cl: 'text-gold-dark' },
    { l: kn ? 'ಪೂರ್ಣ' : 'Completed', v: apps.filter(a => a.status === 'completed').length, icon: CheckCircle, bg: 'bg-green-50', cl: 'text-green-600' },
  ];

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-2xl font-bold text-slate-900 ${kn ? 'font-kn' : ''}`}>
              {kn ? `ನಮಸ್ಕಾರ, ${customerSession?.full_name || ''}!` : `Welcome, ${customerSession?.full_name || ''}!`}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
              <Phone className="w-3.5 h-3.5" />
              <span>+91 {customerSession?.phone}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start">
            <button onClick={() => onNavigate('apply')} className="btn-primary">
              <Plus className="w-4 h-4" />
              <span className={kn ? 'font-kn' : ''}>{kn ? 'ಹೊಸ ಅರ್ಜಿ' : 'New Application'}</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className={kn ? 'font-kn' : ''}>{kn ? 'ಲಾಗ್ ಔಟ್' : 'Logout'}</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="card p-5">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.cl}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900">{s.v}</div>
              <div className={`text-xs text-slate-500 mt-0.5 ${kn ? 'font-kn' : ''}`}>{s.l}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Applications */}
          <div className="md:col-span-2 card">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className={`font-bold text-slate-900 ${kn ? 'font-kn' : ''}`}>
                {kn ? 'ನನ್ನ ಅರ್ಜಿಗಳು' : 'My Applications'}
              </h2>
              <select
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-gov-main/50"
                value={filter} onChange={e => setFilter(e.target.value)}
              >
                <option value="all">{kn ? 'ಎಲ್ಲಾ' : 'All'}</option>
                <option value="submitted">{kn ? 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ' : 'Submitted'}</option>
                <option value="documents_pending">{kn ? 'ದಾಖಲೆ ಬಾಕಿ' : 'Docs Pending'}</option>
                <option value="under_review">{kn ? 'ಪರಿಶೀಲನೆ' : 'Under Review'}</option>
                <option value="processing">{kn ? 'ಪ್ರಕ್ರಿಯೆ' : 'Processing'}</option>
                <option value="completed">{kn ? 'ಪೂರ್ಣ' : 'Completed'}</option>
              </select>
            </div>

            {loading ? (
              <div className="p-10 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                <span className={kn ? 'font-kn' : ''}>{kn ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading...'}</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center">
                <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className={`text-slate-500 font-medium mb-4 ${kn ? 'font-kn' : ''}`}>
                  {kn ? 'ಇನ್ನೂ ಯಾವುದೇ ಅರ್ಜಿ ಇಲ್ಲ' : 'No applications yet'}
                </p>
                <button onClick={() => onNavigate('apply')} className="btn-primary text-sm px-4 py-2">
                  <span className={kn ? 'font-kn' : ''}>{kn ? 'ಮೊದಲ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ' : 'Submit First Application'}</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filtered.map(app => {
                  const meta = STATUS_META[app.status as AppStatus];
                  const svc = SERVICE_INFO[app.service_type as ServiceType];
                  const isExpanded = expandedApp === app.id;
                  const needsDocs = app.status === 'documents_pending';
                  const appDocs = documents[app.id] || [];

                  return (
                    <div key={app.id} className={`transition-colors ${needsDocs ? 'bg-amber-50/40' : 'hover:bg-slate-50/50'}`}>
                      {/* Row */}
                      <div
                        className="p-5 cursor-pointer"
                        onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-extrabold text-gov-main text-sm">{app.application_number}</span>
                              <span className={`badge ${meta?.badge || 'badge-submitted'} ${kn ? 'font-kn' : ''}`}>
                                {kn ? meta?.labelKn : meta?.labelEn}
                              </span>
                              {needsDocs && (
                                <span className="badge bg-red-100 text-red-700 animate-pulse">
                                  {kn ? 'ದಾಖಲೆ ಕಳುಹಿಸಿ' : 'Upload Docs'}
                                </span>
                              )}
                            </div>
                            <div className={`font-medium text-slate-800 text-sm ${kn ? 'font-kn' : ''}`}>
                              {svc ? (kn ? svc.labelKn : svc.labelEn) : '—'}
                            </div>
                            {app.gram_panchayat && (
                              <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                <MapPin className="w-3 h-3" />{app.gram_panchayat}, {app.district}
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(app.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={e => { e.stopPropagation(); onNavigate('track'); }}
                              className="flex items-center gap-1 text-xs text-gov-main hover:text-gov-dark font-semibold">
                              <Search className="w-3.5 h-3.5" /><span className={kn ? 'font-kn' : ''}>{kn ? 'ಟ್ರ್ಯಾಕ್' : 'Track'}</span>
                            </button>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded panel */}
                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-slate-100 pt-4 bg-white/60 space-y-4">
                          {/* Admin notes */}
                          {app.admin_notes && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                              <p className={`text-xs font-semibold text-blue-700 mb-1 ${kn ? 'font-kn' : ''}`}>
                                {kn ? 'SK Digital Seva ಸಂದೇಶ:' : 'Message from SK Digital Seva:'}
                              </p>
                              <p className="text-sm text-blue-800">{app.admin_notes}</p>
                            </div>
                          )}

                          {/* Existing Documents */}
                          {appDocs.length > 0 && (
                            <div>
                              <p className={`text-sm font-semibold text-slate-700 mb-2 ${kn ? 'font-kn' : ''}`}>
                                {kn ? 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ದಾಖಲೆಗಳು:' : 'Uploaded Documents:'}
                              </p>
                              <div className="space-y-2">
                                {appDocs.map(doc => (
                                  <div key={doc.id} className="flex items-center justify-between bg-slate-50 px-3 py-2.5 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                      <FileText className="w-4 h-4 text-gov-main" />
                                      <span className="truncate max-w-[180px]">{doc.document_name || doc.file_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleViewDoc(doc.file_path)}
                                        className="text-xs text-gov-main hover:text-gov-dark font-semibold flex items-center gap-1"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        {kn ? 'ವೀಕ್ಷಿಸಿ' : 'View'}
                                      </button>
                                      <button
                                        onClick={() => handleDownloadDoc(doc.file_path, doc.file_name)}
                                        className="text-xs text-slate-500 hover:text-slate-700 font-semibold flex items-center gap-1"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Document upload section */}
                          {(needsDocs || uploadingFor === app.id) && (
                            <div>
                              <p className={`text-sm font-semibold text-slate-700 mb-2 ${kn ? 'font-kn' : ''}`}>
                                {kn ? 'ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ:' : 'Upload Documents:'}
                              </p>
                              <div
                                onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 hover:border-gov-main rounded-xl p-5 text-center cursor-pointer transition-colors group"
                              >
                                <Upload className="w-6 h-6 text-slate-300 group-hover:text-gov-main mx-auto mb-1.5 transition-colors" />
                                <p className={`text-sm text-slate-500 ${kn ? 'font-kn' : ''}`}>
                                  {kn ? 'PDF, JPG, PNG ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಡ್ರಾಪ್ ಮಾಡಿ' : 'Click or drop PDF, JPG, PNG'}
                                </p>
                              </div>
                              <input
                                ref={fileRef}
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={e => {
                                  setUploadFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
                                  setUploadingFor(app.id);
                                }}
                              />
                              {uploadFiles.length > 0 && uploadingFor === app.id && (
                                <div className="mt-3 space-y-1.5">
                                  {uploadFiles.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between bg-gov-pale px-3 py-2 rounded-lg">
                                      <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <FileText className="w-4 h-4 text-gov-main" />
                                        <span className="truncate max-w-[160px]">{f.name}</span>
                                        <span className="text-xs text-slate-400">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                                      </div>
                                      <button onClick={() => setUploadFiles(prev => prev.filter((_, j) => j !== i))}
                                        className="text-slate-400 hover:text-red-500 transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => handleUploadDocs(app.id)}
                                    disabled={uploading}
                                    className="btn-primary w-full mt-2 py-2.5 text-sm"
                                  >
                                    {uploading ? (
                                      <><RefreshCw className="w-4 h-4 animate-spin" /><span className={kn ? 'font-kn' : ''}>{kn ? 'ಅಪ್‌ಲೋಡ್...' : 'Uploading...'}</span></>
                                    ) : (
                                      <><Upload className="w-4 h-4" /><span className={kn ? 'font-kn' : ''}>{kn ? 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Upload Documents'}</span></>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Upload button for any app */}
                          {!needsDocs && uploadingFor !== app.id && (
                            <button
                              onClick={() => setUploadingFor(app.id)}
                              className="flex items-center gap-2 text-sm text-gov-main hover:text-gov-dark font-medium transition-colors"
                            >
                              <Upload className="w-4 h-4" />
                              <span className={kn ? 'font-kn' : ''}>{kn ? 'ಹೆಚ್ಚುವರಿ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್' : 'Upload Additional Documents'}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Profile card */}
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gov-main to-gov-dark rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {(customerSession?.full_name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{customerSession?.full_name || 'Customer'}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" />+91 {customerSession?.phone}
                  </div>
                </div>
              </div>
              <div className={`text-xs bg-gov-pale text-gov-dark px-3 py-2 rounded-lg font-medium text-center ${kn ? 'font-kn' : ''}`}>
                {kn ? 'ಗ್ರಾಹಕ ಖಾತೆ' : 'Customer Account'}
              </div>
            </div>

            {/* Quick apply */}
            <div className="card p-5">
              <h3 className={`font-semibold text-slate-800 mb-3 text-sm ${kn ? 'font-kn' : ''}`}>
                {kn ? 'ತ್ವರಿತ ಅರ್ಜಿ' : 'Quick Apply'}
              </h3>
              <div className="space-y-2">
                {(['gram_thana', 'asti_11b', 'ec_only'] as ServiceType[]).map(key => (
                  <button key={key} onClick={() => onNavigate('apply', key)}
                    className={`w-full text-left flex items-center justify-between px-3 py-2.5 bg-gov-pale hover:bg-gov-main/10 rounded-xl text-sm font-medium text-gov-dark transition-all ${kn ? 'font-kn' : ''}`}>
                    <span>{SERVICE_INFO[key][kn ? 'labelKn' : 'labelEn']}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp */}
            <a href="https://wa.me/916360248020?text=Hello SK Digital Seva" target="_blank" rel="noopener noreferrer"
              className="card p-5 flex items-center gap-3 hover:border-green-300 border-2 border-transparent transition-all">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-green-600"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div>
                <div className={`font-semibold text-slate-800 text-sm ${kn ? 'font-kn' : ''}`}>{kn ? 'WhatsApp ಸಂಪರ್ಕ' : 'WhatsApp Support'}</div>
                <div className="text-xs text-slate-400">6360248020</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
