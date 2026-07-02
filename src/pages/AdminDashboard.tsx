import React, { useState, useEffect } from 'react';
import {
  Shield, FileText, MessageSquare, Star, RefreshCw, CheckCircle,
  Users, TrendingUp, Download, Phone, Mail, LogOut, Eye,
  Search, Filter, ChevronDown, ChevronUp, X, AlertCircle, Calendar, MapPin, FileDown
} from 'lucide-react';
import { supabase, Application, Enquiry, Review, SERVICE_INFO, STATUS_META, AppStatus, ServiceType } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AppDoc {
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

interface AdminDashboardProps { onNavigate: (page: string) => void; }

type Tab = 'overview' | 'applications' | 'enquiries' | 'reviews';

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { adminUser, profile, adminSignOut } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [apps, setApps] = useState<Application[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [appDocs, setAppDocs] = useState<AppDoc[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [showNoteModal, setShowNoteModal] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.role === 'admin') load();
  }, [profile]);

  const load = async () => {
    setLoading(true);
    const [a, e, r] = await Promise.all([
      supabase.from('applications').select('*').order('created_at', { ascending: false }),
      supabase.from('enquiries').select('*').order('created_at', { ascending: false }),
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
    ]);
    setApps(a.data || []);
    setEnquiries(e.data || []);
    setReviews(r.data || []);
    setLoading(false);
  };

  const loadDocs = async (appId: string) => {
    const { data, error } = await supabase
      .from('documents')
      .select('id, document_name, document_type, file_name, file_path, file_url, file_size, mime_type, created_at')
      .eq('application_id', appId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error loading documents:', error.message);
      setAppDocs([]);
      return;
    }
    setAppDocs(data || []);
  };

  const updateAppStatus = async (id: string, status: string, notes?: string) => {
    setUpdating(id);
    await supabase.from('applications').update({
      status,
      ...(notes ? { admin_notes: notes } : {})
    }).eq('id', id);
    await load();
    setUpdating(null);
    setShowNoteModal(null);
    setNoteInput('');
  };

  const getDownloadUrl = async (path: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage.from('documents').createSignedUrl(path, 3600);
      if (error || !data?.signedUrl) {
        console.error('Error creating signed URL:', error?.message);
        return null;
      }
      return data.signedUrl;
    } catch (err) {
      console.error('Error creating signed URL:', err);
      return null;
    }
  };

  const handleViewDoc = async (doc: AppDoc) => {
    const url = await getDownloadUrl(doc.file_path);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Could not generate a view link for this document. Please try again.');
    }
  };

  const handleDownloadDoc = async (doc: AppDoc) => {
    const url = await getDownloadUrl(doc.file_path);
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert('Could not generate a download link for this document. Please try again.');
    }
  };

  if (!adminUser || profile?.role !== 'admin') return (
    <div className="min-h-screen bg-cream pt-20 flex items-center justify-center">
      <div className="text-center card p-8">
        <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <button onClick={() => onNavigate('home')} className="btn-primary">Go Home</button>
      </div>
    </div>
  );

  const stats = [
    { l: 'Total Applications', v: apps.length, icon: FileText, bg: 'bg-gold-pale', cl: 'text-gov-main' },
    { l: 'Pending Review', v: apps.filter(a => ['submitted', 'documents_pending'].includes(a.status)).length, icon: RefreshCw, bg: 'bg-amber-50', cl: 'text-amber-600' },
    { l: 'In Progress', v: apps.filter(a => ['under_review', 'processing'].includes(a.status)).length, icon: TrendingUp, bg: 'bg-blue-50', cl: 'text-blue-600' },
    { l: 'Completed', v: apps.filter(a => a.status === 'completed').length, icon: CheckCircle, bg: 'bg-green-50', cl: 'text-green-600' },
    { l: 'New Enquiries', v: enquiries.filter(e => e.status === 'new').length, icon: MessageSquare, bg: 'bg-purple-50', cl: 'text-purple-600' },
  ];

  const tabs: { id: Tab; l: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { id: 'overview', l: 'Overview', icon: TrendingUp },
    { id: 'applications', l: 'Applications', icon: FileText, count: apps.length },
    { id: 'enquiries', l: 'Enquiries', icon: MessageSquare, count: enquiries.filter(e => e.status === 'new').length },
    { id: 'reviews', l: 'Reviews', icon: Star, count: reviews.filter(r => !r.is_approved).length },
  ];

  const filteredApps = apps.filter(app => {
    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchSearch = !searchQuery ||
      app.application_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant_phone.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gov-main to-gov-dark rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-500">SK Digital Seva Management Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="flex items-center gap-2 text-sm text-slate-500 hover:text-gov-main transition-colors px-3 py-2 rounded-lg hover:bg-white">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh
            </button>
            <button
              onClick={async () => { await adminSignOut(); onNavigate('admin-login'); }}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all border border-slate-200"
            >
              <LogOut className="w-4 h-4" />Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="card p-5">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.cl}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900">{s.v}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-fit overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.id ? 'bg-gov-main text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
              <t.icon className="w-4 h-4" />{t.l}
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 mb-4">Recent Applications</h3>
              {loading ? <div className="py-6 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin mx-auto" /></div> : (
                <div className="space-y-3">
                  {apps.slice(0, 6).map(app => {
                    const meta = STATUS_META[app.status as AppStatus];
                    return (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <div className="font-semibold text-sm text-gov-main">{app.application_number}</div>
                          <div className="text-xs text-slate-500">{app.applicant_name} - {app.district || 'N/A'}</div>
                        </div>
                        <span className={`badge ${meta?.badge}`}>{meta?.labelEn}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 mb-4">Recent Enquiries</h3>
              {loading ? <div className="py-6 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin mx-auto" /></div> : (
                <div className="space-y-3">
                  {enquiries.slice(0, 6).map(enq => (
                    <div key={enq.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-sm text-slate-800">{enq.full_name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" />{enq.phone}</div>
                      </div>
                      <span className={`badge ${enq.status === 'new' ? 'badge-submitted' : enq.status === 'contacted' ? 'badge-processing' : 'badge-completed'}`}>{enq.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Applications tab */}
        {tab === 'applications' && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <h3 className="font-bold text-slate-900">All Applications ({apps.length})</h3>
              <div className="flex-1" />
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by app no, name, phone..."
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gov-main/50 w-full sm:w-64"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="documents_pending">Documents Pending</option>
                <option value="under_review">Under Review</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            {loading ? <div className="p-10 text-center text-slate-400"><RefreshCw className="w-6 h-6 animate-spin mx-auto" /></div> : (
              <div className="divide-y divide-slate-50">
                {filteredApps.map(app => {
                  const meta = STATUS_META[app.status as AppStatus];
                  const svc = SERVICE_INFO[app.service_type as ServiceType];
                  const isExpanded = expandedApp === app.id;

                  return (
                    <div key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <div className="p-4 cursor-pointer" onClick={() => { setExpandedApp(isExpanded ? null : app.id); if (!isExpanded) loadDocs(app.id); }}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-extrabold text-gov-main">{app.application_number}</span>
                              <span className={`badge ${meta?.badge}`}>{meta?.labelEn}</span>
                              {app.status === 'documents_pending' && (
                                <span className="badge bg-red-100 text-red-700 animate-pulse">Action Needed</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                              <span className="font-medium">{app.applicant_name}</span>
                              <span className="flex items-center gap-1 text-xs text-slate-400"><Phone className="w-3 h-3" />{app.applicant_phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                              <span>{svc?.labelEn || '—'}</span>
                              {app.district && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.district}</span>}
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(app.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <select
                              className={`text-xs border rounded-lg px-2 py-1.5 font-semibold focus:outline-none focus:ring-2 focus:ring-gov-main/50 ${meta?.badge}`}
                              value={app.status}
                              onChange={e => { e.stopPropagation(); updateAppStatus(app.id, e.target.value); }}
                              disabled={updating === app.id}
                              onClick={e => e.stopPropagation()}
                            >
                              <option value="submitted">Submitted</option>
                              <option value="documents_pending">Docs Pending</option>
                              <option value="under_review">Under Review</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="rejected">Rejected</option>
                            </select>
                            {updating === app.id ? <RefreshCw className="w-4 h-4 animate-spin text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded view */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-4">
                          {/* App details */}
                          <div className="grid sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-500">Email:</span>
                              <span className="ml-2 text-slate-800">{app.applicant_email || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Taluk:</span>
                              <span className="ml-2 text-slate-800">{app.taluk || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Gram Panchayat:</span>
                              <span className="ml-2 text-slate-800">{app.gram_panchayat || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Village:</span>
                              <span className="ml-2 text-slate-800">{app.village_name || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Survey No:</span>
                              <span className="ml-2 text-slate-800">{app.survey_number || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Khata No:</span>
                              <span className="ml-2 text-slate-800">{app.khata_number || 'N/A'}</span>
                            </div>
                          </div>

                          {app.remarks && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <span className="text-sm text-blue-700 font-medium">Customer Remarks: </span>
                              <span className="text-sm text-blue-600">{app.remarks}</span>
                            </div>
                          )}

                          {app.admin_notes && (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <span className="text-sm text-green-700 font-medium">Admin Notes: </span>
                              <span className="text-sm text-green-600">{app.admin_notes}</span>
                            </div>
                          )}

                          {/* Documents */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-slate-700 text-sm">Documents ({appDocs.length})</h4>
                              {appDocs.length > 0 && (
                                <button
                                  onClick={async () => {
                                    for (const doc of appDocs) {
                                      await handleDownloadDoc(doc);
                                    }
                                  }}
                                  className="text-xs text-gov-main hover:text-gov-dark font-semibold flex items-center gap-1"
                                >
                                  <FileDown className="w-3.5 h-3.5" />Download All
                                </button>
                              )}
                            </div>
                            {appDocs.length === 0 ? (
                              <p className="text-xs text-slate-400 bg-white p-3 rounded-lg border border-dashed border-slate-200">No documents uploaded yet</p>
                            ) : (
                              <div className="space-y-2">
                                {appDocs.map(doc => (
                                  <div key={doc.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                      <FileText className="w-4 h-4 text-gov-main" />
                                      <div>
                                        <div className="font-medium">{doc.document_name || doc.file_name}</div>
                                        <div className="text-xs text-slate-400">{doc.document_type} - {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ''}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleViewDoc(doc)}
                                        className="text-xs text-gov-main hover:text-gov-dark font-semibold flex items-center gap-1"
                                      >
                                        <Eye className="w-3.5 h-3.5" />View
                                      </button>
                                      <button
                                        onClick={() => handleDownloadDoc(doc)}
                                        className="text-xs text-slate-500 hover:text-slate-700 font-semibold flex items-center gap-1"
                                      >
                                        <Download className="w-3.5 h-3.5" />DL
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Note button */}
                          <button
                            onClick={() => { setShowNoteModal(app.id); setNoteInput(app.admin_notes || ''); }}
                            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />Add/Update Note
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Enquiries tab */}
        {tab === 'enquiries' && (
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Enquiries ({enquiries.length})</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {enquiries.map(enq => (
                <div key={enq.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-slate-900">{enq.full_name}</span>
                        <span className={`badge ${enq.status === 'new' ? 'badge-submitted' : enq.status === 'contacted' ? 'badge-processing' : 'badge-completed'}`}>{enq.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-2">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{enq.phone}</span>
                        {enq.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{enq.email}</span>}
                      </div>
                      <p className="text-sm text-slate-700">{enq.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(enq.created_at).toLocaleDateString()}</p>
                    </div>
                    <select
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none shrink-0"
                      value={enq.status}
                      onChange={async e => { await supabase.from('enquiries').update({ status: e.target.value }).eq('id', enq.id); await load(); }}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews tab */}
        {tab === 'reviews' && (
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Reviews ({reviews.length})</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {reviews.map(rev => (
                <div key={rev.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-slate-900">{rev.full_name}</span>
                        {rev.location && <span className="text-slate-400 text-sm">{rev.location}</span>}
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        {rev.is_approved && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                      <p className="text-sm text-slate-700">{rev.review_text}</p>
                    </div>
                    <button
                      onClick={async () => { await supabase.from('reviews').update({ is_approved: !rev.is_approved }).eq('id', rev.id); await load(); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${rev.is_approved ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {rev.is_approved ? 'Approved' : 'Approve'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowNoteModal(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Add Note</h3>
              <button onClick={() => setShowNoteModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <textarea
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gov-main/50 resize-none"
              rows={4}
              placeholder="Enter a note for the customer..."
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowNoteModal(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all">Cancel</button>
              <button onClick={() => updateAppStatus(showNoteModal, apps.find(a => a.id === showNoteModal)?.status || 'submitted', noteInput)} className="flex-1 py-2.5 bg-gov-main hover:bg-gov-dark text-white rounded-xl text-sm font-medium transition-all">Save Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
